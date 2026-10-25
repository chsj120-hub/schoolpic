import { NextResponse } from "next/server";
import { SCHOOL_DATABASE, SchoolRecord, SchoolLevel, REGION_CODES } from "@/lib/schoolCode";

// 시도 교육청 한글 명칭 -> 단축 지역명 매핑
const REGION_NAME_MAP: Record<string, string> = {
  "서울특별시": "서울",
  "부산광역시": "부산",
  "대구광역시": "대구",
  "인천광역시": "인천",
  "광주광역시": "광주",
  "대전광역시": "대전",
  "울산광역시": "울산",
  "세종특별자치시": "세종",
  "경기도": "경기",
  "강원특별자치도": "강원",
  "강원도": "강원",
  "충청북도": "충북",
  "충청남도": "충남",
  "전북특별자치도": "전북",
  "전라북도": "전북",
  "전라남도": "전남",
  "경상북도": "경북",
  "경상남도": "경남",
  "제주특별자치도": "제주",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("query") || "";
  const trimmed = query.trim();

  if (!trimmed) {
    return NextResponse.json({ source: "EMPTY", schools: [] });
  }

  // 1. 교육부 나이스(NEIS) 교육정보 개방포털 OpenAPI 호출
  const neisKey = process.env.NEIS_API_KEY || "";
  const neisUrl = new URL("https://open.neis.go.kr/hub/schoolInfo");
  if (neisKey) {
    neisUrl.searchParams.set("KEY", neisKey);
  }
  neisUrl.searchParams.set("Type", "json");
  neisUrl.searchParams.set("pIndex", "1");
  neisUrl.searchParams.set("pSize", "20");
  neisUrl.searchParams.set("SCHUL_NM", trimmed);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4초 타임아웃
    const res = await fetch(neisUrl.toString(), {
      signal: controller.signal,
      headers: { "User-Agent": "SchoolPick-App/1.0" },
      next: { revalidate: 3600 }, // 1시간 캐싱
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.schoolInfo && data.schoolInfo[1] && data.schoolInfo[1].row) {
        const rows = data.schoolInfo[1].row;
        const schools: SchoolRecord[] = rows.map((r: any) => {
          // 지역 매핑 (LCTN_SC_NM or ATPT_OFCDC_SC_NM)
          const locationName = r.LCTN_SC_NM || r.ATPT_OFCDC_SC_NM || "";
          let matchedRegion = "서울";
          for (const [fullName, shortName] of Object.entries(REGION_NAME_MAP)) {
            if (locationName.includes(fullName) || locationName.includes(shortName)) {
              matchedRegion = shortName;
              break;
            }
          }

          // 학교급 판별 (초/중/고)
          let level: SchoolLevel = "E";
          const kind = r.SCHUL_KND_SC_NM || "";
          if (kind.includes("중학교")) level = "M";
          else if (kind.includes("고등")) level = "H";
          else level = "E";

          // 나이스 표준학교코드(SD_SCHUL_CODE 7자리) 기반 7자리 학교코드 자동 조합
          const neisCode = String(r.SD_SCHUL_CODE || "1000");
          // 오타율 0% 규칙: 0과 1을 8, 9로 치환하여 학생 오타 방지
          const last4 = neisCode.slice(-4).replace(/[01]/g, (m) => (m === "0" ? "8" : "9"));
          const regCode = REGION_CODES[matchedRegion]?.code || "SE";
          const generatedCode = `${regCode}${level}-${last4}`;

          // 이미 가입된 학교 예시 데이터 확인
          const existing = SCHOOL_DATABASE.find((s) => s.name === r.SCHUL_NM);

          return {
            id: r.SD_SCHUL_CODE || `sch-${Math.random()}`,
            name: r.SCHUL_NM,
            region: matchedRegion,
            address: r.ORG_RDNMA || r.ORG_RDNDA || locationName,
            level: level,
            code: existing?.code || generatedCode,
            teacherCount: existing?.teacherCount || 0,
          };
        });

        if (schools.length > 0) {
          return NextResponse.json({
            source: "NEIS_API",
            schools: schools,
          });
        }
      }
    }
  } catch (error) {
    console.warn("NEIS API call failed, falling back to local database:", error);
  }

  // 2. NEIS API 키 미설정 또는 호출 실패 시 로컬 DB Fallback
  const fallbackSchools = SCHOOL_DATABASE.filter(
    (s) =>
      s.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      s.address.toLowerCase().includes(trimmed.toLowerCase()) ||
      s.region.includes(trimmed)
  );

  return NextResponse.json({
    source: "LOCAL_FALLBACK",
    schools: fallbackSchools,
  });
}
