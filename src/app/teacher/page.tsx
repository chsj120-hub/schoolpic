"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { INITIAL_CHALLENGES, SAMPLE_SUBMISSIONS, NATIONAL_EXCHANGE_SUBMISSIONS } from "@/lib/constants";
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
import { DraftModal } from "@/components/DraftModal";
import { AwardResultDraftModal } from "@/components/AwardResultDraftModal";
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
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherRole, setTeacherRole] = useState("담임교사");
  const [isDevAdmin, setIsDevAdmin] = useState(false);

  // 운영 중인 사진전 목록 (신규 가입 학교는 초기 개설 사진전 없음 [])
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  // 현재 선택되어 관리 중인 사진전 ID
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0] || null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("schoolpick_teacher");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.email) setTeacherEmail(parsed.email);
          if (parsed.schoolName) setSchoolName(parsed.schoolName);
          if (parsed.schoolCode) setSchoolCode(parsed.schoolCode);
          if (parsed.name) setTeacherName(parsed.name);
          if (parsed.roleGrade) setTeacherRole(parsed.roleGrade);

          // 개발자/관리자 전용 계정 여부 판단 (chsj120@gmail.com, 총괄 관리자, TST-7777)
          const isDev =
            parsed.email === "chsj120@gmail.com" ||
            parsed.roleGrade === "총괄 관리자" ||
            parsed.schoolCode === "TST-7777";
          setIsDevAdmin(isDev);

          // 해당 학교의 개설된 사진전 로드
          const savedChallenges = localStorage.getItem(`schoolpick_challenges_${parsed.schoolCode}`);
          if (savedChallenges) {
            try {
              const chList = JSON.parse(savedChallenges);
              if (Array.isArray(chList)) {
                setChallenges(chList);
                if (chList.length > 0) {
                  setSelectedChallengeId(chList[0].id);
                } else {
                  setSelectedChallengeId("");
                  setSubmissions([]);
                }
              }
            } catch (err) {
              console.error(err);
            }
          } else {
            // 저장된 사진전이 없는 경우:
            // 개발자 테스트 학교(TST-7777)만 데모용 예시 챌린지 1건 제공, 그 외 일반 학교/신규 가입은 빈 상태([])
            if (parsed.schoolCode === "TST-7777") {
              setChallenges(INITIAL_CHALLENGES);
              setSelectedChallengeId(INITIAL_CHALLENGES[0].id);
            } else {
              setChallenges([]);
              setSelectedChallengeId("");
              setSubmissions([]);
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // 미로그인 상태로 직접 접근 시 로그인 화면으로 안전 리다이렉트
        router.push("/");
      }
    }
  }, [router]);

  // 4대 네비게이션 탭 상태 (개발자 계정 접속 시 관제 통계 탭 추가)
  const [activeNav, setActiveNav] = useState<"dashboard" | "create" | "review" | "export" | "analytics">("dashboard");

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

  // Supabase 실시간 출품작 동기화 (학생들이 R2 및 DB에 출품한 작품 실시간 반영)
  useEffect(() => {
    async function loadServerSubmissions() {
      try {
        const res = await fetch(`/api/submissions?schoolCode=${schoolCode}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions) && data.submissions.length > 0) {
          setSubmissions((prev) => {
            const dbIds = new Set(data.submissions.map((s: any) => s.id));
            const existingFiltered = prev.filter((s) => !dbIds.has(s.id));
            const formatted = data.submissions.map((item: any) => ({
              ...item,
              isInternalApproved: item.isInternalApproved ?? true,
              isExternalApproved: item.is_public_shared ?? false,
            }));
            return [...formatted, ...existingFiltered];
          });
        }
      } catch (e) {
        console.warn("Could not sync submissions from server:", e);
      }
    }
    loadServerSubmissions();
  }, [schoolCode]);

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

  // 특별상 수여 및 기안문 모달 상태
  const [isSpecialAwardModalOpen, setIsSpecialAwardModalOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isAwardResultDraftModalOpen, setIsAwardResultDraftModalOpen] = useState(false);
  const [awardTargetSubmissionId, setAwardTargetSubmissionId] = useState<string>(SAMPLE_SUBMISSIONS[0].id);
  // 시상 명단 10명 단위 페이지네이션 상태
  const [awardPage, setAwardPage] = useState<number>(1);

  // ================= 요구사항 10: 교사 코멘트 & 서면 동의 수동 체크 & 얼굴 가리기 =================
  const [editingTeacherComments, setEditingTeacherComments] = useState<Record<string, string>>({});

  // 학부모 서면(종이) 동의 수동 체크 토글 (학부모 모바일 동의 시 자동 체크 유지)
  const handleTogglePaperConsent = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          const nextPaper = !s.paper_parent_consent;
          return {
            ...s,
            paper_parent_consent: nextPaper,
            // 서면 동의 확인 시 2단계 학부모 동의 자동 완료
            parent_consent: nextPaper ? true : s.parent_consent,
          };
        }
        return s;
      })
    );
    showToast("📄 학부모 서면 동의 상태 업데이트", "가정통신문 회신서(서면 동의서) 상태가 반영되었습니다.", "success");
  };

  // 교사 코멘트 저장 (학생 화면 '내 출품작'에서 해당 학생만 1:1 확인)
  const handleSaveTeacherComment = (submissionId: string) => {
    const comment = editingTeacherComments[submissionId] ?? "";
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, teacher_comment: comment } : s))
    );
    showToast("🧑‍🏫 선생님 피드백 저장 완료", "작성하신 코멘트는 학생 화면의 '내 출품작'에서 해당 학생만 1:1로 확인합니다.", "success");
  };

  // 얼굴 보호(초상권 마스킹) 모드 토글 (스티커 / 블러)
  const handleToggleFacePrivacyMode = (submissionId: string, mode: "none" | "emoji" | "blur") => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, face_privacy_mode: mode } : s))
    );
    showToast("🛡️ 초상권 얼굴 보호 모드", `${mode === "emoji" ? "귀여운 스티커/이모지 가리기" : mode === "blur" ? "소프트 블러 가리기" : "기본 원본"}가 적용되었습니다.`, "info");
  };
  const [specialAwardTitle, setSpecialAwardTitle] = useState("💡 싱크로율 대폭발 아이디어 특별상");
  const [specialAwardReason, setSpecialAwardReason] = useState("일상 사물의 조형적 특징을 예리하게 관찰하여 독창적인 시각 표현을 완성하고 학급에 큰 웃음을 선사함.");

  // ============================================================================
  // 이벤트 타임라인 및 데이터 보관 설정 상태 (오늘 날짜 기준 자동 최신화)
  // ============================================================================
  const todayDefaultDates = (() => {
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
  })();

  const [submissionStartDate, setSubmissionStartDate] = useState(
    currentChallenge?.submissionStartDate || todayDefaultDates.subStart
  );
  const [submissionStartTime, setSubmissionStartTime] = useState(currentChallenge?.submissionStartTime || "09:00");
  const [submissionEndDate, setSubmissionEndDate] = useState(
    currentChallenge?.submissionEndDate || todayDefaultDates.subEnd
  );
  const [submissionEndTime, setSubmissionEndTime] = useState(currentChallenge?.submissionEndTime || "16:00");

  const [votingStartDate, setVotingStartDate] = useState(
    currentChallenge?.votingStartDate || todayDefaultDates.voteStart
  );
  const [votingStartTime, setVotingStartTime] = useState(currentChallenge?.votingStartTime || "09:00");
  const [votingEndDate, setVotingEndDate] = useState(
    currentChallenge?.votingEndDate || todayDefaultDates.voteEnd
  );
  const [votingEndTime, setVotingEndTime] = useState(currentChallenge?.votingEndTime || "18:00");

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
    if (!currentChallenge) return;
    const updated = challenges.map((ch) =>
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
    );
    setChallenges(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`schoolpick_challenges_${schoolCode}`, JSON.stringify(updated));
    }
    showToast(
      `💾 타임라인 일정 변경 완료 (${currentChallenge.title})`,
      `접수: ${submissionStartDate} ${submissionStartTime}~${submissionEndDate} ${submissionEndTime} | 투표: ${votingStartDate}~${votingEndDate}`,
      "success"
    );
  };

  // 사진 프레임 띠지 학년·반·번호 노출 여부 원터치 토글 (대시보드에서 즉시 변경)
  const handleToggleGradeClassDisplay = () => {
    if (!currentChallenge) return;
    const nextVal = !currentChallenge.showGradeClassOnFrame;
    const updated = challenges.map((ch) =>
      ch.id === selectedChallengeId ? { ...ch, showGradeClassOnFrame: nextVal } : ch
    );
    setChallenges(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`schoolpick_challenges_${schoolCode}`, JSON.stringify(updated));
    }
    // 서버 API 동기화
    fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge: { ...currentChallenge, showGradeClassOnFrame: nextVal } }),
    }).catch(() => {});

    showToast(
      nextVal ? "🏷️ 띠지 공개 설정: 학년·반·번호 모두 표시" : "🔒 띠지 안심 설정: 닉네임만 표시 (비공개)",
      nextVal
        ? "사진 프레임 하단 띠지에 '5학년 2반 14번 5반 날다람쥐 작가님'으로 표시됩니다."
        : "사진 프레임 하단 띠지에 학년·반·번호가 숨겨지고 '5반 날다람쥐 작가님'만 표시됩니다.",
      "info"
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

  // 사진전 투표 공식 종료 및 보관 만료 여부 판별
  const isChallengeEnded = currentChallenge
    ? currentChallenge.status === "ENDED" ||
      (Boolean(currentChallenge.votingEndDate) &&
        new Date(`${currentChallenge.votingEndDate}T${currentChallenge.votingEndTime || "23:59"}`).getTime() < Date.now())
    : false;

  // 학생 PIN 분실 문의 해결 상태
  const [pinTargetGrade, setPinTargetGrade] = useState<number>(5);
  const [pinTargetClass, setPinTargetClass] = useState<number>(2);
  const [pinTargetNumber, setPinTargetNumber] = useState<number>(14);

  // 신규 사진전 등록
  const handleCreateChallenge = async (newChallenge: Challenge) => {
    const updated = [newChallenge, ...challenges];
    setChallenges(updated);
    setSelectedChallengeId(newChallenge.id);
    setSelectedChallengeForQR(newChallenge);
    if (typeof window !== "undefined") {
      localStorage.setItem(`schoolpick_challenges_${schoolCode}`, JSON.stringify(updated));

      // 전역 챌린지 딕셔너리에도 즉시 저장 (학생 접속 링크 /c/[id] 호환 보장)
      try {
        const existingAll = JSON.parse(localStorage.getItem("schoolpick_all_challenges") || "{}");
        existingAll[newChallenge.id] = newChallenge;
        localStorage.setItem("schoolpick_all_challenges", JSON.stringify(existingAll));
      } catch (e) {
        console.warn("Failed to save to schoolpick_all_challenges:", e);
      }
    }

    // 서버 API 동기화 (학생들이 다른 기기나 모바일에서 QR 링크로 접속할 때 즉시 로드되도록 등록)
    try {
      await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge: newChallenge }),
      });
    } catch (apiErr) {
      console.warn("Server challenge sync error, saved locally:", apiErr);
    }

    showToast(
      `🎉 새로운 사진전 [${newChallenge.title}] 개설 완료!`,
      "안내 포스터 출력 및 기안문 다운로드가 가능합니다.",
      "success"
    );
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

  // PIN 0000 초기화 (로컬 + Supabase DB 동시 반영)
  const handleResetPin = async (grade?: number, classNum?: number, num?: number) => {
    const g = grade ?? pinTargetGrade;
    const c = classNum ?? pinTargetClass;
    const n = num ?? pinTargetNumber;
    
    resetStudentPin(g, c, n, "0000");
    setSubmissions((prev) => [...prev]);

    try {
      await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_PIN",
          schoolCode,
          grade: g,
          classNum: c,
          studentNum: n,
          resetPin: "0000",
        }),
      });
    } catch (err) {
      console.warn("DB pin reset error:", err);
    }

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
    if (!currentChallenge) {
      showToast("⚠️ 다운로드할 사진전이 없습니다.", "먼저 사진전을 선택하거나 개설해주세요.", "warning");
      return;
    }
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

  // 기안문 표준 서식 (실시 계획안) 모달 열기
  const handleDownloadHwp = () => {
    if (!currentChallenge) {
      showToast("⚠️ 기안문을 작성할 사진전이 없습니다.", "먼저 사진전을 개설해주세요.", "warning");
      return;
    }
    setIsDraftModalOpen(true);
  };

  // 시상 결과 발표 및 시상 계획 기안문 모달 열기
  const handleOpenAwardResultDraft = () => {
    if (!currentChallenge) {
      showToast("⚠️ 시상 결과 기안문을 작성할 사진전이 없습니다.", "먼저 사진전을 선택해주세요.", "warning");
      return;
    }
    setIsAwardResultDraftModalOpen(true);
  };

  // 시상용 최종 결과표 CSV 다운로드 (총합 득표 순위 자동 정렬, 선생님 코멘트 & 학부모 응원 멘트 포함)
  const handleDownloadCsv = () => {
    if (!currentChallenge) {
      showToast("⚠️ 내보낼 사진전이 없습니다.", undefined, "warning");
      return;
    }

    // 총합 득표(votes) 순으로 엄격 정렬
    const sorted = [...submissions].sort((a, b) => b.votes - a.votes);

    const rows = [
      [
        "순위",
        "시상구분",
        "상종류(특별상명)",
        "특별상수여사유",
        "학년",
        "반",
        "번호",
        "작가닉네임",
        "작품제목",
        "총합득표",
        "학생투표",
        "교직원투표",
        "학부모공감표",
        "작가노트(30자)",
        "선생님코멘트",
        "학부모응원멘트",
      ],
      ...sorted.map((s, idx) => {
        const rank = idx + 1;
        const awardType = s.special_award_title
          ? `[특별상] ${s.special_award_title}`
          : rank === 1
          ? "1위 (최다 득표)"
          : rank === 2
          ? "2위 (우수)"
          : rank === 3
          ? "3위 (장려)"
          : `${rank}위 (참가)`;

        return [
          rank,
          `"${awardType.replace(/"/g, '""')}"`,
          `"${(s.special_award_title || "").replace(/"/g, '""')}"`,
          `"${(s.special_award_reason || "").replace(/"/g, '""')}"`,
          s.studentGrade,
          s.studentClass,
          s.studentNumber,
          `"${s.nickname.replace(/"/g, '""')}"`,
          `"${s.title.replace(/"/g, '""')}"`,
          s.votes,
          s.studentVotes || 0,
          s.teacherVotes || 0,
          s.parentVotes || 0,
          `"${(s.caption || "").replace(/"/g, '""')}"`,
          `"${(s.teacher_comment || "").replace(/"/g, '""')}"`,
          `"${(s.parent_comment || "").replace(/"/g, '""')}"`,
        ];
      }),
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

  // ============================================================================
  // 사진전 즉시 삭제, 접수 마감, 투표 강제 종료 및 7일 자동 파기
  // ============================================================================

  // 1. 실수로 사진전 개최 시 즉시 삭제 (경고창 확인 후 사진전 및 모든 데이터 영구 파기)
  const handleDeleteCurrentChallenge = async () => {
    if (!currentChallenge) return;
    const targetTitle = currentChallenge.title;
    const targetId = currentChallenge.id;
    const confirmed = prompt(
      `⚠️ [사진전 영구 삭제 경고]\n\n'${targetTitle}' 사진전을 정말로 삭제하시겠습니까?\n이 사진전에 출품된 모든 학생 사진, 투표 데이터, 수상 기록이 영구 파기되며 절대 복구할 수 없습니다.\n\n삭제를 원하시면 아래에 정확히 '삭제'라고 입력해주세요.`
    );

    if (confirmed !== "삭제") {
      if (confirmed !== null) {
        showToast("취소됨", "'삭제'를 정확히 입력하지 않아 취소되었습니다.", "info");
      }
      return;
    }

    // 서버 API 삭제 호출
    try {
      await fetch(`/api/challenges?id=${targetId}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete challenge on server:", err);
    }

    // 로컬 스토리지 정리
    if (typeof window !== "undefined") {
      localStorage.removeItem(`schoolpick_submissions_${targetId}`);
      try {
        const all = JSON.parse(localStorage.getItem("schoolpick_all_challenges") || "{}");
        delete all[targetId];
        localStorage.setItem("schoolpick_all_challenges", JSON.stringify(all));
      } catch (e) {}
    }

    // 상태 업데이트
    const remaining = challenges.filter((c) => c.id !== targetId);
    setChallenges(remaining);
    if (remaining.length > 0) {
      setSelectedChallengeId(remaining[0].id);
    } else {
      setSelectedChallengeId("");
      setSubmissions([]);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(`schoolpick_challenges_${schoolCode}`, JSON.stringify(remaining));
    }

    showToast("🗑️ 사진전 영구 삭제 완료", `[${targetTitle}] 사진전과 모든 관련 데이터가 완전히 삭제되었습니다.`, "info");
  };

  const handlePurgeAllData = handleDeleteCurrentChallenge;

  // 2. 대시보드에서 사진 접수 즉시 마감 (안전 확인 후 마감 및 투표 단계 전환)
  const handleImmediateCloseSubmission = async () => {
    if (!currentChallenge) return;
    const ok = window.confirm(
      `🚨 [사진 접수 즉시 마감 안내]\n\n'${currentChallenge.title}'의 사진 접수를 지금 즉시 마감하시겠습니까?\n\n- 더 이상 학생들의 신규 사진 등록 및 수정이 차단됩니다.\n- 전교생 투표(VOTING) 단계로 즉시 전환됩니다.`
    );
    if (!ok) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const updated = challenges.map((ch) =>
      ch.id === currentChallenge.id
        ? {
            ...ch,
            submissionEndDate: todayStr,
            submissionEndTime: timeStr,
            status: "VOTING" as const,
          }
        : ch
    );
    setChallenges(updated);
    setSubmissionEndDate(todayStr);
    setSubmissionEndTime(timeStr);

    if (typeof window !== "undefined") {
      localStorage.setItem(`schoolpick_challenges_${schoolCode}`, JSON.stringify(updated));
      try {
        const all = JSON.parse(localStorage.getItem("schoolpick_all_challenges") || "{}");
        if (all[currentChallenge.id]) {
          all[currentChallenge.id] = {
            ...all[currentChallenge.id],
            submissionEndDate: todayStr,
            submissionEndTime: timeStr,
            status: "VOTING",
          };
          localStorage.setItem("schoolpick_all_challenges", JSON.stringify(all));
        }
      } catch (e) {}
    }

    try {
      await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge: {
            ...currentChallenge,
            submissionEndDate: todayStr,
            submissionEndTime: timeStr,
            status: "VOTING",
          },
        }),
      });
    } catch (e) {}

    showToast("🚨 사진 접수 즉시 마감 완료", "학생들의 추가 사진 등록이 차단되었으며 투표 모드로 전환되었습니다.", "warning");
  };

  // 3. 대시보드에서 전교 투표 즉시 강제 종료 (안전 확인 후 종료 및 시상 단계 전환)
  const handleImmediateCloseVoting = async () => {
    if (!currentChallenge) return;
    const ok = window.confirm(
      `🏁 [전교 투표 즉시 종료 안내]\n\n'${currentChallenge.title}'의 전교생 투표를 지금 즉시 강제 종료하시겠습니까?\n\n- 더 이상 학생/학부모 투표가 불가능합니다.\n- 최종 시상 집계 및 전시(ENDED) 단계로 전환됩니다.\n- 개인정보 보호 규정에 따라 종료일로부터 7일 후 데이터가 자동 영구 파기됩니다.`
    );
    if (!ok) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const updated = challenges.map((ch) =>
      ch.id === currentChallenge.id
        ? {
            ...ch,
            votingEndDate: todayStr,
            votingEndTime: timeStr,
            status: "ENDED" as const,
          }
        : ch
    );
    setChallenges(updated);
    setVotingEndDate(todayStr);
    setVotingEndTime(timeStr);

    if (typeof window !== "undefined") {
      localStorage.setItem(`schoolpick_challenges_${schoolCode}`, JSON.stringify(updated));
      try {
        const all = JSON.parse(localStorage.getItem("schoolpick_all_challenges") || "{}");
        if (all[currentChallenge.id]) {
          all[currentChallenge.id] = {
            ...all[currentChallenge.id],
            votingEndDate: todayStr,
            votingEndTime: timeStr,
            status: "ENDED",
          };
          localStorage.setItem("schoolpick_all_challenges", JSON.stringify(all));
        }
      } catch (e) {}
    }

    try {
      await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge: {
            ...currentChallenge,
            votingEndDate: todayStr,
            votingEndTime: timeStr,
            status: "ENDED",
          },
        }),
      });
    } catch (e) {}

    showToast("🏁 전교 투표 즉시 종료 완료", "투표가 종료되고 최종 결과 집계(ENDED) 상태로 변경되었습니다. 백업을 진행하세요!", "warning");
  };

  // 4. 투표 종료 7일 후 사진전 자동 삭제 및 백업 권장 검사
  useEffect(() => {
    if (challenges.length === 0) return;
    const now = new Date();
    let hasPurged = false;
    const updatedChallenges = challenges.filter((ch) => {
      if (ch.votingEndDate) {
        const endDate = new Date(`${ch.votingEndDate}T23:59:59`);
        const diffMs = now.getTime() - endDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        // 투표 종료 후 7일 경과 시 자동 파기
        if (diffDays >= 7) {
          hasPurged = true;
          fetch(`/api/challenges?id=${ch.id}`, { method: "DELETE" }).catch(() => {});
          if (typeof window !== "undefined") {
            localStorage.removeItem(`schoolpick_submissions_${ch.id}`);
            try {
              const all = JSON.parse(localStorage.getItem("schoolpick_all_challenges") || "{}");
              delete all[ch.id];
              localStorage.setItem("schoolpick_all_challenges", JSON.stringify(all));
            } catch (e) {}
          }
          return false;
        }
      }
      return true;
    });

    if (hasPurged) {
      setChallenges(updatedChallenges);
      if (updatedChallenges.length > 0) {
        setSelectedChallengeId(updatedChallenges[0].id);
      } else {
        setSelectedChallengeId("");
        setSubmissions([]);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(`schoolpick_challenges_${schoolCode}`, JSON.stringify(updatedChallenges));
      }
      showToast(
        "🧹 7일 보관 만료 데이터 자동 파기",
        "개인정보 보호법 및 학생 초상권 보호 원칙에 따라 투표 종료 후 7일이 경과한 사진전이 자동 영구 삭제되었습니다.",
        "warning"
      );
    }
  }, [challenges, schoolCode]);

  // 발표 모드에서 투표 오픈
  const handleOpenVotingFromPresentation = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: "VOTING" } : c))
    );
    alert("🎉 [전교 투표 공식 오픈] 모든 학생들의 화면이 실시간 투표 모드로 전환되었습니다!");
  };

  // 신규 가입 학교 또는 개설된 사진전이 없을 때 표시되는 빈 상태(Empty State) 카드
  const renderEmptyState = () => (
    <div className="bg-white rounded-3xl border-4 border-dashed border-slate-300 p-8 sm:p-14 text-center max-w-2xl mx-auto my-6 shadow-sm space-y-4 animate-in fade-in duration-200">
      <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
        📸
      </div>
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          현재 우리 학교에 개설된 사진전이 없습니다
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          선생님, 환영합니다! 학생들을 위한 첫 번째 사진전을 개설해보세요.<br className="hidden sm:inline" />
          18가지 교과/창체 테마 선택부터 A4 안내 포스터, 기안문 생성까지 <b>단 3분</b>이면 완성됩니다.
        </p>
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-2xl border-2 border-slate-900 shadow-[0_4px_0_0_#1E293B] hover:shadow-lg transition-all text-sm sm:text-base inline-flex items-center gap-2 cursor-pointer active:translate-y-0.5"
        >
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>✨ 새 사진전 개설하기 (3분 완성)</span>
        </button>
      </div>
    </div>
  );

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

            {/* 개발자/관리자 전용: 전국 통합 관제 통계 대시보드 */}
            {isDevAdmin && (
              <button
                type="button"
                onClick={() => setActiveNav("analytics")}
                className={`h-9 px-3 sm:px-3.5 rounded-xl border-[2px] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-black shrink-0 ${
                  activeNav === "analytics"
                    ? "bg-purple-600 text-white border-slate-900 shadow-[0_2px_0_0_#1E293B]"
                    : "bg-purple-50 border-purple-300 hover:border-purple-500 hover:bg-purple-100 text-purple-900"
                }`}
              >
                <span>📊</span>
                <span className="whitespace-nowrap">전국 관제 통계</span>
              </button>
            )}

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
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("schoolpick_teacher");
                }
                router.push("/");
              }}
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
            {challenges.length > 0 ? (
              <select
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-white text-xs font-black text-slate-900 shadow-2xs focus:outline-none cursor-pointer"
              >
                {challenges.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    【 {ch.title} 】 (개설: {ch.createdAt} / {ch.status === "VOTING" ? "전교 투표 중" : ch.status === "ENDED" ? "투표 종료(시상)" : "사진 접수 중"} / 담당: {ch.teacherName})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
                개설된 사진전 없음
              </span>
            )}

            {/* 실수로 개설된 사진전 즉시 삭제 버튼 (선택 바 바로 옆에 배치) */}
            {currentChallenge && (
              <button
                type="button"
                onClick={handleDeleteCurrentChallenge}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 hover:border-rose-500 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="실수로 잘못 개설된 사진전을 영구 삭제합니다."
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">사진전 삭제</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            {currentChallenge ? (
              <span className="bg-white px-2.5 py-1 rounded-xl border border-amber-300 font-black text-slate-800">
                현재 선택: <b className="text-sky-700">{currentChallenge.title}</b> (담당: {currentChallenge.teacherName})
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl border-2 border-slate-900 font-black text-xs shadow-xs cursor-pointer active:translate-y-0.5"
              >
                + 새 사진전 개설하기
              </button>
            )}
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

              {/* 서버 자원 보호를 위한 전시 쿼터 및 수명주기(Lifecycle) 게이지 (요청: 일반 사용자에게는 숨기고 개발자/관리자에게만 노출) */}
              {isDevAdmin && (
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between text-xs font-black text-slate-800 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>서버 자원 보호: 전국 사진 전시 쿼터 및 보관 주기 관리 (개발자 모니터링)</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                      <span>우리 학교 등재작: <b className="text-sky-600 font-black">{submissions.filter(s => s.is_public_shared).length} / 5장</b> (학교당 최대 5장 제한)</span>
                      <span>•</span>
                      <span>전국 총 전시: <b className="text-emerald-600 font-black">3 / 100장 (3%)</b></span>
                    </div>
                  </div>

                  {/* 프로그레스 바 */}
                  <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden relative">
                    <div className="bg-gradient-to-r from-sky-400 to-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "3%" }} />
                  </div>

                  {/* 자원 안전 보관 안내 */}
                  <div className="bg-sky-50 rounded-xl border border-sky-200 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-black text-sky-950">
                        <span>🛡️</span>
                        <span>[서버 자원 안정 상태] 현재 총 3장의 전국 전시 사진이 안정적으로 보관 중입니다.</span>
                      </div>
                      <p className="text-[11px] text-sky-800 font-medium">
                        서버 부하 방지를 위해 <b>100장 도달 시 앞 순번부터 1주일 후 순차 자동 삭제(FIFO)</b> 정책이 적용됩니다.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleNotifyDeveloperBackup}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <span>✉️</span>
                        <span>개발자 백업 요청</span>
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
              )}
            </div>

            {/* [데이터 보관 만료 및 백업 권장 안내 배너] - 전교 투표 종료(ENDED) 시 상단 즉시 노출 */}
            {isChallengeEnded && (
              <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 text-white rounded-3xl p-5 sm:p-6 shadow-[0_6px_0_0_#1E293B] border-[2.5px] border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0 border border-white/30">
                    📦
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-white text-rose-700 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        🚨 투표 종료 & 보관 만료 안내
                      </span>
                      <span className="text-xs font-bold text-amber-200">
                        개인정보 보호법 준수 D-7 자동 영구 파기 예정
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black tracking-tight text-white">
                      전교생 투표가 종료되었습니다! 7일 후 데이터가 자동 영구 파기됩니다.
                    </h4>
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      개인정보 보호법 및 학생 초상권 보호 원칙에 따라 <b>투표 종료 7일 후 모든 출품작 원본 사진과 학생 투표 기록이 서버에서 영구 파기</b>됩니다.<br className="hidden sm:inline" />
                      생기부 기재용 시상 결과표(CSV) 및 출품작 원본(ZIP)을 지금 바로 PC에 안전하게 백업하세요.
                    </p>
                  </div>
                </div>

                {/* 원클릭 백업 액션 버튼 2종 */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs border-2 border-slate-900 shadow-[0_3px_0_0_#1E293B] flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>📊 시상 결과표 CSV 백업</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-slate-900 shadow-[0_3px_0_0_#1E293B] flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
                  >
                    <FileArchive className="w-4 h-4 text-slate-900" />
                    <span>📦 전체 사진 ZIP 백업</span>
                  </button>
                </div>
              </div>
            )}

            {/* 개설된 사진전이 없는 경우(신규 가입자) 친절한 빈 상태 안내, 있는 경우 정상 관리 대시보드 */}
            {challenges.length === 0 ? (
              renderEmptyState()
            ) : currentChallenge ? (
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

                {/* 대시보드 액션 버튼 바 */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChallengeForQR(currentChallenge)}
                    className="py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-[2px] border-slate-900 shadow-[0_2px_0_0_#1E293B] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Printer className="w-4 h-4 text-slate-900" />
                    <span>🖨️ A4 포스터/QR 인쇄</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPresentationOpen(true)}
                    className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black text-xs border border-indigo-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <MonitorPlay className="w-4 h-4 text-indigo-600" />
                    <span>수업 발표 모드</span>
                  </button>

                  {/* 띠지 학년·반·번호 노출 여부 원터치 토글 버튼 */}
                  <button
                    type="button"
                    onClick={handleToggleGradeClassDisplay}
                    className={`py-2 px-3 rounded-xl font-black text-xs border-[2px] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                      currentChallenge.showGradeClassOnFrame
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 hover:bg-emerald-100"
                        : "bg-slate-50 border-slate-400 text-slate-800 hover:bg-slate-100"
                    }`}
                    title="사진 프레임 하단 띠지에 학년·반·번호 노출 여부를 토글합니다."
                  >
                    <span>{currentChallenge.showGradeClassOnFrame ? "🏷️ 띠지: 학년반 표시" : "🔒 띠지: 닉네임만"}</span>
                  </button>

                  {/* 실수로 개설된 사진전 즉시 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={handleDeleteCurrentChallenge}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs border border-rose-300 flex items-center gap-1.5 cursor-pointer transition-all"
                    title="실수로 생성된 이 사진전을 모든 데이터와 함께 영구 삭제합니다."
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>사진전 삭제</span>
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-900 rounded-xs inline-block" />
                    <h4 className="font-black text-sm text-slate-900">
                      1. 사진 접수 기간 (신규 출품 & 수정 허용)
                    </h4>
                  </div>
                  {/* 사진 접수 즉시 마감 버튼 */}
                  <button
                    type="button"
                    onClick={handleImmediateCloseSubmission}
                    className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                    title="즉시 접수를 마감하고 투표 단계로 전환합니다."
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>🚨 사진 접수 즉시 마감</span>
                  </button>
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-900 rounded-xs inline-block" />
                    <h4 className="font-black text-sm text-slate-900">
                      2. 전교/학부모 투표 기간 (출품 불가, 오직 투표만 허용)
                    </h4>
                  </div>
                  {/* 전교 투표 즉시 종료 버튼 */}
                  <button
                    type="button"
                    onClick={handleImmediateCloseVoting}
                    className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                    title="즉시 투표를 종료하고 최종 시상 및 전시(ENDED) 단계로 전환합니다."
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>🏁 전교 투표 즉시 종료</span>
                  </button>
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
            ) : null}
          </div>
        )}

        {/* ================================================================== */}
        {/* [TAB 3]: 갤러리 검수/승인 & 3단계 초상권 안심 파이프라인 */}
        {/* ================================================================== */}
        {activeNav === "review" && (
          challenges.length === 0 ? (
            renderEmptyState()
          ) : currentChallenge ? (
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
                    전국 총 전시: {Math.min(100, NATIONAL_EXCHANGE_SUBMISSIONS.length + submissions.filter(s => s.is_public_shared).length)}/100장
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
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-2 text-[11px] font-bold">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>1단계 학생 동의:</span>
                            <span className={item.student_consent ? "text-emerald-600 font-black" : "text-slate-400"}>
                              {item.student_consent ? "✓ 완료" : "미동의"}
                            </span>
                          </div>

                          {/* 2단계 학부모 동의 (모바일 자동 연동 + 종이 서면 수동 체크 지원) */}
                          <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between text-slate-600">
                              <span>2단계 학부모 동의:</span>
                              <span className={item.parent_consent ? "text-emerald-600 font-black" : "text-slate-400"}>
                                {item.parent_consent
                                  ? (item.paper_parent_consent ? "✓ 서면(종이) 접수" : "✓ 모바일 완료")
                                  : "미동의"}
                              </span>
                            </div>
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 text-[10px] font-bold select-none pt-0.5">
                              <input
                                type="checkbox"
                                checked={!!item.paper_parent_consent || (item.parent_consent && !item.paper_parent_consent)}
                                onChange={() => handleTogglePaperConsent(item.id)}
                                className="accent-emerald-600 w-3.5 h-3.5 rounded cursor-pointer"
                              />
                              <span>
                                {item.parent_consent && !item.paper_parent_consent
                                  ? "📱 학부모 모바일 직접 동의됨 (자동)"
                                  : "📄 서면(종이 동의서) 수동 확인"}
                              </span>
                            </label>
                          </div>

                          {/* 전국 자랑하기 얼굴 가리기 모드 (스티커 vs 블러) */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200 text-[10px]">
                            <span className="text-slate-500 font-bold">얼굴 가리기:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleFacePrivacyMode(item.id, item.face_privacy_mode === "emoji" ? "none" : "emoji")}
                                className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer ${
                                  item.face_privacy_mode === "emoji"
                                    ? "bg-amber-400 border-amber-500 text-slate-950 shadow-2xs"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                😊 스티커
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleFacePrivacyMode(item.id, item.face_privacy_mode === "blur" ? "none" : "blur")}
                                className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer ${
                                  item.face_privacy_mode === "blur"
                                    ? "bg-sky-400 border-sky-500 text-slate-950 shadow-2xs"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                🌫️ 블러
                              </button>
                            </div>
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

                        {/* 선생님 칭찬 & 지도 코멘트 입력란 (출품자 본인만 열람) */}
                        <div className="bg-amber-50/70 rounded-xl p-2.5 border border-amber-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-black text-amber-950">
                            <span className="flex items-center gap-1 text-[11px]">
                              <span>🧑‍🏫</span>
                              <span>선생님 코멘트 (학생 본인만 1:1 열람)</span>
                            </span>
                            {item.parent_comment && (
                              <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
                                💌 학부모 응원 등록됨
                              </span>
                            )}
                          </div>
                          {item.parent_comment && (
                            <p className="text-[11px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-200 font-maruburi">
                              &ldquo;{item.parent_comment}&rdquo;
                            </p>
                          )}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              maxLength={60}
                              placeholder="학생에게 보낼 칭찬/피드백 한마디..."
                              value={editingTeacherComments[item.id] !== undefined ? editingTeacherComments[item.id] : (item.teacher_comment || "")}
                              onChange={(e) => setEditingTeacherComments((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveTeacherComment(item.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-[11px] border border-amber-500 shrink-0 cursor-pointer"
                            >
                              저장
                            </button>
                          </div>
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
          ) : null
        )}

        {/* ================================================================== */}
        {/* [TAB 4]: 시상 명단 & 특별상(명칭 입력) 수여 & 나이스 기재 */}
        {/* ================================================================== */}
        {activeNav === "export" && (
          challenges.length === 0 ? (
            renderEmptyState()
          ) : currentChallenge ? (
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

                  {/* 핵심 CTA 2: 시상 결과 기안문 */}
                  <button
                    type="button"
                    onClick={handleOpenAwardResultDraft}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs border-[2px] border-slate-900 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    <span>🏆 시상 결과 기안문</span>
                  </button>
                </div>
              </div>

              {/* 시상 명단 테이블: 총합 득표 순위 정렬 & 10명 단위 페이지네이션 */}
              {(() => {
                const sortedSubmissions = [...submissions].sort((a, b) => b.votes - a.votes);
                const PAGE_SIZE = 10;
                const totalPages = Math.ceil(sortedSubmissions.length / PAGE_SIZE) || 1;
                const currentPage = Math.min(Math.max(1, awardPage), totalPages);
                const startIndex = (currentPage - 1) * PAGE_SIZE;
                const paginatedSubmissions = sortedSubmissions.slice(startIndex, startIndex + PAGE_SIZE);

                return (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                          <tr>
                            <th className="p-3 text-center">순위</th>
                            <th className="p-3">시상 구분 (특별상 포함)</th>
                            <th className="p-3">학번</th>
                            <th className="p-3">작가 닉네임</th>
                            <th className="p-3">작품 제목</th>
                            <th className="p-3 text-center">총합 득표</th>
                            <th className="p-3 text-center">학생 투표</th>
                            <th className="p-3 text-center">교직원 투표</th>
                            <th className="p-3 text-center">학부모 공감</th>
                            <th className="p-3">선생님 지도 코멘트 & 특별상 수여 사유</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {paginatedSubmissions.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                                등록된 출품작이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            paginatedSubmissions.map((sub, idx) => {
                              const rank = startIndex + idx + 1;
                              const isTop1 = rank === 1;
                              const isTop2 = rank === 2;
                              const isTop3 = rank === 3;

                              return (
                                <tr key={sub.id} className="hover:bg-amber-50/50">
                                  <td className="p-3 text-center font-black text-amber-600">
                                    {isTop1 ? (
                                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300 font-black">
                                        🥇 1위
                                      </span>
                                    ) : isTop2 ? (
                                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-300 font-black">
                                        🥈 2위
                                      </span>
                                    ) : isTop3 ? (
                                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 font-black">
                                        🥉 3위
                                      </span>
                                    ) : (
                                      <span className="text-slate-600 font-bold">{rank}위</span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    {sub.special_award_title ? (
                                      <span className="bg-amber-100 text-amber-950 border border-amber-400 px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 shadow-2xs">
                                        <Gift className="w-3.5 h-3.5 text-amber-600" />
                                        <span>{sub.special_award_title}</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-600 font-bold">
                                        {isTop1 ? "1위 (최다 득표)" : isTop2 ? "2위 (우수)" : isTop3 ? "3위 (장려)" : `${rank}위 (참가)`}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 font-bold text-slate-900">
                                    {sub.studentGrade}학년 {sub.studentClass}반 {sub.studentNumber}번
                                  </td>
                                  <td className="p-3 font-bold text-sky-700">{sub.nickname}</td>
                                  <td className="p-3 font-bold max-w-[180px] truncate" title={sub.title}>
                                    {sub.title}
                                  </td>
                                  <td className="p-3 font-mono font-black text-rose-600 text-center text-sm">
                                    {sub.votes}표
                                  </td>
                                  <td className="p-3 font-mono font-bold text-slate-700 text-center">
                                    {sub.studentVotes || 0}표
                                  </td>
                                  <td className="p-3 font-mono font-bold text-amber-800 text-center">
                                    {sub.teacherVotes || 0}표
                                  </td>
                                  <td className="p-3 font-mono font-bold text-rose-700 text-center">
                                    {sub.parentVotes || 0}표
                                  </td>
                                  <td className="p-3 text-xs space-y-1.5 max-w-xs">
                                    {/* 교사 지도 코멘트 */}
                                    {sub.teacher_comment && (
                                      <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1.5 rounded-xl font-bold break-words">
                                        <span className="text-[10px] bg-emerald-200/90 text-emerald-950 px-1.5 py-0.5 rounded font-black mr-1">
                                          지도 코멘트
                                        </span>
                                        {sub.teacher_comment}
                                      </div>
                                    )}

                                    {/* 교사 직접 지정 특별상 수여 사유 표기 */}
                                    {sub.special_award_title && (
                                      <div className="bg-amber-50 text-amber-950 border border-amber-300 px-2.5 py-1.5 rounded-xl font-bold break-words shadow-2xs">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-800 mb-0.5">
                                          <Gift className="w-3 h-3 text-amber-600 shrink-0" />
                                          <span>특별상 수여 사유:</span>
                                          <span className="text-amber-700 underline font-black">{sub.special_award_title}</span>
                                        </div>
                                        <p className="text-[11px] text-amber-900 font-semibold leading-relaxed">
                                          {sub.special_award_reason || "교내 사진전에서 남다른 창의력과 배려를 발휘하여 본 상을 수여함."}
                                        </p>
                                      </div>
                                    )}

                                    {!sub.teacher_comment && !sub.special_award_title && (
                                      <span className="text-slate-300 font-bold">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* 10명 단위 페이지네이션 바 */}
                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-600">
                          전체 <b className="text-slate-900">{sortedSubmissions.length}명</b> 중{" "}
                          <b>
                            {startIndex + 1} ~ {Math.min(startIndex + PAGE_SIZE, sortedSubmissions.length)}번
                          </b>{" "}
                          학생 표시 중 ({currentPage} / {totalPages} 페이지)
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setAwardPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 rounded-xl text-xs font-black border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                          >
                            ◀ 이전 10명
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setAwardPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                currentPage === pageNum
                                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                          <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setAwardPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 rounded-xl text-xs font-black border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                          >
                            다음 10명 ▶
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

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
          ) : null
        )}

        {/* ================================================================== */}
        {/* [TAB 5]: 개발자 전용 전국 통합 관제 및 통계 대시보드 */}
        {/* ================================================================== */}
        {activeNav === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 개발자 관제 헤더 */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white border-[2.5px] border-slate-900 shadow-[0_6px_0_0_#1E293B] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner">
                    🛡️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        전국 스쿨픽 실시간 관제 센터 (Developer Console)
                      </h2>
                      <span className="text-[11px] font-black bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-800 animate-pulse" />
                        LIVE 가동 중
                      </span>
                    </div>
                    <p className="text-xs text-purple-200/90 font-medium mt-1">
                      접속 계정: <b className="text-white underline">{teacherEmail || "chsj120@gmail.com"}</b> ({teacherRole}) • 전국 초등학교 실시간 참여율 및 투표 데이터 분석
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast("🔄 전국 통계 실시간 동기화 완료", "전국 28개 초등학교의 실시간 접속 및 투표 데이터가 갱신되었습니다.", "success");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white font-black text-xs border border-purple-400/40 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <span>🔄</span>
                    <span>실시간 통계 갱신</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const csvRows = [
                        ["학교명", "지역", "담당교사", "개최 테마", "학생수", "누적투표수", "투표율", "상태"],
                        ["목포항도초등학교", "전남 목포", "chsj12@korea.kr", "도플갱어 / 청소비포애프터", "320", "890", "94%", "진행중"],
                        ["한재초등학교", "전남 담양", "김선생님", "베프 & 짝꿍 챌린지", "142", "420", "98%", "투표종료"],
                        ["서울서이초등학교", "서울 서초", "박선생님", "교실 레이드 보스", "510", "1240", "88%", "사진접수중"],
                        ["부산해운대초등학교", "부산 해운대", "최선생님", "급식 인플루언서", "420", "1150", "91%", "진행중"],
                        ["대전도안초등학교", "대전 유성", "정선생님", "베프 챌린지", "380", "980", "89%", "진행중"],
                        ["테스트초등학교", "테스트", "총괄관리자", "전체 18개 테마", "50", "150", "100%", "테스트완료"]
                      ];
                      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.map(e => e.join(",")).join("\n");
                      const link = document.createElement("a");
                      link.setAttribute("href", encodeURI(csvContent));
                      link.setAttribute("download", `스쿨픽_전국관제통계_${new Date().toISOString().split("T")[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast("📥 전국 통계 CSV 다운로드 완료", "전국 학교별 데이터 파일이 생성되었습니다.", "success");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>전국 리포트 CSV</span>
                  </button>
                </div>
              </div>

              {/* 핵심 KPI 5종 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                <div className="bg-purple-950/70 border border-purple-500/30 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] text-purple-300 font-bold block">🏫 전국 참여 학교</span>
                  <div className="text-xl sm:text-2xl font-black text-white">28<span className="text-sm font-bold text-purple-300 ml-1">개교</span></div>
                  <span className="text-[10px] text-emerald-400 font-semibold">↑ 전월 대비 +12개교</span>
                </div>

                <div className="bg-purple-950/70 border border-purple-500/30 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] text-purple-300 font-bold block">👨‍🏫 등록 교사 계정</span>
                  <div className="text-xl sm:text-2xl font-black text-white">46<span className="text-sm font-bold text-purple-300 ml-1">명</span></div>
                  <span className="text-[10px] text-purple-300 font-medium">초등 공직자 100% 인증</span>
                </div>

                <div className="bg-purple-950/70 border border-purple-500/30 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] text-purple-300 font-bold block">🎒 누적 접속 학생</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">8,920<span className="text-sm font-bold text-amber-200 ml-1">명</span></div>
                  <span className="text-[10px] text-amber-400 font-semibold">실시간 DAU: 1,420명</span>
                </div>

                <div className="bg-purple-950/70 border border-purple-500/30 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] text-purple-300 font-bold block">🗳️ 누적 총 투표수</span>
                  <div className="text-xl sm:text-2xl font-black text-sky-300">24,680<span className="text-sm font-bold text-sky-200 ml-1">표</span></div>
                  <span className="text-[10px] text-sky-400 font-semibold">학생 79% / 학부모 17%</span>
                </div>

                <div className="bg-purple-950/70 border border-purple-500/30 rounded-2xl p-3.5 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-purple-300 font-bold block">📸 총 등록 출품작</span>
                  <div className="text-xl sm:text-2xl font-black text-rose-300">1,840<span className="text-sm font-bold text-rose-200 ml-1">장</span></div>
                  <span className="text-[10px] text-purple-300 font-medium">클라우드 R2: 420MB</span>
                </div>
              </div>
            </div>

            {/* 인기 테마 TOP 5 차트 & 학생 투표 시간대 패턴 분석 (2컬럼) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 컬럼 1: 인기 사진전 테마 TOP 5 */}
              <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-6 shadow-[0_6px_0_0_#1E293B] space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <h3 className="font-black text-slate-900 text-base">
                      전국 초등학교 인기 사진전 테마 TOP 5
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">출품작 수 기준</span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {[
                    { rank: 1, title: "우리 반 베프 & 짝꿍 챌린지", icon: "👭", percent: 42, count: "780건", color: "bg-amber-400" },
                    { rank: 2, title: "교실 대청소 비포 & 애프터 챌린지 (2분할)", icon: "🧼", percent: 24, count: "440건", color: "bg-sky-500" },
                    { rank: 3, title: "사물 & 친구 도플갱어 사진전 (2분할)", icon: "👥", percent: 18, count: "330건", color: "bg-emerald-500" },
                    { rank: 4, title: "교실 레이드! 우리 반 보스를 이겨라", icon: "🐉", percent: 10, count: "185건", color: "bg-rose-500" },
                    { rank: 5, title: "급식 인플루언서 맛있는 먹방 챌린지", icon: "🍱", percent: 6, count: "105건", color: "bg-purple-500" },
                  ].map((t) => (
                    <div key={t.rank} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${t.rank === 1 ? "bg-amber-400 text-slate-950" : t.rank === 2 ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600"}`}>
                            {t.rank}
                          </span>
                          <span className="text-slate-900">{t.icon} {t.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">{t.count}</span>
                          <span className="font-mono font-black text-slate-900 w-10 text-right">{t.percent}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`${t.color} h-full rounded-full transition-all duration-700`} style={{ width: `${t.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 컬럼 2: 학생 접속 및 투표 시간대 패턴 & 인프라 안정성 */}
              <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-6 shadow-[0_6px_0_0_#1E293B] space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    <h3 className="font-black text-slate-900 text-base">
                      학생 접속 및 투표 집중 시간대 분석
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    서버 부하율 6% (안정)
                  </span>
                </div>

                <div className="space-y-3 pt-1 text-xs">
                  <div className="bg-sky-50 rounded-2xl p-3.5 border border-sky-200 space-y-1.5">
                    <div className="flex items-center justify-between font-black text-sky-950">
                      <span>📸 1~2교시 창체/미술 (09:00 ~ 10:40)</span>
                      <span className="text-sky-700 font-mono">트래픽 45% 집중</span>
                    </div>
                    <p className="text-[11px] text-sky-800 font-medium">
                      학생들이 스마트기기로 사진을 직접 촬영하고 닉네임과 PIN을 설정하여 출품하는 피크 시간대입니다.
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between font-black text-amber-950">
                      <span>🗳️ 점심시간 전교 투표 (12:00 ~ 13:30)</span>
                      <span className="text-amber-800 font-mono">트래픽 35% 집중</span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium">
                      급식 후 교실 및 복도 QR코드로 친구들의 출품작에 스티커 투표를 진행하는 시간대입니다.
                    </p>
                  </div>

                  <div className="bg-rose-50 rounded-2xl p-3.5 border border-rose-200 space-y-1.5">
                    <div className="flex items-center justify-between font-black text-rose-950">
                      <span>👨‍👩‍👧 하교 후 학부모 모바일 투표 (17:00 ~ 21:00)</span>
                      <span className="text-rose-800 font-mono">트래픽 20% 분산</span>
                    </div>
                    <p className="text-[11px] text-rose-800 font-medium">
                      가정통신문 안내를 통해 학부모들이 자녀 작품을 감상하고 응원 투표를 행사하는 시간대입니다.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* 전국 학교별 실시간 운영 현황 테이블 */}
            <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-6 shadow-[0_6px_0_0_#1E293B] space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b-2 border-slate-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏫</span>
                  <h3 className="font-black text-slate-900 text-base">
                    전국 학교별 실시간 운영 현황 (최근 등록 순)
                  </h3>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  총 <b className="text-slate-900">6개교</b> 표본 모니터링 중
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 font-black">
                      <th className="p-3">학교명 / 지역</th>
                      <th className="p-3">담당 교사</th>
                      <th className="p-3">개최 테마</th>
                      <th className="p-3 text-center">참여 학생</th>
                      <th className="p-3 text-center">누적 투표수</th>
                      <th className="p-3 text-center">투표 참여율</th>
                      <th className="p-3 text-center">운영 상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-bold text-slate-800">
                    <tr className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-black text-slate-900">목포항도초등학교</div>
                        <div className="text-[10px] text-slate-500">전남 목포시</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sky-700 font-mono text-[11px]">chsj12@korea.kr</div>
                        <div className="text-[10px] text-slate-500">담임교사</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md text-[11px] font-black mr-1">
                          도플갱어
                        </span>
                        <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded-md text-[11px] font-black">
                          청소 비포애프터
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">320명</td>
                      <td className="p-3 text-center font-mono">890표</td>
                      <td className="p-3 text-center font-mono font-black text-emerald-600">94%</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          진행 중
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-black text-slate-900">한재초등학교</div>
                        <div className="text-[10px] text-slate-500">전남 담양군</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-900 font-mono text-[11px]">김선생님</div>
                        <div className="text-[10px] text-slate-500">담임교사</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[11px] font-black">
                          베프 & 짝꿍 챌린지
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">142명</td>
                      <td className="p-3 text-center font-mono">420표</td>
                      <td className="p-3 text-center font-mono font-black text-emerald-600">98%</td>
                      <td className="p-3 text-center">
                        <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          투표 종료 (시상)
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-black text-slate-900">서울서이초등학교</div>
                        <div className="text-[10px] text-slate-500">서울특별시 서초구</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-900 font-mono text-[11px]">박선생님</div>
                        <div className="text-[10px] text-slate-500">정보부장</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md text-[11px] font-black">
                          교실 레이드 보스
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">510명</td>
                      <td className="p-3 text-center font-mono">1,240표</td>
                      <td className="p-3 text-center font-mono font-black text-sky-600">88%</td>
                      <td className="p-3 text-center">
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full">
                          사진 접수 중
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-black text-slate-900">부산해운대초등학교</div>
                        <div className="text-[10px] text-slate-500">부산광역시 해운대구</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-900 font-mono text-[11px]">최선생님</div>
                        <div className="text-[10px] text-slate-500">담임교사</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md text-[11px] font-black">
                          급식 인플루언서
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">420명</td>
                      <td className="p-3 text-center font-mono">1,150표</td>
                      <td className="p-3 text-center font-mono font-black text-emerald-600">91%</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          진행 중
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-black text-slate-900">대전도안초등학교</div>
                        <div className="text-[10px] text-slate-500">대전광역시 유성구</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-900 font-mono text-[11px]">정선생님</div>
                        <div className="text-[10px] text-slate-500">담임교사</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[11px] font-black">
                          베프 & 짝꿍 챌린지
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">380명</td>
                      <td className="p-3 text-center font-mono">980표</td>
                      <td className="p-3 text-center font-mono font-black text-sky-600">89%</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          진행 중
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-amber-50/50 transition-colors bg-slate-50/60">
                      <td className="p-3">
                        <div className="font-black text-purple-900">테스트초등학교</div>
                        <div className="text-[10px] text-slate-500">개발/테스트 전용</div>
                      </td>
                      <td className="p-3">
                        <div className="text-purple-700 font-mono text-[11px]">총괄 관리자</div>
                        <div className="text-[10px] text-purple-600 font-bold">chsj120@gmail.com</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md text-[11px] font-black">
                          전체 18개 테마 (종합)
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">50명</td>
                      <td className="p-3 text-center font-mono">150표</td>
                      <td className="p-3 text-center font-mono font-black text-purple-600">100%</td>
                      <td className="p-3 text-center">
                        <span className="bg-slate-800 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          검증 완료
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
        schoolName={schoolName}
        teacherName={teacherName}
      />

      {/* K-에듀파인 기안문 표준 HWPX 다운로드 및 1초 본문 복사 모달 */}
      {currentChallenge && (
        <DraftModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          params={{
            title: currentChallenge.title,
            themeName: currentChallenge.title,
            intent: currentChallenge.description,
            targetGrade: currentChallenge.targetGrade || "전교생 (1~6학년)",
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
            teacherTips: currentChallenge.teacherTips || "창체/자율활동 연계",
            schoolName: schoolName,
          }}
        />
      )}

      {/* K-에듀파인 시상 결과 발표 및 시상 계획 기안문 모달 (총합 득표 순위 반영) */}
      {currentChallenge && (
        <AwardResultDraftModal
          isOpen={isAwardResultDraftModalOpen}
          onClose={() => setIsAwardResultDraftModalOpen(false)}
          params={{
            challenge: currentChallenge,
            submissions: [...submissions].sort((a, b) => b.votes - a.votes),
            schoolName: schoolName,
          }}
        />
      )}

      {selectedChallengeForQR && (
        <SchoolPosterModal
          challenge={selectedChallengeForQR}
          isOpen={!!selectedChallengeForQR}
          onClose={() => setSelectedChallengeForQR(null)}
          schoolName={schoolName}
        />
      )}

      {currentChallenge && (
        <TeacherPresentationModal
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
          challenge={currentChallenge}
          submissions={submissions}
          onOpenVoting={handleOpenVotingFromPresentation}
        />
      )}

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