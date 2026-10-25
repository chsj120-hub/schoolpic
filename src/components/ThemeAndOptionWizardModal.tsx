"use client";

import { useState, useEffect } from "react";
import { CULTURE_THEMES, SUBJECT_THEMES } from "@/lib/constants";
import { Challenge, ThemeMode, ThemeTemplate } from "@/types";
import { DraftModal } from "@/components/DraftModal";
import { 
  Sparkles, 
  BookOpen, 
  X, 
  Calendar, 
  Vote, 
  FileText, 
  PartyPopper, 
  Mail, 
  Check, 
  Users, 
  Award, 
  Clock,
  ArrowLeft,
  Download,
  Info,
  Copy,
  CheckCircle2,
  HelpCircle,
  Flame,
  Tag
} from "lucide-react";

interface ThemeAndOptionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newChallenge: Challenge) => void;
  onOpenFeedback: () => void;
  schoolName?: string;
  teacherName?: string;
}

// 오늘 날짜 기준 기본 일정 자동 계산 (접수: 오늘~7일후, 투표: 8일후~11일후)
function getTodayDefaultDates() {
  const now = new Date();
  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const subStart = new Date(now);
  const subEnd = new Date(now);
  subEnd.setDate(now.getDate() + 7);

  const voteStart = new Date(now);
  voteStart.setDate(now.getDate() + 8);
  const voteEnd = new Date(now);
  voteEnd.setDate(now.getDate() + 11);

  return {
    subStart: format(subStart),
    subEnd: format(subEnd),
    voteStart: format(voteStart),
    voteEnd: format(voteEnd),
  };
}

export default function ThemeAndOptionWizardModal({
  isOpen,
  onClose,
  onCreate,
  onOpenFeedback,
  schoolName = "우리초등학교",
  teacherName = "선생님",
}: ThemeAndOptionWizardModalProps) {
  // step 1: 테마 선택 & 교사용 상세 설명, step 2: 행정 옵션 설정
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 상태
  const [activeTab, setActiveTab] = useState<ThemeMode>("culture");
  const [selectedTheme, setSelectedTheme] = useState<ThemeTemplate>(CULTURE_THEMES[0]);
  const [copiedTip, setCopiedTip] = useState(false);

  // Step 2 상태
  const [voteMethod, setVoteMethod] = useState<"DAILY_3" | "TOTAL_3" | "ONE_1">("TOTAL_3");
  const [enableStudentVote, setEnableStudentVote] = useState(true);
  const [enableTeacherVote, setEnableTeacherVote] = useState(true);
  const [enableParentVote, setEnableParentVote] = useState(false);
  const [showGradeClassOnFrame, setShowGradeClassOnFrame] = useState(false); // 띠지 학년반번호 노출 여부 (기본: 비공개)
  
  // 날짜/시간 선택 상태 (기본값: 오늘 날짜 기준 자동 최신화)
  const initialDates = getTodayDefaultDates();
  const [submissionStartDate, setSubmissionStartDate] = useState(initialDates.subStart);
  const [submissionStartTime, setSubmissionStartTime] = useState("09:00");
  const [submissionEndDate, setSubmissionEndDate] = useState(initialDates.subEnd);
  const [submissionEndTime, setSubmissionEndTime] = useState("16:00");

  const [votingStartDate, setVotingStartDate] = useState(initialDates.voteStart);
  const [votingStartTime, setVotingStartTime] = useState("09:00");
  const [votingEndDate, setVotingEndDate] = useState(initialDates.voteEnd);
  const [votingEndTime, setVotingEndTime] = useState("17:00");

  const [purgeOption, setPurgeOption] = useState("결과 발표 종료 [ 7일 후 ]");
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // 모달이 열릴 때마다 접수 및 투표 기간을 오늘 날짜 기준으로 최신화
  useEffect(() => {
    if (isOpen) {
      const dates = getTodayDefaultDates();
      setSubmissionStartDate(dates.subStart);
      setSubmissionEndDate(dates.subEnd);
      setVotingStartDate(dates.voteStart);
      setVotingEndDate(dates.voteEnd);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentThemeList = activeTab === "culture" ? CULTURE_THEMES : SUBJECT_THEMES;

  const handleSelectTheme = (theme: ThemeTemplate) => {
    setSelectedTheme(theme);
  };

  const handleProceedToStep2 = () => {
    setStep(2);
  };

  const handleCopyTips = () => {
    navigator.clipboard.writeText(selectedTheme.teacherTips);
    setCopiedTip(true);
    setTimeout(() => setCopiedTip(false), 2000);
  };

  const handleComplete = async () => {
    // 테마 ID 기반의 직관적인 ID 우선 적용 (예: culture-10)
    const challengeId = selectedTheme.id;
    const newChallenge: Challenge = {
      id: challengeId,
      title: `${selectedTheme.title} (${selectedTheme.tag})`,
      themeId: selectedTheme.id,
      mode: activeTab,
      icon: selectedTheme.icon,
      tag: selectedTheme.tag,
      description: selectedTheme.desc,
      category: selectedTheme.category,
      intent: selectedTheme.intent,
      studentRules: selectedTheme.studentRules,
      framesAndStickers: selectedTheme.framesAndStickers,
      teacherTips: selectedTheme.teacherTips,
      specialGimmick: selectedTheme.specialGimmick,
      targetGrade: "전교생",
      teacherName: teacherName || "선생님",
      status: "SUBMITTING",
      submissionStartDate,
      submissionStartTime,
      submissionEndDate,
      submissionEndTime,
      votingStartDate,
      votingStartTime,
      votingEndDate,
      votingEndTime,
      voteLimitType: voteMethod,
      isBlindSubmission: false,
      showGradeClassOnFrame,
      schoolName: schoolName || "광주한재초등학교",
      schoolCode: "JNE-3012",
      submissionCount: 0,
      totalVotes: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // 서버 API 동기화 (학생 및 학부모 기기에서 바로 접속 가능하도록 보존)
    try {
      await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge: newChallenge }),
      });
    } catch (e) {
      console.warn("Failed to POST challenge to /api/challenges:", e);
    }

    onCreate(newChallenge);
    setStep(1);
    onClose();
  };

  const handleDownloadHwp = () => {
    setIsDraftModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] border-[3px] border-slate-900 shadow-[0_16px_0_0_#1E293B] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* ================= STEP 1: 12종/6종 테마 선택 + 교사 상세 가이드 패널 ================= */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* 상단 닫기 & 캡슐 헤더 */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFC72C] border-[2.5px] border-slate-900 text-xs sm:text-sm font-black text-slate-950 shadow-[0_2px_0_0_#1E293B]">
                <span className="text-base font-bold">+</span>
                <span>[새 사진전 만들기]</span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border-[2.5px] border-slate-900 hover:bg-slate-100 flex items-center justify-center font-black text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            {/* 헤더 타이틀 */}
            <div className="text-center space-y-1 relative pt-1">
              <div className="absolute left-6 -top-1 text-amber-400 text-2xl select-none animate-bounce">⭐</div>
              <div className="absolute right-6 -top-1 text-sky-400 text-2xl select-none animate-pulse">☁️</div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                테마 카테고리를 선택하세요
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                카드를 클릭하면 <span className="text-sky-600 underline underline-offset-2">선생님 지도 팁, 생기부 문구, 학생 룰 및 전용 프레임</span>을 미리 확인할 수 있습니다.
              </p>
            </div>

            {/* 탭 전환 (창체 12종 / 교과 6종) */}
            <div className="flex justify-center pt-1">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border-[2.5px] border-slate-900 w-full max-w-lg">
                <button
                  onClick={() => {
                    setActiveTab("culture");
                    setSelectedTheme(CULTURE_THEMES[0]);
                  }}
                  className={`py-2 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "culture"
                      ? "bg-[#FFC72C] text-slate-950 shadow-[0_3px_0_0_#1E293B] border-[2px] border-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>☆ 학교 문화 & 창체 모드 (12종)</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("subject");
                    setSelectedTheme(SUBJECT_THEMES[0]);
                  }}
                  className={`py-2 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "subject"
                      ? "bg-[#38BDF8] text-white shadow-[0_3px_0_0_#1E293B] border-[2px] border-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>정규 교과 수업 모드 (6종)</span>
                </button>
              </div>
            </div>

            {/* 메인: 좌측 테마 카드 그리드(4열) + 우측 선생님 상세 설명 & 가이드 패널 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              
              {/* 좌측: 테마 카드 그리드 (7열 차지) */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {currentThemeList.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme)}
                      className={`p-3 rounded-2xl border-[2.5px] border-slate-900 text-center flex flex-col items-center justify-between gap-1 transition-all hover:scale-[1.03] cursor-pointer bg-white group min-h-[125px] ${
                        isSelected
                          ? "shadow-[0_6px_0_0_#F59E0B] ring-4 ring-amber-400 bg-amber-50/70"
                          : "shadow-[0_3px_0_0_#1E293B] hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">
                        {theme.icon}
                      </div>
                      <div className="font-black text-xs text-slate-900 line-clamp-1">
                        {theme.title}
                      </div>
                      <div className="text-[9px] font-bold text-slate-500 line-clamp-1">
                        {theme.tag}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 우측: 선택된 테마의 상세 설명 (선생님 가이드 & 생기부 팁) (5열 차지) */}
              <div className="lg:col-span-5 bg-[#FFFBEB] rounded-3xl border-[2.5px] border-slate-900 p-4 sm:p-5 shadow-[0_6px_0_0_#1E293B] flex flex-col justify-between space-y-4">
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                  
                  {/* 테마 헤더 */}
                  <div className="flex items-start gap-2.5 pb-2 border-b-2 border-amber-300">
                    <span className="text-3xl p-1.5 bg-white border-2 border-slate-900 rounded-2xl shadow-xs">
                      {selectedTheme.icon}
                    </span>
                    <div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
                        {selectedTheme.category}
                      </span>
                      <h3 className="font-black text-base text-slate-900 mt-0.5">
                        {selectedTheme.title}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-600 line-clamp-2">
                        {selectedTheme.desc}
                      </p>
                    </div>
                  </div>

                  {/* 1. 기획 의도 */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>기획 의도</span>
                    </h4>
                    <p className="text-[11px] text-slate-700 font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      {selectedTheme.intent}
                    </p>
                  </div>

                  {/* 시스템 기믹 (보스 레이드 등) */}
                  {selectedTheme.specialGimmick && (
                    <div className="bg-rose-50 border-2 border-rose-400 p-2.5 rounded-xl text-xs space-y-1">
                      <span className="font-black text-rose-900 flex items-center gap-1">
                        👾 전교 연동 시스템 기믹:
                      </span>
                      <p className="text-[11px] text-rose-800 font-bold leading-relaxed">
                        {selectedTheme.specialGimmick}
                      </p>
                    </div>
                  )}

                  {/* 2. 학생 챌린지 룰 */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-600" />
                      <span>학생 챌린지 룰 & 가이드</span>
                    </h4>
                    <ul className="text-[11px] text-slate-700 font-medium space-y-1 bg-white/80 p-2.5 rounded-xl border border-amber-200 list-disc list-inside">
                      {selectedTheme.studentRules.map((rule, idx) => (
                        <li key={idx} className="leading-snug">{rule}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. 전용 프레임 & 스티커 */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>전용 프레임 & 스티커 배지</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedTheme.framesAndStickers.map((frame, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-black px-2 py-0.5 bg-white border border-slate-900 rounded-lg shadow-2xs text-slate-800"
                        >
                          🏷️ {frame}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4. 교사 생기부/지도 팁 & 세특 기재 문구 */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <span>생기부/세특 기재 예시 문구</span>
                      </h4>
                      <button
                        onClick={handleCopyTips}
                        className="text-[10px] font-black text-amber-900 bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded-md border border-amber-400 flex items-center gap-1 transition-colors"
                      >
                        {copiedTip ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTip ? "복사됨!" : "문구 복사"}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-purple-950 font-semibold bg-purple-50/90 p-2.5 rounded-xl border border-purple-200 leading-relaxed italic">
                      "{selectedTheme.teacherTips}"
                    </p>
                  </div>

                </div>

                {/* 우측 하단: [이 테마로 개설하기] CTA 버튼 */}
                <button
                  onClick={handleProceedToStep2}
                  className="w-full py-3 px-4 rounded-2xl bg-[#FFC72C] hover:bg-[#FFBF1A] active:translate-y-0.5 text-slate-950 font-black text-xs sm:text-sm border-[2.5px] border-slate-900 shadow-[0_4px_0_0_#1E293B] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>✨ [ {selectedTheme.title} ] 로 개설 설정하기 (➔ 다음)</span>
                </button>
              </div>

            </div>

            {/* 하단 제안 배너 */}
            <div className="bg-[#EBF5FF] rounded-3xl border-[2.5px] border-slate-900 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_4px_0_0_#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 border-[2px] border-slate-900 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  💡
                </div>
                <div className="text-xs">
                  <p className="font-black text-slate-900 leading-snug">
                    우리 학교 맞춤 테마나<br />필요한 기능이 있으신가요?
                  </p>
                </div>
              </div>

              <div>
                <button
                  onClick={onOpenFeedback}
                  className="py-2.5 px-4 rounded-full bg-[#FF5733] hover:bg-[#E64A19] text-white font-black text-xs border-[2px] border-slate-900 shadow-[0_3px_0_0_#1E293B] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>[ ✉️ 개발자에게 새 테마 제안 / 기능 요청하기 ]</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= STEP 2: 새 사진전 개설 & 행정 옵션 설정 ================= */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* 상단 네비 & 닫기 */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border-[2px] border-slate-900 text-xs font-black text-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>테마 다시 고르기</span>
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border-[2.5px] border-slate-900 hover:bg-slate-100 flex items-center justify-center font-black text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            {/* 헤더 타이틀 */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                <span>🏫 [스쿨픽] 새 사진전 개설 & 행정 옵션 설정 ✨</span>
              </h2>
              <p className="text-sm font-bold text-amber-800">
                선택된 테마: <b>{selectedTheme.icon} {selectedTheme.title}</b> ({selectedTheme.tag})
              </p>
            </div>

            {/* 설정 섹션 1: 투표 방식 설정 */}
            <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-5 space-y-3 shadow-[0_4px_0_0_#1E293B]">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-sky-500 rounded-xs" />
                1. 투표 방식 설정
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className={`p-3.5 rounded-2xl border-[2px] flex items-center gap-2.5 cursor-pointer transition-all ${
                  voteMethod === "DAILY_3" ? "border-slate-900 bg-amber-50 shadow-xs ring-2 ring-amber-300" : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="voteMethod"
                    checked={voteMethod === "DAILY_3"}
                    onChange={() => setVoteMethod("DAILY_3")}
                    className="w-4 h-4 text-sky-600"
                  />
                  <div className="text-xs font-black text-slate-900">
                    1일 3표<br /><span className="text-[10px] text-slate-500 font-medium">(매일 접속 유도형)</span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-2xl border-[2px] flex items-center gap-2.5 cursor-pointer transition-all ${
                  voteMethod === "TOTAL_3" ? "border-slate-900 bg-amber-50 shadow-xs ring-2 ring-amber-300" : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="voteMethod"
                    checked={voteMethod === "TOTAL_3"}
                    onChange={() => setVoteMethod("TOTAL_3")}
                    className="w-4 h-4 text-sky-600"
                  />
                  <div className="text-xs font-black text-slate-900">
                    기간 내 총 3표<br /><span className="text-[10px] text-slate-500 font-medium">(신중 투표형, 몰아주기 방지)</span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-2xl border-[2px] flex items-center gap-2.5 cursor-pointer transition-all ${
                  voteMethod === "ONE_1" ? "border-slate-900 bg-amber-50 shadow-xs ring-2 ring-amber-300" : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="voteMethod"
                    checked={voteMethod === "ONE_1"}
                    onChange={() => setVoteMethod("ONE_1")}
                    className="w-4 h-4 text-sky-600"
                  />
                  <div className="text-xs font-black text-slate-900">
                    1인 1표<br /><span className="text-[10px] text-slate-500 font-medium">(단판 승부형)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 설정 섹션 2: 참여 및 공개 채널 제어 */}
            <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-5 space-y-3 shadow-[0_4px_0_0_#1E293B]">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-sky-500 rounded-xs" />
                2. 참여 및 공개 채널 제어
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableStudentVote}
                    onChange={(e) => setEnableStudentVote(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 border-slate-400"
                  />
                  <span className="font-black text-slate-900">학생 투표 활성화</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableTeacherVote}
                    onChange={(e) => setEnableTeacherVote(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 border-slate-400"
                  />
                  <span className="font-black text-slate-900">
                    교직원 투표 활성화 <span className="text-amber-600 font-bold">(☆ 교직원 특별상 / 교장선생님 픽 분리 집계)</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableParentVote}
                    onChange={(e) => setEnableParentVote(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 border-slate-400"
                  />
                  <span className="font-black text-slate-700 flex flex-wrap items-center gap-1">
                    <span>학부모 공개 및 투표 열기 🔒</span>
                    <span className="text-[11px] text-slate-400 font-normal">(감상 전용 갤러리만 오픈 / 초상권 민원 최소화)</span>
                  </span>
                </label>

                {/* 띠지/프레임 학년·반·번호 노출 여부 선택 */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGradeClassOnFrame}
                      onChange={(e) => setShowGradeClassOnFrame(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 border-slate-400 mt-0.5"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        사진 프레임(띠지)에 학년·반·번호 표시하기
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {showGradeClassOnFrame
                          ? "✅ [공개]: 프레임 띠지에 '5학년 2반 14번 5반 날다람쥐 작가님'으로 모두 표시됩니다."
                          : "🔒 [비공개 (추천 기본값)]: 프레임 띠지에서 학년·반·번호가 숨겨지고 '5반 날다람쥐 작가님' 닉네임만 표시됩니다."}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 설정 섹션 3: 일정 타임라인 */}
            <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-5 space-y-3 shadow-[0_4px_0_0_#1E293B]">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-sky-500 rounded-xs" />
                3. 일정 타임라인
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                {/* 사진 접수 일정 선택 (실제 날짜/시간 선택 지원) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="font-black text-slate-800 flex items-center gap-1.5 shrink-0">
                    📅 사진 접수 기간:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-700">
                    <input
                      type="date"
                      value={submissionStartDate}
                      onChange={(e) => setSubmissionStartDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-amber-300"
                    />
                    <input
                      type="time"
                      value={submissionStartTime}
                      onChange={(e) => setSubmissionStartTime(e.target.value)}
                      className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                    />
                    <span className="text-slate-400 font-black">~</span>
                    <input
                      type="date"
                      value={submissionEndDate}
                      onChange={(e) => setSubmissionEndDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-amber-300"
                    />
                    <input
                      type="time"
                      value={submissionEndTime}
                      onChange={(e) => setSubmissionEndTime(e.target.value)}
                      className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                    />
                  </div>
                </div>

                {/* 전교 투표 일정 선택 (실제 날짜/시간 선택 지원) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="font-black text-slate-800 flex items-center gap-1.5 shrink-0">
                    🗳️ 전교 투표 기간:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-700">
                    <input
                      type="date"
                      value={votingStartDate}
                      onChange={(e) => setVotingStartDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-sky-300"
                    />
                    <input
                      type="time"
                      value={votingStartTime}
                      onChange={(e) => setVotingStartTime(e.target.value)}
                      className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                    />
                    <span className="text-slate-400 font-black">~</span>
                    <input
                      type="date"
                      value={votingEndDate}
                      onChange={(e) => setVotingEndDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-sky-300"
                    />
                    <input
                      type="time"
                      value={votingEndTime}
                      onChange={(e) => setVotingEndTime(e.target.value)}
                      className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                    />
                  </div>
                </div>

                {/* 자동 영구 삭제 */}
                <div className="flex items-center justify-between bg-rose-50/60 p-3 rounded-2xl border border-rose-200">
                  <span className="font-bold text-rose-900 flex items-center gap-1.5">
                    🗑️ - 자동 영구 삭제:
                  </span>
                  <select
                    value={purgeOption}
                    onChange={(e) => setPurgeOption(e.target.value)}
                    className="bg-white px-3.5 py-1.5 rounded-xl border border-rose-300 text-xs font-black text-rose-900 focus:outline-none"
                  >
                    <option>결과 발표 종료 [ 7일 후 ]</option>
                    <option>결과 발표 종료 [ 14일 후 ]</option>
                    <option>결과 발표 종료 [ 즉시 파기 ]</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 하단 액션 버튼 바 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadHwp}
                className="py-3.5 px-4 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-xs sm:text-sm border-[2.5px] border-slate-900 shadow-[0_4px_0_0_#1E293B] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>사전 내부결재 기안문 예시 다운로드 (HWP)</span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="py-3.5 px-4 rounded-2xl bg-[#FFC72C] hover:bg-[#FFBF1A] text-slate-950 font-black text-sm sm:text-base border-[2.5px] border-slate-900 shadow-[0_4px_0_0_#1E293B] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PartyPopper className="w-5 h-5" />
                <span>✧ 사진전 개설 완료 ✧</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 기안문 표준 HWPX 다운로드 & K-에듀파인 원클릭 복사 모달 */}
      <DraftModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        params={{
          title: selectedTheme.title,
          themeName: selectedTheme.title,
          intent: selectedTheme.intent,
          targetGrade: "전교생 (1~6학년)",
          submissionStartDate,
          submissionStartTime,
          submissionEndDate,
          submissionEndTime,
          votingStartDate,
          votingStartTime,
          votingEndDate,
          votingEndTime,
          submissionRange: `${submissionStartDate} ${submissionStartTime} ~ ${submissionEndDate} ${submissionEndTime}`,
          votingRange: `${votingStartDate} ${votingStartTime} ~ ${votingEndDate} ${votingEndTime}`,
          teacherTips: selectedTheme.teacherTips,
          schoolName: schoolName,
        }}
      />
    </div>
  );
}
