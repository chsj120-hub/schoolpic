"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  School, 
  Sparkles, 
  Rocket, 
  Lock, 
  User, 
  Camera, 
  Star, 
  Pencil,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  AlertCircle
} from "lucide-react";
import { findStudent, saveOrUpdateStudent, StudentAccount } from "@/lib/studentStorage";

export default function StudentOnboardingPage() {
  const router = useRouter();
  
  // 온보딩 입력값 (초기 빈 상태)
  const [schoolCode, setSchoolCode] = useState("");
  const [grade, setGrade] = useState("");
  const [classNum, setClassNum] = useState("");
  const [studentNum, setStudentNum] = useState("");
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 등록 여부 감지 (최초 등록 vs 재접속)
  const [existingStudent, setExistingStudent] = useState<StudentAccount | null>(null);

  // 학년/반/번호 변경 시 기존 학생 여부 실시간 조회
  useEffect(() => {
    const g = Number(grade);
    const c = Number(classNum);
    const n = Number(studentNum);

    if (g && c && n) {
      const found = findStudent(g, c, n);
      if (found) {
        setExistingStudent(found);
        setNickname(found.nickname);
      } else {
        setExistingStudent(null);
        setNickname("");
      }
      setPin("");
      setErrorMessage("");
    }
  }, [grade, classNum, studentNum]);

  // 교사 발급 코드가 있으면 학교 코드 자동 연동
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTeacher = localStorage.getItem("schoolpick_teacher");
      if (savedTeacher) {
        try {
          const parsed = JSON.parse(savedTeacher);
          if (parsed.schoolCode) setSchoolCode(parsed.schoolCode);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!schoolCode.trim()) {
      setErrorMessage("학교 코드를 입력해주세요.");
      return;
    }
    const g = Number(grade);
    const c = Number(classNum);
    const n = Number(studentNum);

    if (!g || !c || !n) {
      setErrorMessage("학년, 반, 번호를 모두 입력해주세요.");
      return;
    }
    if (pin.length !== 4) {
      setErrorMessage("PIN 비밀번호 4자리를 정확히 입력해주세요.");
      return;
    }

    // 재접속 사용자: PIN 일치 확인!
    if (existingStudent) {
      if (existingStudent.pin !== pin) {
        setErrorMessage("❌ 비밀번호(PIN)가 일치하지 않습니다. 기억나지 않으면 선생님께 PIN 초기화를 요청하세요!");
        return;
      }
    }

    if (!nickname.trim()) {
      setErrorMessage("친구들에게 보일 작가 이름을 입력해주세요.");
      return;
    }

    // 신규 등록 또는 업데이트
    const updatedAccount: StudentAccount = {
      schoolCode,
      grade: g,
      classNum: c,
      studentNum: n,
      nickname: nickname.trim(),
      pin: pin,
      hasSubmitted: existingStudent ? existingStudent.hasSubmitted : false,
      submittedPhotoId: existingStudent ? existingStudent.submittedPhotoId : undefined,
      createdAt: existingStudent ? existingStudent.createdAt : new Date().toISOString(),
    };
    saveOrUpdateStudent(updatedAccount);

    // Supabase 클라우드 데이터베이스에 학생 프로필 및 PIN 실시간 동기화
    try {
      fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolCode,
          grade: g,
          classNum: c,
          studentNum: n,
          pin,
          nickname: nickname.trim(),
        }),
      }).catch(console.warn);
    } catch (e) {}

    // 학생 세션 로컬 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("schoolpick_student", JSON.stringify({
        ...updatedAccount,
        isLoggedIn: true,
        enteredAt: new Date().toISOString()
      }));
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/challenges?schoolCode=${encodeURIComponent(schoolCode)}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.challenges) && data.challenges.length > 0) {
        const active =
          data.challenges.find((ch: any) => ch.status === "SUBMITTING") ||
          data.challenges.find((ch: any) => ch.status === "VOTING") ||
          data.challenges[0];
        if (active?.id) {
          window.location.href = `/c/${active.id}`;
          return;
        }
      }
    } catch (e) {}

    setTimeout(() => {
      // 사진전 갤러리로 입장
      window.location.href = "/c/challenge-1";
    }, 300);
  };

  const isExisting = !!existingStudent;

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex justify-center items-center p-4 antialiased selection:bg-amber-200">
      {/* 모바일 최적화 셸 (최대 420px, 아케이드 카드 스타일) */}
      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] border-[3px] border-slate-900 shadow-[0_12px_0_0_#1E293B] p-6 relative overflow-hidden flex flex-col justify-between my-4">
        
        {/* 상단 장식 별 & 아이콘 */}
        <div className="absolute top-4 left-5 text-amber-400 text-xl select-none animate-pulse">★</div>
        <div className="absolute top-4 right-5 text-sky-400 text-xl select-none animate-bounce">★</div>

        <div className="space-y-4">
          
          {/* 1. 상단 타이틀 영역 */}
          <div className="text-center pt-2 space-y-1">
            <div className="inline-flex items-center justify-center gap-2">
              <span className="text-3xl">🏫</span>
              <h1 className="text-3xl font-jua tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-1">
                <span className="text-amber-500 drop-shadow-[0_2px_0_#B45309]">스쿨</span>
                <span className="text-sky-500 drop-shadow-[0_2px_0_#0369A1]">픽</span>
                <span className="text-xl font-jua text-slate-800 ml-1">(School-Pic)</span>
              </h1>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs font-jua text-slate-800 pt-1">
              <span className="text-sky-500">˗ˋˏ</span>
              <span>우리 학교</span>
              <span className="text-rose-500 font-black">레전드</span>
              <span>사진전에 온 걸</span>
              <span className="text-sky-600 font-black">환영해!</span>
              <span className="text-sky-500">ˎˊ˗</span>
            </div>
          </div>

          {/* 학부모 오진입 방지 및 전용 투표관 바로가기 배너 */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-1.5 font-black text-rose-950">
              <span>👨‍👩‍👧</span>
              <span>학부모님이신가요?</span>
            </div>
            <a
              href="/parents"
              className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] shadow-xs transition-all active:scale-95"
            >
              학부모 전용관 ➔
            </a>
          </div>

          {/* 2. 학생 정보 입력 폼 카드 */}
          <form id="student-onboarding-form" onSubmit={handleEnter} className="space-y-3.5">
            <div className="bg-[#F8FBFF] rounded-[2rem] border-[2.5px] border-slate-900 p-4 space-y-3.5 shadow-inner">
              
              {/* 학교 코드 */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>학교 코드:</span>
                  <span className="text-[10px] font-bold text-slate-400">(기본 배정 코드)</span>
                </label>
                <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-3 py-2 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                  <span className="text-sky-600 font-black text-sm mr-1">[</span>
                  <input
                    id="school-code-input"
                    type="text"
                    required
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    className="w-full text-center text-sm font-black text-slate-900 focus:outline-none bg-transparent tracking-wider"
                    placeholder="KOR-402"
                  />
                  <span className="text-sky-600 font-black text-sm ml-1">]</span>
                </div>
              </div>

              {/* 내 정보 입력 (학년, 반, 번호) - 가로 3분할 */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">
                  내 정보 입력 (학년 / 반 / 번호):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* 학년 */}
                  <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-2 py-1.5 flex items-center justify-center">
                    <span className="text-sky-600 font-black text-xs mr-0.5">[</span>
                    <input
                      id="grade-input"
                      type="number"
                      min="1"
                      max="12"
                      required
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-8 text-center text-sm font-black text-sky-600 focus:outline-none bg-transparent"
                    />
                    <span className="text-sky-600 font-black text-xs ml-0.5 mr-1">]</span>
                    <span className="text-xs font-black text-slate-800">학년</span>
                  </div>

                  {/* 반 */}
                  <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-2 py-1.5 flex items-center justify-center">
                    <span className="text-sky-600 font-black text-xs mr-0.5">[</span>
                    <input
                      id="class-input"
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={classNum}
                      onChange={(e) => setClassNum(e.target.value)}
                      className="w-8 text-center text-sm font-black text-sky-600 focus:outline-none bg-transparent"
                    />
                    <span className="text-sky-600 font-black text-xs ml-0.5 mr-1">]</span>
                    <span className="text-xs font-black text-slate-800">반</span>
                  </div>

                  {/* 번호 */}
                  <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-2 py-1.5 flex items-center justify-center">
                    <span className="text-sky-600 font-black text-xs mr-0.5">[</span>
                    <input
                      id="student-num-input"
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={studentNum}
                      onChange={(e) => setStudentNum(e.target.value)}
                      className="w-8 text-center text-sm font-black text-sky-600 focus:outline-none bg-transparent"
                    />
                    <span className="text-sky-600 font-black text-xs ml-0.5 mr-1">]</span>
                    <span className="text-xs font-black text-slate-800">번</span>
                  </div>
                </div>
              </div>

              {/* 접속 상태 안내 배너 (신규 등록 vs 재접속 로그인) */}
              <div className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                isExisting
                  ? "bg-sky-50 border-sky-300 text-sky-900"
                  : "bg-amber-50 border-amber-300 text-amber-900"
              }`}>
                <span className="text-base">{isExisting ? "🔐" : "✨"}</span>
                <div>
                  <span className="font-black block">
                    {isExisting ? "등록된 학생 계정 확인됨" : "최초 접속 안내 (새 계정 생성)"}
                  </span>
                  <p className="text-[10px] opacity-80 leading-tight">
                    {isExisting
                      ? "이전에 설정한 4자리 PIN 비밀번호를 입력해주세요."
                      : "앞으로 사용할 나만의 4자리 PIN 비밀번호를 직접 설정하세요."}
                  </p>
                </div>
              </div>

              {/* 비밀번호 (PIN 4자리) - 최초 접속 시 설정 / 재접속 시 입력 */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>{isExisting ? "비밀번호 (설정한 PIN 4자리 입력):" : "비밀번호 (새 PIN 4자리 설정):"}</span>
                  <span className="text-[10px] text-sky-600 font-bold">
                    {isExisting ? "선생님 화면에서 확인 가능" : "잊지 않게 기억하기"}
                  </span>
                </label>
                <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-3 py-2 flex items-center justify-center shadow-xs">
                  <input
                    id="pin-input"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full text-center text-lg font-black tracking-[0.4em] text-slate-900 focus:outline-none bg-transparent"
                    placeholder="••••"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 text-center pt-0.5">
                  (분실 시 담임선생님이 0000으로 즉시 초기화 가능)
                </p>
              </div>

              {/* 친구들에게 보일 내 작가 이름 (실명 수집 절대 금지!) */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>친구들에게 보일 내 작가 이름:</span>
                  <span className="text-[10px] text-amber-600 font-extrabold">실명 NO! 닉네임 OK</span>
                </label>
                <div className="bg-white rounded-2xl border-[2px] border-slate-900 px-3 py-2 flex items-center justify-center shadow-xs">
                  <span className="text-sky-600 font-black text-sm mr-1">[</span>
                  <input
                    id="nickname-input"
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full text-center text-sm font-black text-slate-900 focus:outline-none bg-transparent"
                    placeholder="예: 5반 날다람쥐"
                  />
                  <span className="text-sky-600 font-black text-sm ml-1">]</span>
                </div>
              </div>

            </div>

            {/* 에러 메시지 */}
            {errorMessage && (
              <div className="bg-rose-50 border-2 border-rose-300 text-rose-600 rounded-2xl p-2.5 text-xs font-black flex items-center gap-1.5 animate-bounce">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 입장하기 대형 아케이드 버튼 */}
            <button
              id="student-enter-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:translate-y-1 text-slate-950 font-jua text-lg border-[2.5px] border-slate-900 shadow-[0_6px_0_0_#1E293B] active:shadow-[0_2px_0_0_#1E293B] transition-all flex items-center justify-center gap-2 cursor-pointer group tracking-wide"
            >
              <span>{isExisting ? "🔑 PIN 확인하고 입장하기" : "🚀 PIN 설정하고 첫 입장하기!"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

        </div>

        {/* 3. 하단 실명 보호 및 프라이버시 안심 안내 배너 */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] font-black text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>스쿨픽 안심 클린 정책</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-tight">
            우리 학교는 학생들의 개인정보 보호를 위해 실명을 수집하지 않으며,<br />
            오직 닉네임과 학번으로만 안전하게 참여합니다.
          </p>
        </div>

      </div>
    </div>
  );
}