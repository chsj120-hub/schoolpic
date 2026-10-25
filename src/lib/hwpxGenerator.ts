import JSZip from "jszip";

export interface HwpxDraftParams {
  title: string;
  themeName: string;
  intent: string;
  targetGrade?: string;
  submissionRange?: string;
  votingRange?: string;
  teacherTips?: string;
  schoolName: string;
  submissionStartDate?: string;
  submissionStartTime?: string;
  submissionEndDate?: string;
  submissionEndTime?: string;
  votingStartDate?: string;
  votingStartTime?: string;
  votingEndDate?: string;
  votingEndTime?: string;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function parseAndFormatDate(
  dateStr?: string,
  timeStr?: string
): { fullKorean: string; short: string; rawDate: Date } {
  const fallback = new Date();
  if (!dateStr) {
    const y = fallback.getFullYear();
    const m = fallback.getMonth() + 1;
    const d = fallback.getDate();
    const day = DAY_NAMES[fallback.getDay()];
    return {
      fullKorean: `${y}년 ${m}월 ${d}일(${day})`,
      short: `${y}. ${String(m).padStart(2, "0")}. ${String(d).padStart(2, "0")}`,
      rawDate: fallback,
    };
  }

  const parts = dateStr.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (!parts) {
    return { fullKorean: dateStr, short: dateStr, rawDate: fallback };
  }

  const y = parseInt(parts[1], 10);
  const m = parseInt(parts[2], 10);
  const d = parseInt(parts[3], 10);
  const dt = new Date(y, m - 1, d);
  const day = DAY_NAMES[dt.getDay()] || "";
  const timeSuffix = timeStr ? ` ${timeStr}` : "";

  return {
    fullKorean: `${y}년 ${m}월 ${d}일(${day})${timeSuffix}`,
    short: `${y}. ${String(m).padStart(2, "0")}. ${String(d).padStart(2, "0")}`,
    rawDate: dt,
  };
}

/**
 * 사용자 제공 K-에듀파인 표준 기안문 서식 기반 자동화 텍스트 생성기
 */
export function generateDraftText(params: HwpxDraftParams): string {
  const school = params.schoolName || "우리학교";
  const title = params.title || "교내 사진전";
  const theme = params.themeName || title;
  const targetGrade = params.targetGrade || "전교생 (1~6학년)";
  const intent =
    params.intent ||
    "학교의 숨은 아름다움을 찾아 촬영하며 학교를 사랑하는 마음을 기른다.";

  const subStart = parseAndFormatDate(
    params.submissionStartDate || params.submissionRange?.split("~")[0]?.trim(),
    params.submissionStartTime
  );
  const subEnd = parseAndFormatDate(
    params.submissionEndDate || params.submissionRange?.split("~")[1]?.trim(),
    params.submissionEndTime
  );
  const voteStart = parseAndFormatDate(
    params.votingStartDate || params.votingRange?.split("~")[0]?.trim(),
    params.votingStartTime
  );
  const voteEnd = parseAndFormatDate(
    params.votingEndDate || params.votingRange?.split("~")[1]?.trim(),
    params.votingEndTime
  );

  const resultDate = new Date(voteEnd.rawDate);
  resultDate.setDate(resultDate.getDate() + 1);
  const resultShort = `${resultDate.getFullYear()}. ${String(
    resultDate.getMonth() + 1
  ).padStart(2, "0")}. ${String(resultDate.getDate()).padStart(2, "0")}`;

  const currentYear = subStart.rawDate.getFullYear() || 2026;

  return `제목: [${currentYear}학년도 ${school} ${title} 실시 계획(안)]
관련: [${currentYear}학년도 학교교육과정 운영 계획(창의적 체험활동)]

학생들의 예술적 감수성을 함양하고 학교에 대한 자긍심을 고취하고자 [${currentYear}학년도 교내 사진전]을 다음과 같이 실시하고자 합니다.

가. 행사명: [${title}]
나. 대상: [${targetGrade}]
다. 장소: [${school}] 일대
라. 방법: 스마트폰 또는 카메라로 촬영 후 [schoolpic] 어플리케이션을 활용하여 접수 및 심사 진행
마. 공모 기간: ${subStart.fullKorean} ~ ${subEnd.fullKorean}
바. 투표 기간: ${voteStart.fullKorean} ~ ${voteEnd.fullKorean}
사. 시상 계획: 붙임 참조
아. 소요 예산: [총 150,000원] (재원: [학교운영비 / 교육과정운영비])

붙임  [${currentYear}학년도 교내 사진전 실시 계획(안)] 1부.  끝.


[붙임] ${currentYear}학년도 교내 사진전 실시 계획(안)

1. 목적
가. ${intent}
나. 디지털 도구(schoolpic 어플)를 활용한 참여형 행사를 통해 정보 활용 능력 및 미적 감수성을 표현한다.
다. 일상 속 긍정적 시각 표현을 통해 급우 간 유대감 및 건전한 학교 디지털 문화를 형성한다.

2. 방침
가. 지정된 대상 학년 전원이 자유롭게 참여할 수 있도록 유도한다.
나. 공정성을 위해 전교생 및 교직원이 참여하는 온라인 투표(schoolpic)를 반영한다.
다. 수상작은 추후 교내 갤러리 및 학교 홈페이지에 전시한다.
라. 3단계 안심 승인(학생 자발적 동의 -> 학부모 모바일 동의 -> 교사 최종 검수)을 통해 학생 개인정보 및 초상권을 철저히 보호한다.

3. 세부 추진 계획
가. 대상: [${targetGrade}]
나. 장소: [${school}] 일대 (교실, 운동장, 특별실 등 안전이 확보된 구역)
다. 주제: [${theme}] - ${intent}
라. 일정 요약:
  - 작품 공모: ${subStart.short} ~ ${subEnd.short}
  - 온라인 투표: ${voteStart.short} ~ ${voteEnd.short}
  - 결과 발표 및 시상: ${resultShort}

4. 참여 및 심사 방법 (schoolpic 어플 활용)
가. 접수: 학생이 [${school}] 일대에서 촬영한 사진을 스마트 기기를 통해 'schoolpic' 어플 내 지정된 공모전 탭에 업로드 (1인당 1작품 제한)
나. 투표 및 심사:
  1) 'schoolpic' 어플 내에 개설된 온라인 투표 페이지를 활용하여 학생 및 교직원 1인당 2~3작품씩 투표 추진
  2) 투표 결과(70%)와 외부/교내 심사위원 점수(30%)를 합산하여 최종 선정

5. 시상 계획
※ 시상 인원은 참가 인원 및 작품 수준에 따라 일부 조정될 수 있음.
┌────────────────┬──────────┬────────────────────────┬─────────────────────┐
│      훈격      │ 시상 인원│          부상          │        비고         │
├────────────────┼──────────┼────────────────────────┼─────────────────────┤
│ 최우수상(금상) │   1명    │ 문화상품권 [20,000원]  │ 학년별 최고 득점자  │
│ 우수상(silver) │   2명    │ 문화상품권 [10,000원]  │ 고득점자 순         │
│ 장려상(bronze) │   5명    │ 문화상품권 [5,000원]   │ 고득점자 순         │
│ 참가상         │   전원   │ 소정의 기념품([볼펜 등])│ 탈락자 전원 지급    │
└────────────────┴──────────┴────────────────────────┴─────────────────────┘

6. 소요 예산 (산출 내역 예시)
※ 총 소요 예산: [150,000원]
┌──────────────────────┬─────────────────────────────┬───────────┬─────────────┐
│         항목         │          산출 내역          │   금액    │    비고     │
├──────────────────────┼─────────────────────────────┼───────────┼─────────────┤
│ 상품권(최우수)       │ 20,000원 × 1명              │  20,000원 │ 문화상품권   │
│ 상품권(우수/장려)    │ 10,000원×2명 / 5,000원×5명│  45,000원 │ 문화상품권   │
│ 참가 기념품          │ 1,000원 × 50명              │  50,000원 │ 참가학생 전원│
│ 우수작 인화 및 액자  │ 7,000원 × 5명               │  35,000원 │ 교내 전시용 │
├──────────────────────┴─────────────────────────────┼───────────┼─────────────┤
│ 합 계                                              │ 150,000원 │             │
└───────────────────────────────────────────────────┴───────────┴─────────────┘

7. 기대 효과
가. 스마트 기기를 활용한 예술 활동을 통해 디지털 리터러시와 심미적 역량을 동시에 강화한다.
나. 학생들이 주도적으로 참여하는 투표 과정을 통해 민주적 의사결정을 경험한다.
다. 나이스 학교생활기록부 창의적 체험활동(자율/동아리/진로) 특기사항과 연계하여 학생 성장 기록을 내실화한다.
`;
}

/**
 * KS X 6101 기반 OWPML 표준 한글 HWPX 바이너리 생성기
 */
export async function generateHwpxDraft(params: HwpxDraftParams): Promise<Blob> {
  const school = params.schoolName || "우리학교";
  const title = params.title || "교내 사진전";
  const theme = params.themeName || title;
  const targetGrade = params.targetGrade || "전교생 (1~6학년)";
  const intent =
    params.intent ||
    "학교의 숨은 아름다움을 찾아 촬영하며 학교를 사랑하는 마음을 기른다.";

  const subStart = parseAndFormatDate(
    params.submissionStartDate || params.submissionRange?.split("~")[0]?.trim(),
    params.submissionStartTime
  );
  const subEnd = parseAndFormatDate(
    params.submissionEndDate || params.submissionRange?.split("~")[1]?.trim(),
    params.submissionEndTime
  );
  const voteStart = parseAndFormatDate(
    params.votingStartDate || params.votingRange?.split("~")[0]?.trim(),
    params.votingStartTime
  );
  const voteEnd = parseAndFormatDate(
    params.votingEndDate || params.votingRange?.split("~")[1]?.trim(),
    params.votingEndTime
  );

  const resultDate = new Date(voteEnd.rawDate);
  resultDate.setDate(resultDate.getDate() + 1);
  const resultShort = `${resultDate.getFullYear()}. ${String(
    resultDate.getMonth() + 1
  ).padStart(2, "0")}. ${String(resultDate.getDate()).padStart(2, "0")}`;

  const currentYear = subStart.rawDate.getFullYear() || 2026;

  const zip = new JSZip();

  // 1. mimetype (압축하지 않는 STORE 모드로 첫 번째 엔트리에 기록)
  zip.file("mimetype", "application/hwp+zip", { compression: "STORE" });

  // 2. META-INF/container.xml (표준 OCF 구조, full-path 속성)
  const containerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container">
  <ocf:rootfiles>
    <ocf:rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/>
  </ocf:rootfiles>
</ocf:container>`;
  zip.file("META-INF/container.xml", containerXml);

  // 3. version.xml
  const versionXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:version xmlns:hh="http://www.hancom.co.kr/hwpml/2011/version" major="1" minor="0" micro="0" buildNumber="0"/>`;
  zip.file("version.xml", versionXml);

  // 4. Contents/content.hpf
  const contentHpf = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<opf:package xmlns:opf="http://www.idpf.org/2007/opf/" version="1.0">
  <opf:metadata>
    <opf:title>${escapeXml(school)} ${escapeXml(title)} 실시 계획(안)</opf:title>
    <opf:language>ko</opf:language>
  </opf:metadata>
  <opf:manifest>
    <opf:item id="header" href="header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="section0.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="section0"/>
  </opf:spine>
</opf:package>`;
  zip.file("Contents/content.hpf", contentHpf);

  // 5. Contents/header.xml (한컴오피스 필수 헤더: 맑은 고딕, 서식 정의)
  const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:head xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" version="1.1" secCnt="1">
  <hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>
  <hh:fontfaces itemCnt="1">
    <hh:fontface lang="hangul" fontCnt="1">
      <hh:font id="0" face="맑은 고딕" type="ttf"/>
    </hh:fontface>
  </hh:fontfaces>
  <hh:charProperties itemCnt="3">
    <hh:charPr id="0" height="1000" fontRef="0" spacing="0" ratio="100" relSize="100" bold="false" italic="false">
      <hh:textColor color="#000000"/>
    </hh:charPr>
    <hh:charPr id="1" height="1500" fontRef="0" spacing="0" ratio="100" relSize="100" bold="true" italic="false">
      <hh:textColor color="#0F172A"/>
    </hh:charPr>
    <hh:charPr id="2" height="1100" fontRef="0" spacing="0" ratio="100" relSize="100" bold="true" italic="false">
      <hh:textColor color="#1E293B"/>
    </hh:charPr>
  </hh:charProperties>
  <hh:paraProperties itemCnt="2">
    <hh:paraPr id="0" align="left" lineSpacing="160" lineSpacingType="percent"/>
    <hh:paraPr id="1" align="center" lineSpacing="160" lineSpacingType="percent"/>
  </hh:paraProperties>
  <hh:styles itemCnt="1">
    <hh:style id="0" type="para" name="Normal" engName="Normal" paraPrIDRef="0" charPrIDRef="0"/>
  </hh:styles>
</hh:head>`;
  zip.file("Contents/header.xml", headerXml);

  // 6. Contents/section0.xml (본문 XML + A4 용지 규격 secPr)
  const paragraphs = [
    { text: `[${currentYear}학년도 ${school} ${title} 실시 계획(안)]`, charPr: 1, paraPr: 1 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: `관련: [${currentYear}학년도 학교교육과정 운영 계획(창의적 체험활동)]`, charPr: 0, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    {
      text: `학생들의 예술적 감수성을 함양하고 학교에 대한 자긍심을 고취하고자 [${currentYear}학년도 ${title}]을 다음과 같이 실시하고자 합니다.`,
      charPr: 0,
      paraPr: 0,
    },
    { text: "", charPr: 0, paraPr: 0 },
    { text: `가. 행사명: [${title}]`, charPr: 0, paraPr: 0 },
    { text: `나. 대상: [${targetGrade}]`, charPr: 0, paraPr: 0 },
    { text: `다. 장소: [${school}] 일대`, charPr: 0, paraPr: 0 },
    {
      text: `라. 방법: 스마트폰 또는 카메라로 촬영 후 [schoolpic] 어플리케이션을 활용하여 접수 및 심사 진행`,
      charPr: 0,
      paraPr: 0,
    },
    { text: `마. 공모 기간: ${subStart.fullKorean} ~ ${subEnd.fullKorean}`, charPr: 0, paraPr: 0 },
    { text: `바. 투표 기간: ${voteStart.fullKorean} ~ ${voteEnd.fullKorean}`, charPr: 0, paraPr: 0 },
    { text: `사. 시상 계획: 붙임 참조`, charPr: 0, paraPr: 0 },
    { text: `아. 소요 예산: [총 150,000원] (재원: [학교운영비 / 교육과정운영비])`, charPr: 0, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: `붙임  [${currentYear}학년도 교내 사진전 실시 계획(안)] 1부.  끝.`, charPr: 2, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: "------------------------------------------------------------", charPr: 0, paraPr: 1 },
    { text: `[붙임] ${currentYear}학년도 교내 사진전 실시 계획(안)`, charPr: 1, paraPr: 1 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: "1. 목적", charPr: 2, paraPr: 0 },
    { text: `  가. ${intent}`, charPr: 0, paraPr: 0 },
    { text: "  나. 디지털 도구(schoolpic 어플)를 활용한 참여형 행사를 통해 정보 활용 능력 및 미적 감수성을 표현한다.", charPr: 0, paraPr: 0 },
    { text: "  다. 일상 속 긍정적 시각 표현을 통해 급우 간 유대감 및 건전한 학교 디지털 문화를 형성한다.", charPr: 0, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: "2. 방침", charPr: 2, paraPr: 0 },
    { text: "  가. 지정된 대상 학년 전원이 자유롭게 참여할 수 있도록 유도한다.", charPr: 0, paraPr: 0 },
    { text: "  나. 공정성을 위해 전교생 및 교직원이 참여하는 온라인 투표(schoolpic)를 반영한다.", charPr: 0, paraPr: 0 },
    { text: "  다. 수상작은 추후 교내 갤러리 및 학교 홈페이지에 전시한다.", charPr: 0, paraPr: 0 },
    { text: "  라. 3단계 안심 승인(학생 자발적 동의 -> 학부모 모바일 동의 -> 교사 최종 검수)을 통해 개인정보 및 초상권을 보호한다.", charPr: 0, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: "3. 세부 추진 계획", charPr: 2, paraPr: 0 },
    { text: `  가. 대상: [${targetGrade}]`, charPr: 0, paraPr: 0 },
    { text: `  나. 장소: [${school}] 일대 (교실, 운동장, 특별실 등 안전이 확보된 구역)`, charPr: 0, paraPr: 0 },
    { text: `  다. 주제: [${theme}] - ${intent}`, charPr: 0, paraPr: 0 },
    { text: `  라. 일정 요약:`, charPr: 0, paraPr: 0 },
    { text: `    1) 작품 공모: ${subStart.short} ~ ${subEnd.short}`, charPr: 0, paraPr: 0 },
    { text: `    2) 온라인 투표: ${voteStart.short} ~ ${voteEnd.short}`, charPr: 0, paraPr: 0 },
    { text: `    3) 결과 발표 및 시상: ${resultShort}`, charPr: 0, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: "4. 참여 및 심사 방법 (schoolpic 어플 활용)", charPr: 2, paraPr: 0 },
    { text: `  가. 접수: 학생이 [${school}] 일대에서 촬영한 사진을 스마트 기기를 통해 'schoolpic' 어플 내 지정된 공모전 탭에 업로드 (1인당 1작품 제한)`, charPr: 0, paraPr: 0 },
    { text: "  나. 투표 및 심사: 'schoolpic' 어플 내에 개설된 온라인 투표 페이지를 활용하여 학생 및 교직원 1인당 2~3작품씩 투표 추진 (투표 70% + 심사위원 30%)", charPr: 0, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: "5. 시상 계획", charPr: 2, paraPr: 0 },
    { text: "  - 최우수상(금상, 1명): 문화상품권 [20,000원] (학년별 최고 득점자)", charPr: 0, paraPr: 0 },
    { text: "  - 우수상(silver, 2명): 문화상품권 [10,000원] (고득점자 순)", charPr: 0, paraPr: 0 },
    { text: "  - 장려상(bronze, 5명): 문화상품권 [5,000원] (고득점자 순)", charPr: 0, paraPr: 0 },
    { text: "  - 참가상(전원): 소정의 기념품([볼펜 등]) (탈락자 전원 지급)", charPr: 0, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: "6. 소요 예산 (산출 내역 예시: 총 150,000원)", charPr: 2, paraPr: 0 },
    { text: "  - 상품권(최우수): 20,000원 × 1명 = 20,000원", charPr: 0, paraPr: 0 },
    { text: "  - 상품권(우수/장려): 10,000원 × 2명 + 5,000원 × 5명 = 45,000원", charPr: 0, paraPr: 0 },
    { text: "  - 참가 기념품: 1,000원 × 50명 = 50,000원", charPr: 0, paraPr: 0 },
    { text: "  - 우수작 인화 및 액자: 7,000원 × 5명 = 35,000원", charPr: 0, paraPr: 0 },
    { text: "  - 합계: 150,000원 (재원: 교육과정운영비 / 학교운영비)", charPr: 2, paraPr: 0 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: "7. 기대 효과", charPr: 2, paraPr: 0 },
    { text: "  가. 스마트 기기를 활용한 예술 활동을 통해 디지털 리터러시와 심미적 역량을 동시에 강화한다.", charPr: 0, paraPr: 0 },
    { text: "  나. 학생들이 주도적으로 참여하는 투표 과정을 통해 민주적 의사결정을 경험한다.", charPr: 0, paraPr: 0 },
    { text: "  다. 나이스 학교생활기록부 창의적 체험활동(자율/동아리/진로) 특기사항과 연계하여 학생 성장 기록을 내실화한다.", charPr: 0, paraPr: 0 },
  ];

  let pXml = "";
  paragraphs.forEach((p, idx) => {
    const secPrXml =
      idx === 0
        ? `<hp:secPr id="0"><hp:pagePr width="59528" height="84186" landscape="0" gutterType="LEFT"><hp:margin left="4252" right="4252" top="5669" bottom="4252" header="4252" footer="4252" gutter="0"/></hp:pagePr></hp:secPr>`
        : "";

    pXml += `<hp:p id="${idx}" paraPrIDRef="${p.paraPr}" styleIDRef="0">${secPrXml}<hp:run charPrIDRef="${p.charPr}"><hp:t>${escapeXml(p.text)}</hp:t></hp:run></hp:p>`;
  });

  const section0Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hs:sec xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph">
  ${pXml}
</hs:sec>`;
  zip.file("Contents/section0.xml", section0Xml);

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/hwp+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
