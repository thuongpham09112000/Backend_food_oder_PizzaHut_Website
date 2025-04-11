const { database } = require("../config/database/connect");

class Size {
  static async findByName(sizeName) {
    try {
      const query = "SELECT size_id FROM ProductSizes WHERE size_name = ?";
      const [rows] = await database.execute(query, [sizeName]);
      return rows.length > 0 ? rows[0].size_id : null;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn size trong CSDL: " + error.message);
    }
  }
  static async findAll() {
    try {
      const query = "SELECT * FROM ProductSizes";
      const [rows] = await database.execute(query);
      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi truy vấn tất cả size trong CSDL: " + error.message
      );
    }
  }

  static async findMultipleById(sizeIds) {
    try {
      if (!Array.isArray(sizeIds) || sizeIds.length === 0) {
        throw new Error("Danh sách size_id không hợp lệ");
      }

      const placeholders = sizeIds.map(() => "?").join(", ");

      const [rows] = await database.execute(
        `SELECT * FROM ProductSizes WHERE size_id IN (${placeholders})`,
        sizeIds
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn nhiều size theo ID: " + error.message);
    }
  }

  static async findMultipleByName(sizeNames) {
    try {
      if (!Array.isArray(sizeNames) || sizeNames.length === 0) {
        throw new Error("Danh sách size_id không hợp lệ");
      }

      const placeholders = sizeNames.map(() => "?").join(", ");

      const [rows] = await database.execute(
        `SELECT * FROM ProductSizes WHERE size_name IN (${placeholders})`,
        sizeNames
      );

      return rows;
    } catch (error) {
      console.log("Lỗi khi truy vấn nhiều size theo Name:" + error.message);

      throw new Error("Lỗi khi truy vấn nhiều size theo Name");
    }
  }
}

module.exports = Size;
