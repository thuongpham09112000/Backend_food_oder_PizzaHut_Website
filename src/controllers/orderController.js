const authService = require("../services/authService.js");
const orderService = require("../services/orderService");
const orderController = {
  // Tạo đơn hàng từ giỏ hàng
  async createOrder(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const userId = req.user.id;
      const { recipientInfo, paymentMethod, order_type } = req.body;
      const response = await orderService.createOrder(
        userId,
        recipientInfo,
        paymentMethod,
        order_type
      );

      if (isAdmin) {
        req.flash("success", "Đơn hàng đã được tạo thành công!");
        return res.redirect("/admin/orders");
      }
      return res.status(201).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/orders");
      }
      return res.status(400).json({ message: error.message });
    }
  },

  // Lấy tất cả đơn hàng (phục vụ admin)
  async getAllOrders(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await orderService.getAllOrder();
      console.log(">>>>", response.orders);

      if (isAdmin) {
        const authData = await authService.getUserInformation(req.user.id);
        const user = authData.user;
        return res.render("order-list", {
          title: "Danh sách đơn hàng",
          orders: response.orders,
          user,
        });
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/orders");
      }
      return res.status(500).json({ message: error.message });
    }
  },

  // Lấy danh sách đơn hàng của người dùng
  async getOrderListByUserId(req, res) {
    try {
      const userId = req.user.id;
      const response = await orderService.getOrderListByUserId(userId);

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Lấy chi tiết đơn hàng theo ID
  async getOrderDetailById(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const orderId = req.params.id;
      const response = await orderService.getOrderDetailById(orderId);
      console.log("order", response.order);

      if (isAdmin) {
        const authData = await authService.getUserInformation(req.user.id);
        const user = authData.user;
        return res.render("order-detail", {
          title: "Chi tiết đơn hàng",
          order: response.order,
          user,
        });
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/orders");
      }
      return res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật trạng thái đơn hàng
  async changeOrderStatus(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    const orderId = req.params.id;
    const status = req.body.order_status;
    console.log("status", status);

    try {
      const response = await orderService.changeOrderStatus(orderId, status);

      if (isAdmin) {
        req.flash("success", "Trạng thái đơn hàng đã được cập nhật!");
        return res.redirect(`/admin//order-detail/${orderId}`);
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect(`/admin//order-detail/${orderId}`);
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = orderController;
