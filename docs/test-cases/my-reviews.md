# Test Cases — My Reviews

Source: `tests/e2e/my-reviews/my-reviews.auth.spec.ts`

## my-reviews.auth.spec.ts

### page structure

| # | Kịch bản | Kỳ vọng chính |
|---|---|---|
| 1 | Truy cập `/mystarbucks/review` khi đã đăng nhập | Heading có đúng text "マイレビュー"; badge tổng số review visible |
| 2 | Truy cập trang | Heading, badge count, tab area, và ít nhất 1 review item đều visible |

### header and footer

| # | Kịch bản | Kỳ vọng chính |
|---|---|---|
| 3 | Truy cập trang | `header.globalNav` visible; link đầu tiên trong header href chứa `starbucks.co.jp/?nid=mm` |
| 4 | Truy cập trang | `footer.footerWrap` visible; link "よくあるご質問・お問い合わせ" visible và href chứa `starbucks.co.jp/faq/?nid=ft` |

> Header/footer được inject từ CDN HTML. Logo link trong header có `display:none` theo CSS nên chỉ check `href` attribute, không check visibility. CDN load balancer có thể trả về `www` hoặc `www2` subdomain — chỉ assert domain và `nid` param, không assert exact subdomain.

### tabs

| # | Kịch bản | Kỳ vọng chính |
|---|---|---|
| 5 | Truy cập trang mặc định | Tab "投稿日の新しい順" hiển thị trong tab area |
| 6 | Click tab "投稿日の古い順" | URL có `sort=date-old` |
| 7 | Vào với `?sort=date-old`, click tab "投稿日の新しい順" | URL có `sort=date-new` |
| 8 | Vào với `?page=2&sort=date-old`, click tab "投稿日の新しい順" | URL có `sort=date-new` và giữ nguyên `page=2` |
| 9 | Vào với `?page=2&sort=date-new`, click tab "投稿日の古い順" | URL có `sort=date-old` và giữ nguyên `page=2` |

> Tab switch là client-side only — cả hai list (`data_new`, `data_old`) được server trả về ngay từ lúc load trang, không có network request khi đổi tab.

### review item

| # | Kịch bản | Kỳ vọng chính |
|---|---|---|
| 10 | Truy cập trang có review | Item đầu tiên hiển thị đủ: ngày đăng, tên sản phẩm, stars, tiêu đề, nội dung |
| 11 | Kiểm tra format ngày của item đầu tiên | Ngày hiển thị đúng format `YYYY/MM/DD` |
| 12 | Click "編集" trên item đầu tiên | URL chuyển đến `/{item_code}/review/{review_code}/edit` |
| 13 | Tìm item off-sale qua tối đa 5 trang, kiểm tra ảnh | Element có class `prevent-click` |
| 14 | Tìm item off-sale, force click ảnh | URL không thay đổi |
| 15 | Tìm item on-sale qua tối đa 5 trang, kiểm tra URL ảnh | `src` khớp pattern `/public/sku_images/{item_code}/{item_code}_1.jpg` |
| 16 | Tìm item on-sale, click ảnh | URL thay đổi (navigate đến product page) |
| 17 | Tìm item non-public/off-sale, kiểm tra ảnh rồi force click | Element có class `prevent-click`; click không navigate |

> Test #13–17: tìm item phù hợp qua tối đa 5 trang (`findNoImageItemAcrossPages` / `findOnSaleItemAcrossPages`). Nếu không tìm thấy thì `test.skip` (visible trong reporter).
> Test #14, #17: dùng `{ force: true }` để bypass `pointer-events: none` của `.prevent-click`.
> ID-00112 (cursor không đổi sang hand icon): không thể assert — `prevent-click` dùng `pointer-events: none`, không có `cursor` property riêng.

### delete

| # | Kịch bản | Kỳ vọng chính |
|---|---|---|
| 18 | Click "削除" trên item đầu tiên | ConfirmModal hiện với message "このレビューを削除しますか？" |
| ~~19~~ | ~~Click "削除" → modal → confirm → dismiss success~~ | ~~Success modal hiện; badge tổng giảm đúng 1~~ |

> Test #19 tạm thời disabled (commented out) — mutates live data, cần re-seed sau mỗi lần chạy. Re-enable khi có cơ chế seed.

### pagination

| # | Kịch bản | Kỳ vọng chính |
|---|---|---|
| 20 | Truy cập page 1 | Pagination visible; nút `<` bị disabled; page hiện tại là `1` |
| 21 | Navigate đến trang giữa rồi click `>` | Page tăng lên đúng 1 |
| 22 | Navigate đến trang giữa rồi click `<` | Page giảm đúng 1 |
| 23 | Navigate đến trang cuối | Page cuối hiển thị đúng; nút `>` bị disabled; có review items |
| 24 | Navigate đến trang kế trước trang cuối | Page hiển thị đúng; có review items |

> Pagination tests dùng `lastPageValue()` động theo số review thực của account — không hardcode số trang.
> Test #24: skip nếu account chỉ có 1 trang (second-to-last không tồn tại).

### unauthenticated

| # | Kịch bản | Kỳ vọng chính |
|---|---|---|
| 25 | Truy cập `/mystarbucks/review` với storageState rỗng | URL không còn là `/mystarbucks/review` (middleware auth redirect) |

---

**Skipped / chưa cover:**
- ID-00104 Empty state text: account test có 150+ reviews — không thể test với account hiện tại
- ID-00105 API failure state: cần mock server-side error, không trigger được từ E2E
- ID-00112 Cursor hover check: `prevent-click` dùng `pointer-events: none`, không có `cursor` CSS riêng — không assert được qua Playwright
- ID-00115 Delete complete (test #19): tạm disabled vì mutates live data, cần re-seed
- ID-00117 Edit flow end-to-end (post again + verify updated): mutates live data, không safe để automate
