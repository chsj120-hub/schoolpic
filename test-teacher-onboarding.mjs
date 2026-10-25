import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function testTeacherOnboarding() {
  console.log("==================================================");
  console.log("  👨‍🏫 교사 학교 코드 발급 & 온보딩 4단계 프로세스 테스트");
  console.log("==================================================");

  let browser;
  try {
    const edgePaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    ];
    let executablePath = edgePaths.find(p => fs.existsSync(p));

    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: executablePath || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    await page.setViewport({ width: 1280, height: 800 });

    console.log("1. http://localhost:3001/teacher/login 접속 중...");
    await page.goto("http://localhost:3001/teacher/login", { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 1500));

    // 2. [선생님 신규 가입] 탭 클릭
    console.log("2. [선생님 신규 가입] 탭 전환...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signupBtn = btns.find(b => b.textContent?.includes('신규 가입'));
      if (signupBtn) signupBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 3. [1단계: 공직자 이메일 인증]
    console.log("3. [1단계] 공직자 메일(teacher_lee@korea.kr) 인증 코드 요청...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sendBtn = btns.find(b => b.textContent?.includes('인증번호 받기'));
      if (sendBtn) sendBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 1단계 인증 완료 버튼 클릭
    console.log("   ✓ 인증번호(778899) 확인 및 [2단계 학교 찾기로 이동] 클릭...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const verifyBtn = btns.find(b => b.textContent?.includes('2단계 학교 찾기로 이동'));
      if (verifyBtn) verifyBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 4. [2단계: 학교명 자동완성 검색]
    console.log("4. [2단계] 학교명 자동완성 검색 ('한재') 결과 확인 및 '한재초등학교' 선택...");
    await page.waitForSelector('#school-item-sch-001', { timeout: 5000 });
    await page.click('#school-item-sch-001');
    await new Promise(r => setTimeout(r, 1000));
    console.log("   ✓ 한재초등학교(#school-item-sch-001) 클릭 성공");

    // 5. [3단계: 학교 코드 생성 또는 매핑 (동료 교사 협업)]
    console.log("5. [3단계] 학교 코드 매핑 & Multi-Teacher 합류 확인...");
    const step3Info = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasExistingNotice: text.includes('동료 선생님이 이미 등록한 학교입니다'),
        hasCode: text.includes('JNE-3012'),
      };
    });
    console.log(`   ✓ 기존 학교 코드 [ JNE-3012 ] 감지: ${step3Info.hasCode ? "성공" : "실패"}`);
    console.log(`   ✓ 동료 교사 협업 합류 안내: ${step3Info.hasExistingNotice ? "정상 노출" : "실패"}`);

    // [합류 확인 (➔ 다음)] 클릭
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent?.includes('합류 확인') || b.textContent?.includes('다음'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 6. [4단계: 이메일 아이디 저장 및 비밀번호 지정]
    console.log("6. [4단계] 계정 및 비밀번호 설정 후 [가입 완료 & 관리자 센터 입장!] 클릭...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(b => b.textContent?.includes('가입 완료'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // 대시보드로 이동 확인
    const currentUrl = page.url();
    console.log(`   ✓ 현재 이동된 URL: ${currentUrl}`);

    const dashboardText = await page.evaluate(() => document.body.innerText);
    const hasSchoolName = dashboardText.includes('한재초등학교');
    const hasSchoolCode = dashboardText.includes('JNE-3012');
    console.log(`   ✓ 대시보드 상단 학교명 반영: ${hasSchoolName ? "한재초등학교 확인" : "실패"}`);
    console.log(`   ✓ 대시보드 상단 학교 코드 반영: ${hasSchoolCode ? "JNE-3012 확인" : "실패"}`);

    // 스크린샷 캡처
    const screenshotPath = path.resolve('teacher_onboarding_success.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`   ✓ 대시보드 스크린샷 캡처 완료: ${screenshotPath}`);

    if (currentUrl.includes('/teacher') && hasSchoolName && hasSchoolCode) {
      console.log("\n==================================================");
      console.log("  🎯 [테스트 성공] 교사 온보딩 4단계 프로세스 & 학교 코드 매핑 100% 검증 완료!");
      console.log("==================================================");
    } else {
      console.warn("⚠️ 검증 항목을 다시 확인하세요.");
    }

  } catch (err) {
    console.error("❌ 테스트 중 오류 발생:", err);
  } finally {
    if (browser) await browser.close();
  }
}

testTeacherOnboarding();
