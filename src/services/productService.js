const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const Tag = require("../models/tagModel.js");
const Price = require("../models/priceModel.js");
const Size = require("../models/sizeModel.js");
const PizzaBases = require("../models/pizzaBasesModel.js");
const path = require("path");
const fs = require("fs");

const addProduct = async (productData, product_image) => {
  // console.log(productData, product_image);

  try {
    if (
      !productData.product_name ||
      !productData.category_name ||
      !productData.product_description ||
      !productData.spicy ||
      !productData.product_size ||
      !product_image
    ) {
      throw new Error("Thông tin về sản phẩm không được để trống!");
    }
    console.log("productData", productData);

    // Xử lý dữ liệu đầu vào
    productData.product_name = productData.product_name
      ? productData.product_name.trim()
      : "";
    productData.description = productData.product_description
      ? productData.product_description.trim()
      : "";
    productData.image_url = product_image
      ? `/uploads/${product_image.filename}`
      : null;
    productData.status = "Active"; // Mặc định
    productData.average_rating = 5;
    productData.review_count = 0;
    productData.tag_name = [
      productData.spicy && productData.spicy.includes("1")
        ? "Cay"
        : "Không cay",
      productData.types_pizza,
      productData.level_pizza,
      productData.tags,
    ]
      .flat()
      .filter(Boolean);

    productData.size_name = Array.isArray(productData.product_size)
      ? productData.product_size
      : [productData.product_size];
    productData.price = {
      basic: productData.price_basicSize
        ? parseInt(productData.price_basicSize)
        : null,
      small: productData.price_smallSize
        ? parseInt(productData.price_smallSize)
        : null,
      medium: productData.price_mediumSize
        ? parseInt(productData.price_mediumSize)
        : null,
      large: productData.price_largeSize
        ? parseInt(productData.price_largeSize)
        : null,
    };

    // Lấy danh sách size từ cơ sở dữ liệu
    const sizes = await Size.findAll();
    const sizeMapping = {};
    sizes.forEach((size) => {
      sizeMapping[size.size_name.toLowerCase()] = size.size_id;
    });

    const category_name = productData.category_name;
    const checkForDuplicateCategories = await Category.findOneByName(
      category_name
    );
    if (checkForDuplicateCategories === null) {
      throw new Error(`sản phẩm ${category_name} không được tìm thấy!`);
    } else {
      productData.category_id = checkForDuplicateCategories.category_id;
    }

    // Xử lý thêm sản phẩm mới
    const product_name = productData.product_name;
    const checkForDuplicateProduct = await Product.findOneByName(product_name);
    if (checkForDuplicateProduct) {
      throw new Error("sản phẩm này đã tồn tại!");
    }
    const newProductId = await Product.create(productData);

    // Xử lý thêm giá của sản phẩm mới
    const sizeKeyMap = {
      "mặc định": "basic",
      nhỏ: "small",
      vừa: "medium",
      lớn: "large",
    };
    const priceList = productData.size_name
      .map((size) => {
        const size_id = sizeMapping[size.toLowerCase()];
        const sizeKey = sizeKeyMap[size.toLowerCase()];
        const priceValue = sizeKey ? productData.price[sizeKey] : null;
        return size_id && priceValue !== null
          ? { product_id: newProductId, size_id, price: priceValue }
          : null;
      })
      .filter(Boolean);

    if (priceList.length > 0) {
      await Price.createMultiple(priceList);
      console.log(`Đã thêm giá cho sản phẩm ID ${newProductId}`);
    }

    // Xử lý thêm tag mới
    console.log("tag_name", productData.tag_name);
    const existingTags = await Tag.findMultipleByName(productData.tag_name);
    const existingTagNames = existingTags.map((tag) => tag.tag_name);
    const newTags = productData.tag_name.filter(
      (tag) => !existingTagNames.includes(tag)
    );
    const newTagIds =
      newTags.length > 0 ? await Tag.createMultiple(newTags) : [];
    const tagIds = [...existingTags.map((tag) => tag.tag_id), ...newTagIds];
    await Tag.createMultipleProductTags(newProductId, tagIds);

    // Xử lý thêm pizza_bases vào ProductPizzaBases
    if (productData.pizza_bases && productData.pizza_bases.length > 0) {
      const pizzaBases = await PizzaBases.findMultipleByName(
        productData.pizza_bases
      );
      const baseIds = pizzaBases.map((base) => base.base_id);

      if (baseIds.length > 0) {
        await PizzaBases.createMultipleProductBases(newProductId, baseIds);
        console.log(`Đã thêm đế bánh cho sản phẩm ID ${newProductId}`);
      }
    }

    return { message: "Thêm sản phẩm thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể thêm sản phẩm mới vì ${error.message}`);
  }
};

const getAllProducts = async () => {
  try {
    const productsALL = await Product.getAll();
    if (!productsALL || productsALL.length === 0) {
      console.warn("Không có sản phẩm nào trong cơ sở dữ liệu!");
      return [];
    }

    const categories = await Category.findAll();
    if (!categories || categories.length === 0) {
      console.warn("Không có danh mục nào trong cơ sở dữ liệu!");
    }

    const categoryMap = new Map();
    categories.forEach((category) => {
      categoryMap.set(category.category_id, category.category_name);
    });

    const productsWithCategory = productsALL.map((product) => ({
      ...product,
      category_name: categoryMap.get(product.category_id) || "Không xác định",
    }));

    console.log("Danh sách sản phẩm:", productsWithCategory);
    return {
      message: "Lấy tất cả sản phẩm thành công!",
      products: productsWithCategory,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error("Lỗi khi lấy sản phẩm từ cơ sở dữ liệu!");
  }
};

const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Không tìm thấy sản phẩm!");
    }
    // Lấy tên ảnh từ image_url
    if (product.image_url) {
      product.image_name = product.image_url.split("/").pop();
    } else {
      product.image_name = null; // Trường hợp không có ảnh
    }

    // Lọc danh sách base_name
    const pizzaBasesProduct = await PizzaBases.findBaseIdByProductId(productId);
    const baseIds = pizzaBasesProduct.map((base) => base.base_id);
    const pizzaBases = await PizzaBases.findMultipleById(baseIds);
    const baseNames = pizzaBases.map((base) => base.base_name);
    product.base_name = baseNames;

    // Lọc danh sách tag_name
    const productTags = await Tag.findTagIdByProductId(productId);
    const tagIds = productTags.map((tag) => tag.tag_id);
    const tags = await Tag.findMultipleById(tagIds);

    const levelPizzaTags = ["Truyền thống", "Cao cấp", "Siêu cao cấp"];
    const typesPizzaTags = ["Pizza thịt", "Pizza hải sản", "Pizza chay"];
    const spicyTags = ["Cay", "Không cay"];

    const levelPizzaTag = tags.find((tag) =>
      levelPizzaTags.includes(tag.tag_name)
    );
    const typesPizzaTag = tags
      .filter((tag) => typesPizzaTags.includes(tag.tag_name))
      .map((tag) => tag.tag_name);
    const spicyTag = tags.find((tag) => spicyTags.includes(tag.tag_name));

    if (levelPizzaTag) {
      product.level_pizza = levelPizzaTag.tag_name;
    }

    if (typesPizzaTag.length > 0) {
      product.types_pizza = typesPizzaTag;
    }

    if (spicyTag) {
      product.spicy = spicyTag.tag_name;
    }

    product._tag = tags
      .filter(
        (tag) =>
          !levelPizzaTags.includes(tag.tag_name) &&
          !typesPizzaTags.includes(tag.tag_name) &&
          !spicyTags.includes(tag.tag_name)
      )
      .map((tag) => tag.tag_name);

    // Lọc danh sách price và size_name
    const productPrices = await Price.findByProductId(productId);
    const sizeIds = productPrices.map((price) => price.size_id);
    const productSizes = await Size.findMultipleById(sizeIds);
    const sizePriceList = productPrices.map((price) => {
      const size = productSizes.find((s) => s.size_id === price.size_id);
      return {
        size_id: price.size_id,
        price_id: price.price_id,
        size_name: size ? size.size_name : null,
        price: price.price,
      };
    });
    product.sizes = sizePriceList;

    console.log("Lấy sản phẩm có id:", productId);
    return { message: "Lấy sản phẩm bằng id thành công!", product };
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm bằng id:", error.message);
    throw new Error("Lỗi khi lấy sản phẩm");
  }
};

const updateProduct = async (productId, productData, product_image) => {
  try {
    if (
      !productData.product_name ||
      !productData.category_name ||
      !productData.product_description ||
      !productData.spicy ||
      !productData.product_size
    ) {
      throw new Error("Thông tin sản phẩm không được để trống!");
    }
    console.log("Cập nhật sản phẩm với ID:", productId);

    console.log("product_image", product_image);

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      throw new Error("Không tìm thấy sản phẩm để cập nhật!");
    }
    console.log("existingProduct", existingProduct);

    productData.product_name = productData.product_name.trim();
    productData.description = productData.product_description.trim();
    productData.image_url = product_image
      ? `/uploads/${product_image.filename}`
      : existingProduct.image_url;

    productData.tag_name = [
      productData.spicy.includes("1") ? "Cay" : "Không cay",
      productData.types_pizza,
      productData.level_pizza,
      productData.tags,
    ]
      .flat()
      .filter(Boolean);

    productData.size_name = Array.isArray(productData.product_size)
      ? productData.product_size
      : [productData.product_size];

    productData.price = {
      basic: productData.price_basicSize
        ? parseInt(productData.price_basicSize)
        : null,
      small: productData.price_smallSize
        ? parseInt(productData.price_smallSize)
        : null,
      medium: productData.price_mediumSize
        ? parseInt(productData.price_mediumSize)
        : null,
      large: productData.price_largeSize
        ? parseInt(productData.price_largeSize)
        : null,
    };

    const category = await Category.findOneByName(productData.category_name);
    if (!category) {
      throw new Error(`Danh mục ${productData.category_name} không tồn tại!`);
    }
    productData.category_id = category.category_id;

    // Cập nhật thông tin sản phẩm chính
    const result = await Product.updateById(productId, productData);
    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy sản phẩm để cập nhật!");
    }

    console.log("Dữ liệu cập nhật", productData);

    // Cập nhật price theo size
    const sizes = await Size.findMultipleByName(productData.size_name);
    const update_size_ids = sizes.map((size) => size.size_id);
    const prices = await Price.findByProductId(productId);

    // Xác định các price_id cần xoá
    const priceIdsToRemove = prices
      .filter((price) => !update_size_ids.includes(price.size_id))
      .map((price) => price.price_id);

    if (priceIdsToRemove.length > 0) {
      await Price.deleteMultipleById(priceIdsToRemove);
    }

    // Xác định các size_id cần thêm
    const sizesToAdd = update_size_ids.filter(
      (size_id) => !prices.some((price) => price.size_id === size_id)
    );

    // Bỏ priceMap, chỉ sử dụng sizeMap
    const sizeMap = {
      1: "basic",
      2: "small",
      3: "medium",
      4: "large",
    };

    // Xử lý thêm mới giá cho size_id chưa có
    if (sizesToAdd.length > 0) {
      const priceList = sizesToAdd.map((size_id) => ({
        product_id: productId,
        size_id: size_id,
        price: productData.price[sizeMap[size_id]] || 0,
      }));
      await Price.createMultiple(priceList);
    }

    // Xác định các giá trị có size_id trùng để cập nhật
    const matchingPrices = prices.filter((price) =>
      update_size_ids.includes(price.size_id)
    );

    if (matchingPrices.length > 0) {
      const updatePrices = matchingPrices.map((price) => ({
        price_id: price.price_id,
        price: productData.price[sizeMap[price.size_id]] || 0,
      }));
      await Price.updateMultiplePriceById(updatePrices);
    }

    // Cập nhật tags sản phẩm
    const tagAll = await Tag.findAll();
    const existingTagIds = tagAll
      .filter((tag) => productData.tag_name.includes(tag.tag_name))
      .map((tag) => tag.tag_id);

    console.log("existingTagIds", existingTagIds);
    const newTagNames = productData.tag_name.filter(
      (tag) => !tagAll.some((t) => t.tag_name === tag)
    );
    console.log("newTags", newTagNames);
    const newTagIds = newTagNames.length
      ? await Tag.createMultiple(newTagNames)
      : [];
    const updateTagIds = [...existingTagIds, ...newTagIds];

    console.log("updateTagIds", updateTagIds);

    if (updateTagIds && updateTagIds.length > 0) {
      await Tag.updateMultipleProductTags(productId, updateTagIds);
      console.log("cập nhật tag cho sản phẩm thành công!");
    }

    // Cập nhật pizza bases
    if (productData.pizza_bases && productData.pizza_bases.length > 0) {
      const pizzaBases = await PizzaBases.findMultipleByName(
        productData.pizza_bases
      );
      const updateBaseIds = pizzaBases.map((base) => base.base_id);
      const productBases = await PizzaBases.findBaseIdByProductId(productId);
      const newBaseIds = updateBaseIds.filter(
        (baseId) => !productBases.some((pb) => pb.base_id === baseId)
      );
      console.log("newBaseIds (cần thêm mới):", newBaseIds);
      if (newBaseIds && newBaseIds.length > 0) {
        await PizzaBases.createMultipleProductBases(productId, newBaseIds);
      }
      const removedBaseIds = productBases
        .map((pb) => pb.base_id)
        .filter((baseId) => !updateBaseIds.includes(baseId));
      console.log("removedBaseIds (cần xóa):", removedBaseIds);
      if (removedBaseIds && removedBaseIds.length > 0) {
        await PizzaBases.deleteMultipleProductBases(productId, removedBaseIds);
      }
      console.log("Cập nhật đế bánh cho sản phẩm thành công!");
    }

    return { success: true, message: "Cập nhật sản phẩm thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể cập nhật sản phẩm: ${error.message}`);
  }
};

const deleteProduct = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.warn("Không tìm thấy sản phẩm!");
      throw new Error("Không tìm thấy sản phẩm!");
    }

    let imagePath = product.image_url;
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
        console.log("Ảnh sản phẩm đã bị xóa:", imagePath);
      } else {
        console.warn("Ảnh không tồn tại hoặc đã bị xóa trước đó:", imagePath);
      }
    }

    const response = await Product.deleteOneById(productId);
    console.log("Đã xóa sản phẩm có id:", productId);
    return { success: response, message: "Xóa sản phẩm thành công!" };
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error.message);
    throw new Error("Không thể xóa sản phẩm!");
  }
};

const deleteMultipleProducts = async (productIds) => {
  try {
    if (typeof productIds === "string") {
      productIds = productIds.split(",").map((id) => parseInt(id.trim(), 10));
    }

    if (!Array.isArray(productIds) || productIds.some(isNaN)) {
      throw new Error("Danh sách ID không hợp lệ!");
    }

    const products = await Product.findByIds(productIds);
    if (!products || products.length === 0) {
      console.warn("Không tìm thấy sản phẩm!");
      throw new Error("Không tìm thấy sản phẩm!");
    }

    const { baseUrl } = require("../server");
    products.forEach((product) => {
      let imagePath = product.image_url;
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
          console.log("Ảnh sản phẩm đã bị xóa:", imagePath);
        } else {
          console.warn("Ảnh không tồn tại hoặc đã bị xóa trước đó:", imagePath);
        }
      }
    });

    const result = await Product.deleteMultipleById(productIds);

    if (!result) {
      throw new Error("Không tìm thấy sản phẩm phù hợp!");
    }

    console.log("Đã xóa sản phẩm có Id:", productIds);

    return { success: result, message: "Xóa sản phẩm thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error("Không thể xóa sản phẩm!");
  }
};

const updateStatus = async (statusData) => {
  try {
    console.log("statusData", statusData);
    const validStatuses = ["Active", "Inactive"];
    if (!statusData.status || !validStatuses.includes(statusData.status)) {
      throw new Error("Trạng thái không hợp lệ!");
    }
    const result = await Product.updateStatus(statusData);
    return {
      success: result,
      message: "Cập nhật trạng thái sản phẩm thành công!",
    };
  } catch (error) {}
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteMultipleProducts,
  updateStatus,
};
