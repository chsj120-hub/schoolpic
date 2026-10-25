"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { INITIAL_CHALLENGES, SAMPLE_SUBMISSIONS } from "@/lib/constants";
import { Challenge, PhotoSubmission } from "@/types";
import { findStudent, resetStudentPin } from "@/lib/studentStorage";
import QRCodeModal from "@/components/QRCodeModal";
import SchoolPosterModal from "@/components/SchoolPosterModal";
import ThemeAndOptionWizardModal from "@/components/ThemeAndOptionWizardModal";
import TeacherFeedbackWidget from "@/components/TeacherFeedbackWidget";
import TeacherPresentationModal from "@/components/TeacherPresentationModal";
import { TeacherUserGuideModal } from "@/components/TeacherUserGuideModal";
import { Footer } from "@/components/Footer";
import { downloadSubmissionsZip } from "@/lib/zipBackupGenerator";
import { generateHwpxDraft } from "@/lib/hwpxGenerator";
import {
  School,
  Sparkles,
  Rocket,
  Palette,
  Vote,
  FileCheck2,
  Printer,
  Table,
  CheckCircle,
  BookOpen,
  Clock,
  QrCode,
  ExternalLink,
  ShieldAlert,
  LogOut,
  Settings,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  Flame,
  Bus,
  Calendar,
  Download,
  AlertTriangle,
  Lock,
  Unlock,
  Trash2,
  KeyRound,
  RotateCcw,
  Check,
  Eye,
  MonitorPlay,
  FileSpreadsheet,
  FileArchive,
  Megaphone,
  UserCheck,
  Globe,
  PlusCircle,
  Gift,
  CheckCheck,
  ShieldCheck,
  Heart,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";

export default function TeacherAdminPage() {
  const router = useRouter();

  // 로그인/가입된 교사 및 학교 정보 연동 (다중 교사 시스템)
  const [schoolName, setSchoolName] = useState("한재초등학교");
  const [schoolCode, setSchoolCode] = useState("JNE-3012");
  const [teacherName, setTeacherName] = useState("김선생님");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("schoolpick_teacher");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.schoolName) setSchoolName(parsed.schoolName);
          if (parsed.schoolCode) setSchoolCode(parsed.schoolCode);
          if (parsed.name) setTeacherName(parsed.name);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // 4대 네비게이션 탭 상태
  const [activeNav, setActiveNav] = useState<"dashboard" | "create" | "review" | "export">("dashboard");

  // 운영 중인 사진전 목록
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  // 현재 선택되어 관리 중인 사진전 ID
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(INITIAL_CHALLENGES[0].id);
  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  // 접수된 출품작 검수 목록
  const [submissions, setSubmissions] = useState<Array<PhotoSubmission & { isInternalApproved: boolean; isExternalApproved: boolean }>>(() => {
    return SAMPLE_SUBMISSIONS.map((sub, idx) => ({
      ...sub,
      isInternalApproved: true,
      isExternalApproved: idx === 0,
      student_consent: sub.student_consent ?? (idx < 2),
      parent_consent: sub.parent_consent ?? (idx === 0),
      teacher_approval: sub.teacher_approval ?? (idx === 0),
      is_public_shared: sub.is_public_shared ?? (idx === 0),
    }));
  });

  // 모달 상태
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [selectedChallengeForQR, setSelectedChallengeForQR] = useState<Challenge | null>(null);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // [디자인 원칙 2: 점진적 공개(Progressive Disclosure)] 보조 안내 및 PIN 초기화 도구 아코디언 상태
  const [isPipelineGuideOpen, setIsPipelineGuideOpen] = useState(false);
  const [isPinResetOpen, setIsPinResetOpen] = useState(false);

  // [디자인 원칙 3: 시스템 상태 가시성(Toast Notification)] 비차단형 토스트 알림 상태
  const [toast, setToast] = useState<{
    title: string;
    subtitle?: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  const showToast = (
    title: string,
    subtitle?: string,
    type: "success" | "info" | "warning" = "success"
  ) => {
    setToast({ title, subtitle, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 특별상 수여 모달 상태
  const [isSpecialAwardModalOpen, setIsSpecialAwardModalOpen] = useState(false);
  const [awardTargetSubmissionId, setAwardTargetSubmissionId] = useState<string>(SAMPLE_SUBMISSIONS[0].id);
  const [specialAwardTitle, setSpecialAwardTitle] = useState("💡 싱크로율 대폭발 아이디어 특별상");
  const [specialAwardReason, setSpecialAwardReason] = useState("일상 사물의 조형적 특징을 예리하게 관찰하여 독창적인 시각 표현을 완성하고 학급에 큰 웃음을 선사함.");

  // ============================================================================
  // 이벤트 타임라인 및 데이터 보관 설정 상태 (실제 날짜/시간 선택 지원)
  // ============================================================================
  const [submissionStartDate, setSubmissionStartDate] = useState(INITIAL_CHALLENGES[0].submissionStartDate || "2026-11-02");
  const [submissionStartTime, setSubmissionStartTime] = useState(INITIAL_CHALLENGES[0].submissionStartTime || "09:00");
  const [submissionEndDate, setSubmissionEndDate] = useState(INITIAL_CHALLENGES[0].submissionEndDate || "2026-11-06");
  const [submissionEndTime, setSubmissionEndTime] = useState(INITIAL_CHALLENGES[0].submissionEndTime || "16:00");

  const [votingStartDate, setVotingStartDate] = useState(INITIAL_CHALLENGES[0].votingStartDate || "2026-11-09");
  const [votingStartTime, setVotingStartTime] = useState(INITIAL_CHALLENGES[0].votingStartTime || "09:00");
  const [votingEndDate, setVotingEndDate] = useState(INITIAL_CHALLENGES[0].votingEndDate || "2026-11-11");
  const [votingEndTime, setVotingEndTime] = useState(INITIAL_CHALLENGES[0].votingEndTime || "18:00");

  const [resultStartDate, setResultStartDate] = useState("2026-11-12");
  const [resultStartTime, setResultStartTime] = useState("09:00");
  const [resultEndDate, setResultEndDate] = useState("2026-11-18");
  const [resultEndTime, setResultEndTime] = useState("23:59");

  // 사진전 선택 드롭다운 변경 시 해당 사진전의 날짜/시간으로 즉시 동기화
  useEffect(() => {
    if (currentChallenge) {
      if (currentChallenge.submissionStartDate) setSubmissionStartDate(currentChallenge.submissionStartDate);
      if (currentChallenge.submissionStartTime) setSubmissionStartTime(currentChallenge.submissionStartTime);
      if (currentChallenge.submissionEndDate) setSubmissionEndDate(currentChallenge.submissionEndDate);
      if (currentChallenge.submissionEndTime) setSubmissionEndTime(currentChallenge.submissionEndTime);
      if (currentChallenge.votingStartDate) setVotingStartDate(currentChallenge.votingStartDate);
      if (currentChallenge.votingStartTime) setVotingStartTime(currentChallenge.votingStartTime);
      if (currentChallenge.votingEndDate) setVotingEndDate(currentChallenge.votingEndDate);
      if (currentChallenge.votingEndTime) setVotingEndTime(currentChallenge.votingEndTime);
    }
  }, [selectedChallengeId]);

  // 대시보드에서 날짜 및 시간 변경 저장 핸들러 (요청: 대시보드에서 선택해서 변경 가능하도록 기능 구현)
  const handleSaveTimelineDates = () => {
    setChallenges((prev) =>
      prev.map((ch) =>
        ch.id === selectedChallengeId
          ? {
              ...ch,
              submissionStartDate,
              submissionStartTime,
              submissionEndDate,
              submissionEndTime,
              votingStartDate,
              votingStartTime,
              votingEndDate,
              votingEndTime,
            }
          : ch
      )
    );
    showToast(
      `💾 타임라인 일정 변경 완료 (${currentChallenge.title})`,
      `접수: ${submissionStartDate} ${submissionStartTime}~${submissionEndDate} ${submissionEndTime} | 투표: ${votingStartDate}~${votingEndDate}`,
      "success"
    );
  };

  // 교직원 투표 상태 및 핸들러 (요청: 교직원 또한 갤러리 검수 승인시 교직원 투표 기능 구현)
  const [teacherVotedMap, setTeacherVotedMap] = useState<Record<string, boolean>>({});

  const handleTeacherVote = (submissionId: string) => {
    const isAlreadyVoted = !!teacherVotedMap[submissionId];
    if (isAlreadyVoted) {
      setTeacherVotedMap((prev) => ({ ...prev, [submissionId]: false }));
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                teacherVotes: Math.max(0, (s.teacherVotes || 0) - 1),
                votes: Math.max(0, s.votes - 1),
              }
            : s
        )
      );
      showToast("👨‍🏫 교직원 추천 투표가 취소되었습니다.", "교직원 투표 집계에서 -1표 반영되었습니다.", "info");
    } else {
      setTeacherVotedMap((prev) => ({ ...prev, [submissionId]: true }));
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                teacherVotes: (s.teacherVotes || 0) + 1,
                votes: s.votes + 1,
              }
            : s
        )
      );
      showToast("👨‍🏫 교직원 추천 투표 완료 (+1표)", "교직원 특별 추천 표가 집계에 분리 반영되었습니다.", "success");
    }
  };

  const [purgeOption, setPurgeOption] = useState<"AUTO_7DAYS" | "MANUAL">("AUTO_7DAYS");

  // 학생 PIN 분실 문의 해결 상태
  const [pinTargetGrade, setPinTargetGrade] = useState<number>(5);
  const [pinTargetClass, setPinTargetClass] = useState<number>(2);
  const [pinTargetNumber, setPinTargetNumber] = useState<number>(14);

  // 신규 사진전 등록
  const handleCreateChallenge = (newChallenge: Challenge) => {
    setChallenges((prev) => [newChallenge, ...prev]);
    setSelectedChallengeId(newChallenge.id);
    setSelectedChallengeForQR(newChallenge);
  };

  // 3단계 초상권·개인정보 안심 승인: 교사 최종 검수 및 전국 교류관 전송 (학교별 5장 / 전국 100장 쿼터 정책 반영)
  const handleTeacherApproveToNational = (submissionId: string) => {
    const target = submissions.find((s) => s.id === submissionId);
    if (!target) return;

    if (!target.student_consent) {
      showToast("⚠️ 1단계 학생 동의 미완료", "학생의 자발적 공개 동의(Opt-in)가 선행되어야 합니다.", "warning");
      return;
    }
    if (!target.parent_consent) {
      showToast("⚠️ 2단계 학부모 동의 미완료", "보호자 법정대리인 동의가 완료된 작품만 교외 공개가 가능합니다.", "warning");
      return;
    }

    // 이미 전국 교류관에 등재되어 있어 취소하려는 경우
    if (target.is_public_shared) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, teacher_approval: false, is_public_shared: false }
            : s
        )
      );
      showToast("🔒 전국 스쿨 교류관 등재 해제", "교외 공개가 안전하게 취소되었습니다.", "info");
      return;
    }

    // 신규 전국 교류관 등재 시도: 쿼터 제한 검증
    // 1. 학교별 최대 5장 제한 (서버 부하 방지)
    const currentSchoolSharedCount = submissions.filter((s) => s.is_public_shared).length;
    if (currentSchoolSharedCount >= 5) {
      showToast(
        `⚠️ 학교별 쿼터 한도 초과 (${currentSchoolSharedCount}/5장)`,
        "학교당 최대 5장까지만 등재 가능합니다. 기존 작품의 공개를 먼저 해제해주세요.",
        "warning"
      );
      return;
    }

    // 2. 승인 처리 (3단계 모두 충족 시 전국 공개)
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
            teacher_approval: true,
            is_public_shared: true,
          };
        }
        return s;
      })
    );

    showToast(
      `🎉 3단계 교사 최종 승인 완료 (${currentSchoolSharedCount + 1}/5장)`,
      "전국 스쿨 교류관에 안전하게 공식 등재되었습니다!",
      "success"
    );
  };

  // 개발자 메일 백업 안내 발송
  const handleNotifyDeveloperBackup = () => {
    showToast("✉️ 개발자 아카이빙 백업 요청 완료", "클라우드 콜드 스토리지 영구 백업 요청이 전달되었습니다.", "info");
  };

  // 전국 교류관 아카이브 백업 다운로드
  const handleDownloadNationalArchiveZip = () => {
    showToast("📦 전국 교류관 아카이브 백업 시작", "등재된 고화질 사진 및 메타데이터를 압축 다운로드합니다.", "info");
  };

  // 교내 공개 토글
  const toggleInternalApproval = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isInternalApproved: !s.isInternalApproved } : s))
    );
  };

  // 일괄 교내 승인
  const handleBatchInternalApprove = () => {
    setSubmissions((prev) => prev.map((s) => ({ ...s, isInternalApproved: true })));
    showToast("✅ 전 작품 일괄 교내 승인 완료", "선택된 사진전의 모든 출품작이 교내 갤러리에 공개되었습니다.", "success");
  };

  // 출품작 삭제
  const handleDeleteSubmission = (id: string) => {
    if (confirm("해당 출품작을 정말로 삭제하시겠습니까? 학생에게 재출품 권한이 부여됩니다.")) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      showToast("🗑️ 출품작이 안전하게 삭제되었습니다.", "해당 학생은 새 사진을 다시 출품할 수 있습니다.", "info");
    }
  };

  // PIN 0000 초기화
  const handleResetPin = (grade?: number, classNum?: number, num?: number) => {
    const g = grade ?? pinTargetGrade;
    const c = classNum ?? pinTargetClass;
    const n = num ?? pinTargetNumber;
    
    resetStudentPin(g, c, n, "0000");
    setSubmissions((prev) => [...prev]);

    showToast(
      `🔑 [${g}학년 ${c}반 ${n}번] PIN 0000 초기화 완료`,
      "학생에게 비밀번호 0000으로 접속하도록 안내해주세요.",
      "success"
    );
  };

  // 특별상 수여 저장
  const handleGrantSpecialAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialAwardTitle.trim()) {
      showToast("⚠️ 특별상 명칭을 입력해주세요.", undefined, "warning");
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === awardTargetSubmissionId
          ? {
              ...s,
              special_award_title: specialAwardTitle.trim(),
              special_award_reason: specialAwardReason.trim(),
            }
          : s
      )
    );

    setIsSpecialAwardModalOpen(false);
    showToast(
      `🏆 특별상 수여 완료 (${specialAwardTitle.trim()})`,
      "시상 명단 및 나이스 학교생활기록부 추천 문구에 자동 반영되었습니다.",
      "success"
    );
  };

  // ZIP 다운로드
  const handleDownloadZip = async () => {
    try {
      await downloadSubmissionsZip({
        challengeTitle: currentChallenge.title,
        submissions: submissions,
      });
    } catch (e) {
      console.error(e);
      alert("ZIP 압축 생성 중 오류가 발생했습니다.");
    }
  };

  // 기안문 표준 한글(HWPX) 다운로드
  const handleDownloadHwp = async () => {
    try {
      const blob = await generateHwpxDraft({
        title: currentChallenge.title,
        themeName: currentChallenge.title,
        intent: currentChallenge.description,
        targetGrade: "전교생 (1~6학년)",
        submissionRange: `${submissionStartDate} ${submissionStartTime} ~ ${submissionEndDate} ${submissionEndTime}`,
        votingRange: `${votingStartDate} ${votingStartTime} ~ ${votingEndDate} ${votingEndTime}`,
        teacherTips: currentChallenge.teacherTips || "창체/자율활동 연계",
        schoolName: schoolName,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `스쿨픽_기안문_${currentChallenge.title}.hwpx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("기안문 HWPX 파일 생성 중 오류가 발생했습니다.");
    }
  };

  // 시상용 최종 결과표 CSV 다운로드 (학생, 교직원, 학부모 투표 분리 집계 반영)
  const handleDownloadCsv = () => {
    const rows = [
      ["순위", "시상구분", "학년", "반", "번호", "작가닉네임", "작품제목", "총합득표", "학생투표", "교직원투표", "학부모공감표", "작가노트(30자)", "생기부세특문구"],
      ...submissions.map((s, idx) => [
        idx + 1,
        s.special_award_title ? `[특별상] ${s.special_award_title}` : idx === 0 ? "대상" : idx === 1 ? "최우수" : idx === 2 ? "우수" : "참가상",
        s.studentGrade,
        s.studentClass,
        s.studentNumber,
        s.nickname,
        `"${s.title.replace(/"/g, '""')}"`,
        s.votes,
        s.studentVotes || 0,
        s.teacherVotes || 0,
        s.parentVotes || 0,
        `"${(s.caption || "").replace(/"/g, '""')}"`,
        `"${(s.special_award_reason || currentChallenge.teacherTips || "").replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `스쿨픽_최종시상결과표_${currentChallenge.title}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 위험 영역 삭제
  const handlePurgeAllData = () => {
    const confirmed = prompt(`⚠️ 위험: [${currentChallenge.title}]의 모든 사진, 투표 데이터가 영구 삭제됩니다.\n계속 진행하시려면 '삭제'를 입력하세요.`);
    if (confirmed === "삭제") {
      setSubmissions([]);
      alert("이번 사진전의 모든 데이터가 스토리지에서 영구 파기되었습니다.");
    }
  };

  // 발표 모드에서 투표 오픈
  const handleOpenVotingFromPresentation = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: "VOTING" } : c))
    );
    alert("🎉 [전교 투표 공식 오픈] 모든 학생들의 화면이 실시간 투표 모드로 전환되었습니다!");
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-800 pb-20 selection:bg-amber-200">
      
      {/* [디자인 원칙 3: 시스템 상태 가시성] 우측 상단 플로팅 토스트 알림 배너 */}
      {toast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md animate-in slide-in-from-top-3 fade-in duration-200">
          <div
            className={`rounded-2xl border-[2.5px] border-slate-900 px-4 py-3.5 shadow-[0_6px_0_0_#1E293B] flex items-start gap-3 ${
              toast.type === "warning"
                ? "bg-amber-100 text-amber-950"
                : toast.type === "info"
                ? "bg-sky-100 text-sky-950"
                : "bg-emerald-400 text-slate-950"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-black text-xs sm:text-sm leading-snug">{toast.title}</p>
              {toast.subtitle && (
                <p className="text-[11px] font-bold opacity-85 mt-0.5 leading-relaxed">
                  {toast.subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="w-6 h-6 rounded-lg bg-slate-900/10 hover:bg-slate-900/20 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-slate-900" />
            </button>
          </div>
        </div>
      )}

      {/* 1. 상단 글로벌 네비게이션 헤더 (요청 반영: PC 화면 비율 조정 및 버튼 크기/모양 고정, 글자 세로 줄바꿈 완벽 방지) */}
      <header className="bg-white border-b-[2.5px] border-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* 학교 정보 (공간 부족 시 말줄임 처리하여 버튼 여유 공간 확보) */}
          <div className="flex items-center gap-2 shrink-0 min-w-0 max-w-[230px] xl:max-w-none">
            <span className="text-2xl shrink-0">🏫</span>
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-900 truncate">
              <span className="text-sky-600 shrink-0 hidden sm:inline">[스쿨픽 Admin]</span>
              <span className="truncate">{schoolName}</span>
              <span className="text-[10px] sm:text-xs font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-300 shrink-0">
                {schoolCode}
              </span>
            </div>
          </div>

          {/* 4대 네비게이션 탭 & 외부 포털/유틸리티 버튼 (60-30-10 컬러 법칙 적용) */}
          <nav className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar py-0.5">
            
            {/* 탭 1: 대시보드 */}
            <button
              type="button"
              onClick={() => setActiveNav("dashboard")}
              className={`h-9 px-3 sm:px-3.5 rounded-xl border-[2px] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-black shrink-0 ${
                activeNav === "dashboard"
                  ? "bg-[#FFC72C] text-slate-950 border-slate-900 shadow-[0_2px_0_0_#1E293B]"
                  : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span>🧭</span>
              <span className="whitespace-nowrap">대시보드</span>
            </button>

            {/* 탭 2: 새 사진전 만들기 (핵심 CTA 10% 포인트 컬러 강조) */}
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="h-9 px-3 sm:px-3.5 rounded-xl border-[2px] border-slate-900 bg-amber-100 hover:bg-[#FFC72C] text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-black shrink-0 shadow-[0_2px_0_0_#1E293B] active:translate-y-0.5"
            >
              <span>🏞️</span>
              <span className="whitespace-nowrap">새 사진전 만들기</span>
            </button>

            {/* 탭 3: 갤러리 검수/승인 */}
            <button
              type="button"
              onClick={() => setActiveNav("review")}
              className={`h-9 px-3 sm:px-3.5 rounded-xl border-[2px] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-black shrink-0 ${
                activeNav === "review"
                  ? "bg-[#FFC72C] text-slate-950 border-slate-900 shadow-[0_2px_0_0_#1E293B]"
                  : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span className="text-sky-600">🛡️</span>
              <span className="whitespace-nowrap">갤러리 검수/승인</span>
            </button>

            {/* 탭 4: 시상 명단 내보내기 */}
            <button
              type="button"
              onClick={() => setActiveNav("export")}
              className={`h-9 px-3 sm:px-3.5 rounded-xl border-[2px] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-black shrink-0 ${
                activeNav === "export"
                  ? "bg-[#FFC72C] text-slate-950 border-slate-900 shadow-[0_2px_0_0_#1E293B]"
                  : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span>🏆</span>
              <span className="whitespace-nowrap">시상 명단 내보내기</span>
            </button>

            {/* 시각적 그룹 구분선 (Gestalt 근접성/유사성 원칙 적용: 내부 관리 탭 vs 외부 포털/유틸리티) */}
            <div className="h-5 w-[1.5px] bg-slate-200 mx-0.5 shrink-0 hidden sm:block" />

            {/* 외부 포털 1: 전국 스쿨 교류관 바로가기 (화이트 서피스 + 컬러 아이콘 통일) */}
            <Link
              href="/national"
              className="h-9 px-3 sm:px-3.5 rounded-xl border-[2px] border-slate-300 bg-white hover:bg-sky-50 hover:border-sky-400 text-slate-800 font-black transition-all flex items-center gap-1.5 whitespace-nowrap text-xs shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="whitespace-nowrap">전국 교류관</span>
            </Link>

            {/* 외부 포털 2: 학부모 전용 투표관 바로가기 */}
            <Link
              href="/parents"
              className="h-9 px-3 sm:px-3.5 rounded-xl border-[2px] border-slate-300 bg-white hover:bg-rose-50 hover:border-rose-400 text-slate-800 font-black transition-all flex items-center gap-1.5 whitespace-nowrap text-xs shrink-0"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400 shrink-0" />
              <span className="whitespace-nowrap">학부모 투표관</span>
            </Link>

            {/* 유틸리티: 교사용 통합 운영 매뉴얼 (상단 글로벌 네비게이션 단독 배치) */}
            <button
              type="button"
              onClick={() => setIsUserGuideOpen(true)}
              className="h-9 px-3 sm:px-3.5 rounded-xl border-[2px] border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-500 text-slate-800 font-black transition-all flex items-center gap-1.5 whitespace-nowrap text-xs shrink-0 cursor-pointer active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="whitespace-nowrap">운영 매뉴얼</span>
            </button>
          </nav>

          {/* 우측 로그인 교사 프로필 */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-extrabold bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-300 shrink-0">
              <span className="text-sm">👨‍🏫</span>
              <span className="whitespace-nowrap hidden sm:inline">{teacherName}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/teacher/login")}
              className="h-9 px-2.5 rounded-xl border border-slate-300 hover:border-rose-400 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline whitespace-nowrap">로그아웃</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. 다중 교사 및 복수 사진전 선택 바 (60-30-10 컬러 법칙: 차분한 슬레이트 톤으로 정돈) */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-lg">📌</span>
            <span className="text-xs font-black text-slate-800">
              관리할 사진전 선택 (다중 교사 협업):
            </span>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-white text-xs font-black text-slate-900 shadow-2xs focus:outline-none cursor-pointer"
            >
              {challenges.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  【 {ch.title} 】 (개설: {ch.createdAt} / {ch.status === "VOTING" ? "전교 투표 중" : "사진 접수 중"} / 담당: {ch.teacherName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="bg-white px-2.5 py-1 rounded-xl border border-amber-300 font-black text-slate-800">
              현재 선택: <b className="text-sky-700">{currentChallenge.title}</b> (담당: {currentChallenge.teacherName})
            </span>
          </div>

        </div>
      </div>

      {/* 3. 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* ================================================================== */}
        {/* [TAB 1]: 대시보드 - 이벤트 타임라인 & 데이터 보관 설정 */}
        {/* ================================================================== */}
        {activeNav === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* [신규 기능]: 전국 스쿨 교류관 — 수업 안내용 예시 쇼케이스 게시판 & 서버 용량/수명주기 쿼터 관리 카드 */}
            <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-amber-50 rounded-3xl border-[2.5px] border-slate-900 p-6 shadow-[0_6px_0_0_#1E293B] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base sm:text-lg text-slate-900">
                        전국 스쿨 교류관 — 수업 안내용 예시 쇼케이스 게시판
                      </h3>
                      <span className="text-[10px] bg-sky-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                        수업 예시용
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-bold mt-0.5">
                      학생들이 사진을 찍기 전, 타 학교 우수작과 포즈 아이디어를 예시로 보여주어 수업 흥미와 참여도를 높여보세요!
                    </p>
                  </div>
                </div>

                {/* 교류관 이동 버튼 2종: 게시판 뷰 & 수업용 슬라이드쇼 */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/national?view=board"
                    className="h-9 px-3.5 rounded-xl border-[2px] border-slate-900 bg-white hover:bg-slate-50 text-slate-900 font-black text-xs flex items-center gap-1.5 shadow-[0_2px_0_0_#1E293B] cursor-pointer transition-all"
                  >
                    <span>📋</span>
                    <span>우수작 게시판 열기</span>
                  </Link>
                  <Link
                    href="/national?mode=presentation"
                    className="h-9 px-3.5 rounded-xl border-[2px] border-slate-900 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_2px_0_0_#1E293B] cursor-pointer transition-all"
                  >
                    <span>📺</span>
                    <span>수업용 전자칠판 슬라이드쇼</span>
                  </Link>
                </div>
              </div>

              {/* 서버 자원 보호를 위한 전시 쿼터 및 수명주기(Lifecycle) 게이지 */}
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs font-black text-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>서버 자원 보호: 전국 사진 전시 쿼터 및 보관 주기 관리</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                    <span>우리 학교 등재작: <b className="text-sky-600 font-black">{submissions.filter(s => s.is_public_shared).length} / 5장</b> (학교당 최대 5장 제한)</span>
                    <span>•</span>
                    <span>전국 총 전시: <b className="text-rose-600 font-black">92 / 100장 (92%)</b></span>
                  </div>
                </div>

                {/* 프로그레스 바 */}
                <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden relative">
                  <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 h-full rounded-full transition-all duration-500" style={{ width: "92%" }} />
                </div>

                {/* 90장 이상 시 개발자 백업 안내 알림 배너 & 100장 일주일 후 순차 삭제 정책 */}
                <div className="bg-amber-50 rounded-xl border border-amber-300 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-black text-amber-950">
                      <span>⚠️</span>
                      <span>[서버 용량 90% 도달 안내] 전국 전시 사진이 90장 이상(92/100장) 등록되었습니다.</span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium">
                      서버 부하 방지를 위해 개발자 메일로 백업을 권장하며, <b>100장 도달 시 앞 순번부터 1주일 후 순차 자동 삭제(FIFO)</b>됩니다. (추후 서버 증설 예정)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleNotifyDeveloperBackup}
                      className="px-2.5 py-1.5 rounded-lg border border-amber-400 bg-white hover:bg-amber-100 text-amber-900 font-black text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>✉️</span>
                      <span>개발자 메일 백업 요청</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadNationalArchiveZip}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-white font-black text-xs flex items-center gap-1 hover:bg-slate-800 cursor-pointer shadow-xs transition-all"
                    >
                      <span>📦</span>
                      <span>전체 백업 다운로드</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-6 shadow-[0_6px_0_0_#1E293B] space-y-6">
              
              <div className="flex flex-wrap items-center justify-between border-b-2 border-slate-100 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-sky-600">⚙️</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      [이벤트 타임라인 & 데이터 보관 설정] — 【 {currentChallenge.title} 】
                    </h2>
                    <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-0.5 rounded-full mt-1 inline-block">
                      개설일: {currentChallenge.createdAt} • 담당: {currentChallenge.teacherName}
                    </span>
                  </div>
                </div>

                {/* 대시보드에서 포스터 및 QR 언제든 다시 인쇄/다운로드 가능하도록 버튼 배치 */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChallengeForQR(currentChallenge)}
                    className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-[2px] border-slate-900 shadow-[0_3px_0_0_#1E293B] flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Printer className="w-4 h-4 text-slate-900" />
                    <span>🖨️ A4 홍보 포스터 / 교실 출력용 QR 인쇄</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPresentationOpen(true)}
                    className="py-2 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black text-xs border border-indigo-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <MonitorPlay className="w-4 h-4 text-indigo-600" />
                    <span>수업 발표 모드</span>
                  </button>
                </div>
              </div>

              {/* 3단계 타임라인 스테퍼 */}
              <div className="relative flex items-center justify-between px-6 sm:px-16 py-3 bg-sky-50/70 rounded-2xl border border-sky-200">
                <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 h-1 bg-sky-300 z-0" />
                
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-slate-900 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                    1
                  </div>
                  <span className="text-xs font-black text-slate-800">1 사진 접수</span>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-sky-500 border-2 border-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    2
                  </div>
                  <span className="text-xs font-black text-slate-800">2 전교/학부모 투표</span>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-400 text-slate-600 font-black text-xs flex items-center justify-center shadow-xs">
                    3
                  </div>
                  <span className="text-xs font-black text-slate-500">3 결과 발표 및 전시</span>
                </div>
              </div>

              {/* 사진 접수 기간 (선택 및 변경 가능) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-900 rounded-xs inline-block" />
                  <h4 className="font-black text-sm text-slate-900">
                    1. 사진 접수 기간 (신규 출품 & 수정 허용)
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-700">
                  <span className="text-slate-600 font-black">시작:</span>
                  <input
                    type="date"
                    value={submissionStartDate}
                    onChange={(e) => setSubmissionStartDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-amber-300"
                  />
                  <input
                    type="time"
                    value={submissionStartTime}
                    onChange={(e) => setSubmissionStartTime(e.target.value)}
                    className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  />
                  <span className="text-slate-400 font-black px-1">~</span>
                  <span className="text-slate-600 font-black">종료:</span>
                  <input
                    type="date"
                    value={submissionEndDate}
                    onChange={(e) => setSubmissionEndDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-amber-300"
                  />
                  <input
                    type="time"
                    value={submissionEndTime}
                    onChange={(e) => setSubmissionEndTime(e.target.value)}
                    className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  />
                </div>
                <p className="text-[11px] text-rose-500 font-bold pl-1">
                  * 종료 즉시 학생 화면의 추가 업로드 및 사진 변경이 전면 마감됩니다.
                </p>
              </div>

              {/* 투표 기간 (선택 및 변경 가능) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-900 rounded-xs inline-block" />
                  <h4 className="font-black text-sm text-slate-900">
                    2. 전교/학부모 투표 기간 (출품 불가, 오직 투표만 허용)
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-700">
                  <span className="text-slate-600 font-black">시작:</span>
                  <input
                    type="date"
                    value={votingStartDate}
                    onChange={(e) => setVotingStartDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-sky-300"
                  />
                  <input
                    type="time"
                    value={votingStartTime}
                    onChange={(e) => setVotingStartTime(e.target.value)}
                    className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  />
                  <span className="text-slate-400 font-black px-1">~</span>
                  <span className="text-slate-600 font-black">종료:</span>
                  <input
                    type="date"
                    value={votingEndDate}
                    onChange={(e) => setVotingEndDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-sky-300"
                  />
                  <input
                    type="time"
                    value={votingEndTime}
                    onChange={(e) => setVotingEndTime(e.target.value)}
                    className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  />
                </div>
              </div>

              {/* 일정 변경 저장 버튼 바 (요청: 대시보드에서 선택해서 변경 가능하도록 기능 구현) */}
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveTimelineDates}
                  className="py-2.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-[2px] border-slate-900 shadow-[0_3px_0_0_#1E293B] flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>💾 타임라인 일정 변경 저장</span>
                </button>
              </div>

              {/* 저장공간 관리 & 원클릭 백업 */}
              <div className="bg-sky-50/60 rounded-3xl p-5 border-2 border-sky-300 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-sky-600 rounded-xs inline-block" />
                  <h4 className="font-black text-sm text-sky-950">
                    4. 저장공간 관리 & 원클릭 백업 (클라우드 용량 비우기)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md border-2 border-sky-400 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <FileArchive className="w-4 h-4" />
                    <span>전체 출품작 고화질 ZIP 다운로드</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md border-2 border-emerald-500 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>시상용 최종 결과표 엑셀(CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadHwp}
                    className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md border-2 border-indigo-500 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>기안문 표준 한글(HWPX) 다운로드</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-sky-200/80 space-y-2">
                  <span className="text-xs font-black text-slate-800 block">
                    자동 파기 타이머 설정:
                  </span>
                  <div className="space-y-1.5 pl-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="purgeTimer"
                        checked={purgeOption === "AUTO_7DAYS"}
                        onChange={() => setPurgeOption("AUTO_7DAYS")}
                        className="accent-sky-600 w-4 h-4"
                      />
                      <span>결과 발표 종료 7일 후 사진 자동 영구 삭제 (권장)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="purgeTimer"
                        checked={purgeOption === "MANUAL"}
                        onChange={() => setPurgeOption("MANUAL")}
                        className="accent-sky-600 w-4 h-4"
                      />
                      <span>교사가 수동으로 [지금 즉시 데이터 영구 삭제] 버튼 누를 때 삭제</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 위험 영역 */}
              <div className="bg-rose-50 rounded-3xl p-5 border-2 border-rose-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                    🔒
                  </div>
                  <div>
                    <h5 className="font-black text-rose-700 text-sm">위험 영역</h5>
                    <p className="text-xs text-rose-600 font-bold leading-relaxed">
                      이 작업은 되돌릴 수 없습니다.<br />선택된 사진전의 모든 사진과 투표 데이터가 영구 삭제됩니다.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePurgeAllData}
                  className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md border-2 border-rose-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>이번 사진전 데이터 즉시 완전 삭제 (스토리지 비우기)</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* [TAB 3]: 갤러리 검수/승인 & 3단계 초상권 안심 파이프라인 */}
        {/* ================================================================== */}
        {activeNav === "review" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* 현재 진행 중인 사진전 알림 배너 */}
            <div className="bg-sky-500 rounded-3xl border-[2.5px] border-slate-900 p-5 shadow-[0_6px_0_0_#1E293B] text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center md:text-left">
                <span className="text-3xl">📢</span>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    현재 관리 중인 사진전: 【 {currentChallenge.title} 】
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-sky-100">
                    개설: {currentChallenge.createdAt} | 담당: {currentChallenge.teacherName} | 출품작: {submissions.length}점 | 투표 수: {currentChallenge.totalVotes}표
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeForQR(currentChallenge)}
                  className="py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs border-[2px] border-slate-900 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>A4 홍보 포스터 다시 인쇄</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPresentationOpen(true)}
                  className="py-2.5 px-4 rounded-2xl bg-[#FFC72C] hover:bg-amber-300 text-slate-950 font-black text-xs border-[2px] border-slate-900 shadow-[0_3px_0_0_#1E293B] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <MonitorPlay className="w-4 h-4" />
                  <span>칠판 띄우기용 전체화면 갤러리 열기</span>
                </button>
              </div>
            </div>

            {/* [디자인 원칙 2: 점진적 공개] 3단계 안심 승인 파이프라인 안내 접이식 아코디언 */}
            <div className="bg-emerald-50/90 rounded-2xl border-2 border-emerald-300 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setIsPipelineGuideOpen((prev) => !prev)}
                className="w-full p-3.5 px-4 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-emerald-100/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>[3단계 개인정보·초상권 안심 승인 파이프라인 & 전시 쿼터 현황]</span>
                  <span className="text-[11px] text-emerald-700 font-bold underline ml-1">
                    {isPipelineGuideOpen ? "상세 안내 접기" : "상세 안내 보기"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black">
                  <span className="bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 text-emerald-800">
                    우리 학교 등재: {submissions.filter(s => s.is_public_shared).length}/5장
                  </span>
                  <span className="bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 text-amber-800">
                    전국 총 전시: 92/100장
                  </span>
                  {isPipelineGuideOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-800" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-emerald-800" />
                  )}
                </div>
              </button>

              {isPipelineGuideOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-emerald-200/80 animate-in fade-in duration-150">
                  <p className="text-[11px] text-emerald-900 leading-relaxed font-bold">
                    교내 수상작을 타 학교 학생들과 나누려면: <b>1단계(학생 자발적 동의)</b> + <b>2단계(학부모 동의)</b>가 완료된 후, <b>교사 최종 검수</b>를 거쳐 [전국 자랑하기 전송] 버튼을 눌러야 등재됩니다.
                    <span className="block text-slate-600 font-semibold mt-1">
                      * 서버 자원 보호를 위해 <b>학교별 최대 5장</b>, <b>전국 총 100장 한도</b>로 운영됩니다. (100장 도달 시 앞 순번부터 1주일 후 순차 자동 삭제, 추후 증설 예정)
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* 출품작 검수 카드 그리드 */}
            <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-6 shadow-[0_6px_0_0_#1E293B] space-y-5">
              
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-900 rounded-xs inline-block" />
                  <span>■ 출품작 실시간 검수 & 3단계 전국 자랑하기 승인</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  총 {submissions.length}개 작품
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {submissions.map((item) => {
                  const studentPin = findStudent(item.studentGrade, item.studentClass, item.studentNumber)?.pin || "1234";

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 space-y-3 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-300 relative group flex items-center justify-center">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="max-w-full max-h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setIsPresentationOpen(true)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black transition-opacity cursor-pointer"
                            >
                              확대
                            </button>
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <h4 className="font-black text-sm text-slate-900">
                              {item.studentGrade}학년 {item.studentClass}반 {item.studentNumber}번
                            </h4>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-slate-600 font-bold">
                                ({item.nickname})
                              </span>
                              {/* 학생 PIN 투명 노출 */}
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-black inline-flex items-center gap-1 shadow-2xs">
                                <KeyRound className="w-2.5 h-2.5 text-amber-700" />
                                <span>PIN: {studentPin}</span>
                              </span>
                            </div>

                            {/* 교내 공개 체크박스 */}
                            <label className="flex items-center gap-1.5 cursor-pointer text-emerald-600 text-[11px] font-black pt-1">
                              <input
                                type="checkbox"
                                checked={item.isInternalApproved}
                                onChange={() => toggleInternalApproval(item.id)}
                                className="accent-emerald-600 w-3.5 h-3.5 rounded"
                              />
                              <span>교내 공개</span>
                            </label>
                          </div>
                        </div>

                        {/* 3단계 안심 승인 파이프라인 현황 바 */}
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-1.5 text-[11px] font-bold">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>1단계 학생 동의:</span>
                            <span className={item.student_consent ? "text-emerald-600 font-black" : "text-slate-400"}>
                              {item.student_consent ? "✓ 완료" : "미동의"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>2단계 학부모 동의:</span>
                            <span className={item.parent_consent ? "text-emerald-600 font-black" : "text-slate-400"}>
                              {item.parent_consent ? "✓ 완료" : "미동의"}
                            </span>
                          </div>

                          {/* 3단계 교사 최종 검수 & 전국 자랑하기 전송 버튼 */}
                          <button
                            type="button"
                            onClick={() => handleTeacherApproveToNational(item.id)}
                            className={`w-full py-2 px-2.5 rounded-xl font-black text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 ${
                              item.is_public_shared
                                ? "bg-indigo-600 border-indigo-700 text-white shadow-xs"
                                : "bg-sky-500 hover:bg-sky-600 text-white border-sky-600"
                            }`}
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>
                              {item.is_public_shared ? "전국 교류관 등재됨 (공개 취소)" : "3단계: 전국 자랑하기 전송"}
                            </span>
                          </button>
                        </div>

                        {/* 교직원 추천 투표 버튼 (요청: 교직원 투표 기능 구현) */}
                        <button
                          type="button"
                          onClick={() => handleTeacherVote(item.id)}
                          className={`w-full py-2 px-3 rounded-xl font-black text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                            teacherVotedMap[item.id]
                              ? "bg-amber-400 border-amber-500 text-slate-950 shadow-[0_2px_0_0_#1E293B]"
                              : "bg-white hover:bg-amber-50 text-amber-900 border-amber-300"
                          }`}
                        >
                          <span>👨‍🏫</span>
                          <span>{teacherVotedMap[item.id] ? "교직원 추천 완료 (취소)" : "교직원 추천 투표하기 (+1표)"}</span>
                        </button>

                        {/* 학생 / 교직원 / 학부모 투표 분리 집계란 (요청: 학부모, 교사 투표 집계란 분리 표기) */}
                        <div className="bg-sky-50/80 rounded-xl p-2.5 border border-sky-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-black text-slate-800 border-b border-sky-200 pb-1">
                            <span className="text-sky-950 flex items-center gap-1">
                              <span>📊</span>
                              <span>투표 집계란</span>
                            </span>
                            <span className="text-rose-600 font-black text-xs bg-white px-2 py-0.5 rounded-md border border-rose-200">
                              총합 {item.votes}표
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
                            <div className="bg-white p-1 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block text-[9px]">학생 투표</span>
                              <b className="text-slate-900 font-black text-xs">{item.studentVotes || 0}표</b>
                            </div>
                            <div className="bg-white p-1 rounded-lg border border-amber-200">
                              <span className="text-amber-700 block text-[9px]">교직원 투표</span>
                              <b className="text-amber-900 font-black text-xs">{item.teacherVotes || 0}표</b>
                            </div>
                            <div className="bg-white p-1 rounded-lg border border-rose-200">
                              <span className="text-rose-600 block text-[9px]">학부모 공감</span>
                              <b className="text-rose-900 font-black text-xs">{item.parentVotes || 0}표</b>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 카드 하단 액션 버튼: 삭제 & PIN 초기화 */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleDeleteSubmission(item.id)}
                          className="py-1.5 px-2 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-600 font-black text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetPin(item.studentGrade, item.studentClass, item.studentNumber)}
                          className="py-1.5 px-2 rounded-xl border border-sky-300 hover:bg-sky-50 text-sky-600 font-black text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>PIN초기화</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* 하단 일괄 승인 버튼 */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleBatchInternalApprove}
                  className="w-full sm:w-2/3 mx-auto py-3.5 px-6 rounded-2xl bg-[#FFC72C] hover:bg-[#FFBF1A] active:scale-95 text-slate-950 font-black text-sm border-2 border-slate-900 shadow-[0_4px_0_0_#1E293B] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>체크된 항목 일괄 교내 승인</span>
                </button>
              </div>

            </div>

            {/* [디자인 원칙 2: 점진적 공개] 학생 PIN 분실 문의 해결 접이식 아코디언 */}
            <div className="bg-white rounded-3xl border-[2px] border-slate-300 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setIsPinResetOpen((prev) => !prev)}
                className="w-full p-4 px-5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-sky-600" />
                  <h4 className="font-black text-xs sm:text-sm text-slate-900">
                    학생 PIN 분실 문의 해결 도구 (실시간 번호 조회 및 0000 리셋)
                  </h4>
                  <span className="text-[11px] text-sky-600 font-bold underline ml-1">
                    {isPinResetOpen ? "도구 닫기" : "도구 열기"}
                  </span>
                </div>
                {isPinResetOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {isPinResetOpen && (
                <div className="p-5 pt-3 border-t border-slate-200 bg-sky-50/40 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-black">
                    <span>[</span>
                    <select
                      value={pinTargetGrade}
                      onChange={(e) => setPinTargetGrade(Number(e.target.value))}
                      className="bg-transparent focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <span>] 학년</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-black">
                    <span>[</span>
                    <select
                      value={pinTargetClass}
                      onChange={(e) => setPinTargetClass(Number(e.target.value))}
                      className="bg-transparent focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span>] 반</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-black">
                    <span>[</span>
                    <select
                      value={pinTargetNumber}
                      onChange={(e) => setPinTargetNumber(Number(e.target.value))}
                      className="bg-transparent focus:outline-none"
                    >
                      {Array.from({ length: 35 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <span>] 번 학생</span>
                  </div>

                  <div className="bg-amber-100 text-amber-950 px-3 py-2 rounded-xl border-2 border-amber-300 text-xs font-black flex items-center gap-1.5 shadow-xs">
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    <span>현재 PIN: <b className="text-sky-700 font-mono text-sm">{findStudent(pinTargetGrade, pinTargetClass, pinTargetNumber)?.pin || "미설정"}</b></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResetPin()}
                    className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-sm flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>PIN을 0000으로 초기화</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================================================================== */}
        {/* [TAB 4]: 시상 명단 & 특별상(명칭 입력) 수여 & 나이스 기재 */}
        {/* ================================================================== */}
        {activeNav === "export" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-6 shadow-[0_6px_0_0_#1E293B] space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-100 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      [시상 명단 & 특별상 수여 관리] — 【 {currentChallenge.title} 】
                    </h2>
                    <p className="text-xs text-slate-500 font-bold">
                      교내 투표 순위 및 교사 직접 지정 특별상을 통합 관리합니다.
                    </p>
                  </div>
                </div>

                {/* [디자인 원칙 1: 60-30-10 컬러 법칙] 핵심 CTA(Amber/Slate-900)와 보조 내보내기(White) 위계 구분 */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* 핵심 CTA 1: 특별상 수여 모달 열기 (10% 포인트 컬러) */}
                  <button
                    type="button"
                    onClick={() => setIsSpecialAwardModalOpen(true)}
                    className="py-2.5 px-4 rounded-xl bg-[#FFC72C] hover:bg-amber-300 text-slate-950 font-black text-xs border-[2px] border-slate-900 shadow-[0_2px_0_0_#1E293B] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ 특별상 직접 수여하기</span>
                  </button>

                  {/* 보조 내보내기 1: 엑셀(CSV) */}
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs border-[2px] border-slate-900 shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>엑셀(CSV) 다운로드</span>
                  </button>

                  {/* 보조 내보내기 2: 작품 ZIP */}
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs border-[2px] border-slate-900 shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <FileArchive className="w-4 h-4 text-sky-600" />
                    <span>작품 ZIP 다운로드</span>
                  </button>

                  {/* 핵심 CTA 2: 기안문(HWPX) */}
                  <button
                    type="button"
                    onClick={handleDownloadHwp}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs border-[2px] border-slate-900 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    <span>기안문(HWPX)</span>
                  </button>
                </div>
              </div>

              {/* 시상 명단 테이블 (학생/교직원/학부모 분리 집계 반영) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="p-3">순위</th>
                      <th className="p-3">시상 구분 (특별상 포함)</th>
                      <th className="p-3">학번</th>
                      <th className="p-3">작가 닉네임</th>
                      <th className="p-3">작품 제목</th>
                      <th className="p-3 text-center">총합 득표</th>
                      <th className="p-3 text-center">학생 투표</th>
                      <th className="p-3 text-center">교직원 투표</th>
                      <th className="p-3 text-center">학부모 공감</th>
                      <th className="p-3">생기부 세특 기재 내용</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {submissions.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-amber-50/50">
                        <td className="p-3 font-black text-amber-600">
                          {idx === 0 ? "🥇 대상" : idx === 1 ? "🥈 최우수" : idx === 2 ? "🥉 우수" : `${idx + 1}위`}
                        </td>
                        <td className="p-3">
                          {sub.special_award_title ? (
                            <span className="bg-amber-100 text-amber-950 border border-amber-400 px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 shadow-2xs">
                              <Gift className="w-3.5 h-3.5 text-amber-600" />
                              <span>{sub.special_award_title}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold">
                              {idx === 0 ? "전교 1위 대상" : idx === 1 ? "전교 2위 최우수" : idx === 2 ? "전교 3위 우수" : "참가상"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {sub.studentGrade}학년 {sub.studentClass}반 {sub.studentNumber}번
                        </td>
                        <td className="p-3 font-bold text-sky-700">{sub.nickname}</td>
                        <td className="p-3 font-bold">{sub.title}</td>
                        <td className="p-3 font-mono font-black text-rose-600 text-center text-sm">{sub.votes}표</td>
                        <td className="p-3 font-mono font-bold text-slate-700 text-center">{sub.studentVotes || 0}표</td>
                        <td className="p-3 font-mono font-bold text-amber-800 text-center">{sub.teacherVotes || 0}표</td>
                        <td className="p-3 font-mono font-bold text-rose-700 text-center">{sub.parentVotes || 0}표</td>
                        <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate font-medium">
                          {sub.special_award_reason || currentChallenge.teacherTips || "교내 사진전에 적극적으로 참여하여 우수한 창의력을 발휘함."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 나이스 세특 원클릭 복사 배너 */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300 space-y-2">
                <h4 className="font-black text-xs text-amber-900 flex items-center gap-1">
                  <span>📋 나이스(NEIS) 학교생활기록부 자동 기재 추천 문구:</span>
                </h4>
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed font-bold">
                  {currentChallenge.teacherTips || "주변 일상 사물의 조형적 특징을 예리하게 포착하여 명화 및 캐릭터를 창의적으로 재해석하고 유쾌한 시각 이미지로 표현함."}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentChallenge.teacherTips || "");
                    showToast("📋 생기부 추천 문구 복사 완료", "나이스(NEIS) 입력란에 바로 붙여넣기(Ctrl+V) 하실 수 있습니다.", "success");
                  }}
                  className="py-1.5 px-3 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-all cursor-pointer"
                >
                  문구 클립보드 복사
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* 4. 특별상 직접 수여 모달 (요구사항: 특별상 명칭 입력 및 학생 지정) */}
      {/* ==================================================================== */}
      {isSpecialAwardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border-4 border-slate-900 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h3 className="font-black text-slate-900 text-base">
                  교사 직접 지정 특별상 수여
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSpecialAwardModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-bold">
              투표 순위와 무관하게 뛰어난 아이디어, 협동심, 사제동행을 실천한 학생을 선정하여 특별상을 수여할 수 있습니다.
            </p>

            <form onSubmit={handleGrantSpecialAward} className="space-y-3.5">
              
              {/* 수여 대상 학생 선택 */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">
                  수여 대상 학생 선택:
                </label>
                <select
                  value={awardTargetSubmissionId}
                  onChange={(e) => setAwardTargetSubmissionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-black text-slate-900 focus:border-slate-900 focus:outline-none bg-slate-50"
                >
                  {submissions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.studentGrade}학년 {sub.studentClass}반 {sub.studentNumber}번] {sub.nickname} — &ldquo;{sub.title}&rdquo;
                    </option>
                  ))}
                </select>
              </div>

              {/* 특별상 명칭 직접 입력 */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">
                  특별상 명칭 (직접 입력):
                </label>
                <input
                  type="text"
                  required
                  value={specialAwardTitle}
                  onChange={(e) => setSpecialAwardTitle(e.target.value)}
                  placeholder="예: 싱크로율 대폭발상, 사제동행 훈훈상, 아이디어 뱅크상"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-black focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* 수여 사유 (생기부 기재 문구) */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">
                  수여 사유 및 생기부 세특 문구:
                </label>
                <textarea
                  rows={3}
                  required
                  value={specialAwardReason}
                  onChange={(e) => setSpecialAwardReason(e.target.value)}
                  placeholder="학교생활기록부 행동특성 및 종합의견 또는 창체 특기사항에 기재할 문구를 입력하세요."
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-xs font-medium focus:border-slate-900 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSpecialAwardModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-black bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#FFC72C] hover:bg-[#FFBF1A] text-slate-950 font-black text-xs border-2 border-slate-900 shadow-[0_3px_0_0_#1E293B] cursor-pointer"
                >
                  🏆 특별상 수여 확정
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 기타 모달 연동 */}
      <ThemeAndOptionWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={handleCreateChallenge}
        onOpenFeedback={() => {
          setIsWizardOpen(false);
          setIsFeedbackOpen(true);
        }}
      />

      {selectedChallengeForQR && (
        <SchoolPosterModal
          challenge={selectedChallengeForQR}
          isOpen={!!selectedChallengeForQR}
          onClose={() => setSelectedChallengeForQR(null)}
          schoolName={schoolName}
        />
      )}

      <TeacherPresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        challenge={currentChallenge}
        submissions={submissions}
        onOpenVoting={handleOpenVotingFromPresentation}
      />

      <TeacherFeedbackWidget
        isOpenExternal={isFeedbackOpen ? true : undefined}
        onCloseExternal={() => setIsFeedbackOpen(false)}
      />

      <TeacherUserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />

      <Footer />

    </div>
  );
}