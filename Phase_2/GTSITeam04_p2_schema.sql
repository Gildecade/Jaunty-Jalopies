CREATE TABLE User (
	username varchar(128) NOT NULL,
	first_name varchar(128) NOT NULL,
	last_name varchar(128) NOT NULL,
	password varchar(128) NOT NULL,
	PRIMARY KEY (username)
);

CREATE TABLE Salespeople (
	username varchar(128) NOT NULL,
	PRIMARY KEY (username),
	CONSTRAINT FK_username FOREIGN KEY(username) REFERENCES User(username)
);

CREATE TABLE InventoryClerk (
	username varchar(128) NOT NULL,
	PRIMARY KEY (username),
	CONSTRAINT FK_username FOREIGN KEY(username) REFERENCES User(username)
);

CREATE TABLE Manager (
	username varchar(128) NOT NULL,
	PRIMARY KEY (username),
	CONSTRAINT FK_username FOREIGN KEY(username) REFERENCES User(username)
);

CREATE TABLE ServiceWriter (
	username varchar(128) NOT NULL,
	PRIMARY KEY (username),
	CONSTRAINT FK_username FOREIGN KEY(username) REFERENCES User(username)
);

CREATE TABLE Owner (
	username varchar(128) NOT NULL,
	PRIMARY KEY (username),
	CONSTRAINT FK_username FOREIGN KEY(username) REFERENCES User(username)
);

CREATE TABLE Manufacturer (
name varchar(128) NOT NULL,
	PRIMARY KEY (name)
);

CREATE TABLE Vehicle (
	vin INT NOT NULL,
	invoice_price double NOT NULL,
	model_year INT NOT NULL,
	model_name Varchar(128) NOT NULL,
	description TEXT NOT NULL,
	added_date Date NOT NULL,
	inventory_clerk_username Varchar(128) NOT NULL,
	manufacturer varchar(128) NOT NULL,
	vehicle_type ENUM(“car”, “convertible”, “trunk”, “vanMinivan ”, “suv”),
	PRIMARY KEY (vin),
        CONSTRAINT FK_manufacturer FOREIGN KEY (manufacturer) REFERENCES Manufacturer(name),
	CONSTRAINT FK_Inventory_clerk_username FOREIGN KEY (Inventory_clerk_username) REFERENCES   InventoryClerk(username)
);

CREATE TABLE Car (
	vin INT NOT NULL,
	number_of_doors INT NOT NULL,
	PRIMARY KEY (vin),
        CONSTRAINT FK_vin FOREIGN KEY (vin) REFERENCES Vehicle(vin)
);

CREATE TABLE Convertible (
	vin INT NOT NULL,
	roof_type varchar(128) NOT NULL,
	back_seat_count INT NOT NULL,
	PRIMARY KEY (vin),
	CONSTRAINT FK_vin FOREIGN KEY (vin) REFERENCES Vehicle(vin)
);

CREATE TABLE Truck (
	vin INT NOT NULL,
	cargo_capacity double NOT  NULL
	cargo_cover_type varchar(128),
	number_of_rear_axles INT NOT NULL,
	PRIMARY KEY (vin),
	CONSTRAINT FK_vin FOREIGN KEY (vin) REFERENCES Vehicle(vin)
);

CREATE TABLE VanMinivan (
	vin INT NOT NULL,
	has_drivers_side_back_door Tinyint NOT NULL,
	PRIMARY KEY (vin),
	CONSTRAINT FK_vin FOREIGN KEY  (vin) REFERENCES Vehicle(vin)
);

CREATE TABLE Suv(
	vin INT NOT NULL,
	drivetrain_type Varchar(128) NOT NULL,
	number_of _cupholders INT NOT NULL,
	PRIMARY KEY (vin),
	CONSTRAINT FK_vin FOREIGN KEY (vin) REFERENCES Vehicle(vin)
);

CREATE TABLE Color (
	color varchar(128) NOT NULL,
	PRIMARY KEY (color)
);

CREATE TABLE VehicleColor (
	vin INT NOT NULL,
	color varchar(128) NOT NULL,
	PRIMARY KEY (vin, color)
	CONSTRAINT FK_vin FOREIGN KEY (vin) REFERENCES Vehicle(vin),
	CONSTRAINT FK_color FOREIGN KEY (color) REFERENCES Color(color),
);

CREATE TABLE Customer (
	id INT NOT NULL AUTO_INCREMENT,
	city varchar(128) NOT NULL,
	postal_code varchar(128) NOT NULL,
	state varchar(128) NOT NULL,
	street_address varchar(128) NOT NULL,
	phone_number varchar(64) NOT NULL,
	email varchar(64) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE Individual (
	driver_license_number varchar(128) NOT NULL,
	first_name varchar(128) NOT NULL,
	last_name varchar(128) NOT NULL,
	customer_id INT NOT NULL,
	PRIMARY KEY (driver_license_number),
	CONSTRAINT FK_customer_id FOREIGN KEY (customer_id) REFERENCES Customer(id)
);

CREATE TABLE Business (
	tax_id_number varchar(128) NOT NULL,
	business_name varchar(128) NOT NULL,
	primary_contact_title varchar(128) NOT NULL,
	primary_contact_name varchar(128) NOT NULL,
	customer_id INT NOT NULL,
	PRIMARY KEY (tax_id_number),
	CONSTRAINT FK_customer_id FOREIGN KEY (customer_id) REFERENCES Customer(id)
);

CREATE TABLE Repair (
	vin INT NOT NULL,
	start_date DATE NOT NULL,
	complete_date DATE,
	odometer INT NOT NULL,
	labor_charge Double DEFAULT 0,
	parts_cost Double DEFAULT 0,
	description TEXT NOT NULL,
	service_writer_username Varchar(128) NOT NULL,
	customer_id INT NOT NULL,
	PRIMARY KEY (vin, start_date),
	CONSTRAINT FK_vin FOREIGN KEY (vin) REFERENCES Vehicle(vin),
	CONSTRAINT FK_service_write_username FOREIGN KEY (service_writer_username) REFERENCES User(username),
	CONSTRAINT FK_customer_id FOREIGN KEY (customer_id) REFERENCES Customer(id),
	CONSTRAINT CHECK_complete_date CHECK(complete_date>=start_date)

);

CREATE TABLE Part (
	part_number Varchar(128) NOT NULL
	vin INT NOT NULL,
	start_date DATE NOT NULL,
	vendor_name Varchar(128) NOT NULL,
	price Double NOT NULL,
	quantity INT NOT NULL,
	PRIMARY KEY (vin, start_date, part_number),
	CONSTRAINT FK_vin FOREIGN KEY (vin) REFERENCES Repair(vin),
	CONSTRAINT FK_start_date FOREIGN KEY (start_date) REFERENCES Repair(start_date)
);


CREATE TABLE Sale(
	vin INT NOT NULL,
	salespeople_username Varchar(128) NOT NULL,
	customer_id INT NOT NULL
	purchase_date DATE NOT NULL,
	sold_price Double NOT NULL,
	PRIMARY KEY (vin, salespeople_username, customer_id),
	CONSTRAINT FK_vin FOREIGN KEY (vin) REFERENCES Vehicle(vin),
	CONSTRAINT FK_salespeople_username FOREIGN KEY (salespeople_username) REFERENCES User(username),
	CONSTRAINT FK_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id)
);
