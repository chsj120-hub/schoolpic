"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Challenge } from "@/types";
import { Copy, Check, Printer, ExternalLink, X, QrCode as QrIcon, Smartphone } from "lucide-react";

interface QRCodeModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ challenge, isOpen, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const shareUrl = `${origin}/c/${challenge.id}`;

  useEffect(() => {
    if (isOpen && shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* 상단 닫기 헤더 */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-600 font-bold">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">학생·학부모 전용 접속 QR / 링크</h3>
              <p className="text-xs text-amber-950/80 font-medium">카메라로 비추면 바로 챌린지에 참여할 수 있습니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-amber-500/50 hover:bg-amber-600/50 flex items-center justify-center font-bold text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 본문 (인쇄 영역) */}
        <div ref={printRef} className="p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-300">
            <span>대상: <b>{challenge.targetGrade}</b></span>
            <span>•</span>
            <span>개설교사: <b>{challenge.teacherName}</b></span>
          </div>

          <h2 className="text-xl font-black text-slate-900 leading-snug">
            {challenge.icon} {challenge.title}
          </h2>

          <p className="text-xs text-slate-600 px-4 line-clamp-2">
            {challenge.description}
          </p>

          {/* QR 이미지 카드 */}
          <div className="bg-amber-50/60 p-5 rounded-3xl border-2 border-dashed border-amber-300 inline-block shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="학생 접속용 QR 코드"
                className="w-56 h-56 mx-auto rounded-2xl shadow-md border-2 border-white"
              />
            ) : (
              <div className="w-56 h-56 mx-auto flex items-center justify-center text-xs text-slate-400">
                QR 생성 중...
              </div>
            )}
            <p className="text-[11px] font-bold text-amber-800 mt-2 flex items-center justify-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              스마트폰 기본 카메라 앱으로 스캔하세요
            </p>
          </div>

          {/* URL 복사 박스 */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-600 pl-1">접속 단축 링크</label>
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-300">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent text-xs font-mono text-slate-800 flex-1 px-2 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "복사됨!" : "복사"}</span>
              </button>
            </div>
          </div>

          {/* 하단 버튼 액션 바 */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>교실 부착용 인쇄하기</span>
            </button>
            <a
              href={`/c/${challenge.id}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>학생 화면 직접 열기</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
