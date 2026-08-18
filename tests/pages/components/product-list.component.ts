import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Wraps the product grid in `online-store-web/Pages/Search/Index.vue` (`.local-wrap .card`). */
export class ProductListComponent {
  readonly root: Locator;
  readonly cards: Locator;

  constructor(page: Page) {
    this.root = page.locator('.local-wrap');
    this.cards = this.root.locator('.card');
  }

  async expectEmpty(): Promise<void> {
    await expect(this.root).toHaveCount(0);
  }

  card(index: number): Locator {
    return this.cards.nth(index);
  }

  /** Clicks the card's link and returns its `href`, so the caller can assert navigation landed there. */
  async clickCard(index: number): Promise<string> {
    const link = this.card(index).locator('a.card__inner');
    const href = await link.getAttribute('href');

    await link.click();

    return href ?? '';
  }

  /** Item name always renders (no `v-if`), so every card is expected to have one. */
  async expectAllCardsHaveNames(): Promise<void> {
    const names = await this.cards.locator('.card__inner__text .text-limit').allTextContents();

    expect(names.length).toBeGreaterThan(0);
    names.forEach(name => expect(name.trim().length).toBeGreaterThan(0));
  }

  /**
   * Price only renders for items with a valid SKU price (`v-if="item.price"`), so this checks the
   * *format* of whichever prices are present rather than requiring a specific card to have one.
   */
  async expectSomePriceIsFormattedCorrectly(): Promise<void> {
    const prices = this.root.locator('.card__inner__text > span.english:not(.products-tag-02)');
    const texts = await prices.allTextContents();

    expect(texts.length).toBeGreaterThan(0);
    texts.forEach(text => expect(text.trim()).toMatch(/^¥[\d,]+(~¥[\d,]+|~)?$/));
  }

  /** Not every product has a matched image, so this only requires at least one real (non-empty) `src`. */
  async expectSomeImageHasSrc(): Promise<void> {
    const srcs = await this.cards
      .locator('.card__inner__img img')
      .evaluateAll(images => images.map(image => image.getAttribute('src')));

    expect(srcs.some(src => !!src)).toBe(true);
  }
}
