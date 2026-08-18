import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { PaginationComponent } from '@pages/components/pagination.component';
import { ProductListComponent } from '@pages/components/product-list.component';

/**
 * Page Object for the Partner/Roastery search screen
 * (`online-store-web/Pages/Search/SearchPartner.vue`).
 *
 * Routes:
 *   `/partner`          — base route, no search executed → always empty state
 *   `/partner/roastery` — Starbucks Reserve Roastery Tokyo products
 *   `/partner/limited`  — limited-store products
 *
 * Unlike Search and ETicket, this page has NO sidebar filter.
 */
export class PartnerSearchPage {
  readonly page: Page;
  readonly root: Locator;
  readonly resultCountHeading: Locator;
  readonly emptyState: Locator;
  readonly breadcrumb: Locator;
  readonly pagination: PaginationComponent;
  readonly productList: ProductListComponent;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('.search-result-page');
    this.resultCountHeading = page.locator('.heading-03');
    this.emptyState = page.locator('.empty-value');
    this.breadcrumb = page.locator('.breadcrumb');
    this.pagination = new PaginationComponent(page);
    this.productList = new ProductListComponent(page);
  }

  async goto(partner?: 'roastery' | 'limited'): Promise<void> {
    const path = partner ? `/partner/${partner}` : '/partner';

    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/partner/);
    await expect(this.root).toBeVisible();
  }

  /** Checks the `検索結果 X件` heading is present and `X` is greater than `min`. */
  async expectResultCountGreaterThan(min: number): Promise<void> {
    await expect(this.resultCountHeading).toContainText('件');
    const text = (await this.resultCountHeading.textContent()) ?? '';
    const digits = text.replace(/[^\d]/g, '');
    const count = digits ? Number(digits) : 0;

    expect(count).toBeGreaterThan(min);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.emptyState.locator('.not-found')).toHaveText('条件に一致する商品は見つかりませんでした');
  }

  /** Asserts the sidebar components do not render on partner pages. */
  async expectNoSidebar(): Promise<void> {
    await expect(this.page.locator('.sidebar')).toHaveCount(0);
  }

  /** Breadcrumb crumb labels, in order — e.g. `['Home', 'パートナー販売', 'STARBUCKS RESERVE® ROASTERY TOKYO']`. */
  async expectBreadcrumb(labels: readonly string[]): Promise<void> {
    await expect(this.breadcrumb).toBeVisible();
    await expect(this.breadcrumb.locator('li')).toHaveText(labels.map(label => new RegExp(label)));
  }

  /** Locator for ROASTERY TOKYO brand badges (`span.products-tag-02`). Use assert-if-present against live catalog. */
  roasteryTokyoBadges(): Locator {
    return this.page.locator('span.products-tag-02');
  }

  /** Locator for limited-store tags on product cards. Use assert-if-present against live catalog. */
  limitedStoreTags(): Locator {
    return this.page.locator('span.products-tag-01').filter({ hasText: /限定/ });
  }

  /** Asserts no custom-bottle tags are rendered (SearchPartner.vue omits them unlike Search/Index.vue). */
  async expectNoCustomBottleTags(): Promise<void> {
    await expect(this.page.locator('[class*="custom-bottle"]')).toHaveCount(0);
  }
}
