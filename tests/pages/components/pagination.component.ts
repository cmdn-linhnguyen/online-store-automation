import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Wraps `online-store-web/components/partials/Pagination.vue`. Renders only when there are results. */
export class PaginationComponent {
  readonly root: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly numberDropdown: Locator;

  constructor(page: Page) {
    this.root = page.locator('.pager');
    this.prevButton = this.root.locator('.pager__button').first();
    this.nextButton = this.root.locator('.pager__button').last();
    this.numberDropdown = this.root.locator('select#selectbox');
  }

  async expectHidden(): Promise<void> {
    await expect(this.root).toHaveCount(0);
  }

  async goToPage(value: string): Promise<void> {
    await this.numberDropdown.selectOption(value);
  }

  async goNext(): Promise<void> {
    await this.nextButton.click();
  }

  async goPrevious(): Promise<void> {
    await this.prevButton.click();
  }

  async expectPrevDisabled(): Promise<void> {
    await expect(this.prevButton).toHaveClass(/disabled/);
  }

  async expectNextDisabled(): Promise<void> {
    await expect(this.nextButton).toHaveClass(/disabled/);
  }

  async expectCurrentPage(value: string): Promise<void> {
    await expect(this.numberDropdown).toHaveValue(value);
  }

  async lastPageValue(): Promise<string> {
    const options = this.numberDropdown.locator('option');
    const count = await options.count();
    const value = await options.nth(count - 1).getAttribute('value');

    return value ?? '1';
  }
}
