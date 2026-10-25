import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// 문의 카테고리 한글 변환
const CATEGORY_MAP: Record<string, string> = {
  THEME: "새 사진전 테마 제안 🏞️",
  IMPROVEMENT: "기능 개선 및 불편 신고 🛠️",
  ACCOUNT: "계정 및 학교 인증 문의 🔑",
  ETC: "기타 문의 💬",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacherName, schoolName, teacherEmail, category, title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "제목과 상세 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    // 개발자 수신 이메일 (서버 전용 환경변수 - 클라이언트 번들에 절대 미노출)
    const developerEmail = process.env.DEVELOPER_EMAIL || "chsj120@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;

    const categoryKorean = CATEGORY_MAP[category] || "일반 문의";
    const sentTime = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    // 개발자 수신용 HTML 템플릿
    const emailHtml = `
      <div style="font-family: 'Pretendard', sans-serif, -apple-system; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #0F172A; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <div style="background-color: #0284C7; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">🏫 스쿨픽(School-Pic) 교사 의견 접수</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">선생님께서 새로운 제안 및 문의를 등록하셨습니다.</p>
        </div>

        <div style="padding: 24px; background-color: #F8FAFC;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #64748B; width: 90px;">접수 일시</td>
              <td style="padding: 8px 12px; font-weight: 600; color: #0F172A;">${sentTime} (KST)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #64748B;">문의 분류</td>
              <td style="padding: 8px 12px; font-weight: 800; color: #0284C7;">${categoryKorean}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #64748B;">소속 학교</td>
              <td style="padding: 8px 12px; font-weight: 700; color: #0F172A;">${schoolName || "미지정"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #64748B;">선생님 성함</td>
              <td style="padding: 8px 12px; font-weight: 700; color: #0F172A;">${teacherName || "선생님"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #64748B;">회신 메일</td>
              <td style="padding: 8px 12px; font-weight: 700; color: #D97706;"><a href="mailto:${teacherEmail}" style="color: #D97706; text-decoration: underline;">${teacherEmail || "미입력"}</a></td>
            </tr>
          </table>
        </div>

        <div style="padding: 24px;">
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">제목</div>
            <div style="font-size: 16px; font-weight: 800; color: #0F172A; background-color: #F1F5F9; padding: 12px 16px; border-radius: 12px; border: 1px solid #CBD5E1;">
              ${title}
            </div>
          </div>

          <div>
            <div style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">상세 의견 내용</div>
            <div style="font-size: 14px; line-height: 1.7; color: #1E293B; background-color: #FFFFFF; padding: 16px; border-radius: 12px; border: 1.5px solid #E2E8F0; white-space: pre-wrap;">
${content}
            </div>
          </div>
        </div>

        <div style="background-color: #0F172A; padding: 16px; text-align: center; color: #94A3B8; font-size: 11px;">
          이 메일은 스쿨픽 플랫폼 교사 대시보드 플로팅 피드백 위젯을 통해 개발팀 메일함으로 자동 포워딩되었습니다.
        </div>
      </div>
    `;

    // Supabase DB 자동 기록 (DB 연결 키가 설정되어 있을 때)
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("teacher_feedbacks").insert({
          school_name: schoolName,
          teacher_email: teacherEmail,
          category,
          title,
          content,
        });
      } catch (dbErr) {
        console.warn("Supabase teacher_feedbacks 기록 스킵:", dbErr);
      }
    }

    // 1. Resend API 키가 설정되어 있을 때 실제 이메일 발송
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const sendResult = await resend.emails.send({
          from: "스쿨픽 알림 <onboarding@resend.dev>",
          to: developerEmail,
          replyTo: teacherEmail || undefined,
          subject: `[스쿨픽 문의] ${categoryKorean}: ${title} (${schoolName} ${teacherName})`,
          html: emailHtml,
        });

        return NextResponse.json({
          success: true,
          mode: "SENT_VIA_RESEND",
          data: sendResult,
          message: "선생님의 소중한 의견이 개발자 메일함으로 안전하게 전송되었습니다!",
        });
      } catch (resendError) {
        console.error("Resend API 메일 발송 에러:", resendError);
      }
    }

    // 2. Resend API 키가 아직 없거나 테스트 환경일 때 안전한 백엔드 수신 시뮬레이션
    console.log("=================================================");
    console.log("📨 [스쿨픽 개발자 피드백 수신 로그 (비공개 서버 환경)]");
    console.log(`수신 대상: ${developerEmail} (외부 절대 비공개)`);
    console.log(`보낸 교사: ${schoolName} ${teacherName} (${teacherEmail})`);
    console.log(`문의 분류: ${categoryKorean}`);
    console.log(`제목: ${title}`);
    console.log(`내용:\n${content}`);
    console.log("=================================================");

    return NextResponse.json({
      success: true,
      mode: "RECORDED_AND_LOGGED",
      message: "선생님의 소중한 의견이 스쿨픽 개발팀에 안전하게 접수되었습니다!",
    });
  } catch (err: any) {
    console.error("Feedback submit error:", err);
    return NextResponse.json(
      { success: false, message: "피드백 전송 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
