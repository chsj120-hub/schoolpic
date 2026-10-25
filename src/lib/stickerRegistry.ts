export interface StickerDefinition {
  id: string;
  name: string;
  text: string;
  icon?: string;
  imageSrc?: string; // 투명 배경 이미지 스티커 파일 경로 (예: /stickers/common-sparkle.svg)
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

  // ============================================================================
  // [NEW] 실물 투명 배경 이미지 스티커 (공용 3종 + 18개 테마별 2종 = 총 39종)
  // ============================================================================

  // --- [공용 이미지 스티커 3종] ---
  {
    id: "img-stk-com-sparkle",
    name: "반짝이 별빛",
    text: "별빛 샤인",
    icon: "✨",
    imageSrc: "/stickers/common-sparkle.svg",
    bg: "#FEF9C3",
    color: "#B45309",
    border: "#FDE047",
  },
  {
    id: "img-stk-com-heart-duo",
    name: "러블리 듀오 하트",
    text: "더블 하트",
    icon: "💖",
    imageSrc: "/stickers/common-heart-duo.svg",
    bg: "#FFE4E6",
    color: "#E11D48",
    border: "#FDA4AF",
  },
  {
    id: "img-stk-com-crown",
    name: "골드 킹/퀸 왕관",
    text: "골드 크라운",
    icon: "👑",
    imageSrc: "/stickers/common-crown.svg",
    bg: "#FEF3C7",
    color: "#78350F",
    border: "#F59E0B",
  },

  // --- [culture-1: 0원 코스프레] ---
  {
    id: "img-stk-c1-sunglasses",
    themeId: "culture-1",
    name: "픽셀 힙스터 선글라스",
    text: "힙스터 선글라스",
    icon: "🕶️",
    imageSrc: "/stickers/c1-sunglasses.svg",
    bg: "#F1F5F9",
    color: "#0F172A",
    border: "#CBD5E1",
  },
  {
    id: "img-stk-c1-fire",
    themeId: "culture-1",
    name: "활활 코믹 불꽃",
    text: "불타는 열정",
    icon: "🔥",
    imageSrc: "/stickers/c1-fire.svg",
    bg: "#FEE2E2",
    color: "#DC2626",
    border: "#FCA5A5",
  },

  // --- [culture-2: 보스 레이드] ---
  {
    id: "img-stk-c2-sword-shield",
    themeId: "culture-2",
    name: "용사의 방패",
    text: "용사의 방패",
    icon: "🛡️",
    imageSrc: "/stickers/c2-sword-shield.svg",
    bg: "#DBEAFE",
    color: "#1E40AF",
    border: "#93C5FD",
  },
  {
    id: "img-stk-c2-hp-full",
    themeId: "culture-2",
    name: "8비트 HP 하트 바",
    text: "HP FULL 하트",
    icon: "❤️",
    imageSrc: "/stickers/c2-hp-full.svg",
    bg: "#FEE2E2",
    color: "#991B1B",
    border: "#F87171",
  },

  // --- [culture-3: 베프 사진전] ---
  {
    id: "img-stk-c3-friend-ribbon",
    themeId: "culture-3",
    name: "베프 핑크 리본",
    text: "우정 리본",
    icon: "🎀",
    imageSrc: "/stickers/c3-friend-ribbon.svg",
    bg: "#FCE7F3",
    color: "#BE185D",
    border: "#F472B6",
  },
  {
    id: "img-stk-c3-clover",
    themeId: "culture-3",
    name: "행운의 네잎클로버",
    text: "행운 클로버",
    icon: "🍀",
    imageSrc: "/stickers/c3-clover.svg",
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#86EFAC",
  },

  // --- [culture-4: 청소 비포&애프터] ---
  {
    id: "img-stk-c4-clean-bubble",
    themeId: "culture-4",
    name: "뽀송뽀송 비눗방울",
    text: "클린 버블",
    icon: "🫧",
    imageSrc: "/stickers/c4-clean-bubble.svg",
    bg: "#E0F2FE",
    color: "#0369A1",
    border: "#7DD3FC",
  },
  {
    id: "img-stk-c4-sparkle-broom",
    themeId: "culture-4",
    name: "마법의 클린 빗자루",
    text: "청소 요정",
    icon: "🧹",
    imageSrc: "/stickers/c4-sparkle-broom.svg",
    bg: "#FEF3C7",
    color: "#B45309",
    border: "#FCD34D",
  },

  // --- [culture-5: 숨은 명소 찾기] ---
  {
    id: "img-stk-c5-compass",
    themeId: "culture-5",
    name: "탐험가 나침반",
    text: "명소 나침반",
    icon: "🧭",
    imageSrc: "/stickers/c5-compass.svg",
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#FBBF24",
  },
  {
    id: "img-stk-c5-magnifier",
    themeId: "culture-5",
    name: "명탐정 돋보기",
    text: "탐정 돋보기",
    icon: "🔍",
    imageSrc: "/stickers/c5-magnifier.svg",
    bg: "#E0F2FE",
    color: "#0284C7",
    border: "#38BDF8",
  },

  // --- [culture-6: 급식 리뷰왕] ---
  {
    id: "img-stk-c6-chef-hat",
    themeId: "culture-6",
    name: "미슐랭 셰프 모자",
    text: "셰프 모자",
    icon: "🧑‍🍳",
    imageSrc: "/stickers/c6-chef-hat.svg",
    bg: "#FFEDD5",
    color: "#C2410C",
    border: "#FB923C",
  },
  {
    id: "img-stk-c6-yummy",
    themeId: "culture-6",
    name: "따끈따끈 밥공기",
    text: "꿀맛 급식",
    icon: "🍚",
    imageSrc: "/stickers/c6-yummy.svg",
    bg: "#FFF7ED",
    color: "#EA580C",
    border: "#FDBA74",
  },

  // --- [culture-7: 학생 모델 포스터] ---
  {
    id: "img-stk-c7-camera-flash",
    themeId: "culture-7",
    name: "런웨이 카메라 플래시",
    text: "플래시 팡팡",
    icon: "📸",
    imageSrc: "/stickers/c7-camera-flash.svg",
    bg: "#F1F5F9",
    color: "#0F172A",
    border: "#94A3B8",
  },
  {
    id: "img-stk-c7-bar-code",
    themeId: "culture-7",
    name: "매거진 공식 바코드",
    text: "VOGUE 바코드",
    icon: "🏷️",
    imageSrc: "/stickers/c7-bar-code.svg",
    bg: "#F8FAFC",
    color: "#0F172A",
    border: "#CBD5E1",
  },

  // --- [culture-8: 도플갱어 데칼코마니] ---
  {
    id: "img-stk-c8-mirror-twin",
    themeId: "culture-8",
    name: "쌍둥이 미러 마스크",
    text: "데칼코마니",
    icon: "🎭",
    imageSrc: "/stickers/c8-mirror-twin.svg",
    bg: "#E0F2FE",
    color: "#0369A1",
    border: "#7DD3FC",
  },
  {
    id: "img-stk-c8-ctrl-cv",
    themeId: "culture-8",
    name: "복사&붙여넣기 도장",
    text: "Ctrl C & V",
    icon: "📋",
    imageSrc: "/stickers/c8-ctrl-cv.svg",
    bg: "#FEF3C7",
    color: "#B45309",
    border: "#FCD34D",
  },

  // --- [culture-9: 가족 사랑 & 효도] ---
  {
    id: "img-stk-c9-carnation",
    themeId: "culture-9",
    name: "감사 붉은 카네이션",
    text: "효도 카네이션",
    icon: "🌺",
    imageSrc: "/stickers/c9-carnation.svg",
    bg: "#FFE4E6",
    color: "#BE123C",
    border: "#FB7185",
  },
  {
    id: "img-stk-c9-warm-hug",
    themeId: "culture-9",
    name: "따뜻한 사랑의 하트",
    text: "사랑 가득",
    icon: "🥰",
    imageSrc: "/stickers/c9-warm-hug.svg",
    bg: "#FFF1F2",
    color: "#E11D48",
    border: "#FDA4AF",
  },

  // --- [culture-10: 교내 인플루언서] ---
  {
    id: "img-stk-c10-youtube",
    themeId: "culture-10",
    name: "YouTube 공식 로고",
    text: "YouTube",
    icon: "▶️",
    imageSrc: "/stickers/c10-youtube.png",
    bg: "#FFFFFF",
    color: "#0F172A",
    border: "#EF4444",
  },
  {
    id: "img-stk-c10-tiktok",
    themeId: "culture-10",
    name: "TikTok 공식 로고",
    text: "TikTok",
    icon: "🎵",
    imageSrc: "/stickers/c10-tiktok.png",
    bg: "#FFFFFF",
    color: "#000000",
    border: "#0F172A",
  },
  {
    id: "img-stk-c10-instagram",
    themeId: "culture-10",
    name: "Instagram 공식 로고",
    text: "Instagram",
    icon: "📷",
    imageSrc: "/stickers/c10-instagram.png",
    bg: "#FFFFFF",
    color: "#E11D48",
    border: "#F43F5E",
  },
  {
    id: "img-stk-c10-verified-badge",
    themeId: "culture-10",
    name: "인스타그램 공식 파란 배지",
    text: "공식 인증",
    icon: "☑️",
    imageSrc: "/stickers/c10-verified-badge.svg",
    bg: "#E0F2FE",
    color: "#0369A1",
    border: "#38BDF8",
  },
  {
    id: "img-stk-c10-like-heart",
    themeId: "culture-10",
    name: "좋아요 폭풍 하트",
    text: "좋아요 10K",
    icon: "❤️",
    imageSrc: "/stickers/c10-like-heart.svg",
    bg: "#FEE2E2",
    color: "#B91C1C",
    border: "#F87171",
  },

  // --- [culture-11: 국립미술관 도록] ---
  {
    id: "img-stk-c11-gold-seal",
    themeId: "culture-11",
    name: "미술관 전시 골드 인장",
    text: "공식 골드씰",
    icon: "🏅",
    imageSrc: "/stickers/c11-gold-seal.svg",
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#F59E0B",
  },
  {
    id: "img-stk-c11-artist-palette",
    themeId: "culture-11",
    name: "예술가의 유화 팔레트",
    text: "아트 팔레트",
    icon: "🎨",
    imageSrc: "/stickers/c11-artist-palette.svg",
    bg: "#FEF9C3",
    color: "#78350F",
    border: "#FBBF24",
  },

  // --- [culture-12: 원근법 트릭아트] ---
  {
    id: "img-stk-c12-magic-portal",
    themeId: "culture-12",
    name: "차원왜곡 마법 포털",
    text: "미스터리 포털",
    icon: "🌀",
    imageSrc: "/stickers/c12-magic-portal.svg",
    bg: "#F3E8FF",
    color: "#7E22CE",
    border: "#C084FC",
  },
  {
    id: "img-stk-c12-pinch-fingers",
    themeId: "culture-12",
    name: "원근법 핀치 손가락",
    text: "착시 핀치",
    icon: "👌",
    imageSrc: "/stickers/c12-pinch-fingers.svg",
    bg: "#FFEDD5",
    color: "#C2410C",
    border: "#FDBA74",
  },

  // --- [subject-1: 과학 식물도감] ---
  {
    id: "img-stk-s1-fresh-sprout",
    themeId: "subject-1",
    name: "싱그러운 파릇파릇 새싹",
    text: "관찰 새싹",
    icon: "🌱",
    imageSrc: "/stickers/s1-fresh-sprout.svg",
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#4ADE80",
  },
  {
    id: "img-stk-s1-butterfly",
    themeId: "subject-1",
    name: "봄날의 노랑나비",
    text: "생태 나비",
    icon: "🦋",
    imageSrc: "/stickers/s1-butterfly.svg",
    bg: "#FEF9C3",
    color: "#A16207",
    border: "#FDE047",
  },

  // --- [subject-2: 사회 역사 탐방] ---
  {
    id: "img-stk-s2-korean-flag",
    themeId: "subject-2",
    name: "대한민국 태극 엠블럼",
    text: "태극 엠블럼",
    icon: "🇰🇷",
    imageSrc: "/stickers/s2-korean-flag.svg",
    bg: "#F8FAFC",
    color: "#0F172A",
    border: "#CBD5E1",
  },
  {
    id: "img-stk-s2-scroll",
    themeId: "subject-2",
    name: "조선 왕실 두루마리",
    text: "역사 두루마리",
    icon: "📜",
    imageSrc: "/stickers/s2-scroll.svg",
    bg: "#FEF3C7",
    color: "#78350F",
    border: "#D97706",
  },

  // --- [subject-3: 수학 도형 패턴] ---
  {
    id: "img-stk-s3-golden-ratio",
    themeId: "subject-3",
    name: "황금비율 피보나치 나선",
    text: "황금비율 φ",
    icon: "🌀",
    imageSrc: "/stickers/s3-golden-ratio.svg",
    bg: "#EEF2FF",
    color: "#3730A3",
    border: "#818CF8",
  },
  {
    id: "img-stk-s3-geometry-cube",
    themeId: "subject-3",
    name: "3차원 네온 큐브",
    text: "네온 큐브",
    icon: "🧊",
    imageSrc: "/stickers/s3-geometry-cube.svg",
    bg: "#EEF2FF",
    color: "#312E81",
    border: "#6366F1",
  },

  // --- [subject-4: 음악 악기 선율] ---
  {
    id: "img-stk-s4-music-notes",
    themeId: "subject-4",
    name: "춤추는 무지개 음표",
    text: "멜로디 음표",
    icon: "🎵",
    imageSrc: "/stickers/s4-music-notes.svg",
    bg: "#FDF4FF",
    color: "#86198F",
    border: "#E879F9",
  },
  {
    id: "img-stk-s4-treble-clef",
    themeId: "subject-4",
    name: "골든 높은음자리표",
    text: "높은음자리표",
    icon: "𝄞",
    imageSrc: "/stickers/s4-treble-clef.svg",
    bg: "#FAF5FF",
    color: "#6B21A8",
    border: "#C084FC",
  },

  // --- [subject-5: 국어 원고지 문장] ---
  {
    id: "img-stk-s5-quill-pen",
    themeId: "subject-5",
    name: "클래식 깃털 잉크 펜",
    text: "문학 깃털펜",
    icon: "🪶",
    imageSrc: "/stickers/s5-quill-pen.svg",
    bg: "#FEF3C7",
    color: "#78350F",
    border: "#F59E0B",
  },
  {
    id: "img-stk-s5-book-quote",
    themeId: "subject-5",
    name: "감성 북마크 책갈피",
    text: "감성 인용구",
    icon: "🔖",
    imageSrc: "/stickers/s5-book-quote.svg",
    bg: "#ECFDF5",
    color: "#065F46",
    border: "#34D399",
  },

  // --- [subject-6: 체육 스포츠 스타] ---
  {
    id: "img-stk-s6-gold-medal",
    themeId: "subject-6",
    name: "챔피언 골드 리본 메달",
    text: "골드 메달",
    icon: "🥇",
    imageSrc: "/stickers/s6-gold-medal.svg",
    bg: "#FEF9C3",
    color: "#854D0E",
    border: "#FACC15",
  },
  {
    id: "img-stk-s6-flame-trophy",
    themeId: "subject-6",
    name: "열정의 불꽃 트로피",
    text: "MVP 트로피",
    icon: "🏆",
    imageSrc: "/stickers/s6-flame-trophy.svg",
    bg: "#FEF3C7",
    color: "#78350F",
    border: "#F59E0B",
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
