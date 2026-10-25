import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadBase64ToR2 } from "@/lib/r2";
import { sanitizeText, validateImageBase64 } from "@/lib/security";

export const dynamic = "force-dynamic";

// 서버 인메모리 스토어 (챌린지 ID 단위 격리 보존)
const localSubmissionsStore: any[] = [];

/**
 * 작품 목록 조회 API (GET)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exhibitionId = searchParams.get("exhibitionId");
    const schoolCode = searchParams.get("schoolCode");

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      // 로컬 스토어에서 특정 사진전 작품만 필터링하여 반환
      const filtered = exhibitionId
        ? localSubmissionsStore.filter((s) => s.challengeId === exhibitionId)
        : localSubmissionsStore;
      return NextResponse.json({ success: true, submissions: filtered, source: "LOCAL_STORE" });
    }

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

    // 특정 전시회 필터링 (길이 제약 없이 정확한 매칭)
    if (exhibitionId) {
      query = query.eq("exhibition_id", exhibitionId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Submissions DB fetch warning, fallback to local store:", error.message);
      const filtered = exhibitionId
        ? localSubmissionsStore.filter((s) => s.challengeId === exhibitionId)
        : localSubmissionsStore;
      return NextResponse.json({ success: true, submissions: filtered, source: "LOCAL_FALLBACK" });
    }

    // 클라이언트 UI 포맷으로 매핑
    const formatted = (data || []).map((row: any) => {
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
        submittedAt: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
        selectedFrame: row.selected_frame,
        specialAwardTitle: row.special_award_title,
        specialAwardReason: row.special_award_reason,
        is_public_shared: row.is_public_shared,
      };
    });

    // 로컬 스토어에 등록된 해당 사진전 출품작도 병합 (중복 제외)
    const localMatches = exhibitionId
      ? localSubmissionsStore.filter((s) => s.challengeId === exhibitionId)
      : localSubmissionsStore;
    const dbIds = new Set(formatted.map((f: any) => f.id));
    const combined = [...formatted, ...localMatches.filter((s) => !dbIds.has(s.id))];

    return NextResponse.json({
      success: true,
      submissions: combined,
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
 * 작품 출품 API (POST) - Cloudflare R2 업로드 + Supabase DB 영구 저장
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
      schoolName,
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

    // 1. Cloudflare R2에 이미지 업로드
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

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      // Supabase 미연결 시 로컬 메모리 응답 (안전망)
      return NextResponse.json({
        success: true,
        source: "LOCAL_FALLBACK",
        submission: {
          id: `local-${Date.now()}`,
          studentGrade: Number(studentGrade) || 1,
          studentClass: Number(studentClass) || 1,
          studentNumber: Number(studentNumber) || 1,
          nickname: studentNickname || "새싹 작가",
          title,
          artistNote: artistNote || "",
          imageUrl: finalImageUrl,
          votes: 0,
          submittedAt: new Date().toISOString().split("T")[0],
          selectedFrame,
        },
      });
    }

    // 2. 학교 확인 또는 등록
    let schoolId: string | null = null;
    const { data: schoolData } = await supabase
      .from("schools")
      .select("id")
      .eq("school_code", schoolCode)
      .maybeSingle();

    if (schoolData) {
      schoolId = schoolData.id;
    } else {
      // 학교가 아직 등록되지 않은 경우 생성
      const { data: newSchool } = await supabase
        .from("schools")
        .insert({
          school_code: schoolCode,
          school_name: schoolName || "우리 학교",
          region: "전남",
        })
        .select("id")
        .single();
      if (newSchool) schoolId = newSchool.id;
    }

    // 3. 학생 프로필 확인 또는 등록
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
        if (studentPin) {
          await supabase
            .from("student_profiles")
            .update({ pin_code_hash: String(studentPin).trim().slice(0, 4) })
            .eq("id", studentId);
        }
      } else {
        const { data: newStudent } = await supabase
          .from("student_profiles")
          .insert({
            school_id: schoolId,
            grade: Number(studentGrade) || 1,
            class_num: Number(studentClass) || 1,
            student_num: Number(studentNumber) || 1,
            nickname: studentNickname || "새싹 작가",
            pin_code_hash: String(studentPin || "1234").trim().slice(0, 4),
          })
          .select("id")
          .single();
        if (newStudent) studentId = newStudent.id;
      }
    }

    // 4. 전시회(exhibition) ID 확정 (길이 제약 없이 전달받은 challengeId 그대로 보존)
    const realExhibitionId: string = challengeId || "challenge-1";

    const localNewSubmission = {
      id: `sub-${Date.now()}`,
      challengeId: realExhibitionId,
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
      selectedFrame,
      student_consent: studentConsent,
      parent_consent: false,
      teacher_approval: false,
      is_public_shared: false,
    };

    // 서버 로컬 스토어에 우선 등록 (즉시 격리 보장)
    localSubmissionsStore.unshift(localNewSubmission);

    if (!supabase) {
      return NextResponse.json({
        success: true,
        source: "LOCAL_STORE",
        submission: localNewSubmission,
      });
    }

    // 5. submissions 테이블에 INSERT 시도
    // UUID 형식 검사 (DB exhibition_id가 uuid 타입인 경우 호환 처리)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(realExhibitionId);

    const { data: inserted, error: insertError } = await supabase
      .from("submissions")
      .insert({
        exhibition_id: isUuid ? realExhibitionId : null,
        student_id: studentId,
        title: cleanTitle,
        artist_note: cleanNote,
        image_url: finalImageUrl,
        selected_frame: selectedFrame || "기본 프레임",
        student_consent: studentConsent,
        vote_count: 0,
        student_votes: 0,
        teacher_votes: 0,
        parent_votes: 0,
      })
      .select("*")
      .single();

    if (insertError) {
      console.warn("Supabase submission insert warning, using local store:", insertError.message);
      return NextResponse.json({
        success: true,
        source: "LOCAL_STORE",
        submission: localNewSubmission,
      });
    }

    return NextResponse.json({
      success: true,
      source: "SUPABASE_AND_R2",
      submission: {
        id: inserted.id,
        challengeId: realExhibitionId,
        studentGrade: Number(studentGrade) || 1,
        studentClass: Number(studentClass) || 1,
        studentNumber: Number(studentNumber) || 1,
        nickname: studentNickname || "새싹 작가",
        title: inserted.title,
        artistNote: inserted.artist_note,
        imageUrl: inserted.image_url,
        votes: inserted.vote_count || 0,
        studentVotes: inserted.student_votes || 0,
        teacherVotes: inserted.teacher_votes || 0,
        parentVotes: inserted.parent_votes || 0,
        submittedAt: inserted.created_at ? inserted.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
        selectedFrame: inserted.selected_frame,
      },
    });
  } catch (err: any) {
    console.error("Submission POST fatal error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "작품 출품 처리 실패" },
      { status: 500 }
    );
  }
}
