export type ThemeMode = "culture" | "subject";

export interface ThemeTemplate {
  id: string;
  mode: ThemeMode;
  title: string;
  tag: string;
  icon: string;
  desc: string;
  category: string; // 성격 / 연계단원
  intent: string; // 기획 의도
  studentRules: string[]; // 학생 챌린지 룰
  framesAndStickers: string[]; // 전용 프레임 & 스티커
  teacherTips: string; // 교사 생기부/지도 팁 & 세특 기재 문구
  specialGimmick?: string; // 시스템 기믹 (보스 레이드 HP 등)
}

export type ChallengeStatus = "SUBMITTING" | "VOTING" | "ENDED";

export interface Challenge {
  id: string;
  title: string;
  themeId: string;
  mode: ThemeMode;
  icon: string;
  tag: string;
  description: string;
  targetGrade: string; // e.g. "전교생", "2학년", "1학년 3반"
  teacherName: string;
  status: ChallengeStatus;
  submissionStartDate?: string; // YYYY-MM-DD
  submissionStartTime?: string; // HH:mm
  submissionEndDate: string; // YYYY-MM-DD
  submissionEndTime?: string; // HH:mm
  votingStartDate?: string; // YYYY-MM-DD
  votingStartTime?: string; // HH:mm
  votingEndDate: string; // YYYY-MM-DD
  votingEndTime?: string; // HH:mm
  voteLimitType: "DAILY_3" | "TOTAL_3" | "ONE_1";
  isBlindSubmission: boolean; // 출품작 블라인드 여부
  submissionCount: number;
  totalVotes: number;
  createdAt: string;
  // 확장 정보
  category?: string;
  intent?: string;
  studentRules?: string[];
  framesAndStickers?: string[];
  teacherTips?: string;
  specialGimmick?: string;
}

export interface PhotoSubmission {
  id: string;
  challengeId: string;
  studentGrade: number;
  studentClass: number;
  studentNumber: number;
  nickname: string; // 실명 금지!
  title: string;
  caption?: string; // 30자 이내 작품 설명(작가 노트)
  imageUrl: string;
  votes: number; // 총합 득표수
  studentVotes?: number; // 학생 투표 집계
  teacherVotes?: number; // 교직원 투표 집계
  parentVotes?: number; // 학부모 공감 투표 집계
  submittedAt: string;
  selectedFrame?: string;
  appliedStickers?: Array<{
    id: string;
    text: string;
    bg?: string;
    color?: string;
    x: number; // percentage (0 - 100)
    y: number; // percentage (0 - 100)
  }>;
  // 3단계 개인정보·초상권 안심 승인 파이프라인 (Double-Lock & Approval)
  student_consent?: boolean; // 1단계: 학생 자발적 동의 (Student Opt-in)
  parent_consent?: boolean; // 2단계: 학부모 법정대리인 동의 (Parent Consent)
  teacher_approval?: boolean; // 3단계: 교사 최종 검수 완료 (Teacher Final Approval)
  is_hall_of_fame?: boolean; // 교내 명예의 전당 등재 여부
  is_public_shared?: boolean; // 전국 스쿨 교류관 등재 (1+2+3단계 모두 TRUE일 때만 노출)
  schoolName?: string; // 타 학교 노출용 가명 학교명 (예: 광주 한재초)
  // 특별상 수여 기능 (교사가 직접 지정하는 특별상)
  special_award_title?: string; // 예: "아이디어 뱅크 특별상"
  special_award_reason?: string; // 생기부 연계 수여 사유
  // 전국 교류관 선플·클린 인터랙션 (긍정 응원 스탬프)
  cheerStamps?: {
    fire: number; // 🔥 멋져요!
    clap: number; // 👏 대단해요!
    idea: number; // 💡 아이디어 최고!
    heart: number; // 💖 감동이에요!
  };
}
