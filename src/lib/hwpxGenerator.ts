import JSZip from "jszip";

interface HwpxDraftParams {
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
 * KS X 6101 기반 표준 한글 HWPX 파일 바이너리 생성기
 */
export async function generateHwpxDraft({
  title,
  themeName,
  intent,
  targetGrade,
  submissionRange,
  votingRange,
  teacherTips,
  schoolName,
}: HwpxDraftParams): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype (압축하지 않는 첫 번째 파일)
  zip.file("mimetype", "application/hwp+zip", { compression: "STORE" });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container">
  <ocf:rootfiles>
    <ocf:rootfile ocf:full-path="Contents/content.hpf" ocf:media-type="application/hwp+zip"/>
  </ocf:rootfiles>
</ocf:container>`;
  zip.file("META-INF/container.xml", containerXml);

  // 3. version.xml
  const versionXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:version xmlns:hh="http://www.hancom.co.kr/hwpml/2011/version" major="1" minor="0" micro="0" buildNumber="0"/>`;
  zip.file("version.xml", versionXml);

  // 4. Contents/content.hpf
  const contentHpf = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<opf:package xmlns:opf="http://www.idpf.org/2007/opf" version="1.0" unique-identifier="uid">
  <opf:metadata>
    <opf:title>${title} 운영 계획(안)</opf:title>
    <opf:language>ko</opf:language>
  </opf:metadata>
  <opf:manifest>
    <opf:item id="section0" href="section0.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="section0"/>
  </opf:spine>
</opf:package>`;
  zip.file("Contents/content.hpf", contentHpf);

  // 5. Contents/section0.xml (본문 XML)
  const section0Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hs:sec xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph">
  <hp:p><hp:run><hp:t>[스쿨픽 디지털 사진전 내부결재 기안문]</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t></hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>1. 사업명: ${schoolName} ${themeName} 운영 계획(안)</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>2. 추진 배경 및 기획 의도: ${intent}</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>3. 운영 대상: ${targetGrade}</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>4. 세부 일정:</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>   - 사진 접수 기간: ${submissionRange}</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>   - 전교 투표 기간: ${votingRange}</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>5. 학교생활기록부(나이스) 연계 방안: ${teacherTips}</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>6. 개인정보 및 초상권 보호 방안:</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>   - 학생 실명 수집 원천 배제 (학년, 반, 번호, 작가 닉네임만 활용)</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>   - 3단계 안심 승인(학생 자발적 동의, 학부모 동의, 교사 최종 검수) 체계 적용</hp:t></hp:run></hp:p>
  <hp:p><hp:run><hp:t>   - 행사 종료 후 데이터 안전 자동 파기</hp:t></hp:run></hp:p>
</hs:sec>`;
  zip.file("Contents/section0.xml", section0Xml);

  return await zip.generateAsync({ type: "blob", mimeType: "application/hwp+zip" });
}
