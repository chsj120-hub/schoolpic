"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { INITIAL_CHALLENGES, SAMPLE_SUBMISSIONS, getChallengeByIdOrTheme } from "@/lib/constants";
import { Challenge, PhotoSubmission } from "@/types";
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

  // 현재 챌린지 정보 탐색 (ID 및 18개 테마 코드 동적 지원)
  const [challenge, setChallenge] = useState<Challenge>(() => {
    return getChallengeByIdOrTheme(challengeId);
  });

  // URL 파라미터 변경 시 challenge 상태 업데이트 및 서버/로컬스토리지 실시간 동기화
  useEffect(() => {
    if (!params?.id) return;
    const cid = params.id as string;
    const resolved = getChallengeByIdOrTheme(cid);
    setChallenge(resolved);

    // 서버 API 동기화 (원격 개설된 사진전 실시간 수신)
    fetch(`/api/challenges?id=${cid}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.challenge) {
          setChallenge(json.challenge);
        }
      })
      .catch((err) => console.warn("Challenge fetch error:", err));
  }, [params?.id]);

  // 출품작 목록: challenge-1 샘플일 때만 기본 샘플 로드, 신규 개설 사진전은 초기 빈 갤러리([]) 격리 보장
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>(() => {
    if (params?.id === "challenge-1") {
      return SAMPLE_SUBMISSIONS.filter((s) => s.challengeId === "challenge-1");
    }
    return [];
  });

  // Supabase 실시간 출품작 동기화
  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res = await fetch(`/api/submissions?exhibitionId=${params?.id || ""}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          if (data.submissions.length > 0) {
            // DB에서 가져온 해당 사진전 전용 출품작만 표시
            const exhibitionSubmissions = data.submissions.filter(
              (s: any) => !s.challengeId || s.challengeId === (params?.id || "")
            );
            setSubmissions(exhibitionSubmissions);
          } else if (params?.id !== "challenge-1") {
            // 신규 개설된 사진전은 출품작이 0건이면 빈 배열 유지
            setSubmissions([]);
          }
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

  // 학생 프로필 (규칙: 실명 수집 절대 금지! 학년/반/번호/닉네임/핀번호만 사용)
  const [studentGrade, setStudentGrade] = useState<number>(5);
  const [studentClass, setStudentClass] = useState<number>(2);
  const [studentNumber, setStudentNumber] = useState<number>(14);
  const [studentNickname, setStudentNickname] = useState<string>("5반 날다람쥐");
  const [studentPin, setStudentPin] = useState<string>("1234");
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [isProfileEditing, setIsProfileEditing] = useState<boolean>(false);

  // 학생 온보딩/수정 임시 입력 상태
  const [tempGrade, setTempGrade] = useState<number>(5);
  const [tempClass, setTempClass] = useState<number>(2);
  const [tempNumber, setTempNumber] = useState<number>(14);
  const [tempNickname, setTempNickname] = useState<string>("5반 날다람쥐");
  const [tempPin, setTempPin] = useState<string>("1234");

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

  // 다른 사진전 전환 모달 상태
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState<boolean>(false);

  // 고화질 전체보기(라이트박스) 모달 상태 (짤림 방지 전체보기)
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoSubmission | null>(null);

  // 기간 판단 로직 (날짜 및 status 기반 하이브리드)
  const today = new Date().toISOString().slice(0, 10);
  const subStart = challenge.submissionStartDate || "2026-10-25";
  const subEnd = challenge.submissionEndDate || "2026-10-31";
  const voteStart = challenge.votingStartDate || "2026-11-01";
  const voteEnd = challenge.votingEndDate || "2026-11-07";

  const isDateSubmitting = today >= subStart && today <= subEnd;
  const isDateVoting = today >= voteStart && today <= voteEnd;

  // 출품 기간 및 투표 기간 활성화 여부
  const isSubmittingActive =
    challenge.status === "SUBMITTING" || (isDateSubmitting && challenge.status !== "ENDED");
  const isVotingActive =
    challenge.status === "VOTING" || (isDateVoting && challenge.status !== "ENDED");

  // 1) 출품과 투표가 겹치는 기간 (병행)
  const isOverlapPeriod = isSubmittingActive && isVotingActive;
  // 2) 출품 전용 기간
  const isSubmitOnly = isSubmittingActive && !isVotingActive;
  // 3) 투표 전용 기간
  const isVoteOnly = !isSubmittingActive && isVotingActive;
  // 4) 행사 종료 여부
  const isEnded = challenge.status === "ENDED" || (!isSubmittingActive && !isVotingActive && today > voteEnd);

  // 하위 호환용
  const isSubmittingPeriod = isSubmittingActive;
  const isVotingPeriod = isVotingActive;

  // 로컬 스토리지에서 학생 세션 불러오기 (없으면 온보딩 모달 자동 오픈)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("schoolpick_student");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.grade) {
            setStudentGrade(Number(parsed.grade));
            setTempGrade(Number(parsed.grade));
          }
          if (parsed.classNum) {
            setStudentClass(Number(parsed.classNum));
            setTempClass(Number(parsed.classNum));
          }
          if (parsed.studentNum) {
            setStudentNumber(Number(parsed.studentNum));
            setTempNumber(Number(parsed.studentNum));
          }
          if (parsed.nickname) {
            setStudentNickname(parsed.nickname);
            setTempNickname(parsed.nickname);
          }
          if (parsed.pin) {
            setStudentPin(parsed.pin);
            setTempPin(parsed.pin);
          }
        } catch (e) {
          console.error("Failed to parse student session", e);
        }
      } else {
        // 첫 진입 학생 온보딩 모달 오픈
        setIsOnboardingModalOpen(true);
      }
    }
  }, []);

  // 학생 정보 저장 핸들러
  const handleSaveStudentSession = (g: number, c: number, n: number, nick: string, pin: string) => {
    const validG = Math.max(1, Math.min(6, g || 1));
    const validC = Math.max(1, Math.min(30, c || 1));
    const validN = Math.max(1, Math.min(50, n || 1));
    const validNick = (nick || "").trim() || `${validG}-${validC} 작가`;
    const validPin = (pin || "").trim().slice(0, 4) || "1234";

    setStudentGrade(validG);
    setStudentClass(validC);
    setStudentNumber(validN);
    setStudentNickname(validNick);
    setStudentPin(validPin);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "schoolpick_student",
        JSON.stringify({
          grade: validG,
          classNum: validC,
          studentNum: validN,
          nickname: validNick,
          pin: validPin,
        })
      );
    }
  };

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
            studentPin,
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
            studentPin,
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

  // 사진 수정 전용 핀번호 보안 확인 모달 상태
  const [isPinVerifyModalOpen, setIsPinVerifyModalOpen] = useState<boolean>(false);
  const [verifyPinInput, setVerifyPinInput] = useState<string>("");
  const [pinErrorMessage, setPinErrorMessage] = useState<string>("");

  // 사진 첫 출품 전 작가 닉네임 & 핀번호 등록 모달 상태
  const [isArtistRegisterModalOpen, setIsArtistRegisterModalOpen] = useState<boolean>(false);
  const [artistRegisterNickname, setArtistRegisterNickname] = useState<string>("");
  const [artistRegisterPin, setArtistRegisterPin] = useState<string>("");
  const [artistRegisterError, setArtistRegisterError] = useState<string>("");

  // 1인 1작품 제한: 내가 이미 제출한 작품 찾기 (해당 사진전 challenge.id 내에서만 엄격 격리!)
  const myExistingSubmission = submissions.find(
    (s) =>
      (s.challengeId === challenge.id || !s.challengeId) &&
      s.studentGrade === studentGrade &&
      s.studentClass === studentClass &&
      s.studentNumber === studentNumber
  );

  // 출품 모달 열기 핸들러 (수정 시 핀번호 확인 / 첫 출품 시 닉네임&핀번호 필수 설정)
  const handleOpenComposer = () => {
    // 1) 이미 제출한 사진이 있는 경우 -> 핀번호 확인 모달 오픈
    if (myExistingSubmission) {
      setVerifyPinInput("");
      setPinErrorMessage("");
      setIsPinVerifyModalOpen(true);
      return;
    }

    // 2) 처음 사진을 올리는 경우 -> 작가 닉네임과 4자리 핀번호가 없으면 설정 모달 오픈
    const isPinNotReady = !studentPin || studentPin.trim().length !== 4;
    const isNicknameNotReady = !studentNickname || studentNickname.trim().endsWith("번");

    if (isPinNotReady || isNicknameNotReady) {
      setArtistRegisterNickname(isNicknameNotReady ? "" : studentNickname);
      setArtistRegisterPin("");
      setArtistRegisterError("");
      setIsArtistRegisterModalOpen(true);
      return;
    }

    setIsUploadModalOpen(true);
  };

  // 작가 닉네임 & 핀번호 설정 완료 후 출품 모달 진입
  const handleConfirmArtistRegister = () => {
    const cleanNick = artistRegisterNickname.trim();
    const cleanPin = artistRegisterPin.trim().replace(/[^0-9]/g, "").slice(0, 4);

    if (!cleanNick) {
      setArtistRegisterError("작가 닉네임을 입력해 주세요.");
      return;
    }
    if (cleanPin.length !== 4) {
      setArtistRegisterError("안심 핀번호 숫자 4자리를 정확히 입력해 주세요.");
      return;
    }

    handleSaveStudentSession(studentGrade, studentClass, studentNumber, cleanNick, cleanPin);
    setIsArtistRegisterModalOpen(false);
    setIsUploadModalOpen(true);
  };

  // 핀번호 확인 후 수정 모달 진입
  const handleConfirmPinForEdit = () => {
    if (verifyPinInput.trim() !== studentPin) {
      setPinErrorMessage("안심 핀번호 4자리가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }
    setIsPinVerifyModalOpen(false);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-stretch antialiased selection:bg-amber-200">
      {/* 학생 전용 모바일 셸 컨테이너 (최대 480px, 앱 프레임) */}
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
                <div
                  onClick={() => setIsSwitchModalOpen(true)}
                  className="cursor-pointer group flex items-center gap-1 hover:opacity-90 transition-opacity"
                  title="다른 사진전으로 전환하기"
                >
                  <p className="text-[11px] font-black text-amber-950 -mt-0.5 truncate max-w-[170px] group-hover:underline">
                    {challenge.title}
                  </p>
                  <span className="text-[9px] bg-white/90 text-amber-900 font-black px-1.5 py-0.2 rounded-md shrink-0 border border-amber-500/40 shadow-2xs">
                    전환 ▾
                  </span>
                </div>
              </div>
            </div>

            {/* 상단 네비게이션: 학생 화면에서는 학부모관과 선생님 버튼 제거, 전국 교류관만 유지 */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => router.push("/national")}
                className="text-[11px] font-black text-sky-950 bg-sky-100 hover:bg-sky-200 px-2.5 py-1.5 rounded-xl border-2 border-sky-300 transition-colors cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
              >
                <span>🌐</span> 전국 교류관
              </button>
            </div>
          </div>

          {/* 학생 닉네임 프로필 바 */}
          <div className="mt-2.5 bg-amber-500/30 rounded-2xl p-2 px-3 flex items-center justify-between text-xs text-amber-950 font-bold border border-amber-500/40">
            <div
              onClick={() => {
                setTempGrade(studentGrade);
                setTempClass(studentClass);
                setTempNumber(studentNumber);
                setTempNickname(studentNickname);
                setTempPin(studentPin);
                setIsProfileEditing(true);
              }}
              className="flex items-center gap-1.5 truncate cursor-pointer hover:opacity-80"
              title="학생 정보 변경 및 PIN 확인"
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

        {/* 첫 방문 학생 간편 입장 모달 (학년 / 반 / 번호만 입력하면 즉시 입장 및 투표 가능) */}
        {isOnboardingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 border-4 border-amber-400 shadow-2xl space-y-3.5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl mx-auto border-2 border-amber-300">
                  🎒
                </div>
                <h4 className="font-black text-slate-900 text-base">학생 본인 확인 (학년 · 반 · 번호)</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  사진 감상 및 투표를 위해 <b>학년, 반, 번호</b>를 입력해주세요!<br />
                  <span className="text-amber-700 font-bold">* 사진을 직접 출품할 때만 작가 닉네임과 핀번호를 설정합니다.</span>
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">학년 / 반 / 번호</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        placeholder="학년"
                        value={tempGrade}
                        onChange={(e) => setTempGrade(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl border-2 border-slate-200 text-xs text-center font-black focus:border-amber-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 text-center block mt-0.5">학년</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        placeholder="반"
                        value={tempClass}
                        onChange={(e) => setTempClass(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl border-2 border-slate-200 text-xs text-center font-black focus:border-amber-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 text-center block mt-0.5">반</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        placeholder="번호"
                        value={tempNumber}
                        onChange={(e) => setTempNumber(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl border-2 border-slate-200 text-xs text-center font-black focus:border-amber-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 text-center block mt-0.5">번호</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const defaultNick = `${tempGrade}학년 ${tempClass}반 ${tempNumber}번`;
                  handleSaveStudentSession(tempGrade, tempClass, tempNumber, defaultNick, "");
                  setIsOnboardingModalOpen(false);
                }}
                className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm border-2 border-amber-500 shadow-arcade-amber cursor-pointer active:scale-95 transition-all mt-2"
              >
                갤러리 입장 & 투표 시작하기 🚀
              </button>
            </div>
          </div>
        )}

        {/* 사진 첫 출품 전 전용: 작가 닉네임 & 안심 핀번호(4자리) 필수 등록 모달 */}
        {isArtistRegisterModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 border-4 border-amber-400 shadow-2xl space-y-3.5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl mx-auto border-2 border-amber-300">
                  📸
                </div>
                <h4 className="font-black text-slate-900 text-base">작가 등록 & 안심 핀번호 설정</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  사진을 출품하려면 출품작에 표시될 <b>작가 닉네임</b>과<br />
                  향후 사진 수정 및 보호를 위한 <b>안심 핀번호(4자리)</b>를 설정해야 합니다.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">
                    작가 닉네임 (최대 10자)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="예: 5반 날다람쥐, 포토장인"
                    value={artistRegisterNickname}
                    onChange={(e) => {
                      setArtistRegisterNickname(e.target.value);
                      setArtistRegisterError("");
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-black focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black text-slate-700">
                      안심 핀번호 (숫자 4자리)
                    </label>
                    <span className="text-[10px] text-amber-600 font-bold">*수정 및 학부모 확인용</span>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="4자리 숫자 입력 (예: 1234)"
                    value={artistRegisterPin}
                    onChange={(e) => {
                      setArtistRegisterPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4));
                      setArtistRegisterError("");
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-center tracking-widest text-base font-black focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {artistRegisterError && (
                  <p className="text-[11px] text-rose-600 font-bold text-center">
                    ⚠️ {artistRegisterError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsArtistRegisterModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmArtistRegister}
                  className="flex-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs border border-amber-500 shadow-arcade-amber cursor-pointer active:scale-95 transition-all"
                >
                  등록 완료 & 사진 찍기 📸
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 학생 프로필 및 핀번호 수정 팝업 */}
        {isProfileEditing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-xs rounded-3xl p-5 border-4 border-amber-400 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-black text-slate-900 text-sm">내 학생 정보 수정</h4>
                <button onClick={() => setIsProfileEditing(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                개인정보 보호를 위해 실명이 아닌 <b>학년, 반, 번호, 작가 닉네임, 안심 핀번호</b>만 사용합니다.
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={6}
                  placeholder="학년"
                  value={tempGrade}
                  onChange={(e) => setTempGrade(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-xl border-2 border-slate-200 text-xs text-center font-bold"
                />
                <input
                  type="number"
                  min={1}
                  max={30}
                  placeholder="반"
                  value={tempClass}
                  onChange={(e) => setTempClass(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-xl border-2 border-slate-200 text-xs text-center font-bold"
                />
                <input
                  type="number"
                  min={1}
                  max={50}
                  placeholder="번호"
                  value={tempNumber}
                  onChange={(e) => setTempNumber(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-xl border-2 border-slate-200 text-xs text-center font-bold"
                />
              </div>
              <input
                type="text"
                placeholder="멋진 닉네임 입력"
                maxLength={10}
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold focus:border-amber-400 focus:outline-none"
              />
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">안심 핀번호 (4자리)</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="핀번호 (4자리)"
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                  className="w-full px-3 py-1.5 rounded-xl border-2 border-slate-200 text-center tracking-widest text-xs font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  handleSaveStudentSession(tempGrade, tempClass, tempNumber, tempNickname, tempPin);
                  setIsProfileEditing(false);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs border border-amber-500 cursor-pointer active:scale-95"
              >
                수정 완료
              </button>
            </div>
          </div>
        )}

        {/* 사진 수정/재제출 전용 안심 핀번호 확인 모달 */}
        {isPinVerifyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-xs rounded-3xl p-5 border-4 border-amber-400 shadow-2xl space-y-3.5">
              <div className="text-center space-y-1">
                <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center text-xl mx-auto border-2 border-amber-300">
                  🔐
                </div>
                <h4 className="font-black text-slate-900 text-sm">출품 사진 수정 본인 확인</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  장난이나 타인의 수정을 방지하기 위해 등록했던 <b>안심 핀번호(4자리)</b>를 입력해 주세요.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="핀번호 4자리"
                  value={verifyPinInput}
                  onChange={(e) => {
                    setVerifyPinInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 4));
                    setPinErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmPinForEdit();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-center tracking-widest text-base font-black focus:border-amber-400 focus:outline-none"
                />
                {pinErrorMessage && (
                  <p className="text-[10px] text-rose-600 font-bold text-center">
                    ⚠️ {pinErrorMessage}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPinVerifyModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPinForEdit}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs border border-amber-500 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  확인 및 사진 변경
                </button>
              </div>

              <p className="text-[9px] text-slate-400 text-center">
                * 핀번호를 잊어버린 경우 선생님께 초기화를 요청하세요.
              </p>
            </div>
          </div>
        )}

        {/* 우리 학교 사진전 목록 전환 팝업 */}
        {isSwitchModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 border-4 border-amber-400 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="text-lg">📸</span> 우리 학교 진행 중인 사진전
                </h4>
                <button
                  onClick={() => setIsSwitchModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                참여하거나 감상하고 싶은 사진전을 선택하세요:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pt-1">
                {INITIAL_CHALLENGES.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setIsSwitchModalOpen(false);
                      router.push(`/c/${ch.id}`);
                    }}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      ch.id === challenge.id
                        ? "bg-amber-50 border-amber-500 shadow-xs ring-2 ring-amber-300"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{ch.icon || "📷"}</span>
                        <span className="font-black text-xs text-slate-900 truncate">{ch.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {ch.targetGrade || "전교생"} · 담당: {ch.teacherName}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        ch.status === "SUBMITTING"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : ch.status === "VOTING"
                          ? "bg-sky-100 text-sky-800 border border-sky-300"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {ch.status === "SUBMITTING"
                        ? "접수 중"
                        : ch.status === "VOTING"
                        ? "투표 중"
                        : "종료"}
                    </span>
                  </button>
                ))}
              </div>
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

        {/* 5. 내 출품작 관리 카드 (1인 1작품 전용 & 1단계 학생 동의 & 1:1 비밀 피드백함) */}
        <section className="px-4 pb-3">
          {myExistingSubmission ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                  📸 내가 출품한 작품 (접수 완료)
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {challenge.showGradeClassOnFrame
                    ? `${myExistingSubmission.studentGrade}학년 ${myExistingSubmission.studentClass}반 ${myExistingSubmission.studentNumber}번 ${myExistingSubmission.nickname}`
                    : `${myExistingSubmission.nickname} 작가님`}
                </span>
              </div>

              {/* 내 사진 미리보기 */}
              <div
                onClick={() => setLightboxPhoto(myExistingSubmission)}
                className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden cursor-pointer group flex items-center justify-center border border-amber-300"
              >
                <img
                  src={myExistingSubmission.imageUrl}
                  alt={myExistingSubmission.title}
                  className="max-w-full max-h-full object-contain group-hover:scale-102 transition-transform"
                />
                {myExistingSubmission.selectedFrame && (
                  <div className="absolute top-2.5 right-2.5 bg-amber-400/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-900 shadow-xs">
                    🏷️ {myExistingSubmission.selectedFrame}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="bg-black/75 text-white text-xs font-black px-3 py-1.5 rounded-full">
                    🔍 터치하여 크게 보기
                  </span>
                </div>
              </div>

              {/* 작품 설명 */}
              <div>
                <h4 className="font-black text-sm text-slate-900">{myExistingSubmission.title}</h4>
                {myExistingSubmission.caption && (
                  <p className="text-xs text-slate-700 font-maruburi mt-1 bg-white/70 p-2 rounded-xl border border-amber-200">
                    &ldquo;{myExistingSubmission.caption}&rdquo;
                  </p>
                )}
              </div>

              {/* 1단계 학생 동의 체크박스 (오직 내 작품에서만 체크 가능!) */}
              <div className={`rounded-2xl p-3 border transition-all ${
                myExistingSubmission.student_consent
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-white border-sky-300 text-slate-800"
              }`}>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`optin-mine-${myExistingSubmission.id}`}
                    checked={!!myExistingSubmission.student_consent}
                    onChange={() => handleToggleStudentConsent(myExistingSubmission.id)}
                    className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <label htmlFor={`optin-mine-${myExistingSubmission.id}`} className="text-xs font-bold cursor-pointer select-none leading-tight flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-black text-sky-900 text-xs flex items-center gap-1">
                        🌐 1단계: 전국 학교 자랑하기 외부 출품 동의
                      </span>
                      {myExistingSubmission.is_public_shared && (
                        <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                          전국 교류관 등재됨 ✨
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-600 block">
                      타 학교 친구들에게 내 작품을 자랑할까요? 학생 본인의 외부 공개 동의입니다.
                    </span>
                    <div className="text-[10px] text-slate-500 font-normal mt-1 flex flex-wrap items-center gap-2">
                      <span className={myExistingSubmission.student_consent ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                        [1단계 학생]: {myExistingSubmission.student_consent ? "동의 완료 ✓" : "동의 대기 (체크 필요)"}
                      </span>
                      <span>•</span>
                      <span className={myExistingSubmission.parent_consent ? "text-emerald-700 font-bold" : "text-slate-500"}>
                        [2단계 학부모]: {myExistingSubmission.parent_consent ? (myExistingSubmission.paper_parent_consent ? "동의 완료 (서면 종이) ✓" : "동의 완료 (모바일) ✓") : "확인 대기 중"}
                      </span>
                      <span>•</span>
                      <span className={myExistingSubmission.teacher_approval ? "text-emerald-700 font-bold" : "text-slate-500"}>
                        [3단계 교사]: {myExistingSubmission.teacher_approval ? "최종 승인 완료 ✨" : "검수 대기 중"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 1:1 비밀 응원함 (부모님 응원 한마디 & 선생님 칭찬 코멘트 - 출품자 본인에게만 표시) */}
              <div className="space-y-2 pt-1 border-t border-amber-200/80">
                <div className="bg-white/80 rounded-2xl p-2.5 border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-rose-600 font-black">
                    <span>💌</span>
                    <span>우리 부모님의 사랑 가득 응원:</span>
                  </div>
                  {myExistingSubmission.parent_comment ? (
                    <p className="text-slate-800 font-medium pl-4 text-xs font-maruburi">
                      &ldquo;{myExistingSubmission.parent_comment}&rdquo;
                    </p>
                  ) : (
                    <p className="text-slate-400 text-[11px] pl-4">
                      아직 등록된 응원글이 없습니다. (학부모 페이지에서 자녀 확인 후 따뜻한 응원을 남기실 수 있어요)
                    </p>
                  )}
                </div>

                <div className="bg-white/80 rounded-2xl p-2.5 border border-sky-200 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-sky-700 font-black">
                    <span>🧑‍🏫</span>
                    <span>선생님의 칭찬 & 지도 피드백:</span>
                  </div>
                  {myExistingSubmission.teacher_comment ? (
                    <p className="text-slate-800 font-medium pl-4 text-xs font-maruburi">
                      &ldquo;{myExistingSubmission.teacher_comment}&rdquo;
                    </p>
                  ) : (
                    <p className="text-slate-400 text-[11px] pl-4">
                      선생님께서 작품을 확인하고 계십니다.
                    </p>
                  )}
                </div>
              </div>

              {/* 접수 기간 중 사진 교체 버튼 */}
              {isSubmittingPeriod && (
                <button
                  type="button"
                  onClick={handleOpenComposer}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs border border-amber-500 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>내 출품 사진 다시 찍기 / 교체하기</span>
                </button>
              )}
            </div>
          ) : isSubmittingPeriod ? (
            <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl p-5 text-center space-y-3">
              <Camera className="w-10 h-10 text-amber-500 mx-auto" />
              <div>
                <h4 className="text-sm font-black text-slate-800">아직 출품한 사진이 없습니다</h4>
                <p className="text-xs text-slate-500 mt-1">
                  선생님이 열어주신 테마 규칙에 맞춰 나만의 멋진 한 컷을 촬영해보세요! (1인 1작품)
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenComposer}
                className="py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs border-2 border-amber-500 shadow-arcade-amber active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>지금 바로 사진 촬영 및 출품하기</span>
              </button>
            </div>
          ) : null}
        </section>

        {/* 6. 메인 본문: 기간별 분기 (접수 기간 블라인드 VS 투표 기간 전교생 갤러리) */}
        {isSubmitOnly ? (
          /* [접수 전용 기간]: 전교생 갤러리 블라인드(숨김) 처리 & 접수 현황 안내 */
          <main className="px-4 flex-1 space-y-4">
            <div className="bg-slate-50 rounded-3xl border-2 border-slate-200 p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center mx-auto text-2xl">
                🔒
              </div>
              <div className="space-y-1.5">
                <span className="inline-block bg-sky-100 text-sky-800 font-black text-[11px] px-2.5 py-1 rounded-full border border-sky-300">
                  공정한 블라인드 심사 원칙
                </span>
                <h3 className="font-black text-base text-slate-900">
                  현재는 작품 접수 기간입니다
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  친구들의 인기투표 왜곡 및 쏠림을 방지하기 위해, 출품작은 접수 기간 동안 <b>비공개(블라인드)</b>로 안전하게 보호됩니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-around">
                <div>
                  <span className="text-[10px] text-slate-400 block">현재 접수 현황</span>
                  <span className="text-sm font-black text-amber-600">{submissions.length}명 참여 중 🚀</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 block">전교 투표 오픈</span>
                  <span className="text-sm font-black text-sky-600">{challenge.votingStartDate || "투표일"} 오픈 예정 🗳️</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                투표 기간이 시작되면 모든 친구들의 멋진 작품이 일제히 공개되어 자유롭게 공감 투표를 진행할 수 있습니다.
              </p>
            </div>
          </main>
        ) : (
          /* [투표 기간 또는 병행 기간]: 전교생 갤러리 및 투표 UI 노출 */
          <main className="px-4 flex-1 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-800">
                <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>전교생 출품작 투표 갤러리</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {challenge.voteLimitType === "ONE_1"
                  ? "1인 1표 (신중형)"
                  : challenge.voteLimitType === "TOTAL_3"
                  ? "기간 내 총 3표 (선택형)"
                  : "1인 1일 3표 (참여형)"}{" "}
                (투표 진행 중)
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 p-6 space-y-3">
                <Camera className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-bold">아직 등록된 사진이 없습니다.</p>
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

                        {/* 2분할 샷 테마 뱃지 (청소 비포&애프터 culture-11, 도플갱어 culture-12) */}
                        {(challenge.themeId === "culture-11" ||
                          challenge.themeId === "culture-12" ||
                          item.selectedFrame?.includes("비포") ||
                          item.selectedFrame?.includes("도플갱어")) && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-900 shadow-xs flex items-center gap-1">
                            <span>✨</span>
                            <span>
                              {challenge.themeId === "culture-11" ? "Before&After 2분할" : "도플갱어 2분할"}
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
                          {challenge.showGradeClassOnFrame
                            ? `${item.studentGrade}학년 ${item.studentClass}반 ${item.studentNumber}번 ${item.nickname}`
                            : `${item.nickname} 작가님`}
                        </div>

                        {/* 클릭하여 전체보기 힌트 배너 */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="bg-black/75 text-white text-xs font-black px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/20 shadow-lg">
                            🔍 클릭하여 전체보기
                          </span>
                        </div>
                      </div>

                      {/* 카드 하단 정보 & 투표 인터랙션 (다른 학생 작품에는 1단계 학생 동의 체크박스가 없음!) */}
                      <div className="p-4 space-y-2.5">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            출품일: {item.submittedAt}
                          </p>
                        </div>

                        {/* 30자 작가 노트 */}
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

                        {/* 투표 인터랙션 버튼 (투표 획득 수는 비공개, 내 투표 여부만 표기) */}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            {isVoted ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-xl border border-rose-200 text-xs font-black animate-in fade-in">
                                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                                <span>내가 투표한 작품 ✨</span>
                              </div>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-400">
                                마음에 드는 사진에 투표하세요!
                              </span>
                            )}
                          </div>

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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        )}

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
          showGradeClassOnFrame={challenge.showGradeClassOnFrame}
          studentInfo={{
            schoolName: challenge.schoolName || "광주한재초등학교",
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
                  studentPin,
                  schoolCode: challenge.schoolCode || "JNE-3012",
                  schoolName: challenge.schoolName || "우리 학교",
                  studentConsent: false,
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
              student_consent: false,
              parent_consent: false,
              teacher_approval: false,
              is_public_shared: false,
              schoolName: challenge.schoolName || "우리 학교",
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
                {(challenge.themeId === "culture-11" ||
                  challenge.themeId === "culture-12" ||
                  lightboxPhoto.selectedFrame?.includes("비포") ||
                  lightboxPhoto.selectedFrame?.includes("도플갱어")) && (
                  <span className="bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span>✨</span>
                    <span>{challenge.themeId === "culture-11" ? "Before & After 2분할" : "도플갱어 2분할"}</span>
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
    </div>
  );
}
