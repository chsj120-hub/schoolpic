// 전국 17개 시도 교육청 코드 매핑
export const REGION_CODES: Record<string, { code: string; name: string }> = {
  서울: { code: "SE", name: "서울특별시교육청" },
  부산: { code: "BS", name: "부산광역시교육청" },
  대구: { code: "DG", name: "대구광역시교육청" },
  인천: { code: "IC", name: "인천광역시교육청" },
  광주: { code: "GW", name: "광주광역시교육청" },
  대전: { code: "DJ", name: "대전광역시교육청" },
  울산: { code: "US", name: "울산광역시교육청" },
  세종: { code: "SJ", name: "세종특별자치시교육청" },
  경기: { code: "GY", name: "경기도교육청" },
  강원: { code: "KW", name: "강원특별자치도교육청" },
  충북: { code: "CB", name: "충청북도교육청" },
  충남: { code: "CN", name: "충청남도교육청" },
  전북: { code: "JB", name: "전북특별자치도교육청" },
  전남: { code: "JN", name: "전라남도교육청" },
  경북: { code: "GB", name: "경상북도교육청" },
  경남: { code: "GN", name: "경상남도교육청" },
  제주: { code: "JJ", name: "제주특별자치도교육청" },
};

export type SchoolLevel = "E" | "M" | "H"; // E: 초등, M: 중등, H: 고등

export interface SchoolRecord {
  id: string;
  name: string;
  region: string; // e.g. "전남", "서울", "광주"
  address: string;
  level: SchoolLevel;
  code?: string; // 이미 발급된 학교 코드 (있으면 동료교사 합류 대상)
  teacherCount?: number;
}

// 전국 초·중·고 마스터 샘플 DB (KERIS / 학교알리미 연동 모델)
export const SCHOOL_DATABASE: SchoolRecord[] = [
  {
    id: "sch-001",
    name: "한재초등학교",
    region: "전남",
    address: "전라남도 담양군 대전면 추성1로 202",
    level: "E",
    code: "JNE-3012", // 이미 등록된 학교 예시 (동료 교사 합류 테스트용)
    teacherCount: 2,
  },
  {
    id: "sch-002",
    name: "한재중학교",
    region: "전남",
    address: "전라남도 담양군 대전면 추성1로 200",
    level: "M",
    teacherCount: 0,
  },
  {
    id: "sch-003",
    name: "서울한빛초등학교",
    region: "서울",
    address: "서울특별시 마포구 월드컵북로 402",
    level: "E",
    code: "SEE-4021",
    teacherCount: 3,
  },
  {
    id: "sch-004",
    name: "광주봉선초등학교",
    region: "광주",
    address: "광주광역시 남구 봉선중앙로 45",
    level: "E",
    code: "GWE-4021",
    teacherCount: 1,
  },
  {
    id: "sch-005",
    name: "광주봉선중학교",
    region: "광주",
    address: "광주광역시 남구 봉선로 100",
    level: "M",
    teacherCount: 0,
  },
  {
    id: "sch-006",
    name: "경기성남고등학교",
    region: "경기",
    address: "경기도 성남시 수정구 성남대로 102",
    level: "H",
    teacherCount: 0,
  },
  {
    id: "sch-007",
    name: "부산해운대초등학교",
    region: "부산",
    address: "부산광역시 해운대구 좌동순환로 50",
    level: "E",
    teacherCount: 0,
  },
  {
    id: "sch-008",
    name: "대구수성중학교",
    region: "대구",
    address: "대구광역시 수성구 달구벌대로 234",
    level: "M",
    teacherCount: 0,
  },
  {
    id: "sch-009",
    name: "인천송도고등학교",
    region: "인천",
    address: "인천광역시 연수구 컨벤시아대로 12",
    level: "H",
    teacherCount: 0,
  },
  {
    id: "sch-010",
    name: "제주노형초등학교",
    region: "제주",
    address: "제주특별자치도 제주시 노형로 89",
    level: "E",
    teacherCount: 0,
  },
];

/**
 * 학교 코드 명명 규칙 (School Code Scheme):
 * - 포맷: [지역코드(2자리) + 학교급(1자리)] - [숫자 난수(4자리)]
 * - 예: GWE-4021, JNE-3012, SEM-1082
 * - 오타율 0% 원칙: 학생 오타를 방지하기 위해 헷갈리는 문자(0, O, 1, I, l) 제외!
 * - 사용 가능 숫자: 2, 3, 4, 5, 6, 7, 8, 9 (8개 숫자 중 4자리 조합)
 */
export function generateSchoolCode(region: string, level: SchoolLevel): string {
  const reg = REGION_CODES[region]?.code || "SE";
  const prefix = `${reg}${level}`; // e.g. GWE, JNE, SEM

  // 오타 방지용 숫자 풀 (0과 1 제외)
  const safeDigits = ["2", "3", "4", "5", "6", "7", "8", "9"];
  let numPart = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * safeDigits.length);
    numPart += safeDigits[randomIndex];
  }

  return `${prefix}-${numPart}`;
}

/**
 * 학교명 자동완성 검색 함수 (한국교육학술정보원 / 교육부 학교알리미 모델)
 */
export function searchSchools(keyword: string): SchoolRecord[] {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return [];

  return SCHOOL_DATABASE.filter(
    (s) =>
      s.name.toLowerCase().includes(trimmed) ||
      s.address.toLowerCase().includes(trimmed) ||
      s.region.includes(trimmed)
  );
}

// 교사 계정 저장 구조체
export interface TeacherAccount {
  email: string;
  name: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  schoolRegion: string;
  schoolLevel: SchoolLevel;
  roleGrade: string; // e.g. "5학년 2반 담임"
  isJoinedExisting: boolean; // 기존 학교 합류 여부
  createdAt: string;
}
