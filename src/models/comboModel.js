const { database } = require("../config/database/connect");

class Combo {
  // Thêm mới combo
  static async create({ name, description, imageUrl, price }) {
    try {
      const [result] = await database.execute(
        "INSERT INTO Combos (combo_name, price, image_url, description) VALUES (?, ?, ?, ?)",
        [name, , price, imageUrl || null, description]
      );
      return { id: result.insertId, name, description, imageUrl, price };
    } catch (error) {
      throw new Error("Lỗi khi thêm combo vào CSDL: " + error.message);
    }
  }

  // Thêm nhiều sản phẩm vào combo
  static async addMultipleProductsToCombo(comboId, products) {
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("Danh sách sản phẩm không hợp lệ!");
    }

    try {
      const values = products.map(() => "(?, ?, ?, ?)").join(",");
      const query = `INSERT INTO ComboProducts (combo_id, product_id, size_id, quantity) VALUES ${values}`;

      const params = products.flatMap(({ productId, sizeId, quantity }) => [
        comboId,
        productId,
        sizeId || 1,
        quantity || 1,
      ]);

      await database.execute(query, params);

      return true;
    } catch (error) {
      console.log(
        "Lỗi khi thêm nhiều sản phẩm vào combo vào CSDL:" + error.message
      );
      throw new Error("Lỗi khi thêm nhiều sản phẩm vào combo vào CSDL");
    }
  }

  // Thêm nhiều nhóm sản phẩm vào combo
  static async addMultipleProductGroupsToCombo(comboId, productGroups) {
    if (!Array.isArray(productGroups) || productGroups.length === 0) {
      throw new Error("Danh sách nhóm sản phẩm không hợp lệ!");
    }

    try {
      const values = productGroups.map(() => "(?, ?, ?, ?)").join(",");
      const query = `INSERT INTO ComboProductGroups (combo_id, category_id, pizza_level, quantity) VALUES ${values}`;

      const params = productGroups.flatMap(
        ({ categoryId, pizza_level, quantity }) => [
          comboId,
          categoryId,
          pizza_level || null,
          quantity || 1,
        ]
      );

      const [result] = await database.execute(query, params);

      return { groupId: result.insertId, comboId, productGroups };
    } catch (error) {
      throw new Error(
        "Lỗi khi thêm nhiều nhóm sản phẩm vào combo: " + error.message
      );
    }
  }

  static async findById(id) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM Combos WHERE combo_id = ?",
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Lỗi khi truy vấn combo từ CSDL:", error.message);
      throw new Error("Lỗi khi truy vấn combo từ CSDL");
    }
  }

  static async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Danh sách ID không hợp lệ!");
    }

    try {
      const placeholders = ids.map(() => "?").join(",");
      const query = `SELECT * FROM Combos WHERE combo_id IN (${placeholders})`;
      const [rows] = await database.execute(query, ids);
      return rows;
    } catch (error) {
      console.error("Lỗi khi truy vấn combo từ CSDL:", error.message);
      throw new Error("Lỗi khi truy vấn combo từ CSDL");
    }
  }

  static async findCombosByName(name) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM Combos WHERE combo_name = ?",
        [name]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.log("Lỗi khi truy vấn combo từ CSDL" + error.message);
      throw new Error("Lỗi khi truy vấn combo từ CSDL");
    }
  }

  static async findProductGroupsByComboId(comboId) {
    try {
      const [rows] = await database.execute(
        `SELECT g.*, c.category_name FROM ComboProductGroups g 
                 JOIN Categories c ON g.category_id = c.category_id 
                 WHERE g.combo_id = ?`,
        [comboId]
      );
      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi truy vấn nhóm sản phẩm của combo: " + error.message
      );
    }
  }

  // Lấy tất cả combo
  static async getAll() {
    try {
      const [rows] = await database.execute("SELECT * FROM Combos");
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy tất cả combo từ CSDL: " + error.message);
    }
  }

  static async updateById(comboId, comboData) {
    try {
      let sql =
        "UPDATE Combos SET combo_name = ?, description = ?, price = ?, updated_at = CURRENT_TIMESTAMP";
      let values = [comboData.name, comboData.description, comboData.price];

      if (comboData.imageUrl) {
        sql += ", image_url = ?";
        values.push(comboData.imageUrl);
      }

      sql += " WHERE combo_id = ?";
      values.push(comboId);

      await database.execute(sql, values);
      return true;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật combo trong CSDL: " + error.message);
    }
  }

  static async deleteById(id) {
    try {
      await database.execute("DELETE FROM Combos WHERE combo_id = ?", [id]);
      return true;
    } catch (error) {
      throw new Error("Lỗi khi xóa combo trong CSDL: " + error.message);
    }
  }

  static async deleteMultipleCombos(ids) {
    try {
      const placeholders = ids.map(() => "?").join(",");
      await database.execute(
        `DELETE FROM Combos WHERE combo_id IN (${placeholders})`,
        ids
      );
      return true;
    } catch (error) {
      throw new Error("Lỗi khi xóa nhiều combo trong CSDL: " + error.message);
    }
  }
  static async updateStatus(id, status) {
    try {
      const [result] = await database.execute(
        "UPDATE Combos SET status = ? WHERE combo_id = ?",
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật trạng thái combo: " + error.message);
    }
  }
}

module.exports = Combo;
