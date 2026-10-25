"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  FileText,
} from "lucide-react";
import { USER_GUIDE_SECTIONS, generateUserGuideMarkdown } from "@/data/userGuideData";

interface TeacherUserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeacherUserGuideModal({ isOpen, onClose }: TeacherUserGuideModalProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // 마크다운 파일 직접 다운로드
  const handleDownloadMarkdown = () => {
    const mdContent = generateUserGuideMarkdown();
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `[스쿨픽]_교사용_통합_운영_매뉴얼_v1.0.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 브라우저 인쇄 모달 (PDF 저장 연동)
  const handlePrint = () => {
    window.print();
  };

  // 텍스트 복사
  const handleCopyAll = () => {
    const mdContent = generateUserGuideMarkdown();
    navigator.clipboard.writeText(mdContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 검색 필터링
  const filteredSections = USER_GUIDE_SECTIONS.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSection =
    USER_GUIDE_SECTIONS.find((s) => s.id === selectedSectionId) || USER_GUIDE_SECTIONS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
      
      {/* 인쇄 스타일 전용 태그 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-manual, #printable-manual * {
            visibility: visible;
          }
          #printable-manual {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="printable-manual"
        className="bg-white rounded-3xl border-[2.5px] border-slate-900 shadow-[0_12px_0_0_#0F172A] w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-4 border-b-[2.5px] border-slate-900 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-950 font-jua">
                  스쿨픽(SchoolPick) 교사용 통합 운영 매뉴얼
                </h2>
                <span className="bg-slate-900 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  OFFICIAL GUIDE
                </span>
              </div>
              <p className="text-xs text-slate-800 font-bold">
                초·중·고 교실 사진전 A부터 Z까지 (3분 개설, 포스터 출력, 안심 초상권, 행정 기안문)
              </p>
            </div>
          </div>

          {/* 우측 빠른 액션 버튼군 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs border-[2px] border-slate-900 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="A4 용지 인쇄 및 PDF 저장"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">인쇄 / PDF 저장</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs border-[2px] border-slate-900 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="마크다운 매뉴얼 파일 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">.md 다운로드</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs border-[2px] border-slate-900 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="전체 내용 클립보드 복사"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? "복사됨!" : "텍스트 복사"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 flex items-center justify-center transition-all cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 본문 레이아웃: 좌측 네비게이션 + 우측 상세 보기 */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* 좌측 사이드바 (섹션 탭 및 검색) */}
          <div className="w-full md:w-80 bg-slate-50 border-r-[2px] border-slate-200 flex flex-col shrink-0 no-print">
            
            {/* 검색창 */}
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="매뉴얼 검색 (예: 기안문, PIN, 투표)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            {/* 섹션 목록 */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSections.map((sec) => {
                const isSelected = sec.id === selectedSectionId;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-2 border-[1.5px] ${
                      isSelected
                        ? "bg-amber-100 border-amber-400 text-slate-950 font-black shadow-xs"
                        : "bg-white border-transparent hover:border-slate-200 text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{sec.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{sec.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {sec.summary}
                        </span>
                      </div>
                    </div>
                    {sec.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                        sec.badge === "필독"
                          ? "bg-rose-100 text-rose-700"
                          : sec.badge === "선생님용"
                          ? "bg-amber-200 text-amber-900"
                          : "bg-sky-100 text-sky-800"
                      }`}>
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 하단 버전 정보 */}
            <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>매뉴얼 버전: v1.0.4</span>
              <span className="text-emerald-700 font-bold">● 최신 규정 반영</span>
            </div>
          </div>

          {/* 우측 상세 뷰어 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
            
            {/* 섹션 타이틀 및 요약 */}
            <div className="space-y-2 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeSection.icon}</span>
                <h3 className="text-lg font-black text-slate-900 font-jua">
                  {activeSection.title}
                </h3>
              </div>
              <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3 rounded-2xl text-xs font-bold leading-relaxed">
                {activeSection.summary}
              </div>
            </div>

            {/* 섹션 본문 단계별 안내 */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                세부 운영 지침 및 실행 절차
              </h4>
              <div className="space-y-2.5">
                {activeSection.content.map((paragraph, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium"
                  >
                    {paragraph}
                  </div>
                ))}
              </div>
            </div>

            {/* 운영 팁 및 주의 사항 */}
            {activeSection.tips && activeSection.tips.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  선생님을 위한 핵심 꿀팁 &amp; 주의사항
                </h4>
                <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 space-y-2">
                  {activeSection.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-950 font-bold">
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 인쇄용 전체 뷰 (인쇄 시 모든 섹션이 순차적으로 출력되도록 처리) */}
            <div className="hidden print:block space-y-8 pt-8">
              {USER_GUIDE_SECTIONS.filter((s) => s.id !== activeSection.id).map((sec) => (
                <div key={sec.id} className="space-y-3 pt-6 border-t border-slate-300">
                  <h3 className="text-base font-black text-slate-900">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-600 italic">{sec.summary}</p>
                  <div className="space-y-1.5 text-xs text-slate-800">
                    {sec.content.map((c, i) => (
                      <p key={i}>• {c}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* 하단 푸터 바 */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>K-에듀파인 기안문 표준 양식 및 학교 개인정보 보호 지침 준수</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs border border-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>매뉴얼 .md 저장</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer transition-all"
            >
              닫기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
