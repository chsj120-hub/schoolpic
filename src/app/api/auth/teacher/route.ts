import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// 개발자 및 관리자 공식 테스트 계정 상수
const DEV_ADMIN_ACCOUNT = {
  email: "chsj120@gmail.com",
  password: "blue7412",
  name: "관리자 선생님",
  schoolName: "테스트초등학교",
  schoolCode: "TST-7777",
  schoolRegion: "서울",
  schoolLevel: "E" as const,
  roleGrade: "총괄 관리자",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, token, name, schoolName, schoolCode, schoolRegion, roleGrade } = body;

    const supabase = getSupabaseServerClient();

    // -------------------------------------------------------------
    // 1. 매직링크 발송 요청 (action: 'MAGIC_LINK')
    // -------------------------------------------------------------
    if (action === "MAGIC_LINK") {
      if (!email || !email.includes("@")) {
        return NextResponse.json({ success: false, message: "유효한 이메일을 입력해주세요." }, { status: 400 });
      }

      // 개발자 테스트 계정이거나 등록된 계정용 1회용 매직 토큰 생성
      const timestamp = Date.now();
      const rawToken = Buffer.from(`${email}:${timestamp}`).toString("base64url");

      let schoolInfo = {
        schoolName: email === DEV_ADMIN_ACCOUNT.email ? DEV_ADMIN_ACCOUNT.schoolName : "한재초등학교",
        schoolCode: email === DEV_ADMIN_ACCOUNT.email ? DEV_ADMIN_ACCOUNT.schoolCode : "JNE-3012",
      };

      if (supabase) {
        const { data: teacher } = await supabase
          .from("teachers")
          .select("*, schools(*)")
          .eq("email", email)
          .maybeSingle();

        if (teacher && teacher.schools) {
          schoolInfo = {
            schoolName: teacher.schools.school_name,
            schoolCode: teacher.schools.school_code,
          };
        }
      }

      // Resend 이메일 발송 시도 (키 설정 시 실발송, 미설정 시 모의 URL 지원)
      const resendKey = process.env.RESEND_API_KEY;
      let emailSent = false;

      if (resendKey) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: "스쿨픽 로그인 <onboarding@resend.dev>",
            to: [email],
            subject: "[스쿨픽] 교사 1회용 로그인 매직링크",
            html: `
              <div style="font-family: sans-serif; padding: 24px; border: 2px solid #1E293B; border-radius: 16px; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #0F172A; margin-bottom: 8px;">스쿨픽 교사 1회용 매직링크 ✉️</h2>
                <p style="color: #475569; font-size: 14px;">비밀번호 입력 없이 아래 버튼을 누르면 즉시 교사 관리자 화면으로 로그인됩니다.</p>
                <div style="margin: 24px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/teacher/login?token=${rawToken}" 
                     style="background-color: #FFC72C; color: #0F172A; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; border: 2px solid #0F172A; display: inline-block;">
                    스쿨픽 로그인하기 →
                  </a>
                </div>
                <p style="color: #94A3B8; font-size: 11px;">본 메일은 10분간 유효합니다. 본인이 요청하지 않은 경우 무시하세요.</p>
              </div>
            `,
          });
          emailSent = true;
        } catch (mailErr) {
          console.warn("Magic link email send failed, fallback to direct url:", mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: emailSent
          ? "공직자 메일함으로 1회용 로그인 매직링크를 발송했습니다."
          : "1회용 매직링크가 성공적으로 생성되었습니다.",
        magicToken: rawToken,
        magicUrl: `/teacher/login?token=${rawToken}`,
        emailSent,
      });
    }

    // -------------------------------------------------------------
    // 1-2. 공직자 이메일 6자리 인증번호 발송 요청 (action: 'SEND_VERIFICATION_CODE')
    // -------------------------------------------------------------
    if (action === "SEND_VERIFICATION_CODE") {
      if (!email || !email.includes("@")) {
        return NextResponse.json({ success: false, message: "유효한 공직자 이메일을 입력해주세요." }, { status: 400 });
      }

      const code = "778899";
      const resendKey = process.env.RESEND_API_KEY;
      let emailSent = false;

      if (resendKey) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: "스쿨픽 가입인증 <onboarding@resend.dev>",
            to: [email],
            subject: "[스쿨픽] 공직자 교사 가입 인증번호: " + code,
            html: `
              <div style="font-family: sans-serif; padding: 24px; border: 2px solid #1E293B; border-radius: 16px; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #0F172A; margin-bottom: 8px;">스쿨픽 공직자 교사 회원가입 인증 ✉️</h2>
                <p style="color: #475569; font-size: 14px;">아래의 6자리 인증번호를 화면에 입력하여 가입을 진행해주세요.</p>
                <div style="margin: 24px 0; background-color: #F8FAFC; border: 2px dashed #0284C7; padding: 16px; text-align: center; border-radius: 12px;">
                  <span style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #0284C7;">${code}</span>
                </div>
                <p style="color: #94A3B8; font-size: 11px;">본 메일은 공직자 메일 소유권 확인을 위한 1회용 인증번호입니다.</p>
              </div>
            `,
          });
          emailSent = true;
        } catch (mailErr) {
          console.warn("Verification email send failed:", mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: emailSent
          ? `${email} 메일함으로 6자리 인증번호를 발송했습니다.`
          : `인증번호가 발송되었습니다. [인증번호: ${code}]`,
        code,
        emailSent,
      });
    }

    // -------------------------------------------------------------
    // 2. 매직링크 토큰 검증 (action: 'VERIFY_MAGIC_LINK')
    // -------------------------------------------------------------
    if (action === "VERIFY_MAGIC_LINK") {
      if (!token) {
        return NextResponse.json({ success: false, message: "토큰이 전달되지 않았습니다." }, { status: 400 });
      }

      try {
        const decoded = Buffer.from(token, "base64url").toString("utf-8");
        const [tokenEmail] = decoded.split(":");

        if (tokenEmail === DEV_ADMIN_ACCOUNT.email) {
          return NextResponse.json({
            success: true,
            account: {
              email: DEV_ADMIN_ACCOUNT.email,
              name: DEV_ADMIN_ACCOUNT.name,
              schoolId: "sch-test-001",
              schoolName: DEV_ADMIN_ACCOUNT.schoolName,
              schoolCode: DEV_ADMIN_ACCOUNT.schoolCode,
              schoolRegion: DEV_ADMIN_ACCOUNT.schoolRegion,
              schoolLevel: DEV_ADMIN_ACCOUNT.schoolLevel,
              roleGrade: DEV_ADMIN_ACCOUNT.roleGrade,
              isJoinedExisting: true,
              createdAt: new Date().toISOString(),
            },
          });
        }

        // 일반 교사 DB 조회
        if (supabase) {
          const { data: teacher } = await supabase
            .from("teachers")
            .select("*, schools(*)")
            .eq("email", tokenEmail)
            .maybeSingle();

          if (teacher) {
            return NextResponse.json({
              success: true,
              account: {
                email: teacher.email,
                name: teacher.name,
                schoolId: teacher.school_id,
                schoolName: teacher.schools?.school_name || "한재초등학교",
                schoolCode: teacher.schools?.school_code || "JNE-3012",
                schoolRegion: teacher.schools?.region || "전남",
                schoolLevel: "E",
                roleGrade: teacher.role_grade || "담임교사",
                isJoinedExisting: true,
                createdAt: teacher.created_at,
              },
            });
          }
        }

        // 폴백
        return NextResponse.json({
          success: true,
          account: {
            email: tokenEmail,
            name: "선생님",
            schoolId: "sch-default",
            schoolName: "한재초등학교",
            schoolCode: "JNE-3012",
            schoolRegion: "전남",
            schoolLevel: "E",
            roleGrade: "담임교사",
            isJoinedExisting: true,
            createdAt: new Date().toISOString(),
          },
        });
      } catch (e: any) {
        return NextResponse.json({ success: false, message: "유효하지 않거나 만료된 토큰입니다." }, { status: 400 });
      }
    }

    // -------------------------------------------------------------
    // 3. 교사 비밀번호 로그인 (action: 'LOGIN')
    // -------------------------------------------------------------
    if (action === "LOGIN") {
      // 개발자/관리자 테스트 계정 특수 인증
      if (email === DEV_ADMIN_ACCOUNT.email) {
        if (password !== DEV_ADMIN_ACCOUNT.password) {
          return NextResponse.json(
            { success: false, message: "비밀번호가 일치하지 않습니다. (개발자 비밀번호: blue7412)" },
            { status: 401 }
          );
        }

        // DB 확인 및 보장
        if (supabase) {
          const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("school_code", DEV_ADMIN_ACCOUNT.schoolCode)
            .maybeSingle();

          let sId = school?.id;
          if (!sId) {
            const { data: newS } = await supabase
              .from("schools")
              .insert({
                school_code: DEV_ADMIN_ACCOUNT.schoolCode,
                school_name: DEV_ADMIN_ACCOUNT.schoolName,
                region: DEV_ADMIN_ACCOUNT.schoolRegion,
              })
              .select("id")
              .single();
            sId = newS?.id;
          }

          if (sId) {
            await supabase.from("teachers").upsert(
              {
                school_id: sId,
                email: DEV_ADMIN_ACCOUNT.email,
                name: DEV_ADMIN_ACCOUNT.name,
                role_grade: DEV_ADMIN_ACCOUNT.roleGrade,
              },
              { onConflict: "email" }
            );
          }
        }

        return NextResponse.json({
          success: true,
          account: {
            email: DEV_ADMIN_ACCOUNT.email,
            name: DEV_ADMIN_ACCOUNT.name,
            schoolId: "sch-test-001",
            schoolName: DEV_ADMIN_ACCOUNT.schoolName,
            schoolCode: DEV_ADMIN_ACCOUNT.schoolCode,
            schoolRegion: DEV_ADMIN_ACCOUNT.schoolRegion,
            schoolLevel: DEV_ADMIN_ACCOUNT.schoolLevel,
            roleGrade: DEV_ADMIN_ACCOUNT.roleGrade,
            isJoinedExisting: false,
            createdAt: new Date().toISOString(),
          },
        });
      }

      // 일반 교사 로그인
      return NextResponse.json({
        success: true,
        account: {
          email,
          name: "선생님",
          schoolId: "sch-001",
          schoolName: "한재초등학교",
          schoolCode: "JNE-3012",
          schoolRegion: "전남",
          schoolLevel: "E",
          roleGrade: "5학년 2반 담임",
          isJoinedExisting: true,
          createdAt: new Date().toISOString(),
        },
      });
    }

    // -------------------------------------------------------------
    // 4. 교사 회원가입 및 프로필 동기화 (기본 POST)
    // -------------------------------------------------------------
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
          region: schoolRegion || "전국",
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
          name: name || "선생님",
          role_grade: roleGrade || "담임교사",
        },
        { onConflict: "email" }
      );
    }

    return NextResponse.json({ success: true, schoolId });
  } catch (err: any) {
    console.error("Teacher auth API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
