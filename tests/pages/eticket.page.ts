import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { SidebarFilterComponent, type SidebarMode } from '@pages/components/sidebar-filter.component';
import { PaginationComponent } from '@pages/components/pagination.component';
import { ProductListComponent } from '@pages/components/product-list.component';

/**
 * Page Object for the eTicket list screen (`online-store-web/Pages/ETicket/Index.vue`, route
 * `/ticket_items?discount_code=`). Composes the shared sidebar/product-list/pagination components
 * (same DOM as Search). The route is public — no auth is required for any case; the list only
 * renders for a valid `discount_code`, otherwise the no-result empty state shows.
 */
export class ETicketPage {
  readonly page: Page;
  readonly root: Locator;
  readonly ticketTitle: Locator;
  readonly totalCount: Locator;
  readonly emptyState: Locator;
  readonly breadcrumb: Locator;
  readonly sidebarFilter: SidebarFilterComponent;
  readonly pagination: PaginationComponent;
  readonly productList: ProductListComponent;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#e-ticket');
    this.ticketTitle = page.locator('.list-item .heading-03 span.text-bold');
    this.totalCount = page.locator('.top-list .heading-sub');
    this.emptyState = page.locator('.empty-value');
    this.breadcrumb = page.locator('.breadcrumb');
    this.sidebarFilter = new SidebarFilterComponent(page);
    this.pagination = new PaginationComponent(page);
    this.productList = new ProductListComponent(page);
  }

  async goto(query?: Record<string, string>): Promise<void> {
    const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';

    // Wait for DOM ready rather than the full `load` event — the list page pulls many catalog
    // images that can keep `load` pending past the timeout; `expectLoaded()` auto-retries on the
    // rendered markup, which is what actually matters here.
    await this.page.goto(`/ticket_items${queryString}`, { waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/ticket_items(?:\?|$)/);
    await expect(this.root).toBeVisible();
    await this.waitForHydration();
  }

  /**
   * The page is server-rendered first: card hrefs ship as `discount_code=null` and the sidebar
   * controls have no click handlers until Vue hydrates client-side (Index.vue reads the real
   * `discount_code` from `window.location` only in the browser). Waiting for a card href to swap
   * to the real code is a reliable proxy that hydration finished, so later clicks land on the live
   * app rather than the static markup. Empty-state pages render no cards, so there is nothing to
   * wait for.
   */
  private async waitForHydration(): Promise<void> {
    const code = new URL(this.page.url()).searchParams.get('discount_code');

    if (!code || (await this.productList.cards.count()) === 0) {
      return;
    }

    const firstCardLink = this.productList.cards.first().locator('a.card__inner');

    await expect(firstCardLink).toHaveAttribute('href', new RegExp(`discount_code=${code}(?:&|$)`));
  }

  async expectTicketKindName(name: string): Promise<void> {
    await expect(this.ticketTitle).toHaveText(name);
  }

  /** Breadcrumb crumbs, in order — e.g. ['Home', 'マイページ', 'My Ticket', '{ticketKindName}']. */
  async expectBreadcrumb(labels: readonly string[]): Promise<void> {
    await expect(this.breadcrumb.locator('li')).toHaveText(labels.map(label => new RegExp(label)));
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.emptyState.locator('.not-found')).toHaveText('条件に一致する商品は見つかりませんでした');
  }

  /** Numeric total from the "対象商品 {n}件" heading, for asserting the result set changes on filter. */
  async totalCountValue(): Promise<number> {
    const text = (await this.totalCount.textContent()) ?? '';
    const digits = text.replace(/[^\d]/g, '');

    return digits ? Number(digits) : 0;
  }

  async expectQueryParamValue(name: string, value: string): Promise<void> {
    await expect.poll(() => new URL(this.page.url()).searchParams.get(name)).toBe(value);
  }

  async expectQueryParamMissing(name: string): Promise<void> {
    await expect.poll(() => new URL(this.page.url()).searchParams.has(name)).toBe(false);
  }

  async openMobileSidebar(): Promise<void> {
    await this.sidebarFilter.openMobile();
  }

  async expectSidebarSectionVisible(title: string, mode: SidebarMode): Promise<void> {
    await this.sidebarFilter.expectSectionVisible(title, mode);
  }

  async selectCategory(label: string, mode: SidebarMode): Promise<void> {
    await this.sidebarFilter.selectOption('カテゴリー', label, mode);
  }

  async selectFilterOption(sectionTitle: string, label: string, mode: SidebarMode): Promise<void> {
    await this.sidebarFilter.selectOption(sectionTitle, label, mode);
  }

  /**
   * The card href carries the discount_code forward to the Product Detail page
   * (`/{item_code}?discount_code=...`). Returns the clicked card's href so the caller can assert
   * navigation landed there.
   */
  async clickCard(index: number): Promise<string> {
    return this.productList.clickCard(index);
  }
}
