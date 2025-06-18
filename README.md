# Hotel Management Backend

Đây là project backend được xây dựng bằng **Node.js** và **MySQL** cho hệ thống quản lý khách sạn, bao gồm các chức năng quản lý đặt phòng, loại phòng, dịch vụ, tài khoản admin và tài khoản khách hàng.

## 🛠️ Yêu cầu cài đặt

- Node.js (v16 hoặc mới hơn)
- MySQL Server (XAMPP hoặc server riêng)
- Postman (hoặc công cụ test API tương tự)

## 📦 Các thư viện sử dụng (npm packages)

- express
- mysql2
- dotenv
- jsonwebtoken
- bcryptjs
- nodemailer

Cài đặt bằng lệnh:

```bash
npm install express mysql2 dotenv jsonwebtoken bcryptjs nodemailer
```

## 📁 Cấu trúc thư mục

```
project-root/
├── controllers/
├── middlewares/
├── routes/
├── db.js
├── .env
└── index.js
```

## ⚙️ Cài đặt

### 1. Clone project và cài package

```bash
git clone <link-repo>
cd project-root
npm install
```

### 2. Tạo file `.env`

Tạo file `.env` tại thư mục gốc với nội dung:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=HotelDB
DB_PORT=3306
PORT=3000
JWT_SECRET=super_secret_key_123
MAIL_USER=hoanghaiyencbm@gmail.com
MAIL_PASS=efztxixzuflpkdso
```

> Ghi chú: Nếu dùng XAMPP thì `DB_HOST=127.0.0.1` và `DB_USER=root`, `DB_PASSWORD=` để trống nếu bạn không đặt mật khẩu cho MySQL.

### 3. Cấu hình Database

- Mở `phpMyAdmin` hoặc công cụ MySQL bạn dùng
- Tạo database tên `HotelDB` (hoặc theo tên trong `.env`)
- Import file `.sql` chứa cấu trúc bảng (nếu có)

## ▶️ Chạy server

```bash
npm start
```

Mặc định server sẽ chạy tại: `http://localhost:3000`

---

## 📌 Danh sách API

### Auth Admin

| Method | Endpoint   | Mô tả              |
|--------|------------|--------------------|
| POST   | /signin    | Đăng nhập admin    |

---

### Web Booking (Khách hàng)

| Method | Endpoint                     | Mô tả                        |
|--------|-------------------------------|-------------------------------|
| POST   | /bookingweb/signup           | Đăng ký tài khoản khách       |
| POST   | /bookingweb/signin           | Đăng nhập tài khoản khách     |
| POST   | /bookingweb/forgot-password  | Gửi mã OTP qua email          |
| POST   | /bookingweb/verify-otp       | Xác minh OTP và đổi mật khẩu  |

---

### Frontdesk Booking

| Method | Endpoint                        | Mô tả                        |
|--------|----------------------------------|-------------------------------|
| POST   | /frontdesk/create-booking       | Tạo booking mới               |
| GET    | /frontdesk/bookings             | Lấy tất cả booking            |
| GET    | /frontdesk/booking/:id          | Xem chi tiết 1 booking        |
| PUT    | /frontdesk/booking/:id          | Cập nhật thông tin booking    |

---

### Room Types (Admin)

> ⚠️ Yêu cầu Bearer Token từ admin

| Method | Endpoint                 | Mô tả                    |
|--------|---------------------------|---------------------------|
| GET    | /roomType                 | Lấy danh sách loại phòng  |
| POST   | /roomType                 | Thêm loại phòng           |
| PUT    | /roomType/:roomTypeID     | Sửa loại phòng            |
| DELETE | /roomType/:roomTypeID     | Xóa loại phòng            |

---

### Services (Admin)

> ⚠️ Yêu cầu Bearer Token từ admin

| Method | Endpoint                 | Mô tả                  |
|--------|---------------------------|-------------------------|
| GET    | /service                  | Lấy danh sách dịch vụ   |
| POST   | /service                  | Thêm dịch vụ            |
| PUT    | /service/:serviceID       | Sửa dịch vụ             |
| DELETE | /service/:serviceID       | Xóa dịch vụ             |

---



## 🗄️ Hướng dẫn cài đặt Database MySQL

### 1. Tạo database trống

Mở `phpMyAdmin` hoặc công cụ MySQL khác

> Hoặc bạn có thể tạo trực tiếp khi import file `.sql` (bước sau).

---

### 2. Import file SQL có sẵn

Giả sử file bạn có tên là `hotel_schema.sql` nằm trong thư mục gốc của project (đã push lên Git), thực hiện theo một trong hai cách:

#### ✅ Dùng phpMyAdmin

1. Truy cập `http://localhost/phpmyadmin`
2. Chọn database `HotelDB`
3. Chọn tab **Import**
4. Upload file `hotel_schema.sql`
5. Nhấn **Go** để hoàn tất

#### ✅ Cách 2: Dùng dòng lệnh MySQL

```bash
mysql -u root -p HotelDB < hotel_schema.sql
```

> Thay `root` và `HotelDB` bằng thông tin phù hợp với máy của bạn

---

### 3. Khởi động lại backend

```bash
npm start
```

Sau khi import, hệ thống backend có thể hoạt động bình thường với các bảng và dữ liệu đã có sẵn.
