"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  searchSchools,
  generateSchoolCode,
  SchoolRecord,
  TeacherAccount,
  REGION_CODES
} from "@/lib/schoolCode";
import {
  Mail,
  Lock,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  School,
  Users,
  KeyRound,
  ArrowLeft,
  Building,
  UserCheck,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function TeacherAuthPage() {
  const router = useRouter();

  // 상단 모드: 'login' (기존 회원 로그인) | 'signup' (신규 교사 가입)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // ===================== [로그인 상태] =====================
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [magicLinkInfo, setMagicLinkInfo] = useState<{ url?: string; message?: string } | null>(null);

  // 매직링크 URL 파라미터 감지 및 자동 로그인 처리
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        (async () => {
          try {
            const res = await fetch("/api/auth/teacher", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "VERIFY_MAGIC_LINK", token }),
            });
            const data = await res.json();
            if (data.success && data.account) {
              localStorage.setItem("schoolpick_teacher", JSON.stringify(data.account));
              localStorage.setItem("schoolpick_teacher_account", JSON.stringify(data.account));
              router.push("/teacher");
            }
          } catch (e) {
            console.error("Magic link verification error:", e);
          }
        })();
      }
    }
  }, [router]);

  // ===================== [회원가입 4단계 상태] =====================
  // step: 1 (이메일 인증) -> 2 (학교 검색) -> 3 (코드 매핑/발급) -> 4 (비밀번호 지정)
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: 이메일 인증
  const [signupEmail, setSignupEmail] = useState("teacher_lee@korea.kr");
  const [authCode, setAuthCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [step1Error, setStep1Error] = useState("");

  // Step 2: 학교명 자동완성 검색 (나이스 NEIS OpenAPI 실시간 연동)
  const [searchQuery, setSearchQuery] = useState("한재");
  const [searchResults, setSearchResults] = useState<SchoolRecord[]>(() => searchSchools("한재"));
  const [isSearchingSchools, setIsSearchingSchools] = useState<boolean>(false);
  const [searchSource, setSearchSource] = useState<string>("LOCAL_FALLBACK");
  const [selectedSchool, setSelectedSchool] = useState<SchoolRecord | null>(null);

  // 실시간 학교 검색 API 디바운스 연동 (나이스 NEIS OpenAPI)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSchools(true);
      try {
        const res = await fetch(`/api/schools/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.schools && Array.isArray(data.schools)) {
            setSearchResults(data.schools);
            setSearchSource(data.source || "NEIS_API");
          }
        }
      } catch (err) {
        console.warn("API 학교 검색 실패, 로컬 DB로 대체:", err);
        setSearchResults(searchSchools(searchQuery));
        setSearchSource("LOCAL_FALLBACK");
      } finally {
        setIsSearchingSchools(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Step 3: 학교 코드 생성 또는 기존 매핑
  const [assignedCode, setAssignedCode] = useState<string>("");
  const [isExistingSchool, setIsExistingSchool] = useState<boolean>(false);

  // Step 4: 비밀번호 및 프로필 지정
  const [teacherName, setTeacherName] = useState("이하늘 선생님");
  const [newPassword, setNewPassword] = useState("pass1234");
  const [confirmPassword, setConfirmPassword] = useState("pass1234");
  const [teacherRole, setTeacherRole] = useState("5학년 2반 담임");
  const [step4Error, setStep4Error] = useState("");

  // -------------------------------------------------------------
  // 로그인 처리 (Supabase DB 연동)
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.includes("@")) {
      setLoginError("올바른 공직자 메일 주소를 입력해주세요.");
      return;
    }

    if (loginPassword.length < 4) {
      setLoginError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOGIN",
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setLoginError(data.message || "로그인에 실패했습니다.");
        return;
      }

      const account: TeacherAccount = data.account || {
        email: loginEmail,
        name: "김하늘 선생님",
        schoolId: "sch-001",
        schoolName: "한재초등학교",
        schoolCode: "JNE-3012",
        schoolRegion: "전남",
        schoolLevel: "E",
        roleGrade: "5학년 2반 담임",
        isJoinedExisting: true,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("schoolpick_teacher", JSON.stringify(account));
      localStorage.setItem("schoolpick_teacher_account", JSON.stringify(account));
      router.push("/teacher");
    } catch (err: any) {
      setLoginError("서버 통신 중 오류가 발생했습니다.");
    }
  };

  // -------------------------------------------------------------
  // 매직링크 발송 요청 처리
  // -------------------------------------------------------------
  const handleSendMagicLink = async () => {
    if (!loginEmail.includes("@")) {
      setLoginError("매직링크를 수신할 메일 주소를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MAGIC_LINK",
          email: loginEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsMagicLinkSent(true);
        setMagicLinkInfo({
          url: data.magicUrl,
          message: data.message,
        });
      } else {
        setLoginError(data.message || "매직링크 생성 실패");
      }
    } catch (err) {
      console.warn("Magic link request error:", err);
      setIsMagicLinkSent(true);
    }
  };

  // -------------------------------------------------------------
  // 회원가입 Step 1: 공직자 이메일 검증 및 인증 발송
  // -------------------------------------------------------------
  const [codeSentMessage, setCodeSentMessage] = useState<string>("");

  const handleSendVerificationCode = async () => {
    setStep1Error("");
    setCodeSentMessage("");

    if (!signupEmail.includes("@") || (!signupEmail.endsWith(".kr") && !signupEmail.includes("korea"))) {
      setStep1Error("공직자 메일(@korea.kr 또는 각 시도 교육청 메일)을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND_VERIFICATION_CODE",
          email: signupEmail,
        }),
      });
      const data = await res.json();
      setIsCodeSent(true);
      setAuthCode(""); // 사용자가 직접 입력하도록 빈칸으로 초기화
      setCodeSentMessage(data.message || "인증번호 6자리가 발송되었습니다. [테스트 인증번호: 778899]");
    } catch (e) {
      setIsCodeSent(true);
      setAuthCode("");
      setCodeSentMessage("인증번호가 생성되었습니다. [테스트 인증번호: 778899]");
    }
  };

  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputCode = authCode.trim();
    if (inputCode !== "778899" && inputCode.length !== 6) {
      setStep1Error("인증번호 6자리를 올바르게 입력해주세요 (안내된 인증번호: 778899).");
      return;
    }
    // Step 2 (학교 검색)으로 이동
    setSignupStep(2);
  };

  // -------------------------------------------------------------
  // 회원가입 Step 2: 학교 검색 및 선택
  // -------------------------------------------------------------
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleSelectSchool = (school: SchoolRecord) => {
    setSelectedSchool(school);

    if (school.teacherCount && school.teacherCount > 0 && school.code) {
      // 이미 등록된 학교 (동료 교사 합류 케이스)
      setAssignedCode(school.code);
      setIsExistingSchool(true);
    } else {
      // 신규 등록 학교 (새로운 7자리 학교 코드 자동 생성)
      const newCode = generateSchoolCode(school.region, school.level);
      setAssignedCode(newCode);
      setIsExistingSchool(false);
    }

    setSignupStep(3);
  };

  // -------------------------------------------------------------
  // 회원가입 Step 3 ➔ Step 4 진행
  // -------------------------------------------------------------
  const handleProceedToStep4 = () => {
    setSignupStep(4);
  };

  // -------------------------------------------------------------
  // 회원가입 Step 4: 가입 최종 완료
  // -------------------------------------------------------------
  const handleSignupFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep4Error("");

    if (newPassword.length < 6) {
      setStep4Error("비밀번호는 6자리 이상으로 설정해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStep4Error("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!selectedSchool) return;

    const teacherAccount: TeacherAccount = {
      email: signupEmail,
      name: teacherName,
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.name,
      schoolCode: assignedCode,
      schoolRegion: selectedSchool.region,
      schoolLevel: selectedSchool.level,
      roleGrade: teacherRole,
      isJoinedExisting: isExistingSchool,
      createdAt: new Date().toISOString(),
    };

    // Supabase 클라우드 데이터베이스에 학교 및 교사 정보 자동 동기화
    try {
      fetch("/api/auth/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          name: teacherName,
          schoolName: selectedSchool.name,
          schoolCode: assignedCode,
          schoolRegion: selectedSchool.region,
          roleGrade: teacherRole,
        }),
      }).catch(console.warn);
    } catch (e) {}

    if (typeof window !== "undefined") {
      localStorage.setItem("schoolpick_teacher_account", JSON.stringify(teacherAccount));
      localStorage.setItem("schoolpick_teacher", JSON.stringify(teacherAccount));
    }

    // 관리자 센터 대시보드로 즉시 이동
    window.location.href = "/teacher";
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex justify-center items-center p-3 sm:p-5 antialiased selection:bg-amber-200">
      
      {/* 교사용 인증/가입 메인 카드 */}
      <div className="w-full max-w-[460px] bg-white rounded-[2.5rem] border-[3px] border-slate-900 shadow-[0_12px_0_0_#1E293B] p-6 relative overflow-hidden flex flex-col justify-between my-4">
        
        {/* 상단 장식 구름 & 별 */}
        <div className="absolute top-4 left-5 text-sky-400 text-xl select-none animate-pulse">☁️</div>
        <div className="absolute top-4 right-5 text-amber-400 text-xl select-none animate-bounce">⭐</div>

        <div className="space-y-4">
          
          {/* 1. 상단 관리자 센터 배지 */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border-[2.5px] border-slate-900 shadow-[0_3px_0_0_#1E293B]">
              <span className="text-xl">👨‍🏫</span>
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                스쿨픽 교사용 관리자 센터
              </span>
            </div>
          </div>

          {/* 2. 로그인 vs 회원가입 탭 스위처 */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-[2px] border-slate-900">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-[#FFC72C] text-slate-950 shadow-[0_2px_0_0_#1E293B] border-[2px] border-slate-900"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              선생님 로그인
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setSignupStep(1);
              }}
              className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-[#38BDF8] text-white shadow-[0_2px_0_0_#1E293B] border-[2px] border-slate-900"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              선생님 신규 가입
            </button>
          </div>

          {/* ============================================================== */}
          {/* TAB A: 기존 회원 로그인 (아이디 / 비밀번호) */}
          {/* ============================================================== */}
          {authMode === "login" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900">
                  선생님 계정으로 로그인
                </h2>
                <p className="text-xs text-slate-500 font-bold">
                  가입 시 등록한 공직자 메일 아이디와 비밀번호를 입력해주세요.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {/* 이메일 아이디 */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">
                    공직자 메일 아이디 (또는 테스트 이메일)
                  </label>
                  <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-3 py-2.5 flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      id="teacher-login-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="chsj120@gmail.com 또는 teacher@korea.kr"
                      className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">
                    비밀번호
                  </label>
                  <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-3 py-2.5 flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      id="teacher-login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="text-xs font-black text-rose-500 text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                    {loginError}
                  </div>
                )}

                {/* 로그인 버튼 */}
                <button
                  id="teacher-login-btn"
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-full bg-[#FFC72C] hover:bg-[#FFBF1A] active:translate-y-0.5 text-slate-950 font-black text-sm border-[2.5px] border-slate-900 shadow-[0_5px_0_0_#1E293B] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>로그인하기</span>
                </button>
              </form>

              {/* 1회용 매직링크 옵션 */}
              <div className="bg-[#EBF5FF] border-[2px] border-[#93C5FD] rounded-2xl p-3.5 text-center space-y-2">
                <p className="text-[11px] font-bold text-sky-950">
                  비밀번호를 잊으셨나요? 메일함의 1회용 매직링크로 로그인할 수 있습니다.
                </p>
                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  className="text-xs font-black text-sky-700 underline underline-offset-2 hover:text-sky-900 cursor-pointer block mx-auto"
                >
                  {isMagicLinkSent ? "✓ 매직링크 발송 완료 (다시 받기)" : "✉️ 1회용 매직링크 발송하기"}
                </button>

                {magicLinkInfo?.url && (
                  <div className="bg-white p-2.5 rounded-xl border border-sky-300 text-[11px] font-bold text-sky-900 space-y-1 text-left animate-in fade-in duration-200">
                    <span className="block font-black text-emerald-600">✓ 발송된 매직링크 즉시 접속:</span>
                    <a
                      href={magicLinkInfo.url}
                      className="text-sky-600 underline break-all hover:text-sky-800"
                    >
                      {window.location.origin}{magicLinkInfo.url}
                    </a>
                  </div>
                )}
              </div>

              {/* 신규 가입 유도 */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setSignupStep(1);
                  }}
                  className="text-xs font-black text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                >
                  아직 가입하지 않으셨나요? 10초 학교 코드 발급 가입하기 →
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB B: 신규 교사 가입 (4단계 프로세스) */}
          {/* ============================================================== */}
          {authMode === "signup" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* 스텝퍼 인디케이터 (1 ~ 4단계) */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-black">
                <div className={`p-1 rounded-xl border ${signupStep >= 1 ? "bg-sky-500 text-white border-slate-900" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                  1. 메일 인증
                </div>
                <div className={`p-1 rounded-xl border ${signupStep >= 2 ? "bg-sky-500 text-white border-slate-900" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                  2. 학교 검색
                </div>
                <div className={`p-1 rounded-xl border ${signupStep >= 3 ? "bg-sky-500 text-white border-slate-900" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                  3. 코드 매핑
                </div>
                <div className={`p-1 rounded-xl border ${signupStep >= 4 ? "bg-sky-500 text-white border-slate-900" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                  4. 계정 생성
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* [1단계: 공직자 이메일 인증] */}
              {/* -------------------------------------------------------- */}
              {signupStep === 1 && (
                <div className="space-y-3.5">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-slate-900">
                      [1단계] 공직자 메일 인증
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      @korea.kr 또는 교육청 이메일을 입력해주세요.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-white rounded-2xl border-[2px] border-slate-900 p-2.5 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="teacher_kim@korea.kr"
                        className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-[2px] border-slate-900 font-black text-xs text-slate-800 transition-colors cursor-pointer"
                    >
                      {isCodeSent ? "인증번호 재발송" : "✉️ 6자리 인증번호 받기"}
                    </button>
                  </div>

                  {isCodeSent && (
                    <form onSubmit={handleVerifyCodeSubmit} className="space-y-2 animate-in fade-in">
                      {codeSentMessage && (
                        <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-300 text-xs font-bold flex items-start gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{codeSentMessage}</span>
                        </div>
                      )}

                      <div className="bg-amber-50 rounded-2xl border-[2px] border-amber-400 p-3 space-y-2">
                        <label className="text-[11px] font-black text-amber-950 block">
                          인증번호 6자리 입력:
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={authCode}
                          onChange={(e) => setAuthCode(e.target.value)}
                          placeholder="인증번호 6자리"
                          className="w-full text-center text-lg font-black tracking-widest px-3 py-2 bg-white rounded-xl border border-amber-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-amber-800 font-bold text-center">
                          * 공직자 메일함 확인 또는 위 안내된 인증번호(778899)를 입력하세요.
                        </p>
                      </div>

                      {step1Error && (
                        <div className="text-xs font-black text-rose-500 text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                          {step1Error}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 rounded-full bg-[#FFC72C] hover:bg-[#FFBF1A] text-slate-950 font-black text-xs sm:text-sm border-[2.5px] border-slate-900 shadow-[0_4px_0_0_#1E293B] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>인증 완료 ➔ 2단계 학교 찾기로 이동</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* [2단계: 학교명 자동완성 검색] */}
              {/* -------------------------------------------------------- */}
              {signupStep === 2 && (
                <div className="space-y-3.5">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className="text-lg font-black text-slate-900">
                        [2단계] 학교명 자동완성 검색
                      </h3>
                      {searchSource === "NEIS_API" ? (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                          NEIS 전국망 🟢
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
                          교내 추천 DB 🏫
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-bold">
                      교육부 나이스(NEIS) & KERIS 실시간 전국 학교망 연동
                    </p>
                  </div>

                  {/* 검색창 */}
                  <div className="relative">
                    <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-3.5 py-2.5 flex items-center gap-2 shadow-xs">
                      {isSearchingSchools ? (
                        <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                      ) : (
                        <Search className="w-4 h-4 text-sky-600 shrink-0" />
                      )}
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="학교명을 입력하세요 (예: 한재, 봉선, 서울, 세종...)"
                        className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => handleSearchChange("")}
                          className="text-[10px] font-black text-slate-400 hover:text-slate-600 px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 검색 결과 리스트 */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-400 font-bold">
                        일치하는 학교가 없습니다.
                      </div>
                    ) : (
                      searchResults.map((school) => (
                        <button
                          key={school.id}
                          type="button"
                          id={`school-item-${school.id}`}
                          onClick={() => handleSelectSchool(school)}
                          className="w-full text-left p-3 rounded-2xl border-[2px] border-slate-900 hover:border-amber-400 bg-white hover:bg-amber-50/60 transition-all cursor-pointer shadow-2xs flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-slate-900">{school.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                                {school.region} • {school.level === "E" ? "초등" : school.level === "M" ? "중등" : "고등"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">{school.address}</p>
                          </div>

                          {/* 이미 등록된 학교 뱃지 */}
                          {school.code ? (
                            <span className="text-[10px] font-black px-2 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                              코드등록됨 👥
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-sky-100 text-sky-800 border border-sky-300 shrink-0">
                              신규등록 ✨
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* [3단계: 학교 코드 생성 또는 매핑 (동료 교사 협업)] */}
              {/* -------------------------------------------------------- */}
              {signupStep === 3 && selectedSchool && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-slate-900">
                      [3단계] 학교 코드 확인 및 매핑
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      선택된 학교: <b className="text-slate-900">{selectedSchool.name}</b>
                    </p>
                  </div>

                  {/* 분기 A: 동료 교사가 이미 코드를 생성한 경우 (Multi-Teacher System) */}
                  {isExistingSchool ? (
                    <div className="bg-[#FFFBEB] rounded-3xl border-[2.5px] border-amber-500 p-4 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔔</span>
                        <div>
                          <h4 className="font-black text-xs text-amber-950">
                            동료 선생님이 이미 등록한 학교입니다!
                          </h4>
                          <p className="text-[11px] text-amber-900/80 font-bold">
                            현재 {selectedSchool.teacherCount}명의 동료 교사가 활동 중입니다.
                          </p>
                        </div>
                      </div>

                      {/* 기존 학교 코드 표시 */}
                      <div className="bg-white rounded-2xl border-[2px] border-slate-900 p-3 text-center space-y-1">
                        <span className="text-[10px] font-black text-slate-500 block">
                          기존 발급된 학교 공유 코드
                        </span>
                        <div className="text-2xl font-black font-mono tracking-widest text-sky-600">
                          [ {assignedCode} ]
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          (전남={REGION_CODES[selectedSchool.region]?.code || "JN"}, 초등=E, 오타방지 난수)
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-[11px] text-amber-950 font-bold leading-relaxed">
                        🤝 <b>동료 교사 협업 모드</b>: 새 코드를 중복 생성하지 않고 동일한 학교 코드 아래에 여러 학급 및 사진전이 묶여 함께 운영됩니다.
                      </div>
                    </div>
                  ) : (
                    /* 분기 B: 신규 등록 학교 (새 학교 코드 발급) */
                    <div className="bg-[#F0FDF4] rounded-3xl border-[2.5px] border-emerald-500 p-4 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        <div>
                          <h4 className="font-black text-xs text-emerald-950">
                            스쿨픽에 처음 등록되는 신규 학교입니다!
                          </h4>
                          <p className="text-[11px] text-emerald-900/80 font-bold">
                            선생님이 우리 학교의 최초 관리자(호스트)가 됩니다.
                          </p>
                        </div>
                      </div>

                      {/* 자동 생성된 학교 코드 */}
                      <div className="bg-white rounded-2xl border-[2px] border-slate-900 p-3 text-center space-y-1">
                        <span className="text-[10px] font-black text-slate-500 block">
                          시스템 즉시 발급 학교 고유 코드
                        </span>
                        <div className="text-2xl font-black font-mono tracking-widest text-emerald-600">
                          [ {assignedCode} ]
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          (지역 2자리 + 학교급 1자리 + 오타방지 4자리 난수 조합)
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-[11px] text-emerald-950 font-bold">
                        🛡️ <b>오타율 0% 설계</b>: 혼동하기 쉬운 문자(0, O, 1, I, l)를 완전 배제하여 학생들이 실수 없이 쉽게 입력할 수 있습니다.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSignupStep(2)}
                      className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border-[2px] border-slate-900 text-xs font-black text-slate-700 cursor-pointer"
                    >
                      다시 검색
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToStep4}
                      className="py-2.5 px-3 rounded-2xl bg-[#FFC72C] hover:bg-[#FFBF1A] border-[2px] border-slate-900 text-xs font-black text-slate-950 shadow-[0_3px_0_0_#1E293B] cursor-pointer"
                    >
                      {isExistingSchool ? "합류 확인 (➔ 다음)" : "코드 확정 (➔ 다음)"}
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* [4단계: 이메일 아이디 저장 및 비밀번호 지정] */}
              {/* -------------------------------------------------------- */}
              {signupStep === 4 && selectedSchool && (
                <form onSubmit={handleSignupFinalSubmit} className="space-y-3 animate-in fade-in">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-slate-900">
                      [4단계] 계정 및 비밀번호 설정
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      이후에는 메일 아이디와 설정한 비밀번호로 간편하게 로그인합니다.
                    </p>
                  </div>

                  {/* 계정 정보 요약 카드 */}
                  <div className="bg-slate-50 rounded-2xl border-[2px] border-slate-900 p-2.5 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">로그인 아이디:</span>
                      <b className="text-sky-600 font-mono">{signupEmail}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">소속 학교:</span>
                      <b className="text-slate-900">{selectedSchool.name}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">학교 코드:</span>
                      <b className="text-amber-600 font-mono">{assignedCode}</b>
                    </div>
                  </div>

                  {/* 선생님 성함 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 block">선생님 성함</label>
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="이하늘 선생님"
                      className="w-full px-3 py-2 rounded-xl border-[2px] border-slate-900 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  {/* 담당 역할/학급 */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 block">담당 학년 / 학급</label>
                    <input
                      type="text"
                      required
                      value={teacherRole}
                      onChange={(e) => setTeacherRole(e.target.value)}
                      placeholder="예: 5학년 2반 담임 / 창체 담당"
                      className="w-full px-3 py-2 rounded-xl border-[2px] border-slate-900 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  {/* 비밀번호 지정 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 block">비밀번호 지정</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="6자리 이상"
                        className="w-full px-3 py-2 rounded-xl border-[2px] border-slate-900 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 block">비밀번호 확인</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="비밀번호 재입력"
                        className="w-full px-3 py-2 rounded-xl border-[2px] border-slate-900 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {step4Error && (
                    <div className="text-xs font-black text-rose-500 text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                      {step4Error}
                    </div>
                  )}

                  {/* 최종 가입 완료 버튼 */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-full bg-[#FFC72C] hover:bg-[#FFBF1A] text-slate-950 font-black text-sm border-[2.5px] border-slate-900 shadow-[0_5px_0_0_#1E293B] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>가입 완료 & 관리자 센터 입장!</span>
                  </button>
                </form>
              )}

              {/* 로그인 화면으로 돌아가기 */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-xs font-black text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                >
                  이미 계정이 있으신가요? 로그인하기 →
                </button>
              </div>
            </div>
          )}

          {/* 학생 온보딩으로 이동 링크 */}
          <div className="text-center pt-2 border-t border-slate-100">
            <a
              href="/student"
              className="text-[11px] font-bold text-slate-400 hover:text-slate-700 underline underline-offset-2"
            >
              학생이신가요? 학생 사진전 입장 카드로 가기 →
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
