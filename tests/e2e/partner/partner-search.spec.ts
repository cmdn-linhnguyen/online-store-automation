import { expect } from '@playwright/test';

import { test } from '@fixtures/test-base';
import { testTags } from '@utils/test-tags';

test.describe(`Partner Search | /partner, /partner/roastery, /partner/limited ${testTags.regression}`, () => {
  test.describe('/partner/roastery', () => {
    test(`should render a product list with count, names, prices, and images ${testTags.smoke}`, async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('roastery');

      await test.step('Result count heading shows a positive number', async () => {
        await partnerSearchPage.expectResultCountGreaterThan(0);
      });

      await test.step('Every card shows a non-empty product name', async () => {
        await partnerSearchPage.productList.expectAllCardsHaveNames();
      });

      await test.step('At least one card shows a correctly formatted price', async () => {
        await partnerSearchPage.productList.expectSomePriceIsFormattedCorrectly();
      });

      await test.step('At least one card has a real image src', async () => {
        await partnerSearchPage.productList.expectSomeImageHasSrc();
      });
    });

    test('should show the breadcrumb Home > パートナー販売 > ROASTERY TOKYO', async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('roastery');

      await partnerSearchPage.expectBreadcrumb([
        'Home',
        'パートナー販売',
        'STARBUCKS RESERVE® ROASTERY TOKYO',
      ]);
    });

    test('should not render a sidebar filter', async ({ partnerSearchPage }) => {
      await partnerSearchPage.goto('roastery');

      await partnerSearchPage.expectNoSidebar();
    });

    test('ROASTERY TOKYO brand badge should appear on at least one product card (assert-if-present)', async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('roastery');

      const cardCount = await partnerSearchPage.productList.cards.count();

      if (cardCount === 0) {
        // Live catalog returned no products — skip assertion rather than fail.
        return;
      }

      const badgeCount = await partnerSearchPage.roasteryTokyoBadges().count();

      expect(badgeCount).toBeGreaterThan(0);
      await expect(partnerSearchPage.roasteryTokyoBadges().first()).toHaveText('ROASTERY TOKYO');
    });

    test('clicking a product card should navigate to /partner/{code}', async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('roastery');

      const href = await partnerSearchPage.productList.clickCard(0);

      await expect(partnerSearchPage.page).toHaveURL(/\/partner\/\d+/);
      expect(href).toMatch(/^\/partner\/\d+$/);
    });

    test('pagination should render when result count > 0, prev disabled on page 1', async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('roastery');

      await test.step('Result count > 0 so pagination is expected', async () => {
        await partnerSearchPage.expectResultCountGreaterThan(0);
      });

      await test.step('Pagination root is visible', async () => {
        await expect(partnerSearchPage.pagination.root).toBeVisible();
      });

      await test.step('Prev button is disabled on page 1', async () => {
        await partnerSearchPage.pagination.expectPrevDisabled();
      });
    });

    test('no custom-bottle tags should be rendered on partner pages', async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('roastery');

      await partnerSearchPage.expectNoCustomBottleTags();
    });
  });

  test.describe('/partner/limited', () => {
    test('should render a product list with correct breadcrumb', async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('limited');

      await test.step('At least one product card is visible', async () => {
        await expect(partnerSearchPage.productList.cards.first()).toBeVisible();
      });

      await test.step('Breadcrumb shows Home > パートナー販売 > 限定', async () => {
        await partnerSearchPage.expectBreadcrumb(['Home', 'パートナー販売', '限定']);
      });
    });

    test('should not render a sidebar filter', async ({ partnerSearchPage }) => {
      await partnerSearchPage.goto('limited');

      await partnerSearchPage.expectNoSidebar();
    });

    test('clicking a product card should navigate to /partner/{code}', async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('limited');

      const href = await partnerSearchPage.productList.clickCard(0);

      await expect(partnerSearchPage.page).toHaveURL(/\/partner\/\d+/);
      expect(href).toMatch(/^\/partner\/\d+$/);
    });

    test('limited-store tag should appear on at least one card (assert-if-present)', async ({
      partnerSearchPage,
    }) => {
      await partnerSearchPage.goto('limited');

      const cardCount = await partnerSearchPage.productList.cards.count();

      if (cardCount === 0) {
        // Live catalog returned no products — skip assertion rather than fail.
        return;
      }

      const tagCount = await partnerSearchPage.limitedStoreTags().count();

      expect(tagCount).toBeGreaterThan(0);
      await expect(partnerSearchPage.limitedStoreTags().first()).toContainText('限定');
    });
  });
});
