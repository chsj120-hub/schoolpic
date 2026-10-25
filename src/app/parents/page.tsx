"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SAMPLE_SUBMISSIONS, INITIAL_CHALLENGES } from "@/lib/constants";
import { PhotoSubmission, Challenge } from "@/types";
import { Footer } from "@/components/Footer";
import {
  Camera,
  Star,
  Heart,
  Megaphone,
  ShieldCheck,
  Lock,
  Phone,
  Check,
  X,
  Sparkles,
  Info,
  Calendar,
  Award
} from "lucide-react";

export default function ParentsVotingPage() {
  const [challenge] = useState<Challenge>(INITIAL_CHALLENGES[0]);
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>(() => {
    return SAMPLE_SUBMISSIONS.map((sub, idx) => ({
      ...sub,
      parentVotes: sub.parentVotes || (idx === 0 ? 128 : idx === 1 ? 96 : 84),
    }));
  });

  // 학부모 투표 상태 (1일 1표 제한)
  const [hasVotedToday, setHasVotedToday] = useState<boolean>(false);
  const [votedPhotoId, setVotedPhotoId] = useState<string | null>(null);

  // 모달 상태: 휴대폰 번호 본인확인 모달
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedPhotoForVote, setSelectedPhotoForVote] = useState<PhotoSubmission | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // 기타 상단 모달 상태
  const [activeInfoModal, setActiveInfoModal] = useState<"guide" | "notice" | "myStatus" | null>(null);

  // 로컬스토리지에서 오늘 투표 여부 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().split("T")[0];
      const savedVote = localStorage.getItem(`schoolpick_parent_vote_${today}`);
      if (savedVote) {
        setHasVotedToday(true);
        setVotedPhotoId(savedVote);
      }
    }
  }, []);

  // 학부모 공감 버튼 클릭 핸들러
  const handleOpenVoteModal = (photo: PhotoSubmission) => {
    if (hasVotedToday) {
      alert("학부모 공감 투표는 공정성을 위해 1일 1표만 가능합니다. 내일 다시 참여해주세요! 💖");
      return;
    }
    setSelectedPhotoForVote(photo);
    setIsAuthModalOpen(true);
  };

  // 투표 완료 제출
  const handleSubmitVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanNumber.length < 10) {
      alert("올바른 휴대폰 번호를 입력해주세요 (예: 010-1234-5678).");
      return;
    }

    if (!selectedPhotoForVote) return;

    // 투표수 증가 반영
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === selectedPhotoForVote.id
          ? {
              ...sub,
              parentVotes: (sub.parentVotes || 0) + 1,
              votes: sub.votes + 1,
            }
          : sub
      )
    );

    // Supabase DB 동기화
    try {
      fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedPhotoForVote.id,
          voterType: "PARENT",
          voterFingerprint: cleanNumber,
          action: "VOTE",
        }),
      }).catch((e) => console.warn("Parent vote sync error:", e));
    } catch (err) {
      console.warn("Parent vote fetch err:", err);
    }

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`schoolpick_parent_vote_${today}`, selectedPhotoForVote.id);

    setHasVotedToday(true);
    setVotedPhotoId(selectedPhotoForVote.id);
    setIsAuthModalOpen(false);

    alert(`🎉 [학부모 공감 투표 완료]\n"${selectedPhotoForVote.title}" (${selectedPhotoForVote.nickname} 작가님) 작품에 따뜻한 응원의 공감 표가 전달되었습니다! 💖`);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-800 pb-20 selection:bg-rose-200">
      
      {/* 1. 상단 글로벌 네비게이션 헤더 (첨부 이미지 반영) */}
      <header className="bg-white border-b-[2px] border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* 학교 로고 & 타이틀 */}
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🏫</span>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                한재초등학교 디지털 사진전
              </h1>
              <span className="text-xs sm:text-sm font-black text-slate-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                (학부모 전용관)
              </span>
            </div>
          </div>

          {/* 상단 3대 안내 버튼 (첨부 이미지 반영) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveInfoModal("guide")}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-sky-600" />
              <span>사진전 안내</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInfoModal("notice")}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>공지사항</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInfoModal("myStatus")}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
              <span>나의 공감 현황</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. 메인 콘텐츠 컨테이너 */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        
        {/* 상단 공감 참여 안내 배너 (첨부 이미지 반영) */}
        <div className="bg-[#D9EFFF] border-[2px] border-sky-300 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">📢</span>
            <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">
              우리 아이들의 빛나는 순간을 감상하시고 따뜻한 응원의 공감 표를 보내주세요!{" "}
              <span className="text-sky-700 underline font-black">(1일 1표)</span> 💖
            </p>
          </div>
          <div className="shrink-0 hidden md:block">
            <span className="text-3xl">💌</span>
          </div>
        </div>

        {/* 출품작 카드 그리드 & 투표 인증 모달 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {submissions.map((photo, idx) => {
            const isThisVoted = votedPhotoId === photo.id;

            return (
              <div
                key={photo.id}
                className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-4 sm:p-5 shadow-[0_6px_0_0_#1E293B] space-y-3.5 relative overflow-hidden flex flex-col justify-between"
              >
                {/* 상단 코너 스티커 뱃지 (첨부 이미지 반영) */}
                <div className="absolute top-3 left-3 z-10">
                  {idx === 0 && <span className="text-2xl drop-shadow-md">⭐</span>}
                  {idx === 1 && <span className="text-2xl drop-shadow-md">💖</span>}
                  {idx === 2 && <span className="text-2xl drop-shadow-md">📷</span>}
                </div>

                <div className="space-y-3">
                  {/* 사진 뷰어 (가로/세로 비율 100% 보존) */}
                  <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-200 flex items-center justify-center">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="max-w-full max-h-full object-contain"
                    />
                    
                    {/* 우측 하단 미니 카메라 아이콘 뱃지 */}
                    <div className="absolute bottom-2 right-2 bg-sky-500 text-white p-1.5 rounded-xl border border-white shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 작품 타이틀 & 작가 닉네임 */}
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1">
                      {photo.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      작가: <span className="text-slate-900 font-black">{photo.nickname}</span>
                    </p>
                    {photo.caption && (
                      <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        &ldquo;{photo.caption}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* 하단 투표 액션 & 공감수 카운터 (첨부 이미지 반영) */}
                <div className="space-y-2.5 pt-1">
                  
                  {/* 대형 핫핑크 [ 학부모 공감 ] 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleOpenVoteModal(photo)}
                    disabled={hasVotedToday && !isThisVoted}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-sm border-[2px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                      isThisVoted
                        ? "bg-rose-600 border-rose-700 text-white shadow-[0_3px_0_0_#9F1239]"
                        : hasVotedToday
                        ? "bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed"
                        : "bg-[#FF3B69] hover:bg-[#E11D48] text-white border-slate-900 shadow-[0_3px_0_0_#1E293B]"
                    }`}
                  >
                    <span>💖</span>
                    <span>{isThisVoted ? "[ 공감 완료 ✨ ]" : "[ 💖 학부모 공감 ]"}</span>
                  </button>

                  {/* 카드 하단 공감수 & 오늘 1표 남음 표시 */}
                  <div className="flex items-center justify-between text-xs font-extrabold px-1">
                    <div className="flex items-center gap-1.5 text-rose-600">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span>{photo.parentVotes || 0}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                      <Check className="w-3 h-3 text-sky-600 stroke-[3]" />
                      <span>{hasVotedToday ? (isThisVoted ? "오늘 투표 완료" : "오늘 투표 소진") : "오늘 1표 남음"}</span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* 3. 하단 안내사항 박스 (첨부 이미지 반영) */}
        <div className="bg-white rounded-3xl border-[2px] border-sky-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 border border-sky-300 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                안내사항
              </h4>
              <ul className="text-xs font-bold text-slate-600 space-y-0.5 flex flex-wrap gap-x-4">
                <li>• 1일 1회 참여 가능</li>
                <li>• 공정한 투표를 위해 본인 인증이 필요합니다</li>
                <li>• 부정 투표 시 참여가 제한될 수 있습니다</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <span className="text-3xl">🏫</span>
            <Link
              href="/teacher"
              className="text-xs font-black text-slate-500 hover:text-slate-900 underline underline-offset-4"
            >
              선생님 관리관 바로가기
            </Link>
          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 4. [첨부 이미지 핵심]: 공정 투표를 위한 휴대폰 번호 본인확인 모달 */}
      {/* ========================================================================= */}
      {isAuthModalOpen && selectedPhotoForVote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] border-[3px] border-sky-400 p-6 sm:p-7 shadow-[0_12px_0_0_#0284C7] relative space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 자물쇠 & 방패 아이콘 */}
            <div className="text-center pt-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 border-[2.5px] border-slate-900 flex items-center justify-center mx-auto shadow-sm relative">
                <Lock className="w-8 h-8 text-amber-600 stroke-[2.5]" />
                <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1 rounded-full border border-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 타이틀 및 안내 */}
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                공정 투표를 위해<br />
                <span className="text-sky-600">휴대폰 번호</span>를 입력해주세요
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                선택 작품: <b>{selectedPhotoForVote.title}</b>
              </p>
            </div>

            {/* 휴대폰 번호 입력 폼 */}
            <form onSubmit={handleSubmitVote} className="space-y-4">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="010 - 1234 - 5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-[2px] border-sky-300 text-center text-sm font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              {/* 투표 완료 버튼 */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#FFC72C] hover:bg-[#FBBF24] text-slate-950 font-black text-sm border-[2.5px] border-slate-900 shadow-[0_4px_0_0_#1E293B] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>[ 투표 완료 ]</span>
              </button>
            </form>

            {/* 암호화 보안 안내 */}
            <div className="text-center">
              <p className="text-[11px] text-slate-500 font-bold flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>(번호는 중복 방지용으로만 암호화 저장됨)</span>
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 안내사항 모달 */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border-2 border-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-black text-base text-slate-900">
                {activeInfoModal === "guide" && "📷 학부모 사진전 안내"}
                {activeInfoModal === "notice" && "⭐ 공지사항"}
                {activeInfoModal === "myStatus" && "💖 나의 공감 현황"}
              </h4>
              <button
                onClick={() => setActiveInfoModal(null)}
                className="text-slate-400 hover:text-slate-700 font-black"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 font-bold space-y-2 leading-relaxed">
              {activeInfoModal === "guide" && (
                <p>
                  한재초등학교 학생들의 따뜻한 우정과 창의적인 순간을 담은 디지털 사진전입니다.
                  초상권과 개인정보 보호를 위해 실명은 일체 공개되지 않으며, 학부모님께서는 1일 1표의 공감 표를 전해주실 수 있습니다.
                </p>
              )}
              {activeInfoModal === "notice" && (
                <p>
                  • 투표 기간: 2026.11.09 ~ 2026.11.11<br />
                  • 부정 투표 방지를 위해 동일 번호 기준 1일 1회만 투표가 인정됩니다.<br />
                  • 교내 우수작은 학생/학부모 동의 및 교사 검수를 거쳐 전국 교류관에 자랑하게 됩니다.
                </p>
              )}
              {activeInfoModal === "myStatus" && (
                <div>
                  <p className="mb-2">
                    오늘 투표 상태:{" "}
                    {hasVotedToday ? (
                      <span className="text-rose-600 font-black">공감 완료 완료 (1표 행사됨) 💖</span>
                    ) : (
                      <span className="text-sky-600 font-black">오늘 1표 행사 가능 ✨</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal">
                    매일 자정(00:00)에 새로운 공감 표가 1표 충전됩니다.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setActiveInfoModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <Footer />

    </div>
  );
}
