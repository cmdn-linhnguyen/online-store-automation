import { test, expect } from '@fixtures/test-base';
import { eticketData } from '@test-data/eticket.data';
import { testTags } from '@utils/test-tags';

const { discountCodes, ticketKindName } = eticketData;

test.describe(`ETicket | List ${testTags.regression}`, () => {
  test.describe('SEO & breadcrumb', () => {
    test(`should show the SEO title ending with the brand name ${testTags.smoke}`, async ({ eticketPage, page }) => {
      // ID-00120 — no discount_code needed; the <title> is shared with Search.
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      await expect(page).toHaveTitle(new RegExp(`${eticketData.seoTitleSuffix}\\s*$`));
    });

    test('should show the breadcrumb as Home / マイページ / My Ticket / {ticketKindName}', async ({ eticketPage }) => {
      // ID-00121
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      await eticketPage.expectBreadcrumb([...eticketData.breadcrumbLabels, ticketKindName.type1]);
    });
  });

  test.describe('eTicket types', () => {
    const types = [
      { id: 'ID-00122', code: discountCodes.type1, name: ticketKindName.type1, smoke: true },
      { id: 'ID-00123', code: discountCodes.type2, name: ticketKindName.type2, smoke: false },
      { id: 'ID-00124', code: discountCodes.type3, name: ticketKindName.type3, smoke: false },
    ] as const;

    for (const type of types) {
      const title = `should render the ${type.id} eTicket list with its ticket-kind title${
        type.smoke ? ` ${testTags.smoke}` : ''
      }`;

      test(title, async ({ eticketPage }) => {
        await eticketPage.goto({ discount_code: type.code });

        await test.step('The ticket-kind title from the coupon condition is shown', async () => {
          await eticketPage.expectTicketKindName(type.name);
        });

        await test.step('The product list renders at least one item', async () => {
          await expect(eticketPage.productList.cards.first()).toBeVisible();
          expect(await eticketPage.productList.cards.count()).toBeGreaterThan(0);
        });
      });
    }
  });

  test.describe('search form & result field UI', () => {
    test('should render the default sidebar filter sections', async ({ eticketPage }) => {
      // ID-00125
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      for (const section of eticketData.desktopDefaultSections) {
        await eticketPage.expectSidebarSectionVisible(section, 'desktop');
      }
    });

    test(`should render name, price, and image for each product card ${testTags.smoke}`, async ({ eticketPage }) => {
      // ID-00126 / ID-00134
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      await test.step('Every card shows a non-empty product name', async () => {
        await eticketPage.productList.expectAllCardsHaveNames();
      });

      await test.step('At least one price renders in the expected currency format', async () => {
        await eticketPage.productList.expectSomePriceIsFormattedCorrectly();
      });

      await test.step('At least one card has a real product image', async () => {
        await eticketPage.productList.expectSomeImageHasSrc();
      });
    });

    test('should render card tags when present (ROASTERY TOKYO / online-store / limited-store)', async ({
      eticketPage,
    }) => {
      // ID-00135 — assert-if-present: whether a given badge appears depends on the live catalog, so
      // we don't force a specific product to carry one. Instead, wherever a badge *does* render we
      // assert every instance is a real, non-empty tag — a broken/blank badge still fails the test.
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      const badges = {
        roasteryTokyo: eticketPage.productList.root.locator('.products-tag-02'),
        onlineStore: eticketPage.productList.root.locator('.products-tag-01--online-store'),
        // 限定店舗 ("Limits Store") shares the bare `.products-tag-01` class with the online-store
        // tag, so exclude the online-store modifier to target only the limited-store badge.
        limitedStore: eticketPage.productList.root.locator(
          '.products-tag-01:not(.products-tag-01--online-store)',
        ),
      };

      for (const badge of Object.values(badges)) {
        const texts = await badge.allTextContents();

        texts.forEach(text => expect(text.trim().length).toBeGreaterThan(0));
      }
    });
  });

  test.describe('filter tags & search behavior', () => {
    test('should show a removable filter tag and drop it from the URL when removed', async ({ eticketPage }) => {
      // ID-00128
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      await eticketPage.selectFilterOption('ブランド', eticketData.brand.starbucksCoffee.label, 'desktop');
      await eticketPage.expectQueryParamValue('brand_code', eticketData.brand.starbucksCoffee.value);
      await eticketPage.sidebarFilter.expectTagVisible(eticketData.brand.starbucksCoffee.label);

      await eticketPage.sidebarFilter.removeTag(eticketData.brand.starbucksCoffee.label);
      await eticketPage.expectQueryParamMissing('brand_code');
      await eticketPage.sidebarFilter.expectTagAbsent(eticketData.brand.starbucksCoffee.label);
    });

    test('should search by category and keep the discount_code', async ({ eticketPage }) => {
      // ID-00129 — data-agnostic: assert the mechanism (URL param + code preserved), not a named item.
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      await eticketPage.selectCategory(eticketData.categories.beans.label, 'desktop');
      await eticketPage.expectQueryParamValue('category_code', eticketData.categories.beans.value);
      await eticketPage.expectQueryParamValue('discount_code', discountCodes.type1);
    });

    test('should honor an inventory (在庫あり) deep-link and keep the discount_code', async ({ eticketPage }) => {
      // ID-00130 — the online-store checkbox is a multi-value input whose param is reconstructed on
      // load; a deep-link is the stable, data-agnostic way to prove inventory search works (the
      // section stays, the param is honored, and the discount_code is preserved).
      await eticketPage.goto({
        discount_code: discountCodes.type1,
        [eticketData.onlineStore.inventoryQuantity.param]: 'true',
      });

      await eticketPage.expectQueryParamValue(eticketData.onlineStore.inventoryQuantity.param, 'true');
      await eticketPage.expectQueryParamValue('discount_code', discountCodes.type1);
      await eticketPage.expectSidebarSectionVisible('オンラインストア', 'desktop');
    });

    test('should search by another condition (brand)', async ({ eticketPage }) => {
      // ID-00131
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      await eticketPage.selectFilterOption('ブランド', eticketData.brand.starbucksCoffee.label, 'desktop');
      await eticketPage.expectQueryParamValue('brand_code', eticketData.brand.starbucksCoffee.value);
      await eticketPage.expectQueryParamValue('discount_code', discountCodes.type1);
    });

    test('should combine multiple search conditions (category + inventory) via deep-link', async ({ eticketPage }) => {
      // ID-00132 — multi-condition: a category + inventory deep-link keeps every param together
      // (beans is in CATEGORIES_HAVE_FILTER.onlineStore, so the inventory param survives the
      // mount-time category-based filter cleanup), with the discount_code preserved.
      await eticketPage.goto({
        discount_code: discountCodes.type1,
        category_code: eticketData.categories.beans.value,
        [eticketData.onlineStore.inventoryQuantity.param]: 'true',
      });

      await eticketPage.expectQueryParamValue('category_code', eticketData.categories.beans.value);
      await eticketPage.expectQueryParamValue(eticketData.onlineStore.inventoryQuantity.param, 'true');
      await eticketPage.expectQueryParamValue('discount_code', discountCodes.type1);
    });
  });

  test.describe('redirection', () => {
    test(`should navigate to the product detail with discount_code when a card is clicked ${testTags.smoke}`, async ({
      eticketPage,
      page,
    }) => {
      // ID-00133
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      const href = await eticketPage.clickCard(0);

      expect(href).toContain(`discount_code=${discountCodes.type1}`);
      await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    });
  });

  test.describe('pagination', () => {
    test('should keep the discount_code when navigating to page 2', async ({ eticketPage, page }) => {
      // ID-00136
      await eticketPage.goto({ discount_code: discountCodes.multiPage });

      await Promise.all([page.waitForURL(/page=2/), eticketPage.pagination.goToPage('2')]);

      await eticketPage.expectLoaded();
      await eticketPage.expectQueryParamValue('page', '2');
      await eticketPage.expectQueryParamValue('discount_code', discountCodes.multiPage);
    });

    test('should disable prev on the first page and next on the last page', async ({ eticketPage }) => {
      await eticketPage.goto({ discount_code: discountCodes.multiPage });
      await eticketPage.pagination.expectPrevDisabled();

      const lastPage = await eticketPage.pagination.lastPageValue();

      await eticketPage.goto({ discount_code: discountCodes.multiPage, page: lastPage });
      await eticketPage.pagination.expectNextDisabled();
    });
  });

  test.describe('empty state', () => {
    test(`should show the no-result page for an invalid discount_code ${testTags.smoke}`, async ({ eticketPage }) => {
      // ID-00137
      await eticketPage.goto({ discount_code: discountCodes.invalid });

      await eticketPage.expectEmptyState();
      await eticketPage.productList.expectEmpty();
      await eticketPage.pagination.expectHidden();
    });
  });

  test.describe('mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should open the filter drawer when tapping the 絞り込み button', async ({ eticketPage }) => {
      // ID-00127 — the SP filter button only renders alongside results, so a valid code is used.
      await eticketPage.goto({ discount_code: discountCodes.type1 });

      await eticketPage.openMobileSidebar();
      await expect(eticketPage.sidebarFilter.mobileRoot).toHaveClass(/show/);
      await expect(eticketPage.sidebarFilter.mobileOverlay).toBeVisible();
    });
  });
});
