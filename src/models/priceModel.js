const { database } = require("../config/database/connect");

class Price {
  // Thêm giá sản phẩm
  static async create(product_id, size_id, price) {
    try {
      const sql = `INSERT INTO ProductPrices (product_id, size_id, price) VALUES (?, ?, ?)`;
      const [result] = await database.execute(sql, [
        product_id,
        size_id,
        price,
      ]);
      return result;
    } catch (error) {
      throw new Error("Lỗi khi thêm giá sản phẩm vào CSDL: " + error.message);
    }
  }

  static async createMultiple(priceList) {
    if (!Array.isArray(priceList) || priceList.length === 0) {
      throw new Error("Danh sách giá sản phẩm không hợp lệ!");
    }

    try {
      const sql = `INSERT INTO ProductPrices (product_id, size_id, price) VALUES ${priceList
        .map(() => "(?, ?, ?)")
        .join(", ")}`;
      const values = priceList.flatMap(({ product_id, size_id, price }) => [
        product_id,
        size_id,
        price,
      ]);

      const [result] = await database.execute(sql, values);
      return result;
    } catch (error) {
      throw new Error(
        "Lỗi khi thêm nhiều giá sản phẩm vào CSDL: " + error.message
      );
    }
  }

  // Lấy toàn bộ dữ liệu trong bảng ProductPrices
  static async getAll() {
    try {
      const sql = `SELECT * FROM ProductPrices`;
      const [rows] = await database.execute(sql);
      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy dữ liệu bảng giá sản phẩm: " + error.message
      );
    }
  }

  // Tìm giá theo product_id
  static async findByProductId(product_id) {
    try {
      const query = "SELECT * FROM ProductPrices WHERE product_id = ?";
      const [rows] = await database.execute(query, [product_id]);
      return rows.length > 0 ? rows : [];
    } catch (error) {
      console.log("Lỗi khi truy vấn price trong CSDL" + error.message);
      throw new Error("Lỗi khi truy vấn price trong CSDL");
    }
  }

  static async findSizesByProductId(product_id) {
    try {
      const sql = `SELECT size_id FROM ProductPrices WHERE product_id = ?`;
      const [rows] = await database.execute(sql, [product_id]);
      return rows.map((row) => row.size_id);
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách kích cỡ theo product_id:",
        error.message
      );
      throw new Error("Lỗi khi lấy danh sách kích cỡ theo product_id");
    }
  }

  static async findPricesByProductIdAndSizeId(product_ids, size_ids) {
    if (!Array.isArray(product_ids) || !Array.isArray(size_ids)) {
      throw new Error("Danh sách product_id hoặc size_id không hợp lệ!");
    }

    try {
      const placeholders = product_ids
        .map(() => "?")
        .join(", ")
        .replace(/,/g, ", ");
      const sql = `SELECT * FROM ProductPrices WHERE product_id IN (${placeholders}) AND size_id IN (${size_ids
        .map(() => "?")
        .join(", ")})`;
      const values = [...product_ids, ...size_ids];

      const [rows] = await database.execute(sql, values);
      return rows;
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách giá sản phẩm theo product_id và size_id:",
        error.message
      );
      throw new Error(
        "Lỗi khi lấy danh sách giá sản phẩm theo product_id và size_id"
      );
    }
  }

  static async updateMultiplePriceById(updatePrices) {
    if (!Array.isArray(updatePrices) || updatePrices.length === 0) {
      throw new Error("Danh sách cập nhật không hợp lệ!");
    }

    try {
      const sql = `
          UPDATE ProductPrices
          SET price = CASE 
              ${updatePrices
                .map(
                  ({ price_id, price }) =>
                    `WHEN price_id = ${price_id} THEN ${price}`
                )
                .join(" ")}
          END
          WHERE price_id IN (${updatePrices
            .map(({ price_id }) => price_id)
            .join(", ")});
      `;

      const [result] = await database.execute(sql);
      return result;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật nhiều giá sản phẩm: " + error.message);
    }
  }

  // Cập nhật giá sản phẩm theo ID
  static async update(price_id, newPrice) {
    try {
      const sql = `UPDATE ProductPrices SET price = ? WHERE price_id = ?`;
      const [result] = await database.execute(sql, [newPrice, price_id]);
      return result;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật giá sản phẩm: " + error.message);
    }
  }

  // Xóa giá sản phẩm theo ID
  static async deleteById(price_id) {
    try {
      const sql = `DELETE FROM ProductPrices WHERE price_id = ?`;
      const [result] = await database.execute(sql, [price_id]);
      return result;
    } catch (error) {
      throw new Error("Lỗi khi xóa giá sản phẩm: " + error.message);
    }
  }

  static async deleteMultipleById(price_ids) {
    if (!Array.isArray(price_ids) || price_ids.length === 0) {
      throw new Error("Danh sách ID cần xóa không hợp lệ!");
    }

    try {
      const placeholders = price_ids.map(() => "?").join(", ");
      const sql = `DELETE FROM ProductPrices WHERE price_id IN (${placeholders})`;
      const [result] = await database.execute(sql, price_ids);
      return result;
    } catch (error) {
      throw new Error("Lỗi khi xóa nhiều giá sản phẩm: " + error.message);
    }
  }

  // Xóa giá sản phẩm theo product_id và danh sách size_id
  static async deleteByProductId(product_id, sizeIdsToRemove) {
    if (!Array.isArray(sizeIdsToRemove) || sizeIdsToRemove.length === 0) {
      throw new Error("Danh sách size_id cần xóa không hợp lệ!");
    }

    try {
      const sql = `DELETE FROM ProductPrices WHERE product_id = ? AND size_id IN (${sizeIdsToRemove
        .map(() => "?")
        .join(", ")})`;
      const values = [product_id, ...sizeIdsToRemove];

      const [result] = await database.execute(sql, values);

      if (result.affectedRows > 0) {
        console.log(
          `Đã xóa ${result.affectedRows} giá sản phẩm của product_id ${product_id}`
        );
      } else {
        console.log(`Không có bản ghi nào bị xóa cho product_id ${product_id}`);
      }

      return result;
    } catch (error) {
      console.log(
        "Lỗi khi xóa giá sản phẩm theo product_id trong CSDL:" + error.message
      );

      throw new Error("Lỗi khi xóa giá sản phẩm trong CSDL");
    }
  }
}

module.exports = Price;
