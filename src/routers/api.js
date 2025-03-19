const express = require("express");
const authController = require("../controllers/authController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const comboController = require("../controllers/comboController");
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/all-categories", categoryController.getAllCategories);
router.get("/all-products", productController.getAllProduct);
router.get("/all-combos", comboController.getAllCombos);
router.post("/add-cart", authMiddleware, cartController.addItemToCart);

module.exports = router;
