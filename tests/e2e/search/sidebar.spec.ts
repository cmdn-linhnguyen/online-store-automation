import { test, expect } from '@fixtures/test-base';
import { searchData } from '@test-data/search.data';
import { testTags } from '@utils/test-tags';

test.describe(`Search | Sidebar ${testTags.regression}`, () => {
  test.describe('desktop', () => {
    test.use({ viewport: { width: 1280, height: 960 } });

    test('should apply category filters immediately and toggle dependent sections', async ({
      searchPage,
      page,
    }) => {
      await test.step('Open search page and verify default sidebar sections', async () => {
        await searchPage.goto();

        for (const section of searchData.desktopDefaultSections) {
          await searchPage.expectSidebarSectionVisible(section, 'desktop');
        }
      });

      await test.step('Select beverage category and apply immediately via URL change', async () => {
        await Promise.all([
          page.waitForURL(
            new RegExp(`${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beverage.value}`),
          ),
          searchPage.selectCategory(searchData.categories.beverage.label, 'desktop'),
        ]);

        await searchPage.expectLoaded();
        await searchPage.expectQueryParamValue('category_code', searchData.categories.beverage.value);
      });

      await test.step('Hide sections that are not supported for beverage category', async () => {
        await searchPage.expectSidebarSectionHidden('オンラインストア', 'desktop');
        await searchPage.expectSidebarSectionHidden('価格', 'desktop');
        await searchPage.expectSidebarSectionVisible('ブランド', 'desktop');
      });

      await expect(page).toHaveURL(
        new RegExp(`${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beverage.value}`),
      );
    });

    test('should reveal coffee-specific filters for beans category', async ({ searchPage, page }) => {
      await searchPage.goto();

      await Promise.all([
        page.waitForURL(
          new RegExp(`${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beans.value}`),
        ),
        searchPage.selectCategory(searchData.categories.beans.label, 'desktop'),
      ]);

      await searchPage.expectLoaded();
      await searchPage.expectQueryParamValue('category_code', searchData.categories.beans.value);

      for (const section of searchData.beansSections) {
        await searchPage.expectSidebarSectionVisible(section, 'desktop');
      }

      await searchPage.expectSidebarSectionHidden('商品仕様', 'desktop');
      await expect(page).toHaveURL(
        new RegExp(`${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beans.value}`),
      );
    });

    test('should drop paging when applying a new desktop category filter', async ({ searchPage, page }) => {
      await searchPage.goto({ page: '3' });
      await searchPage.expectQueryParamValue('page', '3');

      await Promise.all([
        page.waitForURL(
          new RegExp(`${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beans.value}$`),
        ),
        searchPage.selectCategory(searchData.categories.beans.label, 'desktop'),
      ]);

      await searchPage.expectLoaded();
      await searchPage.expectQueryParamValue('category_code', searchData.categories.beans.value);
      await searchPage.expectQueryParamMissing('page');
      await expect(page).toHaveURL(
        new RegExp(`${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beans.value}$`),
      );
    });

    test('should apply the purchase-location filter, which stays visible regardless of category', async ({
      searchPage,
    }) => {
      await searchPage.goto();

      await test.step('Purchase location is visible on the default (no-category) view', async () => {
        await searchPage.expectSidebarSectionVisible('取り扱い場所', 'desktop');
      });

      const selectedValue = await searchPage.sidebarFilter.selectFirstOptionInSection('取り扱い場所', 'desktop');
      await searchPage.expectQueryParamValue('purchase_methods', selectedValue);

      await test.step('Purchase location stays visible even under a category that hides other sections', async () => {
        await searchPage.goto({ category_code: searchData.categories.beverage.value });
        await searchPage.expectSidebarSectionVisible('取り扱い場所', 'desktop');
      });
    });

    test(`should apply brand and price as independent single-select filters and combine price with a category ${testTags.smoke}`, async ({
      searchPage,
    }) => {
      await test.step('Brand applies, then resets back to "all" (other brands disable once one is active)', async () => {
        await searchPage.goto();
        await searchPage.selectFilterOption('ブランド', searchData.brand.starbucksCoffee.label, 'desktop');
        await searchPage.expectQueryParamValue('brand_code', searchData.brand.starbucksCoffee.value);

        await searchPage.selectFilterOption('ブランド', 'すべて', 'desktop');
        await searchPage.expectQueryParamMissing('brand_code');
      });

      await test.step('Price replaces its own previous selection', async () => {
        await searchPage.selectFilterOption('価格', searchData.price.under1000.label, 'desktop');
        await searchPage.expectQueryParamValue('price', searchData.price.under1000.value);

        await searchPage.selectFilterOption('価格', searchData.price.over5000.label, 'desktop');
        await searchPage.expectQueryParamValue('price', searchData.price.over5000.value);
      });

      await test.step('Category and price apply together', async () => {
        await searchPage.selectCategory(searchData.categories.beans.label, 'desktop');
        await searchPage.expectQueryParamValue('category_code', searchData.categories.beans.value);
        await searchPage.expectQueryParamValue('price', searchData.price.over5000.value);
      });
    });

    test('should toggle both online-store checkboxes independently and together', async ({ searchPage }) => {
      await searchPage.goto();

      await searchPage.selectFilterOption('オンラインストア', searchData.onlineStore.inventoryQuantity.label, 'desktop');
      await searchPage.expectQueryParamValue(searchData.onlineStore.inventoryQuantity.param, 'true');
      await searchPage.expectQueryParamMissing(searchData.onlineStore.onlineStoreOnly.param);

      await searchPage.selectFilterOption('オンラインストア', searchData.onlineStore.onlineStoreOnly.label, 'desktop');
      await searchPage.expectQueryParamValue(searchData.onlineStore.inventoryQuantity.param, 'true');
      await searchPage.expectQueryParamValue(searchData.onlineStore.onlineStoreOnly.param, 'true');
    });

    test('should combine multiple checkboxes within one bean-classification section', async ({ searchPage }) => {
      await searchPage.goto({ category_code: searchData.categories.beans.value });

      await searchPage.selectFilterOption('スターバックスロースト', searchData.beanClassification.blonde.label, 'desktop');
      await searchPage.selectFilterOption('スターバックスロースト', searchData.beanClassification.dark.label, 'desktop');

      await searchPage.expectQueryParamContainsAll('bean_classification', [
        searchData.beanClassification.blonde.value,
        searchData.beanClassification.dark.value,
      ]);
    });

    test('should only show the 商品仕様 section for tumbler/mug categories', async ({ searchPage }) => {
      await searchPage.goto({ category_code: searchData.categories.beans.value });
      await searchPage.expectSidebarSectionHidden('商品仕様', 'desktop');

      await searchPage.goto({ category_code: searchData.categories.tumblerMug.value });
      await searchPage.expectSidebarSectionVisible('商品仕様', 'desktop');
    });

    test('should drop a filter param from the URL when selecting a category that hides its section', async ({
      searchPage,
    }) => {
      // No category selected yet, so the full top-level category list (incl. beverage) is
      // clickable in the sidebar — once a category is selected, the sidebar narrows to just that
      // category's own subtree and other top-level categories are no longer reachable by click.
      await searchPage.goto({ price: searchData.price.under1000.value });
      await searchPage.expectQueryParamValue('price', searchData.price.under1000.value);

      await searchPage.selectCategory(searchData.categories.beverage.label, 'desktop');
      await searchPage.expectQueryParamValue('category_code', searchData.categories.beverage.value);
      await searchPage.expectQueryParamMissing('price');
    });
  });

  test.describe('applied filter tags', () => {
    test.use({ viewport: { width: 1280, height: 960 } });

    test(`should show one removable tag per applied filter and remove only the deleted one ${testTags.smoke}`, async ({
      searchPage,
    }) => {
      await searchPage.goto();
      await searchPage.selectCategory(searchData.categories.beans.label, 'desktop');
      await searchPage.selectFilterOption('ブランド', searchData.brand.starbucksCoffee.label, 'desktop');

      await test.step('Both filters show up as tags', async () => {
        await searchPage.sidebarFilter.expectTagVisible(searchData.categories.beans.label);
        await searchPage.sidebarFilter.expectTagVisible(searchData.brand.starbucksCoffee.label);
      });

      await test.step('Removing the brand tag keeps the category filter intact', async () => {
        await searchPage.sidebarFilter.removeTag(searchData.brand.starbucksCoffee.label);
        await searchPage.expectQueryParamMissing('brand_code');
        await searchPage.expectQueryParamValue('category_code', searchData.categories.beans.value);
        await searchPage.sidebarFilter.expectTagVisible(searchData.categories.beans.label);
        await searchPage.sidebarFilter.expectTagAbsent(searchData.brand.starbucksCoffee.label);
      });
    });
  });

  test.describe('mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should defer filter application until submit in the mobile drawer', async ({
      searchPage,
      page,
    }) => {
      await searchPage.goto();
      await searchPage.openMobileSidebar();

      await test.step('Selecting a category should not update URL before submit', async () => {
        await searchPage.selectCategory(searchData.categories.beans.label, 'mobile');
        await searchPage.expectQueryParamMissing('category_code');
      });

      await test.step('Submitting filters should update URL and reset paging', async () => {
        await Promise.all([
          page.waitForURL(
            new RegExp(
              `${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beans.value}&page=1`,
            ),
          ),
          searchPage.submitMobileFilters(),
        ]);

        await searchPage.expectLoaded();
        await searchPage.expectQueryParamValue('category_code', searchData.categories.beans.value);
        await searchPage.expectQueryParamValue('page', '1');
      });

      await test.step('Drawer should be closed after submit on the refreshed page', async () => {
        await searchPage.expectMobileSidebarClosed();
      });

      await expect(page).toHaveURL(
        new RegExp(
          `${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beans.value}&page=1`,
        ),
      );
    });

    test('should close the mobile drawer without mutating URL when dismissed', async ({ searchPage, page }) => {
      await searchPage.goto();
      await searchPage.openMobileSidebar();
      await searchPage.selectCategory(searchData.categories.beans.label, 'mobile');

      await searchPage.mobileCloseSidebarButton.click();
      await searchPage.expectMobileSidebarClosed();
      await searchPage.expectQueryParamMissing('category_code');
      await expect(page).toHaveURL(new RegExp(`${searchData.path.replace('/', '\\/')}$`));
    });

    test('should close the mobile drawer without mutating URL when the overlay backdrop is clicked', async ({
      searchPage,
    }) => {
      await searchPage.goto();
      await searchPage.openMobileSidebar();
      await searchPage.selectCategory(searchData.categories.beans.label, 'mobile');

      await searchPage.sidebarFilter.closeMobileViaOverlay();
      await searchPage.expectMobileSidebarClosed();
      await searchPage.expectQueryParamMissing('category_code');
    });

    test('should keep unsubmitted selections checked after closing and reopening the drawer', async ({
      searchPage,
    }) => {
      await searchPage.goto();
      await searchPage.openMobileSidebar();
      await searchPage.selectCategory(searchData.categories.beans.label, 'mobile');

      await searchPage.mobileCloseSidebarButton.click();
      await searchPage.expectMobileSidebarClosed();

      await searchPage.openMobileSidebar();
      await searchPage.sidebarFilter.expectOptionChecked('カテゴリー', searchData.categories.beans.label, 'mobile');
    });

    test('should submit multiple filters selected in the drawer together', async ({ searchPage, page }) => {
      await searchPage.goto();
      await searchPage.openMobileSidebar();
      await searchPage.selectCategory(searchData.categories.beans.label, 'mobile');
      await searchPage.selectFilterOption('ブランド', searchData.brand.teavana.label, 'mobile');

      await Promise.all([
        page.waitForURL(
          new RegExp(`${searchData.path.replace('/', '\\/')}\\?category_code=${searchData.categories.beans.value}`),
        ),
        searchPage.submitMobileFilters(),
      ]);

      await searchPage.expectLoaded();
      await searchPage.expectQueryParamValue('category_code', searchData.categories.beans.value);
      await searchPage.expectQueryParamValue('brand_code', searchData.brand.teavana.value);
    });
  });
});
