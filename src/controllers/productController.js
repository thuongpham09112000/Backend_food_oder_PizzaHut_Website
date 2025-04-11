const productService = require("../services/productService.js");
const authService = require("../services/authService.js");
const categoryService = require("../services/categoryService.js");
const productController = {
  async addProduct(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await productService.addProduct(req.body, req.file);
      if (isAdmin) {
        req.flash("success", "Thêm sản phẩm mới thành công!");
        return res.redirect("/admin/add-product");
      }
      return res.status(201).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/add-product");
      }
      return res.status(400).json({ message: error.message });
    }
  },
  async getAllProduct(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const categories = await categoryService.getAllCategories();
      const result = await productService.getAllProducts();

      let productData = null;
      if (!result || !result.products) {
        if (isAdmin) {
          return res.render("products", {
            title: "Sản phẩm",
            productData,
            user,
          });
        }
        return res
          .status(404)
          .json({ message: "Không tìm thấy sản phẩm nào!" });
      }

      const categoryMap = categories.categoriesALL.reduce((map, category) => {
        map[category.category_id] = category.category_name;
        return map;
      }, {});

      productData = result.products.map((product) => ({
        ...product,
        category_name: categoryMap[product.category_id] || "Unknown",
      }));

      if (isAdmin) {
        const authData = await authService.getUserInformation(req.user.id);
        const user = authData.user;
        return res.render("products", { title: "Sản phẩm", productData, user });
      }
      return res
        .status(200)
        .json({ products: productData, message: result.message });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: error });
    }
  },
  async getProductById(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const result = await productService.getProductById(req.params.id);
      if (isAdmin) {
        const product = result.product;
        const categories = await categoryService.getAllCategories();
        const authData = await authService.getUserInformation(req.user.id);
        const user = authData.user;
        console.log("product", product);

        return res.render("update-product", {
          title: "Sản phẩm",
          product,
          categories,
          user,
        });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  async updateProduct(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await productService.updateProduct(
        req.params.id,
        req.body,
        req.file
      );
      if (isAdmin) {
        req.flash("success", "Sản phẩm đã được cập nhật!");
        return res.redirect(`/admin/update-product/${req.params.id}`);
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect(`/admin/update-product/${req.params.id}`);
      }
      return res.status(400).json({ message: error.message });
    }
  },
  async deleteProduct(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await productService.deleteProduct(req.params.id);
      if (isAdmin) {
        req.flash("success", "Sản phẩm đã được xóa!");
        return res.redirect("/admin/product");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/product");
      }
      return res.status(500).json({ message: error.message });
    }
  },
  async deleteMultipleProducts(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    console.log("req", req.body);

    try {
      const productIds = req.body.product_ids;
      if (!productIds || productIds.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một sản phẩm để xóa!");
      }
      const response = await productService.deleteMultipleProducts(productIds);
      if (isAdmin) {
        req.flash("success", "Sản phẩm đã được xóa!");
        return res.redirect("/admin/product");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/product");
      }
      return res.status(500).json({ error: error });
    }
  },
  async updateStatusProduct(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      await productService.updateStatus(req.body);
      if (isAdmin) {
        req.flash("success", "Trạng thái đã được cập nhật!");
        return res.redirect("/admin/product");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/product");
      }
      return res.status(500).json({ error: error });
    }
  },
};

module.exports = productController;
