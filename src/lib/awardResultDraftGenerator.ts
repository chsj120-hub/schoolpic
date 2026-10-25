import { Challenge, PhotoSubmission } from "@/types";

export interface AwardDraftParams {
  challenge: Challenge;
  submissions: PhotoSubmission[];
  schoolName: string;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function parseDate(dateStr?: string): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
  formattedKorean: string;
  dotFormatted: string;
} {
  const fallback = new Date();
  if (!dateStr) {
    const y = fallback.getFullYear();
    const m = fallback.getMonth() + 1;
    const d = fallback.getDate();
    const dow = DAY_NAMES[fallback.getDay()];
    return {
      year: y,
      month: m,
      day: d,
      dayOfWeek: dow,
      formattedKorean: `${y}년 ${m}월 ${d}일(${dow})`,
      dotFormatted: `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}.`,
    };
  }

  const parts = dateStr.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (!parts) {
    return {
      year: fallback.getFullYear(),
      month: fallback.getMonth() + 1,
      day: fallback.getDate(),
      dayOfWeek: "월",
      formattedKorean: dateStr,
      dotFormatted: dateStr,
    };
  }

  const y = parseInt(parts[1], 10);
  const m = parseInt(parts[2], 10);
  const d = parseInt(parts[3], 10);
  const dt = new Date(y, m - 1, d);
  const dow = DAY_NAMES[dt.getDay()] || "월";

  return {
    year: y,
    month: m,
    day: d,
    dayOfWeek: dow,
    formattedKorean: `${y}년 ${m}월 ${d}일(${dow})`,
    dotFormatted: `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}.`,
  };
}

/**
 * [1] 시상 결과 기안문 본문 (K-에듀파인 기안기 본문 창에 복사할 텍스트)
 */
export function generateAwardMainDraftText(params: AwardDraftParams): string {
  const { challenge, submissions } = params;
  const currentYear = new Date().getFullYear();

  // 시작일(실시계획 기안일 근사) 및 투표종료일 파싱
  const planDate = parseDate(challenge.submissionStartDate);
  const endDate = parseDate(challenge.votingEndDate);

  // 시상 일시 계산 (투표 종료일 다음날 09:00 또는 오늘 기준)
  const ceremonyDate = new Date(endDate.year, endDate.month - 1, endDate.day + 1);
  const cYear = ceremonyDate.getFullYear();
  const cMonth = ceremonyDate.getMonth() + 1;
  const cDay = ceremonyDate.getDate();
  const cDow = DAY_NAMES[ceremonyDate.getDay()];

  // 참여 현황 계산
  const participantCount = submissions.length > 0 ? submissions.length : 0;
  const participantText =
    participantCount > 0
      ? `[${challenge.targetGrade || "전교생"}] 총 [${participantCount}]명 참여 (총 [${participantCount}]개 작품 접수)`
      : `[${challenge.targetGrade || "전교생"}] 총 [00]명 참여 (총 [00]개 작품 접수)`;

  // 시상 인원수
  const awardWinnerCount = submissions.length >= 6 ? "5" : "[00]";

  return `[${currentYear}학년도 교내 사진전 결과 발표 및 시상 계획(안)]

1. 관련: [창의체험부-0000(${planDate.dotFormatted}) '${currentYear}학년도 교내 사진전 실시 계획(안)']
2. 위 호와 관련하여 [schoolpic] 어플리케이션을 활용한 온라인 투표 및 심사를 거쳐 [${currentYear}학년도 교내 사진전] 수상자를 선정하였기에 그 결과를 발표하고 다음과 같이 시상을 진행하고자 합니다.

가. 행사명: [${challenge.title || "우리 학교의 추억을 담다, 교내 사진전"}]
나. 참여 현황: ${participantText}
다. 심사 방법: [schoolpic] 앱 내 온라인 투표(70%) + 심사위원 평가(30%)
라. 시상 내용: 최우수상 외 ${awardWinnerCount}명 (상장 및 부상 수여)
마. 시상 일시 및 장소: ${cYear}년 ${cMonth}월 ${cDay}일(${cDow}) [09:00], [각 반 교실 또는 방송실]
바. 소요 예산: 총 [000,000원] (재원: [학교운영비 / 교육과정운영비])

붙임  1. ${currentYear}학년도 교내 사진전 수상자 명단 1부.
      2. 부상 구입 지출결의 내역 1부.  끝.`;
}

/**
 * [붙임 1] 수상자 명단 텍스트 생성
 */
export function generateAwardAttachment1Text(params: AwardDraftParams): string {
  const { submissions } = params;
  const currentYear = new Date().getFullYear();

  // 실제 데이터가 충분한 경우 득표수 순으로 정렬하여 자동 채움
  const sorted = [...submissions].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  let rowsText = "";

  if (sorted.length >= 3) {
    // 실제 출품작 데이터 활용
    const awardLabels = [
      { rank: 1, title: "최우수상(금상)", note: "최고득점" },
      { rank: 2, title: "우수상(은상)", note: "" },
      { rank: 3, title: "우수상(은상)", note: "" },
      { rank: 4, title: "장려상(동상)", note: "" },
      { rank: 5, title: "장려상(동상)", note: "" },
      { rank: 6, title: "장려상(동상)", note: "" },
    ];

    rowsText = awardLabels
      .map((item, idx) => {
        const sub = sorted[idx];
        if (sub) {
          const studentInfo = `${sub.studentGrade || 1}학년 ${sub.studentClass || 1}반`;
          const authorName = sub.nickname || `학생${idx + 1}`;
          const workTitle = sub.title || `작품 ${idx + 1}`;
          const note = sub.special_award_title ? `[특별상: ${sub.special_award_title}]` : item.note;
          return `${item.rank}\t${item.title}\t${studentInfo}\t[${authorName}]\t[${workTitle}]\t${note}`;
        } else {
          return `${item.rank}\t${item.title}\t[O]학년 [O]반\t[성명]\t[작품명]\t${item.note}`;
        }
      })
      .join("\n");
  } else {
    // 표준 예시 템플릿 제공
    rowsText = `1\t최우수상(금상)\t[O]학년 [O]반\t[김우수]\t[운동장의 가을 하늘]\t최고득점
2\t우수상(은상)\t[O]학년 [O]반\t[이사진]\t[우리들의 쉬는 시간]\t
3\t우수상(은상)\t[O]학년 [O]반\t[박예술]\t[교실 창밖 풍경]\t
4\t장려상(동상)\t[O]학년 [O]반\t[최창의]\t[학교 고양이의 하루]\t
5\t장려상(동상)\t[O]학년 [O]반\t[정감수]\t[급식실 가는 길]\t
6\t장려상(동상)\t[O]학년 [O]반\t[한누리]\t[우리 학교 무지개]\t`;
  }

  return `[붙임 1] ${currentYear}학년도 교내 사진전 수상자 명단

• 학년군별/학급별 최종 합산 점수 고득점자 순

순위\t상장 훈격\t학년-반\t성명\t작품명\t비고
${rowsText}`;
}

/**
 * [붙임 2] 부상 구입 지출결의 내역 텍스트 생성
 */
export function generateAwardAttachment2Text(params: AwardDraftParams): string {
  const { submissions } = params;
  const sorted = [...submissions].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  const firstWinnerName = sorted[0]?.nickname ? `[${sorted[0].nickname}]` : "[김우수]";
  const secondWinnerName = sorted[1]?.nickname ? `[${sorted[1].nickname}]` : "[이사진]";
  const fourthWinnerName = sorted[3]?.nickname ? `[${sorted[3].nickname}]` : "[최창의]";
  const totalSubmissions = submissions.length > 0 ? String(submissions.length) : "00";

  return `[붙임 2] 부상 구입 지출결의 내역

• 소요 예산 집행 정산 내역 (기존 계획안의 예산 범위 내 지출 확인)

품명(항목)\t규격/수량\t단가\t금액\t비고
최우수상 부상\t문화상품권 / 1매\t20,000원\t20,000원\t${firstWinnerName}
우수상 부상\t문화상품권 / 2매\t10,000원\t20,000원\t${secondWinnerName} 외 1명
장려상 부상\t문화상품권 / 3매\t5,000원\t15,000원\t${fourthWinnerName} 외 2명
참가 기념품\t[기념 볼펜] / [${totalSubmissions}]개\t1,000원\t[00,000원]\t참가자 전원
우수작 액자 제작\t교내 전시용 / 6개\t5,000원\t30,000원\t수상작 6점
합계\t\t\t[000,000원]\t`;
}

/**
 * 전체 통합 텍스트 (공문 본문 + 붙임 1 + 붙임 2)
 */
export function generateFullAwardDraftText(params: AwardDraftParams): string {
  const main = generateAwardMainDraftText(params);
  const att1 = generateAwardAttachment1Text(params);
  const att2 = generateAwardAttachment2Text(params);

  return `${main}

--------------------------------------------------------------------------------

${att1}

--------------------------------------------------------------------------------

${att2}`;
}
