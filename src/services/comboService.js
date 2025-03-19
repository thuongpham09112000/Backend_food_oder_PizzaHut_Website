const Combo = require("../models/comboModel.js");
const Category = require("../models/categoryModel.js");
const Tag = require("../models/tagModel.js");
const Price = require("../models/priceModel.js");
const path = require("path");
const fs = require("fs");

const addCombo = async (comboData, combo_image) => {
  try {
    if (!comboData.combo_name || !comboData.combo_description || !combo_image) {
      throw new Error("Thông tin về combo không được để trống!");
    }
    // Xử lý dữ liệu đầu vào
    comboData.combo_name = comboData.combo_name
      ? comboData.combo_name.trim()
      : "";
    comboData.description = comboData.combo_description
      ? comboData.combo_description.trim()
      : "";
    comboData.image_url = combo_image
      ? `/uploads/${combo_image.filename}`
      : null;

    if (comboData.category_names) {
      let category_names = [];
      if (Array.isArray(comboData.category_names)) {
        category_names = comboData.category_names;
      } else {
        category_names = [comboData.category_names];
      }

      const checkForDuplicateCategories = await Category.findMultipleByName(
        category_names
      );

      if (
        checkForDuplicateCategories === null ||
        checkForDuplicateCategories.length === 0
      ) {
        if (category_names.length === 1) {
          const singleCategory = await Category.findOneByName(
            category_names[0]
          );
          if (!singleCategory) {
            throw new Error(
              `sản phẩm ${category_names[0]} không được tìm thấy!`
            );
          } else {
            comboData.category_ids = [singleCategory.category_id];
          }
        } else {
          throw new Error(`sản phẩm ${category_names} không được tìm thấy!`);
        }
      } else {
        comboData.category_ids = checkForDuplicateCategories.map(
          (category) => category.category_id
        );
      }
    }

    console.log("comboData.category_ids", comboData.category_ids);

    // Xử lý thêm combo mới
    const newCombo = await Combo.create({
      name: comboData.combo_name,
      description: comboData.description,
      imageUrl: comboData.image_url || null,
      price: comboData.price,
    });
    const comboId = newCombo.id;
    console.log("Thêm combo mới thành công");

    //  Xủ lý thêm sản phẩm vào combo
    if (comboData.product_names && comboData.product_names.length > 0) {
      let productList = [];
      const productIds = Object.keys(comboData)
        .filter((key) => key.startsWith("product_size-"))
        .map((key) => key.split("-")[1]);

      productIds.forEach((productId) => {
        const quantityKey = `quantity-${productId}`;
        const sizeKey = `product_size-${productId}`;
        if (comboData[quantityKey] && comboData[sizeKey]) {
          productList.push({
            productId: parseInt(productId, 10),
            quantity: parseInt(comboData[quantityKey], 10),
          });
        }
      });
      console.log("productList", productList);
      //   await Combo.addMultipleProductsToCombo(comboId, productList);
      console.log("Thêm sản phẩm vào combo thành công");
    }

    //  Xủ lý thêm nhóm sản phẩm vào combo
    if (comboData.category_ids && comboData.category_ids.length > 0) {
      let categoriesList = [];
      comboData.category_ids.forEach((categoryId) => {
        const quantityKey = `quantity-category-${categoryId}`;
        if (comboData[quantityKey]) {
          categoriesList.push({
            categoryId: parseInt(categoryId, 10),
            quantity: parseInt(comboData[quantityKey], 10),
          });
        }
      });
      console.log("categoriesList", categoriesList);
      const comboGroups = await Combo.addMultipleProductGroupsToCombo(
        comboId,
        categoriesList
      );
      console.log("Thêm nhóm sản phẩm vào combo thành công:", comboGroups);
    }

    return { message: "Thêm combo thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể thêm combo mới vì ${error.message}`);
  }
};

const getAllCombos = async () => {
  try {
    const combosALL = await Combo.getAll();
    if (!combosALL || combosALL.length === 0) {
      console.warn("Không có combo nào trong cơ sở dữ liệu!");
      return [];
    }

    console.log("Danh sách combo:", combosALL);
    return {
      message: "Lấy tất cả combo thành công!",
      combos: combosALL,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error("Lỗi khi lấy combo từ cơ sở dữ liệu!");
  }
};

const getComboById = async (comboId) => {
  try {
    const combo = await Combo.findById(comboId);

    if (!combo) {
      throw new Error("Không tìm thấy combo!");
    }
    // Lấy tên ảnh từ image_url
    if (combo.image_url) {
      combo.image_name = combo.image_url.split("/").pop();
    } else {
      combo.image_name = null; // Trường hợp không có ảnh
    }

    // Lọc danh sách tag_name
    const comboTags = await Tag.findTagIdByComboId(comboId);
    const tagIds = comboTags.map((tag) => tag.tag_id);
    const tags = await Tag.findMultipleById(tagIds);

    combo._tag = tags.map((tag) => tag.tag_name);

    console.log("Lấy combo có id:", comboId);
    return { message: "Lấy combo bằng id thành công!", combo };
  } catch (error) {
    console.error("Lỗi khi lấy combo bằng id:", error.message);
    throw new Error("Lỗi khi lấy combo");
  }
};

const updateCombo = async (comboId, comboData, combo_image) => {
  try {
    if (
      !comboData.combo_name ||
      !comboData.category_name ||
      !comboData.combo_description
    ) {
      throw new Error("Thông tin combo không được để trống!");
    }
    console.log("Cập nhật combo với ID:", comboId);

    console.log("combo_image", combo_image);

    const existingCombo = await Combo.findById(comboId);
    if (!existingCombo) {
      throw new Error("Không tìm thấy combo để cập nhật!");
    }
    console.log("existingCombo", existingCombo);

    comboData.combo_name = comboData.combo_name.trim();
    comboData.description = comboData.combo_description.trim();
    comboData.image_url = combo_image
      ? `/uploads/${combo_image.filename}`
      : existingCombo.image_url;

    comboData.tag_name = comboData.tags ? comboData.tags.split(",") : [];

    const category = await Category.findOneByName(comboData.category_name);
    if (!category) {
      throw new Error(`Danh mục ${comboData.category_name} không tồn tại!`);
    }
    comboData.category_id = category.category_id;

    // Cập nhật thông tin combo chính
    const result = await Combo.updateById(comboId, comboData);
    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy combo để cập nhật!");
    }

    console.log("Dữ liệu cập nhật", comboData);

    // Cập nhật tags combo
    const tagAll = await Tag.findAll();
    const existingTagIds = tagAll
      .filter((tag) => comboData.tag_name.includes(tag.tag_name))
      .map((tag) => tag.tag_id);

    console.log("existingTagIds", existingTagIds);
    const newTagNames = comboData.tag_name.filter(
      (tag) => !tagAll.some((t) => t.tag_name === tag)
    );
    console.log("newTags", newTagNames);
    const newTagIds = newTagNames.length
      ? await Tag.createMultiple(newTagNames)
      : [];
    const updateTagIds = [...existingTagIds, ...newTagIds];

    console.log("updateTagIds", updateTagIds);

    if (updateTagIds && updateTagIds.length > 0) {
      await Tag.updateMultipleComboTags(comboId, updateTagIds);
      console.log("cập nhật tag cho combo thành công!");
    }

    return { success: true, message: "Cập nhật combo thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể cập nhật combo: ${error.message}`);
  }
};

const deleteCombo = async (comboId) => {
  try {
    const combo = await Combo.findById(comboId);
    if (!combo) {
      console.warn("Không tìm thấy combo!");
      throw new Error("Không tìm thấy combo!");
    }

    let imagePath = combo.image_url;
    console.log("imagePath", imagePath);
    if (imagePath && imagePath !== null) {
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

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Ảnh combo đã bị xóa:", imagePath);
      } else {
        console.warn("Ảnh không tồn tại hoặc đã bị xóa trước đó:", imagePath);
      }
    }

    const response = await Combo.deleteOneById(comboId);
    console.log("Đã xóa combo có id:", comboId);
    return { success: response, message: "Xóa combo thành công!" };
  } catch (error) {
    console.error("Lỗi khi xóa combo:", error.message);
    throw new Error("Không thể xóa combo!");
  }
};

const deleteMultipleCombos = async (comboIds) => {
  try {
    if (typeof comboIds === "string") {
      comboIds = comboIds.split(",").map((id) => parseInt(id.trim(), 10));
    }

    if (!Array.isArray(comboIds) || comboIds.some(isNaN)) {
      throw new Error("Danh sách ID không hợp lệ!");
    }

    const combos = await Combo.findByIds(comboIds);
    if (!combos || combos.length === 0) {
      console.warn("Không tìm thấy combo!");
      throw new Error("Không tìm thấy combo!");
    }

    const { baseUrl } = require("../server");
    combos.forEach((combo) => {
      let imagePath = combo.image_url;
      if (imagePath && imagePath !== null) {
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
          console.log("Ảnh combo đã bị xóa:", imagePath);
        } else {
          console.warn("Ảnh không tồn tại hoặc đã bị xóa trước đó:", imagePath);
        }
      }
    });

    const result = await Combo.deleteMultipleById(comboIds);

    if (!result) {
      throw new Error("Không tìm thấy combo phù hợp!");
    }

    console.log("Đã xóa combo có Id:", comboIds);

    return { success: result, message: "Xóa combo thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error("Không thể xóa combo!");
  }
};

const updateStatus = async (statusData) => {
  try {
    console.log("statusData", statusData);
    const validStatuses = ["Active", "Inactive"];
    if (!statusData.status || !validStatuses.includes(statusData.status)) {
      throw new Error("Trạng thái không hợp lệ!");
    }
    const result = await Combo.updateStatus(statusData);
    return {
      success: result,
      message: "Cập nhật trạng thái combo thành công!",
    };
  } catch (error) {}
};

module.exports = {
  addCombo,
  getAllCombos,
  getComboById,
  updateCombo,
  deleteCombo,
  deleteMultipleCombos,
  updateStatus,
};
