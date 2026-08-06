import { test as base, expect } from '@playwright/test';

import { SearchPage } from '../pages/search.page';
import { ETicketPage } from '../pages/eticket.page';

type AppFixtures = {
  searchPage: SearchPage;
  eticketPage: ETicketPage;
};

export const test = base.extend<AppFixtures>({
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
  eticketPage: async ({ page }, use) => {
    await use(new ETicketPage(page));
  },
});

export { expect };
