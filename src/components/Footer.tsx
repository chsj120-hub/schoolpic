"use client";

import React, { useState } from "react";
import { ShieldCheck, Heart, FileText, Lock, Sparkles } from "lucide-react";
import { DeveloperVerificationModal } from "./DeveloperVerificationModal";
import { BUILD_INTEGRITY_INFO } from "@/lib/security";

export function Footer() {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs border-t-[2.5px] border-slate-800 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            {/* 브랜드 및 서비스 소개 */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <span className="text-base font-black text-white tracking-tight font-jua">
                  스쿨픽 (SchoolPick)
                </span>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  초·중·고 공식 사진전 플랫폼
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                교사 업무 0분 자동화 · 3중 초상권 안심 잠금 · 18개 테마 카탈로그 · K-에듀파인 기안문 표준 지원
              </p>
            </div>

            {/* 개발자 무결성 서명 확인 배지 */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400/50 transition-all font-bold text-xs cursor-pointer group shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:text-amber-400 transition-colors" />
                <span>공식 개발자 서명 및 무결성 검증</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-mono">
                  v{BUILD_INTEGRITY_INFO.version}
                </span>
              </button>
            </div>
          </div>

          {/* 법적 고지 및 저작권 명세 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-500 leading-relaxed">
            <div className="space-y-1">
              <p>
                <b>개인정보 안심 원칙</b>: 스쿨픽은 학생 실명 및 민감 개인정보를 일체 수집하지 않으며, 행사 종료 7일 후 모든 사진 데이터를 클라우드에서 영구 파기합니다.
              </p>
              <p>
                {BUILD_INTEGRITY_INFO.copyright} All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-400 font-bold shrink-0">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                개발자 서명 확인
              </button>
              <span>•</span>
              <span className="text-slate-500">K-에듀파인 KS X 6101 호환</span>
              <span>•</span>
              <span className="text-slate-500">Cloudflare R2 & Supabase 연동</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 개발자 인증 서명 모달 */}
      <DeveloperVerificationModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </>
  );
}
