"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NATIONAL_EXCHANGE_SUBMISSIONS } from "@/lib/constants";
import { PhotoSubmission } from "@/types";
import { Footer } from "@/components/Footer";
import {
  Globe,
  Trophy,
  ShieldCheck,
  Flame,
  ThumbsUp,
  Lightbulb,
  Heart,
  Sparkles,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Lock,
  Smile,
  X,
  Share2,
  LayoutGrid,
  Table as TableIcon,
  MonitorPlay,
  Download,
  Mail,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";

export default function NationalExchangePage() {
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>(NATIONAL_EXCHANGE_SUBMISSIONS);
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedTheme, setSelectedTheme] = useState<string>("ALL");
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoSubmission | null>(null);

  // 뷰 모드: 카드 갤러리형 vs 게시판 리스트형 (요청: 게시판 제작)
  const [viewMode, setViewMode] = useState<"card" | "board">("card");

  // 수업용 전자칠판 전체화면 슬라이드쇼 모드 (요청: 학생들에게 예시로 보여줄 수 있는 기능)
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // URL 쿼리 파라미터 확인 (?view=board 또는 ?mode=presentation)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "board") {
        setViewMode("board");
      }
      if (params.get("mode") === "presentation") {
        setIsPresentationMode(true);
      }
    }
  }, []);

  // 긍정 응원 스탬프 클릭 핸들러 (악플 원천 차단: 오직 4대 긍정 리액션만 가능)
  const handleCheerStamp = (photoId: string, stampType: "fire" | "clap" | "idea" | "heart", e: React.MouseEvent) => {
    e.stopPropagation();
    setSubmissions((prev) =>
      prev.map((item) => {
        if (item.id === photoId) {
          const current = item.cheerStamps || { fire: 0, clap: 0, idea: 0, heart: 0 };
          return {
            ...item,
            cheerStamps: {
              ...current,
              [stampType]: current[stampType] + 1,
            },
          };
        }
        return item;
      })
    );
  };

  // 백업 안내 핸들러
  const handleNotifyDeveloperBackup = () => {
    alert("✉️ [개발자 메일 백업 요청 전송 완료]\n수신처: dev@schoolpick.kr\n내용: 전국 스쿨 교류관 전시 사진 90장 도달에 따른 고화질 ZIP 아카이브 콜드 백업 요청이 전달되었습니다.");
  };

  const handleDownloadArchive = () => {
    alert("📦 [전체 아카이브 백업 다운로드]\n현재 전국 교류관에 등재된 92장의 고화질 사진 및 메타데이터를 ZIP 파일로 생성합니다.");
  };

  // 필터링 적용
  const filteredList = submissions.filter((item) => {
    if (selectedRegion !== "ALL") {
      if (!item.schoolName?.includes(selectedRegion)) return false;
    }
    if (selectedTheme !== "ALL") {
      if (item.selectedFrame !== selectedTheme) return false;
    }
    return true;
  });

  // 슬라이드쇼 키보드 조작
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode) return;
      if (e.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => (prev + 1) % filteredList.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => (prev - 1 + filteredList.length) % filteredList.length);
      } else if (e.key === "Escape") {
        setIsPresentationMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationMode, filteredList.length]);

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-800 pb-20 selection:bg-amber-200">
      
      {/* 1. 상단 글로벌 네비게이션 헤더 */}
      <header className="bg-white border-b-[2.5px] border-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <Link
              href="/teacher"
              className="h-9 px-3 rounded-xl border-2 border-slate-300 hover:border-slate-900 hover:bg-slate-100 transition-all text-slate-700 flex items-center gap-1 text-xs font-black shrink-0"
              title="선생님 관리 화면으로 복귀"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">선생님 화면</span>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0">🌐</span>
              <div className="truncate">
                <h1 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5 truncate">
                  <span className="truncate">전국 스쿨 교류관</span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                    명예의 전당
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold hidden md:block">
                  타 학교 우수작을 예시로 확인하고 교류하는 안심 아카이브
                </p>
              </div>
            </div>
          </div>

          {/* 3단계 안심 인증 마크 & 슬라이드쇼 바로가기 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCurrentSlideIndex(0);
                setIsPresentationMode(true);
              }}
              className="h-9 px-3 sm:px-3.5 rounded-xl border-[2px] border-slate-900 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_2px_0_0_#1E293B] cursor-pointer transition-all shrink-0 whitespace-nowrap"
            >
              <MonitorPlay className="w-4 h-4" />
              <span>수업용 전자칠판 슬라이드쇼</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-xl text-xs font-black shadow-2xs shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3단계 안심 승인</span>
            </div>
          </div>

        </div>
      </header>

      {/* 2. 전국 교류관 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        
        {/* 상단 웰컴 배너 */}
        <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 rounded-3xl border-[2.5px] border-slate-900 p-6 sm:p-7 text-white shadow-[0_6px_0_0_#1E293B] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>전국 초·중·고 공식 우수작 교류 플랫폼</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm">
              다른 학교 친구들은 어떤 사진을 찍었을까요? 🏆
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 font-bold leading-relaxed pt-0.5">
              학생들이 사진을 찍기 전, 재미있는 포즈와 시각 표현을 <b>수업 예시</b>로 보여주세요.<br className="hidden sm:inline" />
              3중 안심 승인(학생·학부모·교사)을 거친 엄선작만 등재되며, <b>선플 응원 스탬프</b>로 격려할 수 있습니다.
            </p>
          </div>

          <div className="absolute right-4 -bottom-6 text-8xl opacity-20 select-none pointer-events-none hidden md:block">
            🏫
          </div>
        </div>

        {/* 3. 서버 자원 보호: 사진 개수 제한 (학교별 5장, 전체 100장) 및 90장 백업/100장 삭제 수명주기 위젯 */}
        <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 p-4 sm:p-5 shadow-[0_4px_0_0_#1E293B] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h3 className="font-black text-xs sm:text-sm text-slate-900">
                서버 자원 보호 쿼터 및 아카이브 수명주기(Lifecycle)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-black">
              <span className="text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                학교별 한도: 학교당 최대 5장
              </span>
              <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                전국 총 전시: 92 / 100장 (92%)
              </span>
            </div>
          </div>

          {/* 용량 프로그레스 바 */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 h-full rounded-full transition-all duration-500" style={{ width: "92%" }} />
            </div>
          </div>

          {/* 90장 이상 백업 권장 안내 배너 & 100장 초과 시 FIFO 삭제 정책 */}
          <div className="bg-amber-50 rounded-2xl border border-amber-300 p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>[서버 용량 90% 도달 알림] 현재 총 92장의 사진이 전시 중입니다.</span>
              </div>
              <p className="text-[11px] text-amber-900 font-medium">
                서버 부하 방지를 위해 <b>개발자 메일로 백업을 권장</b>하며, <b>100장이 차면 앞 순번(오래된 작품)부터 일주일 후 순차 자동 삭제</b>됩니다. (추후 서버 증설 예정)
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleNotifyDeveloperBackup}
                className="px-3 py-1.5 rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-amber-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>개발자 메일 백업 요청</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadArchive}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-white font-black text-xs flex items-center gap-1 hover:bg-slate-800 cursor-pointer shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-200" />
                <span>전체 백업 다운로드</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. 필터 바 & 뷰 모드 토글 (갤러리 카드형 vs 게시판 리스트형) */}
        <div className="bg-white rounded-2xl border-[2px] border-slate-900 p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
          
          {/* 지역 필터 버튼들 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-slate-700 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-sky-600" />
              <span>지역:</span>
            </span>
            {["ALL", "서울", "경기", "광주", "부산"].map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  selectedRegion === reg
                    ? "bg-[#FFC72C] text-slate-950 border-slate-900 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {reg === "ALL" ? "전국 전체" : reg}
              </button>
            ))}
          </div>

          {/* 뷰 모드 토글: 카드형 vs 게시판형 */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-300 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white text-slate-950 shadow-xs border border-slate-300"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>카드형</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === "board"
                    ? "bg-white text-slate-950 shadow-xs border border-slate-300"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>게시판형</span>
              </button>
            </div>

            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              총 <b className="text-sky-600 font-black">{filteredList.length}</b>개 우수작
            </span>
          </div>

        </div>

        {/* 5-A. 게시판 리스트 뷰 (Board View) */}
        {viewMode === "board" && (
          <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 shadow-[0_6px_0_0_#1E293B] overflow-hidden">
            <div className="p-4 bg-slate-50 border-b-2 border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <TableIcon className="w-4 h-4 text-sky-600" />
                <span>전국 스쿨 교류관 공식 우수작 게시판</span>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                * 사진 클릭 시 고화질 원본과 비하인드 스토리가 열립니다.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                    <th className="py-3 px-3 text-center w-12">순번</th>
                    <th className="py-3 px-3 text-center w-20">사진</th>
                    <th className="py-3 px-3 w-36">학교 및 작가</th>
                    <th className="py-3 px-4">작품 제목 & 작가 노트</th>
                    <th className="py-3 px-3 text-center w-36">테마 / 부문</th>
                    <th className="py-3 px-3 text-center w-40">선플 스탬프</th>
                    <th className="py-3 px-3 text-center w-24">보관 상태</th>
                    <th className="py-3 px-3 text-center w-16">보기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredList.map((item, idx) => (
                    <tr
                      key={item.id}
                      onClick={() => setLightboxPhoto(item)}
                      className="hover:bg-sky-50/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        #{idx + 1}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden mx-auto border border-slate-300 flex items-center justify-center group-hover:border-amber-400">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900 truncate">
                          [{item.schoolName}]
                        </div>
                        <div className="text-[11px] text-sky-700 font-bold mt-0.5">
                          작가: {item.nickname}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>3중 안심승인</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-sm text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                          {item.title}
                        </div>
                        {item.caption && (
                          <div className="text-[11px] text-slate-500 font-bold mt-1 line-clamp-1">
                            &ldquo;{item.caption}&rdquo;
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-medium mt-1">
                          등재일: {item.submittedAt}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-amber-100 text-amber-950 text-[11px] font-black px-2.5 py-1 rounded-xl border border-amber-300">
                          {item.special_award_title || item.selectedFrame || "우수작"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleCheerStamp(item.id, "fire", e)}
                            className="px-1.5 py-1 rounded-lg bg-slate-50 hover:bg-amber-100 border border-slate-200 text-[10px] font-black text-slate-700 flex items-center gap-0.5 cursor-pointer"
                            title="멋져요!"
                          >
                            <span>🔥</span>
                            <span>{item.cheerStamps?.fire || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCheerStamp(item.id, "clap", e)}
                            className="px-1.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-100 border border-slate-200 text-[10px] font-black text-slate-700 flex items-center gap-0.5 cursor-pointer"
                            title="대단해요!"
                          >
                            <span>👏</span>
                            <span>{item.cheerStamps?.clap || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCheerStamp(item.id, "idea", e)}
                            className="px-1.5 py-1 rounded-lg bg-slate-50 hover:bg-sky-100 border border-slate-200 text-[10px] font-black text-slate-700 flex items-center gap-0.5 cursor-pointer"
                            title="아이디어 최고!"
                          >
                            <span>💡</span>
                            <span>{item.cheerStamps?.idea || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCheerStamp(item.id, "heart", e)}
                            className="px-1.5 py-1 rounded-lg bg-slate-50 hover:bg-rose-100 border border-slate-200 text-[10px] font-black text-slate-700 flex items-center gap-0.5 cursor-pointer"
                            title="감동이에요!"
                          >
                            <span>💖</span>
                            <span>{item.cheerStamps?.heart || 0}</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {idx === 0 ? (
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-300">
                            정상 전시
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-300">
                            정상 전시
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          className="px-2 py-1 rounded-lg border border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100"
                        >
                          🔍
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5-B. 갤러리 카드 뷰 (Card Grid View) */}
        {viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxPhoto(item)}
                className="bg-white rounded-3xl border-[2.5px] border-slate-900 overflow-hidden shadow-[0_5px_0_0_#1E293B] hover:border-amber-400 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* 사진 썸네일 (가로/세로 비율 전체 표시) */}
                  <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-102"
                    />

                    {/* 수상 뱃지 (특별상 또는 순위) */}
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-xl border border-amber-400/40 shadow-sm flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.special_award_title || "🏆 교내 1위 수상작"}</span>
                    </div>

                    {/* 3단계 승인 완료 인증 뱃지 */}
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/30 shadow-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>3중 안심 승인</span>
                    </div>

                    {/* 학교 가명 및 학년 정보 */}
                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-xl border border-white/20">
                      [{item.schoolName}] 작가: <b className="text-amber-400">{item.nickname}</b>
                    </div>
                  </div>

                  {/* 카드 본문: 타이틀 & 작가 노트 */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-black text-sm sm:text-base text-slate-900 line-clamp-1">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <div className="bg-sky-50 rounded-2xl p-2.5 border border-sky-200 text-xs text-sky-950 font-medium">
                        <p className="line-clamp-2 leading-relaxed">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 하단 선플·클린 긍정 응원 스탬프 4종 바 */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70">
                  <div className="text-[10px] font-black text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>선플 응원 스탬프:</span>
                    <span className="text-sky-600 font-bold">클릭하여 응원</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {/* 스탬프 1: 멋져요 */}
                    <button
                      type="button"
                      onClick={(e) => handleCheerStamp(item.id, "fire", e)}
                      className="py-1.5 px-2 rounded-xl bg-white hover:bg-amber-50 active:scale-90 border border-slate-200 text-[11px] font-black text-slate-800 flex flex-col items-center gap-0.5 shadow-2xs transition-all cursor-pointer"
                      title="멋져요!"
                    >
                      <span>🔥</span>
                      <span className="text-[10px] text-amber-600">{item.cheerStamps?.fire || 0}</span>
                    </button>

                    {/* 스탬프 2: 대단해요 */}
                    <button
                      type="button"
                      onClick={(e) => handleCheerStamp(item.id, "clap", e)}
                      className="py-1.5 px-2 rounded-xl bg-white hover:bg-emerald-50 active:scale-90 border border-slate-200 text-[11px] font-black text-slate-800 flex flex-col items-center gap-0.5 shadow-2xs transition-all cursor-pointer"
                      title="대단해요!"
                    >
                      <span>👏</span>
                      <span className="text-[10px] text-emerald-600">{item.cheerStamps?.clap || 0}</span>
                    </button>

                    {/* 스탬프 3: 아이디어 최고 */}
                    <button
                      type="button"
                      onClick={(e) => handleCheerStamp(item.id, "idea", e)}
                      className="py-1.5 px-2 rounded-xl bg-white hover:bg-sky-50 active:scale-90 border border-slate-200 text-[11px] font-black text-slate-800 flex flex-col items-center gap-0.5 shadow-2xs transition-all cursor-pointer"
                      title="아이디어 최고!"
                    >
                      <span>💡</span>
                      <span className="text-[10px] text-sky-600">{item.cheerStamps?.idea || 0}</span>
                    </button>

                    {/* 스탬프 4: 감동이에요 */}
                    <button
                      type="button"
                      onClick={(e) => handleCheerStamp(item.id, "heart", e)}
                      className="py-1.5 px-2 rounded-xl bg-white hover:bg-rose-50 active:scale-90 border border-slate-200 text-[11px] font-black text-slate-800 flex flex-col items-center gap-0.5 shadow-2xs transition-all cursor-pointer"
                      title="감동이에요!"
                    >
                      <span>💖</span>
                      <span className="text-[10px] text-rose-600">{item.cheerStamps?.heart || 0}</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* 6. 고화질 전체보기 라이트박스 모달 */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-black text-sm">
                [{lightboxPhoto.schoolName}]
              </span>
              <span className="text-white font-extrabold text-sm">
                작가: {lightboxPhoto.nickname}
              </span>
              {lightboxPhoto.special_award_title && (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                  {lightboxPhoto.special_award_title}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center my-3 overflow-hidden">
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.title}
              className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border-2 border-white/10"
            />
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 text-white space-y-1.5">
            <h3 className="font-black text-base text-amber-400">
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

      {/* 7. [신규 기능]: 수업용 전자칠판 전체화면 슬라이드쇼 모드 (학생들에게 예시로 보여주기) */}
      {isPresentationMode && filteredList.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
          
          {/* 상단 컨트롤 바 */}
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📺</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm sm:text-base text-white">
                    [전국 스쿨 교류관] 수업 안내용 우수작 쇼케이스
                  </h3>
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                    슬라이드 {currentSlideIndex + 1} / {filteredList.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  키보드 방향키(←, →) 또는 좌우 버튼으로 넘길 수 있습니다. (종료: ESC)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPresentationMode(false)}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
              <span>쇼케이스 닫기</span>
            </button>
          </div>

          {/* 중앙 메인 사진 및 좌우 슬라이드 내비게이션 버튼 */}
          <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden">
            
            {/* 좌측 이전 버튼 */}
            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + filteredList.length) % filteredList.length)}
              className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 shadow-2xl cursor-pointer transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* 고해상도 작품 사진 */}
            <div className="max-w-4xl max-h-[62vh] flex items-center justify-center">
              <img
                src={filteredList[currentSlideIndex].imageUrl}
                alt={filteredList[currentSlideIndex].title}
                className="max-w-full max-h-[62vh] object-contain rounded-2xl shadow-2xl border-2 border-white/20"
              />
            </div>

            {/* 우측 다음 버튼 */}
            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % filteredList.length)}
              className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 shadow-2xl cursor-pointer transition-all active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* 하단 작품 상세 및 선생님 수업 지도 팁 오버레이 카드 */}
          <div className="bg-slate-900/95 rounded-2xl border border-white/15 p-4 sm:p-5 max-w-4xl mx-auto w-full space-y-2.5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-black text-sm sm:text-base">
                  [{filteredList[currentSlideIndex].schoolName}]
                </span>
                <span className="text-white font-extrabold text-sm sm:text-base">
                  작가: {filteredList[currentSlideIndex].nickname}
                </span>
                {filteredList[currentSlideIndex].special_award_title && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                    {filteredList[currentSlideIndex].special_award_title}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-bold">
                출품 테마: {filteredList[currentSlideIndex].selectedFrame || "공식 챌린지"}
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-black text-amber-300">
                {filteredList[currentSlideIndex].title}
              </h4>
              {filteredList[currentSlideIndex].caption && (
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed mt-1 flex items-start gap-1.5">
                  <span className="text-amber-400 text-base">💬</span>
                  <span>&ldquo;{filteredList[currentSlideIndex].caption}&rdquo;</span>
                </p>
              )}
            </div>

            {/* 교사용 학생 안내 코칭 팁 */}
            <div className="bg-sky-950/80 rounded-xl p-2.5 border border-sky-500/30 text-xs text-sky-200 font-medium flex items-center gap-2">
              <span className="text-base">👨‍🏫</span>
              <span>
                <b>[선생님 지도 팁]:</b> 학생들에게 &ldquo;우리 교실이나 주변 사물을 새로운 앵글에서 바라보고 나만의 기발한 아이디어를 더해보세요!&rdquo; 하고 지도해주세요.
              </span>
            </div>
          </div>

        </div>
      )}

      <Footer />

    </div>
  );
}
