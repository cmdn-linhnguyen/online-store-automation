export const searchData = {
  path: '/search',
  categories: {
    beverage: {
      label: 'ビバレッジ メニュー',
      value: 'beverage',
    },
    beans: {
      label: 'コーヒー豆',
      value: 'beans',
    },
    tumblerMug: {
      label: 'タンブラー＆マグカップ',
      value: 'tumblermug',
    },
  },
  desktopDefaultSections: ['カテゴリー', '取り扱い場所', 'オンラインストア', 'ブランド', '価格'],
  beansSections: [
    'オンラインストア',
    '価格',
    'スターバックスロースト',
    'ブレンド／シングルオリジン',
    '生産地',
    '酸味',
    'コク',
    '種類',
  ],
  brand: {
    starbucksCoffee: { label: 'STARBUCKS COFFEE', value: 'starbucks-coffee' },
    teavana: { label: 'TEAVANA™', value: 'teavana' },
  },
  price: {
    under1000: { label: '¥1,000未満', value: '*-1000.0' },
    over5000: { label: '¥5,000～', value: '5000.0-*' },
  },
  onlineStore: {
    inventoryQuantity: { label: '在庫あり', param: 'inventory_quantity' },
    onlineStoreOnly: { label: 'オンライン商品', param: 'online_store' },
  },
  beanClassification: {
    blonde: { label: 'ブロンド ロースト（軽やかな風味）', value: 'STARBUCKS_BLONDE_ROAST' },
    dark: { label: 'ダーク ロースト（力強い風味）', value: 'STARBUCKS_DARK_ROAST' },
  },
  search: {
    broadKeyword: 'コーヒー',
    noMatchKeyword: 'zzz-no-such-product-should-ever-match-zzz-123456',
    longKeyword: 'a'.repeat(150),
  },
  sort: {
    priceHigh: { label: '価格が高い順', value: 'price_high' },
    priceLow: { label: '価格が安い順', value: 'price_low' },
  },
} as const;
