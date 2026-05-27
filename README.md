# 🎓 EduTrade — Chợ Mua Bán Đồ Cũ Sinh Viên

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?logo=vite)](https://vitejs.dev/)
[![Routing](https://img.shields.io/badge/React_Router-v6-red.svg?logo=react-router)](https://reactrouter.com/)
[![Storage](https://img.shields.io/badge/Storage-localStorage-orange.svg?logo=google-chrome)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![Deploy](https://img.shields.io/badge/Deploy-Netlify-00AD9F.svg?logo=netlify)](https://www.netlify.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**EduTrade** là một ứng dụng web demo hỗ trợ mua bán, trao đổi đồ cũ được thiết kế và tối ưu hóa riêng cho cộng đồng sinh viên tại các trường Đại học/Cao đẳng tại Việt Nam.

👉 **Link Demo trực tuyến**: [https://resplendent-mochi-aa8cdd.netlify.app/](https://resplendent-mochi-aa8cdd.netlify.app/)

Dự án được xây dựng hoàn toàn ở phía Client (Pure Frontend) sử dụng **React**, **TypeScript**, **Vite** và lưu trữ dữ liệu cục bộ thông qua **localStorage** & **sessionStorage**.

---

## 🎯 Điểm Đặc Trưng Cốt Lõi

1. **Giới hạn đăng ký bằng Email sinh viên (`@*.edu.vn`)**:
   * Chỉ những người dùng sở hữu email kết thúc bằng đuôi `.edu.vn` (ví dụ: `abc@sis.hust.edu.vn`, `xyz@neu.edu.vn`, `user@vnu.edu.vn`) mới có thể đăng ký tài khoản và đăng tin hoặc liên hệ mua bán.
2. **Bảo mật & Ẩn thông tin liên hệ của người bán**:
   * Khách vãng lai (chưa đăng nhập) chỉ được xem danh sách sản phẩm và chi tiết sản phẩm cơ bản (tiêu đề, giá, hình ảnh, mô tả).
   * **Thông tin liên hệ nhạy cảm** (Số điện thoại, liên kết chat) và tính năng nhắn tin sẽ **bị khóa ẩn** và yêu cầu người dùng phải đăng nhập bằng tài khoản sinh viên hợp lệ để xem.

---

## 💻 Luồng Người Dùng & Các Tính Năng Chính

```
[ Khách vãng lai (Chưa đăng nhập) ]
   ├── ✅ Xem danh sách sản phẩm (Home)
   ├── ✅ Tìm kiếm & Lọc sản phẩm theo danh mục & mức giá
   ├── ✅ Xem trang chi tiết sản phẩm
   └── 🔒 Bị ẩn thông tin liên hệ & nút Chat (Yêu cầu đăng nhập)

[ Thành viên sinh viên (Đã đăng nhập bằng email @*.edu.vn) ]
   ├── ✅ Tất cả các tính năng của khách vãng lai
   ├── ✅ Mở khóa xem Số điện thoại & nút liên kết nhanh nhắn tin với người bán
   ├── ✅ Đăng tin bán hàng mới (tải ảnh tự động, chọn danh mục, tình trạng, giá, địa điểm)
   ├── ✅ Chat Mock trực tiếp với người bán (gửi và nhận tin nhắn theo thời gian thực mô phỏng)
   ├── ✅ Hộp thư (Inbox) quản lý tập trung tất cả các cuộc hội thoại
   ├── ✅ Wishlist (Danh sách sản phẩm yêu thích)
   └── ✅ Quản lý tin đăng cá nhân (Xem danh sách đã đăng & Xóa tin bán)
```

### Chi tiết các trang chính:
* **Trang chủ (`/`)**: Hiển thị danh sách sản phẩm với các bộ lọc phân loại theo danh mục (Sách, Điện tử, Quần áo, Nội thất, Khác), sắp xếp (Mới nhất, Giá tăng dần, Giá giảm dần) và thanh tìm kiếm sản phẩm.
* **Chi tiết sản phẩm (`/san-pham/:id`)**: Xem đầy đủ mô tả, tình trạng, địa điểm của sản phẩm. Tích hợp nút lưu yêu thích, ô chat trực tiếp với người bán và hiển thị thông tin điện thoại.
* **Hộp thư (`/hop-thu`)**: Quản lý tất cả các cuộc trò chuyện đang diễn ra của người dùng với những người bán/người mua khác theo từng sản phẩm.
* **Trang cá nhân (`/ca-nhan`)**: Hiển thị thông tin sinh viên đã đăng nhập và danh sách tất cả các sản phẩm do chính sinh viên đó đăng bán (có hỗ trợ xóa tin).
* **Trang người bán (`/nguoi-ban/:sellerId`)**: Xem thông tin và danh sách tất cả sản phẩm đang bán của một người dùng cụ thể.
* **Yêu thích (`/yeu-thich`)**: Lưu trữ danh sách các sản phẩm mà người dùng đã bấm thả tim.
* **Đăng ký / Đăng nhập (`/dang-ky` & `/dang-nhap`)**: Giao diện đăng ký xác thực định dạng email `.edu.vn` và đăng nhập quản lý phiên làm việc thông qua `sessionStorage`.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Lựa chọn công nghệ | Ghi chú |
| :--- | :--- | :--- |
| **Framework** | React 18 | Thư viện xây dựng giao diện người dùng |
| **Ngôn ngữ** | TypeScript 5 | Tự động kiểm tra kiểu dữ liệu tĩnh nghiêm ngặt |
| **Build tool** | Vite 5 | Công cụ đóng gói mã nguồn siêu nhanh |
| **Routing** | React Router DOM v6 | Quản lý điều hướng và định tuyến SPA |
| **Database/Storage** | Web Storage API | `localStorage` (dữ liệu bền vững) & `sessionStorage` (phiên đăng nhập) |
| **Styling** | CSS thuần (CSS Variables) | Không dùng framework CSS ngoài, dễ chỉnh sửa UI tùy ý |
| **Hosting** | Netlify | Hỗ trợ cấu hình chuyển hướng route để tránh lỗi 404 (`netlify.toml`) |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
edu-trade/
├── public/                      # Chứa tài nguyên tĩnh của ứng dụng
│   ├── favicon.svg              # Icon trình duyệt
│   └── placeholder.jpg          # Ảnh hiển thị mặc định khi sản phẩm lỗi ảnh
├── src/                         # Thư mục chứa toàn bộ mã nguồn React
│   ├── components/              # Các component dùng chung
│   │   ├── Navbar.tsx           # Thanh điều hướng trên cùng (tìm kiếm, trạng thái đăng nhập)
│   │   ├── ProductCard.tsx      # Thẻ hiển thị nhanh thông tin sản phẩm
│   │   └── ProtectedRoute.tsx   # Bộ định tuyến bảo vệ (bắt buộc đăng nhập)
│   ├── contexts/
│   │   └── AuthContext.tsx      # Quản lý Đăng nhập, Đăng ký, Đăng xuất, Lưu phiên
│   ├── data/
│   │   └── products.ts          # Chứa dữ liệu sản phẩm mẫu (seed data) & hàm CRUD localStorage
│   ├── hooks/                   # Các React hook tự thiết kế
│   │   ├── useMessages.ts       # Hook xử lý gửi/nhận tin nhắn chat mock
│   │   └── useWishlist.ts       # Hook lưu/xóa sản phẩm khỏi danh sách yêu thích
│   ├── pages/                   # Các trang cấu thành ứng dụng
│   │   ├── CreatePage.tsx       # Trang đăng tin sản phẩm mới
│   │   ├── DetailPage.tsx       # Trang thông tin chi tiết & Box chat nhanh
│   │   ├── HomePage.tsx         # Trang chủ tìm kiếm và lọc danh mục
│   │   ├── InboxPage.tsx        # Trang hộp thư quản lý hội thoại
│   │   ├── LoginPage.tsx        # Giao diện đăng nhập sinh viên
│   │   ├── ProfilePage.tsx      # Trang quản lý hồ sơ cá nhân và tin đã đăng
│   │   ├── RegisterPage.tsx     # Giao diện tạo tài khoản mới (@*.edu.vn)
│   │   ├── SellerPage.tsx       # Xem hồ sơ các mặt hàng của một người bán
│   │   └── WishlistPage.tsx     # Trang xem danh sách sản phẩm đã lưu
│   ├── App.tsx                  # Cấu hình routing cho toàn bộ ứng dụng
│   ├── index.css                # Style CSS toàn cục & định nghĩa bảng màu biến thể
│   ├── main.tsx                 # Điểm khởi tạo ứng dụng React
│   └── types.ts                 # Định nghĩa Interface TypeScript & Hằng số dùng chung
├── index.html                   # File HTML gốc của ứng dụng
├── LICENSE                      # Giấy phép mã nguồn mở MIT
├── netlify.toml                 # File cấu hình deploy & redirect cho Netlify
└── package.json                 # Khai báo thư viện phụ thuộc và scripts
```

---

## 🚀 Hướng Dẫn Chạy Dự Án Dưới Local

### Yêu Cầu Hệ Thống
* Đã cài đặt **Node.js** (Phiên bản v18 trở lên được khuyến nghị)
* Đã cài đặt **npm** hoặc **yarn** hoặc **pnpm**

### Các Bước Thực Hiện:

1. **Di chuyển vào thư mục dự án**:
   ```bash
   cd edu-trade
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

3. **Chạy ứng dụng ở chế độ phát triển (Development Mode)**:
   ```bash
   npm run dev
   ```
   *Ứng dụng sẽ khởi chạy tại đường dẫn: `http://localhost:5173`*

4. **Kiểm tra bản build sản phẩm (Production Build)**:
   ```bash
   npm run build
   ```
   *Thư mục `dist/` chứa mã nguồn tối ưu hóa cho deploy sẽ được tạo ra.*

---

## 💾 Thiết Kế Cơ Sở Dữ Liệu Cục Bộ (localStorage Schema)

Vì đây là ứng dụng Pure Frontend, toàn bộ dữ liệu được lưu trữ trong trình duyệt người dùng qua các key sau:

1. `edutrade_products` (Mảng `Product[]`): Lưu thông tin các tin đăng mới do người dùng tạo (không bao gồm dữ liệu mẫu).
2. `edutrade_users` (Mảng `User[]`): Lưu danh sách thông tin tài khoản sinh viên đã đăng ký trên thiết bị.
3. `edutrade_passwords` (Object `{ [userId]: string }`): Lưu mật khẩu của người dùng đã được mã hóa (băm) bằng thuật toán SHA-256.
4. `edutrade_messages` (Mảng `Message[]`): Lưu lịch sử toàn bộ các tin nhắn trò chuyện qua lại.
5. `edutrade_wishlist_<userId>` (Mảng `string[]`): Lưu danh sách `id` của sản phẩm yêu thích tương ứng với từng tài khoản sinh viên.
6. `edutrade_session` (sessionStorage) (Đối tượng `User | null`): Quản lý tài khoản đang đăng nhập trong phiên tab hiện tại.
