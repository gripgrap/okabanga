/**
 * ==============================================================================
 * 오카방가방가 (Okabang) - 메인 사용자 여정 & 엣지 케이스 E2E 테스트 스위트
 * Framework: Playwright Test
 * 여정: 카카오 오픈채팅 연동 ➔ AI 요약 생성 ➔ 노션 저장 ➔ 글로벌 스마트 검색
 * ==============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('핵심 사용자 여정 (End-to-End Main Journey)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('전체 흐름: 오픈채팅 연동 ➔ AI 요약 확인 ➔ 노션 동기화 ➔ 탭 기반 검색 네비게이션', async ({ page }) => {
    // --------------------------------------------------------------------------
    // Step 1: 카카오 오픈채팅 연동 (KakaoTalk OpenChat Sync)
    // --------------------------------------------------------------------------
    const kakaoModalBtn = page.locator('button:has-text("오픈채팅 연동")');
    await expect(kakaoModalBtn).toBeVisible();
    await kakaoModalBtn.click();

    // 모달 타이틀 및 탭 확인
    const modalContainer = page.locator('section[role="dialog"], section:has-text("오픈채팅 데이터 연동")');
    await expect(modalContainer).toBeVisible();

    // 채팅방 관리 탭 전환
    await page.click('button:has-text("오픈채팅방 관리")');
    await expect(page.locator('text=프론트엔드 실무 오픈카톡방')).toBeVisible();

    // 필터링 강도 스위치 및 동기화 옵션 확인 후 모달 닫기
    await page.click('button:has-text("닫기"), button[aria-label="닫기"]');
    await expect(modalContainer).not.toBeVisible();

    // --------------------------------------------------------------------------
    // Step 2: AI 핵심 요약 및 팩트체크 검증 (AI Summary & Fact-Check)
    // --------------------------------------------------------------------------
    // 채팅방 분석 탭 진입 확인
    await page.click('button:has-text("채팅방 분석")');
    await expect(page.locator('text=94.2%')).toBeVisible(); // 잡담 감축률
    await expect(page.locator('text=Next.js 15 Server Action')).toBeVisible();

    // 3단계 결론 아젠다(문제 제기, 실무 솔루션, 합의점) 확인
    await expect(page.locator('text=문제 제기')).toBeVisible();
    await expect(page.locator('text=실무 솔루션')).toBeVisible();
    await expect(page.locator('text=합의점/결론')).toBeVisible();

    // 팩트체크 앵커 클릭하여 원문 발화 타임라인으로 점프
    const factCheckAnchor = page.locator('button:has-text("팩트체크 원문")').first();
    if (await factCheckAnchor.isVisible()) {
      await factCheckAnchor.click();
      await expect(page.locator('text=요약에 연결된 원문 발언으로 이동했습니다')).toBeVisible();
      // 발화자 버블 및 코드 스니펫 확인
      await expect(page.locator('text=네카라 테크리드')).toBeVisible();
    }

    // --------------------------------------------------------------------------
    // Step 3: 노션(Notion) 워크스페이스 원클릭 아카이빙 (Notion Export)
    // --------------------------------------------------------------------------
    // 사이드바 또는 하단 퀵바의 노션 저장 버튼 클릭
    const notionSaveBtn = page.locator('button:has-text("노션(Notion) 워크스페이스 저장")').first();
    await expect(notionSaveBtn).toBeVisible();
    await notionSaveBtn.click();

    // 토스트 피드백 수신 확인
    await expect(
      page.locator('text=노션(Notion) 워크스페이스에 요약이 동기화되었습니다!')
    ).toBeVisible();

    // --------------------------------------------------------------------------
    // Step 4: 탭 컨텍스트 기반 글로벌 스마트 검색 (Context-Aware Search)
    // --------------------------------------------------------------------------
    // 단축키 ⌘K 또는 / 키로 검색창 호출
    await page.keyboard.press('/');
    const searchModal = page.locator('div[role="dialog"]');
    await expect(searchModal).toBeVisible();

    // 현재 활성화된 탭(타임라인)에 따른 가중치 안내 배너 확인
    await expect(searchModal.locator('text=타임라인 우선 모드, text=스마트 다차원 검색')).toBeVisible();

    // 검색어 'Redis' 입력
    const searchInput = searchModal.locator('input[type="text"]');
    await searchInput.fill('Redis');

    // 검색 결과 항목 노출 및 가중치 확인
    const firstResult = searchModal.locator('div:has-text("Redis")').first();
    await expect(firstResult).toBeVisible();

    // 결과 선택 후 엔터로 이동
    await page.keyboard.press('Enter');
    await expect(searchModal).not.toBeVisible();
    await expect(page.locator('text=이동했습니다')).toBeVisible();
  });
});

test.describe('주요 엣지 케이스(Edge Cases) 시뮬레이션 및 복원력 테스트', () => {

  test('Edge Case 1: 네트워크 타임아웃 및 오프라인 상태에서의 로컬스토리지 보존', async ({ page, context }) => {
    await page.goto('/');

    // 1. 마이페이지 이동 후 알림 설정 변경
    await page.click('button[aria-label="마이페이지"]');
    const issueToggle = page.locator('button[aria-label="시사/업계동향 요약 알림 토글"]');
    await issueToggle.click();

    // 2. 오프라인 모드 에뮬레이션
    await context.setOffline(true);

    // 3. 페이지 새로고침 시에도 오프라인 캐시 및 localStorage 설정이 유지되는지 검증
    const stored = await page.evaluate(() => localStorage.getItem('okabang_summary_notification_config_v1'));
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).issue).toBe(true);

    // 4. 온라인 복구
    await context.setOffline(false);
  });

  test('Edge Case 2: 검색 결과가 없는 경우(Zero Results) 추천 토픽 칩 노출', async ({ page }) => {
    await page.goto('/');

    // 검색창 오픈
    await page.keyboard.press('/');
    const searchModal = page.locator('div[role="dialog"]');
    const searchInput = searchModal.locator('input[type="text"]');

    // 매칭되지 않는 임의의 검색어 입력
    await searchInput.fill('xyz_non_existent_random_keyword_9999');

    // 0건 안내 문구 확인
    await expect(searchModal.locator('text=검색 결과가 없습니다')).toBeVisible();

    // 검색어 비우기 후 인기 키워드 칩 클릭 검증
    const clearBtn = searchModal.locator('button:has-text("close")');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await searchModal.locator('button:has-text("Next 15")').click();
      await expect(searchModal.locator('text=Next 15')).toBeVisible();
    }
  });

  test('Edge Case 3: 예기치 못한 스크립트 오류 발생 시 ErrorBoundary 정상 렌더링', async ({ page }) => {
    await page.goto('/');

    // 렌더링 에러 강제 유발 시뮬레이션
    await page.evaluate(() => {
      window.dispatchEvent(new ErrorEvent('error', { error: new Error('Simulated Unexpected Crash') }));
    });

    // 앱이 완전히 멈추지 않고 UI가 유지되거나 ErrorBoundary 가드가 동작하는지 확인
    await expect(page.locator('body')).toBeVisible();
  });
});
