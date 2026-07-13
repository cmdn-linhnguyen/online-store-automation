import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type SidebarMode = 'desktop' | 'mobile';

/**
 * Shared across Search / E-Ticket / Partner Search (docs/test-plan.md §3).
 * Sidebar markup (online-store-web SideBarPC.vue / SideBarSP.vue) has no data-testid,
 * so locators rely on the semantic `.title-filter` / `label` structure shared by Radio.vue
 * and Checkbox.vue.
 */
export class SidebarFilterComponent {
  readonly page: Page;
  readonly desktopRoot: Locator;
  readonly mobileRoot: Locator;
  readonly mobileOverlay: Locator;
  readonly mobileOpenButton: Locator;
  readonly mobileSubmitButton: Locator;
  readonly mobileCloseButton: Locator;
  readonly tagCarousel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.desktopRoot = page.locator('.sidebar.pc-only');
    this.mobileRoot = page.locator('.sidebar.sp');
    this.mobileOverlay = page.locator('#overlay.overlay.sp');
    this.mobileOpenButton = page.getByRole('button', { name: /絞り込み/ });
    this.mobileSubmitButton = this.mobileRoot.getByRole('button', { name: '絞り込む' });
    this.mobileCloseButton = this.mobileRoot.locator('.close-button');
    this.tagCarousel = page.locator('.tag-carousel');
  }

  async expectSectionVisible(title: string, mode: SidebarMode): Promise<void> {
    await expect(this.sectionTitle(title, mode)).toBeVisible();
  }

  async expectSectionHidden(title: string, mode: SidebarMode): Promise<void> {
    await expect(this.sectionTitle(title, mode)).toHaveCount(0);
  }

  /**
   * Scoped to the named section's own container — label text is not unique across sections
   * (e.g. "STARBUCKS COFFEE" appears both under 取り扱い場所 and under ブランド).
   */
  async selectOption(sectionTitle: string, label: string, mode: SidebarMode): Promise<void> {
    const target = this.optionLabel(sectionTitle, label, mode);

    await expect(target).toBeVisible();
    await target.click();
  }

  async expectOptionChecked(sectionTitle: string, label: string, mode: SidebarMode): Promise<void> {
    await expect(this.optionLabel(sectionTitle, label, mode).locator('input')).toBeChecked();
  }

  /**
   * For sections whose options come from live aggregation data (e.g. 取り扱い場所) rather than a
   * fixed label list — selects the first option with a non-empty value (skipping the "すべて"
   * all-options placeholder) and returns its underlying input value.
   */
  async selectFirstOptionInSection(title: string, mode: SidebarMode): Promise<string> {
    const container = this.sectionOptionsContainer(title, mode);
    const inputs = container.locator('input');
    const count = await inputs.count();

    for (let index = 0; index < count; index += 1) {
      const value = await inputs.nth(index).getAttribute('value');

      if (value) {
        await container.locator('label').nth(index).click();

        return value;
      }
    }

    throw new Error(`No selectable option with a non-empty value found in section "${title}"`);
  }

  async openMobile(): Promise<void> {
    await this.mobileOpenButton.click();
    await expect(this.mobileRoot).toHaveClass(/show/);
    await expect(this.mobileOverlay).toBeVisible();
  }

  async closeMobileViaButton(): Promise<void> {
    await this.mobileCloseButton.click();
  }

  async closeMobileViaOverlay(): Promise<void> {
    // Drawer is a fixed-width right-hand panel; clicking near the overlay's top-left
    // corner lands outside the drawer instead of on it.
    await this.mobileOverlay.click({ position: { x: 10, y: 10 } });
  }

  async submitMobile(): Promise<void> {
    await this.mobileSubmitButton.click();
  }

  async expectMobileClosed(): Promise<void> {
    await expect(this.mobileRoot).toHaveClass(/hide/);
    await expect(this.mobileOverlay).toBeHidden();
  }

  async expectTagVisible(text: string): Promise<void> {
    await expect(this.tag(text)).toBeVisible();
  }

  async expectTagAbsent(text: string): Promise<void> {
    await expect(this.tag(text)).toHaveCount(0);
  }

  async removeTag(text: string): Promise<void> {
    const target = this.tag(text);

    await expect(target).toBeVisible();
    await target.locator('.search-tag__delete-button').click();
  }

  private root(mode: SidebarMode): Locator {
    return mode === 'desktop' ? this.desktopRoot : this.mobileRoot;
  }

  private sectionTitle(title: string, mode: SidebarMode): Locator {
    return this.root(mode).locator('.title-filter').filter({ hasText: title });
  }

  private optionLabel(sectionTitle: string, label: string, mode: SidebarMode): Locator {
    return this.sectionOptionsContainer(sectionTitle, mode).locator('label').filter({ hasText: label }).first();
  }

  private sectionOptionsContainer(title: string, mode: SidebarMode): Locator {
    return this.sectionTitle(title, mode).locator('xpath=following-sibling::*[1]');
  }

  private tag(text: string): Locator {
    return this.tagCarousel.locator('.search-tag').filter({ hasText: text });
  }
}
