"use client";

import { useState } from "react";
import { CULTURE_THEMES, SUBJECT_THEMES } from "@/lib/constants";
import { Challenge, ThemeMode, ThemeTemplate } from "@/types";
import { Sparkles, BookOpen, X, Calendar, Users, Vote, EyeOff, PlusCircle } from "lucide-react";

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newChallenge: Challenge) => void;
}

export default function CreateChallengeModal({ isOpen, onClose, onCreate }: CreateChallengeModalProps) {
  // rules.md 지침 2: [탭 1: 학교 문화 & 창체 모드]가 기본 활성 탭
  const [activeTab, setActiveTab] = useState<ThemeMode>("culture");
  const [selectedTheme, setSelectedTheme] = useState<ThemeTemplate>(CULTURE_THEMES[0]);
  
  // 폼 입력 상태
  const [title, setTitle] = useState(CULTURE_THEMES[0].title);
  const [description, setDescription] = useState(CULTURE_THEMES[0].desc);
  const [targetGrade, setTargetGrade] = useState("전교생");
  const [teacherName, setTeacherName] = useState("김하늘 선생님");
  const [submissionDays, setSubmissionDays] = useState(5);
  const [votingDays, setVotingDays] = useState(5);
  const [voteLimitType, setVoteLimitType] = useState<"DAILY_3" | "TOTAL_3">("DAILY_3");
  const [isBlindSubmission, setIsBlindSubmission] = useState(false);

  if (!isOpen) return null;

  const handleSelectTheme = (theme: ThemeTemplate) => {
    setSelectedTheme(theme);
    setTitle(theme.title);
    setDescription(theme.desc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const subEnd = new Date(today);
    subEnd.setDate(subEnd.getDate() + submissionDays);
    const voteEnd = new Date(subEnd);
    voteEnd.setDate(voteEnd.getDate() + votingDays);

    const newChallenge: Challenge = {
      id: `challenge-${Date.now()}`,
      title,
      themeId: selectedTheme.id,
      mode: activeTab,
      icon: selectedTheme.icon,
      tag: selectedTheme.tag,
      description,
      targetGrade,
      teacherName,
      status: "SUBMITTING", // 개설 시 첫 단계는 사진 접수 기간
      submissionEndDate: subEnd.toISOString().split("T")[0],
      votingEndDate: voteEnd.toISOString().split("T")[0],
      voteLimitType,
      isBlindSubmission,
      submissionCount: 0,
      totalVotes: 0,
      createdAt: today.toISOString().split("T")[0],
    };

    onCreate(newChallenge);
    onClose();
  };

  const currentThemeList = activeTab === "culture" ? CULTURE_THEMES : SUBJECT_THEMES;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600 font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">새 학교 사진전(챌린지) 개설</h3>
              <p className="text-xs text-amber-950/80 font-medium">선생님이 개설하면 학생들은 링크나 QR 코드로만 참여합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-amber-500/50 hover:bg-amber-600/50 flex items-center justify-center font-bold text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 본문 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* 1단계: 테마 모드 선택 (rules.md 준수: 창체 기본 활성, 교과 보조) */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              1. 챌린지 테마 선택 (rules.md 표준 15종)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("culture");
                  handleSelectTheme(CULTURE_THEMES[0]);
                }}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "culture"
                    ? "bg-amber-400 text-amber-950 shadow-md border-2 border-amber-500"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>학교 문화 & 창체 모드 (9종)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("subject");
                  handleSelectTheme(SUBJECT_THEMES[0]);
                }}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "subject"
                    ? "bg-sky-500 text-white shadow-md border-2 border-sky-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>정규 교과 수업 모드 (6종)</span>
              </button>
            </div>

            {/* 테마 리스트 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 max-h-48 overflow-y-auto pr-1">
              {currentThemeList.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme)}
                    className={`p-2.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-300"
                        : "bg-white border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">{theme.icon}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {theme.tag}
                      </span>
                    </div>
                    <div className="text-xs font-black text-slate-800 line-clamp-1">{theme.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{theme.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2단계: 챌린지 상세 설정 */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              2. 챌린지 상세 정보
            </label>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">사진전 제목</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-semibold focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">참여 안내 및 규칙 설명</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  참여 대상 (학급/학년)
                </label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold focus:border-amber-400 focus:outline-none bg-white"
                >
                  <option value="전교생">전교생 대상</option>
                  <option value="1학년 전체">1학년 전체</option>
                  <option value="2학년 전체">2학년 전체</option>
                  <option value="3학년 전체">3학년 전체</option>
                  <option value="2학년 3반">우리 학급 전용 (2학년 3반)</option>
                  <option value="동아리">특정 동아리</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">담당 교사명</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-semibold focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 기간 및 투표 규칙 */}
            <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-2xl border border-amber-200">
              <div>
                <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  접수 기간 / 투표 기간
                </label>
                <div className="flex items-center gap-1 text-xs text-slate-700">
                  <span>접수 {submissionDays}일</span>
                  <span>+</span>
                  <span>투표 {votingDays}일</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <Vote className="w-3.5 h-3.5 text-amber-600" />
                  학생 투표 권한
                </label>
                <select
                  value={voteLimitType}
                  onChange={(e) => setVoteLimitType(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded-xl border border-amber-300 text-xs font-bold bg-white"
                >
                  <option value="DAILY_3">1일 3표씩 투표 가능 (추천)</option>
                  <option value="TOTAL_3">챌린지 기간 동안 총 3표</option>
                </select>
              </div>
            </div>

            {/* 블라인드 접수 옵션 */}
            <label className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isBlindSubmission}
                onChange={(e) => setIsBlindSubmission(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
              <EyeOff className="w-4 h-4 text-slate-500" />
              <div className="text-xs">
                <span className="font-bold text-slate-800">접수 기간 타인 출품작 블라인드</span>
                <p className="text-[10px] text-slate-500">투표 기간이 시작되기 전까지 서로의 사진을 가려 모방을 방지합니다.</p>
              </div>
            </label>
          </div>

          {/* 하단 서브밋 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-500 shadow-arcade-amber active:scale-95 transition-all"
            >
              ✨ 사진전 개설 완료 (QR 생성)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
