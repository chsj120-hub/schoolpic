import { ThemeTemplate, Challenge, PhotoSubmission } from "@/types";

// ============================================================================
// 공식 사진전 테마 카탈로그: [학교 문화 & 창체 모드] (12종)
// ============================================================================
export const CULTURE_THEMES: ThemeTemplate[] = [
  {
    id: "culture-1",
    mode: "culture",
    title: "0원 코스프레 (Low-Cost Cosplay)",
    tag: "#상상력 #변신 #재미",
    icon: "🎭",
    desc: "돈을 쓰지 않고 교실 일상 사물로 영화/애니/명화 캐릭터 싱크로율 100% 도전!",
    category: "미술과 표현 영역 / 사물 재해석 / 창의 융합",
    intent: "돈을 쓰지 않고 교실에 있는 청소도구, 실내화, 급식판, 도화지, 겉옷 등을 활용해 영화/애니/명화/역사 인물을 기발하게 패러디.",
    studentRules: [
      "준비물 비용은 무조건 0원! (교실 및 학교 내 일상 사물만 허용)",
      "패러디 대상 원본(좌)과 내 사진(우)을 반반 비교 형태로 배치 가능",
      "위험한 물건은 사용 금지, 안전하고 기발한 아이디어로 승부!"
    ],
    framesAndStickers: ["싱크로율 200%", "제작비 0원", "창의력 대폭발", "저예산 장인 뱃지"],
    teacherTips: "미술과 '사물의 특징적 요소 재해석 및 시각화' 성취기준 연계 — '주변 일상 사물의 조형적 특징을 예리하게 포착하여 명화 및 캐릭터를 창의적으로 재해석하고 유쾌한 시각 이미지로 표현함.'"
  },
  {
    id: "culture-2",
    mode: "culture",
    title: "보스 레이드 (선생님과 한 컷)",
    tag: "#도전 #합동 #성취감",
    icon: "⚔️",
    desc: "교장·교감·선생님과 유쾌한 대치 구도로 사진을 찍어 권위의 벽을 허무는 축제!",
    category: "사제동행 / 학교 문화 혁신 / 전교 협동 게이미피케이션",
    intent: "학교의 최고 권위자(교장, 교감, 학생부장, 담임선생님)와 함께 익살스러운 대치 구도로 사진을 찍어 권위의 벽을 허물고 친밀한 학교 분위기 조성.",
    specialGimmick: "메인 화면에 '교장선생님 HP 게이지(100/100)' 표시. 승인된 출품작 1장당 보스 HP 5 차감 ➔ 체력이 0이 되면 전교 공약(점심시간 신청곡 방송, 인기 급식 간식 지급 등) 자동 발동.",
    studentRules: [
      "선생님 뒤에서 은밀하게 보스 처치 포즈, 혹은 선생님과 등을 맞댄 용사 듀오 포즈",
      "선생님의 사전 허락과 동의가 필수인 룰 (소통 과정 자체가 놀이!)",
      "승인된 출품작마다 보스 HP가 깎여 0이 되면 전교 공약 발동!"
    ],
    framesAndStickers: ["BOSS 등장!", "크리티컬 히트!", "사제동행 레전드", "선생님 방어력 0"],
    teacherTips: "사제동행 인성 프로그램 연계 — '교내 사제동행 게이미피케이션 활동에 적극적으로 참여하여 교사와 학생 간의 심리적 거리감을 좁히고 신뢰와 소통의 학급 문화를 선도함.'"
  },
  {
    id: "culture-3",
    mode: "culture",
    title: "베프(Best Friend) 사진전",
    tag: "#우정 #함께 #추억",
    icon: "👯",
    desc: "짝꿍 및 친구와 신체적·감정적으로 교감하는 둘만의 시그니처 우정 스냅!",
    category: "우정·교우관계 개선 / 학교폭력 예방",
    intent: "서먹한 학기 초나 친구 관계가 굳어지는 학기 중, 짝꿍 및 친구와 신체적·감정적으로 교감하는 추억 만들기.",
    studentRules: [
      "둘만의 시그니처 포즈(손하트, 등 맞대기, 텔레파시 포즈 등) 완성하기",
      "교복/체육복 시밀러 룩, 쉬는 시간의 자연스러운 눈맞춤 스냅",
      "서로를 배려하며 즐겁게 촬영하고 둘만의 소중한 우정 기록 남기기"
    ],
    framesAndStickers: ["평생 가자 우리 우정", "우정 지수 100%", "3학년 2반 찐단짝", "우정 평화 협정"],
    teacherTips: "창체(자율/봉사활동) 연계 — '교우 관계 개선 프로그램에 능동적으로 참여하여 급우 간의 유대감을 형성하고 배려와 협동의 가치를 실천함.'"
  },
  {
    id: "culture-4",
    mode: "culture",
    title: "청소 비포&애프터 사진전",
    tag: "#변화 #깨끗함 #우리 공간",
    icon: "🧹",
    desc: "어수선했던 청소 구역이 눈부시게 바뀐 Before/After 2분할 샷!",
    category: "환경 정화 / 학급 자치 / 책임감 함양",
    intent: "환경 미화 심사나 1인 1역할 평가를 사진전으로 대체하여 교사 검사 업무를 대폭 절감하고 학생들의 책임감 고취.",
    studentRules: [
      "어수선했던 청소 구역, 사물함, 급식 식판 정리 전(Before) 컷 촬영",
      "말끔해진 청소 완료 후(After) 모습을 2분할 컷으로 나란히 출품",
      "반짝반짝 가장 깨끗하게 정돈된 구역으로 클린 마스터 도전!"
    ],
    framesAndStickers: ["Before & After 2분할 레이아웃", "반짝반짝 클린 마스터", "청소 요정 골드 배지"],
    teacherTips: "환경 정화 활동 및 세특 연계 — '학급 환경 정화 활동에 주도적으로 참여하여 Before/After 사진전을 통해 정리 정돈의 중요성을 시각화하고 쾌적한 학습 공동체 조성에 기여함.'"
  },
  {
    id: "culture-5",
    mode: "culture",
    title: "우리 학교 숨은 명소 찾기",
    tag: "#탐험 #발견 #우리학교",
    icon: "🌿",
    desc: "매일 지나치던 학교 구석구석을 새로운 시선으로 관찰한 나만의 감성 스팟 발굴!",
    category: "학교 공간 혁신 / 학교 홍보 사진 확보 / 관찰 탐구",
    intent: "매일 지나치던 학교 구석구석을 새로운 시선으로 관찰하여 애교심(愛校心)을 키우고, 학교 공식 브로슈어/홈페이지 배경 사진 확보.",
    studentRules: [
      "'오후 햇살이 가장 예쁜 벤치', '계단참 창문 너머 풍경', '비 온 뒤 운동장 반영 샷' 등 나만의 비밀 스팟 발굴",
      "인물 없이 풍경만 찍거나, 인물이 작게 들어간 감성 구도 촬영",
      "우리 학교의 따뜻하고 아름다운 시선을 사진에 담기"
    ],
    framesAndStickers: ["감성 매거진 하단 띠지 (OO초 숨은 명소 아카이브 Vol.1)", "작품 날짜 & 작가 서명 라벨", "학교 명소 공식 픽"],
    teacherTips: "학교 홍보 및 자치 연계 — '1~3등 선정작은 학교 공식 홈페이지 메인 팝업 배너 및 입학 설명회 리플릿 겉표지로 즉시 채택하여 학교 브랜딩에 기여.'"
  },
  {
    id: "culture-6",
    mode: "culture",
    title: "내가 리뷰왕 (급식 예쁘게 찍기)",
    tag: "#맛집 #리뷰 #솔직후기",
    icon: "🍱",
    desc: "식판 위의 색감 조화와 각도 포착! 잔반 줄이기(Zero-Waste)와 식생활 문화 확산",
    category: "식생활 지도 / 영양교사 협업 / 올바른 식사 예절",
    intent: "급식을 단순히 먹는 행위를 넘어 하나의 시각적 작품으로 대하며, 식재료에 대한 감사와 잔반 줄이기(Zero-Waste) 문화 확산.",
    studentRules: [
      "식판 위의 색감 조화(컬러 밸런스), 맛깔스러운 각도(항공샷, 45도 줌인샷) 포착",
      "보너스 룰: 깨끗하게 비운 '빈 식판(완식) 인증샷'을 함께 올리면 가산점 부여",
      "급식을 만들어주신 조리사/영양사 선생님께 전하는 감사 한마디"
    ],
    framesAndStickers: ["오늘의 미슐랭 급식", "영양사 선생님 감사합니다", "식판 올 클리어 배지", "잔반 ZERO 마스터"],
    teacherTips: "영양교사 협업 식생활 지도 — '영양교사와 협업하여 이달의 리뷰왕에게 급식실 우선 배식권 또는 영양 간식을 증정하고, 잔반 줄이기 친환경 실천 태도를 생활기록부에 기재.'"
  },
  {
    id: "culture-7",
    mode: "culture",
    title: "포스터 모델 선발전",
    tag: "#끼발산 #모델 #포스터",
    icon: "🎨",
    desc: "학교 축제, 체육대회, 독서주간 포스터의 주인공이 될 우리 학교 학생 모델 선발!",
    category: "학생 자치 / 캠페인 참여 / 행사 브랜딩",
    intent: "학교 축제, 체육대회, 독서주간, 언어문화 개선 주간 포스터의 주인공을 교사나 외주 디자인 대신 '우리 학교 학생 모델'로 직접 선발.",
    studentRules: [
      "행사 주제에 맞는 표정과 제스처 연출 (예: 독서 주간 = 책에 푹 빠진 표정, 체육대회 = 역동적인 점프 샷)",
      "친구들과 함께 어울려 자신감 있는 멋진 포즈 취하기",
      "잡지 표지 모델처럼 생생하고 자연스러운 표정 담기"
    ],
    framesAndStickers: ["잡지 커버 스타일 프레임 (VOGUE 스타일 패러디 SCHOOL LIFE)", "이번 주 베스트 모델", "학교 대표 얼굴"],
    teacherTips: "행사 브랜딩 및 자치 연계 — '우승작 사진을 캔바(Canva) 공문/포스터 템플릿 메인 사진으로 합성하여 복도 게시판 및 가정통신문 메인 이미지로 발행.'"
  },
  {
    id: "culture-8",
    mode: "culture",
    title: "도플갱어 찾기 (닮은꼴 찾기)",
    tag: "#인물 #사물 #닮은꼴",
    icon: "👥",
    desc: "친구나 선생님과 똑 닮은 사물, 캐릭터, 혹은 붕어빵처럼 닮은 찐친 듀오 샷!",
    category: "관찰력 / 웃음 유발 / 사제동행 & 찐친 케미",
    intent: "악의 없는 유머와 세심한 관찰을 통해 교내 웃음꽃을 피우고, 선생님과 학생 간의 심리적 거리감을 좁히는 사제동행 이벤트.",
    studentRules: [
      "사물/캐릭터 매칭: 친구나 선생님과 똑 닮은 만화 캐릭터, 동물, 교실 사물을 찾아 나란히 배치",
      "붕어빵 듀오: 서로 닮은 단짝 친구, 선후배, 선생님과 학생이 거울처럼 똑같은 표정으로 촬영",
      "남을 비하하지 않고 모두가 기분 좋게 웃을 수 있는 따뜻한 관찰력으로 승부!"
    ],
    framesAndStickers: ["데칼코마니 2분할 프레임", "싱크로율 99.9%", "복붙(Ctrl+C, Ctrl+V)", "도플갱어 인증서"],
    teacherTips: "사제동행 및 관찰력 지도 — '사물과 인물의 형태적 유사성을 포착하는 남다른 관찰력을 발휘하며, 유쾌하고 따뜻한 유머로 교내 긍정적인 학급 분위기 형성에 기여함.'"
  },
  {
    id: "culture-9",
    mode: "culture",
    title: "내가 효도왕",
    tag: "#감사 #가족 #사랑",
    icon: "💖",
    desc: "학교 안의 감사를 가정으로! 부모님 어깨 안마, 볼 맞댄 셀카 등 세대공감 효도 기록",
    category: "가정 연계 인성교육 / 5월 가정의 달 / 세대 소통",
    intent: "학교 안의 활동을 가정으로 확장하여 부모님, 조부모님과의 따뜻한 스킨십과 감사의 마음을 사진으로 기록.",
    studentRules: [
      "부모님 어깨 주물러 드리기, 식사 차려 드리기, 부모님과 볼 맞대고 셀카 찍기",
      "할머니·할아버지와 함께 활짝 웃는 세대공감 훈훈한 샷",
      "가족에게 사랑한다고 쑥스럽지만 고백하는 찰나 남기기"
    ],
    framesAndStickers: ["카네이션 일러스트 테두리", "부모님 사랑해요", "우리 집 든든한 효도 대장", "가정의 달 특급 효도"],
    teacherTips: "학부모 총회 및 인성교육 연계 — '학부모 공개수업이나 총회 날 강당 스크린에 우리 아이들의 효도 갤러리 영상으로 상영하여 학부모 만족도를 극대화하고 가정 연계 인성교육 실천.'"
  },
  {
    id: "culture-10",
    mode: "culture",
    title: "우리 학교 인플루언서 선발전",
    tag: "#인기스타 #소통 #영향력",
    icon: "⭐",
    desc: "교내 안전망 안에서 자신만의 개성과 끼(OOTD, 개인기 포즈)를 건강하게 표출하는 축제!",
    category: "미디어 리터러시 / 끼와 재능 발산 / 방송반 연계",
    intent: "무분별한 외부 SNS 대신, 교내 안전망 안에서 자신만의 개성과 끼(OOTD, 개인기 포즈, 표정 연기)를 건강하게 표출하는 디지털 축제.",
    studentRules: [
      "오늘 나의 학교 패션(체육복 코디, 가방 꾸미기 키링 자랑 등) 한 컷",
      "아이돌 앨범 자켓이나 숏폼 챌린지 킬링 파트 정지 포즈 재현",
      "나만의 개성 넘치는 끼와 매력을 당당하게 표현하기"
    ],
    framesAndStickers: ["인스타그램 UI 프레임", "하트 폭탄 이펙트", "공식 인증 파란 배지", "교내 트렌드세터"],
    teacherTips: "방송반 연계 및 미디어 교육 — '방송반과 연계하여 1등 학생에게 점심시간 교내 방송 1일 일일 DJ 또는 인터뷰 기회를 부여하고 건전한 미디어 자아 표현 역량 지도.'"
  },
  {
    id: "culture-11",
    mode: "culture",
    title: "내가 우리 학교 사진작가",
    tag: "#사진 #시선 #기록",
    icon: "📸",
    desc: "빛·구도·색감을 진지하게 고민하여 학교의 결정적 순간을 포착하는 정통 예술 사진전!",
    category: "미술 교과 연계 / 시각 문화 감상 / 전문적 역량 발굴",
    intent: "B급 장난을 넘어, 빛·구도·색감을 진지하게 고민하여 학교의 결정적 순간을 포착하는 정통 사진 예술 대회.",
    studentRules: [
      "원근법 착시 사진, 순간 포착(달리기 순간, 날아가는 공), 흑백 모노크롬 감성 샷",
      "출품 시 '작품 제목'과 '30자 이내의 작가 노트(작품 설명)' 필수 입력",
      "학교의 숨결과 시간의 흐름을 예술가의 시선으로 포착"
    ],
    framesAndStickers: ["전시회 도록 캡션 스타일 프레임 (작품명 - 작가명 - 카메라 설정/일시)", "국립현대미술관 감성 골드 씰", "우수 작가 인증 마크"],
    teacherTips: "미술과 '미술 작품 감상 및 비평' 세특 연계 — '빛의 각도와 구도를 계산하여 창의적인 시각 이미지를 창작하고, 작가 노트를 통해 작품의 주제 의식을 명확히 서술함.'"
  },
  {
    id: "culture-12",
    mode: "culture",
    title: "트릭아트 사진전 (착시 효과 예술)",
    tag: "#착시 #예술 #재미",
    icon: "📐",
    desc: "원근법(Forced Perspective)과 각도를 치밀하게 계산하여 현실을 왜곡하는 신기한 착시 샷!",
    category: "미술과 원근법 / 수학 공간 비례 / 공간 예술",
    intent: "원근법(포스드 퍼스펙티브, Forced Perspective)과 앵글, 그림자를 계산하여 손바닥 위에 친구 올리기, 건물 지붕 손가락으로 집기 등 재미있는 착시 상황 연출.",
    studentRules: [
      "손바닥 위에 친구 올리기, 건물 지붕 손가락으로 콕 집기, 거인과 소인 대결 구도 연출",
      "앞쪽 피사체와 뒤쪽 피사체의 거리와 렌즈 높이를 치밀하게 조절하기",
      "친구나 선생님과 2인 이상 협동하여 기상천외한 착시 씬 완성하기"
    ],
    framesAndStickers: ["미술관 도록 테두리", "현실 왜곡 모드", "착시 예술가 인증 씰", "중력 무시 이펙트"],
    teacherTips: "미술 및 수학 융합 세특 연계 — '원근법과 카메라 시점을 치밀하게 계산한 트릭아트 착시 사진을 창작하여 2차원 평면 속 3차원 공간감을 창의적으로 시각화함.'"
  },
];

// ============================================================================
// 공식 사진전 테마 카탈로그: [정규 교과 수업 모드] (6종)
// ============================================================================
export const SUBJECT_THEMES: ThemeTemplate[] = [
  {
    id: "subject-1",
    mode: "subject",
    title: "🌿 [과학] 우리 학교 식물·생태 사진전",
    tag: "#생명과학 #관찰 #식물도감",
    icon: "🌿",
    desc: "화단과 운동장 구석의 식물을 관찰하며 생물 다양성과 생명의 소중함을 체감하는 디지털 도감!",
    category: "초등 3~4학년 '식물의 생활', 5~6학년 '생물과 환경'",
    intent: "화단, 운동장 구석의 잡초와 나무를 관찰하며 생물 다양성과 생명의 소중함을 체감.",
    studentRules: [
      "학교 내 식물의 잎맥, 꽃잎의 대칭, 열매, 줄기 껍질 등을 초근접(접사) 또는 특징이 드러나게 촬영",
      "출품 시 '식물 이름(추정)', '발견 장소', '관찰한 특징 1줄' 필수 입력",
      "생명을 꺾거나 훼손하지 않고 자연 그대로의 모습 기록하기"
    ],
    framesAndStickers: ["보태니컬 식물도감 스타일 프레임 (식물도감 Vol.3 + 학명 라벨 띠지)", "새싹 관찰 배지", "어린이 식물학자 인증"],
    teacherTips: "과학과 세특 기재 문구 — '교내 식물 생태 사진전에 참여하여 화단의 식물을 세밀하게 관찰하고 잎과 줄기의 구조적 특징을 시각적으로 포착함. 생명 존중 태도를 바탕으로 교내 생태 환경을 디지털 도감으로 정리하는 탐구 역량이 뛰어남.'"
  },
  {
    id: "subject-2",
    mode: "subject",
    title: "🏛️ [사회] 우리 지역 문화재·역사 탐험 사진전",
    tag: "#역사 #지리 #향토문화재",
    icon: "🏛️",
    desc: "동네 비석, 고택, 성곽 등 숨은 문화재를 탐방하며 향토애와 역사적 감수성 함양!",
    category: "초등 3~4학년 '우리 고장의 모습과 문화유산', 5~6학년 '우리나라의 역사'",
    intent: "동네의 비석, 고택, 성곽, 근현대 건축물 등 숨은 문화재를 탐방하며 향토애와 역사적 감수성 함양.",
    studentRules: [
      "우리 지역의 지정·비지정 문화재 또는 역사적 의미가 있는 장소 촬영",
      "문화재 안내판을 그대로 찍는 것이 아니라, 웅장한 각도나 디테일한 문양을 부각해 촬영",
      "작가 노트: '이 문화재가 우리 고장에 소중한 이유(30자)' 기재"
    ],
    framesAndStickers: ["전통 한지 질감 테두리", "문화재청 도록 스타일 캡션", "향토사 탐험가 배지", "역사의 숨결 씰"],
    teacherTips: "사회과 세특 기재 문구 — '우리 고장 문화재 사진전 활동에서 지역의 역사 유적을 직접 답사하고 문화유산의 고유한 가치를 돋보이게 촬영함. 고장의 역사와 문화에 대한 자긍심을 가지고 지역 사회를 탐구하는 능력이 우수함.'"
  },
  {
    id: "subject-3",
    mode: "subject",
    title: "📐 [수학] 일상 속 가장 멋진 도형·패턴 찾기",
    tag: "#도형과각 #비율 #기하학패턴",
    icon: "📐",
    desc: "학교 건물, 창틀, 보도블록 속 선대칭, 합동, 프랙탈을 발견하는 수학적 안목 형성!",
    category: "초등 3~4학년 '평면도형/원', 5~6학년 '합동과 대칭/입체도형'",
    intent: "교과서 속 추상적인 기하학 개념을 학교 건물, 창틀, 보도블록 등 실생활 구조물에서 발견하는 수학적 안목 형성.",
    studentRules: [
      "교내에서 완벽한 '선대칭/점대칭', '프랙탈 구조', '정삼각형/원/육각형 벌집 모양'을 찾아 앵글에 담기",
      "착시(원근법)를 활용해 거대한 도형을 손으로 잡는 연출 허용",
      "사진 속 도형의 이름과 대칭축/각도를 작품 설명에 한 줄 서술"
    ],
    framesAndStickers: ["각도기·삼각자 눈금 오버레이", "격자(Grid) 가이드라인", "수학적 안목 S등급 배지", "황금비율 발견 씰"],
    teacherTips: "수학과 세특 기재 문구 — '생활 속 도형 찾기 사진전에 참여하여 교내 건축물과 조형물에서 선대칭 및 규칙적인 평면도형 패턴을 발견하여 시각화함. 실생활과 수학적 개념을 연결하여 직관적으로 해석하는 공간 감각이 탁월함.'"
  },
  {
    id: "subject-4",
    mode: "subject",
    title: "👔 [실과] 지속 가능한 패션왕 (새활용 & OOTD)",
    tag: "#친환경의생활 #업사이클링 #OOTD",
    icon: "👔",
    desc: "단정한 체육복 믹스매치, 리폼 소품, TPO에 맞는 실용적이고 친환경적인 옷차림의 미학!",
    category: "초등 5~6학년 '옷 입기와 관리', '지속 가능한 생활과 친환경 소비'",
    intent: "단순 명품/유행 추구가 아닌, 단정한 체육복 믹스매치, 리폼 의류, 계절에 맞는 실용적 옷차림의 미학 발견.",
    studentRules: [
      "친구와 함께 입은 '시밀러 체육복 코디', 헌 옷이나 소품을 재조합한 '업사이클링 패션' 연출",
      "런웨이 모델처럼 복도나 운동장에서 당당한 워킹 포즈 촬영",
      "친환경 의생활 실천 소감 1줄 남기기"
    ],
    framesAndStickers: ["패션 매거진 스트리트 스냅 띠지 (LOOKBOOK 2026 S/S)", "에코 패셔니스타 배지", "지속가능 패션 아이콘"],
    teacherTips: "실과과 세특 기재 문구 — '실과 의생활 단원과 연계된 패션 사진전에 참여하여 TPO(시간·장소·상황)에 적합한 의복 착용의 중요성을 이해하고, 친환경적 의생활 실천 방안을 개성 있는 옷차림으로 표현함.'"
  },
  {
    id: "subject-5",
    mode: "subject",
    title: "✍️ [국어] 우리 학교 가장 아름다운 글씨·문장 찾기",
    tag: "#바른글씨 #손글씨 #도서관명문장",
    icon: "✍️",
    desc: "손글씨(캘리그라피)의 따뜻함과 도서관 책 속 명문장을 감성 사진으로 공유하는 국어 축제!",
    category: "초등 전 학년 '바른 글씨 쓰기', '작품 속 인상 깊은 문장 나누기'",
    intent: "디지털 타이핑에 익숙한 학생들에게 손글씨(캘리그라피)의 따뜻함과 도서관 책 속 명문장을 공유하는 기회 제공.",
    studentRules: [
      "코스 A (손글씨): 자신이 직접 정성껏 쓴 시구절, 급훈, 친구를 향한 응원 문구 촬영",
      "코스 B (발견): 학교 도서관 책 속 한 줄, 교정에 새겨진 표지석 문구를 감성적인 배경과 함께 촬영",
      "바르고 정갈한 마음을 담아 렌즈에 포착하기"
    ],
    framesAndStickers: ["원고지 레이아웃 테두리", "만년필 촉 일러스트", "바른 글씨 명필 배지", "문학 감성 100% 씰"],
    teacherTips: "국어과 세특 기재 문구 — '아름다운 글씨 찾기 사진전에서 감명 깊게 읽은 문학 작품의 문장을 정갈한 손글씨로 필사하여 출품함. 문맥에 어울리는 시각적 구도를 구성하며 문학적 감수성과 바른 쓰기 태도를 기름.'"
  },
  {
    id: "subject-6",
    mode: "subject",
    title: "🏃 [체육] 우리 학교 스포츠 스타 (역동적 순간 포착)",
    tag: "#스포츠맨십 #역동성 #스포츠스타",
    icon: "🏃",
    desc: "슛을 날리는 순간, 2단 뛰기 공중부양 등 땀 흘리는 건강한 신체 활동의 역동적 찰나!",
    category: "초등 전 학년 '체력 증진', '도전/경쟁 활동(육상, 구기 등)'",
    intent: "체육 시간이나 쉬는 시간, 땀 흘리며 운동하는 건강한 신체 활동의 찰나를 기록하여 활기찬 스포츠 문화 조성.",
    studentRules: [
      "슛 쏘는 순간, 줄넘기 2단 뛰기 공중부양, 전력 질주하는 역동적인 동작 포착",
      "2인 협동: 한 명은 선수 모델, 한 명은 스포츠 전문 기자처럼 셔터 찬스 포착",
      "다치지 않도록 안전 수칙을 지키며 활력 넘치는 표정 담기"
    ],
    framesAndStickers: ["스포츠 중계 방송 하단 스코어보드 UI", "잔상 모션 블러 이펙트", "MVP 금메달 배지", "불꽃 슛 뱃지"],
    teacherTips: "체육과 세특 기재 문구 — '스포츠 스타 사진전에 참여하여 신체 활동의 역동적인 순간을 포착하고 스포츠맨십을 창의적으로 표현함. 체육 활동에 대한 긍정적 태도를 형성하고 급우들의 건강한 신체 문화를 독려함.'"
  },
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "challenge-1",
    title: "베프(Best Friend) 사진전 (#우정 #함께 #추억)",
    themeId: "culture-3",
    mode: "culture",
    icon: "👯",
    tag: "#우정 #함께 #추억",
    description: "짝꿍 및 친구와 신체적·감정적으로 교감하는 둘만의 시그니처 우정 스냅!",
    category: "우정·교우관계 개선 / 학교폭력 예방",
    intent: "서먹한 학기 초나 친구 관계가 굳어지는 학기 중, 짝꿍 및 친구와 신체적·감정적으로 교감하는 추억 만들기.",
    studentRules: [
      "둘만의 시그니처 포즈(손하트, 등 맞대기, 텔레파시 포즈 등) 완성하기",
      "교복/체육복 시밀러 룩, 쉬는 시간의 자연스러운 눈맞춤 스냅",
      "서로를 배려하며 즐겁게 촬영하고 둘만의 소중한 우정 기록 남기기"
    ],
    framesAndStickers: ["평생 가자 우리 우정", "우정 지수 100%", "3학년 2반 찐단짝", "우정 평화 협정"],
    teacherTips: "창체(자율/봉사활동) 연계 — '교우 관계 개선 프로그램에 능동적으로 참여하여 급우 간의 유대감을 형성하고 배려와 협동의 가치를 실천함.'",
    targetGrade: "전교생",
    teacherName: "김하늘 선생님",
    status: "VOTING",
    submissionStartDate: "2026-11-02",
    submissionStartTime: "09:00",
    submissionEndDate: "2026-11-06",
    submissionEndTime: "16:00",
    votingStartDate: "2026-11-09",
    votingStartTime: "09:00",
    votingEndDate: "2026-11-11",
    votingEndTime: "17:00",
    voteLimitType: "TOTAL_3",
    isBlindSubmission: false,
    submissionCount: 42,
    totalVotes: 348,
    createdAt: "2026-10-18",
  },
  {
    id: "challenge-2",
    title: "보스 레이드 (선생님과 한 컷)",
    themeId: "culture-2",
    mode: "culture",
    icon: "⚔️",
    tag: "#도전 #합동 #성취감",
    description: "교장·교감·선생님과 유쾌한 대치 구도로 사진을 찍어 권위의 벽을 허무는 축제!",
    category: "사제동행 / 학교 문화 혁신 / 전교 협동 게이미피케이션",
    intent: "학교의 최고 권위자(교장, 교감, 학생부장, 담임선생님)와 함께 익살스러운 대치 구도로 사진을 찍어 권위의 벽을 허물고 친밀한 학교 분위기 조성.",
    specialGimmick: "메인 화면에 '교장선생님 HP 게이지(100/100)' 표시. 승인된 출품작 1장당 보스 HP 5 차감 ➔ 체력이 0이 되면 전교 공약 발동.",
    studentRules: [
      "선생님 뒤에서 은밀하게 보스 처치 포즈, 혹은 선생님과 등을 맞댄 용사 듀오 포즈",
      "선생님의 사전 허락과 동의가 필수인 룰 (소통 과정 자체가 놀이!)",
      "승인된 출품작마다 보스 HP가 깎여 0이 되면 전교 공약 발동!"
    ],
    framesAndStickers: ["BOSS 등장!", "크리티컬 히트!", "사제동행 레전드", "선생님 방어력 0"],
    teacherTips: "사제동행 인성 프로그램 연계 — '교내 사제동행 게이미피케이션 활동에 적극적으로 참여하여 교사와 학생 간의 심리적 거리감을 좁히고 신뢰와 소통의 학급 문화를 선도함.'",
    targetGrade: "2학년 3반",
    teacherName: "박동훈 선생님",
    status: "SUBMITTING",
    submissionStartDate: "2026-11-02",
    submissionStartTime: "09:00",
    submissionEndDate: "2026-11-08",
    submissionEndTime: "18:00",
    votingStartDate: "2026-11-09",
    votingStartTime: "09:00",
    votingEndDate: "2026-11-14",
    votingEndTime: "18:00",
    voteLimitType: "DAILY_3",
    isBlindSubmission: false,
    submissionCount: 18,
    totalVotes: 0,
    createdAt: "2026-10-22",
  },
];

export const SAMPLE_SUBMISSIONS: PhotoSubmission[] = [
  {
    id: "sub-1",
    challengeId: "challenge-1",
    studentGrade: 5,
    studentClass: 2,
    studentNumber: 14,
    nickname: "5반 날다람쥐",
    title: "쉬는 시간 10분의 찐단짝 손하트 시그니처 샷",
    caption: "쉬는 시간마다 매점에서 빵 나눠 먹는 찐단짝 친구와 손하트 완성!",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
    votes: 89,
    studentVotes: 64,
    teacherVotes: 10,
    parentVotes: 15,
    submittedAt: "2026-10-20",
    selectedFrame: "베프 시그니처 듀오",
    student_consent: true,
    parent_consent: true,
    teacher_approval: true,
    is_hall_of_fame: true,
    is_public_shared: true,
    schoolName: "광주 한재초등학교",
    special_award_title: "💖 사제동행·우정 찐단짝 특별상",
    special_award_reason: "학급 급우 간의 신뢰와 배려를 유쾌한 시그니처 포즈로 표현하여 학급 응집력 형성에 크게 기여함.",
    cheerStamps: { fire: 42, clap: 38, idea: 19, heart: 55 },
  },
  {
    id: "sub-2",
    challengeId: "challenge-1",
    studentGrade: 5,
    studentClass: 3,
    studentNumber: 7,
    nickname: "푸른하늘달려라",
    title: "체육복 시밀러 룩 맞추고 등 맞대기 텔레파시 포즈",
    caption: "체육대회 준비하면서 파랑 체육복 맞춰 입고 찍은 우리 둘의 인생샷!",
    imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80",
    votes: 76,
    studentVotes: 52,
    teacherVotes: 8,
    parentVotes: 16,
    submittedAt: "2026-10-21",
    selectedFrame: "감성 매거진 띠지",
    student_consent: true,
    parent_consent: true,
    teacher_approval: false, // 교사 최종 승인 대기
    is_hall_of_fame: true,
    is_public_shared: false,
    schoolName: "광주 한재초등학교",
    cheerStamps: { fire: 18, clap: 24, idea: 9, heart: 31 },
  },
  {
    id: "sub-3",
    challengeId: "challenge-1",
    studentGrade: 4,
    studentClass: 1,
    studentNumber: 22,
    nickname: "초코쿠키마니아",
    title: "도서관 창가에서 몰래 찍은 우리 둘의 비밀 웃음",
    caption: "도서관 햇살 아래서 친구랑 책 읽다가 눈 마주치고 빵 터진 순간 찰칵!",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80",
    votes: 62,
    studentVotes: 45,
    teacherVotes: 6,
    parentVotes: 11,
    submittedAt: "2026-10-21",
    selectedFrame: "클린 폴라로이드",
    student_consent: false,
    parent_consent: false,
    teacher_approval: false,
    is_hall_of_fame: false,
    is_public_shared: false,
    schoolName: "광주 한재초등학교",
    cheerStamps: { fire: 12, clap: 15, idea: 6, heart: 20 },
  },
];

// ============================================================================
// 전국 스쿨 교류관 (타 학교 우수작 정식 등재작 목록)
// (3단계: 학생 동의 + 학부모 동의 + 교사 최종 검수가 모두 완료된 전국 학교 우수작)
// ============================================================================
export const NATIONAL_EXCHANGE_SUBMISSIONS: PhotoSubmission[] = [
  ...SAMPLE_SUBMISSIONS.filter((s) => s.is_public_shared),
  {
    id: "nat-1",
    challengeId: "ext-1",
    studentGrade: 6,
    studentClass: 3,
    studentNumber: 0, // 가명 처리 (0으로 숨김)
    nickname: "서울고양이장인",
    schoolName: "서울 마포초 6학년",
    title: "빗자루와 노란 실내화로 재현한 반 고흐 자화상",
    caption: "청소함 빗자루 털을 턱수염으로 붙이고 진지하게 명화를 패러디했어요!",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
    votes: 312,
    submittedAt: "2026-10-15",
    selectedFrame: "0원 코스프레 아카이브",
    is_hall_of_fame: true,
    is_public_shared: true,
    student_consent: true,
    parent_consent: true,
    teacher_approval: true,
    special_award_title: "🏆 전국 0원 코스프레 부문 대상",
    cheerStamps: { fire: 142, clap: 120, idea: 185, heart: 98 },
  },
  {
    id: "nat-2",
    challengeId: "ext-2",
    studentGrade: 5,
    studentClass: 1,
    studentNumber: 0,
    nickname: "해운대파도술사",
    schoolName: "부산 해운대초 5학년",
    title: "교장선생님과의 결투 포즈! 레이드 성공 1초 전",
    caption: "교장선생님께서 흔쾌히 드래곤 포즈를 취해주셔서 전교생이 빵 터졌어요.",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80",
    votes: 289,
    submittedAt: "2026-10-18",
    selectedFrame: "보스 레이드 RPG 체력바",
    is_hall_of_fame: true,
    is_public_shared: true,
    student_consent: true,
    parent_consent: true,
    teacher_approval: true,
    special_award_title: "⚔️ 전국 사제동행 보스레이드 1위",
    cheerStamps: { fire: 178, clap: 154, idea: 92, heart: 133 },
  },
  {
    id: "nat-3",
    challengeId: "ext-3",
    studentGrade: 4,
    studentClass: 2,
    studentNumber: 0,
    nickname: "운동장달팽이",
    schoolName: "경기 수원초 4학년",
    title: "비 온 뒤 운동장 물웅덩이에 비친 본관 데칼코마니",
    caption: "스마트폰을 바닥에 대고 거꾸로 찍었더니 학교가 물 위에 떠있는 것 같아요.",
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80",
    votes: 245,
    submittedAt: "2026-10-19",
    selectedFrame: "학교 숨은 명소 아카이브",
    is_hall_of_fame: true,
    is_public_shared: true,
    student_consent: true,
    parent_consent: true,
    teacher_approval: true,
    special_award_title: "🌿 학교 공간혁신 예술상",
    cheerStamps: { fire: 98, clap: 112, idea: 165, heart: 140 },
  },
];
