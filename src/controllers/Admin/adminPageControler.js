const categoryService = require("../../services/categoryService.js");
const productService = require("../../services/productService.js");
const authService = require("../../services/authService.js");

const getAdminPage = async (req, res) => {
  try {
    const authData = await authService.getUserInformation(req.user.id);
    const user = authData.user;
    const categories = await categoryService.getAllCategories();
    const categoryData = categories.categoriesALL;

    res.render("adminIndex", { title: "Dashboard", categoryData, user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy trang Admin", error });
  }
};

const getLoginPage = (req, res) => {
  res.render("login", { title: "Đăng nhập" });
};

const getSignUpPage = (req, res) => {
  res.render("sign-up", { title: "Đăng ký" });
};

const getAddCategoryPage = async (req, res) => {
  const authData = await authService.getUserInformation(req.user.id);
  const user = authData.user;
  res.render("add-new-categorys", { title: "Danh mục", user });
};

const getAddProductPage = async (req, res) => {
  const isAdmin = req.originalUrl.startsWith("/admin");
  try {
    const result = await categoryService.getAllCategories();
    const categories = result.categoriesALL;
    const authData = await authService.getUserInformation(req.user.id);
    const user = authData.user;

    if (isAdmin) {
      return res.render("add-new-product", {
        categories,
        title: "Sản phẩm",
        user,
      });
    }
    return res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAddComboPage = async (req, res) => {
  const isAdmin = req.originalUrl.startsWith("/admin");
  try {
    const resultCategory = await categoryService.getAllCategories();
    const categories = resultCategory.categoriesALL;
    const resultProduct = await productService.getAllProducts();
    const products = resultProduct.products;
    const authData = await authService.getUserInformation(req.user.id);
    const user = authData.user;

    if (isAdmin) {
      return res.render("add-new-combo", {
        categories,
        products,
        title: "Combo",
        user,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserPage = async (req, res) => {
  try {
    const users = await authService.getAllUser();
    console.log("users", users);
    const userData = users.users;
    const authData = await authService.getUserInformation(req.user.id);
    const user = authData.user;
    res.render("all-users", { title: "Quản lý khách hàng", userData, user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu người dùng", error });
  }
};

module.exports = {
  getAdminPage,
  getLoginPage,
  getSignUpPage,
  getAddCategoryPage,
  getAddProductPage,
  getAddComboPage,
  getUserPage,
};
