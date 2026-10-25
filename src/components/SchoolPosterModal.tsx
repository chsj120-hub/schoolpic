"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Challenge } from "@/types";
import {
  Printer,
  Download,
  X,
  Sparkles,
  School,
  Share2,
  Check,
  QrCode as QrIcon,
  Users,
  Heart
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface SchoolPosterModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
  schoolName?: string;
}

export default function SchoolPosterModal({
  challenge,
  isOpen,
  onClose,
  schoolName = "한재초등학교",
}: SchoolPosterModalProps) {
  const [targetAudience, setTargetAudience] = useState<"student" | "parent">("student");
  const [studentQrUrl, setStudentQrUrl] = useState<string>("");
  const [parentQrUrl, setParentQrUrl] = useState<string>("");
  const [origin, setOrigin] = useState<string>("");
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const studentShareUrl = `${origin}/c/${challenge.id}`;
  const parentShareUrl = `${origin}/parents?c=${challenge.id}&school=${encodeURIComponent(schoolName)}`;

  // QR 코드 실시간 생성
  useEffect(() => {
    if (isOpen && origin) {
      QRCode.toDataURL(studentShareUrl, {
        width: 380,
        margin: 1,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      }).then(setStudentQrUrl);

      QRCode.toDataURL(parentShareUrl, {
        width: 380,
        margin: 1,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      }).then(setParentQrUrl);
    }
  }, [isOpen, origin, studentShareUrl, parentShareUrl]);

  if (!isOpen) return null;

  const currentQrUrl = targetAudience === "student" ? studentQrUrl : parentQrUrl;
  const currentActionText = targetAudience === "student" 
    ? "QR을 스캔해 사진전에 참가해보세요"
    : "QR을 스캔해 우리 아이에게 따뜻한 공감을 보내주세요";

  // 브라우저 A4 인쇄
  const handlePrint = () => {
    window.print();
  };

  // 실제 A4 PDF 생성 및 다운로드 (html2canvas + jsPDF)
  const handleDownloadPdf = async () => {
    if (!posterRef.current) return;
    try {
      setIsPdfGenerating(true);
      const canvas = await html2canvas(posterRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#FFFEF9",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`스쿨픽_교내홍보포스터_${schoolName}_${challenge.title}_${targetAudience === "student" ? "학생용" : "학부모용"}.pdf`);
    } catch (error) {
      console.error("PDF 생성 에러:", error);
      alert("PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄(PDF로 저장)를 이용해주세요.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] border-[3px] border-slate-900 shadow-[0_16px_0_0_#1E293B] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[95vh]">
        
        {/* 상단 컨트롤 헤더 */}
        <div className="bg-slate-100 px-5 py-3.5 border-b-2 border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖨️</span>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                A4 교내 홍보 포스터 자동 제작기
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                첨부 양식 규격에 맞춘 A4 인쇄 및 실제 PDF 다운로드를 지원합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center font-black cursor-pointer border border-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-트랙 대상 선택 탭: 교내 부착 학생용 vs 가정통신문 학부모용 */}
        <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-950">포스터 대상 선택:</span>
            <div className="bg-white p-1 rounded-xl border border-amber-300 flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setTargetAudience("student")}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                  targetAudience === "student"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>교내 교실 부착용 (학생)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience("parent")}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                  targetAudience === "parent"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>가정통신문용 (학부모)</span>
              </button>
            </div>
          </div>

          {/* 인쇄 및 PDF 저장 버튼 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-3 rounded-xl border border-slate-800 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>바로 인쇄</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="h-8 px-3 rounded-xl border border-slate-900 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isPdfGenerating ? "PDF 생성 중..." : "PDF 다운로드"}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* A4 포스터 메인 뷰어 (첨부된 PDF 스크린샷 디자인 100% 반영) */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-200/60 flex items-center justify-center">
          <div
            ref={posterRef}
            id="printable-poster"
            className="w-full max-w-[460px] aspect-[1/1.414] bg-[#FFFEFA] rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden select-none text-slate-900 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0"
          >
            {/* 상단 귀여운 일러스트 장식 (마스크, 별, 컨페티) */}
            <div className="relative flex items-center justify-between px-2 pt-1">
              {/* 왼쪽 위 가면 스티커 */}
              <div className="w-14 h-14 rounded-full bg-amber-200/80 flex items-center justify-center shadow-xs">
                <span className="text-3xl">🎭</span>
              </div>
              <span className="text-amber-400 text-2xl font-bold">✦</span>
              <span className="text-amber-300 text-lg">✨</span>
              <span className="text-indigo-900 text-3xl font-black">★</span>
            </div>

            {/* 타이틀 영역 */}
            <div className="text-center space-y-1.5 pt-2">
              <h1 className="text-3xl sm:text-4xl font-jua text-[#1E293B] tracking-normal drop-shadow-xs">
                {schoolName} 사진전
              </h1>
              <h2 className="text-lg sm:text-xl font-jua text-sky-900 tracking-normal">
                제1회 {challenge.title.replace(/\([^)]*\)/g, "").trim()} 2026
              </h2>
            </div>

            {/* 중간 캡슐형 일정 및 안내 카드 (첨부 PDF 일치) */}
            <div className="bg-[#FFF4D4] rounded-[2rem] border-2 border-amber-300/80 p-4 sm:p-5 text-center space-y-2 shadow-xs my-2">
              <div className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">
                {currentActionText}
              </div>
              <div className="space-y-0.5 text-[11px] sm:text-xs font-bold text-slate-700">
                <p>
                  사진 접수 {challenge.submissionStartDate || "2026.11.02"} {challenge.submissionStartTime || "09:00"} ~ {challenge.submissionEndDate || "2026.11.06"} {challenge.submissionEndTime || "16:00"}
                </p>
                <p>
                  투표 {challenge.votingStartDate || "2026.11.09"} {challenge.votingStartTime || "09:00"} ~ {challenge.votingEndDate || "2026.11.11"} {challenge.votingEndTime || "17:00"}
                </p>
                <p className="font-black text-slate-900 pt-0.5">{schoolName}</p>
              </div>
            </div>

            {/* 가운데 대형 선명한 QR 코드 */}
            <div className="flex flex-col items-center justify-center my-1 relative">
              <span className="absolute -left-2 top-10 text-indigo-900 text-2xl">★</span>
              <span className="absolute -right-2 bottom-8 text-amber-400 text-2xl font-bold">✦</span>
              
              <div className="bg-white p-3 sm:p-4 rounded-3xl border-2 border-slate-900 shadow-md inline-block">
                {currentQrUrl ? (
                  <img
                    src={currentQrUrl}
                    alt="스쿨픽 접속 QR코드"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">QR 생성 중...</div>
                )}
              </div>

              <span className="text-[10px] font-black text-slate-500 mt-1.5">
                {targetAudience === "student" ? "※ 교실 부착용 (학생 스마트폰/태블릿 스캔)" : "※ 가정통신문 첨부용 (학부모 공감 투표)"}
              </span>
            </div>

            {/* 하단 좌측 테마 뱃지 & 우측 학교 건물 일러스트 (첨부 PDF 일치) */}
            <div className="flex items-end justify-between pt-2 px-1">
              {/* 좌측 하단 테마 뱃지 */}
              <div className="bg-white rounded-2xl border-2 border-slate-900 p-2.5 px-3.5 shadow-sm space-y-0.5 max-w-[200px]">
                <div className="text-xl">🎭</div>
                <div className="font-black text-xs text-slate-900 truncate">
                  {challenge.title.replace(/\([^)]*\)/g, "").trim()}
                </div>
                <div className="text-[9px] font-bold text-slate-500">
                  {challenge.tag || "#상상력 #변신 #재미"}
                </div>
              </div>

              {/* 우측 하단 노란 원 속 학교 건물 일러스트 */}
              <div className="w-24 h-24 rounded-full bg-[#FFDF74] border-2 border-slate-900 flex items-center justify-center shadow-xs relative overflow-hidden">
                <span className="text-4xl">🏫</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
