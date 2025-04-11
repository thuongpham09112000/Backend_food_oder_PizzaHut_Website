const categoryService = require("../services/categoryService.js");
const authService = require("../services/authService.js");

const categoryController = {
  async addCategory(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await categoryService.addCategory(
        req.body,
        req.file.filename
      );
      if (isAdmin) {
        req.flash("success", "Thêm danh mục mới thành công!");
        return res.redirect("/admin/add-category");
      }
      return res.status(201).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/add-category");
      }
      return res.status(400).json({ message: error.message });
    }
  },
  async getAllCategories(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const result = await categoryService.getAllCategories();

      if (isAdmin) {
        categories = result.categoriesALL;
        const authData = await authService.getUserInformation(req.user.id);
        const user = authData.user;
        console.log("categories", categories);

        return res.render("category", { title: "Danh mục", categories, user });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  async getCategoryById(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const result = await categoryService.getCategoryById(req.params.id);
      const category = result.category;
      const authData = await authService.getUserInformation(req.user.id);
      const user = authData.user;
      if (isAdmin) {
        console.log("category", category);

        return res.render("update-category", {
          title: "Danh mục",
          category,
          user,
        });
      }
      return res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  async updateCategory(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const imageName = req.file ? req.file.filename : 0;
      const response = await categoryService.updateCategory(
        req.params.id,
        req.body,
        imageName
      );
      if (isAdmin) {
        req.flash("success", "Danh mục đã được cập nhật!");
        return res.redirect(`/admin/update-category/${req.params.id}`);
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect(`/admin/update-category/${req.params.id}`);
      }
      return res.status(400).json({ message: error.message });
    }
  },
  async deleteCategory(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await categoryService.deleteCategory(req.params.id);
      if (isAdmin) {
        req.flash("success", "Danh mục đã được xóa!");
        return res.redirect("/admin/category");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/category");
      }
      return res.status(500).json({ message: error.message });
    }
  },
  async deleteMultipleCategories(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const categoryIds = req.body.category_ids;
      if (!categoryIds || categoryIds.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một danh mục để xóa!");
      }
      const response = await categoryService.deleteMultipleCategories(
        categoryIds
      );
      if (isAdmin) {
        req.flash("success", "Danh mục đã được xóa!");
        return res.redirect("/admin/category");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/category");
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = categoryController;
