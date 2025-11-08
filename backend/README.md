# Employee Survey Backend API

Backend API cho ứng dụng khảo sát mức độ gắn bó nhân viên.

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Copy file `.env.example` thành `.env` và cập nhật các thông tin cần thiết:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
- `JWT_SECRET`: Thay đổi thành một chuỗi bí mật mạnh (tối thiểu 32 ký tự)
- `GOOGLE_SHEET_ID`: ID của Google Sheet (nếu sử dụng tính năng sync)
- Các cấu hình khác theo nhu cầu

### 3. Khởi tạo database

```bash
npm run init-db
```

Lệnh này sẽ:
- Tạo database SQLite
- Tạo tất cả các bảng theo schema
- Tạo tài khoản admin mặc định (employee_id: `admin`, password: `Admin@123`)
- Tạo khảo sát mẫu với 20 câu hỏi

**⚠️ Quan trọng:** Đổi mật khẩu admin ngay sau khi đăng nhập lần đầu!

### 4. Cấu hình Google Sheets (Tùy chọn)

Nếu muốn sử dụng tính năng đồng bộ Google Sheets:

1. Tạo Google Cloud Project và enable Google Sheets API
2. Tạo Service Account và download credentials JSON
3. Lưu file credentials vào `backend/credentials/google-credentials.json`
4. Tạo Google Sheet và share với email của Service Account
5. Copy Sheet ID vào file `.env`

## Chạy ứng dụng

### Development mode (với nodemon)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/change-password` - Đổi mật khẩu

### Survey (User)

- `GET /api/surveys/active` - Lấy khảo sát đang active
- `GET /api/surveys/:surveyId/progress` - Lấy tiến độ làm khảo sát
- `POST /api/responses/submit` - Gửi câu trả lời
- `POST /api/responses/complete` - Hoàn thành khảo sát
- `GET /api/responses/survey/:surveyId` - Lấy câu trả lời của user

### Admin

- `GET /api/admin/users` - Danh sách tất cả users
- `POST /api/admin/users` - Tạo user mới
- `PUT /api/admin/users/:id` - Cập nhật user
- `DELETE /api/admin/users/:id` - Xóa user
- `POST /api/admin/users/:id/reset-password` - Reset password user
- `GET /api/admin/surveys` - Danh sách surveys
- `POST /api/admin/surveys` - Tạo survey mới
- `PUT /api/admin/surveys/:id` - Cập nhật survey
- `POST /api/admin/questions` - Tạo câu hỏi mới
- `PUT /api/admin/questions/:id` - Cập nhật câu hỏi
- `DELETE /api/admin/questions/:id` - Xóa câu hỏi
- `GET /api/admin/surveys/:surveyId/responses` - Xem responses
- `GET /api/admin/surveys/:surveyId/summary` - Báo cáo tổng hợp
- `POST /api/admin/surveys/:surveyId/sync` - Đồng bộ lên Google Sheets

## Database

Database sử dụng SQLite, file database được lưu tại `backend/data/database.sqlite`.

### Backup database

```bash
cp data/database.sqlite data/database.backup.sqlite
```

### Reset database

```bash
rm data/database.sqlite
npm run init-db
```

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Database và Google Sheets config
│   ├── middleware/      # Authentication và validation
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── models/          # Database schema
│   ├── services/        # External services (Google Sheets)
│   └── server.js        # Main server file
├── data/                # SQLite database
├── credentials/         # Google credentials (gitignored)
├── .env                 # Environment variables (gitignored)
└── package.json
```

## Bảo mật

- JWT authentication với bcrypt password hashing
- Rate limiting để chống brute force
- Input validation với express-validator
- SQL injection prevention với parameterized queries
- CORS configuration
- Environment variables cho sensitive data

## Troubleshooting

### Lỗi kết nối database

Kiểm tra xem thư mục `data/` đã được tạo chưa và có quyền ghi.

### Lỗi Google Sheets

- Kiểm tra credentials file có đúng vị trí
- Kiểm tra Service Account có được share quyền truy cập Sheet
- Kiểm tra GOOGLE_SHEET_ID trong `.env`

### Port đã được sử dụng

Thay đổi PORT trong file `.env`.
