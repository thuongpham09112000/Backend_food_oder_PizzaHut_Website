const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Combo = require("../models/comboModel");
const Size = require("../models/sizeModel.js");
const PizzaCrust = require("../models/pizzaCrustModel.js");
const cartService = require("./cartService");
const transactionsService = require("./TransactionsService");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

// Tạo đơn hàng từ giỏ hàng
const createOrder = async (userId, recipientInfo, paymentMethod, order_type) => {
  try {
    // Lấy thông tin giỏ hàng của người dùng
    const { cartItems, grandTotal: originalGrandTotal } = await cartService.getCartByUserId(userId);

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Giỏ hàng trống, không thể tạo đơn hàng.");
    }

    // Tính tổng tiền (bao gồm phí vận chuyển nếu là Delivery)
    const deliveryFee = order_type === "Delivery" ? 22000 : 0;
    const grandTotal = originalGrandTotal + deliveryFee;

    // Kiểm tra và xử lý delivery_time
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const minDeliveryTime = order_type === "Delivery" ? now.add(30, "minute") : now.add(15, "minute");

    if (!recipientInfo.delivery_time) {
      recipientInfo.delivery_time = minDeliveryTime.format("YYYY-MM-DD HH:mm:ss");
    } else {
      const deliveryTime = dayjs(recipientInfo.delivery_time).tz("Asia/Ho_Chi_Minh");
      if (deliveryTime.isBefore(minDeliveryTime)) {
        throw new Error(
          `Chúng tôi chỉ có thể ${order_type === "Delivery" ? "giao hàng" : "chuẩn bị đơn hàng"} cho bạn sớm nhất vào khoảng ${minDeliveryTime.format(
            "HH:mm:ss YYYY-MM-DD"
          )}`
        );
      }
    }

    // Tạo đơn hàng mới
    const orderId = await Order.createOrder(userId, grandTotal, order_type);
    if (!orderId) {
      throw new Error("Không thể tạo đơn hàng. Vui lòng thử lại.");
    }

    // Lưu thông tin người nhận
    const recipientSaved = await Order.addOrderRecipient(orderId, recipientInfo);
    if (!recipientSaved) {
      throw new Error("Không thể lưu thông tin người nhận. Vui lòng thử lại.");
    }

    // Thêm chi tiết đơn hàng từ giỏ hàng
    for (const item of cartItems) {
      if (item.product_id) {
        const detailAdded = await Order.addOrderDetail(
          orderId,
          item.product_id,
          item.size_id,
          item.quantity,
          item.details.product.price,
          item.totalPrice,
          item.details.product.crust_id || null
        );
        if (!detailAdded) {
          throw new Error(`Không thể thêm sản phẩm ${item.product_id} vào đơn hàng.`);
        }
      } else if (item.combo_id) {
        const comboDetailAdded = await Order.addOrderDetail(
          orderId,
          null,
          item.details.combo.size_id || null,
          item.quantity,
          item.details.combo.price,
          item.totalPrice,
          null,
          item.combo_id
        );
        if (!comboDetailAdded) {
          throw new Error(`Không thể thêm combo ${item.combo_id} vào đơn hàng.`);
        }

        // Thêm các sản phẩm trong combo vào OrderComboSelections
        for (const selection of item.details.combo.selections) {
          const selectionAdded = await Order.addOrderComboSelection(
            orderId,
            item.combo_id,
            selection.product_id,
            selection.quantity
          );
          if (!selectionAdded) {
            throw new Error(
              `Không thể thêm sản phẩm ${selection.product_id} trong combo ${item.combo_id} vào đơn hàng.`
            );
          }
        }
      }
    }

    // Tạo giao dịch thanh toán
    const transaction = await transactionsService.createTransaction(
      orderId,
      grandTotal,
      "payment",
      paymentMethod,
      "Pending",
      null // Transaction reference có thể null nếu không có
    );

    // Xóa giỏ hàng sau khi tạo đơn hàng
    const cartCleared = await cartService.clearCart(userId);
    if (!cartCleared) {
      throw new Error("Không thể xóa giỏ hàng sau khi tạo đơn hàng.");
    }

    // Tổng hợp dữ liệu order trả về
    const order = {
      order_id: orderId,
      user_id: userId,
      total_amount: grandTotal,
      recipient_info: recipientInfo,
      payment_method: paymentMethod,
      order_items: cartItems,
      order_type,
    };

    const transactionData = transaction.transaction;

    return {
      success: true,
      message: "Đơn hàng đã được tạo thành công.",
      order,
      transaction: transactionData,
    };
  } catch (error) {
    console.error("Error in createOrder service:", error.message);
    throw new Error(error.message || "Đã xảy ra lỗi khi tạo đơn hàng.");
  }
};

const getAllOrder = async () => {
  try {
    const orders = await Order.getAllOrders();
    if (!orders || orders.length === 0) {
      throw new Error("Không tìm thấy đơn hàng nào trong hệ thống.");
    }

    const userIds = [...new Set(orders.map((order) => order.user_id))];
    const users = await User.findUserByIds(userIds);

    const ordersWithUserInfo = orders.map((order) => {
      const user = users.find((u) => u.user_id === order.user_id);
      return {
        ...order,
        user: user || null,
      };
    });

    return { success: true, orders: ordersWithUserInfo };
  } catch (error) {
    console.error("Error in getAllOder service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi lấy danh sách tất cả đơn hàng."
    );
  }
};

// Lấy danh sách đơn hàng của người dùng
const getOrderListByUserId = async (userId) => {
  try {
    const orders = await Order.getOrdersByUserId(userId);
    if (!orders || orders.length === 0) {
      throw new Error("Không tìm thấy đơn hàng nào cho người dùng này.");
    }
    return { success: true, orders };
  } catch (error) {
    console.error("Error in getOrderListByUserId service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi lấy danh sách đơn hàng."
    );
  }
};

// Lấy chi tiết đơn hàng theo ID
const getOrderDetailById = async (orderId) => {
  try {
    // Lấy thông tin đơn hàng
    const order = await Order.getOrderById(orderId);
    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng với ID ${orderId}.`);
    }

    // Lấy thông tin người nhận
    const recipientInfo = await Order.getOrderRecipientByOrderId(orderId);
    if (!recipientInfo) {
      throw new Error(
        `Không tìm thấy thông tin người nhận cho đơn hàng ${orderId}.`
      );
    }

    // Lấy chi tiết đơn hàng
    const orderDetails = await Order.getOrderDetailsByOrderId(orderId);
    if (!orderDetails || orderDetails.length === 0) {
      throw new Error(`Không tìm thấy chi tiết đơn hàng cho ID ${orderId}.`);
    }

    // Trích ID cần thiết
    const productIds = orderDetails
      .filter((item) => item.product_id)
      .map((item) => item.product_id);
    const comboIds = orderDetails
      .filter((item) => item.combo_id)
      .map((item) => item.combo_id);
    const sizeIds = orderDetails.map((item) => item.size_id);
    const crustIds = orderDetails
      .map((item) => item.crust_id)
      .filter((id) => id);

    // Truy vấn thêm dữ liệu
    const products =
      productIds.length > 0 ? await Product.findByIds(productIds) : [];
    const combos = comboIds.length > 0 ? await Combo.findByIds(comboIds) : [];
    const sizes =
      sizeIds.length > 0 ? await Size.findMultipleById(sizeIds) : [];
    const crusts =
      crustIds.length > 0 ? await PizzaCrust.findMultipleById(crustIds) : [];

    // Gắn thêm thông tin chi tiết vào mỗi item trong orderDetails
    const detailedOrderDetails = orderDetails.map((item) => {
      const product = item.product_id
        ? products.find((p) => p.product_id === item.product_id)
        : null;
      const combo = item.combo_id
        ? combos.find((c) => c.combo_id === item.combo_id)
        : null;
      const size = item.size_id
        ? sizes.find((s) => s.size_id === item.size_id)
        : null;
      const crust = item.crust_id
        ? crusts.find((c) => c.crust_id === item.crust_id)
        : null;

      return {
        ...item,
        productInfo: product || null,
        comboInfo: combo || null,
        sizeInfo: size || null,
        crustInfo: crust || null,
      };
    });

    // Lấy giao dịch
    const transactions = await transactionsService.getTransactionsByOrderId(
      orderId
    );

    // Trả về dữ liệu đầy đủ
    return {
      success: true,
      order: {
        ...order,
        recipientInfo,
        orderDetails: detailedOrderDetails,
        transactions: transactions.transactions,
      },
    };
  } catch (error) {
    console.error("Error in getOrderDetailById service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi lấy chi tiết đơn hàng."
    );
  }
};

// Cập nhật trạng thái đơn hàng
const changeOrderStatus = async (orderId, status) => {
  try {
    const updated = await Order.updateOrderStatus(orderId, status);
    if (!updated) {
      throw new Error(`Không thể cập nhật trạng thái cho đơn hàng ${orderId}.`);
    }
    return { success: true };
  } catch (error) {
    console.error("Error in changeOrderStatus service:", error.message);
    throw new Error(
      error.message || "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng."
    );
  }
};

module.exports = {
  createOrder,
  getAllOrder,
  getOrderListByUserId,
  getOrderDetailById,
  changeOrderStatus,
};
