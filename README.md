# Web-Based Application Khảo Sát Mức Độ Gắn Bó Nhân Viên

Ứng dụng web hoàn chỉnh để triển khai khảo sát mức độ gắn bó nhân viên với thang điểm Likert, hỗ trợ 4000+ nhân viên, tích hợp Google Sheets để lưu trữ kết quả.

## Tổng quan

### Công nghệ sử dụng

**Backend:**
- Node.js + Express.js
- SQLite (database nhẹ, không cần server)
- JWT Authentication
- Google Sheets API v4
- Bcrypt (mã hóa password)

**Frontend:**
- React.js
- React Router DOM
- Axios (HTTP client)
- Inline CSS (không cần cài đặt thư viện CSS)

### Tính năng chính

**Cho nhân viên:**
- ✅ Đăng nhập bằng mã nhân viên
- ✅ Làm khảo sát với giao diện Likert scale (5 hoặc 7 điểm)
- ✅ Theo dõi tiến độ real-time
- ✅ Lưu tự động, có thể tạm dừng và tiếp tục
- ✅ Responsive trên mọi thiết bị

**Cho quản trị viên:**
- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý danh sách 4000+ nhân viên
- ✅ Tạo và quản lý khảo sát, câu hỏi
- ✅ Báo cáo chi tiết theo danh mục và câu hỏi
- ✅ Đồng bộ tự động lên Google Sheets
- ✅ Export dữ liệu

## Hướng dẫn cài đặt

### Yêu cầu hệ thống

- Node.js 16+ (tải tại: https://nodejs.org/)
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- RAM tối thiểu: 4GB
- Dung lượng ổ đĩa: 500MB

### Bước 1: Clone hoặc download project

```bash
git clone <repository-url>
cd KhaosatEES
```

### Bước 2: Cài đặt Backend

```bash
cd backend
npm install
```

### Bước 3: Cấu hình Backend

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Chỉnh sửa file .env (quan trọng!)
# - Thay đổi JWT_SECRET thành chuỗi bí mật mạnh
# - Cập nhật thông tin admin mặc định
```

### Bước 4: Khởi tạo Database

```bash
npm run init-db
```

Lệnh này sẽ:
- Tạo database SQLite
- Tạo tất cả các bảng
- Tạo admin user (mã NV: `admin`, mật khẩu: `Admin@123`)
- Tạo khảo sát mẫu với 20 câu hỏi

⚠️ **Quan trọng:** Đổi mật khẩu admin ngay sau khi đăng nhập lần đầu!

### Bước 5: Khởi động Backend

```bash
npm start
# hoặc npm run dev (development mode với nodemon)
```

Backend sẽ chạy tại: `http://localhost:5000`

### Bước 6: Cài đặt Frontend

Mở terminal mới:

```bash
cd frontend
npm install
```

### Bước 7: Khởi động Frontend

```bash
npm start
```

Frontend sẽ tự động mở tại: `http://localhost:3000`

## Sử dụng ứng dụng

### Đăng nhập lần đầu (Admin)

1. Truy cập `http://localhost:3000`
2. Đăng nhập với:
   - Mã nhân viên: `admin`
   - Mật khẩu: `Admin@123`
3. Đổi mật khẩu ngay lập tức

### Tạo nhân viên mới

1. Vào menu **Admin** → **Quản lý người dùng**
2. Click **Tạo người dùng mới** (hoặc import từ CSV/Excel)
3. Nhập thông tin: mã NV, họ tên, phòng ban, email, password
4. Gửi thông tin đăng nhập cho nhân viên

### Làm khảo sát (Nhân viên)

1. Nhân viên đăng nhập bằng mã NV và password
2. Hệ thống tự động chuyển đến trang khảo sát
3. Trả lời từng câu hỏi bằng Likert scale
4. Hệ thống tự động lưu sau mỗi câu trả lời
5. Có thể tạm dừng và quay lại tiếp tục
6. Sau khi trả lời xong, nhấn "Nộp bài khảo sát"

### Xem báo cáo (Admin)

1. Vào **Admin** → **Báo cáo & thống kê**
2. Xem:
   - Tỷ lệ hoàn thành
   - Điểm trung bình theo danh mục
   - Thống kê chi tiết từng câu hỏi
   - Phân bố điểm

## Cấu hình Google Sheets (Tùy chọn)

Để đồng bộ dữ liệu lên Google Sheets:

### 1. Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới
3. Enable **Google Sheets API**

### 2. Tạo Service Account

1. Trong Google Cloud Console, vào **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Điền tên và mô tả
4. Click **Create and Continue**
5. Skip phần Grant permissions
6. Click **Done**

### 3. Tạo và download credentials

1. Click vào Service Account vừa tạo
2. Vào tab **Keys**
3. Click **Add Key** → **Create new key**
4. Chọn **JSON**
5. File JSON sẽ được download
6. Đổi tên file thành `google-credentials.json`
7. Copy vào `backend/credentials/google-credentials.json`

### 4. Tạo và share Google Sheet

1. Tạo Google Sheet mới
2. Copy **Sheet ID** từ URL (phần giữa `/d/` và `/edit`)
3. Click **Share** và thêm email của Service Account (trong credentials JSON)
4. Cấp quyền **Editor**
5. Paste Sheet ID vào file `backend/.env`:
   ```
   GOOGLE_SHEET_ID=your-sheet-id-here
   AUTO_SYNC_ENABLED=true
   ```

### 5. Test đồng bộ

1. Đăng nhập admin
2. Vào Dashboard
3. Click **Đồng bộ Google Sheets**
4. Kiểm tra Google Sheet đã có dữ liệu

## Cấu trúc Database

### Các bảng chính

- **users**: Thông tin nhân viên
- **surveys**: Thông tin khảo sát
- **question_categories**: Danh mục câu hỏi
- **questions**: Câu hỏi khảo sát
- **responses**: Câu trả lời của nhân viên
- **survey_progress**: Tiến độ làm khảo sát
- **sync_log**: Log đồng bộ Google Sheets

## API Endpoints

### Authentication
```
POST   /api/auth/login          - Đăng nhập
GET    /api/auth/me             - Lấy thông tin user
POST   /api/auth/logout         - Đăng xuất
POST   /api/auth/change-password - Đổi mật khẩu
```

### Survey (User)
```
GET    /api/surveys/active           - Lấy khảo sát đang active
GET    /api/surveys/:id/progress     - Lấy tiến độ
POST   /api/responses/submit         - Gửi câu trả lời
POST   /api/responses/complete       - Hoàn thành khảo sát
```

### Admin
```
GET    /api/admin/users              - Danh sách users
POST   /api/admin/users              - Tạo user mới
PUT    /api/admin/users/:id          - Cập nhật user
DELETE /api/admin/users/:id          - Xóa user

GET    /api/admin/surveys            - Danh sách surveys
POST   /api/admin/surveys            - Tạo survey
PUT    /api/admin/surveys/:id        - Cập nhật survey

POST   /api/admin/questions          - Tạo câu hỏi
PUT    /api/admin/questions/:id      - Cập nhật câu hỏi
DELETE /api/admin/questions/:id      - Xóa câu hỏi

GET    /api/admin/surveys/:id/summary    - Báo cáo tổng hợp
POST   /api/admin/surveys/:id/sync       - Đồng bộ Google Sheets
```

## Bảo mật

- ✅ JWT authentication với expiration
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Rate limiting (100 requests/15 minutes)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS protection
- ✅ Environment variables cho sensitive data

## Backup và Restore

### Backup database

```bash
cp backend/data/database.sqlite backend/data/backup-$(date +%Y%m%d).sqlite
```

### Restore database

```bash
cp backend/data/backup-YYYYMMDD.sqlite backend/data/database.sqlite
```

### Export dữ liệu

Sử dụng tính năng đồng bộ Google Sheets để có bản backup online tự động.

## Troubleshooting

### Backend không khởi động

- Kiểm tra Node.js đã cài đúng version
- Kiểm tra port 5000 có bị chiếm bởi ứng dụng khác
- Xem logs để tìm lỗi cụ thể

### Frontend không kết nối được Backend

- Kiểm tra Backend đang chạy tại port 5000
- Xem Console trong DevTools để tìm lỗi
- Kiểm tra proxy trong frontend/package.json

### Lỗi đồng bộ Google Sheets

- Kiểm tra credentials file có đúng vị trí
- Kiểm tra Service Account được share quyền truy cập Sheet
- Kiểm tra Sheet ID trong .env

### Database bị lỗi

Reset database:
```bash
cd backend
rm data/database.sqlite
npm run init-db
```

## Production Deployment

### Khuyến nghị

1. **Đổi JWT_SECRET** thành chuỗi random mạnh (32+ ký tự)
2. **Enable HTTPS** (sử dụng nginx/apache reverse proxy)
3. **Backup database** định kỳ (hàng ngày)
4. **Monitor logs** để phát hiện lỗi sớm
5. **Rate limiting** nghiêm ngặt hơn
6. **Database** chuyển sang PostgreSQL/MySQL nếu cần (>10K users)

### Deploy lên VPS

```bash
# Backend
cd backend
npm install --production
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
# Serve build folder với nginx/apache
```

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra phần **Troubleshooting** ở trên
2. Xem logs trong terminal
3. Kiểm tra file README trong `backend/` và `frontend/`

## License

MIT License

## Changelog

### Version 1.0.0
- ✅ Khảo sát với Likert scale 5/7 điểm
- ✅ Quản lý 4000+ nhân viên
- ✅ Google Sheets integration
- ✅ Dashboard và báo cáo
- ✅ Responsive design
- ✅ Auto-save responses
