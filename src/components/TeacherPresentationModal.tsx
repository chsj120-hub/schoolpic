"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PhotoSubmission, Challenge } from "@/types";
import {
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Shuffle,
  ListOrdered,
  CheckCircle2,
  Circle,
  Vote,
  Sparkles,
  Trophy,
  Volume2,
  HelpCircle,
  Smile,
  ShieldCheck
} from "lucide-react";

interface TeacherPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  submissions: PhotoSubmission[];
  onOpenVoting: (challengeId: string) => void;
}

export default function TeacherPresentationModal({
  isOpen,
  onClose,
  challenge,
  submissions,
  onOpenVoting,
}: TeacherPresentationModalProps) {
  // 슬라이드 데이터 및 인덱스 관리
  const [items, setItems] = useState<PhotoSubmission[]>(submissions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 블라인드 모드 토글 (기본 ON: 학년/반/번호 숨기고 닉네임만 노출)
  const [isBlindMode, setIsBlindMode] = useState<boolean>(true);

  // 작가 노트 & 비하인드 팝업 오버레이 토글
  const [showNoteOverlay, setShowNoteOverlay] = useState<boolean>(false);

  // 발표 완료 체크된 작품 ID Set
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());

  // 전체화면 상태
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 초기화 및 정렬 상태
  const [sortMode, setSortMode] = useState<"ordered" | "shuffled">("ordered");

  useEffect(() => {
    setItems(submissions);
    setCurrentIndex(0);
    setCompletedSet(new Set());
  }, [submissions, isOpen]);

  // 슬라이드 순서 셔플(랜덤 뽑기)
  const handleShuffle = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setCurrentIndex(0);
    setSortMode("shuffled");
  };

  // 슬라이드 순서 번호순 정렬
  const handleSortOrdered = () => {
    const ordered = [...items].sort((a, b) => {
      if (a.studentGrade !== b.studentGrade) return a.studentGrade - b.studentGrade;
      if (a.studentClass !== b.studentClass) return a.studentClass - b.studentClass;
      return a.studentNumber - b.studentNumber;
    });
    setItems(ordered);
    setCurrentIndex(0);
    setSortMode("ordered");
  };

  // 이전/다음 슬라이드 탐색
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  // 발표 완료 토글
  const toggleCompleted = (id: string) => {
    setCompletedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 전체화면 전환 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 키보드 방향키 및 무선 프리젠터(PageUp/PageDown), Space, N(노트), F(전체화면), B(블라인드) 단축키
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        if (!document.fullscreenElement) {
          onClose();
        }
      } else if (e.key === "b" || e.key === "B") {
        setIsBlindMode((prev) => !prev);
      } else if (e.key === "n" || e.key === "N") {
        setShowNoteOverlay((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const isCurrentCompleted = completedSet.has(currentItem.id);
  const completionPercentage = Math.round((completedSet.size / items.length) * 100);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* 1. 상단 컨트롤 바 (교사용 컨트롤 & 상태 게이지) */}
      <header className="bg-slate-900/90 backdrop-blur-md px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-4 z-20">
        
        {/* 좌측: 타이틀 및 발표 진행률 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
            📺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                <span>{challenge.title}</span>
                <span className="text-[11px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold border border-sky-400/30">
                  전자칠판 발표 모드
                </span>
              </h2>
            </div>
            {/* 진행률 게이지 */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-0.5">
              <span>
                발표 진행: <b className="text-amber-400">{completedSet.size}</b> / {items.length}명 ({completionPercentage}%)
              </span>
              <div className="w-28 h-2 bg-slate-700 rounded-full overflow-hidden inline-block">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 중앙: 정렬 / 셔플 / 블라인드 토글 도구 모음 */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          
          {/* 번호순 정렬 버튼 */}
          <button
            type="button"
            onClick={handleSortOrdered}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              sortMode === "ordered"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>번호순</span>
          </button>

          {/* 랜덤 셔플(추첨) 버튼 */}
          <button
            type="button"
            onClick={handleShuffle}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              sortMode === "shuffled"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>랜덤 셔플(뽑기)</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-700 mx-1" />

          {/* 블라인드 모드 토글 (공정성/개인정보 보호) */}
          <button
            type="button"
            onClick={() => setIsBlindMode((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              isBlindMode
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                : "bg-rose-500/20 text-rose-300 border-rose-400/40"
            }`}
            title="단축키: B (미러링 화면에서 학생 학번/실명 숨기기)"
          >
            {isBlindMode ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-rose-400" />}
            <span>블라인드: {isBlindMode ? "ON (닉네임만 노출)" : "OFF (학번 노출)"}</span>
          </button>

          {/* 작가 노트 토글 */}
          <button
            type="button"
            onClick={() => setShowNoteOverlay((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              showNoteOverlay
                ? "bg-amber-400 text-slate-950 border-amber-300"
                : "bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700"
            }`}
            title="단축키: N (학생 작가 노트 팝업)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>작가 노트</span>
          </button>
        </div>

        {/* 우측: 전교 투표 오픈 & 전체화면 & 닫기 */}
        <div className="flex items-center gap-2">
          
          {/* 원클릭 전교 투표 오픈 버튼 */}
          <button
            type="button"
            onClick={() => {
              if (confirm("🎉 모든 발표를 마치고 전교생 투표를 공식 시작하시겠습니까?\n모든 학생의 화면이 실시간으로 투표 모드로 전환됩니다.")) {
                onOpenVoting(challenge.id);
                onClose();
              }
            }}
            className="px-4 py-2 rounded-2xl bg-linear-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs border border-white/40 shadow-lg flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Vote className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>전교 투표 오픈</span>
          </button>

          {/* 전체화면 토글 */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="전체화면 (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* 닫기 */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="닫기 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* 2. 중앙 메인 슬라이드 쇼케이스 (고해상도 캔버스/이미지 & 학생 호명 카드) */}
      <main className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        
        {/* 이전 버튼 */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-3xl bg-slate-900/60 hover:bg-slate-800/90 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
          title="이전 작품 (←)"
        >
          <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
        </button>

        {/* 다음 버튼 */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-3xl bg-slate-900/60 hover:bg-slate-800/90 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
          title="다음 작품 (→)"
        >
          <ChevronRight className="w-8 h-8 stroke-[2.5]" />
        </button>

        {/* 작품 메인 카드 (전자칠판 꽉 찬 고화질 뷰) */}
        <div className="relative max-w-5xl max-h-[78vh] w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
          
          <div className="relative w-auto h-full max-h-[72vh] rounded-3xl overflow-hidden border-4 border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-black flex items-center justify-center group">
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="w-full h-full object-contain select-none"
            />

            {/* 발표 학생 호명용 플로팅 카드 (상단 오버레이) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="bg-slate-950/85 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5">
                <span className="text-xl">🎙️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-black text-sm">
                      발표자: {currentItem.nickname} 작가님
                    </span>
                    {!isBlindMode && (
                      <span className="text-sky-300 font-bold text-xs bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-400/30">
                        [{currentItem.studentGrade}학년 {currentItem.studentClass}반 {currentItem.studentNumber}번]
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    작품: &ldquo;{currentItem.title}&rdquo;
                  </p>
                </div>
              </div>

              {/* 프레임 프리셋 라벨 */}
              {currentItem.selectedFrame && (
                <div className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-2xl shadow-lg border border-amber-500">
                  🏷️ {currentItem.selectedFrame}
                </div>
              )}
            </div>

            {/* 순번 배지 (우측 상단) */}
            <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur-md text-white font-mono text-xs font-black px-3 py-1.5 rounded-xl border border-white/20">
              {currentIndex + 1} / {items.length}
            </div>

            {/* 작가 노트 & 비하인드 팝업 오버레이 (카드 위에 반투명으로 팝업) */}
            {showNoteOverlay && currentItem.caption && (
              <div className="absolute bottom-6 left-6 right-6 z-30 bg-slate-950/92 backdrop-blur-md border-2 border-amber-400 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-150">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      <h4 className="text-sm font-jua text-amber-400 tracking-wide">
                        학생이 직접 전하는 작품 비하인드 & 작가 노트 (30자)
                      </h4>
                    </div>
                    <p className="text-base sm:text-xl font-maruburi text-white leading-relaxed pl-1 tracking-tight">
                      &ldquo;{currentItem.caption}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNoteOverlay(false)}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* 3. 하단 컨트롤러 & 썸네일 탐색 내비게이션 바 */}
      <footer className="bg-slate-900/90 backdrop-blur-md px-6 py-3 border-t border-slate-800 flex items-center justify-between gap-4 z-20">
        
        {/* 좌측: 발표 완료 토글 버튼 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleCompleted(currentItem.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-black border-2 transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              isCurrentCompleted
                ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/30"
                : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {isCurrentCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-white stroke-[3]" />
            ) : (
              <Circle className="w-4 h-4 text-slate-400" />
            )}
            <span>{isCurrentCompleted ? "발표 완료됨" : "발표 완료로 체크"}</span>
          </button>

          <span className="text-xs text-slate-400 hidden sm:inline">
            (키보드 <b>스페이스바/방향키</b>로 다음 학생 이동)
          </span>
        </div>

        {/* 중앙: 하단 미니 썸네일 트랙 */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl py-1 scrollbar-none">
          {items.map((sub, idx) => {
            const isSelected = idx === currentIndex;
            const isDone = completedSet.has(sub.id);

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-12 h-9 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-400 scale-110 z-10 shadow-lg"
                    : "border-slate-700 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={sub.imageUrl} alt="" className="w-full h-full object-cover" />
                {isDone && (
                  <div className="absolute inset-0 bg-emerald-500/50 flex items-center justify-center text-white text-[10px] font-black">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 우측: 단축키 안내 힌트 */}
        <div className="text-[11px] text-slate-400 font-bold hidden md:flex items-center gap-3">
          <span>[← / →]: 이전/다음</span>
          <span>[B]: 블라인드</span>
          <span>[N]: 작가노트</span>
          <span>[F]: 전체화면</span>
        </div>

      </footer>
    </div>
  );
}