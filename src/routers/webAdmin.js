const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { authAdminMiddleware } = require("../middlewares/authMiddleware");
const {
  getAdminPage,
  getLoginPage,
  getSignUpPage,
  getAddCategoryPage,
  getAddProductPage,
  getAddComboPage,
} = require("../controllers/Admin/adminPageControler");
const authController = require("../controllers/authController");
const categoryController = require("../controllers/categoryController.js");
const productController = require("../controllers/productController.js");
const comboController = require("../controllers/comboController.js");

// Authentication
router.get("/login", getLoginPage);
router.post("/login", authController.login);
router.use(authAdminMiddleware);
router.get("/", getAdminPage);
router.get("/sign-up", getSignUpPage);
router.post("/sign-up", authController.register);

router.get("/logout", authController.logout);

// Category
router.get("/category", categoryController.getAllCategories);
router.get("/add-category", getAddCategoryPage);
router.post(
  "/add-category",
  upload.single("category_image"),
  categoryController.addCategory
);
router.get("/update-category/:id", categoryController.getCategoryById);
router.post(
  "/update-category/:id",
  upload.single("category_image"),
  categoryController.updateCategory
);
router.post("/delete-category", categoryController.deleteMultipleCategories);
router.post("/delete-category/:id", categoryController.deleteCategory);

// Product
router.get("/product", productController.getAllProduct);
router.get("/add-product", getAddProductPage);
router.post(
  "/add-product",
  upload.single("product_image"),
  productController.addProduct
);
router.get("/update-product/:id", productController.getProductById);
router.post(
  "/update-product/:id",
  upload.single("product_image"),
  productController.updateProduct
);
router.post("/delete-product", productController.deleteMultipleProducts);
router.post("/delete-product/:id", productController.deleteProduct);

router.post("/update-status/:id", productController.updateStatusProduct);

//Combo
router.get("/combo", comboController.getAllCombos);
router.get("/add-combo", getAddComboPage);
router.post(
  "/add-combo",
  upload.single("combo_image"),
  comboController.addCombo
);
// router.get("/update-combo/:id", comboController.getComboById);
// router.post(
//   "/update-combo/:id",
//   upload.single("combo_image"),
//   comboController.updateCombo
// );
// router.post("/delete-combo", comboController.deleteMultipleCombos);
// router.post("/delete-combo/:id", comboController.deleteCombo);
module.exports = router;
