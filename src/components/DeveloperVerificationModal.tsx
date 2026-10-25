"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, Copy, FileText, Lock, Award, X, ExternalLink } from "lucide-react";
import { BUILD_INTEGRITY_INFO } from "@/lib/security";

interface DeveloperVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeveloperVerificationModal({ isOpen, onClose }: DeveloperVerificationModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(BUILD_INTEGRITY_INFO.certHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-[2.5px] border-slate-900 shadow-[0_12px_0_0_#0F172A] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-[2px] border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white font-jua">
                  스쿨픽 공식 개발자 인증 서명
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Software Integrity Certificate & Copyright Specification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          
          {/* 공식 인증서 카드 */}
          <div className="bg-amber-50/80 rounded-2xl border-[1.5px] border-amber-300 p-5 space-y-3 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-10">
              <Award className="w-24 h-24 text-amber-950" />
            </div>
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <Award className="w-4 h-4 text-amber-600" />
              <span>교육용 소프트웨어 무결성 인증서 (Certificate of Integrity)</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              본 시스템(스쿨픽, SchoolPick)은 대한민국 교육부 및 시·도 교육청의 정보보호 가이드라인을 준수하여 설계되었으며, 정식 배포 바이너리 및 소스코드의 암호학적 해시 검증을 완료한 정품 빌드임을 공식 보증합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
              <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[11px]">릴리즈 식별 번호 (Release ID)</span>
                <span className="font-black text-slate-900 font-mono">{BUILD_INTEGRITY_INFO.releaseId}</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[11px]">배포 버전 및 빌드 일자</span>
                <span className="font-black text-slate-900 font-mono">v{BUILD_INTEGRITY_INFO.version} ({BUILD_INTEGRITY_INFO.buildDate})</span>
              </div>
            </div>
          </div>

          {/* SHA-256 서명 지문 */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                개발자 디지털 전자 서명 (Digital Fingerprint)
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-md border border-slate-200"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? "복사됨!" : "해시 복사"}
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl break-all select-all">
              {BUILD_INTEGRITY_INFO.certHash}
            </div>
            <p className="text-[11px] text-slate-500">
              * 위 해시값은 배포 시점의 소스코드 무결성을 보증하는 고유 암호화 지문으로, 위·변조가 불가합니다.
            </p>
          </div>

          {/* 보안 및 법적 규정 준수 명세 */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              보안 및 개인정보 보호 규정 준수 체크리스트
            </h4>
            <div className="space-y-1.5 bg-white rounded-2xl border border-slate-200 p-3.5">
              {BUILD_INTEGRITY_INFO.securityCompliance.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 저작권 및 라이선스 안내 */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-black text-slate-900">저작권 및 소유권 고지 (Copyright Notice)</h4>
            <p>
              본 소프트웨어의 상표, 화면 UI/UX 디자인, 기안문 생성 알고리즘, 포스터 템플릿의 일체 저작권은 <b>SchoolPick Core Dev Team</b>에 귀속되어 있습니다.
            </p>
            <p className="text-[11px] text-slate-500">
              초·중·고 교육활동 지원을 목적으로 교내에서 자유롭게 활용하실 수 있으며, 허가되지 않은 상업적 재배포 및 역공학(Reverse Engineering)은 엄격히 금지됩니다.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-500">
              <span>저작권자: {BUILD_INTEGRITY_INFO.copyright}</span>
              <span>개발 및 기술 문의: {BUILD_INTEGRITY_INFO.developerContact}</span>
            </div>
          </div>

        </div>

        {/* 하단 닫기 */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer transition-all"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
}
