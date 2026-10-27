import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadBase64ToR2 } from "@/lib/r2";
import { sanitizeText, validateImageBase64 } from "@/lib/security";
import {
  getStoredSubmissions,
  saveSubmission,
  updateSubmissionStatus,
  deleteSubmissionById,
  deleteSubmissionsByChallengeId,
} from "@/lib/serverDataStore";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 작품 목록 조회 API (GET)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exhibitionId = searchParams.get("exhibitionId");
    const schoolCode = searchParams.get("schoolCode");
    const publicOnly = searchParams.get("publicOnly") === "true";

    // 1. 파일/메모리 스토어에서 출품작 로드
    const storedList = getStoredSubmissions();

    let filtered = [...storedList];
    if (publicOnly) {
      filtered = filtered.filter((s) => s.is_public_shared === true);
    } else if (exhibitionId) {
      filtered = filtered.filter((s) => s.challengeId === exhibitionId);
    } else if (schoolCode) {
      filtered = filtered.filter(
        (s) => !s.schoolCode || s.schoolCode === "JNE-3012" || s.schoolCode === schoolCode
      );
    }

    // 2. Supabase DB에서 실시간 출품작 조회 및 동기화
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        let query = supabase
          .from("submissions")
          .select(`
            id,
            exhibition_id,
            title,
            artist_note,
            image_url,
            thumbnail_url,
            selected_frame,
            vote_count,
            student_votes,
            teacher_votes,
            parent_votes,
            special_award_title,
            special_award_reason,
            student_consent,
            parent_consent,
            teacher_approval,
            is_public_shared,
            created_at,
            student_profiles (
              id,
              grade,
              class_num,
              student_num,
              nickname
            )
          `)
          .order("created_at", { ascending: false });

        if (publicOnly) {
          query = query.eq("is_public_shared", true);
        } else if (exhibitionId && UUID_REGEX.test(exhibitionId)) {
          query = query.eq("exhibition_id", exhibitionId);
        }

        const { data, error } = await query;
        if (error) {
          console.warn("Supabase submissions query error:", error.message);
        } else if (data && Array.isArray(data)) {
          const dbFormatted: any[] = [];

          for (const row of data) {
            const student: any = Array.isArray(row.student_profiles)
              ? row.student_profiles[0]
              : row.student_profiles;

            // thumbnail_url에 저장된 메타데이터(challengeId, schoolCode, schoolName) 파싱
            let meta: { challengeId?: string; schoolCode?: string; schoolName?: string } = {};
            if (typeof row.thumbnail_url === "string" && row.thumbnail_url.startsWith("{")) {
              try {
                meta = JSON.parse(row.thumbnail_url);
              } catch {}
            }

            const rowChallengeId = meta.challengeId || row.exhibition_id || "";

            // 특정 사진전(exhibitionId) 요청인 경우 해당 사진전과 일치하는 작품만 엄격히 필터링
            if (!publicOnly && exhibitionId) {
              if (rowChallengeId !== exhibitionId) {
                continue;
              }
            }

            dbFormatted.push({
              id: row.id,
              challengeId: rowChallengeId || exhibitionId || "",
              schoolCode: meta.schoolCode || schoolCode || "JNE-3012",
              schoolName: meta.schoolName || "우리 학교",
              studentGrade: student?.grade || 1,
              studentClass: student?.class_num || 1,
              studentNumber: student?.student_num || 1,
              nickname: student?.nickname || "익명 작가",
              title: row.title,
              caption: row.artist_note || undefined,
              artistNote: row.artist_note || "",
              imageUrl: row.image_url,
              votes: row.vote_count || 0,
              studentVotes: row.student_votes || 0,
              teacherVotes: row.teacher_votes || 0,
              parentVotes: row.parent_votes || 0,
              submittedAt: row.created_at
                ? row.created_at.split("T")[0]
                : new Date().toISOString().split("T")[0],
              selectedFrame: row.selected_frame,
              specialAwardTitle: row.special_award_title,
              specialAwardReason: row.special_award_reason,
              student_consent: row.student_consent ?? false,
              parent_consent: row.parent_consent ?? false,
              teacher_approval: row.teacher_approval ?? false,
              is_public_shared: row.is_public_shared ?? false,
            });
          }

          // DB 결과와 로컬 스토어 병합 (DB 우선)
          const dbIds = new Set(dbFormatted.map((d) => d.id));
          const merged = [
            ...dbFormatted,
            ...filtered.filter((localItem) => !dbIds.has(localItem.id)),
          ];
          filtered = merged;
        }
      } catch (dbErr) {
        console.warn("Supabase fetch warning, using file store:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      submissions: filtered,
    });
  } catch (err: any) {
    console.error("Submissions GET error:", err);
    return NextResponse.json(
      { success: false, submissions: [], message: err.message },
      { status: 500 }
    );
  }
}

/**
 * 작품 출품 API (POST) - Cloudflare R2 + Supabase DB + 파일/메모리 스토어
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      challengeId,
      title,
      artistNote,
      imageBase64,
      selectedFrame,
      studentGrade,
      studentClass,
      studentNumber,
      studentNickname,
      studentPin,
      schoolCode = "JNE-3012",
      schoolName = "우리 학교",
      studentConsent = false,
    } = body;

    const cleanTitle = sanitizeText(title);
    const cleanNote = sanitizeText(artistNote || "");

    if (!imageBase64 || !cleanTitle) {
      return NextResponse.json(
        { success: false, message: "작품 사진과 제목은 필수 항목입니다." },
        { status: 400 }
      );
    }

    const validation = validateImageBase64(imageBase64);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    // 1. Cloudflare R2에 이미지 업로드 시도 (실패 시 dataUrl 유지)
    let finalImageUrl = imageBase64;
    try {
      const safeFilename = `submissions/${Date.now()}_grade${studentGrade || 1}_${studentNumber || 1}.jpg`;
      const uploadedUrl = await uploadBase64ToR2({
        base64Data: imageBase64,
        filename: safeFilename,
        contentType: "image/jpeg",
      });

      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    } catch (uploadErr) {
      console.warn("R2 upload warning, falling back to data URL:", uploadErr);
    }

    const realExhibitionId: string = challengeId || "challenge-1";
    const subId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // 2. 통합 출품작 객체 생성
    const newSubmission: any = {
      id: subId,
      challengeId: realExhibitionId,
      schoolCode,
      schoolName,
      studentGrade: Number(studentGrade) || 1,
      studentClass: Number(studentClass) || 1,
      studentNumber: Number(studentNumber) || 1,
      nickname: studentNickname || "새싹 작가",
      title: cleanTitle,
      caption: cleanNote || undefined,
      artistNote: cleanNote,
      imageUrl: finalImageUrl,
      votes: 0,
      studentVotes: 0,
      teacherVotes: 0,
      parentVotes: 0,
      submittedAt: new Date().toISOString().split("T")[0],
      selectedFrame: selectedFrame || "기본 프레임",
      student_consent: studentConsent,
      parent_consent: false,
      teacher_approval: false,
      is_public_shared: false,
    };

    // 3. Supabase DB 연결되어 있을 경우 영구 저장
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        let schoolId: string | null = null;
        const { data: schoolData } = await supabase
          .from("schools")
          .select("id")
          .eq("school_code", schoolCode)
          .maybeSingle();

        if (schoolData) {
          schoolId = schoolData.id;
        } else {
          const { data: newSchool } = await supabase
            .from("schools")
            .insert({
              school_code: schoolCode,
              school_name: schoolName,
              region: "전국",
            })
            .select("id")
            .single();
          if (newSchool) schoolId = newSchool.id;
        }

        let studentId: string | null = null;
        if (schoolId) {
          const { data: studentData } = await supabase
            .from("student_profiles")
            .select("id")
            .eq("school_id", schoolId)
            .eq("grade", Number(studentGrade) || 1)
            .eq("class_num", Number(studentClass) || 1)
            .eq("student_num", Number(studentNumber) || 1)
            .maybeSingle();

          if (studentData) {
            studentId = studentData.id;
            await supabase
              .from("student_profiles")
              .update({
                nickname: studentNickname || "새싹 작가",
                ...(studentPin ? { pin_code_hash: String(studentPin).trim().slice(0, 4) } : {}),
              })
              .eq("id", studentId);
          } else {
            const { data: newStudent } = await supabase
              .from("student_profiles")
              .insert({
                school_id: schoolId,
                grade: Number(studentGrade) || 1,
                class_num: Number(studentClass) || 1,
                student_num: Number(studentNumber) || 1,
                nickname: studentNickname || "새싹 작가",
                pin_code_hash: String(studentPin || "0000").trim().slice(0, 4),
              })
              .select("id")
              .single();
            if (newStudent) studentId = newStudent.id;
          }
        }

        // exhibitions 테이블에서 UUID 조회
        let resolvedExhibitionUuid: string | null = null;
        if (UUID_REGEX.test(realExhibitionId)) {
          resolvedExhibitionUuid = realExhibitionId;
        } else {
          const { data: exData } = await supabase
            .from("exhibitions")
            .select("id")
            .eq("theme_id", realExhibitionId)
            .maybeSingle();
          if (exData?.id) {
            resolvedExhibitionUuid = exData.id;
          }
        }

        // 1인 1작품 유지: 해당 학생이 동일 사진전에 이미 출품한 기존 작품이 있으면 삭제 후 재등록
        if (studentId) {
          const { data: prevSubs } = await supabase
            .from("submissions")
            .select("id, exhibition_id, thumbnail_url")
            .eq("student_id", studentId);

          if (prevSubs && prevSubs.length > 0) {
            const idsToDelete: string[] = [];
            for (const p of prevSubs) {
              let pMeta: any = {};
              if (typeof p.thumbnail_url === "string" && p.thumbnail_url.startsWith("{")) {
                try {
                  pMeta = JSON.parse(p.thumbnail_url);
                } catch {}
              }
              const pCid = pMeta.challengeId || p.exhibition_id || "";
              if (pCid === realExhibitionId || !pCid) {
                idsToDelete.push(p.id);
              }
            }
            if (idsToDelete.length > 0) {
              await supabase.from("submissions").delete().in("id", idsToDelete);
            }
          }
        }

        const metaJson = JSON.stringify({
          challengeId: realExhibitionId,
          schoolCode,
          schoolName,
        });

        const { data: inserted, error: insertError } = await supabase
          .from("submissions")
          .insert({
            exhibition_id: resolvedExhibitionUuid,
            student_id: studentId,
            title: cleanTitle,
            artist_note: cleanNote,
            image_url: finalImageUrl,
            thumbnail_url: metaJson,
            selected_frame: selectedFrame || "기본 프레임",
            student_consent: studentConsent,
            vote_count: 0,
            student_votes: 0,
            teacher_votes: 0,
            parent_votes: 0,
          })
          .select("*")
          .single();

        if (!insertError && inserted) {
          newSubmission.id = inserted.id;
        } else if (insertError) {
          console.warn("Supabase submission insert warning:", insertError.message);
        }
      } catch (dbErr) {
        console.warn("Supabase submission sync warning:", dbErr);
      }
    }

    // 4. 파일/메모리 스토어에도 저장
    const storedList = getStoredSubmissions();
    const existingIdx = storedList.findIndex(
      (s) =>
        s.challengeId === realExhibitionId &&
        Number(s.studentGrade) === Number(newSubmission.studentGrade) &&
        Number(s.studentClass) === Number(newSubmission.studentClass) &&
        Number(s.studentNumber) === Number(newSubmission.studentNumber)
    );

    if (existingIdx >= 0) {
      deleteSubmissionById(storedList[existingIdx].id);
    }

    saveSubmission(newSubmission);

    return NextResponse.json({
      success: true,
      submission: newSubmission,
    });
  } catch (err: any) {
    console.error("Submission POST fatal error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "작품 출품 처리 실패" },
      { status: 500 }
    );
  }
}

/**
 * 작품 상태 변경 API (PATCH)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_public_shared, teacher_approval, special_award_title, special_award_reason } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: "작품 ID가 필요합니다." }, { status: 400 });
    }

    const updates: any = {};
    if (typeof is_public_shared === "boolean") updates.is_public_shared = is_public_shared;
    if (typeof teacher_approval === "boolean") updates.teacher_approval = teacher_approval;
    if (special_award_title !== undefined) updates.specialAwardTitle = special_award_title;
    if (special_award_reason !== undefined) updates.specialAwardReason = special_award_reason;

    updateSubmissionStatus(id, updates);

    const supabase = getSupabaseServerClient();
    if (supabase && UUID_REGEX.test(id)) {
      try {
        const dbUpdates: any = {};
        if (typeof is_public_shared === "boolean") dbUpdates.is_public_shared = is_public_shared;
        if (typeof teacher_approval === "boolean") dbUpdates.teacher_approval = teacher_approval;
        if (special_award_title !== undefined) dbUpdates.special_award_title = special_award_title;
        if (special_award_reason !== undefined) dbUpdates.special_award_reason = special_award_reason;
        await supabase.from("submissions").update(dbUpdates).eq("id", id);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, id, is_public_shared });
  } catch (err: any) {
    console.error("Submissions PATCH error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/**
 * 출품작 삭제 API (DELETE) - 개별 작품 삭제(id) 또는 특정 사진전 전체 출품작 초기화(exhibitionId)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const exhibitionId = searchParams.get("exhibitionId");

    const supabase = getSupabaseServerClient();

    // 1. 개별 작품 삭제
    if (id) {
      deleteSubmissionById(id);
      if (supabase && UUID_REGEX.test(id)) {
        await supabase.from("submissions").delete().eq("id", id);
      }
      return NextResponse.json({ success: true, deletedId: id });
    }

    // 2. 특정 사진전(exhibitionId)의 모든 출품작 초기화
    if (exhibitionId) {
      deleteSubmissionsByChallengeId(exhibitionId);

      if (supabase) {
        try {
          if (UUID_REGEX.test(exhibitionId)) {
            await supabase.from("submissions").delete().eq("exhibition_id", exhibitionId);
          }

          // thumbnail_url 메타데이터가 해당 exhibitionId이거나 exhibition_id가 null인 잔여 데이터 일괄 삭제
          const { data: allSubs } = await supabase
            .from("submissions")
            .select("id, exhibition_id, thumbnail_url");

          if (allSubs && allSubs.length > 0) {
            const targetIds: string[] = [];
            for (const row of allSubs) {
              let meta: any = {};
              if (typeof row.thumbnail_url === "string" && row.thumbnail_url.startsWith("{")) {
                try {
                  meta = JSON.parse(row.thumbnail_url);
                } catch {}
              }
              const rowCid = meta.challengeId || row.exhibition_id || "";
              if (rowCid === exhibitionId || !rowCid) {
                targetIds.push(row.id);
              }
            }
            if (targetIds.length > 0) {
              await supabase.from("submissions").delete().in("id", targetIds);
            }
          }
        } catch (dbErr) {
          console.warn("Supabase submissions purge warning:", dbErr);
        }
      }

      return NextResponse.json({ success: true, purgedExhibitionId: exhibitionId });
    }

    return NextResponse.json({ success: false, message: "id 또는 exhibitionId가 필요합니다." }, { status: 400 });
  } catch (err: any) {
    console.error("Submissions DELETE error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
