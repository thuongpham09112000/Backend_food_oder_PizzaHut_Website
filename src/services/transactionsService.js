const Transaction = require("../models/transactionsModel");

// Tạo giao dịch mới
const createTransaction = async (
  orderId,
  amount,
  transactionType,
  paymentMethod,
  status,
  transactionReference
) => {
  try {
    if (!orderId || !amount || !transactionType || !paymentMethod || !status) {
      throw new Error("Thiếu thông tin cần thiết để tạo giao dịch.");
    }

    const transactionId = await Transaction.createTransaction(
      orderId,
      amount,
      transactionType,
      paymentMethod,
      status,
      transactionReference
    );

    const transaction = {
      transaction_id: transactionId,
      order_id: orderId,
      amount,
      transaction_type: transactionType,
      payment_method: paymentMethod,
      status,
      transaction_reference: transactionReference || null,
    };

    return {
      success: true,
      message: "Giao dịch đã được tạo thành công.",
      transaction,
    };
  } catch (error) {
    console.error("Error in createTransaction service:", error.message);
    throw new Error(error.message || "Đã xảy ra lỗi khi tạo giao dịch.");
  }
};

// Lấy giao dịch theo ID
const getTransactionById = async (transactionId) => {
  try {
    if (!transactionId) {
      throw new Error("Thiếu transactionId để lấy thông tin giao dịch.");
    }

    const transaction = await Transaction.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error(`Không tìm thấy giao dịch với ID ${transactionId}.`);
    }

    return {
      success: true,
      transaction,
    };
  } catch (error) {
    console.error("Error in getTransactionById service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi lấy thông tin giao dịch."
    );
  }
};

// Lấy danh sách giao dịch theo order_id
const getTransactionsByOrderId = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("Thiếu orderId để lấy danh sách giao dịch.");
    }

    const transactions = await Transaction.getTransactionsByOrderId(orderId);
    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.error("Error in getTransactionsByOrderId service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi lấy danh sách giao dịch."
    );
  }
};

// Cập nhật trạng thái giao dịch
const updateTransactionStatus = async (transactionId, status) => {
  try {
    if (!transactionId || !status) {
      throw new Error(
        "Thiếu thông tin cần thiết để cập nhật trạng thái giao dịch."
      );
    }

    const updated = await Transaction.updateTransactionStatus(
      transactionId,
      status
    );
    if (!updated) {
      throw new Error(
        `Không thể cập nhật trạng thái cho giao dịch với ID ${transactionId}.`
      );
    }

    return {
      success: true,
      message: "Trạng thái giao dịch đã được cập nhật thành công.",
    };
  } catch (error) {
    console.error("Error in updateTransactionStatus service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi cập nhật trạng thái giao dịch."
    );
  }
};

// Xóa giao dịch theo ID
const deleteTransaction = async (transactionId) => {
  try {
    if (!transactionId) {
      throw new Error("Thiếu transactionId để xóa giao dịch.");
    }

    const deleted = await Transaction.deleteTransaction(transactionId);
    if (!deleted) {
      throw new Error(`Không thể xóa giao dịch với ID ${transactionId}.`);
    }

    return {
      success: true,
      message: "Giao dịch đã được xóa thành công.",
    };
  } catch (error) {
    console.error("Error in deleteTransaction service:", error.message);
    throw new Error(error.message || "Đã xảy ra lỗi khi xóa giao dịch.");
  }
};

// Lấy tất cả giao dịch
const getAllTransactions = async () => {
  try {
    const transactions = await Transaction.getAllTransactions();
    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.error("Error in getAllTransactions service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi lấy danh sách tất cả giao dịch."
    );
  }
};

module.exports = {
  createTransaction,
  getTransactionById,
  getTransactionsByOrderId,
  updateTransactionStatus,
  deleteTransaction,
  getAllTransactions,
};
