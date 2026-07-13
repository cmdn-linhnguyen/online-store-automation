# Test cases — Search (`/search`)

Tóm tắt các test case tự động (Playwright) cho tính năng Search, để verify nhanh mà không cần đọc
code. Cập nhật bởi skill `/summarize-test` — mỗi khi thêm/sửa test trong feature này, tìm file này
để cập nhật thay vì tạo file mới.

## sidebar.spec.ts

Spec: [tests/e2e/search/sidebar.spec.ts](../../tests/e2e/search/sidebar.spec.ts)
Page/Component Object: [tests/pages/search.page.ts](../../tests/pages/search.page.ts),
[tests/pages/components/sidebar-filter.component.ts](../../tests/pages/components/sidebar-filter.component.ts)

### Desktop (9 case)

| # | Tên test | Kịch bản | Kỳ vọng chính |
|---|---|---|---|
| 1 | should apply category filters immediately and toggle dependent sections | Mở `/search`, kiểm tra 5 section mặc định hiển thị, chọn category "ビバレッジ メニュー" | URL cập nhật `category_code` ngay lập tức; section オンラインストア/価格 ẩn, ブランド vẫn hiện |
| 2 | should reveal coffee-specific filters for beans category | Chọn category "コーヒー豆" | Các section riêng cho cà phê (ロースト, ブレンド, sinh地, 酸味, コク, 種類...) hiện ra; 商品仕様 vẫn ẩn |
| 3 | should drop paging when applying a new desktop category filter | Vào `?page=3`, sau đó chọn category mới | Tham số `page` bị xoá khỏi URL khi đổi filter |
| 4 | should apply the purchase-location filter, which stays visible regardless of category | Chọn 1 option bất kỳ (khác "すべて") trong 取り扱い場所 (options load động từ dữ liệu thật) | `purchase_methods` được set đúng giá trị; section này luôn hiện kể cả khi category đang ẩn section khác |
| 5 🔥 | should apply brand and price... combine price with a category | (a) chọn brand rồi reset về "すべて"; (b) đổi price qua lại 2 mức; (c) chọn category + giữ price | brand/price set đúng & reset đúng; category + price cùng tồn tại trên URL |
| 6 | should toggle both online-store checkboxes independently and together | Tick "在庫あり" rồi tick thêm "オンライン商品" | 2 checkbox độc lập, cả 2 param cùng `=true` khi tick cả hai |
| 7 | should combine multiple checkboxes within one bean-classification section | Trong category コーヒー豆, tick 2 mức roast (Blonde + Dark) | `bean_classification` chứa cả 2 giá trị (dạng nối bằng dấu phẩy) |
| 8 | should only show the 商品仕様 section for tumbler/mug categories | So sánh category コーヒー豆 vs タンブラー＆マグカップ | Section 商品仕様 chỉ hiện với category tumbler/mug |
| 9 | should drop a filter param... when selecting a category that hides its section | Set `price` khi chưa chọn category, sau đó chọn category ビバレッジ (không hỗ trợ price) | `price` bị xoá khỏi URL sau khi đổi category |

### Applied filter tags (1 case)

| # | Tên test | Kịch bản | Kỳ vọng chính |
|---|---|---|---|
| 10 🔥 | should show one removable tag... remove only the deleted one | Chọn category + brand → tag hiện đủ 2; xoá tag brand | Cả 2 filter hiện thành tag riêng; xoá 1 tag (nút x) chỉ mất filter đó, category vẫn còn |

### Mobile (5 case, viewport 390×844)

| # | Tên test | Kịch bản | Kỳ vọng chính |
|---|---|---|---|
| 11 | should defer filter application until submit in the mobile drawer | Mở drawer, chọn category, chưa submit | URL chưa đổi cho đến khi bấm "絞り込む"; sau submit thì URL + `page=1` cập nhật, drawer đóng |
| 12 | should close... without mutating URL when dismissed | Chọn category trong drawer, đóng bằng nút X | URL không đổi, drawer đóng |
| 13 | should close... when the overlay backdrop is clicked | Giống #12 nhưng đóng bằng click ra ngoài overlay | URL không đổi, drawer đóng |
| 14 | should keep unsubmitted selections checked after closing and reopening | Chọn category, đóng (không submit), mở lại drawer | Option vừa chọn vẫn đang được check (state cục bộ không bị reset) |
| 15 | should submit multiple filters selected in the drawer together | Chọn category + brand trong drawer, submit 1 lần | Cả 2 param cùng xuất hiện trên URL sau submit |

🔥 = tagged `@smoke` (chạy trong `pnpm test:smoke`, ngoài ra vẫn tính là `@regression` như các test khác trong file).

### Lưu ý khi verify

- Test #4 phụ thuộc dữ liệu catalog thật (danh sách 取り扱い場所 load động theo môi trường, không cố định).
- Test #5 cố tình không kết hợp brand+price+category cùng lúc: một khi đã chọn 1 brand thì các brand
  khác bị disable (không click được), và tổ hợp brand+category+price cụ thể có thể ra 0 sản phẩm thật
  — nên chỉ verify category+price cùng lúc, brand test riêng.
- Đã chạy ổn định 15/15 hai lần liên tiếp trên `dev.menu.starbucks.co.jp` (`BROWSER_CHANNEL=` override
  do channel `chrome` trong `.env` chưa cài trên máy chạy, dùng Chromium bundled thay thế).
