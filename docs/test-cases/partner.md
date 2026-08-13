# Test cases — Partner/Roastery Search (`/partner`)

Tóm tắt test case tự động (Playwright) cho tính năng Partner/Roastery Search, để verify nhanh không
cần đọc code. Cập nhật bởi skill `/summarize-test` — mỗi khi thêm/sửa test trong feature này, tìm
file này để cập nhật thay vì tạo file mới.

## partner-search.spec.ts

Spec: [tests/e2e/partner/partner-search.spec.ts](../../tests/e2e/partner/partner-search.spec.ts)
Page/Component Object: [tests/pages/partner-search.page.ts](../../tests/pages/partner-search.page.ts), [tests/pages/components/product-list.component.ts](../../tests/pages/components/product-list.component.ts), [tests/pages/components/pagination.component.ts](../../tests/pages/components/pagination.component.ts)

### /partner/roastery (7 case)

| # | Tên test | Kịch bản | Kỳ vọng chính |
|---|---|---|---|
| 1 🔥 | should render a product list with count, names, prices, and images | Mở `/partner/roastery` | Heading hiển thị số kết quả > 0; mọi card có tên sản phẩm không rỗng; ít nhất 1 card có giá đúng định dạng `¥1,234`; ít nhất 1 card có `src` ảnh không rỗng |
| 2 | should show the breadcrumb Home > パートナー販売 > ROASTERY TOKYO | Mở `/partner/roastery` | Breadcrumb hiển thị `Home > パートナー販売 > STARBUCKS RESERVE® ROASTERY TOKYO` theo đúng thứ tự |
| 3 | should not render a sidebar filter | Mở `/partner/roastery` | Không có element `.sidebar` nào render trên trang |
| 4 | ROASTERY TOKYO brand badge should appear on at least one product card (assert-if-present) | Mở `/partner/roastery`, đếm số card hiện tại | Nếu có card: ít nhất 1 `span.products-tag-02` visible với text `ROASTERY TOKYO` |
| 5 | clicking a product card should navigate to /partner/{code} | Mở `/partner/roastery`, click card đầu tiên | URL điều hướng đến `/partner/{numeric_code}`; `href` của card khớp pattern `/partner/\d+` |
| 6 | pagination should render when result count > 0, prev disabled on page 1 | Mở `/partner/roastery`, kiểm tra vùng phân trang | Heading kết quả > 0; `.pager` visible; nút prev có class `disabled` |
| 7 | no custom-bottle tags should be rendered on partner pages | Mở `/partner/roastery` | Không có element nào có class chứa `custom-bottle` (khác với `/search`) |

> Test 4: bỏ qua assertion nếu live catalog trả về 0 card. Test 6 phụ thuộc live catalog có ít nhất 1 sản phẩm trả về để pagination render.

🔥 = tagged `@smoke` (chạy trong `pnpm test:smoke`; các test khác trong file vẫn tính `@regression`
trừ khi ghi chú khác).

### /partner/limited (4 case)

| # | Tên test | Kịch bản | Kỳ vọng chính |
|---|---|---|---|
| 8 | should render a product list with correct breadcrumb | Mở `/partner/limited` | Ít nhất 1 card sản phẩm visible; breadcrumb hiển thị `Home > パートナー販売 > 限定` |
| 9 | should not render a sidebar filter | Mở `/partner/limited` | Không có element `.sidebar` nào render trên trang |
| 10 | clicking a product card should navigate to /partner/{code} | Mở `/partner/limited`, click card đầu tiên | URL điều hướng đến `/partner/{numeric_code}`; `href` của card khớp pattern `/partner/\d+` |
| 11 | limited-store tag should appear on at least one card (assert-if-present) | Mở `/partner/limited`, đếm số card | Nếu có card: ít nhất 1 `span.products-tag-01` có text chứa `限定` |

> Test 11: bỏ qua assertion nếu live catalog trả về 0 card. `/partner/limited` hiện chỉ check card visibility (test 8), chưa kiểm tra chất lượng toàn bộ card (tên, giá, ảnh) như `/partner/roastery`.

## Chưa cover / ngoài phạm vi

- `/partner/limited` product list quality (names, prices, images per card) — test 8 chỉ check "at least one card visible", chưa cover đủ như test 1 cho roastery; deferred vì basic presence đã asserted
- Empty state trên `/partner` base route — route trả về 404 trên staging; chưa test được trong môi trường hiện tại
- Empty state khi `/partner/roastery` hoặc `/partner/limited` trả về 0 sản phẩm từ live catalog — không kiểm soát được dữ liệu catalog trong E2E
- Preview variants (`/preview/partner`, `/preview/partner/roastery`, `/preview/partner/limited`) — yêu cầu `preview_date` query param và preview mode; ngoài phạm vi hiện tại
- Pagination navigation (next/prev click, page select) trên `/partner/roastery` khi total > 20 — deferred; test 6 chỉ assert pagination visible và prev disabled trên trang 1
