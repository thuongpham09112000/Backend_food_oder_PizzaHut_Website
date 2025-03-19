const Category = require("../models/categoryModel.js");
const path = require("path");
const fs = require("fs");

const addCategory = async (categoryData, image_name) => {
  try {
    if (!categoryData.name || !categoryData.description || !image_name) {
      throw new Error("Các thông tin danh mục không được để trống!");
    }

    categoryData.name = categoryData.name.trim();
    categoryData.description = categoryData.description.trim();
    categoryData.imageUrl = image_name ? `/uploads/${image_name}` : null;

    const category_name = productData.category_name;
    const checkForDuplicateCategories = await Category.findOneByName(
      category_name
    );

    if (checkForDuplicateCategories !== null) {
      throw new Error("danh mục này đã tồn tại!");
    } else {
      const newCategory = await Category.create(categoryData);
      console.log("Danh mục đã thêm:", newCategory);
      return { message: "Thêm danh mục thành công!", newCategory };
    }
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể thêm danh mục mới vì ${error.message}`);
  }
};

const getAllCategories = async () => {
  try {
    const categoriesALL = await Category.findAll();
    if (!categoriesALL || categoriesALL.length === 0) {
      console.warn("Không có danh mục nào trong cơ sở dữ liệu!");
      return [];
    }

    console.log("Danh sách danh mục:", categoriesALL);
    return { message: "Lấy tất cả danh mục thành công!", categoriesALL };
  } catch (error) {
    console.error(error.message);
    throw new Error("Lỗi khi lấy danh mục từ cơ sở dữ liệu!");
  }
};

const getCategoryById = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Không tìm thấy danh mục!");
    }
    console.log("Lấy danh mục có id:", categoryId);
    return { message: "Lấy danh mục bằng id thành công!", category };
  } catch (error) {
    console.error("Lỗi khi lấy danh mục bằng id:", error.message);
    throw new Error("Lỗi khi lấy danh mục");
  }
};

const updateCategory = async (categoryId, categoryData, image_name) => {
  try {
    if (!categoryData.name || !categoryData.description) {
      throw new Error("Tên danh mục và mô tả không được để trống!");
    }

    categoryData.name = categoryData.name.trim();
    categoryData.description = categoryData.description.trim();

    if (image_name) {
      categoryData.imageUrl = `/uploads/${image_name}`;
    }
    if (image_name === 0) {
      delete categoryData.imageUrl;
    }
    const result = await Category.updateById(categoryId, categoryData);

    if (result.affectedRows > 0) {
      return { success: true, message: "Cập nhật danh mục thành công!" };
    } else {
      return {
        success: false,
        message: "Không tìm thấy danh mục",
      };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Không thể cập nhật danh mục " + error.message);
  }
};

const deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      console.warn("Không tìm thấy danh mục!");
      throw new Error("Không tìm thấy danh mục!");
    }

    let imagePath = category.image_category_url;
    const { baseUrl } = require("../server");

    if (
      imagePath &&
      typeof imagePath === "string" &&
      imagePath.startsWith(baseUrl)
    ) {
      imagePath = imagePath.replace(baseUrl, "");
    }

    if (imagePath.startsWith("/uploads/")) {
      imagePath = path.join(__dirname, "../public", imagePath);
    } else {
      throw new Error("Định dạng đường dẫn ảnh không hợp lệ!");
    }

    const response = await Category.deleteOneById(categoryId);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("Ảnh danh mục đã bị xóa:", imagePath);
    } else {
      console.warn("Ảnh không tồn tại hoặc đã bị xóa trước đó:", imagePath);
    }

    console.log("Đã xóa danh mục có id:", categoryId);
    return { success: response, message: "Xóa danh mục thành công!" };
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error.message);
    throw new Error("Không thể xóa danh mục!");
  }
};

const deleteMultipleCategories = async (categoryIds) => {
  try {
    if (typeof categoryIds === "string") {
      categoryIds = categoryIds.split(",").map((id) => parseInt(id.trim(), 10));
    }

    if (!Array.isArray(categoryIds) || categoryIds.some(isNaN)) {
      throw new Error("Danh sách ID không hợp lệ!");
    }

    const categories = await Category.findByIds(categoryIds);
    if (!categories || categories.length === 0) {
      console.warn("Không tìm thấy danh mục!");
      throw new Error("Không tìm thấy danh mục!");
    }

    categories.forEach((category) => {
      let imagePath = category.image_category_url;
      const { baseUrl } = require("../server");
      if (
        imagePath &&
        typeof imagePath === "string" &&
        imagePath.startsWith(baseUrl)
      ) {
        imagePath = imagePath.replace(baseUrl, "");
      }

      if (imagePath.startsWith("/uploads/")) {
        imagePath = path.join(__dirname, "../public", imagePath);
      } else {
        console.warn(`Bỏ qua ảnh có đường dẫn không hợp lệ: ${imagePath}`);
        return;
      }

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Ảnh danh mục đã bị xóa:", imagePath);
      } else {
        console.warn("Ảnh không tồn tại hoặc đã bị xóa trước đó:", imagePath);
      }
    });

    const result = await Category.deleteMultipleById(categoryIds);
    if (!result) {
      throw new Error("Lỗi khi xóa danh mục trong CSDL!");
    }

    console.log("Đã xóa danh mục có ID:", categoryIds);
    return { success: true, message: "Xóa danh mục thành công!" };
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error.message);
    throw new Error("Không thể xóa danh mục!");
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  deleteMultipleCategories,
};
