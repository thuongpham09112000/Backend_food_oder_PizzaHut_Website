const { database } = require("../config/database/connect");

class Cart {
  static async create({
    user_id,
    product_id = null,
    combo_id = null,
    size_id = null,
    quantity = 1,
    crust_id = null,
    base_id = null,
  }) {
    try {
      const [result] = await database.execute(
        `INSERT INTO Cart (user_id, product_id, combo_id, size_id, quantity, crust_id, base_id, added_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [user_id, product_id, combo_id, size_id, quantity, crust_id, base_id]
      );
      console.log("Thêm sản phẩm vào giỏ hàng thành công!");
      return result.insertId;
    } catch (error) {
      throw new Error("Lỗi khi thêm sản phẩm vào giỏ hàng: " + error.message);
    }
  }

  static async getAllByUserId(user_id) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM Cart WHERE user_id = ?",
        [user_id]
      );
      return rows;
    } catch (error) {
      console.log("Lỗi truy vấn giỏ hàng: " + error.message);
      throw new Error("Lỗi khi truy vấn giỏ hàng từ CSDL");
    }
  }

  static async findById(cart_id) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM Cart WHERE cart_id = ?",
        [cart_id]
      );
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn giỏ hàng từ CSDL: " + error.message);
    }
  }

  static async findProductCart(
    user_id,
    product_id,
    size_id,
    crust_id,
    base_id
  ) {
    try {
      let conditions = ["user_id = ?", "product_id = ?", "size_id = ?"];
      let params = [user_id, product_id, size_id];
      if (crust_id === null) {
        conditions.push("crust_id IS NULL");
      } else {
        conditions.push("crust_id = ?");
        params.push(crust_id);
      }
      if (base_id === null) {
        conditions.push("base_id IS NULL");
      } else {
        conditions.push("base_id = ?");
        params.push(base_id);
      }
      const query = `SELECT * FROM Cart WHERE ${conditions.join(" AND ")}`;

      const [rows] = await database.execute(query, params);
      if (rows.length > 0) {
        return rows[0];
      }
      return rows.length > 0;
    } catch (error) {
      throw new Error("Lỗi khi truy vấn giỏ hàng từ CSDL: " + error.message);
    }
  }

  static async findByUserIdAndComboId(user_id, combo_id) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM Cart WHERE user_id = ? AND combo_id = ?",
        [user_id, combo_id]
      );
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      throw new Error("Lỗi khi truy vấn giỏ hàng từ CSDL: " + error.message);
    }
  }

  static async updateByIds(cartUpdate) {
    try {
      if (!Array.isArray(cartUpdate) || cartUpdate.length === 0) {
        throw new Error("Dữ liệu cập nhật không hợp lệ!");
      }

      const ids = cartUpdate
        .map((item) => database.escape(item.cart_id))
        .join(", ");

      const caseQuantity = cartUpdate
        .map(
          (item) =>
            `WHEN ${database.escape(item.cart_id)} THEN ${database.escape(
              item.quantity
            )}`
        )
        .join(" ");

      const query = `
        UPDATE Cart
        SET quantity = CASE cart_id
          ${caseQuantity}
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE cart_id IN (${ids});
      `;

      const [result] = await database.execute(query);
      console.log("Cập nhật giỏ hàng thành công!", result);
      return result;
    } catch (error) {
      console.error("Lỗi khi cập nhật giỏ hàng: " + error.message);
      throw new Error("Lỗi khi cập nhật giỏ hàng");
    }
  }

  static async deleteById(cart_id) {
    try {
      const [result] = await database.execute(
        "DELETE FROM Cart WHERE cart_id = ?",
        [cart_id]
      );
      if (result.affectedRows > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Lỗi khi xóa giỏ hàng: " + error.message);
      throw new Error("Lỗi khi xóa sản phẩm trong giỏ hàng khỏi CSDL");
    }
  }

  static async deleteByIds(cart_ids) {
    try {
      const placeholders = cart_ids.map(() => "?").join(", ");
      const [result] = await database.execute(
        `DELETE FROM Cart WHERE cart_id IN (${placeholders})`,
        cart_ids
      );
      if (result.affectedRows > 0) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("Lỗi khi xóa danh sách giỏ hàng: " + error.message);
      throw new Error(
        "Lỗi khi xóa danh sách sản phẩm trong giỏ hàng khỏi CSDL"
      );
    }
  }

  static async deleteByUserId(user_id) {
    try {
      const [result] = await database.execute(
        "DELETE FROM Cart WHERE user_id = ?",
        [user_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.log("Lỗi khi xóa giỏ hàng của người dùng: " + error.message);
      throw new Error("Lỗi khi xóa giỏ hàng của người dùng: " + error.message);
    }
  }

  // Methods for CartComboSelections
  // static async addComboSelection({
  //   cart_id,
  //   combo_id,
  //   product_id,
  //   quantity = 1,
  // }) {
  //   try {
  //     const [result] = await database.execute(
  //       `INSERT INTO CartComboSelections (cart_id, combo_id, product_id, quantity)
  //                VALUES (?, ?, ?, ?)`,
  //       [cart_id, combo_id, product_id, quantity]
  //     );
  //     console.log("Thêm sản phẩm vào combo trong giỏ hàng thành công!");
  //     return result.insertId;
  //   } catch (error) {
  //     throw new Error(
  //       "Lỗi khi thêm sản phẩm vào combo trong giỏ hàng: " + error.message
  //     );
  //   }
  // }

  static async addComboSelection(selections) {
    console.log("selections", selections);
    try {
      const values = selections.map((selection) => [
        selection.cart_id,
        selection.combo_id,
        selection.product_id,
        selection.quantity,
      ]);
      const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
      const flattenedValues = values.flat();

      const [result] = await database.execute(
        `INSERT INTO CartComboSelections (cart_id, combo_id, product_id, quantity) 
                 VALUES ${placeholders}`,
        flattenedValues
      );
      console.log(
        "Thêm lựa chọn các sản phẩm của combo trong giỏ hàng thành công!"
      );
      return result.insertId;
    } catch (error) {
      console.log(
        "Lỗi khi thêm lựa chọn các sản phẩm của combo trong giỏ hàng: " +
          error.message
      );
      throw new Error(
        "Lỗi khi thêm lựa chọn các sản phẩm của combo trong giỏ hàng"
      );
    }
  }

  static async getComboSelectionsByCartId(cart_id) {
    try {
      const [rows] = await database.execute(
        "SELECT * FROM CartComboSelections WHERE cart_id = ?",
        [cart_id]
      );
      return rows;
    } catch (error) {
      console.log("Lỗi truy vấn combo trong giỏ hàng: " + error.message);
      throw new Error(
        "Lỗi khi truy vấn combo trong giỏ hàng từ CSDL: " + error.message
      );
    }
  }

  static async getComboSelectionsByCartIdS(cart_ids) {
    try {
      const [rows] = await database.execute(
        `SELECT * FROM CartComboSelections WHERE cart_id IN (${cart_ids.map(
          () => "?"
        )})`,
        cart_ids
      );
      return rows;
    } catch (error) {
      console.log("Lỗi truy vấn combo trong giỏ hàng: " + error.message);
      throw new Error(
        "Lỗi khi truy vấn combo trong giỏ hàng từ CSDL: " + error.message
      );
    }
  }

  static async updateComboSelection(cart_id, combo_id, product_id, quantity) {
    try {
      const [result] = await database.execute(
        `UPDATE CartComboSelections 
                 SET quantity = ? 
                 WHERE cart_id = ? AND combo_id = ? AND product_id = ?`,
        [quantity, cart_id, combo_id, product_id]
      );
      console.log(`Cập nhật combo trong giỏ hàng thành công!`);
      return result;
    } catch (error) {
      console.error("Lỗi khi cập nhật combo trong giỏ hàng: " + error.message);
      throw new Error(
        "Lỗi khi cập nhật combo trong giỏ hàng: " + error.message
      );
    }
  }

  static async deleteComboSelection(cart_id, combo_id, product_id) {
    try {
      const [result] = await database.execute(
        "DELETE FROM CartComboSelections WHERE cart_id = ? AND combo_id = ? AND product_id = ?",
        [cart_id, combo_id, product_id]
      );
      if (result.affectedRows > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Lỗi khi xóa combo trong giỏ hàng: " + error.message);
      throw new Error("Lỗi khi xóa combo trong giỏ hàng: " + error.message);
    }
  }
}

module.exports = Cart;
