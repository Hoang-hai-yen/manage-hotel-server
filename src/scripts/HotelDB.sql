-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 20, 2025 at 05:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

USE HotelDB;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hoteldb`
--

-- --------------------------------------------------------

--
-- Table structure for table `accountbooking`
--

CREATE TABLE `accountbooking` (
  `guest_account_id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `guest_type_id` int(11) DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` text DEFAULT NULL,
  `password_hash` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accountbooking`
--

INSERT INTO `accountbooking` (`guest_account_id`, `full_name`, `cccd`, `guest_type_id`, `gender`, `birthday`, `email`, `phone_number`, `password_hash`, `created_at`) VALUES
(1, 'Zeru Nagiryu', NULL, NULL, 'Male', '2003-08-16', 'zerunagiryu@gmail.com', '0987654321', '$2b$10$eAHH1LmalDThUdT6UqogQuR1FnGKMnPQEVXiYgLOXrMCspHz7Z/UW', '2025-06-16 10:17:28');

-- --------------------------------------------------------

--
-- Table structure for table `adminaccounts`
--

CREATE TABLE `adminaccounts` (
  `admin_id` varchar(10) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('manager','receptionist') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `adminaccounts`
--

INSERT INTO `adminaccounts` (`admin_id`, `full_name`, `phone_number`, `password_hash`, `role`) VALUES
('23521847', 'Hoàng Hải Yến', '0908003798', '$2a$10$n/tOoCHQVgp0r9GxVSC/j.v0O8k6ZSXLUNdh/4UXjfM2Prza8deQO', 'receptionist');

-- --------------------------------------------------------

--
-- Table structure for table `bookingcompanions`
--

CREATE TABLE `bookingcompanions` (
  `companion_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `id_card` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `guest_type_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookingcompanions`
--

INSERT INTO `bookingcompanions` (`companion_id`, `booking_id`, `fullname`, `id_card`, `address`, `guest_type_id`) VALUES
(1, 1, 'Trần Thị B', '987654321', '456 Hai Bà Trưng, TP.HCM', 2),
(2, 1, 'Lê Văn C', '567890123', '789 Nguyễn Trãi, TP.HCM', 1),
(3, 1, 'Phạm Ngọc D', '777888999', '123 Pasteur, TP.HCM', 2),
(4, 1, 'Ngô Minh E', '888999000', '654 Trần Hưng Đạo, TP.HCM', 1);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `guest_fullname` varchar(100) DEFAULT NULL,
  `guest_id_card` varchar(20) DEFAULT NULL,
  `guest_phone` varchar(15) DEFAULT NULL,
  `guest_email` varchar(100) DEFAULT NULL,
  `guest_address` varchar(255) DEFAULT NULL,
  `guest_type_id` int(11) DEFAULT NULL,
  `check_in` date DEFAULT NULL,
  `check_out` date DEFAULT NULL,
  `room_id` varchar(10) DEFAULT NULL,
  `room_type_id` varchar(10) DEFAULT NULL,
  `adults` int(11) DEFAULT NULL CHECK (`adults` >= 0),
  `children` int(11) DEFAULT NULL CHECK (`children` >= 0),
  `nightly_rate` decimal(10,2) DEFAULT NULL,
  `payment_method` enum('Pay at hotel','Online payment','Corporate billing') DEFAULT NULL,
  `status` enum('Due In','Checked In','Checked Out') DEFAULT 'Due In',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `guest_fullname`, `guest_id_card`, `guest_phone`, `guest_email`, `guest_address`, `guest_type_id`, `check_in`, `check_out`, `room_id`, `room_type_id`, `adults`, `children`, `nightly_rate`, `payment_method`, `status`, `created_at`) VALUES
(1, 'Nguyễn Văn Test', '0123456789', '0909123456', 'testuser@gmail.com', '123 Lê Văn Sỹ, Quận 3', 1, '2025-07-01', '2025-07-04', 'A101', 'RT01', 3, 2, 120.00, 'Pay at hotel', 'Due In', '2025-06-20 14:36:35');

-- --------------------------------------------------------

--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `guest_id` int(11) NOT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `id_card` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `guest_type_id` int(11) DEFAULT NULL,
  `source_type` enum('Booking','Companion') DEFAULT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `room_id` varchar(10) DEFAULT NULL,
  `status` enum('upcoming','staying','left') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guests`
--

INSERT INTO `guests` (`guest_id`, `fullname`, `id_card`, `address`, `guest_type_id`, `source_type`, `booking_id`, `room_id`, `status`) VALUES
(1, 'Nguyễn Văn Test', '0123456789', '123 Lê Văn Sỹ, Quận 3', 1, 'Booking', 1, 'A101', 'upcoming'),
(2, 'Trần Thị B', '987654321', '456 Hai Bà Trưng, TP.HCM', 2, 'Companion', 1, 'A101', 'upcoming'),
(3, 'Lê Văn C', '567890123', '789 Nguyễn Trãi, TP.HCM', 1, 'Companion', 1, 'A101', 'upcoming'),
(4, 'Phạm Ngọc D', '777888999', '123 Pasteur, TP.HCM', 2, 'Companion', 1, 'A101', 'upcoming'),
(5, 'Ngô Minh E', '888999000', '654 Trần Hưng Đạo, TP.HCM', 1, 'Companion', 1, 'A101', 'upcoming'),
(6, 'Lê Thị Trùng', '999888777', '789 Nguyễn Trãi, TP.HCM', 1, 'Booking', NULL, 'A101', 'upcoming'),
(7, 'Nguyễn Thị P', '888777666', '123 Pasteur, TP.HCM', 2, 'Companion', NULL, 'A101', 'upcoming');

-- --------------------------------------------------------

--
-- Table structure for table `guest_types`
--

CREATE TABLE `guest_types` (
  `guest_type_id` int(11) NOT NULL,
  `guest_type_name` varchar(50) DEFAULT NULL,
  `surcharge_rate` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guest_types`
--

INSERT INTO `guest_types` (`guest_type_id`, `guest_type_name`, `surcharge_rate`) VALUES
(1, 'National', 0.00),
(2, 'International', 0.50);

-- --------------------------------------------------------

--
-- Table structure for table `invoicedetails`
--

CREATE TABLE `invoicedetails` (
  `invoice_detail_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `room_id` varchar(10) DEFAULT NULL,
  `room_type_id` varchar(10) DEFAULT NULL,
  `night_count` int(11) DEFAULT NULL CHECK (`night_count` > 0),
  `room_price` decimal(10,2) DEFAULT NULL,
  `surcharge_amount` decimal(10,2) DEFAULT NULL,
  `room_total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoicedetails`
--

INSERT INTO `invoicedetails` (`invoice_detail_id`, `booking_id`, `room_id`, `room_type_id`, `night_count`, `room_price`, `surcharge_amount`, `room_total`) VALUES
(1, 1, NULL, 'RT01', 3, 120.00, NULL, 360.00);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` varchar(10) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `total_room` decimal(10,2) DEFAULT NULL,
  `total_service` decimal(10,2) DEFAULT NULL,
  `vat_rate` decimal(3,2) DEFAULT 0.08,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `booking_id`, `guest_id`, `total_room`, `total_service`, `vat_rate`, `total_amount`, `note`) VALUES
('INV0001', 1, NULL, 360.00, 0.00, 0.08, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoiceservices`
--

CREATE TABLE `invoiceservices` (
  `invoice_service_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `service_id` varchar(10) DEFAULT NULL,
  `service_name` varchar(100) DEFAULT NULL,
  `service_price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `service_total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoiceservices`
--

INSERT INTO `invoiceservices` (`invoice_service_id`, `booking_id`, `service_id`, `service_name`, `service_price`, `quantity`, `service_total`) VALUES
(1, 1, 'S01', 'Breakfast', 11.00, 2, 22.00);

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `reservation_id` int(11) NOT NULL,
  `guest_account_id` int(11) DEFAULT NULL,
  `guest_fullname` varchar(100) DEFAULT NULL,
  `guest_phone` varchar(15) DEFAULT NULL,
  `guest_email` varchar(100) DEFAULT NULL,
  `guest_address` varchar(255) DEFAULT NULL,
  `guest_type_id` int(11) DEFAULT NULL,
  `check_in` date DEFAULT NULL,
  `check_out` date DEFAULT NULL,
  `room_type_id` varchar(10) DEFAULT NULL,
  `number_of_rooms` int(11) DEFAULT NULL CHECK (`number_of_rooms` > 0),
  `adults` int(11) DEFAULT NULL CHECK (`adults` >= 0),
  `children` int(11) DEFAULT NULL CHECK (`children` >= 0),
  `payment_method` enum('Pay at hotel','Online payment','Corporate billing') DEFAULT NULL,
  `status` enum('Awaiting','Confirmed','Declined') DEFAULT 'Awaiting',
  `declined_reason` text DEFAULT NULL,
  `reservation_note` text DEFAULT NULL,
  `recommended_rooms` text DEFAULT NULL,
  `assigned_room` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

TRUNCATE TABLE `reservations`;

-- --------------------------------------------------------

--
-- Table structure for table `roomno`
--

CREATE TABLE `roomno` (
  `room_id` varchar(10) NOT NULL,
  `room_type_id` varchar(10) DEFAULT NULL,
  `room_floor` int(11) DEFAULT NULL CHECK (`room_floor` > 0),
  `is_booked` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roomno`
--

INSERT INTO `roomno` (`room_id`, `room_type_id`, `room_floor`, `is_booked`) VALUES
('A101', 'RT01', 1, 0),
('A102', 'RT01', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `roomtypes`
--

CREATE TABLE `roomtypes` (
  `room_type_id` varchar(10) NOT NULL,
  `room_type_name` varchar(100) NOT NULL,
  `room_size` float DEFAULT NULL CHECK (`room_size` >= 0),
  `bed` varchar(50) DEFAULT NULL,
  `note` varchar(50) DEFAULT NULL,
  `max_guests` int(11) DEFAULT NULL CHECK (`max_guests` > 0),
  `price_room` decimal(10,2) DEFAULT NULL CHECK (`price_room` >= 0),
  `surcharge_rate` decimal(5,2) DEFAULT 0.00 CHECK (`surcharge_rate` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roomtypes`
--

INSERT INTO `roomtypes` (`room_type_id`, `room_type_name`, `room_size`, `bed`, `note`, `max_guests`, `price_room`, `surcharge_rate`) VALUES
('RT01', 'Deluxe', 25, '2 Queen bed size', 'Balcony', 3, 120.00, 0.25),
('RT02', 'Normal Family room', 100, '1 king bed, 2 single bed', 'No balcony', 5, 150.00, 0.25);

-- --------------------------------------------------------

--
-- Table structure for table `room_bookings`
--

CREATE TABLE `room_bookings` (
  `booking_id` int(11) NOT NULL,
  `room_id` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_bookings`
--

INSERT INTO `room_bookings` (`booking_id`, `room_id`) VALUES
(1, 'A101');

-- --------------------------------------------------------

--
-- Table structure for table `servicerequests`
--

CREATE TABLE `servicerequests` (
  `request_id` int(11) NOT NULL,
  `room_id` varchar(10) DEFAULT NULL,
  `service_id` varchar(10) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL CHECK (`amount` > 0),
  `note` text DEFAULT NULL,
  `status` enum('Awaiting','Confirmed') DEFAULT 'Awaiting',
  `booking_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `servicerequests`
--

INSERT INTO `servicerequests` (`request_id`, `room_id`, `service_id`, `amount`, `note`, `status`, `booking_id`, `created_at`) VALUES
(1, 'A101', 'S01', 2, 'Thêm 2 suất ăn sáng', 'Awaiting', 1, '2025-06-20 14:46:01');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` varchar(10) NOT NULL,
  `service_name` varchar(100) DEFAULT NULL,
  `price_service` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `service_name`, `price_service`) VALUES
('S01', 'Breakfast', 11.00),
('S02', 'Lunch', 12.00),
('S03', 'Dinner', 15.00),
('S04', 'Spa', 20.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accountbooking`
--
ALTER TABLE `accountbooking`
  ADD PRIMARY KEY (`guest_account_id`);

--
-- Indexes for table `adminaccounts`
--
ALTER TABLE `adminaccounts`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`);

--
-- Indexes for table `bookingcompanions`
--
ALTER TABLE `bookingcompanions`
  ADD PRIMARY KEY (`companion_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `guest_type_id` (`guest_type_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `guest_type_id` (`guest_type_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`guest_id`),
  ADD KEY `guest_type_id` (`guest_type_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `guest_types`
--
ALTER TABLE `guest_types`
  ADD PRIMARY KEY (`guest_type_id`);

--
-- Indexes for table `invoicedetails`
--
ALTER TABLE `invoicedetails`
  ADD PRIMARY KEY (`invoice_detail_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `guest_id` (`guest_id`);

--
-- Indexes for table `invoiceservices`
--
ALTER TABLE `invoiceservices`
  ADD PRIMARY KEY (`invoice_service_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `guest_account_id` (`guest_account_id`),
  ADD KEY `guest_type_id` (`guest_type_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `roomno`
--
ALTER TABLE `roomno`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `roomtypes`
--
ALTER TABLE `roomtypes`
  ADD PRIMARY KEY (`room_type_id`);

--
-- Indexes for table `room_bookings`
--
ALTER TABLE `room_bookings`
  ADD PRIMARY KEY (`booking_id`,`room_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `servicerequests`
--
ALTER TABLE `servicerequests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accountbooking`
--
ALTER TABLE `accountbooking`
  MODIFY `guest_account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookingcompanions`
--
ALTER TABLE `bookingcompanions`
  MODIFY `companion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `guest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `guest_types`
--
ALTER TABLE `guest_types`
  MODIFY `guest_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoicedetails`
--
ALTER TABLE `invoicedetails`
  MODIFY `invoice_detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoiceservices`
--
ALTER TABLE `invoiceservices`
  MODIFY `invoice_service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `servicerequests`
--
ALTER TABLE `servicerequests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookingcompanions`
--
ALTER TABLE `bookingcompanions`
  ADD CONSTRAINT `bookingcompanions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookingcompanions_ibfk_2` FOREIGN KEY (`guest_type_id`) REFERENCES `guest_types` (`guest_type_id`);

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`guest_type_id`) REFERENCES `guest_types` (`guest_type_id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `roomno` (`room_id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`room_type_id`) REFERENCES `roomtypes` (`room_type_id`);

--
-- Constraints for table `guests`
--
ALTER TABLE `guests`
  ADD CONSTRAINT `guests_ibfk_1` FOREIGN KEY (`guest_type_id`) REFERENCES `guest_types` (`guest_type_id`),
  ADD CONSTRAINT `guests_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `guests_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `roomno` (`room_id`) ON DELETE SET NULL;

--
-- Constraints for table `invoicedetails`
--
ALTER TABLE `invoicedetails`
  ADD CONSTRAINT `invoicedetails_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  ADD CONSTRAINT `invoicedetails_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `roomno` (`room_id`),
  ADD CONSTRAINT `invoicedetails_ibfk_3` FOREIGN KEY (`room_type_id`) REFERENCES `roomtypes` (`room_type_id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`);

--
-- Constraints for table `invoiceservices`
--
ALTER TABLE `invoiceservices`
  ADD CONSTRAINT `invoiceservices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  ADD CONSTRAINT `invoiceservices_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`);

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`guest_account_id`) REFERENCES `accountbooking` (`guest_account_id`),
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`guest_type_id`) REFERENCES `guest_types` (`guest_type_id`),
  ADD CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`room_type_id`) REFERENCES `roomtypes` (`room_type_id`);

--
-- Constraints for table `roomno`
--
ALTER TABLE `roomno`
  ADD CONSTRAINT `roomno_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `roomtypes` (`room_type_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `room_bookings`
--
ALTER TABLE `room_bookings`
  ADD CONSTRAINT `room_bookings_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `roomno` (`room_id`) ON DELETE CASCADE;

--
-- Constraints for table `servicerequests`
--
ALTER TABLE `servicerequests`
  ADD CONSTRAINT `servicerequests_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `roomno` (`room_id`),
  ADD CONSTRAINT `servicerequests_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  ADD CONSTRAINT `servicerequests_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
