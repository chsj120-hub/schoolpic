"use client";

import { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  FileText,
  Printer,
  Download,
  QrCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import QRCode from "qrcode";
import {
  HwpxDraftParams,
  generateMainDraftText,
  generateAttachmentDraftText,
  generateParentLetterText,
} from "@/lib/hwpxGenerator";

interface DraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: HwpxDraftParams;
}

type TabType = "main" | "attachment" | "parents";

export function DraftModal({ isOpen, onClose, params }: DraftModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("main");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [studentQrUrl, setStudentQrUrl] = useState<string>("");
  const [parentQrUrl, setParentQrUrl] = useState<string>("");

  const studentTargetUrl = "https://schoolpic.vercel.app/";
  const parentTargetUrl = "https://schoolpic.vercel.app/parents";
  const schoolCode = params.schoolCode || "JNE-3012";

  // QR 코드 실시간 생성 (고해상도 400px)
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(studentTargetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((url) => setStudentQrUrl(url))
      .catch((err) => console.error("Student QR generation error:", err));

    QRCode.toDataURL(parentTargetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((url) => setParentQrUrl(url))
      .catch((err) => console.error("Parent QR generation error:", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const mainDraftText = generateMainDraftText(params);
  const attachmentDraftText = generateAttachmentDraftText(params);
  const parentLetterText = generateParentLetterText(params);

  const currentContent =
    activeTab === "main"
      ? mainDraftText
      : activeTab === "attachment"
      ? attachmentDraftText
      : parentLetterText;

  const currentTabName =
    activeTab === "main"
      ? "공문결재용기안문"
      : activeTab === "attachment"
      ? "붙임_세부실시계획안"
      : "학부모용가정통신문";

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

  const handleCopyLink = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(label);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (e) {
      console.error(e);
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleDownloadQr = (dataUrl: string, filename: string) => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

    const title =
      activeTab === "main"
        ? `[공문 결재 기안문] ${params.schoolName} ${params.title}`
        : activeTab === "attachment"
        ? `[붙임 문서] ${params.title} 세부 실시 계획(안)`
        : `[가정통신문] ${params.schoolName} 사진전 안내 및 학부모 투표`;

    const qrBlock =
      activeTab === "attachment" && studentQrUrl
        ? `
        <div style="margin-top: 30px; padding: 16px; border: 2px dashed #0f172a; border-radius: 12px; text-align: center; max-width: 320px; margin-left: auto; margin-right: auto;">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">[학생 출품 및 감상 접속 QR]</h4>
          <img src="${studentQrUrl}" style="width: 160px; height: 160px; display: block; margin: 0 auto;" />
          <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 600; color: #334155;">스쿨픽 웹: ${studentTargetUrl}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold; color: #2563eb;">학교 고유 코드: ${schoolCode}</p>
        </div>`
        : activeTab === "parents" && parentQrUrl
        ? `
        <div style="margin-top: 30px; padding: 16px; border: 2px dashed #e11d48; border-radius: 12px; text-align: center; max-width: 320px; margin-left: auto; margin-right: auto;">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #be123c;">[학부모 모바일 투표관 접속 QR]</h4>
          <img src="${parentQrUrl}" style="width: 160px; height: 160px; display: block; margin: 0 auto;" />
          <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 600; color: #334155;">투표관 주소: ${parentTargetUrl}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold; color: #e11d48;">학교 고유 코드: ${schoolCode}</p>
        </div>`
        : "";

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
            <p>스쿨픽(SchoolPic) 교원 행정 지원 자동 생성 시스템 | 학교코드: ${schoolCode}</p>
          </div>
          <pre>${currentContent}</pre>
          ${qrBlock}
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
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  교내 사진전 원클릭 행정 서식 세트
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  <Sparkles size={11} /> 100% 무결점 복사 툴
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                K-에듀파인 기안문 · [붙임] 세부 실시 계획(안) · 학부모 가정통신문 &amp; 접속 QR 동봉
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
            className={`px-4 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-t-2 border-x-2 ${
              activeTab === "main"
                ? "bg-white text-slate-950 border-slate-300 shadow-xs translate-y-[2px]"
                : "bg-slate-200/70 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200"
            }`}
          >
            <span>📋 1. 공문 결재용 기안문</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
              에듀파인 본문용
            </span>
          </button>

          <button
            onClick={() => setActiveTab("attachment")}
            className={`px-4 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-t-2 border-x-2 ${
              activeTab === "attachment"
                ? "bg-white text-slate-950 border-slate-300 shadow-xs translate-y-[2px]"
                : "bg-slate-200/70 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200"
            }`}
          >
            <span>📑 2. [붙임] 세부 실시 계획(안)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              한글 출력물 + 학생 QR
            </span>
          </button>

          <button
            onClick={() => setActiveTab("parents")}
            className={`px-4 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-t-2 border-x-2 ${
              activeTab === "parents"
                ? "bg-white text-slate-950 border-slate-300 shadow-xs translate-y-[2px]"
                : "bg-slate-200/70 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200"
            }`}
          >
            <span>💌 3. 학부모용 가정통신문</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                params.enableParentVote
                  ? "bg-rose-100 text-rose-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {params.enableParentVote ? "학부모 투표 연동 + QR" : "안내장 + QR"}
            </span>
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
              {activeTab === "main" && "💡 [1. 공문 결재용 기안문]:"}
              {activeTab === "attachment" && "💡 [2. [붙임] 세부 실시 계획]:"}
              {activeTab === "parents" && "💡 [3. 학부모 가정통신문]:"}
            </span>
            <span>
              {activeTab === "main" &&
                "K-에듀파인 기안기 본문 창에 붙여넣어 내부결재를 올리는 공문 서식입니다."}
              {activeTab === "attachment" &&
                "한글(HWP) 파일에 붙여넣어 결재문서 붙임 파일로 첨부할 세부 계획서입니다."}
              {activeTab === "parents" &&
                "학부모 모바일 투표관 안내와 3중 안심 초상권 안내가 포함된 가정통신문입니다."}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 hidden md:inline">
            학교 코드: <b className="text-slate-800">{schoolCode}</b>
          </span>
        </div>

        {/* 본문 영역 */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">
          {/* [붙임] 탭: 학생용 링크 및 QR 안내 카드 */}
          {activeTab === "attachment" && (
            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="relative p-2 bg-white rounded-xl border-2 border-emerald-300 shadow-xs shrink-0">
                {studentQrUrl ? (
                  <img
                    src={studentQrUrl}
                    alt="학생용 접속 QR코드"
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center bg-slate-100 rounded-lg">
                    <QrCode size={36} className="text-slate-400 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                    학생 출품 &amp; 감상용 접속 안내
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    우리 학교 코드: <strong className="text-emerald-700 font-black">{schoolCode}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  학생들이 스마트폰 카메라로 QR코드를 스캔하면 스쿨픽 모바일 웹(
                  <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">{studentTargetUrl}</code>)에
                  즉시 접속하여 사진을 출품하고 친구들의 작품을 감상할 수 있습니다.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleDownloadQr(studentQrUrl, `[스쿨픽]_학생접수_QR_${schoolCode}.png`)
                    }
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-700 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download size={14} />
                    <span>📥 학생용 QR코드 다운로드 (PNG)</span>
                  </button>
                  <button
                    onClick={() => handleCopyLink(studentTargetUrl, "studentUrl")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {copiedLink === "studentUrl" ? <Check size={13} /> : <ExternalLink size={13} />}
                    <span>{copiedLink === "studentUrl" ? "주소 복사됨!" : "링크 주소 복사"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* [가정통신문] 탭: 학부모 모바일 투표관 안내 및 QR 카드 */}
          {activeTab === "parents" && (
            <div className="bg-white rounded-2xl border-2 border-rose-200 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="relative p-2 bg-white rounded-xl border-2 border-rose-300 shadow-xs shrink-0">
                {parentQrUrl ? (
                  <img
                    src={parentQrUrl}
                    alt="학부모 투표관 접속 QR코드"
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center bg-slate-100 rounded-lg">
                    <QrCode size={36} className="text-slate-400 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-2 py-0.5 rounded-full border border-rose-200">
                    학부모 모바일 투표관 접속 안내
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    우리 학교 코드: <strong className="text-rose-700 font-black">{schoolCode}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  가정통신문에 본 QR코드와 학교 코드를 함께 인쇄하여 배부하면, 학부모님께서 별도 가입 없이
                  안심 모바일 투표관(
                  <code className="text-rose-700 bg-rose-50 px-1 py-0.5 rounded">{parentTargetUrl}</code>)에
                  접속해 자녀의 작품에 하트 응원을 보낼 수 있습니다.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleDownloadQr(parentQrUrl, `[스쿨픽]_학부모투표_QR_${schoolCode}.png`)
                    }
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-rose-700 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download size={14} />
                    <span>📥 학부모용 QR코드 다운로드 (PNG)</span>
                  </button>
                  <button
                    onClick={() => handleCopyLink(parentTargetUrl, "parentUrl")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {copiedLink === "parentUrl" ? <Check size={13} /> : <ExternalLink size={13} />}
                    <span>{copiedLink === "parentUrl" ? "주소 복사됨!" : "링크 주소 복사"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 텍스트 본문 미리보기 */}
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
              손상 위험이 있는 바이너리 다운로드 대신, <b>1초 복사</b> 및 <b>고해상도 QR 다운로드</b>로 에듀파인에 완벽히 호환됩니다.
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
