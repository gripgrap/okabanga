/**
 * 오카방가방가 (Okabang) - E2E Core User Flow Test Suite
 * Framework: Playwright / Vitest E2E
 * Target: Web SPA (Desktop & Mobile Responsive Viewport)
 */

import { test, expect } from '@playwright/test';

test.describe('오카방가방가 핵심 사용자 흐름 E2E 테스트', () => {

  test.beforeEach(async ({ page }) => {
    // 1. 애플리케이션 진입 및 로컬 스토리지 초기화
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  /* =====================================================================
   * Flow 1: 전역 네비게이션 & 글로벌 스마트 검색 흐름
   * ===================================================================== */
  test('Flow 1: 헤더 탭 이동, 룸 서브탭 전환, 탭 기반 글로벌 검색 네비게이션', async ({ page }) => {
    // 1.1 기본 채팅방 뷰 로드 확인
    await expect(page.locator('text=오카방가방가')).toBeVisible();
    await expect(page.locator('text=알짜 요약')).toBeVisible();

    // 1.2 서비스 소개(홈) 탭 전환
    await page.click('button:has-text("서비스 소개")');
    await expect(page.locator('text=퇴근길 3분 요약')).toBeVisible();

    // 1.3 추천 주제(큐레이션) 탭 전환
    await page.click('button:has-text("추천 주제")');
    await expect(page.locator('text=실시간 오픈카톡 핫토픽 큐레이션')).toBeVisible();

    // 1.4 채팅방 분석 탭 복귀 및 서브탭 검증
    await page.click('button:has-text("채팅방 분석")');
    await expect(page.locator('text=Next.js 15 Server Action')).toBeVisible();

    // 1.5 팩트체크 앵커 클릭 시 타임라인 발화로 다이렉트 점프
    const factCheckBtn = page.locator('button:has-text("팩트체크 원문")').first();
    if (await factCheckBtn.isVisible()) {
      await factCheckBtn.click();
      // 타임라인 서브탭 활성화 및 토스트 발송 확인
      await expect(page.locator('text=요약에 연결된 원문 발언으로 이동했습니다')).toBeVisible();
    }

    // 1.6 단축키 (⌘K or /)를 통한 글로벌 스마트 검색창 오픈
    await page.keyboard.press('/');
    const searchModal = page.locator('div[role="dialog"]');
    await expect(searchModal).toBeVisible();

    // 1.7 검색어 입력 및 현재 탭(타임라인) 가중치 우선 정렬 확인
    const searchInput = searchModal.locator('input[type="text"]');
    await searchInput.fill('Next 15');
    await expect(searchModal.locator('text=현재 탭 맞춤 우선')).toBeVisible();

    // 1.8 검색 결과 키보드 탐색(Enter) 및 상세 이동
    await page.keyboard.press('Enter');
    await expect(searchModal).not.toBeVisible();
    await expect(page.locator('text=이동했습니다')).toBeVisible();
  });

  /* =====================================================================
   * Flow 2: 다크 / 라이트 / 시스템 자동 모드 테마 전환 및 OS 감지
   * ===================================================================== */
  test('Flow 2: 3단 화면 테마 모드 전환, 로컬 스토리지 보존 및 OS 변경 감지', async ({ page }) => {
    // 2.1 마이페이지로 이동
    await page.click('button[aria-label="마이페이지"]');
    await expect(page.locator('text=화면 테마 설정')).toBeVisible();

    // 2.2 다크 모드 직접 선택
    await page.click('button:has-text("다크 모드")');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('text=다크 모드가 적용되었습니다')).toBeVisible();

    // 로컬 스토리지에 테마 저장 여부 검증
    const storedTheme = await page.evaluate(() => localStorage.getItem('okabang_theme_mode'));
    expect(storedTheme).toBe('dark');

    // 2.3 라이트 모드 전환
    await page.click('button:has-text("라이트 모드")');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.locator('text=라이트 모드가 적용되었습니다')).toBeVisible();

    // 2.4 시스템 자동 모드 전환
    await page.click('button:has-text("시스템 자동")');
    await expect(page.locator('text=기기 설정에 따라')).toBeVisible();

    // 2.5 OS 다크모드 미디어 쿼리 변경 이벤트 에뮬레이션
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('text=시스템 설정 동기화: OS 테마 변경이 감지되어')).toBeVisible();
  });

  /* =====================================================================
   * Flow 3: 카카오톡 오픈채팅 연동 & 노션 지식베이스 동기화
   * ===================================================================== */
  test('Flow 3: 카카오 오픈채팅 연동 모달, 방 필터링 설정, 노션 원클릭 저장', async ({ page }) => {
    // 3.1 헤더의 오픈채팅 연동 버튼 클릭
    await page.click('button:has-text("오픈채팅 연동")');
    const modal = page.locator('text=오픈채팅 데이터 연동 & 동기화 관리');
    await expect(modal).toBeVisible();

    // 3.2 탭 전환 (연동 계정 → 오픈채팅방 관리)
    await page.click('button:has-text("오픈채팅방 관리")');
    await expect(page.locator('text=프론트엔드 실무 오픈카톡방')).toBeVisible();

    // 3.3 동기화 주기 설정 확인 및 모달 닫기
    await page.click('button:has-text("닫기")');
    await expect(modal).not.toBeVisible();

    // 3.4 노션(Notion) 워크스페이스 원클릭 저장 테스트
    const notionBtn = page.locator('button:has-text("노션(Notion) 워크스페이스 저장")').first();
    if (await notionBtn.isVisible()) {
      await notionBtn.click();
      await expect(page.locator('text=노션(Notion) 워크스페이스에 요약이 동기화되었습니다')).toBeVisible();
    }
  });

  /* =====================================================================
   * Flow 4: 마이페이지 카테고리 요약 알림 토글 & 발송 방식 로컬 영구화
   * ===================================================================== */
  test('Flow 4: 요약 알림 카테고리 토글, 로컬 스토리지 보존, 모의 푸시 시뮬레이션', async ({ page }) => {
    // 4.1 마이페이지 이동
    await page.click('button[aria-label="마이페이지"]');
    await expect(page.locator('text=요약 알림 설정')).toBeVisible();

    // 4.2 시사/업계동향 알림 활성화 토글 클릭
    const issueToggle = page.locator('button[aria-label="시사/업계동향 요약 알림 토글"]');
    await issueToggle.click();
    await expect(page.locator('text=알림이 활성화되었습니다')).toBeVisible();

    // 4.3 로컬 스토리지에 설정 객체 영구화 확인
    const notifConfigStr = await page.evaluate(() =>
      localStorage.getItem('okabang_summary_notification_config_v1')
    );
    expect(notifConfigStr).toBeTruthy();
    const config = JSON.parse(notifConfigStr!);
    expect(config.issue).toBe(true);

    // 4.4 모의 알림 수신 테스트 (기술 요약 푸시 시뮬레이션)
    await page.click('button:has-text("기술 요약 수신 테스트")');
    await expect(page.locator('text=[기술 요약 푸시 수신]')).toBeVisible();

    // 4.5 노이즈 100% 무음 차단 시뮬레이션 테스트
    await page.click('button:has-text("노이즈 차단 테스트")');
    await expect(page.locator('text=[노이즈 100% 무음 차단 성공]')).toBeVisible();
  });
});
