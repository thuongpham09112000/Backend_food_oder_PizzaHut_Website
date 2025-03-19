-- Tạo database
CREATE DATABASE DB_Food_order_PizzaHut;
USE DB_Food_order_PizzaHut;

-- 1.Bảng người dùng
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2.Bảng danh mục sản phẩm
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_category_url VARCHAR(500) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3.Bảng sản phẩm
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    category_id INT,
    average_rating DECIMAL(2,1) DEFAULT 5,
    review_count INT DEFAULT 0,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
);

-- 4.Bảng kích cỡ sản phẩm
CREATE TABLE ProductSizes (
    size_id INT AUTO_INCREMENT PRIMARY KEY,
    size_name VARCHAR(50) UNIQUE NOT NULL
);

-- 5.Bảng giá sản phẩm theo kích cỡ
CREATE TABLE ProductPrices (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES ProductSizes(size_id) ON DELETE CASCADE
);

-- 6.Bảng thông tin viền bánh pizza (chỉ áp dụng cho pizza)
CREATE TABLE PizzaCrustOptions (
    crust_id INT AUTO_INCREMENT PRIMARY KEY,
    crust_name VARCHAR(50) NOT NULL,
    medium_price DECIMAL(10,2) DEFAULT 69000,
    large_price DECIMAL(10,2) DEFAULT 89000
);

-- 7.Bảng đế bánh pizza (chỉ áp dụng cho pizza)
CREATE TABLE PizzaBases (
    base_id INT AUTO_INCREMENT PRIMARY KEY,
    base_name VARCHAR(50) NOT NULL
);

-- 8.Bảng sản phẩm - đế bánh (liên kết sản phẩm pizza với đế bánh)
CREATE TABLE ProductPizzaBases (
    product_id INT NOT NULL,
    base_id INT NOT NULL,
    PRIMARY KEY (product_id, base_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (base_id) REFERENCES PizzaBases(base_id) ON DELETE CASCADE
);

-- 9.Bảng nhãn sản phẩm (Tags)
CREATE TABLE Tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(255) UNIQUE NOT NULL
);

-- 10.Bảng liên kết sản phẩm với nhãn
CREATE TABLE ProductTags (
    product_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);

-- 11.Bảng combo	
CREATE TABLE Combos (
    combo_id INT AUTO_INCREMENT PRIMARY KEY,
    combo_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
);


-- 12. Bảng liên kết sản phẩm với combo
CREATE TABLE ComboProducts (
    combo_id INT NOT NULL,
    product_id INT NOT NULL,
    size_id INT NOT NULL,  -- Liên kết với bảng ProductSizes
    quantity INT DEFAULT 1,
    PRIMARY KEY (combo_id, product_id, size_id),  -- Đảm bảo mỗi combo có thể có cùng sản phẩm nhưng khác size
    FOREIGN KEY (combo_id) REFERENCES Combos(combo_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES ProductSizes(size_id) ON DELETE CASCADE
);


-- 13.Bảng nhóm sản phẩm trong combo (VD: Bánh, Salad, Nước ngọt)
CREATE TABLE ComboProductGroups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    combo_id INT NOT NULL,
    category_id INT NOT NULL,  -- Nhóm này thuộc loại sản phẩm nào (Pizza, Salad, Nước ngọt)
    quantity INT DEFAULT 1,    -- Số lượng sản phẩm cần chọn từ nhóm này
    FOREIGN KEY (combo_id) REFERENCES Combos(combo_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
);

-- 14.Bảng giỏ hàng
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NULL,
    combo_id INT NULL, 
    size_id INT NULL,  -- Không bắt buộc với combo
    quantity INT DEFAULT 1 CHECK (quantity > 0),  
    crust_id INT NULL,  
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES Combos(combo_id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES ProductSizes(size_id) ON DELETE CASCADE,
    FOREIGN KEY (crust_id) REFERENCES PizzaCrustOptions(crust_id) ON DELETE SET NULL,
    CONSTRAINT unique_cart_product UNIQUE (user_id, product_id, size_id, crust_id),
    CONSTRAINT unique_cart_combo UNIQUE (user_id, combo_id),
    CONSTRAINT check_product_or_combo CHECK (
        (product_id IS NOT NULL AND combo_id IS NULL) 
        OR (product_id IS NULL AND combo_id IS NOT NULL)
    )
);


-- 15.Bảng lưu trữ các sản phẩm mà người dùng đã chọn trong combo thêm vào giỏ hàng
CREATE TABLE CartComboSelections (
    cart_id INT NOT NULL,
    combo_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    PRIMARY KEY (cart_id, combo_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES Cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES Combos(combo_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- 16.Bảng đơn hàng
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_status ENUM('Pending', 'Processing', 'Completed', 'Delivering', 'Cancelled', 'Done') DEFAULT 'Pending',
    total_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- 17.Bảng thông tin người nhận trong đơn hàng
CREATE TABLE OrderRecipients (
    recipient_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_time DATETIME NULL, -- Thời gian hẹn giao hàng nếu có
    note TEXT NULL, -- Ghi chú đơn hàng
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

-- 18.Bảng chi tiết đơn hàng
CREATE TABLE OrderDetails (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NULL,
    combo_id INT NULL, 
    size_id INT NOT NULL,  -- Liên kết với bảng ProductSizes
    quantity INT NOT NULL,
    crust_id INT NULL,  -- Nếu là pizza, có thể chọn viền bánh
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES Combos(combo_id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES ProductSizes(size_id) ON DELETE CASCADE,
    FOREIGN KEY (crust_id) REFERENCES PizzaCrustOptions(crust_id) ON DELETE SET NULL
);

-- 19.Bảng lưu trữ các sản phẩm mà người dùng đã chọn trong combo lên đơn hàng
CREATE TABLE OrderComboSelections (
    order_detail_id INT NOT NULL,
    combo_id INT NOT NULL,
    product_id INT NOT NULL,  -- Sản phẩm mà khách hàng đã chọn trong combo
    quantity INT DEFAULT 1,
    PRIMARY KEY (order_detail_id, combo_id, product_id),
    FOREIGN KEY (order_detail_id) REFERENCES OrderDetails(order_detail_id) ON DELETE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES Combos(combo_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- 20.Bảng đánh giá sản phẩm
CREATE TABLE ProductReviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5), -- Đánh giá từ 1 đến 5 sao
    review_text TEXT, -- Nội dung đánh giá
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- 21.Bảng giao dịch thanh toán
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('payment', 'refund') NOT NULL,
    payment_method ENUM('Cash', 'VNPay') NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed') NOT NULL,
    transaction_reference VARCHAR(255) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

-- Thêm chỉ mục để tối ưu truy vấn
CREATE INDEX idx_user_email ON Users(email);
CREATE INDEX idx_category_name ON Categories(category_name);
CREATE INDEX idx_order_status ON Orders(order_status);
CREATE INDEX idx_product_name ON Products(product_name);
CREATE INDEX idx_orders_user ON Orders(user_id);
CREATE INDEX idx_transactions_order ON Transactions(order_id);
CREATE INDEX idx_review_product ON ProductReviews(product_id);
CREATE INDEX idx_review_user ON ProductReviews(user_id);

INSERT INTO ProductSizes (size_name) 
VALUES 
	('Mặc định'),
    ('Nhỏ'),
    ('Vừa'),
    ('Lớn');

INSERT INTO PizzaBases (base_name) 
VALUES 
	('Mỏng giòn'),
    ('Truyền thống'),
    ('Xốp giòn'),
    ('Mặc định');

INSERT INTO PizzaCrustOptions (crust_name) 
VALUES 
	('Viền xúc xích'),
    ('Viền phô mai'),
    ('Viền xúc xích phô mai');


