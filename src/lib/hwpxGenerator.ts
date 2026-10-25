import JSZip from "jszip";

export interface HwpxDraftParams {
  title: string;
  themeName: string;
  intent: string;
  targetGrade: string;
  submissionRange: string;
  votingRange: string;
  teacherTips: string;
  schoolName: string;
}

/**
 * K-에듀파인 기안문 표준 텍스트 생성기 (에듀파인 본문 복사 & 붙여넣기용)
 */
export function generateDraftText({
  title,
  themeName,
  intent,
  targetGrade,
  submissionRange,
  votingRange,
  teacherTips,
  schoolName,
}: HwpxDraftParams): string {
  return `[${schoolName} 내부결재 기안문(안)]

1. 사업명: ${schoolName} [${themeName}] 디지털 사진전 운영 계획(안)

2. 추진 배경 및 기획 의도:
   가. ${intent}
   나. 전교생 및 학급 구성원이 함께 참여하여 건전한 학교 디지털 문화 및 공동체 인성 함양

3. 운영 개요:
   가. 행사명: ${title}
   나. 대상: ${targetGrade}
   다. 주최/주관: ${schoolName}

4. 세부 추진 일정:
   가. 사진 접수 기간: ${submissionRange}
   나. 전교 투표 기간: ${votingRange}
   다. 결과 발표 및 시상: 투표 종료 익일 대시보드 공지

5. 학교생활기록부(나이스) 연계 방안:
   - ${teacherTips || "창의적 체험활동(자율/동아리) 및 진로 특기사항 연계 기록 권장"}

6. 개인정보 및 학생 초상권 3중 안심 보호 대책:
   가. 학생 실명 및 민감 개인정보 수집 원천 배제 (학년, 반, 번호, 작가 닉네임만 사용)
   나. 3단계 안심 승인 체계 준수 (1단계 학생 자발적 동의 -> 2단계 학부모 모바일 동의 -> 3단계 교사 최종 검수)
   다. 외부 교류관 공유는 3단계 동의가 완료된 사진 중 교사 승인작에 한하여 엄격 제한
   라. 행사 종료 후 개인정보 지침에 따라 서버 데이터 안전 파기 (행사 종료 7일 후)

7. 소요 예산: 0원 (자체 디지털 플랫폼 '스쿨픽' 활용 무상 운영)

8. 행정 사항 및 기대 효과:
   가. 종이 사진 인화 및 판넬 제작 예산 절감
   나. 학생들의 주도적 미디어 리터러시 역량 및 디지털 시민성 제고
`;
}

/**
 * KS X 6101 기반 OWPML 표준 한글 HWPX 파일 바이너리 생성기
 * 한컴오피스 2014/2018/2020/2022/2024 및 웹 한글에서 손상 없이 정식 열람 지원
 */
export async function generateHwpxDraft(params: HwpxDraftParams): Promise<Blob> {
  const {
    title,
    themeName,
    intent,
    targetGrade,
    submissionRange,
    votingRange,
    teacherTips,
    schoolName,
  } = params;

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

  // 4. Contents/content.hpf (OPF 패키지 메타데이터 및 manifest)
  const contentHpf = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<opf:package xmlns:opf="http://www.idpf.org/2007/opf/" version="1.0">
  <opf:metadata>
    <opf:title>${escapeXml(schoolName)} ${escapeXml(title)} 운영 계획(안)</opf:title>
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

  // 5. Contents/header.xml (한컴오피스 필수 헤더: 폰트, 문자 속성, 문단 속성, 스타일)
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
    { text: `[${schoolName} 디지털 사진전 운영 계획(안)]`, charPr: 1, paraPr: 1 },
    { text: "", charPr: 0, paraPr: 0 },
    { text: `1. 사업명: ${schoolName} [${themeName}] 디지털 사진전`, charPr: 2, paraPr: 0 },
    { text: `2. 추진 배경 및 기획 의도: ${intent}`, charPr: 0, paraPr: 0 },
    { text: `3. 운영 대상: ${targetGrade}`, charPr: 0, paraPr: 0 },
    { text: "4. 세부 추진 일정:", charPr: 2, paraPr: 0 },
    { text: `   가. 사진 접수 기간: ${submissionRange}`, charPr: 0, paraPr: 0 },
    { text: `   나. 전교 투표 기간: ${votingRange}`, charPr: 0, paraPr: 0 },
    { text: `5. 학교생활기록부(나이스) 연계 방안: ${teacherTips || "창체/동아리활동 연계"}`, charPr: 0, paraPr: 0 },
    { text: "6. 개인정보 및 학생 초상권 보호 방안 (3중 안심 잠금):", charPr: 2, paraPr: 0 },
    { text: "   가. 학생 실명 수집 원천 배제 (학년, 반, 번호, 작가 닉네임만 활용)", charPr: 0, paraPr: 0 },
    { text: "   나. 3단계 안심 승인(학생 자율 동의 -> 학부모 모바일 동의 -> 교사 최종 검수) 체계 적용", charPr: 0, paraPr: 0 },
    { text: "   다. 행사 종료 7일 후 서버 개인정보 데이터 안전 자동 파기", charPr: 0, paraPr: 0 },
    { text: "7. 소요 예산: 0원 (자체 디지털 플랫폼 스쿨픽 무상 활용)", charPr: 2, paraPr: 0 },
    { text: "8. 기대 효과: 종이 사진 인화 예산 절감 및 학생 주도적 디지털 미디어 창작 역량 증진", charPr: 0, paraPr: 0 },
  ];

  let pXml = "";
  paragraphs.forEach((p, idx) => {
    // 첫 문단에 A4 용지 속성(secPr) 삽입
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
