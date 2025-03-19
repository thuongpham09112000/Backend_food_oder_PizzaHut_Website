const { database } = require("../config/database/connect");

class PizzaBases {
  static async createMultipleProductBases(product_id, base_ids) {
    if (!product_id || !Array.isArray(base_ids) || base_ids.length === 0) {
      throw new Error("Invalid product_id or base_ids");
    }

    const placeholders = base_ids.map(() => "(?, ?)").join(", ");
    const query = `
          INSERT INTO ProductPizzaBases (product_id, base_id) 
          VALUES ${placeholders}
      `;

    const values = base_ids.flatMap((base_id) => [product_id, base_id]);

    try {
      const [result] = await database.query(query, values);
      return result;
    } catch (error) {
      console.error(
        "Lỗi khi thêm dữ liệu vào ProductPizzaBases trong CSDL",
        error
      );
      throw new Error("Lỗi khi lưu dữ liệu vào CSDL");
    }
  }

  // Truy vấn sản phẩm bằng base_name
  static async findMultipleByName(base_names) {
    if (!Array.isArray(base_names)) {
      base_names = typeof base_names === "string" ? [base_names] : [];
    }

    if (base_names.length === 0) {
      return [];
    }

    try {
      const query = `
            SELECT * FROM pizzabases 
            WHERE base_name IN (${base_names.map(() => "?").join(",")})
        `;

      const [bases] = await database.query(query, base_names);

      return bases;
    } catch (error) {
      console.error("Lỗi khi truy vấn pizza_bases trong CSDL:", error);
      throw new Error("Không thể truy vấn danh sách pizza_bases.");
    }
  }

  // Truy vấn sản phẩm bằng base_id
  static async findMultipleById(base_ids) {
    if (!Array.isArray(base_ids) || base_ids.length === 0) {
      return [];
    }

    try {
      const query = `
        SELECT * FROM pizzabases 
        WHERE base_id IN (${base_ids.map(() => "?").join(",")})
      `;

      const [bases] = await database.query(query, base_ids);

      return bases;
    } catch (error) {
      console.error("Lỗi khi truy vấn pizza_bases trong CSDL:", error);
      throw new Error("Không thể truy vấn danh sách pizza_bases.");
    }
  }

  static async findBaseIdByProductId(productId) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM ProductPizzaBases WHERE product_id = ?",
        [productId]
      );
      return rows.length > 0 ? rows : [];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn tag theo ID: " + error.message);
    }
  }

  static async deleteMultipleProductBases(product_id, base_ids) {
    if (!product_id || !Array.isArray(base_ids) || base_ids.length === 0) {
      throw new Error("product_id hoặc base_ids không hợp lệ");
    }

    const query = `
          DELETE FROM ProductPizzaBases 
          WHERE product_id = ? AND base_id IN (${base_ids
            .map(() => "?")
            .join(",")})
      `;

    try {
      const [result] = await database.query(query, [product_id, ...base_ids]);
      return result;
    } catch (error) {
      console.error("Lỗi khi xóa dữ liệu đế bánh trong CSDL", error);
      throw new Error("Lỗi khi xóa dữ liệu đế bánh trong CSDL");
    }
  }
}

module.exports = PizzaBases;
