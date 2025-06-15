USE HotelDB;

CREATE TABLE RoomType(
    roomTypeID varchar(10) PRIMARY KEY,
    roomTypeName varchar(100),
    roomSize FLOAT,
    bed varchar(50),
    note varchar(50),
    maxGuests INT,
    roomPrice DECIMAL(10, 2),
    surchargeRate DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE Service(
    serviceID VARCHAR(10) PRIMARY KEY,
    serviceName VARCHAR(100),
    servicePrice DECIMAL(10, 2)
);