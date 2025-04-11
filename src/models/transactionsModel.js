const { database } = require("../config/database/connect");

class Transactions {
  // Tạo giao dịch mới
  static async createTransaction(
    orderId,
    amount,
    transactionType,
    paymentMethod,
    status,
    transactionReference
  ) {
    const query = `
      INSERT INTO Transactions (order_id, amount, transaction_type, payment_method, status, transaction_reference)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await database.execute(query, [
        orderId,
        amount,
        transactionType,
        paymentMethod,
        status,
        transactionReference || null,
      ]);
      return result.insertId; // Trả về transaction_id vừa tạo
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  // Lấy giao dịch theo ID
  static async getTransactionById(transactionId) {
    const query = `
      SELECT * FROM Transactions
      WHERE transaction_id = ?
    `;
    try {
      const [rows] = await database.execute(query, [transactionId]);
      return rows[0]; // Trả về giao dịch đầu tiên (nếu có)
    } catch (error) {
      console.error("Error fetching transaction by ID:", error);
      throw error;
    }
  }

  // Lấy danh sách giao dịch theo order_id
  static async getTransactionsByOrderId(orderId) {
    const query = `
      SELECT * FROM Transactions
      WHERE order_id = ?
      ORDER BY created_at DESC
    `;
    try {
      const [rows] = await database.execute(query, [orderId]);
      return rows; // Trả về danh sách giao dịch
    } catch (error) {
      console.error("Error fetching transactions by order ID:", error);
      throw error;
    }
  }

  // Cập nhật trạng thái giao dịch
  static async updateTransactionStatus(transactionId, status) {
    const query = `
      UPDATE Transactions
      SET status = ?
      WHERE transaction_id = ?
    `;
    try {
      const [result] = await database.execute(query, [status, transactionId]);
      return result.affectedRows > 0; // Trả về true nếu cập nhật thành công
    } catch (error) {
      console.error("Error updating transaction status:", error);
      throw error;
    }
  }

  // Xóa giao dịch theo ID
  static async deleteTransaction(transactionId) {
    const query = `
      DELETE FROM Transactions
      WHERE transaction_id = ?
    `;
    try {
      const [result] = await database.execute(query, [transactionId]);
      return result.affectedRows > 0; // Trả về true nếu xóa thành công
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }

  // Lấy tất cả giao dịch
  static async getAllTransactions() {
    const query = `
      SELECT * FROM Transactions
      ORDER BY created_at DESC
    `;
    try {
      const [rows] = await database.execute(query);
      return rows; // Trả về danh sách tất cả giao dịch
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      throw error;
    }
  }
}

module.exports = Transactions;
