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

  // Thêm sản phẩm vào combo
  static async addProductToCombo(comboId, productId, size_id, quantity = 1) {
    try {
      await database.execute(
        "INSERT INTO ComboProducts (combo_id, product_id, quantity) VALUES (?, ?, ?)",
        [comboId, productId, size_id, quantity]
      );
      return true;
    } catch (error) {
      throw new Error("Lỗi khi thêm sản phẩm vào combo: " + error.message);
    }
  }

  // Thêm nhiều sản phẩm vào combo
  static async addMultipleProductsToCombo(comboId, products) {
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("Danh sách sản phẩm không hợp lệ!");
    }

    try {
      const values = products.map(() => "(?, ?, ?)").join(",");
      const query = `INSERT INTO ComboProducts (combo_id, product_id, quantity) VALUES ${values}`;

      const params = products.flatMap(({ productId, quantity }) => [
        comboId,
        productId,
        quantity || 1,
      ]);

      await database.execute(query, params);

      return true;
    } catch (error) {
      throw new Error(
        "Lỗi khi thêm nhiều sản phẩm vào combo: " + error.message
      );
    }
  }

  // Thêm nhóm sản phẩm vào combo
  static async addProductGroupToCombo(comboId, categoryId, quantity = 1) {
    try {
      const [result] = await database.execute(
        "INSERT INTO ComboProductGroups (combo_id, category_id, quantity) VALUES (?, ?, ?)",
        [comboId, categoryId, quantity]
      );
      return { groupId: result.insertId, comboId, categoryId, quantity };
    } catch (error) {
      throw new Error("Lỗi khi thêm nhóm sản phẩm vào combo: " + error.message);
    }
  }
  // Thêm nhiều nhóm sản phẩm vào combo
  static async addMultipleProductGroupsToCombo(comboId, productGroups) {
    if (!Array.isArray(productGroups) || productGroups.length === 0) {
      throw new Error("Danh sách nhóm sản phẩm không hợp lệ!");
    }

    try {
      const values = productGroups.map(() => "(?, ?, ?)").join(",");
      const query = `INSERT INTO ComboProductGroups (combo_id, category_id, quantity) VALUES ${values}`;

      const params = productGroups.flatMap(({ categoryId, quantity }) => [
        comboId,
        categoryId,
        quantity || 1,
      ]);

      const [result] = await database.execute(query, params);

      return { groupId: result.insertId, comboId, productGroups };
    } catch (error) {
      throw new Error(
        "Lỗi khi thêm nhiều nhóm sản phẩm vào combo: " + error.message
      );
    }
  }

  static async findCombosById(id) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM Combos WHERE combo_id = ?",
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn combo từ CSDL: " + error.message);
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

  static async findProductsByComboId(comboId) {
    try {
      const [rows] = await database.execute(
        `SELECT p.* FROM Products p 
                 JOIN ComboProducts cp ON p.product_id = cp.product_id 
                 WHERE cp.combo_id = ?`,
        [comboId]
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn sản phẩm của combo: " + error.message);
    }
  }
}

module.exports = Combo;
