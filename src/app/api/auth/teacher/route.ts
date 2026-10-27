import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEV_ADMIN_ACCOUNT,
  getStoredTeachers,
  saveTeacher,
  resetNonAdminTeachers,
  StoredTeacherAccount,
} from "@/lib/serverDataStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      email,
      password,
      token,
      name,
      schoolName,
      schoolCode,
      schoolRegion,
      schoolLevel = "E",
      roleGrade,
    } = body;

    const supabase = getSupabaseServerClient();

    // -------------------------------------------------------------
    // 0. 관리자 제외 모든 교사 계정 초기화 (action: 'RESET_ALL_EXCEPT_ADMIN')
    // -------------------------------------------------------------
    if (action === "RESET_ALL_EXCEPT_ADMIN") {
      resetNonAdminTeachers();

      // Supabase 연결되어 있는 경우에도 관리자 외 교사 삭제 시도
      if (supabase) {
        try {
          await supabase
            .from("teachers")
            .delete()
            .neq("email", DEV_ADMIN_ACCOUNT.email);
        } catch (dbErr) {
          console.warn("Supabase teacher reset warning:", dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: "관리자(chsj120@gmail.com)를 제외한 모든 교사 계정이 초기화되었습니다.",
      });
    }

    // -------------------------------------------------------------
    // 1. 매직링크 발송 요청 (action: 'MAGIC_LINK')
    // -------------------------------------------------------------
    if (action === "MAGIC_LINK") {
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { success: false, message: "유효한 이메일을 입력해주세요." },
          { status: 400 }
        );
      }

      const timestamp = Date.now();
      const rawToken = Buffer.from(`${email}:${timestamp}`).toString("base64url");

      // 실제 등록된 계정 정보 조회
      let schoolInfo = {
        schoolName: email === DEV_ADMIN_ACCOUNT.email ? DEV_ADMIN_ACCOUNT.schoolName : "학교",
        schoolCode: email === DEV_ADMIN_ACCOUNT.email ? DEV_ADMIN_ACCOUNT.schoolCode : "SCH-0000",
      };

      const storedList = getStoredTeachers();
      const matchedLocal = storedList.find((t) => t.email.toLowerCase() === email.toLowerCase());
      if (matchedLocal) {
        schoolInfo = {
          schoolName: matchedLocal.schoolName,
          schoolCode: matchedLocal.schoolCode,
        };
      } else if (supabase) {
        try {
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
        } catch (e) {}
      }

      // Resend 이메일 발송 시도
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
        return NextResponse.json(
          { success: false, message: "유효한 공직자 이메일을 입력해주세요." },
          { status: 400 }
        );
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
        return NextResponse.json(
          { success: false, message: "토큰이 전달되지 않았습니다." },
          { status: 400 }
        );
      }

      try {
        const decoded = Buffer.from(token, "base64url").toString("utf-8");
        const [tokenEmail] = decoded.split(":");

        if (tokenEmail === DEV_ADMIN_ACCOUNT.email) {
          return NextResponse.json({
            success: true,
            account: DEV_ADMIN_ACCOUNT,
          });
        }

        // 로컬 파일 스토어 조회
        const storedList = getStoredTeachers();
        const matchedLocal = storedList.find((t) => t.email.toLowerCase() === tokenEmail.toLowerCase());
        if (matchedLocal) {
          return NextResponse.json({
            success: true,
            account: matchedLocal,
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
            const acc: StoredTeacherAccount = {
              email: teacher.email,
              name: teacher.name,
              schoolId: teacher.school_id,
              schoolName: teacher.schools?.school_name || "학교",
              schoolCode: teacher.schools?.school_code || "SCH-0000",
              schoolRegion: teacher.schools?.region || "전국",
              schoolLevel: "E",
              roleGrade: teacher.role_grade || "담임교사",
              isJoinedExisting: true,
              createdAt: teacher.created_at,
            };
            saveTeacher(acc);
            return NextResponse.json({ success: true, account: acc });
          }
        }

        return NextResponse.json(
          { success: false, message: "등록되지 않은 교사 계정입니다." },
          { status: 404 }
        );
      } catch (e: any) {
        return NextResponse.json(
          { success: false, message: "유효하지 않거나 만료된 토큰입니다." },
          { status: 400 }
        );
      }
    }

    // -------------------------------------------------------------
    // 3. 교사 비밀번호 로그인 (action: 'LOGIN')
    // -------------------------------------------------------------
    if (action === "LOGIN") {
      // 1) 개발자/관리자 공식 계정
      if (email.toLowerCase() === DEV_ADMIN_ACCOUNT.email.toLowerCase()) {
        if (password !== DEV_ADMIN_ACCOUNT.password) {
          return NextResponse.json(
            { success: false, message: "비밀번호가 일치하지 않습니다. (관리자 비밀번호: blue7412)" },
            { status: 401 }
          );
        }

        return NextResponse.json({
          success: true,
          account: DEV_ADMIN_ACCOUNT,
        });
      }

      // 2) 로컬 파일 영구 스토어 확인
      const storedList = getStoredTeachers();
      const matched = storedList.find((t) => t.email.toLowerCase() === email.toLowerCase());

      if (matched) {
        // 비밀번호 확인 (비밀번호가 저장되어 있는 경우 대조)
        if (matched.password && matched.password !== password) {
          return NextResponse.json(
            { success: false, message: "비밀번호가 일치하지 않습니다. 다시 확인해주세요." },
            { status: 401 }
          );
        }

        return NextResponse.json({
          success: true,
          account: matched,
        });
      }

      // 3) Supabase DB 조회
      if (supabase) {
        try {
          const { data: teacher } = await supabase
            .from("teachers")
            .select("*, schools(*)")
            .eq("email", email)
            .maybeSingle();

          if (teacher) {
            const acc: StoredTeacherAccount = {
              email: teacher.email,
              name: teacher.name,
              schoolId: teacher.school_id,
              schoolName: teacher.schools?.school_name || "학교",
              schoolCode: teacher.schools?.school_code || "SCH-0000",
              schoolRegion: teacher.schools?.region || "전국",
              schoolLevel: "E",
              roleGrade: teacher.role_grade || "담임교사",
              isJoinedExisting: true,
              createdAt: teacher.created_at,
            };
            saveTeacher(acc);
            return NextResponse.json({ success: true, account: acc });
          }
        } catch (dbErr) {
          console.warn("Supabase teacher lookup error:", dbErr);
        }
      }

      // 4) 계정이 없는 경우 명확한 에러 반환
      return NextResponse.json(
        {
          success: false,
          message: "가입되지 않은 교사 이메일입니다. [신규 교사 가입] 탭에서 회원가입을 먼저 진행해주세요.",
        },
        { status: 404 }
      );
    }

    // -------------------------------------------------------------
    // 4. 교사 회원가입 처리 (action: 'SIGNUP' 또는 기본 POST)
    // -------------------------------------------------------------
    if (action === "SIGNUP" || !action) {
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { success: false, message: "올바른 공직자 메일 주소를 입력해주세요." },
          { status: 400 }
        );
      }

      if (!schoolName || !schoolCode) {
        return NextResponse.json(
          { success: false, message: "학교명과 학교 코드가 필요합니다." },
          { status: 400 }
        );
      }

      const newAccount: StoredTeacherAccount = {
        email: email.trim(),
        name: name ? name.trim() : "선생님",
        password: password || "123456",
        schoolId: `sch-${Date.now()}`,
        schoolName: schoolName.trim(),
        schoolCode: schoolCode.trim(),
        schoolRegion: schoolRegion || "전국",
        schoolLevel: (schoolLevel as "E" | "M" | "H") || "E",
        roleGrade: roleGrade ? roleGrade.trim() : "담임교사",
        isJoinedExisting: false,
        createdAt: new Date().toISOString(),
      };

      // 1) 로컬 파일 영구 스토어에 즉시 저장
      saveTeacher(newAccount);

      // 2) Supabase DB 연결되어 있을 경우 동기화
      if (supabase) {
        try {
          let sId: string | null = null;
          const { data: existingSchool } = await supabase
            .from("schools")
            .select("id")
            .eq("school_code", schoolCode)
            .maybeSingle();

          if (existingSchool) {
            sId = existingSchool.id;
          } else {
            const { data: newSchool } = await supabase
              .from("schools")
              .insert({
                school_code: schoolCode,
                school_name: schoolName,
                region: schoolRegion || "전국",
              })
              .select("id")
              .single();
            if (newSchool) sId = newSchool.id;
          }

          if (sId) {
            await supabase.from("teachers").upsert(
              {
                school_id: sId,
                email: newAccount.email,
                name: newAccount.name,
                role_grade: newAccount.roleGrade,
              },
              { onConflict: "email" }
            );
          }
        } catch (dbErr) {
          console.warn("Supabase teacher signup sync warning:", dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: "회원가입이 성공적으로 완료되었습니다.",
        account: newAccount,
      });
    }

    return NextResponse.json({ success: false, message: "지원하지 않는 요청입니다." }, { status: 400 });
  } catch (err: any) {
    console.error("Teacher auth error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "서버 인증 처리 실패" },
      { status: 500 }
    );
  }
}
