# 🐷 Cozy Money (Piggy Balance)

Ứng dụng web quản lý tài chính cá nhân dịu êm, hiện đại với phong cách **"Cuốn sổ tay tài chính xinh xắn kết hợp trợ lý ảo Cozy"**.

Ứng dụng tập trung trả lời câu hỏi cốt lõi mỗi ngày:
> **"Tuần này mình còn bao nhiêu tiền để tiêu?"**

---

## 🌟 1. Triết Lý Sản Phẩm & Quy Tắc Vàng

### 🔒 Quy Tắc Vàng: Ngân Sách Tuần Cố Định (Locked Weekly Budget)
- **Không dồn tiền**: Ngân sách tuần sau khi chốt là cố định độc lập (ví dụ `1.500.000đ/tuần`). Tiền thừa hay thiếu của tuần trước **tuyệt đối không tự động dồn sang tuần sau**.
- **Công thức bất biến**:  
  $$\text{Còn lại tuần} = \text{Ngân sách tuần đã khóa} - \text{Đã tiêu trong tuần}$$
- **Mỗi tuần là một khởi đầu mới**: Không phán xét hay tạo cảm giác áp lực tội lỗi khi chi tiêu, giúp người dùng quản lý tiền bạc thật nhẹ nhàng.

### 📱 Mobile-First & Desktop Guard
- Được thiết kế trọn vẹn dành riêng cho trải nghiệm thao tác một tay trên điện thoại di động.
- Khi truy cập ở màn hình lớn hơn mobile (`width > 500px`), ứng dụng sẽ hiển thị màn hình thông báo:
  > *"Ứng dụng chưa phục vụ trên website, vui lòng chuyển sang dạng mobile."*
- Tích hợp sẵn nút bấm **"Mở chế độ mô phỏng điện thoại (Mobile Frame Simulator)"** để người dùng và lập trình viên tiện kiểm thử ngay trên trình duyệt máy tính.

---

## 🚀 2. Các Tính Năng Đã Triển Khai

### 🔐 Bảo Vệ Mật Khẩu Truy Cập (`PasswordGate`)
- Màn hình khóa xinh xắn xuất hiện khi vừa truy cập ứng dụng.
- Xác thực mật khẩu thông qua API bảo mật đối chiếu với biến `PASSWORD_KEY` trong file `.env`.
- Duy trì phiên đăng nhập (session) an toàn trong **24 giờ (1 ngày)** bằng `localStorage`.

### 🎨 Tùy Biến Giao Diện & Chế Độ Sáng/Tối (`ThemeModal`)
- Nút bấm góc trên bên phải thanh Header (thay thế cho chuông thông báo) cho phép mở menu tùy biến giao diện trực quan:
  - **Chế độ hiển thị (Mode)**: Chuyển đổi giữa **Giao diện sáng (Light Mode ☀️)** và **Giao diện tối (Dark Mode 🌙)**.
  - **Tông màu chủ đạo (Color Themes)**: Lựa chọn 5 bảng màu dễ thương:
    - 🌱 Mầm xanh (Sprout Green)
    - 🌸 Hồng phấn (Cozy Pink)
    - 🌊 Biển xanh (Soft Ocean)
    - 💜 Oải hương (Lavender)
    - 🍯 Mật ong (Warm Amber)
  - Tự động lưu lựa chọn của người dùng vào `localStorage` và cập nhật tức thời trên toàn bộ ứng dụng.

### 🏠 Dashboard (Trang Chủ)
- **Hero Card Tuần Này**: Hiển thị siêu nổi bật con số khả dụng để tiêu tuần này kèm thanh tiến độ và thông điệp khích lệ đáng yêu.
- **Biến Động Chi Tiêu**: Biểu đồ cột ngang tối giản cute so sánh chi tiêu giữa các tháng thực tế trong cơ sở dữ liệu.
- **Tiền Đã Đi Đâu? 👀**: Tổng hợp chi tiêu theo từng danh mục (Ăn uống, Di chuyển, Mua sắm, Giải trí, Khác) với các icon tròn thân thiện.
- **Tháng Gần Đây**: Thẻ lịch sử các tháng trước để người dùng tiện nhìn lại hành trình chi tiêu.

### 📅 Chi Tiết Tháng (`/dashboard/month/[monthId]`)
- **Tổng quan dòng tiền**: Chi tiết tiền ban đầu, chi phí cố định đã trừ, ngân sách khả dụng, tổng đã chi và số dư thực tế còn lại.
- **Thẻ Quy tắc vàng**: Minh họa và giải thích rõ ràng nguyên tắc khóa ngân sách tuần.
- **Tiến độ từng tuần**: Theo dõi trực quan trạng thái từng tuần trong tháng (Tuần 1, 2, 3, 4...).
- **Lịch sử chi tiêu**: Danh sách giao dịch chi tiêu bo tròn, hỗ trợ lọc theo tuần hoặc danh mục và thao tác xóa chi tiêu.

### 🤖 Trợ Lý Ảo Cozy AI (`CozyAssistant`)
- Mở trực tiếp thông qua tab **Cozy AI** ở thanh Bottom Navigation.
- Ứng dụng mô hình **Intent + Parser độc lập** (không phụ thuộc API AI bên ngoài):
  - **Ghi chi tiêu bằng ngôn ngữ tự nhiên**: Người dùng gõ *"chi 50k ăn sáng"*, *"mua áo 200k"*, *"uống cf 30k"* -> Cozy AI tự động nhận diện số tiền, danh mục, mô tả và hiển thị **Thẻ xác nhận (Confirmation Card)** trước khi lưu vào DB.
  - **Nhận diện số tiền tiếng Việt thông minh**: Hỗ trợ `50k`, `100k`, `1.5tr`, `1 triệu`, `50.000`...
  - **Nhận diện danh mục qua từ khóa**: Tự động phân loại Ăn uống, Di chuyển, Mua sắm, Giải trí, Cố định/Hóa đơn.
  - **Các câu lệnh tra cứu nhanh**:
    - *"tuần này còn bao nhiêu"*
    - *"ngân sách tuần"*
    - *"tháng này đã tiêu bao nhiêu"*
    - *"chi phí cố định"*
    - *"tháng này"*
    - *"giúp tôi"*

### 🌱 Khởi Tạo Chu Kỳ Tháng Mới (`NewMonthWizard`)
- Quy trình 3 bước hướng dẫn trực quan:
  1. Nhập số tiền ban đầu trong tháng.
  2. Tự thêm các khoản chi phí cố định thực tế.
  3. Hệ thống tính toán đề xuất ngân sách tuần an toàn và cho phép người dùng tùy chỉnh trước khi bấm **Chốt ngân sách 🔒**.
- **CozySelect Dropdown**: Đã thay thế toàn bộ dropdown HTML native bằng component custom bo tròn mượt mà, loại bỏ triệt để lỗi văng tọa độ của trình duyệt trên thiết bị di động.

### 💸 Thêm Khoản Chi (`ExpenseModal`)
- Modal mở nhanh từ Dashboard hoặc Chi tiết tháng.
- Phím tắt chọn nhanh số tiền: `+30.000đ`, `+50.000đ`, `+100.000đ`, `+200.000đ`, `+500.000đ`.
- Hiệu ứng pháo hoa confetti và toast thông báo nhẹ nhàng sau khi lưu thành công.

### ⚙️ Cài Đặt & Quản Lý Chi Phí Cố Định (`SettingsView`)
- Thông tin cá nhân người dùng và nút khóa sổ tay (đăng xuất).
- Form cho phép **tự thêm hoặc xóa bớt chi phí cố định** cho tháng hiện tại lưu thẳng vào database.
- Nút khởi tạo chu kỳ tháng mới bất cứ khi nào.

---

## 🛠️ 3. Kiến Trúc Kỹ Thuật (Tech Stack)

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Modern Vanilla CSS Tokens, Quicksand Font |
| **Database** | PostgreSQL ([Neon Serverless](https://neon.tech/) Pooler connection) |
| **Driver DB** | `pg` (Node Postgres Pool) |
| **Icons & UI** | `lucide-react`, `canvas-confetti` |

---

## 🗄️ 4. Cơ Sở Dữ Liệu & Hệ Thống API

Cơ sở dữ liệu PostgreSQL gồm 4 bảng chính có quan hệ khóa ngoại:
1. `months`: Lưu thông tin chu kỳ tháng, số tiền ban đầu, ngân sách tuần đã khóa, trạng thái (`ACTIVE`, `ARCHIVED`).
2. `fixed_expenses`: Các khoản chi cố định (tiền nhà, internet, điện thoại...) gắn với từng tháng.
3. `weeks`: Danh sách các khoảng tuần theo ngày thực tế trong tháng.
4. `expenses`: Chi tiết từng giao dịch chi tiêu (số tiền, danh mục, mô tả, ví, ngày).

### Các API Routes Đã Xây Dựng:
- `POST /api/auth/verify`: Xác thực mật khẩu map với biến `PASSWORD_KEY` trong `.env`.
- `GET /api/finance`: Lấy toàn bộ danh sách tháng, tuần, chi phí cố định và chi tiêu.
- `POST /api/expenses`: Thêm khoản chi mới vào database.
- `DELETE /api/expenses/[id]`: Xóa khoản chi khỏi database.
- `POST /api/fixed-expenses`: Thêm chi phí cố định cho tháng vào database.
- `DELETE /api/fixed-expenses/[id]`: Xóa chi phí cố định khỏi database.
- `POST /api/months`: Tạo chu kỳ tháng mới cùng các tuần độc lập.

---

## ⚙️ 5. Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc của dự án:
```env
DATABASE_URL=postgresql://neondb_owner:...@ep-...-pooler.ap-southeast-1.aws.neon.tech/PiggyBalace?sslmode=require
PASSWORD_KEY=Congchua1802
```

### 2. Cài đặt các thư viện
```bash
yarn install
# hoặc
npm install
```

### 3. Chạy Migration tạo bảng Database (Chạy 1 lần duy nhất)
```bash
yarn db:migrate
# hoặc
node scripts/migrate.js
```
> *Lưu ý: Ứng dụng khi build hoặc chạy dev server sẽ chỉ đọc/ghi dữ liệu, không bao giờ chạy lại migration hay xóa dữ liệu của bạn.*

### 4. Khởi chạy Development Server
```bash
yarn dev
# hoặc
npm run dev
```

Truy cập: **[http://localhost:3000](http://localhost:3000)**  
Nhập mật khẩu (`PASSWORD_KEY`) để mở khóa và bắt đầu quản lý tài chính!
