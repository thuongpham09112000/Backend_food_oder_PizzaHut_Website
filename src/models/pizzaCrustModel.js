const { database } = require("../config/database/connect");

class PizzaCrust {
  static async findByName(crustName) {
    try {
      const query =
        "SELECT crust_id FROM PizzaCrustOptions WHERE crust_name = ?";
      const [rows] = await database.execute(query, [crustName]);
      return rows.length > 0 ? rows[0].crust_id : null;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn crust trong CSDL: " + error.message);
    }
  }

  static async findAll() {
    try {
      const query = "SELECT * FROM PizzaCrustOptions";
      const [rows] = await database.execute(query);
      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi truy vấn tất cả crust trong CSDL: " + error.message
      );
    }
  }

  static async findMultipleById(crustIds) {
    try {
      if (!Array.isArray(crustIds) || crustIds.length === 0) {
        throw new Error("Danh sách crust_id không hợp lệ");
      }

      const placeholders = crustIds.map(() => "?").join(", ");

      const [rows] = await database.execute(
        `SELECT * FROM PizzaCrustOptions WHERE crust_id IN (${placeholders})`,
        crustIds
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn nhiều crust theo ID: " + error.message);
    }
  }

  static async findMultipleByName(crustNames) {
    try {
      if (!Array.isArray(crustNames) || crustNames.length === 0) {
        throw new Error("Danh sách crust_name không hợp lệ");
      }

      const placeholders = crustNames.map(() => "?").join(", ");

      const [rows] = await database.execute(
        `SELECT * FROM PizzaCrustOptions WHERE crust_name IN (${placeholders})`,
        crustNames
      );

      return rows;
    } catch (error) {
      console.log("Lỗi khi truy vấn nhiều crust theo Name:" + error.message);

      throw new Error("Lỗi khi truy vấn nhiều crust theo Name");
    }
  }
}

module.exports = PizzaCrust;
