import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { SidebarFilterComponent, type SidebarMode } from '@pages/components/sidebar-filter.component';

export class SearchPage {
  readonly page: Page;
  readonly root: Locator;
  readonly totalCountMarker: Locator;
  readonly resultHeading: Locator;
  readonly sidebarFilter: SidebarFilterComponent;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('.search-result-page');
    this.totalCountMarker = page.locator('#search-result');
    this.resultHeading = page.locator('.top-list .heading-03');
    this.sidebarFilter = new SidebarFilterComponent(page);
  }

  async goto(query?: Record<string, string>): Promise<void> {
    const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';

    await this.page.goto(`/search${queryString}`);
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/search(?:\?|$)/);
    await expect(this.root).toBeVisible();
    await expect(this.totalCountMarker).toBeAttached();
    await expect(this.resultHeading).toBeVisible();
  }

  async openMobileSidebar(): Promise<void> {
    await this.sidebarFilter.openMobile();
  }

  async expectMobileSidebarClosed(): Promise<void> {
    await this.sidebarFilter.expectMobileClosed();
  }

  async expectSidebarSectionVisible(title: string, mode: SidebarMode): Promise<void> {
    await this.sidebarFilter.expectSectionVisible(title, mode);
  }

  async expectSidebarSectionHidden(title: string, mode: SidebarMode): Promise<void> {
    await this.sidebarFilter.expectSectionHidden(title, mode);
  }

  async selectCategory(label: string, mode: SidebarMode): Promise<void> {
    await this.sidebarFilter.selectOption('カテゴリー', label, mode);
  }

  async selectFilterOption(sectionTitle: string, label: string, mode: SidebarMode): Promise<void> {
    await this.sidebarFilter.selectOption(sectionTitle, label, mode);
  }

  async submitMobileFilters(): Promise<void> {
    await this.sidebarFilter.submitMobile();
  }

  get mobileCloseSidebarButton(): Locator {
    return this.sidebarFilter.mobileCloseButton;
  }

  async expectQueryParamValue(name: string, value: string): Promise<void> {
    await expect.poll(() => new URL(this.page.url()).searchParams.get(name)).toBe(value);
  }

  async expectQueryParamMissing(name: string): Promise<void> {
    await expect.poll(() => new URL(this.page.url()).searchParams.has(name)).toBe(false);
  }

  async expectQueryParamContainsAll(name: string, values: readonly string[]): Promise<void> {
    await expect
      .poll(() => {
        const raw = new URL(this.page.url()).searchParams.get(name);

        return raw ? raw.split(',').sort() : [];
      })
      .toEqual([...values].sort());
  }
}
