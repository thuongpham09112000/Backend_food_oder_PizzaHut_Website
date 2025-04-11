const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.jwt;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, từ chối truy cập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại!" });
    }

    req.user = {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const authAdminMiddleware = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.redirect("/admin/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const admin = await User.findUserById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Người dùng không tồn tại!" });
    }

    req.user = {
      id: admin.user_id,
      name: admin.full_name,
      email: admin.email,
      phone_number: admin.phone_number,
      role: admin.role,
    };

    next();
  } catch (error) {
    res.clearCookie("jwt");
    return res.redirect("/admin/login");
  }
};

module.exports = { authMiddleware, authAdminMiddleware };
