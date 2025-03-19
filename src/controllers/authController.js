const authService = require("../services/authService");

const authController = {
  async register(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    console.log("Req thông tin đăng ký", req.body);
    try {
      const response = await authService.register(
        req.body.name,
        req.body.email,
        req.body.phone_number,
        req.body.address,
        req.body.password,
        req.body.confirm_password,
        res
      );
      if (isAdmin) {
        req.flash("success", "Đăng ký thành công!");
        return res.redirect("/admin");
      }
      return res.status(201).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/register");
      }
      return res.status(400).json({ message: error.message });
    }
  },

  async login(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await authService.loginUser(
        req.body.email,
        req.body.password,
        res,
        isAdmin
      );
      if (isAdmin) {
        req.flash("success", "Đăng nhập thành công!");
        return res.redirect("/admin");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/login");
      }
      return res.status(isAdmin ? 403 : 400).json({ message: error.message });
    }
  },

  async logout(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = authService.logout(req, res);
      if (isAdmin) {
        req.flash("success", "Đăng xuất thành công!");
        return res.redirect("/admin/login");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin");
      }
      console.error("Lỗi hệ thống khi đăng xuất:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;
