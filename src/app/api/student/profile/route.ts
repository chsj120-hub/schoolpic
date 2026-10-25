import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schoolCode, grade, classNum, studentNum, pin, nickname } = body;

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ success: true, mode: "LOCAL_FALLBACK" });
    }

    // 1. 학교 조회 (없으면 기본 등록)
    let schoolId: string | null = null;
    const { data: school } = await supabase
      .from("schools")
      .select("id")
      .eq("school_code", schoolCode)
      .maybeSingle();

    if (school) {
      schoolId = school.id;
    } else {
      const { data: newSchool } = await supabase
        .from("schools")
        .insert({
          school_code: schoolCode,
          school_name: "등록 학교",
          region: "전국",
        })
        .select("id")
        .single();
      if (newSchool) schoolId = newSchool.id;
    }

    if (!schoolId) {
      return NextResponse.json({ success: false, message: "학교 정보를 찾을 수 없습니다." }, { status: 400 });
    }

    // 2. 학생 프로필 조회 (PIN 일치 여부 확인)
    const { data: existingStudent } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("school_id", schoolId)
      .eq("grade", Number(grade))
      .eq("class_num", Number(classNum))
      .eq("student_num", Number(studentNum))
      .maybeSingle();

    if (existingStudent) {
      // 재접속: PIN 확인
      if (existingStudent.pin_code_hash !== pin) {
        return NextResponse.json({
          success: false,
          isPinMismatch: true,
          message: "PIN 비밀번호가 일치하지 않습니다. 기억나지 않으시면 선생님께 초기화를 요청하세요!",
        }, { status: 401 });
      }

      // 닉네임 업데이트
      await supabase
        .from("student_profiles")
        .update({ nickname })
        .eq("id", existingStudent.id);

      return NextResponse.json({
        success: true,
        student: existingStudent,
        isExisting: true,
      });
    }

    // 3. 신규 학생 프로필 등록
    const { data: createdStudent, error: createErr } = await supabase
      .from("student_profiles")
      .insert({
        school_id: schoolId,
        grade: Number(grade),
        class_num: Number(classNum),
        student_num: Number(studentNum),
        pin_code_hash: pin,
        nickname,
      })
      .select("*")
      .single();

    if (createErr) {
      console.warn("Student profile create error:", createErr);
    }

    return NextResponse.json({
      success: true,
      student: createdStudent,
      isExisting: false,
    });
  } catch (err: any) {
    console.error("Student profile API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
