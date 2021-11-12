-- create 10 customers for testing
-- the first five are individuals, meaning that their customer_id is the reference key for Individual table
-- the last five are business, meaning that their customer_id is the reference key for Business table 
INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Shanghai", "100001", "Shanghai", "Hongri Xiaoqu, 124 St.", "1234566678", "customer1@gmail.com");

INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Shenzhen", "100002", "Guangdong", "Somewhere nice", "1234566678", "customer2@gmail.com");

INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Beijing", "100003", "Beijing", "Hongri Xiaoqu, 124 St.", "1234566678", "customer3@gmail.com");

INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Guangzhou", "100004", "Guangdong", "Hongri Xiaoqu, 124 St.", "1234566678", "customer4@gmail.com");

INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Wuhan", "100005", "Hubei", "Hongri Xiaoqu, 124 St.", "1234566678", "customer5@gmail.com");

-- records below belongs to business
INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Tianjing", "153426", "Hebei", "some random place", "2548254257", "customer6@gmail.com");

INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Shijiazhuang", "524367", "Shijiazhuang", "Somewhere nice", "1234566678", "customer7@gmail.com");

INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Changsha", "642164", "Hunan", "Hongri Xiaoqu, 124 St.", "1234566678", "customer8@gmail.com");

INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Nirvana", "436162", "Heaven", "Hongri Xiaoqu, 124 St.", "1234566678", "customer9@gmail.com");

INSERT INTO Customer(city, postal_code, state, street_address, phone_number, email)
VALUES("Hell", "100005", "Hell", "Hongri Xiaoqu, 124 St.", "1234566678", "customer10@gmail.com");