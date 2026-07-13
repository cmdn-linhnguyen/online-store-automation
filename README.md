# Playwright Automation Boilerplate

Boilerplate này dành cho dự án automation theo hướng team-ready:

- `Playwright + TypeScript`
- hỗ trợ `env` theo môi trường
- cấu trúc `fixtures / page objects / test data / e2e specs`
- lint, format, typecheck và HTML/JUnit report

## Cấu trúc

```text
.
├── src
│   ├── config
│   └── utils
├── tests
│   ├── e2e
│   ├── fixtures
│   ├── pages
│   └── test-data
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Khởi động

```bash
pnpm install
cp .env.example .env
pnpm exec playwright install
pnpm test
```

## Scripts chính

```bash
pnpm test
pnpm test:ui
pnpm test:headed
pnpm test:debug
pnpm test:smoke
pnpm test:list
pnpm test:cross-browser
pnpm typecheck
pnpm lint
pnpm format
pnpm report
```

## Env strategy

- `.env`: local mặc định
- `.env.stg`: staging
- `.env.prod`: production
- `CROSS_BROWSER=true`: bật Chromium + Firefox + WebKit

Chạy theo môi trường:

```bash
pnpm test:local
pnpm test:stg
pnpm test:prod
```

## Quy ước mở rộng

- `tests/e2e`: spec file
- `tests/pages`: page object
- `tests/fixtures`: fixture chung cho test
- `tests/test-data`: dữ liệu test tĩnh
- `src/config`: đọc và validate config
- `src/utils`: helper tái sử dụng
