const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

const setAuthCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 2 * 60 * 60 * 1000,
  });
};

const validateInput = ({
  name,
  email,
  phone_number,
  address,
  password,
  confirm_password,
}) => {
  if (
    [name, email, phone_number, address, password, confirm_password].some(
      (field) => !field
    )
  ) {
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("Email không hợp lệ");

  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneRegex.test(phone_number))
    throw new Error("Số điện thoại không hợp lệ");

  if (password !== confirm_password) throw new Error("Mật khẩu không khớp");
};

const register = async (
  name,
  email,
  phone_number,
  address,
  password,
  confirm_password,
  res
) => {
  try {
    validateInput({
      name,
      email,
      phone_number,
      address,
      password,
      confirm_password,
    });

    const [existingUser, isPhoneExist] = await Promise.all([
      User.findUserByEmail(email),
      User.findUserByPhoneNumber(phone_number),
    ]);

    if (existingUser) throw new Error("Email đã được sử dụng");
    if (isPhoneExist) throw new Error("Số điện thoại đã tồn tại");

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.createUser(
      name,
      email,
      phone_number,
      address,
      hashedPassword
    );
    const token = generateToken(user);

    setAuthCookie(res, token);

    console.log(`Đã đăng ký tài khoản ${user.full_name}`);
    return {
      message: "Tạo tài khoản thành công!",
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message);
    throw new Error(error.message);
  }
};

const loginUser = async (email, password, res, isAdmin = false) => {
  try {
    if (!email || !password) throw new Error("Vui lòng nhập email và mật khẩu");

    const user = await User.findUserByEmail(email);
    if (!user) throw new Error("Email hoặc mật khẩu không chính xác");

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error("Email hoặc mật khẩu không chính xác");

    if (isAdmin && user.role !== "admin")
      throw new Error("Bạn không có quyền truy cập trang Admin");

    if (user.status !== "active") {
      throw new Error(
        `Tài khoản của bạn đã bị ${
          user.status === "inactive" ? "tạm khóa" : "cấm"
        }`
      );
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    console.log(`Đã đăng nhập với tài khoản ${user.full_name}`);
    return {
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    throw new Error(error.message);
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    console.log("Đã đăng xuất khỏi hệ thống");
    return { success: true, message: "Đăng xuất thành công!" };
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    throw new Error("Có lỗi xảy ra khi đăng xuất");
  }
};

const getUserInformation = async (userId) => {
  try {
    if (!userId) {
      return { message: "ID người dùng không hợp lệ", user: null };
    }
    const user = await User.findUserById(userId);
    if (!user) {
      return { message: "Không tìm thấy người dùng", user: null };
    }
    return { message: "Lấy thông tin người dùng thành công!", user };
  } catch (error) {
    console.error("❌ [getUserInformation] Lỗi:", error);
    return {
      message: "Lỗi server khi lấy thông tin người dùng",
      errors: error,
      user: null,
    };
  }
};

const getAllUser = async () => {
  try {
    const users = await User.findAllUsers();
    const customers = users.filter((user) => user.role === "customer");
    return {
      message: "Lấy danh sách người dùng thành công!",
      users: customers,
    };
  } catch (error) {
    console.error("❌ [getAllUser] Lỗi:", error);
    return {
      message: "Lỗi server khi lấy danh sách người dùng",
      errors: error,
      users: [],
    };
  }
};

const updateStatus = async (statusData) => {
  try {
    const validStatuses = ["active", "inactive", "banned"];
    const status = statusData.status.toLowerCase();
    if (!status || !validStatuses.includes(status)) {
      throw new Error("Trạng thái không hợp lệ!");
    }
    const result = await User.updateStatus({ ...statusData, status });
    if (result === true) {
      return {
        success: result,
        message: "Cập nhật trạng thái tài khoản thành công!",
      };
    }
  } catch (error) {
    console.error(error.message);
    throw new Error("Lỗi cập nhật trạng thái tài khoản khách hàng!");
  }
};

const changePassword = async (
  userId,
  oldPassword,
  newPassword,
  confirmPassword
) => {
  try {
    if (!userId || !oldPassword || !newPassword || !confirmPassword) {
      throw new Error("Vui lòng nhập đầy đủ thông tin.");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
    }

    const user = await User.findUserById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại.");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      throw new Error("Mật khẩu cũ không chính xác.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const isUpdated = await User.updatePassword(userId, hashedPassword);

    if (!isUpdated) {
      throw new Error("Không thể cập nhật mật khẩu. Vui lòng thử lại.");
    }

    console.log(`Mật khẩu của người dùng ${user.full_name} đã được thay đổi.`);
    return { success: true, message: "Đổi mật khẩu thành công!" };
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error.message);
    throw new Error(error.message);
  }
};

const updateUserInfo = async (userId, updatedData) => {
  try {
    const { full_name, email, phone_number, address } = updatedData;

    if (!userId || !full_name || !email || !phone_number) {
      throw new Error("Vui lòng nhập đầy đủ thông tin.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Email không hợp lệ.");
    }

    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone_number)) {
      throw new Error("Số điện thoại không hợp lệ.");
    }

    // Kiểm tra email trùng lặp
    const existingUserByEmail = await User.findUserByEmail(email);
    if (existingUserByEmail && existingUserByEmail.user_id !== userId) {
      throw new Error("Email đã được sử dụng bởi người dùng khác.");
    }

    // Kiểm tra số điện thoại trùng lặp
    const existingUserByPhone = await User.findUserByPhoneNumber(phone_number);
    console.log(existingUserByPhone.user_id);
    console.log(userId);
    if (existingUserByPhone && existingUserByPhone.user_id !== userId) {
      throw new Error("Số điện thoại đã được sử dụng bởi người dùng khác.");
    }

    // Cập nhật thông tin người dùng
    const isUpdated = await User.updateUserInfo(userId, {
      full_name,
      email,
      phone_number,
      address,
    });

    if (!isUpdated) {
      throw new Error(
        "Không thể cập nhật thông tin người dùng. Vui lòng thử lại."
      );
    }

    // Lấy thông tin người dùng sau khi cập nhật
    const updatedUser = await User.findUserById(userId);

    if (!updatedUser) {
      throw new Error("Không thể lấy thông tin người dùng sau khi cập nhật.");
    }

    console.log(`Thông tin của người dùng ${full_name} đã được cập nhật.`);
    return {
      success: true,
      message: "Cập nhật thông tin thành công!",
      user: updatedUser, // Trả về thông tin người dùng vừa cập nhật
    };
  } catch (error) {
    console.error("Lỗi cập nhật thông tin người dùng:", error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  register,
  loginUser,
  logout,
  getUserInformation,
  getAllUser,
  updateStatus,
  changePassword,
  updateUserInfo,
};
