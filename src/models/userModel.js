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
        "INSERT INTO Users (full_name, email, password_hash, phone_number, address, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phone_number, address, role, true]
      );

      const userId = result.insertId;

      if (!userId) {
        throw new Error("Không thể lấy ID người dùng sau khi chèn.");
      }

      // Truy vấn lại để lấy dữ liệu người dùng
      const [rows] = await database.execute(
        "SELECT user_id, full_name, email, phone_number, address, role FROM Users WHERE user_id = ?",
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
        "SELECT * FROM Users WHERE email = ?",
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
        "SELECT * FROM Users WHERE phone_number = ?",
        [phone_number]
      );
      return user;
    } catch (error) {
      console.error("Lỗi kiểm tra số điện thoại:", error);
      throw error;
    }
  }

  static async findUserById(userId) {
    try {
      const [[user]] = await database.execute(
        "SELECT * FROM Users WHERE user_id = ?",
        [userId]
      );
      return user || null;
    } catch (error) {
      console.error("Lỗi khi tìm người dùng theo ID:", error);
      throw error;
    }
  }

  static async findUserByIds(userIds) {
    try {
      const [users] = await database.execute(
        `SELECT * FROM Users WHERE user_id IN (${userIds
          .map(() => "?")
          .join(",")})`,
        userIds
      );
      return users;
    } catch (error) {
      console.error("Lỗi khi tìm danh sách người dùng theo ID:", error);
      throw error;
    }
  }

  static async findAllUsers() {
    try {
      const [rows] = await database.execute("SELECT * FROM Users");
      return rows;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      throw error;
    }
  }

  static async updateStatus(statusData) {
    try {
      const { user_id, status } = statusData;
      const [result] = await database.execute(
        "UPDATE Users SET status = ? WHERE user_id = ?",
        [status, user_id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Không thể cập nhật trạng thái người dùng.");
      }
      console.log("đã thay đổi trạng thái trong csdl");
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
      throw error;
    }
  }

  static async updatePassword(userId, hashedPassword) {
    const query = `
      UPDATE Users
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;
    try {
      const [result] = await database.execute(query, [hashedPassword, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  static async updateUserInfo(
    userId,
    { full_name, email, phone_number, address }
  ) {
    const query = `
      UPDATE Users
      SET full_name = ?, email = ?, phone_number = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;
    try {
      const [result] = await database.execute(query, [
        full_name,
        email,
        phone_number,
        address,
        userId,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating user info:", error);
      throw error;
    }
  }
}

module.exports = User;
