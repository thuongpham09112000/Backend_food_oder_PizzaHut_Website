const express = require("express");
const authController = require("../controllers/authController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const comboController = require("../controllers/comboController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();
// Authentication
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);
// User
router.put("/user", authMiddleware, userController.updateUserInfo);
router.put("/changePassword", authMiddleware, userController.changePassword);
// Category
router.get("/all-categories", categoryController.getAllCategories);
// Product
router.get("/all-products", productController.getAllProduct);
router.get("/product-detail/:id", productController.getProductById);
//Combo
router.get("/all-combos", comboController.getAllCombos);
router.get("/combo-detail/:id", comboController.getComboById);
//Cart
router.post("/add-cart/:id", authMiddleware, cartController.addItemToCart);
router.get("/cart-detail/:id", authMiddleware, cartController.getCartItems);
router.put("/update-cart/:id", authMiddleware, cartController.updateCartItem);
router.delete(
  "/remove-cart/:id",
  authMiddleware,
  cartController.removeCartItem
);
// Order
router.post("/order", authMiddleware, orderController.createOrder);
router.get("/order", authMiddleware, orderController.getOrderListByUserId);
router.get(
  "/order-detail/:id",
  authMiddleware,
  orderController.getOrderDetailById
);
module.exports = router;
