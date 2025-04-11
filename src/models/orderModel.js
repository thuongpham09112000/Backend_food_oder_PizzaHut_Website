const { database } = require("../config/database/connect");

class Order {
  // Tạo đơn hàng mới
  static async createOrder(userId, totalPrice, orderType) {
    const query = `
      INSERT INTO Orders (user_id, total_price, order_type)
      VALUES (?, ?, ?)
    `;
    try {
      const [result] = await database.execute(query, [userId, totalPrice, orderType]);
      return result.insertId; // Trả về order_id vừa tạo
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  // Lấy thông tin đơn hàng theo ID
  static async getOrderById(orderId) {
    const query = `
      SELECT * FROM Orders
      WHERE order_id = ?
    `;
    try {
      const [rows] = await database.execute(query, [orderId]);
      return rows[0]; // Trả về đơn hàng đầu tiên (nếu có)
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      throw error;
    }
  }

  // Cập nhật trạng thái đơn hàng
  static async updateOrderStatus(orderId, status) {
    const query = `
      UPDATE Orders
      SET order_status = ?
      WHERE order_id = ?
    `;
    try {
      const [result] = await database.execute(query, [status, orderId]);
      return result.affectedRows > 0; // Trả về true nếu cập nhật thành công
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  // Xóa đơn hàng
  static async deleteOrder(orderId) {
    const query = `
      DELETE FROM Orders
      WHERE order_id = ?
    `;
    try {
      const [result] = await database.execute(query, [orderId]);
      return result.affectedRows > 0; // Trả về true nếu xóa thành công
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }

  // Lấy danh sách đơn hàng của người dùng
  static async getOrdersByUserId(userId) {
    const query = `
      SELECT * FROM Orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    try {
      const [rows] = await database.execute(query, [userId]);
      return rows; // Trả về danh sách đơn hàng
    } catch (error) {
      console.error("Error fetching orders by user ID:", error);
      throw error;
    }
  }

  // Thêm chi tiết đơn hàng
  static async addOrderDetail(
    orderId,
    productId,
    sizeId,
    quantity,
    unitPrice,
    subtotal,
    crustId = null
  ) {
    const query = `
      INSERT INTO OrderDetails (order_id, product_id, size_id, quantity, unit_price, subtotal, crust_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await database.execute(query, [
        orderId,
        productId,
        sizeId,
        quantity,
        unitPrice,
        subtotal,
        crustId,
      ]);
      return result.insertId; // Trả về order_detail_id vừa tạo
    } catch (error) {
      console.error("Error adding order detail:", error);
      throw error;
    }
  }

  // Lấy chi tiết đơn hàng theo ID đơn hàng
  static async getOrderDetailsByOrderId(orderId) {
    const query = `
      SELECT * FROM OrderDetails
      WHERE order_id = ?
    `;
    try {
      const [rows] = await database.execute(query, [orderId]);
      return rows; // Trả về danh sách chi tiết đơn hàng
    } catch (error) {
      console.error("Error fetching order details by order ID:", error);
      throw error;
    }
  }

  // Lấy tất cả đơn hàng
  static async getAllOrders() {
    const query = `
      SELECT * FROM Orders
      ORDER BY created_at DESC
    `;
    try {
      const [rows] = await database.execute(query);
      return rows;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      throw error;
    }
  }

  // Thêm thông tin người nhận đơn hàng
  static async addOrderRecipient(orderId, recipientInfo) {
    const query = `
      INSERT INTO OrderRecipients (order_id, full_name, phone_number, delivery_address, delivery_time, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {
      const { full_name, phone_number, delivery_address, delivery_time, note } =
        recipientInfo;
      const [result] = await database.execute(query, [
        orderId,
        full_name,
        phone_number,
        delivery_address,
        delivery_time || null, // Nếu không có thời gian giao hàng, lưu null
        note || null, // Nếu không có ghi chú, lưu null
      ]);
      return result.affectedRows > 0; // Trả về true nếu thêm thành công
    } catch (error) {
      console.error("Error adding order recipient:", error);
      throw error;
    }
  }

  // Lấy thông tin người nhận đơn hàng theo ID đơn hàng
  static async getOrderRecipientByOrderId(orderId) {
    const query = `
      SELECT full_name, phone_number, delivery_address, delivery_time, note
      FROM OrderRecipients
      WHERE order_id = ?
    `;
    try {
      const [rows] = await database.execute(query, [orderId]);
      return rows[0] || null; // Trả về thông tin người nhận đầu tiên (nếu có), hoặc null nếu không tìm thấy
    } catch (error) {
      console.error("Error fetching order recipient by order ID:", error);
      throw error;
    }
  }

  // Lấy danh sách các sản phẩm trong combo theo ID đơn hàng
  static async getOrderComboSelectionsByOrderId(orderId) {
    const query = `
      SELECT 
        ocs.order_detail_id,
        ocs.combo_id,
        ocs.product_id,
        ocs.quantity,
        p.product_name,
        ps.size_name
      FROM OrderComboSelections ocs
      INNER JOIN Products p ON ocs.product_id = p.product_id
      LEFT JOIN ProductSizes ps ON ps.size_id = (
        SELECT size_id 
        FROM OrderDetails 
        WHERE order_detail_id = ocs.order_detail_id
      )
      WHERE ocs.order_detail_id IN (
        SELECT order_detail_id 
        FROM OrderDetails 
        WHERE order_id = ?
      )
    `;
    try {
      const [rows] = await database.execute(query, [orderId]);
      return rows; // Trả về danh sách các sản phẩm trong combo
    } catch (error) {
      console.error("Error fetching combo selections by order ID:", error);
      throw error;
    }
  }
}

module.exports = Order;
