import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadBase64ToR2 } from "@/lib/r2";
import { sanitizeText, validateImageBase64 } from "@/lib/security";
import {
  getStoredSubmissions,
  saveSubmission,
  updateSubmissionStatus,
} from "@/lib/serverDataStore";

export const dynamic = "force-dynamic";

/**
 * 작품 목록 조회 API (GET)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exhibitionId = searchParams.get("exhibitionId");
    const schoolCode = searchParams.get("schoolCode");
    const publicOnly = searchParams.get("publicOnly") === "true";

    // 1. 파일 영구 스토어에서 전체 출품작 로드
    const storedList = getStoredSubmissions();

    let filtered = storedList;
    if (publicOnly) {
      filtered = filtered.filter((s) => s.is_public_shared === true);
    } else if (exhibitionId) {
      filtered = filtered.filter((s) => s.challengeId === exhibitionId);
    }
    if (schoolCode) {
      filtered = filtered.filter((s) => !s.schoolCode || s.schoolCode === schoolCode);
    }

    // 2. Supabase가 연결되어 있는 경우 추가 동기화
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
        } else if (exhibitionId) {
          query = query.eq("exhibition_id", exhibitionId);
        }

        const { data } = await query;
        if (data && Array.isArray(data)) {
          const dbFormatted = data.map((row: any) => {
            const student = row.student_profiles;
            return {
              id: row.id,
              challengeId: row.exhibition_id || exhibitionId || "",
              studentGrade: student?.grade || 1,
              studentClass: student?.class_num || 1,
              studentNumber: student?.student_num || 1,
              nickname: student?.nickname || "익명 작가",
              title: row.title,
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
              is_public_shared: row.is_public_shared,
            };
          });

          // 중복 병합
          const existingIds = new Set(filtered.map((s) => s.id));
          dbFormatted.forEach((d) => {
            if (!existingIds.has(d.id)) {
              filtered.push(d);
            }
          });
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
 * 작품 출품 API (POST) - 파일 영구 스토어 + Cloudflare R2 + Supabase DB
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
    const newSubmission = {
      id: subId,
      challengeId: realExhibitionId,
      schoolCode,
      schoolName,
      studentGrade: Number(studentGrade) || 1,
      studentClass: Number(studentClass) || 1,
      studentNumber: Number(studentNumber) || 1,
      nickname: studentNickname || "새싹 작가",
      title: cleanTitle,
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

    // 3. 파일 영구 스토어에 즉시 저장 (.data/submissions.json)
    // 1인 1작품 원칙: 동일 사진전에서 같은 학년/반/번호의 기존 작품이 있으면 교체
    const storedList = getStoredSubmissions();
    const existingIdx = storedList.findIndex(
      (s) =>
        s.challengeId === realExhibitionId &&
        Number(s.studentGrade) === Number(newSubmission.studentGrade) &&
        Number(s.studentClass) === Number(newSubmission.studentClass) &&
        Number(s.studentNumber) === Number(newSubmission.studentNumber)
    );

    if (existingIdx >= 0) {
      newSubmission.id = storedList[existingIdx].id;
      newSubmission.votes = storedList[existingIdx].votes || 0;
      newSubmission.studentVotes = storedList[existingIdx].studentVotes || 0;
      newSubmission.teacherVotes = storedList[existingIdx].teacherVotes || 0;
      newSubmission.parentVotes = storedList[existingIdx].parentVotes || 0;
    }

    saveSubmission(newSubmission);

    // 4. Supabase DB 연결되어 있을 경우 동기화
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

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(realExhibitionId);

        await supabase.from("submissions").insert({
          exhibition_id: isUuid ? realExhibitionId : null,
          student_id: studentId,
          title: cleanTitle,
          artist_note: cleanNote,
          image_url: finalImageUrl,
          selected_frame: selectedFrame || "기본 프레임",
          student_consent: studentConsent,
          vote_count: 0,
        });
      } catch (dbErr) {
        console.warn("Supabase submission sync warning:", dbErr);
      }
    }

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
    if (supabase) {
      try {
        await supabase.from("submissions").update(updates).eq("id", id);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, id, is_public_shared });
  } catch (err: any) {
    console.error("Submissions PATCH error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
