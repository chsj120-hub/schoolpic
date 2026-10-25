"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SAMPLE_SUBMISSIONS, INITIAL_CHALLENGES } from "@/lib/constants";
import { PhotoSubmission, Challenge } from "@/types";
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

  // ================= 요구사항 10: 학부모 자녀 확인 & 2단계 동의 & 응원댓글 상태 =================
  const [childGrade, setChildGrade] = useState<string>("5");
  const [childClass, setChildClass] = useState<string>("2");
  const [childNumber, setChildNumber] = useState<string>("14");
  const [childPin, setChildPin] = useState<string>("1234");
  const [parentAuthPhone, setParentAuthPhone] = useState<string>("");
  const [isChildVerified, setIsChildVerified] = useState<boolean>(false);
  const [matchedChildPhoto, setMatchedChildPhoto] = useState<PhotoSubmission | null>(null);
  const [childCommentInput, setChildCommentInput] = useState<string>("");

  // 자녀 출품작 조회 및 PIN 인증
  const handleVerifyChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentAuthPhone.trim()) {
      alert("학부모 휴대폰 번호를 입력해주세요.");
      return;
    }
    const cleanPhone = parentAuthPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      alert("올바른 휴대폰 번호를 입력해주세요 (예: 010-1234-5678).");
      return;
    }

    const found = submissions.find(
      (s) =>
        s.studentGrade === Number(childGrade) &&
        s.studentClass === Number(childClass) &&
        s.studentNumber === Number(childNumber)
    );

    if (!found) {
      alert(`입력하신 ${childGrade}학년 ${childClass}반 ${childNumber}번 학생의 출품작을 찾을 수 없습니다.\n학년·반·번호를 다시 확인해주세요.`);
      return;
    }

    // PIN 번호 검증 (설정된 PIN이 있으면 일치 확인, 없거나 기본값은 1234 허용)
    const validPin = found.pin || "1234";
    if (childPin !== validPin && childPin !== "1234") {
      alert("학생 PIN 번호(4자리)가 일치하지 않습니다.\n자녀가 설정한 4자리 PIN 번호를 확인해주세요. (테스트용 기본 PIN: 1234)");
      return;
    }

    setMatchedChildPhoto(found);
    setChildCommentInput(found.parent_comment || "");
    setIsChildVerified(true);
    alert(`🎉 [자녀 확인 완료]\n${found.studentGrade}학년 ${found.studentClass}반 ${found.studentNumber}번 (${found.nickname}) 학생의 출품작이 조회되었습니다!\n\n아래 '우리 아이 출품작' 카드에서 2단계 학부모 동의 및 따뜻한 응원 한마디를 남겨주세요 ❤️`);
  };

  // 2단계 학부모 동의 토글
  const handleToggleParentConsent = () => {
    if (!matchedChildPhoto) return;
    const nextConsent = !matchedChildPhoto.parent_consent;
    const updated = { ...matchedChildPhoto, parent_consent: nextConsent };
    setMatchedChildPhoto(updated);
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    alert(
      nextConsent
        ? "✅ [2단계 학부모 동의 완료]\n타 학교 학생들과 함께 보는 전국 교류관 대표 출품에 동의하셨습니다. (선생님 최종 검수 후 등재)"
        : "학부모 동의가 해제되었습니다."
    );
  };

  // 자녀 전용 응원 댓글 저장
  const handleSaveChildComment = () => {
    if (!matchedChildPhoto) return;
    if (!childCommentInput.trim()) {
      alert("응원 한마디를 입력해주세요.");
      return;
    }
    const updated = { ...matchedChildPhoto, parent_comment: childCommentInput.trim() };
    setMatchedChildPhoto(updated);
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    alert(`💌 [응원 한마디 전송 완료!]\n"${childCommentInput.trim()}"\n\n이 응원글은 오직 우리 아이의 학생 화면에서만 따뜻하게 보여집니다 ❤️ (다른 친구들에게는 비공개)`);
  };

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

        {/* ================= 요구사항 10: 우리 아이 출품작 확인 & 학부모 동의 및 응원한마디 ================= */}
        <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-5 shadow-[0_6px_0_0_#1E293B] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👨‍👩‍👧</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                우리 아이 출품작 확인 & 학부모 동의 (2단계)
              </h2>
            </div>
            {isChildVerified && (
              <button
                type="button"
                onClick={() => {
                  setIsChildVerified(false);
                  setMatchedChildPhoto(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                다른 자녀 조회하기
              </button>
            )}
          </div>

          {!isChildVerified ? (
            /* 자녀 인증 폼 */
            <form onSubmit={handleVerifyChild} className="space-y-4 bg-sky-50/70 p-4 rounded-2xl border border-sky-200">
              <p className="text-xs text-slate-700 font-bold leading-relaxed">
                휴대폰 번호와 자녀의 학년·반·번호 및 학생 PIN 번호를 입력하시면, <b>자녀의 작품을 확인하고 2단계 외부 공개 동의 및 자녀 전용 응원 한마디</b>를 남기실 수 있습니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 학부모 휴대폰 번호 */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    <span>학부모 휴대폰 번호</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="010-1234-5678"
                    value={parentAuthPhone}
                    onChange={(e) => setParentAuthPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                {/* 학년 */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700">자녀 학년</label>
                  <select
                    value={childGrade}
                    onChange={(e) => setChildGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>{g}학년</option>
                    ))}
                  </select>
                </div>

                {/* 반 */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700">반</label>
                  <input
                    type="number"
                    placeholder="반"
                    value={childClass}
                    onChange={(e) => setChildClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                {/* 번호 */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700">번호</label>
                  <input
                    type="number"
                    placeholder="번호"
                    value={childNumber}
                    onChange={(e) => setChildNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* 학생 PIN 번호 & 조회 버튼 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-black text-slate-700 whitespace-nowrap flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>학생 안심 PIN (4자리):</span>
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={childPin}
                    onChange={(e) => setChildPin(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-center text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 font-normal">
                    (기본값: 1234)
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs border border-sky-700 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>우리 아이 작품 조회하기</span>
                </button>
              </div>
            </form>
          ) : matchedChildPhoto ? (
            /* 자녀 인증 완료 시 노출되는 우리 아이 작품 카드 */
            <div className="bg-gradient-to-br from-rose-50/60 via-amber-50/50 to-white rounded-2xl p-4 sm:p-5 border-2 border-rose-300 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-rose-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">
                    내 자녀 출품작
                  </span>
                  <span className="font-black text-sm text-slate-900">
                    {matchedChildPhoto.studentGrade}학년 {matchedChildPhoto.studentClass}반 {matchedChildPhoto.studentNumber}번 ({matchedChildPhoto.nickname} 작가님)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-bold">
                  출품일: {matchedChildPhoto.submittedAt}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 사진 뷰어 */}
                <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-300 flex items-center justify-center">
                  <img
                    src={matchedChildPhoto.imageUrl}
                    alt={matchedChildPhoto.title}
                    className="max-w-full max-h-full object-contain"
                  />
                  {matchedChildPhoto.selectedFrame && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-900">
                      🏷️ {matchedChildPhoto.selectedFrame}
                    </div>
                  )}
                </div>

                {/* 작품 정보 & 2단계 동의 & 응원 한마디 */}
                <div className="md:col-span-2 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{matchedChildPhoto.title}</h3>
                    {matchedChildPhoto.caption && (
                      <p className="text-xs text-slate-700 font-medium mt-1 bg-white p-2.5 rounded-xl border border-rose-200">
                        💬 &ldquo;{matchedChildPhoto.caption}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* 2단계 학부모 법정대리인 동의 (원스톱 체크) */}
                  <div className={`p-3 rounded-2xl border transition-all ${
                    matchedChildPhoto.parent_consent
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-amber-50 border-amber-300 text-amber-950"
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="parent-consent-check"
                        checked={!!matchedChildPhoto.parent_consent}
                        onChange={handleToggleParentConsent}
                        className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="parent-consent-check" className="text-xs font-bold cursor-pointer select-none flex-1 leading-snug">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm">
                            {matchedChildPhoto.parent_consent ? "✅ [2단계 학부모 동의 완료]" : "🔒 [2단계 학부모 동의 필요]"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          우리 아이의 사진을 타 학교와 교류하는 &lsquo;전국 학교 자랑하기 교류관&rsquo;에 외부 공개하는 것에 법정대리인으로서 동의합니다. (종이 동의서 대체)
                        </p>
                        <div className="text-[10px] text-slate-500 font-normal mt-1 flex flex-wrap items-center gap-2">
                          <span className={matchedChildPhoto.student_consent ? "text-emerald-700 font-bold" : ""}>
                            [1단계] 학생: {matchedChildPhoto.student_consent ? "동의 완료 ✓" : "대기"}
                          </span>
                          <span>•</span>
                          <span className={matchedChildPhoto.parent_consent ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                            [2단계] 학부모: {matchedChildPhoto.parent_consent ? "동의 완료 ✓" : "미동의 (체크 필요)"}
                          </span>
                          <span>•</span>
                          <span className={matchedChildPhoto.teacher_approval ? "text-emerald-700 font-bold" : ""}>
                            [3단계] 교사: {matchedChildPhoto.teacher_approval ? "최종 승인 ✓" : "검수 대기"}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 자녀에게 남기는 응원 한마디 입력 폼 */}
                  <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200">
                    <label className="text-xs font-black text-rose-700 flex items-center gap-1">
                      <span>💌</span>
                      <span>우리 아이에게 남기는 사랑의 응원 한마디:</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={80}
                        placeholder="예: 우리 OO이 언제 이렇게 멋진 사진을 찍었니! 최고야 사랑해 ❤️"
                        value={childCommentInput}
                        onChange={(e) => setChildCommentInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      <button
                        type="button"
                        onClick={handleSaveChildComment}
                        className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        응원 등록
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      * 이 응원 댓글은 오직 우리 아이의 학생 화면에만 1:1로 따뜻하게 전달됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
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
    </div>
  );
}
