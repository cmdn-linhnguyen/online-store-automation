# Test Cases — eTicket list (`/ticket_items`)

Human-readable summary of the automated coverage for the eTicket list screen. Route is **public**
(no login required for any case); the list only renders for a valid `discount_code`, otherwise the
no-result empty state shows. Verified live against `dev.menu.starbucks.co.jp`.

Test data (all verified, multi-page):
`884` → "Birthday Reward" · `1545` → "quyennene" · `600` → "BO_UT_Test QQne" · `000000` → invalid.

## eticket.spec.ts

### SEO & breadcrumb

| Sheet ID | Kịch bản | Kỳ vọng chính |
|---|---|---|
| ID-00120 `@smoke` | Mở `/ticket_items?discount_code=884` | `<title>` kết thúc bằng `スターバックス コーヒー ジャパン` |
| ID-00121 | Mở list với code hợp lệ | Breadcrumb đúng thứ tự `Home / マイページ / My Ticket / Birthday Reward` (crumb cuối = tên ticket kind) |

### eTicket types

| Sheet ID | Kịch bản | Kỳ vọng chính |
|---|---|---|
| ID-00122 `@smoke` | Mở list Type 1 (code `884`) | Tiêu đề ticket kind = "Birthday Reward" + có ít nhất 1 sản phẩm |
| ID-00123 | Mở list Type 2 (code `1545`) | Tiêu đề = "quyennene" + có ít nhất 1 sản phẩm |
| ID-00124 | Mở list Type 3 (code `600`) | Tiêu đề = "BO_UT_Test QQne" + có ít nhất 1 sản phẩm |

### Search form & result field UI

| Sheet ID | Kịch bản | Kỳ vọng chính |
|---|---|---|
| ID-00125 | Mở list, kiểm tra sidebar mặc định | Hiện đủ 5 section `カテゴリー / 取り扱い場所 / オンラインストア / ブランド / 価格` |
| ID-00126 / ID-00134 `@smoke` | Mở list, kiểm tra từng product card | Mỗi card có tên (non-empty); ít nhất 1 giá đúng định dạng `¥1,234`/`¥1,234~¥5,678`; ít nhất 1 ảnh có `src` thật |
| ID-00135 | Mở list, kiểm tra các badge trên card | Assert-if-present: không ép card cụ thể phải có badge, nhưng badge (ROASTERY TOKYO / online-store / drink-ticket) nào có render thì mọi instance phải có text non-empty (badge rỗng/hỏng vẫn fail) |

### Filter tags & search behavior

| Sheet ID | Kịch bản | Kỳ vọng chính |
|---|---|---|
| ID-00128 | Chọn brand "STARBUCKS COFFEE" → rồi xóa tag vừa tạo | Chọn → `brand_code` vào URL + tag hiện trong `.tag-carousel`; xóa tag → `brand_code` biến mất + tag không còn |
| ID-00129 | Click category "コーヒー豆" (radio) | `category_code=beans` vào URL, `discount_code` được giữ nguyên |
| ID-00130 | Deep-link `inventory_quantity=true` | Param `inventory_quantity=true` được giữ, `discount_code` giữ nguyên, section オンラインストア vẫn hiện |
| ID-00131 | Click brand "STARBUCKS COFFEE" (radio) | `brand_code=starbucks-coffee` vào URL, `discount_code` giữ nguyên |
| ID-00132 | Deep-link `category_code=beans` + `inventory_quantity=true` | Cả 2 param cùng tồn tại trong URL + `discount_code` giữ nguyên |

### Redirection

| Sheet ID | Kịch bản | Kỳ vọng chính |
|---|---|---|
| ID-00133 `@smoke` | Click card đầu tiên trong list | Điều hướng tới `/{item_code}?discount_code=884` — khớp đúng `href` thật của card đã click |

### Pagination

| Sheet ID | Kịch bản | Kỳ vọng chính |
|---|---|---|
| ID-00136 | Từ trang 1, chọn trang 2 qua dropdown | URL có `page=2` và `discount_code` được giữ qua các trang |
| (bổ sung) | Ở trang đầu và trang cuối | Nút Prev bị disable ở trang đầu; nút Next bị disable ở trang cuối |

### Empty state

| Sheet ID | Kịch bản | Kỳ vọng chính |
|---|---|---|
| ID-00137 `@smoke` | Mở list với code không hợp lệ (`000000`) | Hiện trang no-result (`条件に一致する商品は見つかりませんでした`); ẩn cả product grid lẫn pagination |

### Mobile (viewport 390×844)

| Sheet ID | Kịch bản | Kỳ vọng chính |
|---|---|---|
| ID-00127 | Tap nút `絞り込み` trên SP | Drawer filter mở (`.sidebar.sp` có class `show`) + overlay hiện |

---

**Notes / cần lưu ý khi đọc kết quả:**

- **Phụ thuộc dữ liệu live**: mọi case dùng `discount_code` chạy trên catalog thật của
  `dev.menu.starbucks.co.jp`. Tên ticket kind (Birthday Reward / quyennene / BO_UT_Test QQne) và
  việc list có ≥1 sản phẩm phụ thuộc dữ liệu coupon condition trên môi trường dev.
- **ID-00130 & ID-00132 assert bằng deep-link thay vì click**: checkbox オンラインストア là input
  multi-value được dựng lại lúc load trang, click không đẩy param vào URL một cách ổn định trên
  trang eTicket — deep-link là cách ổn định, data-agnostic để chứng minh search theo inventory /
  đa điều kiện hoạt động. Category/brand (radio, ID-00129/131) vẫn assert bằng click thật.
- **ID-00129→132 là data-agnostic** (theo quyết định lúc /plan): chỉ assert *cơ chế* search (param
  vào URL + `discount_code` được giữ), không hardcode item A/B/C/D cụ thể phải xuất hiện — tránh
  brittle trên catalog live.
- **ID-00135 assert-if-present**: sự xuất hiện của từng badge phụ thuộc catalog nên không bắt buộc
  phải có badge; nhưng badge nào render thì mọi instance phải có text non-empty (badge rỗng/hỏng
  vẫn fail).
- **Trang SSR rồi hydrate**: card href ban đầu là `discount_code=null`, chỉ đổi sang code thật sau
  khi Vue hydrate client-side. Page Object đợi href đổi sang code thật trước khi tương tác — nếu
  không, click rơi vào markup tĩnh (đây là nguyên nhân các fail ban đầu, đã xử lý).
- **ID-00123/124 (Type 2/3)**: khác với sheet gốc chỉ nói "check URL of type", ở đây assert cả tên
  ticket kind + list render — 3 code do team cung cấp.
