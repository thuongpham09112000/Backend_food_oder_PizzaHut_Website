const { database } = require("../config/database/connect");

class Tag {
  // Thêm tag mới
  static async create(tagName) {
    try {
      const [result] = await database.execute(
        "INSERT INTO Tags (tag_name) VALUES (?)",
        [tagName]
      );
      return result.insertId;
    } catch (error) {
      throw new Error("Lỗi khi thêm tag mới vào CSDL: " + error.message);
    }
  }

  // Thêm nhiều tag và trả về danh sách ID
  static async createMultiple(tags) {
    try {
      if (!Array.isArray(tags) || tags.length === 0) {
        throw new Error("Danh sách tags không hợp lệ");
      }

      const placeholders = tags.map(() => "(?)").join(", ");

      const [result] = await database.query(
        `INSERT INTO Tags (tag_name) VALUES ${placeholders}`,
        tags
      );

      const insertedIds = Array.from(
        { length: result.affectedRows },
        (_, i) => result.insertId + i
      );

      return insertedIds;
    } catch (error) {
      throw new Error("Lỗi khi thêm nhiều tag vào CSDL: " + error.message);
    }
  }

  // Thêm nhiều tag_id vào bảng ProductTags với product_id cho trước
  static async createMultipleProductTags(product_id, tag_ids) {
    try {
      if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
        throw new Error("Danh sách tag_id không hợp lệ");
      }

      const placeholders = tag_ids.map(() => "(?, ?)").join(", ");

      const values = tag_ids.flatMap((tag_id) => [product_id, tag_id]);

      const [result] = await database.execute(
        `INSERT INTO ProductTags (product_id, tag_id) VALUES ${placeholders}`,
        values
      );
      console.log("thêm dữ liệu vào ProductTags thành công!");

      return result.affectedRows;
    } catch (error) {
      throw new Error(
        "Lỗi khi thêm nhiều tag vào ProductTags: " + error.message
      );
    }
  }
  // Truy vấn tất cả tag
  static async findAll() {
    try {
      const [rows] = await database.execute("SELECT * FROM Tags");
      return rows.length > 0 ? rows : null;
    } catch (error) {
      console.log("Lỗi khi truy vấn tất cả tag" + error.message);
      throw new Error("Lỗi khi truy vấn tất cả tag");
    }
  }

  // Truy vấn tag theo ID
  static async findById(tagId) {
    try {
      const [rows] = await database.execute("SELECT * FROM Tags WHERE id = ?", [
        tagId,
      ]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn tag theo ID: " + error.message);
    }
  }

  // Truy vấn tag theo tên
  static async findByName(tagName) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM Tags WHERE tag_name = ?",
        [tagName]
      );
      return rows.length > 0 ? rows : [];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn tag theo tên: " + error.message);
    }
  }

  // Truy vấn nhiều tag theo danh sách tên
  static async findMultipleByName(tagNames) {
    try {
      if (!Array.isArray(tagNames) || tagNames.length === 0) {
        throw new Error("Danh sách tag_names không hợp lệ");
      }

      const placeholders = tagNames.map(() => "?").join(", ");

      const [rows] = await database.execute(
        `SELECT * FROM Tags WHERE tag_name IN (${placeholders})`,
        tagNames
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn nhiều tag theo tên: " + error.message);
    }
  }

  // Truy vấn dữ liệu tất cả tag_id có cùng product_id có trong ProductTags
  static async findTagIdByProductId(productId) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM ProductTags WHERE product_id = ?",
        [productId]
      );
      return rows.length > 0 ? rows : [];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn tag theo ID: " + error.message);
    }
  }

  // Truy vấn nhiều tag theo danh sách Id
  static async findMultipleById(tagIds) {
    try {
      if (!Array.isArray(tagIds) || tagIds.length === 0) {
        throw new Error("Danh sách tag_id không hợp lệ");
      }

      const placeholders = tagIds.map(() => "?").join(", ");

      const [rows] = await database.execute(
        `SELECT * FROM Tags WHERE tag_id IN (${placeholders})`,
        tagIds
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn nhiều tag theo ID: " + error.message);
    }
  }

  // Cập nhật tag theo ID
  static async updateById(tagId, newTagName) {
    try {
      const [result] = await database.execute(
        "UPDATE Tags SET tag_name = ? WHERE id = ?",
        [newTagName, tagId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật tag theo ID: " + error.message);
    }
  }

  static async updateMultipleProductTags(productId, tagIds) {
    try {
      if (!Array.isArray(tagIds) || tagIds.length === 0) {
        throw new Error("Danh sách tag_id không hợp lệ");
      }

      await database.execute("DELETE FROM ProductTags WHERE product_id = ?", [
        productId,
      ]);

      const placeholders = tagIds.map(() => "(?, ?)").join(", ");
      const values = tagIds.flatMap((tagId) => [productId, tagId]);

      const [result] = await database.execute(
        `INSERT INTO ProductTags (product_id, tag_id) VALUES ${placeholders}`,
        values
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật tags cho sản phẩm: " + error.message);
    }
  }

  // Xóa tag theo ID
  static async deleteById(tagId) {
    try {
      const [result] = await database.execute("DELETE FROM Tags WHERE id = ?", [
        tagId,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi khi xóa tag theo ID: " + error.message);
    }
  }
}

module.exports = Tag;
