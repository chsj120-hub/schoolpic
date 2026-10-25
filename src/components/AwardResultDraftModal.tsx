"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  FileText,
  Printer,
  Sparkles,
  Trophy,
  Table as TableIcon,
  Receipt,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import {
  AwardDraftParams,
  generateAwardMainDraftText,
  generateAwardAttachment1Text,
  generateAwardAttachment2Text,
  generateFullAwardDraftText,
} from "@/lib/awardResultDraftGenerator";

interface AwardResultDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: AwardDraftParams;
}

type TabType = "main" | "att1" | "att2" | "all";

export function AwardResultDraftModal({
  isOpen,
  onClose,
  params,
}: AwardResultDraftModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("main");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mainDraftText = generateAwardMainDraftText(params);
  const att1Text = generateAwardAttachment1Text(params);
  const att2Text = generateAwardAttachment2Text(params);
  const fullText = generateFullAwardDraftText(params);

  const currentContent =
    activeTab === "main"
      ? mainDraftText
      : activeTab === "att1"
      ? att1Text
      : activeTab === "att2"
      ? att2Text
      : fullText;

  const currentTabName =
    activeTab === "main"
      ? "시상결과기안문"
      : activeTab === "att1"
      ? "붙임1_수상자명단"
      : activeTab === "att2"
      ? "붙임2_지출결의내역"
      : "시상결과기안문_전체";

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([currentContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `[스쿨픽]_${params.schoolName}_${currentTabName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("팝업 차단을 해제해주세요.");
      return;
    }

    const title = `[시상 결과 기안문] ${params.schoolName} ${params.challenge.title || "교내 사진전"}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body {
              font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
              font-size: 11pt;
              line-height: 1.7;
              color: #1e293b;
              margin: 0;
              padding: 0;
            }
            pre {
              white-space: pre-wrap;
              word-break: break-all;
              font-family: inherit;
              margin: 0;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 15pt;
              margin: 0 0 4px 0;
              color: #0f172a;
            }
            .header p {
              font-size: 9pt;
              color: #64748b;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>스쿨픽(SchoolPic) 교원 행정 지원 시스템 | 자동 산출 시상 기안문</p>
          </div>
          <pre>${currentContent}</pre>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border-4 border-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 헤더 */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-inner">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  교내 사진전 결과 발표 및 시상 계획 기안문
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  <Sparkles size={11} /> 결재 서식 즉시 복사
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                K-에듀파인 결과 공문 · [붙임 1] 수상자 명단 · [붙임 2] 부상 지출결의 정산 내역
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-slate-100 border-b-2 border-slate-200 px-4 pt-3 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("main")}
            className={`px-3.5 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
              activeTab === "main"
                ? "bg-white text-slate-950 border-slate-300 shadow-xs translate-y-[2px]"
                : "bg-slate-200/70 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200"
            }`}
          >
            <Trophy size={14} className="text-amber-500" />
            <span>📋 1. 결과 발표 기안문</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-full font-bold">
              본문용
            </span>
          </button>

          <button
            onClick={() => setActiveTab("att1")}
            className={`px-3.5 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
              activeTab === "att1"
                ? "bg-white text-slate-950 border-slate-300 shadow-xs translate-y-[2px]"
                : "bg-slate-200/70 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200"
            }`}
          >
            <TableIcon size={14} className="text-emerald-500" />
            <span>📑 2. [붙임 1] 수상자 명단</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
              한글 표
            </span>
          </button>

          <button
            onClick={() => setActiveTab("att2")}
            className={`px-3.5 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
              activeTab === "att2"
                ? "bg-white text-slate-950 border-slate-300 shadow-xs translate-y-[2px]"
                : "bg-slate-200/70 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200"
            }`}
          >
            <Receipt size={14} className="text-indigo-500" />
            <span>🧾 3. [붙임 2] 지출결의 내역</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full font-bold">
              정산 내역
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
              activeTab === "all"
                ? "bg-white text-slate-950 border-slate-300 shadow-xs translate-y-[2px]"
                : "bg-slate-200/70 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200"
            }`}
          >
            <FileSpreadsheet size={14} className="text-slate-500" />
            <span>📄 전체 통합 서식</span>
          </button>
        </div>

        {/* 액션 버튼 바 */}
        <div className="p-3.5 sm:p-4 bg-amber-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* 1초 복사 버튼 */}
            <button
              onClick={handleCopyText}
              className={`font-black px-4 py-2 rounded-xl border-2 border-slate-900 shadow-sm hover:shadow flex items-center gap-2 text-xs sm:text-sm cursor-pointer transition-all active:scale-95 ${
                copied
                  ? "bg-emerald-500 text-white border-emerald-700"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "클립보드 복사 완료!" : "📋 이 서식 본문 1초 복사"}</span>
            </button>

            {/* A4 인쇄 / PDF 저장 버튼 */}
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-3.5 py-2 rounded-xl border-2 border-slate-900 shadow-xs flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer transition-all hover:border-slate-800"
            >
              <Printer size={16} className="text-slate-700" />
              <span>🖨️ 바로 인쇄 / PDF 저장</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl border border-slate-300 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FileText size={14} />
              <span>텍스트(.txt)</span>
            </button>
          </div>
        </div>

        {/* 안내 배너 */}
        <div className="px-5 py-2 bg-slate-100 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800">
              {activeTab === "main" && "💡 [1. 결과 발표 기안문]:"}
              {activeTab === "att1" && "💡 [2. [붙임 1] 수상자 명단]:"}
              {activeTab === "att2" && "💡 [3. [붙임 2] 지출결의 내역]:"}
              {activeTab === "all" && "💡 [전체 통합 서식]:"}
            </span>
            <span>
              {activeTab === "main" &&
                "K-에듀파인 기안기 본문 창에 붙여넣는 결과 발표 및 시상 내부결재 공문입니다."}
              {activeTab === "att1" &&
                "한글(HWP) 파일에 붙여넣어 첨부할 수상자 명단(순위, 훈격, 학년-반, 성명, 작품명)입니다."}
              {activeTab === "att2" &&
                "기존 계획안의 예산 범위 내 지출을 증빙하는 부상 구입 지출결의 정산 내역입니다."}
              {activeTab === "all" &&
                "공문 기안문 본문과 붙임 1, 붙임 2 전체를 하나로 묶은 통합 문서입니다."}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 hidden md:inline">
            총 출품작: <b className="text-slate-800">{params.submissions.length}점</b>
          </span>
        </div>

        {/* 본문 영역 */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <FileSpreadsheet size={15} className="text-slate-500" />
                문서 본문 미리보기
              </span>
              <button
                onClick={handleCopyText}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-all cursor-pointer flex items-center gap-1"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "복사됨" : "본문 복사"}</span>
              </button>
            </div>
            <pre className="font-mono text-xs sm:text-[13px] text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
              {currentContent}
            </pre>
          </div>
        </div>

        {/* 풋터 안내 */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>
              에듀파인 기안기 또는 한글(HWP) 파일에 <b>[본문 복사]</b> 후 붙여넣어 즉시 결재를 상신할 수 있습니다.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
