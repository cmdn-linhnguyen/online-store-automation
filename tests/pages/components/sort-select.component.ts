import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Wraps the generic `Select` dropdown (`online-store-web/components/partials/Select.vue`). */
export class SortSelectComponent {
  readonly select: Locator;

  constructor(page: Page, selectName = 'sort') {
    this.select = page.locator(`select[name="${selectName}"]`);
  }

  async selectByValue(value: string): Promise<void> {
    await this.select.selectOption(value);
  }

  async expectCurrentValue(value: string): Promise<void> {
    await expect(this.select).toHaveValue(value);
  }
}
