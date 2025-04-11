const authService = require("../services/authService.js");

const userController = {
  async updateStatusUser(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const kq = await authService.updateStatus(req.body);
      console.log("kq", kq);

      if (isAdmin) {
        req.flash("success", "Trạng thái đã được cập nhật!");
        return res.redirect("/admin/users");
      }
      return res.status(200).json(kq);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/users");
      }
      return res.status(500).json({ error: error.message });
    }
  },

  // Hàm cập nhật thông tin người dùng
  async updateUserInfo(req, res) {
    try {
      const userId = req.user.id;
      const updatedData = req.body;

      const result = await authService.updateUserInfo(userId, updatedData);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi cập nhật thông tin người dùng:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  // Hàm đổi mật khẩu
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const result = await authService.changePassword(userId, oldPassword, newPassword, confirmPassword);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;
