"use client";

import { useState } from "react";
import { X, Download, Copy, Check, FileText } from "lucide-react";
import { generateHwpxDraft, generateDraftText, HwpxDraftParams } from "@/lib/hwpxGenerator";

interface DraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: HwpxDraftParams;
}

export function DraftModal({ isOpen, onClose, params }: DraftModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const draftText = generateDraftText(params);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  const handleDownloadHwpx = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateHwpxDraft(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `[기안문]_${params.schoolName}_${params.title}.hwpx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("한글 HWPX 생성 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([draftText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `[기안문]_${params.schoolName}_${params.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border-4 border-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black">
              📄
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">K-에듀파인 표준 내부결재 기안문</h2>
              <p className="text-xs text-slate-400 font-medium">
                한컴오피스 한글(HWPX) 규격 준수 &amp; 에듀파인 본문 1초 복사 지원
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 액션 버튼 바 */}
        <div className="p-4 bg-amber-50 border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHwpx}
              disabled={isDownloading}
              className="bg-sky-600 hover:bg-sky-500 text-white font-black px-4 py-2.5 rounded-xl border-2 border-slate-900 shadow-sm hover:shadow flex items-center gap-2 text-xs sm:text-sm cursor-pointer transition-all"
            >
              <Download size={16} />
              <span>{isDownloading ? "생성 중..." : "한글(HWPX) 다운로드"}</span>
            </button>

            <button
              onClick={handleCopyText}
              className={`font-black px-4 py-2.5 rounded-xl border-2 border-slate-900 shadow-sm hover:shadow flex items-center gap-2 text-xs sm:text-sm cursor-pointer transition-all ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "복사 완료! (에듀파인에 붙여넣기)" : "📋 본문 전체 복사"}</span>
            </button>
          </div>

          <button
            onClick={handleDownloadTxt}
            className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl border border-slate-300 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <FileText size={14} />
            <span>텍스트(.txt)</span>
          </button>
        </div>

        {/* 기안문 미리보기 본문 */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 border-inner">
          {draftText}
        </div>

        {/* 풋터 안내 */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>💡 팁: 에듀파인 기안 작성창에서 [본문 복사] 후 Ctrl+V로 붙여넣으면 즉시 결재 기안이 완성됩니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
