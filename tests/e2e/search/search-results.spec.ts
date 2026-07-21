import { test, expect } from '@fixtures/test-base';
import { searchData } from '@test-data/search.data';
import { testTags } from '@utils/test-tags';

test.describe(`Search | Results ${testTags.regression}`, () => {
  test.describe('search bar', () => {
    test(`should keep the URL unchanged while typing and only navigate on submit ${testTags.smoke}`, async ({
      searchPage,
      page,
    }) => {
      await searchPage.goto({ page: '2' });
      await searchPage.expectQueryParamValue('page', '2');

      await test.step('Typing a keyword does not change the URL', async () => {
        await searchPage.fillKeyword(searchData.search.broadKeyword);
        await searchPage.expectQueryParamMissing('query');
        await searchPage.expectQueryParamValue('page', '2');
      });

      await test.step('Submitting navigates with the query param and resets paging', async () => {
        await Promise.all([
          page.waitForURL(new RegExp(`${searchData.path.replace('/', '\\/')}\\?query=`)),
          searchPage.submitSearch(),
        ]);

        await searchPage.expectLoaded();
        await searchPage.expectQueryParamValue('query', searchData.search.broadKeyword);
        await searchPage.expectQueryParamMissing('page');
      });
    });

    test('should truncate a keyword longer than 100 characters when submitted', async ({ searchPage, page }) => {
      await searchPage.goto();
      await searchPage.fillKeyword(searchData.search.longKeyword);

      await Promise.all([page.waitForURL(/\?query=/), searchPage.submitSearch()]);

      await searchPage.expectQueryParamLength('query', 100);
    });

    test('should clear the input without changing the URL until the next submit', async ({ searchPage, page }) => {
      await searchPage.goto({ query: searchData.search.broadKeyword });
      await searchPage.expectKeywordValue(searchData.search.broadKeyword);

      await searchPage.clearKeyword();
      await searchPage.expectKeywordValue('');
      await searchPage.expectQueryParamValue('query', searchData.search.broadKeyword);
      await expect(page).toHaveURL(/query=/);
    });
  });

  test.describe('sort', () => {
    test(`should update the sort query param when changing sort order ${testTags.smoke}`, async ({
      searchPage,
      page,
    }) => {
      await searchPage.goto();

      await test.step('Switch to price high-to-low', async () => {
        await Promise.all([
          page.waitForURL(new RegExp(`sort=${searchData.sort.priceHigh.value}`)),
          searchPage.sortSelect.selectByValue(searchData.sort.priceHigh.value),
        ]);
        await searchPage.expectQueryParamValue('sort', searchData.sort.priceHigh.value);
      });

      await test.step('Switch to price low-to-high', async () => {
        await Promise.all([
          page.waitForURL(new RegExp(`sort=${searchData.sort.priceLow.value}`)),
          searchPage.sortSelect.selectByValue(searchData.sort.priceLow.value),
        ]);
        await searchPage.expectQueryParamValue('sort', searchData.sort.priceLow.value);
      });
    });

    test('should not reset the page number when changing sort order', async ({ searchPage, page }) => {
      await searchPage.goto({ page: '2' });
      await searchPage.expectQueryParamValue('page', '2');

      await Promise.all([
        page.waitForURL(new RegExp(`sort=${searchData.sort.priceHigh.value}`)),
        searchPage.sortSelect.selectByValue(searchData.sort.priceHigh.value),
      ]);

      await searchPage.expectQueryParamValue('sort', searchData.sort.priceHigh.value);
      await searchPage.expectQueryParamValue('page', '2');
    });
  });

  test.describe('pagination', () => {
    test(`should keep existing params when navigating to page 2 via the page selector ${testTags.smoke}`, async ({
      searchPage,
      page,
    }) => {
      await searchPage.goto({ sort: searchData.sort.priceHigh.value });

      await Promise.all([page.waitForURL(/page=2/), searchPage.pagination.goToPage('2')]);

      await searchPage.expectLoaded();
      await searchPage.expectQueryParamValue('page', '2');
      await searchPage.expectQueryParamValue('sort', searchData.sort.priceHigh.value);
    });

    test('should disable prev on the first page and next on the last page', async ({ searchPage }) => {
      await searchPage.goto();
      await searchPage.pagination.expectPrevDisabled();

      const lastPage = await searchPage.pagination.lastPageValue();

      await searchPage.goto({ page: lastPage });
      await searchPage.pagination.expectNextDisabled();
    });

    test('should move exactly one page when using the prev/next step buttons', async ({ searchPage, page }) => {
      await searchPage.goto({ page: '2' });

      await Promise.all([page.waitForURL(/page=3/), searchPage.pagination.goNext()]);
      await searchPage.expectQueryParamValue('page', '3');

      await Promise.all([page.waitForURL(/page=2/), searchPage.pagination.goPrevious()]);
      await searchPage.expectQueryParamValue('page', '2');
    });
  });

  test.describe('product card', () => {
    test(`should navigate to the product detail page matching the clicked card ${testTags.smoke}`, async ({
      searchPage,
      page,
    }) => {
      await searchPage.goto();

      const href = await searchPage.productList.clickCard(0);

      expect(href).not.toBe('');
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    });

    test('should render product name, price, and image content for each card', async ({ searchPage }) => {
      await searchPage.goto();

      await test.step('Every card shows a non-empty product name', async () => {
        await searchPage.productList.expectAllCardsHaveNames();
      });

      await test.step('At least one price renders in the expected currency format', async () => {
        await searchPage.productList.expectSomePriceIsFormattedCorrectly();
      });

      await test.step('At least one card has a real product image', async () => {
        await searchPage.productList.expectSomeImageHasSrc();
      });
    });
  });

  test.describe('empty state', () => {
    test(`should show the empty state and hide the product grid/pagination for a no-match keyword ${testTags.smoke}`, async ({
      searchPage,
    }) => {
      await searchPage.goto({ query: searchData.search.noMatchKeyword });

      await searchPage.expectEmptyState();
      await searchPage.productList.expectEmpty();
      await searchPage.pagination.expectHidden();
    });
  });

  test.describe('deep link', () => {
    test('should reflect query, page, and sort directly from a deep-linked URL', async ({ searchPage }) => {
      await searchPage.goto({
        query: searchData.search.broadKeyword,
        page: '2',
        sort: searchData.sort.priceHigh.value,
      });

      await searchPage.expectKeywordValue(searchData.search.broadKeyword);
      await searchPage.pagination.expectCurrentPage('2');
      await searchPage.sortSelect.expectCurrentValue(searchData.sort.priceHigh.value);
    });
  });
});
