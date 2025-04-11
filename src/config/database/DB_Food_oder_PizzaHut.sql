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
    pizza_level VARCHAR(255),
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
    base_id INT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES Combos(combo_id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES ProductSizes(size_id) ON DELETE CASCADE,
    FOREIGN KEY (crust_id) REFERENCES PizzaCrustOptions(crust_id) ON DELETE SET NULL,
    CONSTRAINT unique_cart_product UNIQUE (user_id, product_id, size_id, crust_id, base_id),
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
    order_type ENUM('Pick up', 'Delivery') DEFAULT 'Delivery',
    order_status ENUM('Pending', 'Processing', 'Completed', 'Delivering', 'Cancelled', 'Done') DEFAULT 'Pending',
    total_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

ALTER TABLE Orders
ADD COLUMN order_type ENUM('Pick up', 'Delivery') DEFAULT 'Delivery' AFTER user_id;


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
    

INSERT INTO Categories (category_name, description, image_category_url)  
VALUES
('Pizza', 'Các món liên qua đến pizza.', '/uploads/C05@@Pizza_Pizza_thap_cam.webp'),  
('Khai vị', 'Các món khai vị như khoai tây chiên, súp, nem rán.', '/uploads/HA33@@khoai_tay_chien.jpeg'),  
('Salad', 'Các loại salad tươi ngon, giàu dinh dưỡng.', '/uploads/IA11@@salad_ca_ngu.webp'),  
('Mỳ Ý', 'Món mỳ Ý với nhiều loại sốt hấp dẫn.', '/uploads/FA17@@packshot_mi_y_bo_bam.webp'),  
('Cơm', 'Các món cơm đa dạng như cơm chiên, cơm hải sản.', '/uploads/GA08@@com20hai_san.webp'),  
('Gà', 'Các món gà như gà rán, gà nướng BBQ.', '/uploads/FY015@@Chicken_BBQ_6pcs.jpeg'),  
('Đồ uống', 'Các loại nước giải khát như trà, nước ngọt, cà phê.', '/uploads/NC135@@PEPSI_CAN_320ML.webp'); 

INSERT INTO Products (product_name, description, image_url, category_id)  
VALUES  
-- Pizza (category_id = 1)
('Pizza Hải Sản Nhiệt Đới', 'Tôm, thanh cua, cà chua bi, bắp ngọt, thơm điểm vị thì là và phô mai mozzarella.', '/uploads/B01@@Pizza_hai_san_nhiet_doi.webp', 1),  
('Pizza Tôm Thịt Nướng Tiêu', 'Tôm nướng tiêu đen cùng thịt heo giăm bông, nấm, hành tây và phô mai mozzarella.', '/uploads/B03@@Pizza_tom_thit_nuong_tieu.jpeg', 1),  
('Pizza Thịt Bò Và Hải Sản', 'Hải sản (tôm, mực) kết hợp với thịt bò và xốt cay nhẹ kiểu Hàn Quốc, thêm thơm, hành tây, phủ mozzarella.', '/uploads/B04@@pizza_bo_va_hai_san.jpeg', 1),  
('Pizza Gà Phô Mai', 'Gà giòn không xương, nấm, hành tây với xốt phô mai.', '/uploads/B05@@Pizza_ga_pho_mai.jpeg', 1),  
('Pizza Hải Sản Xốt Pesto', 'Tôm, mực, thanh cua, cà chua, bông cải xanh, xốt pesto.', '/uploads/C02@@Pizza_hai_ssn_sot_pesto.jpeg', 1),  
('Pizza Thịt Và Xúc Xích', 'Thơm ngon và giàu protein với thịt xông khói, xúc xích, thịt bò, giăm bông và pepperoni.', '/uploads/C03@@Pizza_thit_va_xuc_xich.jpeg', 1),  
('Pizza Hải Sản Xốt Tiêu Đen', 'Tôm, mực, thanh cua, hành tây, thơm phủ xốt tiêu đen thơm nóng và phô mai mozzarella.', '/uploads/C04@@Pizza_hai_san_sot_tieu_den.jpeg', 1),  
('Pizza Thập Cẩm', 'Pepperoni, thịt bò, thịt xông khói, giăm bông, nấm, hành tây, ớt chuông, xốt cà chua, thơm.', '/uploads/C05@@Pizza_Pizza_thap_cam.webp', 1),  
('Pizza Gà Nướng Nấm', 'Thịt gà, nấm, thơm, mozzarella với xốt tiêu đen, phủ cà rốt và rau mầm tươi ngon.', '/uploads/C08@@Pizza_ga_nuong_nam.jpeg', 1),  
('Pizza Cá Ngừ', 'Cá ngừ, thanh cua, hành tây và thơm phủ phô mai mozzarella.', '/uploads/C09@@Pizza_ca_ngu.webp', 1),  
('Pizza Hawaiian', 'Giăm bông và thơm ngọt dịu trên nền xốt cà chua truyền thống và phô mai mozzarella.', '/uploads/C11@@Pizza_hawaiian.jpeg', 1),  
('Pizza Phô Mai Cao Cấp', 'Phô mai Mozzarella, mật ong, xốt cà chua. Ngon hơn với mật ong.', '/uploads/C12@@Pizza_pho_mai_cao_cap.jpeg', 1),  
('Pizza Tôm Xốt Bơ Tỏi', 'Tôm xốt bơ tỏi với hành tây và ớt chuông, phủ phô mai mozzarella.', '/uploads/C13@@Pizza_tom_xot_bo_toi.jpeg', 1),  
('Pizza Hải Sản Viền Phô Mai 3 Vị', 'Tôm xốt bơ tỏi với hành tây, ớt chuông đỏ, thơm, ô liu, phủ phô mai mozzarella.', '/uploads/C19@@Pizza_Hai_san_vien_pho_mai_3_vi.jpeg', 1),  
('Pizza Phô Mai Bốn Vị Xốt Mật Ong', 'Sự kết hợp hoàn hảo của 4 loại phô mai mozzarella, parmesan, cheddar và phô mai kem cùng xốt mật ong.', '/uploads/C22@@Pizza_pho_mai_4_vi_mat_ong.jpeg', 1),  
('Pizza Bò BBQ Xốt Cay Hàn Quốc', 'Hương vị thịt bò Úc thượng hạng, thơm hòa quyện xốt cay Hàn Quốc nồng nàn, phủ rau mầm và mè rang.', '/uploads/C23@@Pizza_bo_20_BBQ.jpeg', 1),  
('Pizza Lava', 'Thịt Xông Khói, Xúc Xích, Thịt Bò, Giăm Bông, Pepperoni, Gà Giòn Không Xương, Nấm, Hành Tây, Xốt Cà Chua, Xốt Phô Mai Cheddar.', '/uploads/1000x1000-01.webp', 1),  
('Pizza Tứ Vị Xuan', 'Mực, tôm, thanh cua, thịt ba chỉ xông khói, xúc xích xông khói, pepperoni, ớt chuông, cà chua bi, bông cải xanh, nấm, bắp và hành tây.', '/uploads/1000x1000px-Tuvixuan.webp', 1),  
('Pizza Rau Củ', 'Oliu đen, cà chua bi, nấm, thơm, bắp, hành tây trên nền xốt bơ tỏi và phô mai Mozzarella.', '/uploads/A11@@Pizza_rau_cu.jpeg', 1),  
('Pizza Gấp Đôi Nhân Phủ Hải Sản Xốt Pesto', 'Gấp đôi hải sản (Tôm, mực, thanh cua), cà chua, bông cải xanh, xốt pesto.', '/uploads/A28@@Pizza_hai_san_sot_pesto_DT.jpeg', 1),  
('Pizza Gấp Đôi Nhân Phủ Cơn Lốc Hải Sản', 'Gấp đôi hải sản (mực, thanh cua) cùng thơm, ớt chuông xanh, hành tây, phủ phô mai mozzarella.', '/uploads/A29@@Pizza_con_loc_hai_san_DT.jpeg', 1),  
('Pizza Gấp Đôi Nhân Phủ Hải Sản Xốt Tiêu Đen', 'Gấp đôi hải sản (tôm, mực, thanh cua) với hành tây, thơm trên nền xốt tiêu đen thơm nồng và phô mai mozzarella.', '/uploads/A30@@Pizza_hai_san_sot_tieu_den_DT.jpeg', 1),  
('Pizza Viền Phô Mai 2 Loại Nhân Phủ', 'Cùng thưởng thức 2 loại nhân phủ thơm ngon trên cùng 1 bánh pizza.', '/uploads/AD09@@Pizza_Half_Half_topview.jpeg', 1),
-- Món khai vị (category_id = 2)
('Phô Mai Chiên Giòn', 'Phô mai chiên giòn.', '/uploads/HA130@@pho_mai_chien_gion.jpeg', 2),  
('Bánh Cuộn Phô Mai', 'Bánh Cuộn Phô Mai.', '/uploads/HA501@@banh_cuon_pho_mai_2023.jpeg', 2),  
('Khoai Tây Chiên Đút Lò', 'Khoai tây chiên đút lò với phô mai, thịt xông khói và xốt mù tạt mật ong.', '/uploads/HA504@@Khoai_tay_chien_dut_lo.jpeg', 2),  
('Bắp Nướng Phô Mai Thịt Xông Khói', 'Bắp ngọt phủ phô mai đút lò với thịt xông khói.', '/uploads/HA514@@bap_pho_mai_thit_xong_khoi.jpeg', 2),  
('Nachos', 'Bánh Nachos giòn rụm kiểu Mexico chấm xốt phô mai thơm béo hoặc xốt cà chua đặc biệt.', '/uploads/HA515@@Banh_Nachos.jpeg', 2),  
('Bánh Mì Bơ Tỏi', 'Bánh mì nướng giòn cùng bơ tỏi.', '/uploads/HA30@@banh_mi_bo_toi.jpeg', 2),  
('Xúc Xích Ý Nướng', 'Xúc Xích Ý Nướng.', '/uploads/HA31@@xx_Y_nuong.jpeg', 2),  
('Mực Chiên Giòn', 'Mực khoanh tẩm bột chiên giòn.', '/uploads/HA32@@packshot_muc_chien_gion.jpeg', 2),  
('Khoai Tây Chiên', 'Khoai tây chiên giòn.', '/uploads/HA33@@khoai_tay_chien.jpeg', 2),
-- Đồ uống (category_id = 7)
('Pepsi Lemon Lon 320ml', 'Pepsi Lemon Lon 320ml', '/uploads/NC137@@PEPSI_LEMON_CAN_320ML.jpeg', 7),  
('7Up Can 320ml', '7Up Can 320ml', '/uploads/NC138@@7UP_CAN_320ML.jpeg', 7),  
('Mirinda Orange Lon 320ml', 'Mirinda Orange Lon 320ml', '/uploads/NC139@@MIRINDA_ORANGE_CAN_320ML.jpeg', 7),  
('Mirinda Soda Lon 320ml', 'Mirinda Soda Lon 320ml', '/uploads/NC140@@MIRINDA_SODA_CAN_320ML.jpeg', 7),  
('Aquafina 500ml', 'Aquafina 500ml', '/uploads/NC144@@AQUAFINA_500ML.jpeg', 7),  
('Pepsi Lon 320ml', 'Pepsi Lon 320ml', '/uploads/NC135@@PEPSI_CAN_320ML.webp', 7),  
('Pepsi Không Calo Lon 320ml', 'Pepsi Không Calo Lon 320ml', '/uploads/NC136@@PEPSI_NO_CALO_CAN_320ML.jpeg', 7),
-- Cơm (category_id = 5)
('Cơm Cánh Gà BBQ', 'Cơm Chiên Tỏi Với Cánh Gà BBQ Nóng Hổi Thơm Nồng', '/uploads/GA09@@packshot_com_chien_toi_ga_BBQ.jpeg', 5),  
('Cơm Chiên Tôm Vị Cay', 'Cơm chiên tỏi với tôm, đậu bi, cà rốt và bắp ngọt', '/uploads/GA501@@com_chien_tom_vi_cay.webp', 5),  
('Cơm Xúc Xích Nướng Phô Mai', 'Cơm đút lò với phô mai, xúc xích, thịt bò, dùng kèm cà rốt, đậu, hành tây, bắp với lớp phủ mè rang hấp dẫn', '/uploads/FX071@@com_xx_nuong_pho_mai.webp', 5),  
('Cơm Hải Sản Đút Lò', 'Vị xốt pesto hoà quyện cơm được đút lò với phô mai, tôm, mực kèm cà rốt, đậu, hành tây, bắp với lớp phủ mè rang hấp dẫn', '/uploads/FX072@@packshot_com_hai_san_dut_lo.webp', 5),  
('Cơm Chiên Hải Sản', 'Cơm chiên tỏi với tôm, mực, nấm, cà rốt và đậu', '/uploads/GA08@@com20hai_san.webp', 5),
-- Mỳ ý (category_id = 4)
('Mỳ Ý Tôm Và Xúc Xích', 'Mì Ý xốt kem với tôm, xúc xích và cà rốt.', '/uploads/FA527@@packshot_mi_y_tom_va_xuc_xich.webp', 4),  
('Mì Ý Thịt Xông Khói Xốt Kem', 'Mì Ý xốt kem với thịt heo xông khói, cà chua bi, hành tây và ngò tây.', '/uploads/FA532@@packshot_mi_y_xong_khoi_sot_kem.jpeg', 4),  
('Mì Ý Bò Bằm Xốt Cà Chua', 'Mì Ý bò bằm xốt cà chua.', '/uploads/FA17@@packshot_mi_y_bo_bam.webp', 4),  
('Mỳ Ý Hải Sản Xốt Tiêu Đen', 'Mì Ý với tôm, thanh cua, mực, nấm, ớt chuông, đậu và xốt tiêu đen.', '/uploads/FA18@@packshot_mi_y_sot_tieu_den.webp', 4),  
('Mì Ý Hải Sản Xốt Cà Chua', 'Mì Ý xốt cà chua với tôm, mực, hành tây và ớt chuông.', '/uploads/FA21@@mi_y_hai_san_sot_ca_chua.webp', 4),
-- Salad (category_id = 3)
('Xà Lách Trộn Cá Ngừ Và Thịt Xông Khói', 'Xà lách trộn cá ngừ, thịt xông khói, đậu Pháp, cà chua bi, bắp với xốt dầu dấm và mayonaise', '/uploads/IA11@@salad_ca_ngu.webp', 3),  
('Xà Lách Da Cá Hồi', 'Xà lách, cà chua bi, ớt chuông nướng, da cá hồi với xốt mè rang đặc biệt', '/uploads/IA112@@salad_da_ca_hoi.webp', 3),  
('Xà Lách Gà Pesto', 'Xà lách, cà chua bi, rau mầm với thịt gà nướng và xốt pesto kiểu Ý, phủ phô mai parmesan', '/uploads/IA517@@salad_ga_pesto.jpeg', 3),  
('Xà Lách Tôm Nướng Đào', 'Xà lách, đào, ớt chuông, oliu với tôm nướng bơ tỏi dùng kèm bánh mì giòn', '/uploads/FX069@@salad_tom_nuong_dao.png', 3),
-- Gà (category_id = 6)
('Gà Giòn Không Xương Xốt Hàn Mật Ong', 'Vị gà ngọt ngào với xốt mật ong cùng vị Gochujang cay nhẹ', '/uploads/HA537@@Chicken_Gochujang_BL.jpeg', 6),  
('Cánh Gà BBQ Múa Lửa Hồng (4 Miếng)', 'Cánh gà nướng BBQ', '/uploads/FY014@@Chicken_BBQ_4pcs.jpeg', 6),  
('Cánh Gà BBQ Múa Lửa Hồng (6 Miếng)', 'Cánh gà nướng BBQ', '/uploads/FY015@@Chicken_BBQ_6pcs.jpeg', 6),  
('Cánh Gà Giòn Karaage (4 Miếng)', 'Cánh gà tẩm bột Karaage chiên giòn', '/uploads/FY016@@Chicken_Karaage_4pcs.jpeg', 6),  
('Cánh Gà Giòn Karaage (6 Miếng)', 'Cánh gà tẩm bột Karaage chiên giòn', '/uploads/FY017@@Chicken_Karaage_6pcs.jpeg', 6),  
('Cánh Gà Xóc Mắm Tỏi Mekong (4 Miếng)', 'Cánh gà chiên giòn phủ xốt mắm tỏi Mekong', '/uploads/FY018@@Chicken_Mekong_4pcs.jpeg', 6),  
('Cánh Gà Xóc Mắm Tỏi Mekong (6 Miếng)', 'Cánh gà chiên giòn phủ xốt mắm tỏi Mekong', '/uploads/FY019@@Chicken_Mekong_6pcs.jpeg', 6),  
('Gà Không Xương Xóc Mắm Tỏi Mekong', 'Gà không xương chiên giòn phủ xốt mắm tỏi Mekong', '/uploads/FY020@@Chicken_Mekong_BL.jpeg', 6),  
('Cánh Gà Xốt Cay-Pop Hàn Quốc (4 miếng)', 'Cánh gà chiên giòn phủ xốt Hàn Quốc trứ danh', '/uploads/FY021@@Chicken_Cay_pop_4pcs.jpeg', 6),  
('Cánh Gà Xốt Cay-Pop Hàn Quốc (6 miếng)', 'Cánh gà chiên giòn phủ xốt Hàn Quốc trứ danh', '/uploads/FY022@@Chicken_Cay_pop_6pcs.jpeg', 6),  
('Gà Không Xương Xốt Cay-Pop Hàn Quốc', 'Gà không xương chiên giòn phủ xốt Hàn Quốc trứ danh', '/uploads/FY023@@Chicken_Cay_pop_BL.jpeg', 6),  
('Gà Phủ Phô Mai', 'Gà giòn không xương phủ phô mai', '/uploads/FY024@@Ga_Phu_Pho_Mai.jpeg', 6),  
('Cánh Gà Giòn Xốt Trứng Muối (4 Miếng)', 'Vị gà với xốt trứng muối béo mặn cùng lớp da giòn tan', '/uploads/HA529@@Chicken_Salted_egg_4pcs.jpeg', 6),  
('Cánh Gà Giòn Xốt Trứng Muối (6 Miếng)', 'Vị gà với xốt trứng muối béo mặn cùng lớp da giòn tan', '/uploads/HA530@@Chicken_Salted_egg_6pcs.jpeg', 6),  
('Gà Giòn Không Xương Xốt Trứng Muối', 'Vị gà với xốt trứng muối béo mặn cùng lớp da giòn tan', '/uploads/HA531@@Chicken_Salted_egg_BL.jpeg', 6),  
('Cánh Gà Giòn Xốt Thái Tomyum (4 Miếng)', 'Vị gà truyền thống cùng độ chua cay Tom Yum đặc trưng', '/uploads/HA532@@Chicken_Tomyum_4pcs.webp', 6),  
('Cánh Gà Giòn Xốt Thái Tomyum (6 Miếng)', 'Vị gà truyền thống cùng độ chua cay Tom Yum đặc trưng', '/uploads/HA533@@Chicken_Tomyum_6pcs.jpeg', 6),  
('Gà Giòn Không Xương Xốt Thái Tomyum', 'Vị gà truyền thống cùng độ chua cay Tom Yum đặc trưng', '/uploads/HA534@@Chicken_Tomyum_BL.jpeg', 6),  
('Cánh Gà Giòn Xốt Hàn Mật Ong (4 Miếng)', 'Vị gà ngọt ngào với xốt mật ong cùng vị Gochujang cay nhẹ', '/uploads/HA535@@Chicken_Gochujang_4pcs.webp', 6),  
('Cánh Gà Giòn Xốt Hàn Mật Ong (6 Miếng)', 'Vị gà ngọt ngào với xốt mật ong cùng vị Gochujang cay nhẹ', '/uploads/HA536@@Chicken_Gochujang_6pcs.webp', 6);



INSERT INTO ProductPrices (product_id, size_id, price) VALUES
(1, 2, 139000), (1, 3, 229000), (1, 4, 299000),
(2, 2, 139000), (2, 3, 229000), (2, 4, 299000),
(3, 2, 139000), (3, 3, 229000), (3, 4, 299000),
(4, 2, 139000), (4, 3, 229000), (4, 4, 299000),
(5, 2, 149000), (5, 3, 239000), (5, 4, 309000),
(6, 2, 139000), (6, 3, 229000), (6, 4, 299000),
(7, 2, 139000), (7, 3, 229000), (7, 4, 299000),
(8, 2, 139000), (8, 3, 229000), (8, 4, 299000),
(9, 2, 119000), (9, 3, 189000), (9, 4, 259000),
(10, 2, 139000), (10, 3, 229000), (10, 4, 299000),
(11, 2, 139000), (11, 3, 229000), (11, 4, 299000),
(12, 2, 119000), (12, 3, 189000), (12, 4, 259000),
(13, 2, 139000), (13, 3, 229000), (13, 4, 299000),
(14, 3, 299000), (14, 4, 399000),
(15, 3, 229000), (15, 4, 299000),
(16, 2, 119000), (16, 3, 189000), (16, 4, 259000),
(17, 3, 249000), (17, 4, 299000),
(18, 3, 249000), (18, 4, 299000),
(19, 2, 119000), (19, 3, 189000), (19, 4, 259000),
(20, 3, 269000), (20, 4, 369000),
(21, 3, 269000), (21, 4, 369000),
(22, 3, 269000), (22, 4, 369000),
(23, 3, 279000), (23, 4, 379000),
(24, 1, 79000),
(25, 1, 69000),
(26, 1, 79000),
(27, 1, 79000),
(28, 1, 29000),
(29, 1, 29000),
(30, 1, 99000),
(31, 1, 99000),
(32, 1, 59000),
(33, 1, 30000),
(34, 1, 30000),
(35, 1, 30000),
(36, 1, 30000),
(37, 1, 20000),
(38, 1, 30000),
(39, 1, 30000),
(40, 1, 129000),
(41, 1, 79000),
(42, 1, 99000),
(43, 1, 99000),
(44, 1, 99000),
(45, 1, 120000),
(46, 1, 99000),
(47, 1, 120000),
(48, 1, 130000),
(49, 1, 130000),
(50, 1, 79000),
(51, 1, 89000),
(52, 1, 79000),
(53, 1, 99000),
(54, 1, 119000),
(55, 1, 119000),
(56, 1, 149000),
(57, 1, 119000),
(58, 1, 149000),
(59, 1, 149000),
(60, 1, 169000),
(61, 1, 119000),
(62, 1, 149000),
(63, 1, 169000),
(64, 1, 119000),
(65, 1, 129000),
(66, 1, 149000),
(67, 1, 169000),
(68, 1, 119000),
(69, 1, 149000),
(70, 1, 169000),
(71, 1, 119000),
(72, 1, 149000),
(73, 1, 169000);

INSERT INTO Tags (tag_name) VALUES
('Mới'),
('Bán chạy'),
('Cay'),
('Không cay'),
('Nhiều phô mai'),
('Món chiên'),
('Món nướng'),
('Truyền thống'),
('Cao cấp'),
('Siêu cao cấp'),
('Pizza thịt'),
('Pizza hải sản'),
('Pizza chay');

INSERT INTO ProductTags (product_id, tag_id) VALUES
(1, 9),(1, 12),(1, 4),
(2, 9),(2, 12),(2, 11),(2, 3),
(3, 9),(3, 12),(3, 11),(3, 3),
(4, 9),(4, 11),(4, 4),
(5, 9),(5, 12),(5, 4),
(6, 9),(6, 11),(6, 4),
(7, 9),(7, 12),(7, 3),
(8, 9),(8, 11),(8, 4),
(9, 8),(9, 11),(9, 3),
(10, 9),(10, 11),(10, 4),
(11, 8),(11, 11),(11, 4),
(12, 8),(12, 13),(12, 5),(12, 4),
(13, 9),(13, 12),(13, 4),
(14, 10),(14, 12),(14, 4),
(15, 10),(15, 13),(15, 4),
(16, 8),(16, 11),(16, 3),
(17, 9),(17, 11),(17, 1),(17, 4),
(18, 9),(18, 11),(18, 12),(18, 1),(18, 4),
(19, 8),(19, 13),(19, 4),
(20, 10),(20, 12),(20, 4),
(21, 10),(21, 12),(21, 4),
(22, 10),(22, 12),(22, 3),
(23, 10),(23, 12),(23, 11),(23, 4),
(24, 4),(24, 5),
(25, 4),(25, 5),
(26, 4),
(27, 4),
(28, 4),
(29, 4),
(30, 4),
(31, 4),
(32, 4),
(33, 4),
(34, 4),
(35, 4),
(36, 4),
(37, 4),
(38, 4),
(39, 4),
(40, 3),
(41, 3),
(42, 2),
(43, 4),
(44, 3),
(45, 4),
(46, 4),
(47, 4),
(48, 3),
(49, 4),
(50, 4),
(51, 4),
(52, 4),
(53, 4),
(54, 3),
(55, 3),
(56, 3),
(57, 4),
(58, 4),
(59, 4),
(60, 4),
(61, 4),
(62, 3),
(63, 3),
(64, 3),
(65, 4),
(66, 4),
(67, 4),
(68, 4),
(69, 3),
(70, 3),
(71, 3),
(72, 3),
(73, 3);

INSERT INTO ProductPizzaBases (product_id, base_id) VALUES
(1, 1),(1, 2),(1, 3),
(2, 1),(2, 2),(2, 3),
(3, 1),(3, 2),(3, 3),
(4, 1),(4, 2),(4, 3),
(5, 1),(5, 2),(5, 3),
(6, 1),(6, 2),(6, 3),
(7, 1),(7, 2),(7, 3),
(8, 1),(8, 2),(8, 3),
(9, 1),(9, 2),(9, 3),
(10, 1),(10, 2),(10, 3),
(11, 1),(11, 2),(11, 3),
(12, 1),(12, 2),(12, 3),
(13, 1),(13, 2),(13, 3),
(14, 4),
(15, 4),
(16, 1),(16, 2),(16, 3),
(17, 2),
(18, 1),(18, 2),(18, 3),
(19, 1),(19, 2),(19, 3),
(20, 1),(20, 2),(20, 3),
(21, 1),(21, 2),(21, 3),
(22, 1),(22, 2),(22, 3),
(23, 4);
















 







