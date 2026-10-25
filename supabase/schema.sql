-- =========================================================================
-- 스쿨픽(School-Pic) Supabase PostgreSQL 마스터 스키마
-- PRD 6장 규격 준수: RLS 보안 정책 및 테넌트(학교) 분리 구조
-- =========================================================================

-- 1. 학교 정보 테이블
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_code VARCHAR(10) UNIQUE NOT NULL, -- 예: GWE-4021, JNE-3012
    school_name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    neis_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 교사 계정 테이블
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(100) UNIQUE NOT NULL, -- @korea.kr 또는 교육청 메일
    name VARCHAR(50) NOT NULL,
    role_grade VARCHAR(50), -- 예: "5학년 2반 담임"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 학생 임시 프로필 테이블 (PIN 인증 기반 3초 퀵 엔트리)
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    grade INT NOT NULL,
    class_num INT NOT NULL,
    student_num INT NOT NULL,
    pin_code_hash VARCHAR(255) NOT NULL, -- 4자리 PIN 해시 (기본값: 0000 초기화 가능)
    nickname VARCHAR(50) NOT NULL, -- 친구들에게 노출될 작가 닉네임 (실명 미노출)
    has_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, grade, class_num, student_num)
);

-- 4. 전시회(사진전) 마스터 테이블
CREATE TABLE IF NOT EXISTS exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_by UUID REFERENCES teachers(id),
    title VARCHAR(200) NOT NULL,
    theme_id VARCHAR(50) NOT NULL, -- 18종 테마 카탈로그 ID
    theme_category VARCHAR(50) NOT NULL, -- culture / subject
    submission_start TIMESTAMPTZ NOT NULL,
    submission_end TIMESTAMPTZ NOT NULL,
    voting_start TIMESTAMPTZ NOT NULL,
    voting_end TIMESTAMPTZ NOT NULL,
    purge_due_date TIMESTAMPTZ NOT NULL, -- 종료 7일 후 Auto-Purge
    voting_policy VARCHAR(30) DEFAULT 'LIMIT_THREE_TOTAL', -- DAILY_3, TOTAL_3, ONE_1
    status VARCHAR(20) DEFAULT 'SUBMISSION_OPEN', -- SUBMISSION_OPEN, VOTING, ENDED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 작품 출품 테이블
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    artist_note TEXT, -- 30자 이내 작가 노트
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    selected_frame VARCHAR(100), -- 0원 코스프레, 보스 레이드, 감성 매거진 등
    vote_count INT DEFAULT 0,
    student_votes INT DEFAULT 0,
    teacher_votes INT DEFAULT 0,
    parent_votes INT DEFAULT 0,
    special_award_title VARCHAR(100), -- 특별상 명칭 (교사 직접 수여)
    special_award_reason TEXT, -- 특별상 수여 사유 및 생기부 문구
    -- 3단계 초상권·개인정보 안심 파이프라인 (전국 스쿨 교류관 연동)
    student_consent BOOLEAN DEFAULT FALSE,
    parent_consent BOOLEAN DEFAULT FALSE,
    teacher_approval BOOLEAN DEFAULT FALSE,
    is_public_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 투표 이력 로그 테이블 (1인 다표 및 중복 투표 방지)
CREATE TABLE IF NOT EXISTS votes_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    voter_fingerprint VARCHAR(255) NOT NULL, -- 학생 식별자 / 학부모 휴대폰 해시
    voter_type VARCHAR(20) NOT NULL, -- STUDENT, TEACHER, PARENT
    voted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 교직원 특별 평가 테이블
CREATE TABLE IF NOT EXISTS staff_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    score INT CHECK (score BETWEEN 1 AND 5),
    feedback_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, teacher_id)
);

-- 8. 교사 플랫폼 피드백 테이블 (개발자 메일 포워딩 연동)
CREATE TABLE IF NOT EXISTS teacher_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    school_name VARCHAR(100),
    teacher_email VARCHAR(100),
    category VARCHAR(50) NOT NULL, -- THEME, IMPROVEMENT, ACCOUNT, ETC
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 인덱스 설정 (성능 최적화)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(school_code);
CREATE INDEX IF NOT EXISTS idx_student_profiles_lookup ON student_profiles(school_id, grade, class_num, student_num);
CREATE INDEX IF NOT EXISTS idx_submissions_exhibition ON submissions(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_votes_log_submission ON votes_log(submission_id);

-- =========================================================================
-- Row Level Security (RLS) 활성화
-- =========================================================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_feedbacks ENABLE ROW LEVEL SECURITY;

-- 누구나 학교 코드 및 기본 정보 조회 가능
CREATE POLICY "Public schools are viewable" ON schools FOR SELECT USING (true);
CREATE POLICY "Public exhibitions viewable" ON exhibitions FOR SELECT USING (true);
CREATE POLICY "Public submissions viewable" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow public feedback insert" ON teacher_feedbacks FOR INSERT WITH CHECK (true);
