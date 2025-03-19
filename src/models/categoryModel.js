const { database } = require("../config/database/connect");

class Category {
  static async create({ name, description, imageUrl }) {
    console.log("req", name, description, imageUrl);

    try {
      const [result] = await database.execute(
        "INSERT INTO categories (category_name, description, image_category_url) VALUES (?, ?, ?)",
        [name, description, imageUrl || null]
      );
      return { id: result.insertId, name, description, imageUrl };
    } catch (error) {
      throw new Error("Lỗi khi thêm danh mục vào CSDL: " + error.message);
    }
  }

  static async findAll() {
    try {
      const [rows] = await database.execute("SELECT * FROM categories");
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn danh mục từ CSDL: " + error.message);
    }
  }

  static async findOneByName(category_name) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM categories WHERE category_name = ?",
        [category_name]
      );

      if (rows.length === 0) {
        console.log("Không tìm thấy danh mục nào trong CSDL.");
        return null;
      }
      return rows[0];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn danh mục từ CSDL: " + error.message);
    }
  }

  static async findMultipleByName(category_names) {
    if (!Array.isArray(category_names) || category_names.length === 0) {
      throw new Error("Danh sách tên danh mục không hợp lệ!");
    }

    try {
      const placeholders = category_names.map(() => "?").join(",");
      const query = `SELECT * FROM categories WHERE category_name IN (${placeholders})`;
      const [rows] = await database.execute(query, category_names);

      if (rows.length === 0) {
        console.log("Không tìm thấy danh mục nào trong CSDL.");
        return [];
      }
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn danh mục từ CSDL: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM categories WHERE category_id = ?",
        [id]
      );
      if (rows.length === 0) {
        // console.log("Không tìm thấy danh mục nào trùng khớp trong CSDL.");
        return null;
      }
      return rows[0];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn danh mục trong CSDL: " + error.message);
    }
  }

  static async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Danh sách ID không hợp lệ!");
    }

    try {
      const placeholders = ids.map(() => "?").join(",");
      const query = `SELECT * FROM categories WHERE category_id IN (${placeholders})`;
      const [rows] = await database.execute(query, ids);
      return rows;
    } catch (error) {
      console.error("Lỗi khi truy vấn danh mục từ CSDL:", error.message);
      throw new Error("Lỗi khi truy vấn danh mục từ CSDL");
    }
  }

  static async updateById(categoryId, categoryData) {
    try {
      let sql = `
        UPDATE Categories 
        SET category_name = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
      `;

      let values = [categoryData.name, categoryData.description];

      if (categoryData.imageUrl) {
        sql += `, image_category_url = ?`;
        values.push(categoryData.imageUrl);
      }

      sql += ` WHERE category_id = ?`;
      values.push(categoryId);

      const [result] = await database.execute(sql, values);
      console.log(`Cập nhật lại danh mục có id ${categoryId} vào CSDL`);
      return result;
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục vào CSDL:", error.message);
      throw new Error("Lỗi khi cập nhật danh mục vào CSDL");
    }
  }

  static async deleteOneById(id) {
    try {
      const [result] = await database.execute(
        "DELETE FROM categories WHERE category_id = ?",
        [id]
      );
      return true;
    } catch (error) {
      console.log("Lỗi khi xóa danh mục trong CSDL: " + error.message);
      throw new Error("Lỗi khi xóa danh mục trong CSDL");
    }
  }

  static async deleteMultipleById(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Danh sách ID không hợp lệ để xóa trong CSDL");
    }
    try {
      const placeholders = ids.map(() => "?").join(",");
      const query = `DELETE FROM categories WHERE category_id IN (${placeholders})`;

      console.log("Query thực thi:", query, ids);

      const [result] = await database.execute(query, ids);

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Lỗi khi xóa các danh mục trong CSDL:", error.message);
      throw new Error("Lỗi khi xóa các danh mục trong CSDL");
    }
  }
}

module.exports = Category;
