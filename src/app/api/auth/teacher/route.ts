import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, schoolName, schoolCode, schoolRegion, roleGrade } = body;

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ success: true, mode: "LOCAL_FALLBACK" });
    }

    // 1. schools 테이블에 학교 정보 조회 또는 신규 등록
    let schoolId: string | null = null;
    const { data: existingSchool } = await supabase
      .from("schools")
      .select("id")
      .eq("school_code", schoolCode)
      .maybeSingle();

    if (existingSchool) {
      schoolId = existingSchool.id;
    } else {
      const { data: newSchool, error: schoolErr } = await supabase
        .from("schools")
        .insert({
          school_code: schoolCode,
          school_name: schoolName,
          region: schoolRegion,
        })
        .select("id")
        .single();

      if (!schoolErr && newSchool) {
        schoolId = newSchool.id;
      }
    }

    // 2. teachers 테이블에 교사 정보 저장
    if (schoolId) {
      await supabase.from("teachers").upsert(
        {
          school_id: schoolId,
          email,
          name,
          role_grade: roleGrade,
        },
        { onConflict: "email" }
      );
    }

    return NextResponse.json({ success: true, schoolId });
  } catch (err: any) {
    console.error("Teacher auth sync error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
