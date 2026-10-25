export interface StickerDefinition {
  id: string;
  name: string;
  text: string;
  icon?: string;
  themeId?: string; // 특정 테마 전용 (없으면 공용 스티커)
  bg: string;
  color: string;
  border?: string;
}

export interface FrameDefinition {
  id: string;
  name: string;
  tag: string;
  icon: string;
  themeId?: string; // 특정 테마 전용 (없으면 공용 프레임)
  renderType: string;
}

// ============================================================================
// 1. 공용 프레임 & 테마별 전용 프레임 레지스트리
// ============================================================================
export const FRAME_REGISTRY: FrameDefinition[] = [
  // --- 공용 프레임 (모든 테마에 기본 노출) ---
  {
    id: "frame-common-magazine",
    name: "감성 매거진 띠지",
    tag: "#공용 #클린 #아카이브",
    icon: "📰",
    renderType: "magazine",
  },
  {
    id: "frame-common-polaroid",
    name: "클린 폴라로이드",
    tag: "#공용 #클래식 #화이트",
    icon: "🎞️",
    renderType: "polaroid",
  },
  {
    id: "frame-common-film",
    name: "스쿨필름 4컷 룩",
    tag: "#공용 #레트로 #필름",
    icon: "🎬",
    renderType: "film",
  },

  // --- 테마별 전용 프레임 (해당 테마에서만 노출) ---
  {
    id: "frame-culture-1",
    themeId: "culture-1",
    name: "0원 코스프레 아카이브",
    tag: "#전용 #저예산 #싱크로율",
    icon: "🎭",
    renderType: "low_cost",
  },
  {
    id: "frame-culture-2",
    themeId: "culture-2",
    name: "보스 레이드 RPG 체력바",
    tag: "#전용 #게이미피케이션 #HP게이지",
    icon: "⚔️",
    renderType: "boss_raid",
  },
  {
    id: "frame-culture-3",
    themeId: "culture-3",
    name: "베프 시그니처 듀오",
    tag: "#전용 #우정 #손하트",
    icon: "👯",
    renderType: "best_friend",
  },
  {
    id: "frame-culture-4",
    themeId: "culture-4",
    name: "클린 Before & After 2분할",
    tag: "#전용 #청소마스터 #변화",
    icon: "🧹",
    renderType: "clean_ba",
  },
  {
    id: "frame-culture-5",
    themeId: "culture-5",
    name: "학교 숨은 명소 아카이브",
    tag: "#전용 #공간탐험 #비밀스팟",
    icon: "🌿",
    renderType: "hidden_spot",
  },
  {
    id: "frame-culture-6",
    themeId: "culture-6",
    name: "미슐랭 급식 리뷰왕",
    tag: "#전용 #완식인증 #잔반ZERO",
    icon: "🍱",
    renderType: "lunch_review",
  },
  {
    id: "frame-culture-7",
    themeId: "culture-7",
    name: "스쿨라이프 VOGUE 커버",
    tag: "#전용 #잡지표지 #모델포스터",
    icon: "🎨",
    renderType: "poster_model",
  },
  {
    id: "frame-culture-8",
    themeId: "culture-8",
    name: "도플갱어 데칼코마니",
    tag: "#전용 #닮은꼴 #복붙CtrlC",
    icon: "👥",
    renderType: "doppelganger",
  },
  {
    id: "frame-culture-9",
    themeId: "culture-9",
    name: "카네이션 효도왕 테두리",
    tag: "#전용 #가족사랑 #세대공감",
    icon: "💖",
    renderType: "filial_love",
  },
  {
    id: "frame-culture-10",
    themeId: "culture-10",
    name: "인스타그램 UI 공식배지",
    tag: "#전용 #인플루언서 #인기스타",
    icon: "⭐",
    renderType: "influencer",
  },
  {
    id: "frame-culture-11",
    themeId: "culture-11",
    name: "국립미술관 도록 캡션",
    tag: "#전용 #정통예술 #골드씰",
    icon: "📸",
    renderType: "photo_artist",
  },
  {
    id: "frame-culture-12",
    themeId: "culture-12",
    name: "차원왜곡 트릭아트 착시",
    tag: "#전용 #원근법 #착시예술",
    icon: "📐",
    renderType: "trick_art",
  },

  // --- 교과 테마 전용 프레임 ---
  {
    id: "frame-subject-1",
    themeId: "subject-1",
    name: "보태니컬 식물도감 라벨",
    tag: "#과학전용 #식물생태 #접사",
    icon: "🌿",
    renderType: "botanical_doc",
  },
  {
    id: "frame-subject-2",
    themeId: "subject-2",
    name: "전통 한지 문화재 도록",
    tag: "#사회전용 #문화유산 #역사",
    icon: "🏛️",
    renderType: "heritage_doc",
  },
  {
    id: "frame-subject-3",
    themeId: "subject-3",
    name: "수학적 안목 각도기 그리드",
    tag: "#수학전용 #기하패턴 #대칭",
    icon: "📐",
    renderType: "math_grid",
  },
  {
    id: "frame-subject-4",
    themeId: "subject-4",
    name: "친환경 패션 룩북 2026",
    tag: "#실과전용 #업사이클링 #OOTD",
    icon: "👔",
    renderType: "eco_fashion",
  },
  {
    id: "frame-subject-5",
    themeId: "subject-5",
    name: "200자 원고지 손글씨",
    tag: "#국어전용 #명문장 #캘리",
    icon: "✍️",
    renderType: "manuscript_paper",
  },
  {
    id: "frame-subject-6",
    themeId: "subject-6",
    name: "스포츠 라이브 스코어보드",
    tag: "#체육전용 #역동적순간 #MVP",
    icon: "🏃",
    renderType: "sports_live",
  },
];

// ============================================================================
// 2. 스티커 레지스트리 (공용 + 테마별 전용, 추후 무한 확장 가능)
// ============================================================================
export const STICKER_REGISTRY: StickerDefinition[] = [
  // --- 공용 스티커 (어디서나 부착 가능) ---
  {
    id: "stk-com-heart",
    name: "하트 뿅뿅",
    text: "❤️ 사랑해요",
    icon: "💖",
    bg: "#FFE4E6",
    color: "#E11D48",
    border: "#FDA4AF",
  },
  {
    id: "stk-com-legend",
    name: "학교 레전드",
    text: "👑 학교 레전드",
    icon: "⭐",
    bg: "#FEF3C7",
    color: "#B45309",
    border: "#FDE68A",
  },
  {
    id: "stk-com-clean",
    name: "안심 클린",
    text: "🛡️ 안심 클린 픽",
    icon: "✨",
    bg: "#E0F2FE",
    color: "#0369A1",
    border: "#BAE6FD",
  },
  {
    id: "stk-com-good",
    name: "최고예요",
    text: "👍 엄지 척!",
    icon: "🔥",
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#BBF7D0",
  },

  // --- [0원 코스프레] 전용 스티커 ---
  {
    id: "stk-c1-sync",
    themeId: "culture-1",
    name: "싱크로율 200%",
    text: "🔥 싱크로율 200%",
    icon: "🎭",
    bg: "#EF4444",
    color: "#FFFFFF",
    border: "#B91C1C",
  },
  {
    id: "stk-c1-zero",
    themeId: "culture-1",
    name: "제작비 0원",
    text: "💸 제작비 ₩0",
    icon: "✂️",
    bg: "#10B981",
    color: "#FFFFFF",
    border: "#059669",
  },
  {
    id: "stk-c1-spark",
    themeId: "culture-1",
    name: "창의력 대폭발",
    text: "⚡ 창의력 대폭발",
    icon: "💡",
    bg: "#F59E0B",
    color: "#000000",
    border: "#D97706",
  },

  // --- [보스 레이드] 전용 스티커 ---
  {
    id: "stk-c2-boss",
    themeId: "culture-2",
    name: "BOSS 등장!",
    text: "👾 BOSS 등장!",
    icon: "⚔️",
    bg: "#881337",
    color: "#FFE4E6",
    border: "#BE123C",
  },
  {
    id: "stk-c2-crit",
    themeId: "culture-2",
    name: "크리티컬 히트",
    text: "💥 CRITICAL HIT!",
    icon: "⚡",
    bg: "#F59E0B",
    color: "#000000",
    border: "#B45309",
  },
  {
    id: "stk-c2-duo",
    themeId: "culture-2",
    name: "사제동행 레전드",
    text: "🤝 사제동행 레전드",
    icon: "🛡️",
    bg: "#0284C7",
    color: "#FFFFFF",
    border: "#0369A1",
  },

  // --- [베프 사진전] 전용 스티커 ---
  {
    id: "stk-c3-friend",
    themeId: "culture-3",
    name: "평생 가자 우리 우정",
    text: "👯 평생 가자 우리 우정",
    icon: "💖",
    bg: "#F43F5E",
    color: "#FFFFFF",
    border: "#E11D48",
  },
  {
    id: "stk-c3-rate",
    themeId: "culture-3",
    name: "우정 지수 100%",
    text: "💯 우정 지수 100%",
    icon: "✨",
    bg: "#38BDF8",
    color: "#0C4A6E",
    border: "#0284C7",
  },
  {
    id: "stk-c3-bestie",
    themeId: "culture-3",
    name: "우리 반 찐단짝",
    text: "🔒 우리 반 찐단짝",
    icon: "👭",
    bg: "#A855F7",
    color: "#FFFFFF",
    border: "#7E22CE",
  },

  // --- [청소 비포&애프터] 전용 스티커 ---
  {
    id: "stk-c4-clean",
    themeId: "culture-4",
    name: "반짝반짝 클린 마스터",
    text: "✨ 반짝반짝 클린 마스터",
    icon: "🧹",
    bg: "#06B6D4",
    color: "#FFFFFF",
    border: "#0891B2",
  },
  {
    id: "stk-c4-gold",
    themeId: "culture-4",
    name: "청소 요정 골드 배지",
    text: "🥇 청소 요정 골드 배지",
    icon: "👑",
    bg: "#FBBF24",
    color: "#78350F",
    border: "#D97706",
  },

  // --- [내가 리뷰왕] 전용 스티커 ---
  {
    id: "stk-c6-michelin",
    themeId: "culture-6",
    name: "오늘의 미슐랭 급식",
    text: "⭐ 오늘의 미슐랭 급식",
    icon: "🍱",
    bg: "#EA580C",
    color: "#FFFFFF",
    border: "#C2410C",
  },
  {
    id: "stk-c6-zero",
    themeId: "culture-6",
    name: "식판 올 클리어 배지",
    text: "🥗 식판 올 클리어 (잔반 ZERO)",
    icon: "🌱",
    bg: "#15803D",
    color: "#FFFFFF",
    border: "#166534",
  },

  // --- [교내 인플루언서] 전용 스티커 ---
  {
    id: "stk-c10-blue",
    themeId: "culture-10",
    name: "공식 인증 파란 배지",
    text: "☑️ 공식 인증 인플루언서",
    icon: "⭐",
    bg: "#0284C7",
    color: "#FFFFFF",
    border: "#0369A1",
  },

  // --- [과학 식물도감] 전용 스티커 ---
  {
    id: "stk-s1-sprout",
    themeId: "subject-1",
    name: "새싹 관찰 배지",
    text: "🌿 새싹 관찰자 배지",
    icon: "🌱",
    bg: "#22C55E",
    color: "#FFFFFF",
    border: "#16A34A",
  },

  // --- [수학 도형패턴] 전용 스티커 ---
  {
    id: "stk-s3-golden",
    themeId: "subject-3",
    name: "수학적 안목 S등급",
    text: "📐 수학적 안목 S등급 배지",
    icon: "📏",
    bg: "#6366F1",
    color: "#FFFFFF",
    border: "#4F46E5",
  },

  // --- [체육 스포츠 스타] 전용 스티커 ---
  {
    id: "stk-s6-mvp",
    themeId: "subject-6",
    name: "MVP 금메달 배지",
    text: "🏅 MVP 금메달 슛",
    icon: "🔥",
    bg: "#F59E0B",
    color: "#000000",
    border: "#B45309",
  },
];

/**
 * 특정 테마에 사용할 수 있는 프레임 목록 반환:
 * ➔ "공용 프레임" + "해당 테마 전용 프레임"만 함께 반환!
 */
export function getFramesForTheme(themeId?: string): FrameDefinition[] {
  return FRAME_REGISTRY.filter((f) => !f.themeId || f.themeId === themeId);
}

/**
 * 특정 테마에 사용할 수 있는 스티커 목록 반환:
 * ➔ "공용 스티커" + "해당 테마 전용 스티커" 반환!
 */
export function getStickersForTheme(themeId?: string): StickerDefinition[] {
  return STICKER_REGISTRY.filter((s) => !s.themeId || s.themeId === themeId);
}
