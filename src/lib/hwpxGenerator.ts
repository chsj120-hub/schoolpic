export interface HwpxDraftParams {
  title: string;
  themeName: string;
  intent: string;
  targetGrade?: string;
  submissionRange?: string;
  votingRange?: string;
  teacherTips?: string;
  schoolName: string;
  schoolCode?: string;
  challengeId?: string;
  submissionStartDate?: string;
  submissionStartTime?: string;
  submissionEndDate?: string;
  submissionEndTime?: string;
  votingStartDate?: string;
  votingStartTime?: string;
  votingEndDate?: string;
  votingEndTime?: string;
  enableParentVote?: boolean;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export function parseAndFormatDate(
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
 * [1] 공문 결재용 기안문 (K-에듀파인 기안기 본문 창에 바로 붙여넣는 서식)
 */
export function generateMainDraftText(params: HwpxDraftParams): string {
  const school = params.schoolName || "우리학교";
  const title = params.title || "교내 사진전";
  const targetGrade = params.targetGrade || "전교생 (1~6학년)";

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

  const currentYear = subStart.rawDate.getFullYear() || 2026;

  return `제목: [${currentYear}학년도 ${school} ${title} 실시 계획(안)]
관련: [${currentYear}학년도 학교교육과정 운영 계획(창의적 체험활동)]

학생들의 예술적 감수성을 함양하고 학교에 대한 자긍심을 고취하고자 [${currentYear}학년도 교내 사진전]을 다음과 같이 실시하고자 합니다.

가. 행사명: [${title}]
나. 대상: [${targetGrade}]
다. 장소: [${school}] 일대
라. 방법: 스마트폰 또는 카메라로 촬영 후 스쿨픽(schoolpic) 어플리케이션(https://schoolpic.vercel.app/)을 활용하여 접수 및 심사 진행
마. 공모 기간: ${subStart.fullKorean} ~ ${subEnd.fullKorean}
바. 투표 기간: ${voteStart.fullKorean} ~ ${voteEnd.fullKorean}
사. 시상 계획: 붙임 참조 (※ 예시 참고 후 학교별 자율 조정)
아. 소요 예산: [총 000,000원] (재원: [학교운영비 / 교육과정운영비]) ※ 학교별 사정에 맞춰 직접 입력

붙임  [${currentYear}학년도 교내 사진전 실시 계획(안)] 1부.  끝.`;
}

/**
 * [2] [붙임] 세부 실시 계획(안) (한글 파일 본문에 붙여넣을 세부 계획 문서 + 학생용 QR/링크 안내문 포함)
 */
export function generateAttachmentDraftText(params: HwpxDraftParams): string {
  const school = params.schoolName || "우리학교";
  const title = params.title || "교내 사진전";
  const theme = params.themeName || title;
  const targetGrade = params.targetGrade || "전교생 (1~6학년)";
  const intent =
    params.intent ||
    "학교의 숨은 아름다움을 찾아 촬영하며 학교를 사랑하는 마음을 기른다.";
  const schoolCode = params.schoolCode || "JNE-3012";

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

  return `[붙임] ${currentYear}학년도 교내 사진전 실시 계획(안)

1. 목적
가. ${intent}
나. 디지털 도구(schoolpic 어플, https://schoolpic.vercel.app/)를 활용한 참여형 행사를 통해 정보 활용 능력 및 미적 감수성을 표현한다.
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
가. 접수: 학생이 [${school}] 일대에서 촬영한 사진을 스마트 기기를 통해 'schoolpic' 어플(https://schoolpic.vercel.app/) 내 지정된 공모전 탭에 업로드 (1인당 1작품 제한)
  * 학생 접속 링크: https://schoolpic.vercel.app/
  * 우리 학교 코드: [${schoolCode}]
  * 학생 출품용 QR코드가 본 문서 하단 및 각 학급 게시판에 함께 동봉 배부됨.
나. 투표 및 심사:
  1) 'schoolpic' 어플(https://schoolpic.vercel.app/) 내에 개설된 온라인 투표 페이지를 활용하여 학생 및 교직원 1인당 2~3작품씩 투표 추진
  2) 투표 결과(70%)와 외부/교내 심사위원 점수(30%)를 합산하여 최종 선정

5. 시상 계획 (예시안)
※ 시상 인원, 부상 내용 및 금액은 학교별 운영 계획과 참가 인원에 따라 변경 가능한 예시(안)입니다.
┌────────────────┬──────────┬─────────────────────────────┬─────────────────────┐
│      훈격      │ 시상 인원│          부상 (예시)        │        비고         │
├────────────────┼──────────┼─────────────────────────────┼─────────────────────┤
│ 최우수상(금상) │   1명    │ [예시: 문화상품권 20,000원] │ 학년별 최고 득점자  │
│ 우수상(silver) │  [0]명   │ [예시: 문화상품권 10,000원] │ 고득점자 순         │
│ 장려상(bronze) │  [0]명   │ [예시: 문화상품권 5,000원]  │ 고득점자 순         │
│ 참가상         │   전원   │ [예시: 소정의 기념 볼펜 등] │ 탈락자 전원 지급    │
└────────────────┴──────────┴─────────────────────────────┴─────────────────────┘

6. 소요 예산 (산출 내역 예시)
※ 총 소요 예산: [총 000,000원] (재원: [학교운영비 / 교육과정운영비])
※ 학교별 예산 사정 및 품목에 맞추어 항목 및 금액을 직접 기입하여 활용하시기 바랍니다.
┌──────────────────────┬─────────────────────────────┬───────────┬─────────────┐
│         항목         │          산출 내역          │   금액    │    비고     │
├──────────────────────┼─────────────────────────────┼───────────┼─────────────┤
│ 상품권(최우수)       │ [예시: 20,000원 × 1명]     │ [00,000원]│ [문화상품권 등]
│ 상품권(우수/장려)    │ [예시: 10,000원×0명/5,000원×0명] │ [00,000원]│ [문화상품권 등]
│ 참가 기념품          │ [예시: 1,000원 × 00명]     │ [00,000원]│ [참가학생 전원]
│ 우수작 인화 및 액자  │ [예시: 5,000원 × 0명]      │ [00,000원]│ [교내 전시용]
├──────────────────────┴─────────────────────────────┼───────────┼─────────────┤
│ 합 계                                              │[총 000,000원]│[직접 산출 입력]
└───────────────────────────────────────────────────┴───────────┴─────────────┘

7. 기대 효과
가. 스마트 기기를 활용한 예술 활동을 통해 디지털 리터러시와 심미적 역량을 동시에 강화한다.
나. 학생들이 주도적으로 참여하는 투표 과정을 통해 민주적 의사결정을 경험한다.
다. 나이스 학교생활기록부 창의적 체험활동(자율/동아리/진로) 특기사항과 연계하여 학생 성장 기록을 내실화한다.

8. 학생용 접수 안내문 및 QR 코드 첨부
- 스쿨픽 모바일 웹: https://schoolpic.vercel.app/
- 우리 학교 고유 코드: ${schoolCode}
- 안내 사항: 스마트폰 기본 카메라로 본 문서에 동봉된 QR코드를 스캔하면 학생 출품 및 감상 페이지로 즉시 연결됩니다.`;
}

/**
 * [3] 학부모용 가정통신문 (학부모 모바일 투표 참여 및 안심 동의 안내장)
 */
export function generateParentLetterText(params: HwpxDraftParams): string {
  const school = params.schoolName || "우리학교";
  const title = params.title || "교내 사진전";
  const theme = params.themeName || title;
  const intent =
    params.intent ||
    "학생들의 예술적 감수성과 창의적 미디어 표현 역량을 기르고, 학교생활의 소중한 순간을 함께 나누고자 합니다.";
  const schoolCode = params.schoolCode || "JNE-3012";

  const voteStart = parseAndFormatDate(
    params.votingStartDate || params.votingRange?.split("~")[0]?.trim(),
    params.votingStartTime
  );
  const voteEnd = parseAndFormatDate(
    params.votingEndDate || params.votingRange?.split("~")[1]?.trim(),
    params.votingEndTime
  );

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  return `[가정통신문]

${currentYear}학년도 ${school} 제 ${currentYear}-00호

우리 아이들의 시선으로 담아낸 [교내 사진전]
학부모 모바일 투표 참여 및 안심 초상권 안내

학부모님, 안녕하십니까?
아름다운 계절을 맞이하여 우리 학교에서는 학생들의 심미적 감수성과 창의적 미디어 표현 역량을 기르고, 학교생활의 소중한 순간을 함께 나누고자 [${title}]을 개최합니다.

특별히 이번 사진전은 학부모님께서도 자녀들의 작품을 감상하시고 따뜻한 응원의 한 표(공감 하트)를 보내주실 수 있도록 모바일 학부모 투표관을 운영합니다. 바쁘시더라도 우리 아이들이 자신감을 얻고 예술적 성취감을 느낄 수 있도록 많은 격려와 참여를 부탁드립니다.

1. 행사 개요
가. 행사명: ${school} [${title}]
나. 주제: [${theme}] - ${intent}
다. 참여 대상: ${school} 학부모 전원

2. 학부모 투표 기간 및 방법
가. 투표 기간: ${voteStart.fullKorean} ~ ${voteEnd.fullKorean}
나. 참여 방법:
  1) 스마트폰 카메라로 아래 QR코드를 스캔하거나 인터넷 주소창에 접속합니다.
     ▶ 학부모 투표관 주소: https://schoolpic.vercel.app/parents
  2) 우리 학교 코드 [${schoolCode}]를 입력합니다.
  3) 출품된 우리 아이들의 사진을 감상하신 후, 응원하고 싶은 작품에 [공감 하트(❤️)]를 눌러주세요! (기간 내 3표 참여 가능)

3. 학생 개인정보 및 초상권 3중 안심 보호 안내
- 본 행사는 학생들의 실명(이름)을 외부에 공개하지 않으며, [학년-반-번호 및 작가 닉네임]으로만 운영됩니다.
- 학생 본인 동의 및 학부모 동의가 완료된 작품에 한하여 전시되며, 행사 종료 7일 후 서버 개인정보는 안전하게 자동 파기됩니다.

${currentYear}년 ${currentMonth}월 ${currentDay}일

${school}장 (직인생략)`;
}

// 하위 호환성용
export const generateDraftText = generateAttachmentDraftText;
