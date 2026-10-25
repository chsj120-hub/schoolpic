"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Camera, 
  SwitchCamera, 
  Upload, 
  X, 
  Sparkles, 
  Download, 
  Check, 
  RefreshCw, 
  Smile, 
  Move, 
  Trash2, 
  Layers, 
  Info, 
  Sparkle
} from "lucide-react";
import { 
  getFramesForTheme, 
  getStickersForTheme, 
  FrameDefinition, 
  StickerDefinition 
} from "@/lib/stickerRegistry";

// 실물 이미지 스티커 렌더링 성능을 위한 인메모리 이미지 캐시
const stickerImageCache = new Map<string, HTMLImageElement>();

export type FramePresetType = string;

export interface PlacedSticker {
  uid: string; // 인스턴스 고유 ID
  stickerId: string;
  name: string;
  text: string;
  icon?: string;
  imageSrc?: string; // 실물 이미지 스티커 파일 경로
  bg: string;
  color: string;
  border?: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
}

interface CameraCanvasComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: {
    blob: Blob;
    dataUrl: string;
    title: string;
    caption: string;
    preset: string;
    appliedStickers?: PlacedSticker[];
  }) => void;
  themeId?: string;
  themeTitle?: string;
  studentInfo?: {
    schoolName?: string;
    grade: number;
    classNum: number;
    studentNum: number;
    nickname: string;
  };
}

export default function CameraCanvasComposerModal({
  isOpen,
  onClose,
  onComplete,
  themeId = "culture-1",
  themeTitle = "0원 코스프레",
  studentInfo = {
    schoolName: "OO초등학교",
    grade: 5,
    classNum: 2,
    studentNum: 14,
    nickname: "5반 날다람쥐",
  },
}: CameraCanvasComposerModalProps) {
  // 모드: 'camera' (실시간 촬영 중) | 'preview' (촬영/선택 후 Canvas 합성 미리보기)
  const [viewMode, setViewMode] = useState<"camera" | "preview">("camera");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // 1. 프레임 & 스티커 레지스트리 목록 로드
  const availableFrames = getFramesForTheme(themeId);
  const availableStickers = getStickersForTheme(themeId);

  // 선택된 프레임 (기본값: 첫 번째 전용 프레임 또는 첫 번째 프레임)
  const defaultFrame = availableFrames.find((f) => f.themeId === themeId) || availableFrames[0];
  const [selectedFrame, setSelectedFrame] = useState<FrameDefinition>(defaultFrame);

  // 배치된 스티커 목록
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  // 현재 드래그 중인 스티커 uid
  const [draggingStickerUid, setDraggingStickerUid] = useState<string | null>(null);

  // 작품 제목 및 30자 이내 작품 설명 (작가 노트)
  const [photoTitle, setPhotoTitle] = useState("");
  const [caption, setCaption] = useState("");

  // 원본 캡처 이미지 (HTMLImageElement 생성용 DataURL) 및 종횡비
  const [rawImageDataUrl, setRawImageDataUrl] = useState<string | null>(null);
  const [rawImageAspect, setRawImageAspect] = useState<number>(4 / 3);
  // 최종 합성된 이미지 DataURL & Blob
  const [composedDataUrl, setComposedDataUrl] = useState<string | null>(null);
  const [composedBlob, setComposedBlob] = useState<Blob | null>(null);
  const [fileSizeKb, setFileSizeKb] = useState<number>(0);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // 테마가 변경될 때 기본 프레임 재설정
  useEffect(() => {
    const frames = getFramesForTheme(themeId);
    const target = frames.find((f) => f.themeId === themeId) || frames[0];
    if (target) setSelectedFrame(target);
  }, [themeId]);

  // ============================================================================
  // 1. 카메라 스트림 시작 & 중지
  // ============================================================================
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("브라우저가 카메라 접근(getUserMedia)을 지원하지 않습니다.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera init error:", err);
      setIsCameraActive(false);
      setCameraError(
        "카메라 장치를 감지할 수 없거나 브라우저 권한이 차단되었습니다. 아래 '앨범 선택' 버튼으로 사진을 직접 등록할 수 있습니다."
      );
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // 모달 열림 상태에 따라 카메라 라이프사이클 관리
  useEffect(() => {
    if (isOpen && viewMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, viewMode, startCamera, stopCamera]);

  // 모달이 처음 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setViewMode("camera");
      setPlacedStickers([]);
      setPhotoTitle("");
      setCaption("");
      setRawImageDataUrl(null);
      setComposedDataUrl(null);
      setComposedBlob(null);
    }
  }, [isOpen]);

  // 전/후면 카메라 전환
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // ============================================================================
  // 2. 비디오 캡처 또는 앨범 사진 선택
  // ============================================================================
  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth || 640;
    tempCanvas.height = video.videoHeight || 480;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(tempCanvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.95);
    setRawImageDataUrl(dataUrl);
    stopCamera();
    setViewMode("preview");
  };

  const handleAlbumSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRawImageDataUrl(dataUrl);
      stopCamera();
      setViewMode("preview");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ============================================================================
  // 3. 스티커 추가, 삭제 및 드래그 앤 드롭 이동 로직
  // ============================================================================
  const handleAddSticker = (stickerDef: StickerDefinition) => {
    const newPlaced: PlacedSticker = {
      uid: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      stickerId: stickerDef.id,
      name: stickerDef.name,
      text: stickerDef.text,
      icon: stickerDef.icon,
      imageSrc: stickerDef.imageSrc,
      bg: stickerDef.bg,
      color: stickerDef.color,
      border: stickerDef.border,
      // 캔버스 중앙 근처에 랜덤 오프셋을 두어 겹치지 않게 배치
      x: 35 + (placedStickers.length % 5) * 6,
      y: 40 + (placedStickers.length % 5) * 6,
    };
    setPlacedStickers((prev) => [...prev, newPlaced]);
  };

  const handleRemoveSticker = (uid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedStickers((prev) => prev.filter((s) => s.uid !== uid));
  };

  // 드래그 시작 (마우스/터치)
  const handleDragStart = (uid: string, clientX: number, clientY: number) => {
    setDraggingStickerUid(uid);
  };

  // 터치/마우스 이벤트 처리
  useEffect(() => {
    if (!draggingStickerUid) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!previewContainerRef.current) return;
      const rect = previewContainerRef.current.getBoundingClientRect();

      let clientX = 0;
      let clientY = 0;
      if ("touches" in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // 백분율 계산 (0% ~ 100%)
      const relX = ((clientX - rect.left) / rect.width) * 100;
      const relY = ((clientY - rect.top) / rect.height) * 100;

      // 경계 제한 (스티커 크기 감안 5% ~ 90%)
      const clampedX = Math.max(5, Math.min(90, relX));
      const clampedY = Math.max(5, Math.min(90, relY));

      setPlacedStickers((prev) =>
        prev.map((item) =>
          item.uid === draggingStickerUid ? { ...item, x: clampedX, y: clampedY } : item
        )
      );
    };

    const handlePointerUp = () => {
      setDraggingStickerUid(null);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [draggingStickerUid]);

  // ============================================================================
  // 4. Canvas 프레임 & 스티커 실시간 즉석 합성 렌더러
  // ============================================================================
  const renderComposedCanvas = useCallback(() => {
    if (!rawImageDataUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      // 가로/세로 비율 자동 감지
      if (img.width && img.height) {
        setRawImageAspect(img.width / img.height);
      }

      // 1. 기준 캔버스 해상도 고정 (가로든 세로든 원본 비율 100% 반영)
      const targetWidth = 1000;
      const targetHeight = Math.round(1000 * (img.height / img.width));
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 2. 원본 사진 렌더링
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // 날짜 포맷 (YYYY.MM.DD HH:mm)
      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const authorText = `${studentInfo.grade}학년 ${studentInfo.classNum}반 ${studentInfo.studentNum}번 ${studentInfo.nickname}`;

      const rType = selectedFrame.renderType;

      // ========================================================================
      // 1) 0원 코스프레 프레임
      // ========================================================================
      if (rType === "low_cost") {
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.fillRect(0, 0, targetWidth, 65);

        ctx.fillStyle = "#FFC72C";
        ctx.font = "bold 26px BMJUA, Pretendard, sans-serif";
        ctx.fillText("🎭 0원 코스프레 ARCHIVE", 30, 42);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px BMJUA, monospace";
        ctx.textAlign = "right";
        ctx.fillText("제작비: ₩0 | 100% 교실비품", targetWidth - 30, 42);
        ctx.textAlign = "left";

        // 우측 상단 싱크로율 200% 스탬프 기본 각인
        ctx.save();
        ctx.translate(targetWidth - 110, 150);
        ctx.rotate((-12 * Math.PI) / 180);
        ctx.fillStyle = "#EF4444";
        ctx.beginPath();
        ctx.roundRect(-80, -25, 160, 50, 15);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "20px BMJUA, Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("싱크로율 200%", 0, 8);
        ctx.restore();

        // 하단 띠지
        const ribbonHeight = 95;
        const ribbonY = targetHeight - ribbonHeight;
        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx.fillRect(0, ribbonY, targetWidth, ribbonHeight);

        ctx.fillStyle = "#FFC72C";
        ctx.fillRect(0, ribbonY, targetWidth, 4);

        ctx.fillStyle = "#FFC72C";
        ctx.font = "900 22px sans-serif";
        ctx.fillText(`🏫 스쿨픽 • ${studentInfo.schoolName}`, 30, ribbonY + 38);

        ctx.fillStyle = "#E2E8F0";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`테마: 0원 코스프레 | 촬영: ${dateStr}`, 30, ribbonY + 70);

        ctx.textAlign = "right";
        ctx.fillStyle = "#38BDF8";
        ctx.font = "black 20px sans-serif";
        ctx.fillText(`작가: ${authorText}`, targetWidth - 30, ribbonY + 54);
        ctx.textAlign = "left";
      }

      // ========================================================================
      // 2) 보스 레이드 RPG 체력바 프레임
      // ========================================================================
      else if (rType === "boss_raid") {
        const bossBarY = 25;
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.beginPath();
        ctx.roundRect(40, bossBarY, targetWidth - 80, 85, 20);
        ctx.fill();
        ctx.strokeStyle = "#E11D48";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = "#FFE4E6";
        ctx.font = "22px BMJUA, Pretendard, sans-serif";
        ctx.fillText("⚔️ [STAGE BOSS] 선생님 (Lv.99)", 65, bossBarY + 35);

        ctx.fillStyle = "#F43F5E";
        ctx.font = "bold 18px BMJUA, monospace";
        ctx.textAlign = "right";
        ctx.fillText("HP 95 / 100", targetWidth - 65, bossBarY + 35);
        ctx.textAlign = "left";

        const gaugeX = 65;
        const gaugeY = bossBarY + 48;
        const gaugeW = targetWidth - 130;
        const gaugeH = 20;

        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.roundRect(gaugeX, gaugeY, gaugeW, gaugeH, 10);
        ctx.fill();

        ctx.fillStyle = "#E11D48";
        ctx.beginPath();
        ctx.roundRect(gaugeX, gaugeY, gaugeW * 0.95, gaugeH, 10);
        ctx.fill();

        // 하단 RPG 배틀 로그 띠지
        const ribbonH = 85;
        const ribbonY = targetHeight - ribbonH;
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillRect(0, ribbonY, targetWidth, ribbonH);

        ctx.fillStyle = "#E11D48";
        ctx.fillRect(0, ribbonY, targetWidth, 4);

        ctx.fillStyle = "#FDE047";
        ctx.font = "bold 18px monospace";
        ctx.fillText(`[BATTLE LOG] ${studentInfo.nickname} 용사의 일격! 크리티컬 5 데미지!`, 30, ribbonY + 36);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "14px sans-serif";
        ctx.fillText(`🏫 ${studentInfo.schoolName} • 보스 레이드 챌린지 • ${dateStr}`, 30, ribbonY + 65);

        ctx.textAlign = "right";
        ctx.fillStyle = "#38BDF8";
        ctx.font = "black 18px sans-serif";
        ctx.fillText(`도전자: ${authorText}`, targetWidth - 30, ribbonY + 50);
        ctx.textAlign = "left";
      }

      // ========================================================================
      // 3) 베프 시그니처 듀오 프레임
      // ========================================================================
      else if (rType === "best_friend") {
        // 상단 러블리 핑크 배너
        ctx.fillStyle = "rgba(255, 241, 242, 0.92)";
        ctx.fillRect(0, 0, targetWidth, 60);

        ctx.fillStyle = "#E11D48";
        ctx.font = "black 22px sans-serif";
        ctx.fillText("👯 BEST FRIEND FOREVER", 30, 38);

        ctx.fillStyle = "#FB7185";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("우정 지수 100% 💖", targetWidth - 30, 38);
        ctx.textAlign = "left";

        // 하단 띠지
        const rH = 85;
        const rY = targetHeight - rH;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillRect(0, rY, targetWidth, rH);

        ctx.fillStyle = "#FB7185";
        ctx.fillRect(0, rY, targetWidth, 4);

        ctx.fillStyle = "#881337";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(`✨ ${studentInfo.schoolName} 베프 사진전`, 30, rY + 36);

        ctx.fillStyle = "#9F1239";
        ctx.font = "14px sans-serif";
        ctx.fillText(`영원히 기억될 우리들의 둘도 없는 순간 | ${dateStr}`, 30, rY + 65);

        ctx.textAlign = "right";
        ctx.fillStyle = "#E11D48";
        ctx.font = "black 18px sans-serif";
        ctx.fillText(`짝꿍 작가: ${authorText}`, targetWidth - 30, rY + 50);
        ctx.textAlign = "left";
      }

      // ========================================================================
      // 4) 클린 Before & After 2분할 프레임
      // ========================================================================
      else if (rType === "clean_ba") {
        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        ctx.fillRect(0, 0, targetWidth, 55);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "black 20px sans-serif";
        ctx.fillText("🧹 교실 청소 마스터 아카이브 (Before & After)", 30, 36);

        // 하단 띠지
        const rH = 80;
        const rY = targetHeight - rH;
        ctx.fillStyle = "rgba(6, 78, 59, 0.95)";
        ctx.fillRect(0, rY, targetWidth, rH);

        ctx.fillStyle = "#10B981";
        ctx.fillRect(0, rY, targetWidth, 4);

        ctx.fillStyle = "#A7F3D0";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`🌱 ${studentInfo.schoolName} 우리 교실을 빛낸 맑은 땀방울`, 30, rY + 35);

        ctx.fillStyle = "#D1FAE5";
        ctx.font = "14px sans-serif";
        ctx.fillText(`구석구석 반짝반짝 청소 인증 | ${dateStr}`, 30, rY + 62);

        ctx.textAlign = "right";
        ctx.fillStyle = "#34D399";
        ctx.font = "black 18px sans-serif";
        ctx.fillText(`청소반장: ${authorText}`, targetWidth - 30, rY + 48);
        ctx.textAlign = "left";
      }

      // ========================================================================
      // 5) 미슐랭 급식 리뷰왕 프레임
      // ========================================================================
      else if (rType === "lunch_review") {
        ctx.fillStyle = "rgba(249, 115, 22, 0.92)";
        ctx.fillRect(0, 0, targetWidth, 55);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "black 22px sans-serif";
        ctx.fillText("🍱 오늘의 미슐랭 급식 리뷰왕", 30, 36);

        ctx.fillStyle = "#FFEDD5";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("식판 올 클리어 배지 ⭐⭐⭐", targetWidth - 30, 36);
        ctx.textAlign = "left";

        // 하단 띠지
        const rH = 85;
        const rY = targetHeight - rH;
        ctx.fillStyle = "rgba(28, 25, 23, 0.92)";
        ctx.fillRect(0, rY, targetWidth, rH);

        ctx.fillStyle = "#F97316";
        ctx.fillRect(0, rY, targetWidth, 4);

        ctx.fillStyle = "#FED7AA";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`영양사 선생님 감사합니다! • ${studentInfo.schoolName} 급식실`, 30, rY + 35);

        ctx.fillStyle = "#A8A29E";
        ctx.font = "14px sans-serif";
        ctx.fillText(`잔반 ZERO 챌린지 인증샷 | ${dateStr}`, 30, rY + 64);

        ctx.textAlign = "right";
        ctx.fillStyle = "#FB923C";
        ctx.font = "black 18px sans-serif";
        ctx.fillText(`리뷰어: ${authorText}`, targetWidth - 30, rY + 50);
        ctx.textAlign = "left";
      }

      // ========================================================================
      // 6) 클린 폴라로이드 프레임 (공용)
      // ========================================================================
      else if (rType === "polaroid") {
        // 흰색 테두리
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 28;
        ctx.strokeRect(14, 14, targetWidth - 28, targetHeight - 28);

        // 하단 폴라로이드 감성 캡션
        const rH = 110;
        const rY = targetHeight - rH;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, rY, targetWidth, rH);

        ctx.fillStyle = "#1E293B";
        ctx.font = "bold 24px MaruBuri, serif";
        ctx.fillText(`Memory at ${studentInfo.schoolName} 🌿`, 40, rY + 50);

        ctx.fillStyle = "#64748B";
        ctx.font = "15px Pretendard, sans-serif";
        ctx.fillText(`${themeTitle} • ${dateStr}`, 40, rY + 82);

        ctx.textAlign = "right";
        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 20px MaruBuri, serif";
        ctx.fillText(`Photo by ${studentInfo.nickname}`, targetWidth - 40, rY + 65);
        ctx.textAlign = "left";
      }

      // ========================================================================
      // 7) 감성 매거진 띠지 (기본 및 기타 테마)
      // ========================================================================
      else {
        const ribbonHeight = 100;
        const ribbonY = targetHeight - ribbonHeight;

        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(0, ribbonY, targetWidth, ribbonHeight);

        ctx.fillStyle = "#38BDF8";
        ctx.fillRect(0, ribbonY, targetWidth, 4);

        ctx.fillStyle = "#38BDF8";
        ctx.font = "900 22px sans-serif";
        ctx.fillText(`🏫 스쿨픽 ARCHIVE • ${studentInfo.schoolName}`, 30, ribbonY + 40);

        ctx.fillStyle = "#E2E8F0";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`테마: ${themeTitle} | 촬영: ${dateStr}`, 30, ribbonY + 75);

        ctx.textAlign = "right";
        ctx.fillStyle = "#FDE047";
        ctx.font = "black 20px sans-serif";
        ctx.fillText(`작가: ${authorText}`, targetWidth - 30, ribbonY + 58);
        ctx.textAlign = "left";
      }

      // ========================================================================
      // 8) 사용자가 배치한 모든 스티커 (실물 이미지 또는 텍스트 배지) Canvas에 각인 렌더링!
      // ========================================================================
      const loadedImages = await Promise.all(
        placedStickers.map(async (stk) => {
          if (!stk.imageSrc) return null;
          if (stickerImageCache.has(stk.imageSrc)) {
            return { uid: stk.uid, img: stickerImageCache.get(stk.imageSrc)! };
          }
          try {
            const sImg = new Image();
            sImg.crossOrigin = "anonymous";
            await new Promise<void>((resolve, reject) => {
              sImg.onload = () => resolve();
              sImg.onerror = () => reject();
              sImg.src = stk.imageSrc!;
            });
            stickerImageCache.set(stk.imageSrc, sImg);
            return { uid: stk.uid, img: sImg };
          } catch {
            return null;
          }
        })
      );
      const imgMap = new Map<string, HTMLImageElement>();
      loadedImages.forEach((item) => {
        if (item) imgMap.set(item.uid, item.img);
      });

      placedStickers.forEach((stk) => {
        const posX = (stk.x / 100) * targetWidth;
        const posY = (stk.y / 100) * targetHeight;

        ctx.save();
        ctx.translate(posX, posY);

        if (stk.imageSrc && imgMap.has(stk.uid)) {
          // 실물 투명 이미지 스티커 렌더링 (원본 가로세로 비율 자동 유지)
          const stickerImg = imgMap.get(stk.uid)!;
          const aspect =
            stickerImg.width && stickerImg.height
              ? stickerImg.width / stickerImg.height
              : 1;
          let drawW = 120;
          let drawH = 120;
          if (aspect >= 1) {
            // 가로형 로고 (유튜브, 틱톡 등)
            drawW = Math.min(220, 85 * aspect);
            drawH = drawW / aspect;
          } else {
            // 세로형 로고
            drawH = 120;
            drawW = drawH * aspect;
          }
          ctx.drawImage(stickerImg, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
          // 텍스트/이모지 배지 스티커 렌더링
          ctx.font = "900 24px sans-serif";
          const textMetrics = ctx.measureText(stk.text);
          const paddingX = 22;
          const boxWidth = textMetrics.width + paddingX * 2;
          const boxHeight = 50;

          // 둥근 사각 스티커 배경
          ctx.fillStyle = stk.bg || "#F59E0B";
          ctx.beginPath();
          ctx.roundRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 25);
          ctx.fill();

          // 외곽선
          ctx.strokeStyle = stk.border || "#FFFFFF";
          ctx.lineWidth = 4;
          ctx.stroke();

          // 텍스트
          ctx.fillStyle = stk.color || "#000000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(stk.text, 0, 1);
        }

        ctx.restore();
      });

      // 3. 최종 DataURL 및 Blob 추출
      const composedUrl = canvas.toDataURL("image/jpeg", 0.92);
      setComposedDataUrl(composedUrl);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setComposedBlob(blob);
            setFileSizeKb(Math.round(blob.size / 1024));
          }
        },
        "image/jpeg",
        0.92
      );
    };

    img.src = rawImageDataUrl;
  }, [rawImageDataUrl, selectedFrame, placedStickers, themeTitle, studentInfo]);

  // 프레임 프리셋 또는 스티커 변경 시 자동 재렌더링
  useEffect(() => {
    if (viewMode === "preview" && rawImageDataUrl) {
      renderComposedCanvas();
    }
  }, [viewMode, rawImageDataUrl, selectedFrame, placedStickers, renderComposedCanvas]);

  // 합성본 로컬 다운로드 저장
  const handleDownload = () => {
    if (!composedDataUrl) return;
    const a = document.createElement("a");
    a.href = composedDataUrl;
    a.download = `스쿨픽_${studentInfo.nickname}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 최종 출품하기 핸들러
  const handleFinalSubmit = () => {
    if (!composedBlob || !composedDataUrl) {
      alert("합성 중인 사진을 준비하고 있습니다. 잠시만 기다려주세요.");
      return;
    }

    onComplete({
      blob: composedBlob,
      dataUrl: composedDataUrl,
      title: photoTitle.trim() || `${studentInfo.nickname}의 작품`,
      caption: caption.trim(),
      preset: selectedFrame.name,
      appliedStickers: placedStickers,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* 상단 헤더 */}
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <div>
              <h3 className="font-black text-sm text-amber-400 flex items-center gap-1.5">
                <span>{viewMode === "camera" ? "카메라로 순간 포착" : "Canvas 프레임 & 스티커 편집"}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {themeTitle}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">
                {studentInfo.schoolName} • {studentInfo.nickname} 작가님
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 font-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= MODE 1: 실시간 카메라 뷰파인더 ================= */}
        {viewMode === "camera" && (
          <div className="flex-1 flex flex-col justify-between p-4 space-y-4">
            
            {/* 비디오 뷰파인더 */}
            <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden border-2 border-slate-700 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* 전/후면 카메라 전환 버튼 */}
              {isCameraActive && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
                  title="카메라 전환"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              )}

              {/* 카메라 에러 또는 비활성 안내 */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 p-5 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                    📸
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-bold">
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-black text-xs border border-amber-500 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>앨범에서 사진 불러오기</span>
                  </button>
                </div>
              )}
            </div>

            {/* 앨범 파일 인풋 (숨김) */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAlbumSelect}
              className="hidden"
            />

            {/* 카메라 컨트롤 바 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-around gap-4">
                
                {/* 앨범 선택 버튼 */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] font-bold">앨범 선택</span>
                </button>

                {/* 셔터 찰칵 버튼 */}
                <button
                  type="button"
                  disabled={!isCameraActive}
                  onClick={captureFromVideo}
                  className="w-18 h-18 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 border-4 border-white shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center text-slate-950 font-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <Camera className="w-7 h-7 stroke-[2.5]" />
                  </div>
                </button>

                {/* 재시도 버튼 */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-[10px] font-bold">다시 연결</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center font-bold">
                카메라로 찰칵 찍거나, 앨범에서 이미 촬영된 사진을 선택하세요!
              </p>
            </div>

          </div>
        )}

        {/* ================= MODE 2: Canvas 합성 미리보기 & 스티커 드래그 이동 ================= */}
        {viewMode === "preview" && (
          <div className="flex-1 flex flex-col justify-between p-4 space-y-3.5 overflow-y-auto">
            
            {/* 1. 합성 캔버스 및 인터랙티브 스티커 드래그 오버레이 (가로/세로 적응형 컨테이너) */}
            <div className="space-y-1 flex flex-col items-center">
              <div 
                ref={previewContainerRef}
                style={{
                  aspectRatio: `${rawImageAspect}`,
                  maxHeight: "46vh",
                }}
                className="relative w-auto h-full max-w-full bg-black rounded-3xl overflow-hidden border-2 border-amber-400 shadow-lg select-none"
              >
                {/* 메인 캔버스 */}
                <canvas ref={canvasRef} className="w-full h-full object-contain" />

                {/* 인터랙티브 스티커 이동 레이어 (화면에서 터치/마우스로 직접 끌어서 옮김) */}
                {placedStickers.map((stk) => {
                  const isDragging = draggingStickerUid === stk.uid;
                  return (
                    <div
                      key={stk.uid}
                      style={{
                        left: `${stk.x}%`,
                        top: `${stk.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleDragStart(stk.uid, e.clientX, e.clientY);
                      }}
                      onTouchStart={(e) => {
                        if (e.touches.length > 0) {
                          handleDragStart(stk.uid, e.touches[0].clientX, e.touches[0].clientY);
                        }
                      }}
                      className={`absolute cursor-move select-none group transition-shadow ${
                        isDragging ? "scale-105 z-30" : "z-20 hover:scale-102"
                      }`}
                    >
                      {stk.imageSrc ? (
                        <div className="relative group p-1">
                          <img
                            src={stk.imageSrc}
                            alt={stk.text}
                            className="h-10 sm:h-12 w-auto max-w-[150px] sm:max-w-[180px] object-contain pointer-events-none drop-shadow-md select-none"
                          />
                          {/* 스티커 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSticker(stk.uid, e)}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-xs font-bold shadow-md cursor-pointer"
                            aria-label="스티커 삭제"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div 
                          style={{
                            backgroundColor: stk.bg,
                            color: stk.color,
                            borderColor: stk.border || "#FFFFFF",
                          }}
                          className="px-3 py-1.5 rounded-full text-xs font-black shadow-lg border-2 flex items-center gap-1.5 whitespace-nowrap active:opacity-90"
                        >
                          <Move className="w-3 h-3 opacity-70" />
                          <span>{stk.text}</span>
                          {/* 스티커 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSticker(stk.uid, e)}
                            className="w-4 h-4 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center text-[9px] ml-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 안내 뱃지 */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] text-amber-300 font-bold px-2.5 py-1 rounded-full pointer-events-none flex items-center gap-1">
                  <Move className="w-3 h-3 text-amber-400" />
                  <span>스티커를 터치해서 자유롭게 이동하세요!</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-bold">
                <span>프레임: <b className="text-amber-400">{selectedFrame.name}</b></span>
                <span className="text-slate-400">용량: {fileSizeKb} KB</span>
              </div>
            </div>

            {/* 2. 테마 전용 프레임 & 공용 프레임 선택기 */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-400 flex items-center justify-between">
                <span>🎨 프레임 선택 (테마 전용 + 공용):</span>
                <span className="text-[10px] text-slate-400 font-normal">총 {availableFrames.length}개 제공</span>
              </label>

              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                {availableFrames.map((frame) => {
                  const isSelected = selectedFrame.id === frame.id;
                  const isThemeSpecific = !!frame.themeId;

                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setSelectedFrame(frame)}
                      className={`shrink-0 px-3 py-2 rounded-2xl border-2 text-left transition-all cursor-pointer min-w-[130px] ${
                        isSelected
                          ? "bg-amber-400/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{frame.icon}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                          isThemeSpecific ? "bg-amber-500/30 text-amber-300" : "bg-sky-500/20 text-sky-300"
                        }`}>
                          {isThemeSpecific ? "전용" : "공용"}
                        </span>
                      </div>
                      <span className="text-xs font-black block mt-1 line-clamp-1">{frame.name}</span>
                      <span className="text-[9px] text-slate-400 block line-clamp-1">{frame.tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. 스티커 프리셋 추가 팰릿 (확장 시스템) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-sky-400 flex items-center justify-between">
                <span>🏷️ 스티커 추가 (터치 시 캔버스에 생성):</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {placedStickers.length > 0 ? `${placedStickers.length}개 배치됨` : "클릭해서 추가"}
                </span>
              </label>

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
                {availableStickers.map((stk) =>
                  stk.imageSrc ? (
                    <button
                      key={stk.id}
                      type="button"
                      onClick={() => handleAddSticker(stk)}
                      style={{
                        backgroundColor: stk.bg,
                        color: stk.color,
                        borderColor: stk.border || "#FFFFFF",
                      }}
                      className="shrink-0 px-2.5 py-1.5 rounded-xl border text-[11px] font-black shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <img src={stk.imageSrc} alt="" className="h-4 sm:h-5 w-auto max-w-[36px] object-contain pointer-events-none" />
                      <span>{stk.name}</span>
                      <span className="text-[9px] opacity-75">+추가</span>
                    </button>
                  ) : (
                    <button
                      key={stk.id}
                      type="button"
                      onClick={() => handleAddSticker(stk)}
                      style={{
                        backgroundColor: stk.bg,
                        color: stk.color,
                        borderColor: stk.border || "#FFFFFF",
                      }}
                      className="shrink-0 px-2.5 py-1.5 rounded-xl border text-[11px] font-black shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>{stk.icon || "✨"}</span>
                      <span>{stk.text}</span>
                      <span className="text-[9px] opacity-75">+추가</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 4. 작품 제목 & 30자 이내 작품 설명(작가 노트) 입력 창 */}
            <div className="space-y-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              {/* 작품 제목 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  작품 제목:
                </label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="예: 빗자루와 슬리퍼로 완성한 진주 귀걸이 소녀"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-semibold"
                />
              </div>

              {/* 요구사항 5: 30자 이내 작품 설명 (작가 노트) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <span>📝 작품 설명 (작가 노트):</span>
                    <span className="text-[10px] text-slate-400 font-normal">(30자 이내)</span>
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${
                    caption.length >= 30 ? "text-rose-400" : "text-amber-400"
                  }`}>
                    {caption.length} / 30자
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={30}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="작품에 얽힌 짧은 에피소드나 감상 포인트를 적어주세요!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* 5. 액션 버튼 바: 다시 찍기 / 원본 소장 다운로드 / 출품하기 */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("camera")}
                  className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-black text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>다시 촬영하기</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="py-2.5 px-3 rounded-2xl bg-sky-900/60 hover:bg-sky-800/80 border border-sky-500 text-xs font-black text-sky-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>합성본 소장(저장)</span>
                </button>
              </div>

              {/* 출품하기 버튼 (Blob 변환 및 부모 컴포넌트 제출) */}
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-sm border-2 border-white shadow-[0_4px_0_0_#B45309] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>이 사진으로 사진전 출품하기!</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}