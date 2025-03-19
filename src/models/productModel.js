const { database } = require("../config/database/connect");

class Product {
  static async create({
    product_name,
    description,
    image_url,
    category_id,
    average_rating = 5,
    review_count = 0,
    status = "Active",
  }) {
    try {
      const [result] = await database.execute(
        "INSERT INTO Products (product_name, description, image_url, category_id, average_rating, review_count, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          product_name,
          description,
          image_url,
          category_id,
          average_rating,
          review_count,
          status,
        ]
      );
      console.log("thêm sản phẩm vào CSDL thành công!");
      return result.insertId;
    } catch (error) {
      throw new Error("Lỗi khi thêm sản phẩm vào CSDL: " + error.message);
    }
  }

  static async getAll() {
    try {
      const [rows] = await database.execute("SELECT * FROM Products");
      return rows;
    } catch (error) {
      console.log("Lỗi truy vấn CSDL:" + error.message);
      throw new Error("Lỗi khi truy vấn sản phẩm từ CSDL: ");
    }
  }

  static async findOneByName(product_name) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM products WHERE product_name = ?",
        [product_name]
      );

      if (rows.length === 0) {
        console.log("Không tìm thấy sản phẩm nào trong CSDL.");
        return null;
      }
      return rows[0];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn sản phẩm từ CSDL: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM Products WHERE product_id = ?",
        [id]
      );
      if (rows.length === 0) {
        // console.log("Không tìm thấy sản phẩm nào trùng khớp trong CSDL.");
        return null;
      }
      return rows[0];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn sản phẩm trong CSDL: " + error.message);
    }
  }

  static async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Danh sách ID không hợp lệ!");
    }

    try {
      const placeholders = ids.map(() => "?").join(",");
      const query = `SELECT * FROM Products WHERE product_id IN (${placeholders})`;
      const [rows] = await database.execute(query, ids);
      return rows;
    } catch (error) {
      console.error("Lỗi khi truy vấn sản phẩm từ CSDL:", error.message);
      throw new Error("Lỗi khi truy vấn sản phẩm từ CSDL");
    }
  }

  static async updateById(productId, productData) {
    console.log("update CSDL", productId, productData);

    try {
      const values = [
        productData.product_name,
        productData.description,
        productData.image_url,
        productData.category_id,
        productId,
      ];
      const [result] = await database.execute(
        `
        UPDATE Products 
        SET product_name = ?, description = ?, image_url = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE product_id = ?
      `,
        values
      );
      console.log(`cập nhật lại sản phẩm có id ${productId} vào CSDL`);
      return result;
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm vào CSDL:", error.message);
      throw new Error("Lỗi khi cập nhật sản phẩm vào CSDL");
    }
  }

  static async deleteOneById(id) {
    try {
      const [result] = await database.execute(
        "DELETE FROM Products WHERE product_id = ?",
        [id]
      );
      if (result.affectedRows > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Lỗi khi xóa sản phẩm trong CSDL: " + error.message);
      throw new Error("Lỗi khi xóa sản phẩm trong CSDL");
    }
  }

  static async deleteMultipleById(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Danh sách ID không hợp lệ để xóa trong CSDL");
    }
    try {
      const placeholders = ids.map(() => "?").join(",");
      const query = `DELETE FROM Products WHERE product_id IN (${placeholders})`;
      console.log("Query thực thi:", query, ids);
      const [result] = await database.execute(query, ids);
      return true;
    } catch (error) {
      console.log("Lỗi khi xóa các sản phẩm trong CSDL: " + error.message);
      throw new Error("Lỗi khi xóa các sản phẩm trong CSDL");
    }
  }

  static async updateStatus(statusData) {
    try {
      const [rows] = await database.execute(
        "UPDATE Products SET status = ? WHERE product_id = ?",
        [statusData.status, statusData.product_id]
      );
      if (rows.length === 0) {
        // console.log("Không tìm thấy sản phẩm nào trùng khớp trong CSDL.");
        return null;
      }
      return true;
    } catch (error) {
      console.log("Lỗi truy vấn CSDL" + error.message);

      throw new Error("Lỗi khi cập nhật trạng thái sản phẩm trong CSDL");
    }
  }
}

module.exports = Product;
