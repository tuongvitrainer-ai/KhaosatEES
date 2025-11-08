# Sample Data và Test Users

## Admin Account (Mặc định)

**Đã được tạo tự động khi chạy `npm run init-db`**

- **Mã nhân viên:** `admin`
- **Mật khẩu:** `Admin@123`
- **Quyền:** Administrator

⚠️ **Lưu ý:** Đổi mật khẩu ngay sau khi đăng nhập lần đầu!

## Sample Survey

Khảo sát mẫu được tạo tự động bao gồm:

- **Tên:** Khảo sát mức độ gắn bó nhân viên 2024
- **Số câu hỏi:** 20 câu
- **Thang điểm:** Likert 5 điểm
- **5 Danh mục:**
  1. Môi trường làm việc (4 câu)
  2. Lãnh đạo và quản lý (4 câu)
  3. Phát triển nghề nghiệp (4 câu)
  4. Đãi ngộ và phúc lợi (4 câu)
  5. Văn hóa tổ chức (4 câu)

## Tạo Test Users

### Cách 1: Tạo từng user qua giao diện Admin

1. Đăng nhập admin
2. Vào **Quản lý người dùng** → **Tạo người dùng mới**
3. Nhập thông tin:
   - Mã NV: `NV001`
   - Mật khẩu: `Test@123`
   - Họ tên: `Nguyễn Văn A`
   - Phòng ban: `Kỹ thuật`
   - Email: `nguyenvana@company.com`

### Cách 2: Tạo nhiều users bằng API

Sử dụng Postman hoặc curl:

```bash
# Đăng nhập admin để lấy token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "admin",
    "password": "Admin@123"
  }'

# Tạo user mới (thay YOUR_TOKEN bằng token nhận được)
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "employee_id": "NV001",
    "password": "Test@123",
    "full_name": "Nguyễn Văn A",
    "department": "Kỹ thuật",
    "position": "Nhân viên",
    "email": "nguyenvana@company.com"
  }'
```

### Cách 3: Import từ file CSV

Format file CSV:

```csv
employee_id,password,full_name,department,position,email
NV001,Test@123,Nguyễn Văn A,Kỹ thuật,Nhân viên,nguyenvana@company.com
NV002,Test@123,Trần Thị B,Kinh doanh,Trưởng nhóm,tranthib@company.com
NV003,Test@123,Lê Văn C,Marketing,Nhân viên,levanc@company.com
```

## Sample Test Users

Bạn có thể tạo các user mẫu sau để test:

| Mã NV | Mật khẩu | Họ tên | Phòng ban | Vị trí |
|-------|----------|--------|-----------|--------|
| NV001 | Test@123 | Nguyễn Văn A | Kỹ thuật | Nhân viên |
| NV002 | Test@123 | Trần Thị B | Kinh doanh | Trưởng nhóm |
| NV003 | Test@123 | Lê Văn C | Marketing | Nhân viên |
| NV004 | Test@123 | Phạm Văn D | Nhân sự | Chuyên viên |
| NV005 | Test@123 | Hoàng Thị E | Kế toán | Nhân viên |

## Test Workflow

1. **Tạo test users** (ít nhất 5 users)
2. **Login bằng từng user** và làm khảo sát
3. **Login admin** để xem:
   - Dashboard với thống kê
   - Danh sách users và progress
   - Báo cáo chi tiết
4. **Test Google Sheets sync** (nếu đã cấu hình)

## Scenarios để Test

### Scenario 1: User làm khảo sát hoàn chỉnh
1. Login user NV001
2. Trả lời tất cả 20 câu hỏi
3. Submit khảo sát
4. Kiểm tra completion status

### Scenario 2: User làm dở khảo sát
1. Login user NV002
2. Trả lời 10/20 câu
3. Logout
4. Login lại → Kiểm tra có tiếp tục được không

### Scenario 3: Admin quản lý
1. Login admin
2. Xem dashboard
3. Kiểm tra progress của từng user
4. Export/Sync dữ liệu

### Scenario 4: Khóa/Mở khóa user
1. Admin khóa user NV003
2. User NV003 login → Không được phép
3. Admin mở khóa lại
4. User NV003 login lại thành công

## Reset Data

Nếu muốn reset toàn bộ dữ liệu và bắt đầu lại:

```bash
cd backend
rm data/database.sqlite
npm run init-db
```

**Lưu ý:** Lệnh này sẽ xóa TẤT CẢ dữ liệu hiện có!
