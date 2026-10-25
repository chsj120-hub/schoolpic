# **스쿨픽(School-Pic) 전체 기획서 및 시스템 개발 가이드라인**

단위 학급 수업 단위의 사진 활동을 전교 차원의 참여형 전시로 연계하고, 교육 행정 및 평가 업무를 자동화하는 학교 특화 에듀테크 플랫폼 아키텍처 명세서입니다.

# **1\. 프로젝트 개요 및 배경**

스쿨픽(School-Pic)은 초·중·고등학교의 교과 및 창의적 체험활동 과정에서 생성되는 학생 참여형 사진 콘텐츠를 안전하게 전시·공유하고, 학생의 자발적 학교 문화 형성과 교사의 교육행정 경감을 지원하기 위해 설계된 참여형 디지털 전시 솔루션입니다.

## **핵심 콘셉트**

미술·과학·사회 등 정규 교과 수업 및 학급 자치 활동에서 생성된 창작물을 단일 학급 내 소비에 그치지 않고, 학교 코드 기반의 안전한 디지털 전시관을 통해 전교생 및 학부모가 공감하는 온·오프라인 연계 사진 축제로 확장합니다.

## **4대 핵심 추진 목표**

* **학생 중심 문화 형성**: 정형화된 활동을 탈피하여 놀이 중심의 시각 콘텐츠를 창작하고, 친구 및 교원과의 교류를 통해 사제동행과 학교폭력 예방을 동시에 도모합니다.  
* **개인정보(PII) 및 초상권 안심 설계**: 외부 포털 노출 위험을 원천 차단하는 인트라넷형 학교 단위 격리 구조를 취하며, 행사 종료 후 데이터 완전 파기(Auto-Purge) 파이프라인을 운영합니다.  
* **개인정보(PII) 및 초상권 안심 설계**: 외부 포털 노출 위험을 원천 차단하는 인트라넷형 학교 단위 격리 구조를 기본 취하며, 행사 종료 후 데이터 완전 파기(Auto-Purge) 파이프라인을 운영합니다. 단, 선별 우수작은 엄격한 학생·학부모·교사 3단계 승인 기반의 전국 교류관으로 안전하게 확장합니다.  
* **학교 홍보 및 공모전 연계**: 검증된 고화질 아카이빙 자산을 학교 공식 홍보물에 활용하고, 데이터 기반의 실증 리포트를 통해 교육청 스마트 에듀테크 선도학교 공모 선정을 지원합니다.

# **2\. 테마 카탈로그 상세 (18종)**

## **탭 1: 학교 문화 & 창체 모드 (기본 활성)**

| 순번 | 테마 명칭 | 기획 의도 및 활동 상세 | 산출물 및 연계 효과 |
| :---- | :---- | :---- | :---- |
| 1 | 0원 코스프레 | 교실 내 일상 사물(빗자루, 실내화, 이면지 등)을 활용한 명화·영화 패러디 | 창의 융합 표현물 제작, 학급 단합력 고취 |
| 2 | 보스 레이드 | 교장, 교감, 담임 교사와 대치하는 위트 있는 앵글의 챌린지 사진전 | 전교 기여도 달성 시 보스 공약(간식 데이 등) 해금 |
| 3 | 베프 사진전 | 단짝 친구와 함께하는 시그니처 포즈 스냅 샷 | 관계 형성 및 학교폭력 예방 캠페인 연계 |
| 4 | 숨은 명소 찾기 | 캠퍼스 내 계절별 미관 스팟 및 감성 구도 발굴 | 학교 대표 홈페이지 배너 및 입학 안내 책자 활용 |
| 5 | 내가 리뷰왕 | 식판의 균형 잡힌 컬러 배치 및 잔반 제로 실천 완식 인증 | 영양교사 식생활 지도 및 친환경 탄소중립 실천 |
| 6 | 포스터 모델 선발전 | 교내 정기 축제, 도서관 주간, 흡연 예방 캠페인 연계 모델 | 실제 교내 공공 포스터의 표지 인쇄물 등재 |
| 7 | 내가 효도왕 | 5월 가정의 달 기념 세대공감 가족사진 및 효행 포착 | 학부모 소통 증진 및 인성 교육 실천 |
| 8 | 교내 인플루언서 | 정지 챌린지 및 단체 코디를 통한 안전망 내 자기표현 | 방송반 교내 방송 및 자치회 행사 연계 |
| 9 | 우리 학교 사진작가 | 원근법, 역광, 프레임 속 프레임을 활용한 심화 예술 사진 | 작가 노트 작성 필수화를 통한 시각예술 감상력 심화 |
| 10 | 청소 비포&애프터 사진전 | 교실 청소·사물함 정리·급식 정돈 활동의 Before/After 2분할 컷 촬영 (전용 배지 및 "반짝반짝 클린 마스터" 프레임) | 환경 정화 봉사 및 자율활동 연계, 학급 환경 미화 평가 자동화 |
| 11 | 도플갱어 찾기 | 친구·선생님과 닮은 캐릭터·사물 매칭 또는 붕어빵 닮은꼴 2분할 비교 촬영 ("싱크로율 99.9%", "복붙" 프레임) | 관찰력 신장, 교내 유대감 및 친밀감 형성, 사제동행 문화 조성 |
| 12 | 트릭아트 사진전 | 원근법(Forced Perspective)·그림자 각도를 활용한 착시 사진 연출 ("현실 왜곡 모드", "착시 예술가" 프레임) | 미술과 공간 지각 및 원근법 성취기준 연계, 수학 기하학적 비례 감각 신장 |

## **탭 2: 정규 교과 수업 모드 (수행평가/세특 연계)**

| 순번 | 교과목 | 테마 명칭 | 교과 역량 및 수행평가 연계 기준 |
| :---- | :---- | :---- | :---- |
| 1 | 과학 | 학교 식물·생태 사진전 | 화단 및 교목 매크로(접사) 촬영, 종 분류 및 식물도감 편찬 |
| 2 | 사회 | 우리 지역 문화재 탐험 | 지자체 역사 유적, 공공 조형물 관찰 기록을 통한 향토사 이해 |
| 3 | 수학 | 멋진 도형·패턴 찾기 | 학교 건축물 속 선대칭, 점대칭, 합동, 프랙탈 패턴 수학적 분석 |
| 4 | 실과 | 지속 가능한 패션왕 | 의류 업사이클링, 체육복 시밀러 코디를 통한 친환경 의생활 탐구 |
| 5 | 국어 | 아름다운 글씨·문장 | 도서관 명문장 발췌 및 캘리그래피 필사 연계 시각화 |
| 6 | 체육 | 교내 스포츠 스타 | 구기 경기, 트랙 육상 등 역동적인 순간 셔터 찬스 포착 |

# **3\. 사용자 인터랙션 & 온보딩 설계**

## **3-Track 온보딩 플로우**

복잡한 회원가입 절차를 전면 배제하고 학교 현장의 특수성을 고려한 최적화된 온보딩 파이프라인을 구축합니다.

* **학생 트랙 (3초 퀵 엔트리)**  
  * 오프라인 포스터 또는 교내 게시판의 QR 코드를 스마트폰 카메라로 스캔합니다.  
  * URL 파라미터를 통해 학교 코드가 자동 주입됩니다.  
  * \[학년 / 반 / 번호\] 입력 후 인증용 \[4자리 PIN\] 및 공개용 \[작가 닉네임\]을 설정하여 계정을 생성합니다.  
  * 텍스트 댓글 기능을 배제하여 언어폭력을 사전 차단하며, 1인 투표 제한 및 본인 출품작에 대한 접수 마감 전 수정/삭제 권한을 엄격히 보장합니다.  
* **교사 트랙 (공직자 인증 기반 관리관)**  
  * `@korea.kr` 공직자 메일 주소를 입력한 뒤 전송된 매직링크(Magic Link)를 통해 원클릭 로그인합니다.  
  * NEIS 학교 데이터베이스와 연동되어 소속 학교가 자동 매핑되며 고유 6자리 학교 코드가 발급됩니다.  
  * 테마 선택 후 마감 일시만 지정하면 30초 내에 전용 전시관이 개설되고 참여 유도용 A4 홍보 포스터가 즉각 생성됩니다.  
* **학부모 트랙 (뷰어 및 공감 평가)**  
  * 가정통신문(e알리미, 아이엠스쿨 등)을 통해 전용 보안 뷰어 링크를 배포받습니다.  
  * 학생의 실명, 학년, 반, 번호 등 민감 정보는 철저히 마스킹(비공개)되며 작가 닉네임과 작품명만 노출됩니다.  
  * 학교 설정에 따라 열람 전용 모드 또는 1가구 1표 정책의 공감 투표 권한이 부여됩니다.

## **교사용 피드백 시스템**

* 교사 대시보드 우측 하단에 상시 접근 가능한 `[💬 테마 제안 / 문의]` 플로팅 위젯을 배치합니다.  
* 접수된 제안 및 버그 리포트는 백엔드 DB 저장과 동시에 Resend API를 통해 개발 운영진 메일함으로 표준화된 템플릿 형태로 즉시 포워딩됩니다.

## **교사용 발표/프레젠테이션 모드 (Show & Presentation)**

접수 마감 후 투표 시작 전, 교사가 전자칠판 또는 빔프로젝터에 출품작을 한 장씩 띄워 학생이 직접 작품 의도와 비하인드를 발표할 수 있도록 지원하는 수업 연계형 쇼케이스 인터페이스입니다.

* **전자칠판 최적화 전체화면 슬라이드쇼**: 키보드 방향키, 화면 터치 스와이프, 무선 프리젠터(리모컨) 입력을 완벽 지원하는 반응형 고해상도 전체화면 뷰어를 제공합니다.  
* **발표 학생 호명용 카드 & 블라인드 토글**: 교사용 디바이스에는 실명/학번 카드(\[5학년 2반 14번 / 작가: 5반 날다람쥐\])를 표시하며, 프로젝터/전자칠판 미러링 화면에서는 공정성과 개인정보 보호를 위해 닉네임만 노출하는 블라인드 모드 토글을 지원합니다.  
* **작가 노트 & 비하인드 팝업 오버레이**: 발표 중 필요 시 버튼 클릭 또는 롱터치로 학생이 작성한 촬영 비하인드 및 감상 포인트를 반투명 오버레이 카드로 즉각 팝업합니다.  
* **발표 관리 및 원클릭 투표 오픈**: 발표 완료 체크, 발표 순서 랜덤 셔플 및 번호순 정렬 옵션을 제공하며, 모든 발표 종료 즉시 \[전교 투표 오픈\] 버튼을 통해 상태를 실시간 일괄 전환합니다.

# **4\. 운영 정책 & 학교 행정 일체화**

## **3단계 엄격한 운영 타임라인**

공정한 심사와 데이터 무결성을 위해 상태 전이가 자동 통제됩니다.

* **1단계: 작품 접수 기간**: 학생 출품 및 수정/삭제가 자유롭게 허용되며, 타인의 출품작 열람 및 투표 기능은 잠금 처리됩니다.  
* **2단계: 전교 투표 기간**: 신규 출품 및 기존 사진 수정이 전면 차단되며, 전교생 및 교직원에게 전체 작품이 동시 공개되어 투표가 개시됩니다.  
* **3단계: 결과 발표 및 자동 파기**: 집계 순위에 따른 가상 리본이 부여되며, 7일간의 다운로드 유예 기간 경과 후 클라우드 스토리지 및 데이터베이스에서 원본 미디어가 영구 자동 삭제(Auto-Purge)됩니다. (단, 정당한 동의를 거친 명예의 전당 등재작은 제외)  
* **4단계 (확장): 명예의 전당 & 전국 학교 교류관 (자랑하기)**: 행사 종료 후 우수 출품작을 교내 명예의 전당에 영구 보존하고, 검증된 절차를 거쳐 전국 단위 '스쿨 교류관'에 선별 등재하여 타 학교 학생들과 긍정적 영감을 교류합니다.

## **투표 방식 및 평가 다원화**

* **학생 투표 옵션화**: 학교 환경에 맞추어 `기간 내 총 3표(신중형)`, `1일 3표(참여 촉진형)`, `1인 1표(단순형)` 중 선택 적용합니다.  
* **교직원 특별상 트랙 분리**: 단순 득표수에 좌우되는 인기상과 별도로, 교직원 전용 관리관에서 작품성·성실성을 평가할 수 있는 별점(1\~5점) 및 코멘트 평가 세션을 분리 운영합니다.

## **행정 자동화 기능 명세**

* **K-에듀파인 기안문 연동**: 행사 개설 즉시 목적, 방침, 세부 추진 계획, 예산 항목이 포함된 표준 기안문 HWP/문서 서식을 복사 가능한 형태로 제공합니다.  
* **결과 보고서 패키지 원클릭 다운로드**: 투표 종료 시 종합 결과 보고서(PDF)와 함께 시상식 운영을 위한 엑셀 시트, 수상작 고화질 이미지(규격화된 파일명: `[순위]_[학년반번호]_[닉네임].jpg` 일괄 압축 ZIP)를 내려받을 수 있습니다.  
* **나이스(NEIS) 교과 세특 및 창체 문구 자동 빌더**: 학생별 출품 테마, 사진 작가 노트의 키워드, 교직원 평가 코멘트를 결합하여 학교생활기록부 기재 표준 양식에 부합하는 정형화된 세특 텍스트를 자동 작성합니다.

## **명예의 전당 및 전국 교류관 개인정보 안심 파이프라인**

교내 수상작의 우수 창작 가치를 전국 학교로 확장하되, 학생 초상권과 개인정보를 완벽히 통제하기 위한 3단계 승인(Double-Lock & Teacher Approval) 체계를 가동합니다.

* **1단계 (학생 자발적 동의)**: 교내 수상 확정 시 학생 앱 화면에 모달 팝업을 띄워 타 학교 공개 희망 여부 확인 ("타 학교 친구들에게 내 사진을 자랑할까요? 외부 공개에 동의합니다 \[v\]")  
* **2단계 (법정대리인 동의)**: 가정통신문 연동 링크 또는 학부모 뷰어 내 본인인증 기반 원클릭 법정대리인 개인정보 제공 및 초상권 활용 동의를 완료합니다.  
* **3단계 (교사 최종 검수 및 승인)**: 담당 교사가 관리관에서 초상권 침해, 유해 요소, 배경 속 타인 노출 여부를 최종 검토한 후 '전국 자랑하기 전송' 버튼을 클릭해야만 최종 등재됩니다.  
* **타 학교 교류관 보안 화면 구성**: 학교명, 학년, 작가 닉네임, 수상 득표 뱃지만 노출(실명/학번 절대 비공개)하며, 얼굴 노출 부담 완화를 위한 자동 블러 및 학교 마스코트 스티커 마스킹 옵션을 기본 지원합니다. 텍스트 댓글은 전면 배제하고 악플 원천 방지를 위한 '응원 스탬프(멋져요, 대단해요)' 인터랙션만 운영합니다.

# **5\. 시스템 아키텍처 및 기술 스택**

\[ 클라이언트 영역 \]

Next.js (App Router) \+ Tailwind CSS \+ PWA (모바일 웹 뷰 최적화)

        │

        ├── HTML5 Canvas (클라이언트 사이드 프레임 합성 및 리사이징)

        └── CSS Print Media (@media print A4 전시/안내 포스터 다이렉트 출력)

        │

\[ 네트워크 / 백엔드 서비스 \]

Supabase Engine (PostgreSQL, GoTrue Auth, Row Level Security)

        │

        ├── Edge Functions (Resend API 연계 공직자 인증 및 피드백 알림)

        └── Cloudflare R2 Storage (S3 API 호환, Egress 대역폭 수수료 0원)

| 기술 레이어 | 도입 기술 | 채택 사유 및 기술적 이점 |
| :---- | :---- | :---- |
| Frontend | Next.js (App Router), Tailwind CSS | 서버 컴포넌트를 통한 고속 초기 렌더링, 반응형 UI 신속 구축 |
| Platform | Progressive Web App (PWA) | 별도 앱스토어 설치 없이 QR 기반 즉시 실행 환경 지원 |
| Backend & DB | Supabase (PostgreSQL) | 고성능 관계형 데이터베이스, 강력한 RLS 보안 정책, 직관적 관리 |
| Storage | Cloudflare R2 | 학교 행사 특성상 집중되는 대용량 이미지 다운로드 시 Egress 비용 무료 |
| Media Engine | Client HTML5 Canvas API | 서버 부하 없는 클라이언트 단 이미지 리사이징, 워터마크 및 프레임 합성 |
| Print System | CSS `@media print` | A4 규격 포스터, 출품 확인증 등 별도 렌더러 없이 완벽한 인쇄 레이아웃 구현 |
| Email Service | Resend API | @korea.kr 도메인으로의 높은 도달률을 보장하는 트랜잭셔널 메일 인프라 |

# **6\. 데이터베이스 스키마 명세 (PostgreSQL / Supabase)**

데이터베이스는 RLS(Row Level Security)를 전제로 하며, 테넌트 분리를 위해 모든 엔터티는 학교 ID를 상위 외래키로 참조합니다.-- 1\. 학교 정보 테이블

CREATE TABLE schools (

    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

    school\_code VARCHAR(10) UNIQUE NOT NULL,

    school\_name VARCHAR(100) NOT NULL,

    region VARCHAR(50) NOT NULL,

    created\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- 2\. 교사 계정 테이블

CREATE TABLE teachers (

    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

    school\_id UUID REFERENCES schools(id) ON DELETE CASCADE,

    email VARCHAR(100) UNIQUE NOT NULL,

    name VARCHAR(50) NOT NULL,

    created\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- 3\. 학생 임시 프로필 테이블 (PIN 인증)

CREATE TABLE student\_profiles (

    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

    school\_id UUID REFERENCES schools(id) ON DELETE CASCADE,

    grade INT NOT NULL,

    class\_num INT NOT NULL,

    student\_num INT NOT NULL,

    pin\_code\_hash VARCHAR(255) NOT NULL,

    nickname VARCHAR(50) NOT NULL,

    created\_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(school\_id, grade, class\_num, student\_num)

);

\-- 4\. 전시회 마스터 테이블

CREATE TABLE exhibitions (

    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

    school\_id UUID REFERENCES schools(id) ON DELETE CASCADE,

    created\_by UUID REFERENCES teachers(id),

    title VARCHAR(200) NOT NULL,

    theme\_category VARCHAR(50) NOT NULL,

    submission\_start TIMESTAMPTZ NOT NULL,

    submission\_end TIMESTAMPTZ NOT NULL,

    voting\_start TIMESTAMPTZ NOT NULL,

    voting\_end TIMESTAMPTZ NOT NULL,

    purge\_due\_date TIMESTAMPTZ NOT NULL,

    voting\_policy VARCHAR(30) DEFAULT 'LIMIT\_THREE\_TOTAL',

    status VARCHAR(20) DEFAULT 'SUBMISSION\_OPEN',

    created\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- 5\. 작품 출품 테이블

CREATE TABLE submissions (

    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

    exhibition\_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,

    student\_id UUID REFERENCES student\_profiles(id) ON DELETE CASCADE,

    title VARCHAR(150) NOT NULL,

    artist\_note TEXT,

    image\_url TEXT NOT NULL,

    thumbnail\_url TEXT,

    vote\_count INT DEFAULT 0,

    created\_at TIMESTAMPTZ DEFAULT NOW(),

    updated\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- 6\. 투표 이력 로그 테이블

CREATE TABLE votes\_log (

    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

    submission\_id UUID REFERENCES submissions(id) ON DELETE CASCADE,

    voter\_fingerprint VARCHAR(255) NOT NULL,

    voter\_type VARCHAR(20) NOT NULL, \-- STUDENT, TEACHER, PARENT

    voted\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- 7\. 교직원 특별 평가 테이블

CREATE TABLE staff\_evaluations (

    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

    submission\_id UUID REFERENCES submissions(id) ON DELETE CASCADE,

    teacher\_id UUID REFERENCES teachers(id) ON DELETE CASCADE,

    score INT CHECK (score BETWEEN 1 AND 5),

    feedback\_comment TEXT,

    created\_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(submission\_id, teacher\_id)

);

\-- 8\. 교사 플랫폼 피드백 테이블

CREATE TABLE teacher\_feedbacks (

    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

    teacher\_id UUID REFERENCES teachers(id) ON DELETE SET NULL,

    category VARCHAR(50) NOT NULL,

    message TEXT NOT NULL,

    is\_processed BOOLEAN DEFAULT FALSE,

    created\_at TIMESTAMPTZ DEFAULT NOW()

);

# **7\. 3주 PoC 및 교육청 공모 제안 로드맵**

단일 학급 파일럿 운영부터 전교 단위 실증, 그리고 교육청 정책 사업 연계까지의 4단계 실행 전략입니다.\[1주차: 학급 검증\] ──\> \[2주차: 사제동행 이벤트\] ──\> \[3주차: 전교 사진전\] ──\> \[4주차: 공모 제안\]

0원 코스프레 실습      교장/교감 보스 레이드      전교 투표 및 교직원상      에듀테크 선도교 신청

## **주차별 세부 추진 계획**

* **1주차: 단위 학급 현장 적합성 검증 (미술 수업 연계)**  
  * 대상: 단일 학급(미술 교과 시간) 학생 25\~30명  
  * 내용: `0원 코스프레` 테마 진행, 모바일 QR 접속 및 PIN 로그인 속도 측정  
  * 검증 항목: 온보딩 소요 시간(3초 이내 달성 여부), 모바일 UI 사용성, 사진 업로드 간 Canvas 리사이징 성능 점검  
* **2주차: 사제동행 확장형 이벤트 (학교 문화 개선)**  
  * 대상: 1개 학년 전체 및 학교 관리직(교장, 교감)  
  * 내용: `보스 레이드` 테마 전개, 관리직 교원과 대치하는 창의적 앵글 연출  
  * 검증 항목: 관리자 인터페이스 완성도, 서버 로깅 신뢰도, 세대 간 정서적 유대 효과 분석  
* **3주차: 전교 디지털 사진전 및 교직원 특별상 운영**  
  * 대상: 전교생, 전 교직원 및 학부모  
  * 내용: CSS Print 기반 안내 포스터 교내 배포, 전교 투표 기간 개시, 교직원 특별 평가 동시 실시  
  * 검증 항목: 트래픽 스파이크 대응, Auto-Purge 스케줄러 안정성, K-에듀파인 결과 보고서 및 ZIP 패키징 다운로드 테스트  
* **4주차: 정책 제안서 완성 및 교육청 사업 연계**  
  * 산출물: 참여율 80% 이상, 교사 업무 경감 만족도 90% 이상 정량 데이터가 포함된 실증 리포트  
  * 제안 트랙: 시·도 교육청 ‘인성·디지털 미디어 역량 강화 선도학교’, ‘스마트 에듀테크 활용 수업 혁신학교’ 공모 제안서 최종 제출

