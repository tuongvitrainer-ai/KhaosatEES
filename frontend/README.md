# Employee Survey Frontend

Frontend React application cho ứng dụng khảo sát mức độ gắn bó nhân viên.

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình

Ứng dụng sẽ tự động kết nối với backend API tại `http://localhost:5000` (thông qua proxy trong package.json).

Nếu backend chạy trên port khác, cập nhật `proxy` trong `package.json`.

## Chạy ứng dụng

### Development mode

```bash
npm start
```

Ứng dụng sẽ mở tại: `http://localhost:3000`

### Production build

```bash
npm run build
```

Build files sẽ được tạo trong thư mục `build/`.

## Cấu trúc ứng dụng

### Components

- **Auth**: Login, ProtectedRoute
- **Survey**: SurveyQuestion, LikertScale, ProgressBar, SurveyComplete
- **Admin**: Dashboard, UserManagement, Reports
- **Common**: Header, Footer, Loading

### Routes

- `/login` - Trang đăng nhập
- `/survey` - Trang làm khảo sát (user)
- `/complete` - Trang hoàn thành khảo sát
- `/admin` - Dashboard quản trị
- `/admin/users` - Quản lý người dùng
- `/admin/reports` - Báo cáo và thống kê

## Tính năng

### Cho nhân viên

- Đăng nhập bằng mã nhân viên
- Làm khảo sát với giao diện Likert scale
- Theo dõi tiến độ hoàn thành
- Lưu tự động sau mỗi câu trả lời
- Điều hướng qua lại giữa các câu hỏi

### Cho admin

- Dashboard với thống kê tổng quan
- Quản lý danh sách người dùng
- Xem báo cáo chi tiết
- Đồng bộ dữ liệu lên Google Sheets
- Kích hoạt/khóa tài khoản người dùng

## Responsive Design

Ứng dụng được thiết kế responsive, hoạt động tốt trên:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Thay đổi màu sắc chủ đạo

Chỉnh sửa các giá trị màu trong inline styles của components:

- Primary: `#3498db` (xanh dương)
- Success: `#27ae60` (xanh lá)
- Warning: `#f39c12` (cam)
- Danger: `#e74c3c` (đỏ)

### Thêm logo công ty

Thêm logo vào Header component trong `src/components/Common/Header.jsx`.

## Troubleshooting

### Lỗi kết nối API

Kiểm tra:
- Backend server đang chạy trên port 5000
- Proxy configuration trong package.json
- CORS settings trong backend

### Lỗi 401 (Unauthorized)

Token đã hết hạn hoặc không hợp lệ. Đăng xuất và đăng nhập lại.

### Lỗi hiển thị

Xóa cache trình duyệt hoặc sử dụng incognito mode.
