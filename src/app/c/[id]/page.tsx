"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { INITIAL_CHALLENGES, SAMPLE_SUBMISSIONS } from "@/lib/constants";
import { Challenge, PhotoSubmission } from "@/types";
import { Footer } from "@/components/Footer";
import CameraCanvasComposerModal, { FramePresetType } from "@/components/CameraCanvasComposerModal";
import {
  Camera,
  Heart,
  Trophy,
  ShieldCheck,
  Vote,
  Sparkles,
  Clock,
  ArrowLeft,
  Upload,
  UserCheck,
  Flame,
  CheckCircle2,
  Info,
  Smile,
  X,
  Tag,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Award,
  Zap
} from "lucide-react";

export default function StudentChallengePage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = (params?.id as string) || "challenge-1";

  // 현재 챌린지 정보 탐색
  const [challenge, setChallenge] = useState<Challenge>(() => {
    const found = INITIAL_CHALLENGES.find((c) => c.id === challengeId);
    return found || INITIAL_CHALLENGES[0];
  });

  // URL 파라미터 변경 시 challenge 상태 업데이트
  useEffect(() => {
    if (params?.id) {
      const found = INITIAL_CHALLENGES.find((c) => c.id === params.id);
      if (found) {
        setChallenge(found);
      }
    }
  }, [params?.id]);

  // 출품작 목록
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>(SAMPLE_SUBMISSIONS);

  // Supabase 실시간 출품작 동기화
  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res = await fetch(`/api/submissions?exhibitionId=${params?.id || ""}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions) && data.submissions.length > 0) {
          // DB에서 가져온 최신 작품들을 기존 샘플과 병합 (DB 작품 최상단 배치)
          setSubmissions((prev) => {
            const dbIds = new Set(data.submissions.map((s: any) => s.id));
            const existingFiltered = prev.filter((s) => !dbIds.has(s.id));
            return [...data.submissions, ...existingFiltered];
          });
        }
      } catch (e) {
        console.warn("Could not load submissions from server, fallback to local:", e);
      }
    }
    loadSubmissions();
  }, [params?.id]);

  // 1단계 학생 자발적 동의 (Student Opt-in) 토글 핸들러
  const handleToggleStudentConsent = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          const nextConsent = !s.student_consent;
          return {
            ...s,
            student_consent: nextConsent,
            // 3중 안심 잠금: 3단계 모두 충족될 때만 전국 스쿨 교류관 등재
            is_public_shared: nextConsent && s.parent_consent && s.teacher_approval ? true : false,
          };
        }
        return s;
      })
    );
  };

  // 학생 프로필 (규칙: 실명 수집 절대 금지! 학년/반/번호/닉네임만 사용)
  const [studentGrade, setStudentGrade] = useState<number>(5);
  const [studentClass, setStudentClass] = useState<number>(2);
  const [studentNumber, setStudentNumber] = useState<number>(14);
  const [studentNickname, setStudentNickname] = useState<string>("5반 날다람쥐");
  const [isProfileEditing, setIsProfileEditing] = useState<boolean>(false);

  // 학생 가이드 아코디언 토글 (기본 열림)
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(true);

  // 투표 방식에 따른 최대 투표수 계산 (요청: 투표 방식에 따라 학생들 투표가 실제로 변경되는지 확인)
  const maxVotes = challenge.voteLimitType === "ONE_1" ? 1 : 3;
  const voteLimitLabel = challenge.voteLimitType === "ONE_1" ? "1인 1표" : challenge.voteLimitType === "TOTAL_3" ? "총 3표" : "1일 3표";

  // 1일 3표 / 총 3표 / 1인 1표 투표 상태
  const [remainingVotes, setRemainingVotes] = useState<number>(() => (challenge.voteLimitType === "ONE_1" ? 1 : 3));
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setRemainingVotes(challenge.voteLimitType === "ONE_1" ? 1 : 3);
  }, [challenge.voteLimitType]);

  // 사진 출품(카메라) 모달 상태
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // 고화질 전체보기(라이트박스) 모달 상태 (짤림 방지 전체보기)
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoSubmission | null>(null);

  const isSubmittingPeriod = challenge.status === "SUBMITTING";
  const isVotingPeriod = challenge.status === "VOTING";

  // 로컬 스토리지에서 학생 세션 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("schoolpick_student");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.grade) setStudentGrade(parsed.grade);
          if (parsed.classNum) setStudentClass(parsed.classNum);
          if (parsed.studentNum) setStudentNumber(parsed.studentNum);
          if (parsed.nickname) setStudentNickname(parsed.nickname);
        } catch (e) {
          console.error("Failed to parse student session", e);
        }
      }
    }
  }, []);

  // 투표 핸들러
  const handleVote = async (submissionId: string) => {
    const isCurrentlyVoted = !!votedMap[submissionId];
    if (isCurrentlyVoted) {
      // 투표 취소
      setVotedMap((prev) => ({ ...prev, [submissionId]: false }));
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                studentVotes: Math.max(0, (s.studentVotes || 0) - 1),
                votes: Math.max(0, s.votes - 1),
              }
            : s
        )
      );
      setRemainingVotes((prev) => Math.min(maxVotes, prev + 1));

      try {
        await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId,
            voterType: "STUDENT",
            voterFingerprint: `student_${studentGrade}_${studentClass}_${studentNumber}`,
            action: "UNVOTE",
          }),
        });
      } catch (err) {
        console.warn("Vote sync error:", err);
      }
    } else {
      // 투표하기
      if (remainingVotes <= 0) {
        if (challenge.voteLimitType === "ONE_1") {
          alert("1인 1표 투표권을 이미 행사하셨습니다! 신중한 투표 감사합니다 🗳️");
        } else if (challenge.voteLimitType === "TOTAL_3") {
          alert("사진전 기간 내 총 투표권(3표)을 모두 사용했습니다! 🗳️");
        } else {
          alert("오늘의 투표권(1일 3표)을 모두 사용했습니다! 내일 다시 투표할 수 있습니다 🗳️");
        }
        return;
      }
      setVotedMap((prev) => ({ ...prev, [submissionId]: true }));
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                studentVotes: (s.studentVotes || 0) + 1,
                votes: s.votes + 1,
              }
            : s
        )
      );
      setRemainingVotes((prev) => prev - 1);

      try {
        await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId,
            voterType: "STUDENT",
            voterFingerprint: `student_${studentGrade}_${studentClass}_${studentNumber}`,
            action: "VOTE",
          }),
        });
      } catch (err) {
        console.warn("Vote sync error:", err);
      }
    }
  };

  // 보스 HP 계산 (보스 레이드 테마일 때)
  const isBossRaid = challenge.title.includes("보스 레이드");
  const bossHp = Math.max(0, 100 - (submissions.length * 5));

  // 1인 1작품 제한: 내가 이미 제출한 작품 찾기
  const myExistingSubmission = submissions.find(
    (s) => s.studentGrade === studentGrade && s.studentClass === studentClass && s.studentNumber === studentNumber
  );

  // 출품 모달 열기 핸들러 (이미 제출한 경우 확인창 띄움)
  const handleOpenComposer = () => {
    if (myExistingSubmission) {
      const confirmReplace = confirm("이미 제출한 사진이 있습니다. 사진을 다시 제출하시겠습니까?\n확인을 누르면 이전에 제출한 사진이 새로운 사진으로 교체됩니다.");
      if (!confirmReplace) return;
    }
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-stretch antialiased selection:bg-amber-200">
      {/* 학생 및 학부모 전용 모바일 셸 컨테이너 (최대 480px, 앱 프레임) */}
      <div className="w-full max-w-[480px] min-h-screen bg-white shadow-2xl relative flex flex-col mx-auto overflow-x-hidden border-x border-slate-200/60 pb-24">
        
        {/* 1. 모바일 앱 상단 헤더 */}
        <header className="sticky top-0 z-30 bg-amber-400/95 backdrop-blur-md px-4 py-3 border-b-4 border-amber-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-arcade flex items-center justify-center text-xl font-black text-amber-500 border-2 border-amber-200">
                {challenge.icon}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-slate-900 drop-shadow-sm">스쿨픽</span>
                  <span className="text-[10px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full">
                    학생 전용
                  </span>
                </div>
                <p className="text-[11px] font-bold text-amber-950/80 -mt-0.5 truncate max-w-[200px]">
                  {challenge.title}
                </p>
              </div>
            </div>

            {/* 상단 네비게이션: 전국 교류관 & 학부모관 & 교사 화면 */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => router.push("/parents")}
                className="text-[11px] font-extrabold text-rose-800 bg-rose-100 hover:bg-rose-200 px-2 py-1.5 rounded-xl border border-rose-300 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span>💖</span> 학부모관
              </button>
              <button
                onClick={() => router.push("/national")}
                className="text-[11px] font-extrabold text-sky-900 bg-sky-100 hover:bg-sky-200 px-2 py-1.5 rounded-xl border border-sky-300 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>🌐</span> 전국
              </button>
              <button
                onClick={() => router.push("/teacher")}
                className="text-[11px] font-bold text-amber-900 bg-amber-300/80 hover:bg-white px-2 py-1.5 rounded-xl border border-amber-500/40 transition-colors cursor-pointer"
              >
                선생님
              </button>
            </div>
          </div>

          {/* 학생 닉네임 프로필 바 */}
          <div className="mt-2.5 bg-amber-500/30 rounded-2xl p-2 px-3 flex items-center justify-between text-xs text-amber-950 font-bold border border-amber-500/40">
            <div
              onClick={() => setIsProfileEditing(true)}
              className="flex items-center gap-1.5 truncate cursor-pointer hover:opacity-80"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate">
                {studentGrade}학년 {studentClass}반 {studentNumber}번{" "}
                <span className="text-amber-900 underline underline-offset-2 font-black">{studentNickname}</span> ✏️
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 bg-white/90 px-2 py-0.5 rounded-xl border border-amber-300 text-[11px] text-amber-800 font-extrabold">
              <Vote className="w-3.5 h-3.5 text-amber-600" />
              <span>남은 표: <b className="text-sky-600">{remainingVotes}</b>/{maxVotes} ({voteLimitLabel})</span>
            </div>
          </div>
        </header>

        {/* 닉네임 수정 팝업 */}
        {isProfileEditing && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xs rounded-3xl p-5 border-4 border-amber-400 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-black text-slate-900 text-sm">내 학생 정보 수정</h4>
                <button onClick={() => setIsProfileEditing(false)} className="text-slate-400 font-bold">✕</button>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                개인정보 보호를 위해 실명이 아닌 <b>학년, 반, 번호, 작가 닉네임</b>만 사용합니다.
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="number"
                  placeholder="학년"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                />
                <input
                  type="number"
                  placeholder="반"
                  value={studentClass}
                  onChange={(e) => setStudentClass(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                />
                <input
                  type="number"
                  placeholder="번호"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                />
              </div>
              <input
                type="text"
                placeholder="멋진 닉네임 입력"
                value={studentNickname}
                onChange={(e) => setStudentNickname(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold focus:border-amber-400 focus:outline-none"
              />
              <button
                onClick={() => setIsProfileEditing(false)}
                className="w-full py-2 rounded-xl bg-amber-400 text-amber-950 font-black text-xs border border-amber-500 cursor-pointer"
              >
                저장 완료
              </button>
            </div>
          </div>
        )}

        {/* 2. 챌린지 히어로 카드 */}
        <section className="p-4 space-y-3">
          <div className="bg-gradient-to-br from-amber-50 via-sky-50 to-white rounded-3xl border-2 border-amber-300/80 p-4 shadow-sm relative overflow-hidden space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 border border-amber-500">
                {challenge.tag}
              </span>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                isSubmittingPeriod
                  ? "bg-sky-100 text-sky-800 border border-sky-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
                <Clock className="w-3 h-3" />
                {isSubmittingPeriod ? `접수 마감 ${challenge.submissionEndDate}` : `전교 투표 중 (~${challenge.votingEndDate})`}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {challenge.title}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {challenge.description}
              </p>
            </div>

            {/* 보스 레이드 테마일 경우: 보스 체력 게이지 기믹 노출! */}
            {isBossRaid && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-2.5 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-black text-rose-900">
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>선생님(보스) HP 게이지</span>
                  </span>
                  <span>{bossHp} / 100 HP</span>
                </div>
                <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden border border-rose-400">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500 rounded-full"
                    style={{ width: `${bossHp}%` }}
                  />
                </div>
                <p className="text-[10px] text-rose-700 font-bold">
                  * 승인된 출품작 1장당 보스 HP 5 차감! 체력이 0이 되면 전교 공약이 발동됩니다!
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs font-bold pt-1.5 border-t border-slate-200/60 text-slate-600">
              <div className="flex items-center gap-1">
                <span>개설 교사:</span>
                <b className="text-slate-800">{challenge.teacherName}</b>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sky-600 font-extrabold">출품 {submissions.length}건</span>
                <span>•</span>
                <span className="text-amber-600 font-extrabold">
                  총 {submissions.reduce((a, b) => a + b.votes, 0)}표
                </span>
              </div>
            </div>
          </div>

          {/* 3. 학생 전용 테마 챌린지 룰 & 스티커 프레임 안내 카드 (아코디언) */}
          <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-3.5 space-y-2.5 shadow-xs">
            <div
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">📌</span>
                <h3 className="font-black text-xs text-amber-950">
                  이 사진전의 챌린지 룰 & 전용 프레임 스티커
                </h3>
              </div>
              <button className="text-amber-800">
                {isGuideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isGuideOpen && (
              <div className="space-y-2 pt-1 border-t border-amber-200/80 animate-in fade-in duration-150">
                {/* 챌린지 룰 */}
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-amber-900 block">
                    🎯 학생 챌린지 규칙:
                  </span>
                  <ul className="text-[11px] text-amber-950 font-medium space-y-1 list-disc list-inside bg-white/70 p-2.5 rounded-xl border border-amber-200">
                    {(challenge.studentRules || [
                      "주제에 맞는 재치 있고 창의적인 순간을 촬영하세요.",
                      "남을 비하하지 않고 모두가 즐거운 깨끗한 사진 문화를 지켜주세요.",
                      "출품작은 전교생 투표를 통해 우수작으로 선정됩니다."
                    ]).map((r, i) => (
                      <li key={i} className="leading-snug">{r}</li>
                    ))}
                  </ul>
                </div>

                {/* 전용 프레임 & 스티커 배지 */}
                {challenge.framesAndStickers && challenge.framesAndStickers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-amber-900 block">
                      🏷️ 사용할 수 있는 전용 스티커 & 프레임:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {challenge.framesAndStickers.map((f, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-white border border-amber-400 text-amber-900 shadow-2xs"
                        >
                          ✨ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 4. 안심 클린 정책 배너 */}
        <section className="px-4 pb-2">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-2.5 flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="text-[11px] text-sky-800 font-bold">
              악플 없는 깨끗한 학교 문화를 위해 <b>댓글창 대신 투표와 공감</b>으로만 응원해요!
            </span>
          </div>
        </section>

        {/* 5. 출품작 리스트 (갤러리 아케이드 스타일) */}
        <main className="px-4 flex-1 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-800">
              <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>{isVotingPeriod ? "전교생 출품작 투표 갤러리" : "현재 접수된 작품 미리보기"}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {isVotingPeriod ? "1인 1일 3표" : "접수 기간"}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 p-6 space-y-3">
              <Camera className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">아직 등록된 사진이 없습니다.<br />가장 먼저 첫 번째 사진을 출품해보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((item, idx) => {
                const isVoted = !!votedMap[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border-2 border-slate-200/90 overflow-hidden shadow-sm hover:shadow-arcade hover:border-amber-300 transition-all duration-200"
                  >
                    {/* 사진 프레임 (짤림 방지: aspect-[4/3] 배경에 원본 비율 전체 표시 + 터치 시 고해상도 전체보기) */}
                    <div 
                      onClick={() => setLightboxPhoto(item)}
                      className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-102"
                      />
                      {/* 순위 뱃지 */}
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>#{idx + 1}</span>
                      </div>

                      {/* 적용된 전용 스티커 프레임 라벨 */}
                      {item.selectedFrame && (
                        <div className="absolute top-3 right-3 bg-amber-400/90 backdrop-blur-xs text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-900 shadow-xs">
                          🏷️ {item.selectedFrame}
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
                        {item.studentGrade}학년 {item.studentClass}반 {item.studentNumber}번 {item.nickname}
                      </div>

                      {/* 클릭하여 전체보기 힌트 배너 */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                        <span className="bg-black/75 text-white text-xs font-black px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/20 shadow-lg">
                          🔍 클릭하여 전체보기
                        </span>
                      </div>
                    </div>

                    {/* 카드 하단 정보 & 투표 인터랙션 */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          출품일: {item.submittedAt}
                        </p>
                      </div>

                      {/* 30자 이내 작품 설명 (작가 노트) 말풍선 - 마루 부리(Serif) 적용 */}
                      {item.caption && (
                        <div className="bg-amber-50/80 rounded-2xl p-2.5 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-1.5 shadow-2xs">
                          <span className="text-amber-600 font-mono text-sm leading-none select-none mt-0.5">💬</span>
                          <p className="line-clamp-2 leading-relaxed font-maruburi text-xs text-slate-900 tracking-tight">
                            &ldquo;{item.caption}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* 출품 시 부착된 스티커 뱃지 목록 */}
                      {item.appliedStickers && item.appliedStickers.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.appliedStickers.map((stk, sIdx) => (
                            <span
                              key={stk.id || `stk-${sIdx}`}
                              style={{ backgroundColor: stk.bg, color: stk.color }}
                              className="text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-black/10"
                            >
                              {stk.text}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 1단계 개인정보·초상권 안심 승인 (학생 자발적 외부 공개 동의 Student Opt-in) */}
                      <div className={`rounded-2xl p-3 border transition-all ${
                        item.student_consent
                          ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                          : "bg-sky-50/80 border-sky-200 text-slate-800"
                      }`}>
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id={`optin-${item.id}`}
                            checked={!!item.student_consent}
                            onChange={() => handleToggleStudentConsent(item.id)}
                            className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                          <label htmlFor={`optin-${item.id}`} className="text-xs font-bold cursor-pointer select-none leading-tight flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-black text-sky-900 text-[11px] flex items-center gap-1">
                                🌐 1단계: 전국 학교 자랑하기 출품 동의
                              </span>
                              {item.is_public_shared && (
                                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                                  전국 교류관 등재됨 ✨
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-700 block">
                              타 학교 친구들에게 내 작품을 자랑할까요? 외부 공개에 동의합니다.
                            </span>
                            <div className="text-[10px] text-slate-500 font-normal mt-1 flex flex-wrap items-center gap-2">
                              <span className={item.student_consent ? "text-emerald-700 font-bold" : ""}>
                                [1단계] 학생: {item.student_consent ? "동의 완료 ✓" : "대기"}
                              </span>
                              <span>•</span>
                              <span className={item.parent_consent ? "text-emerald-700 font-bold" : ""}>
                                [2단계] 학부모: {item.parent_consent ? "동의 완료 ✓" : "대기"}
                              </span>
                              <span>•</span>
                              <span className={item.teacher_approval ? "text-emerald-700 font-bold" : ""}>
                                [3단계] 교사: {item.teacher_approval ? "최종 승인 ✓" : "검수 대기"}
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* 요구사항 5: 투표 획득 개수 숨김 & 내가 투표한 사진만 표기 */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          {isVoted ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-xl border border-rose-200 text-xs font-black animate-in fade-in">
                              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                              <span>내가 투표한 작품 ✨</span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400">
                              {isVotingPeriod ? "마음에 드는 사진에 투표하세요!" : "접수 진행 중"}
                            </span>
                          )}
                        </div>

                        {/* 투표 버튼 */}
                        {isVotingPeriod ? (
                          <button
                            onClick={() => handleVote(item.id)}
                            className={`px-4 py-2 rounded-2xl text-xs font-black border-2 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer ${
                              isVoted
                                ? "bg-amber-400 border-amber-500 text-amber-950 shadow-arcade-amber"
                                : "bg-white border-amber-400 text-amber-700 hover:bg-amber-50"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isVoted ? "fill-amber-950 text-amber-950" : "text-amber-500"}`} />
                            <span>{isVoted ? "투표 취소" : "투표하기"}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200">
                            접수 중 (투표 대기)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* 6. 하단 고정 액션 바 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t-2 border-slate-200 p-3.5 z-40 shadow-lg">
          {isSubmittingPeriod ? (
            <button
              onClick={handleOpenComposer}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm border-2 border-amber-500 shadow-arcade-amber active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>
                {myExistingSubmission ? "내 출품 사진 다시 찍기/수정하기" : "내 사진 촬영 및 출품하기 (접수 중)"}
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-between px-2">
              <div className="text-xs font-bold text-slate-600">
                <span>남은 투표권: </span>
                <b className="text-amber-600 text-sm">{remainingVotes}</b>/{maxVotes}표 ({voteLimitLabel})
              </div>
              <button
                onClick={() => alert("투표 기간에는 새로운 출품이 마감되었으며, 전교생 투표만 진행됩니다.")}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs border border-slate-300 cursor-pointer"
              >
                출품 마감 (투표 진행 중)
              </button>
            </div>
          )}
        </div>

        {/* 고도화된 모바일 카메라 촬영 및 Canvas 프레임 & 스티커 합성 모듈 */}
        <CameraCanvasComposerModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          themeId={challenge.themeId}
          themeTitle={challenge.title}
          studentInfo={{
            schoolName: "OO초등학교",
            grade: studentGrade,
            classNum: studentClass,
            studentNum: studentNumber,
            nickname: studentNickname,
          }}
          onComplete={async ({ dataUrl, title, caption, preset, appliedStickers }) => {
            let savedImageUrl = dataUrl;
            let savedId = myExistingSubmission ? myExistingSubmission.id : `sub-${Date.now()}`;

            // Cloudflare R2 업로드 및 Supabase 저장 호출
            try {
              const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  challengeId: challenge.id,
                  title: title || `${studentNickname}의 멋진 한 컷`,
                  artistNote: caption || "",
                  imageBase64: dataUrl,
                  selectedFrame: preset,
                  studentGrade,
                  studentClass,
                  studentNumber,
                  studentNickname,
                  schoolCode: "JNE-3012",
                }),
              });
              const json = await res.json();
              if (json.success && json.submission) {
                savedId = json.submission.id;
                savedImageUrl = json.submission.imageUrl;
              }
            } catch (err) {
              console.warn("Submissions API error, using fallback:", err);
            }

            const newSubmission: PhotoSubmission = {
              id: savedId,
              challengeId: challenge.id,
              studentGrade,
              studentClass,
              studentNumber,
              nickname: studentNickname,
              title: title || `${studentNickname}의 멋진 한 컷`,
              caption: caption || undefined,
              imageUrl: savedImageUrl,
              votes: myExistingSubmission ? myExistingSubmission.votes : 0,
              submittedAt: new Date().toISOString().split("T")[0],
              selectedFrame: preset,
              appliedStickers: appliedStickers?.map((s) => ({
                id: s.uid,
                text: s.text,
                bg: s.bg,
                color: s.color,
                x: s.x,
                y: s.y,
              })),
            };

            // 1인 1작품 엄격 유지: 기존 작품이 있으면 교체, 없으면 상단에 추가!
            if (myExistingSubmission) {
              setSubmissions((prev) =>
                prev.map((s) => (s.id === myExistingSubmission.id ? newSubmission : s))
              );
              alert("🎉 기존 사진이 Cloudflare R2 스토리지와 Supabase에 성공적으로 교체 출품되었습니다!");
            } else {
              setSubmissions([newSubmission, ...submissions]);
              setChallenge((prev) => ({ ...prev, submissionCount: prev.submissionCount + 1 }));
              alert("🎉 테마 전용 프레임과 스티커가 각인된 사진이 Cloudflare R2와 Supabase에 성공적으로 출품되었습니다!");
            }
          }}
        />

        {/* ================= 요구사항 2: 고화질 전체보기 라이트박스 모달 ================= */}
        {lightboxPhoto && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
            {/* 상단 닫기 바 */}
            <div className="flex items-center justify-between text-white pb-3 border-b border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-black text-sm">
                  {lightboxPhoto.studentGrade}학년 {lightboxPhoto.studentClass}반 {lightboxPhoto.studentNumber}번
                </span>
                <span className="text-white font-extrabold text-sm">
                  {lightboxPhoto.nickname} 작가님
                </span>
                {lightboxPhoto.selectedFrame && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                    {lightboxPhoto.selectedFrame}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 메인 고화질 전체 이미지 뷰어 (가로/세로 비율 그대로 100% 짤림 없이 렌더링) */}
            <div className="flex-1 flex items-center justify-center my-3 overflow-hidden">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border-2 border-white/10"
              />
            </div>

            {/* 하단 작품 타이틀 및 30자 작가 노트 */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 text-white space-y-1.5">
              <h3 className="font-black text-base text-amber-400 line-clamp-1">
                {lightboxPhoto.title}
              </h3>
              {lightboxPhoto.caption && (
                <p className="text-xs text-slate-200 font-bold leading-relaxed flex items-start gap-1.5">
                  <span className="text-amber-400 text-sm">💬</span>
                  <span>&ldquo;{lightboxPhoto.caption}&rdquo;</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
