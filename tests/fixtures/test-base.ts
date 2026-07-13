import { test as base, expect } from '@playwright/test';

import { SearchPage } from '../pages/search.page';

type AppFixtures = {
  searchPage: SearchPage;
};

export const test = base.extend<AppFixtures>({
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
});

export { expect };
