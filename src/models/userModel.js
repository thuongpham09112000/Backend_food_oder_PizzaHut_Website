const { database } = require("../config/database/connect");

class User {
  static async createUser(
    name,
    email,
    phone_number,
    address,
    hashedPassword,
    role = "customer"
  ) {
    try {
      const [result] = await database.execute(
        "INSERT INTO users (full_name, email, password_hash, phone_number, address, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phone_number, address, role, true]
      );

      const userId = result.insertId;

      if (!userId) {
        throw new Error("Không thể lấy ID người dùng sau khi chèn.");
      }

      // Truy vấn lại để lấy dữ liệu người dùng
      const [rows] = await database.execute(
        "SELECT user_id, full_name, email, phone_number, address, role FROM users WHERE user_id = ?",
        [userId]
      );

      // Trả về dữ liệu người dùng
      return rows[0];
    } catch (error) {
      console.error("Lỗi khi tạo người dùng:", error);
      throw error;
    }
  }

  static async findUserByEmail(email) {
    try {
      const [[user]] = await database.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      return user || null;
    } catch (error) {
      console.error("Lỗi khi tìm người dùng:", error);
      throw error;
    }
  }

  static async findUserByPhoneNumber(phone_number) {
    try {
      const [[user]] = await database.execute(
        "SELECT * FROM users WHERE phone_number = ?",
        [phone_number]
      );
      return user ? true : false;
    } catch (error) {
      console.error("Lỗi kiểm tra số điện thoại:", error);
      throw error;
    }
  }

  static async findUserById(userId) {
    try {
      const [[user]] = await database.execute(
        "SELECT * FROM users WHERE user_id = ?",
        [userId]
      );
      return user || null;
    } catch (error) {
      console.error("Lỗi khi tìm người dùng theo ID:", error);
      throw error;
    }
  }
}

module.exports = User;
