"use client";

import { useState, useEffect } from "react";
import { MessageSquarePlus, X, Send, Sparkles, Mail, Pencil, CheckCircle2, School } from "lucide-react";

export type FeedbackCategory = "THEME" | "IMPROVEMENT" | "ACCOUNT" | "ETC";

interface TeacherFeedbackWidgetProps {
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export default function TeacherFeedbackWidget({
  isOpenExternal,
  onCloseExternal,
}: TeacherFeedbackWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;

  const handleClose = () => {
    if (onCloseExternal) onCloseExternal();
    setInternalOpen(false);
  };

  // 로그인된 교사 정보 가져오기
  const [teacherEmail, setTeacherEmail] = useState("teacher@korea.kr");
  const [schoolName, setSchoolName] = useState("한재초등학교");
  const [teacherName, setTeacherName] = useState("이하늘 선생님");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("schoolpick_teacher");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.email) setTeacherEmail(parsed.email);
          if (parsed.schoolName) setSchoolName(parsed.schoolName);
          if (parsed.name) setTeacherName(parsed.name);
        } catch (e) {}
      }
    }
  }, []);

  const [category, setCategory] = useState<FeedbackCategory>("THEME");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherName,
          schoolName,
          teacherEmail,
          category,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("💌 " + (data.message || "선생님의 소중한 의견이 스쿨픽 개발팀에 안전하게 전송되었습니다!"));
        handleClose();
        setTitle("");
        setContent("");
      } else {
        alert(data.message || "전송 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
      alert("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 교사 화면 우측 하단에 [💬 테마 제안 / 문의] 플로팅 위젯 상시 노출 (rules.md 준수) */}
      {isOpenExternal === undefined && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setInternalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-arcade-sky border-2 border-sky-400 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <MessageSquarePlus className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="drop-shadow-sm font-black">💬 테마 제안 / 문의</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>
      )}

      {/* 개발자 문의 화면 모달 (첨부 이미지 3 정밀 구현) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border-4 border-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            
            {/* 상단 일러스트 배너 (첨부 이미지 3 모사) */}
            <div className="bg-sky-50 border-b-2 border-slate-900 px-6 py-5 relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-900 shadow-[0_4px_0_0_#1E293B] flex items-center justify-center text-3xl shrink-0">
                  ✉️
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span>스쿨픽 개발팀에 의견 보내기</span>
                    <span className="text-xl">✏️</span>
                  </h3>
                  <p className="text-xs sm:text-sm font-extrabold text-sky-800">
                    선생님의 소중한 의견이 스쿨픽을 <span className="text-[#0284C7] underline underline-offset-2">빛나는 서비스로</span> 만듭니다!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-2xl bg-white border-2 border-slate-900 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-black cursor-pointer shadow-xs"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* 본문 폼 */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* 보낸 교사 정보 안내 캡슐 */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <span className="text-base">👤</span>
                <span>보내는 교사:</span>
                <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-300 font-extrabold text-sky-900">
                  {schoolName} {teacherName} ({teacherEmail})
                </span>
              </div>

              {/* 문의 유형 라디오 버튼 4종 (첨부 이미지 3 모사) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  문의 유형:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  
                  {/* 유형 1: 새 사진전 테마 제안 */}
                  <label
                    className={`px-3 py-2.5 rounded-2xl border-2 text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                      category === "THEME"
                        ? "bg-amber-100 border-slate-900 text-slate-950 shadow-[0_2px_0_0_#1E293B]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackCategory"
                      checked={category === "THEME"}
                      onChange={() => setCategory("THEME")}
                      className="accent-amber-500 w-3.5 h-3.5"
                    />
                    <span>새 사진전 테마 제안</span>
                  </label>

                  {/* 유형 2: 기능 개선/불편 신고 */}
                  <label
                    className={`px-3 py-2.5 rounded-2xl border-2 text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                      category === "IMPROVEMENT"
                        ? "bg-amber-100 border-slate-900 text-slate-950 shadow-[0_2px_0_0_#1E293B]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackCategory"
                      checked={category === "IMPROVEMENT"}
                      onChange={() => setCategory("IMPROVEMENT")}
                      className="accent-amber-500 w-3.5 h-3.5"
                    />
                    <span>기능 개선/불편 신고</span>
                  </label>

                  {/* 유형 3: 계정 및 학교 인증 */}
                  <label
                    className={`px-3 py-2.5 rounded-2xl border-2 text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                      category === "ACCOUNT"
                        ? "bg-amber-100 border-slate-900 text-slate-950 shadow-[0_2px_0_0_#1E293B]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackCategory"
                      checked={category === "ACCOUNT"}
                      onChange={() => setCategory("ACCOUNT")}
                      className="accent-amber-500 w-3.5 h-3.5"
                    />
                    <span>계정 및 학교 인증</span>
                  </label>

                  {/* 유형 4: 기타 문의 */}
                  <label
                    className={`px-3 py-2.5 rounded-2xl border-2 text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                      category === "ETC"
                        ? "bg-amber-100 border-slate-900 text-slate-950 shadow-[0_2px_0_0_#1E293B]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackCategory"
                      checked={category === "ETC"}
                      onChange={() => setCategory("ETC")}
                      className="accent-amber-500 w-3.5 h-3.5"
                    />
                    <span>기타 문의</span>
                  </label>

                </div>
              </div>

              {/* 제목 입력 */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  제목:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    category === "THEME"
                      ? "예: 3학년 2학기 [식물 생태 관찰도감] 테마가 추가되었으면 합니다."
                      : "의견의 핵심 요약을 적어주세요."
                  }
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 text-xs font-bold focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* 상세 내용 textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  상세 내용:
                </label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="구체적인 상황을 학교 환경에 맞게 적어주시면 신속하게 검토 후 개발 로드맵에 반영하겠습니다. 이미지가 있다면 링크나 설명을 첨부해주세요."
                  className="w-full p-4 rounded-2xl border-2 border-slate-300 text-xs font-medium focus:border-slate-900 focus:outline-none leading-relaxed"
                />
              </div>

              {/* 하단 취소 및 전송 버튼 */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all cursor-pointer"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-8 rounded-2xl bg-[#FFC72C] hover:bg-[#FFBF1A] active:scale-95 text-slate-950 font-black text-sm border-2 border-slate-900 shadow-[0_4px_0_0_#1E293B] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "전송 중..." : "🚀 개발자에게 전송"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}