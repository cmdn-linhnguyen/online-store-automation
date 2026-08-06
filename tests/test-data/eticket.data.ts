export const eticketData = {
  path: '/ticket_items',
  // All verified live on dev.menu.starbucks.co.jp; each spans multiple pages (20 items/page).
  discountCodes: {
    type1: '884', // ticketKindName "Birthday Reward", 4,411 items
    type2: '1545', // ticketKindName "quyennene", 6,106 items
    type3: '600', // ticketKindName "BO_UT_Test QQne", 6,106 items
    // Any code with no matching coupon condition → empty ticketKindName + no-result state.
    invalid: '000000',
    // Reuse the rich type1 code, whose result set spans multiple pages.
    multiPage: '884',
  },
  ticketKindName: {
    type1: 'Birthday Reward',
    type2: 'quyennene',
    type3: 'BO_UT_Test QQne',
  },
  // Shared with Search — <title> / og:title end with the "starbucks_coffee_japan" lang string.
  seoTitleSuffix: 'スターバックス コーヒー ジャパン',
  // Breadcrumb crumbs are external brand-site links, not gated app routes (route is public).
  breadcrumbLabels: ['Home', 'マイページ', 'My Ticket'],
  emptyStateText: '条件に一致する商品は見つかりませんでした',
  // Default (no-category) sidebar sections, identical to Search's SideBar.
  desktopDefaultSections: ['カテゴリー', '取り扱い場所', 'オンラインストア', 'ブランド', '価格'],
  // A category present in CATEGORIES_HAVE_FILTER for both onlineStore and price, so the sections stay.
  categories: {
    beans: { label: 'コーヒー豆', value: 'beans' },
  },
  brand: {
    starbucksCoffee: { label: 'STARBUCKS COFFEE', value: 'starbucks-coffee' },
  },
  onlineStore: {
    inventoryQuantity: { label: '在庫あり', param: 'inventory_quantity' },
  },
} as const;
