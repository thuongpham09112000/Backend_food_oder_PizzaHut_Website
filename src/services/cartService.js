const Cart = require("../models/cartModel.js");
const Product = require("../models/productModel.js");
const Combo = require("../models/comboModel.js");
const Price = require("../models/priceModel.js");
const Size = require("../models/sizeModel.js");
const PizzaBases = require("../models/pizzaBasesModel.js");
const PizzaCrust = require("../models/pizzaCrustModel.js");

const addProductToCart = async (user_id, productList) => {
  for (const productData of productList) {
    const { product_id, size_id, quantity, crust_id, base_id } = productData;

    if (!product_id || !quantity || !size_id) {
      throw new Error("Thiếu thông tin sản phẩm!");
    }
    if (!size_id) throw new Error("Thiếu thông tin kích thước!");
    const cartItem = await Cart.findProductCart(
      user_id,
      product_id,
      size_id,
      crust_id,
      base_id
    );

    if (cartItem === false) {
      await Cart.create({
        user_id,
        product_id,
        size_id,
        quantity,
        crust_id: crust_id || null,
        base_id: base_id || null,
      });
    } else {
      cartItem.quantity += quantity;
      await Cart.updateById(cartItem.cart_id, {
        quantity: cartItem.quantity,
      });
    }
  }
};

const addComboToCart = async (user_id, comboList) => {
  for (const comboData of comboList) {
    const { combo_id, quantity, comboSelections } = comboData;

    if (
      !combo_id ||
      !quantity ||
      !Array.isArray(comboSelections) ||
      comboSelections.length === 0
    ) {
      throw new Error("Thiếu thông tin combo hoặc sản phẩm trong combo!");
    }

    const cartItem = await Cart.findByUserIdAndComboId(user_id, combo_id);

    if (cartItem) {
      cartItem.quantity += quantity;
      await Cart.updateById(cartItem.cart_id, {
        quantity: cartItem.quantity,
      });

      const oldSelections = await Cart.getComboSelectionsByCartId(
        cartItem.cart_id
      );

      const toUpdate = [];
      const toAdd = [];

      for (const selection of comboSelections) {
        if (!selection.product_id) continue;

        const old = oldSelections.find(
          (s) => s.product_id === selection.product_id
        );
        if (old) {
          toUpdate.push({ ...old, quantity: selection.quantity });
        } else {
          toAdd.push({
            cart_id: cartItem.cart_id,
            combo_id,
            product_id: selection.product_id,
            quantity: selection.quantity,
          });
        }
      }

      for (const selection of toUpdate) {
        await Cart.updateComboSelection(
          selection.cart_id,
          combo_id,
          selection.product_id,
          selection.quantity
        );
      }

      if (toAdd.length > 0) {
        await Cart.addComboSelection(toAdd);
      }
    } else {
      const newCartItemId = await Cart.create({
        user_id,
        combo_id,
        quantity,
      });

      const selections = comboSelections
        .filter((s) => s.product_id)
        .map((s) => ({
          cart_id: newCartItemId,
          combo_id,
          product_id: s.product_id,
          quantity: s.quantity,
        }));

      if (selections.length > 0) {
        await Cart.addComboSelection(selections);
      }
    }
  }
};

const addToCart = async (user_id, cartList) => {
  try {
    if (!Array.isArray(cartList) || cartList.length === 0) {
      throw new Error("Danh sách giỏ hàng không hợp lệ!");
    }

    const productList = cartList.filter((item) => item.product_id);
    const comboList = cartList.filter((item) => item.combo_id);

    if (productList.length > 0) {
      await addProductToCart(user_id, productList);
    }

    if (comboList.length > 0) {
      await addComboToCart(user_id, comboList);
    }
    const cartDetails = await getCartByUserId(user_id);
    if (!cartDetails || cartDetails.length === 0) {
      console.warn("Giỏ hàng trống!");
      return {
        messageCart: "Giỏ hàng trống!",
      };
    }

    return { message: "Thêm vào giỏ hàng thành công!", cartDetails };
  } catch (error) {
    console.error("Lỗi:", error.message);
    throw new Error(error.message);
  }
};

const getCartByUserId = async (user_id) => {
  try {
    const cartItems = await Cart.getAllByUserId(user_id);
    if (!cartItems || cartItems.length === 0) {
      console.warn("Giỏ hàng trống!");
      return { message: "Giỏ hàng trống!", cartItems: [] };
    }

    console.log("cartItems", cartItems);

    // Lọc danh sách product_id, size_id, base_id và crust_id hợp lệ
    const productItems = cartItems.filter((item) => item.product_id !== null);
    const productIds = productItems.map((item) => item.product_id);
    const sizeIds = productItems.map((item) => item.size_id);
    const baseIds = productItems.map((item) => item.base_id).filter((id) => id);
    const crustIds = productItems
      .map((item) => item.crust_id)
      .filter((id) => id);

    // Lọc danh sách combo_id hợp lệ
    const comboItems = cartItems.filter((item) => item.combo_id !== null);
    const comboIds = comboItems.map((item) => item.combo_id);
    const cartIdsWithCombo = comboItems.map((item) => item.cart_id); // Lấy cart_id có combo

    // Truy vấn thông tin sản phẩm, combo, giá sản phẩm, kích thước, base và crust
    const products =
      productIds.length > 0 ? await Product.findByIds(productIds) : [];
    const combos = comboIds.length > 0 ? await Combo.findByIds(comboIds) : [];
    const prices =
      productIds.length > 0
        ? await Price.findPricesByProductIdAndSizeId(productIds, sizeIds)
        : [];
    const sizes =
      sizeIds.length > 0 ? await Size.findMultipleById(sizeIds) : [];
    const bases =
      baseIds.length > 0 ? await PizzaBases.findMultipleById(baseIds) : [];
    const crusts =
      crustIds.length > 0 ? await PizzaCrust.findMultipleById(crustIds) : [];

    // Lấy dữ liệu combo selections nếu có combo_id
    let comboSelections = [];
    if (cartIdsWithCombo.length > 0) {
      comboSelections = await Cart.getComboSelectionsByCartIdS(
        cartIdsWithCombo
      );
      console.log("Combo Selections:", comboSelections);

      // Lọc danh sách product_id từ comboSelections
      const comboProductIds = comboSelections.map((cs) => cs.product_id);

      // Truy vấn thông tin sản phẩm cho comboSelections
      const comboProducts = await Product.findByIds(comboProductIds);

      // Gán thông tin sản phẩm vào comboSelections
      comboSelections = comboSelections.map((cs) => ({
        ...cs,
        product:
          comboProducts.find((p) => p.product_id === cs.product_id) || null,
      }));
    }

    // Xử lý thông tin giỏ hàng
    const cartDetails = cartItems.map((item) => {
      const product = item.product_id
        ? products.find((p) => p.product_id === item.product_id) || null
        : null;
      const combo = item.combo_id
        ? combos.find((c) => c.combo_id === item.combo_id) || null
        : null;
      const priceInfo = item.product_id
        ? prices.find(
            (p) =>
              p.product_id === item.product_id && p.size_id === item.size_id
          ) || null
        : null;
      const sizeInfo = item.size_id
        ? sizes.find((s) => s.size_id === item.size_id) || null
        : null;
      const baseInfo = item.base_id
        ? bases.find((b) => b.base_id === item.base_id) || null
        : null;
      const crustInfo = item.crust_id
        ? crusts.find((c) => c.crust_id === item.crust_id) || null
        : null;

      // Lấy thông tin combo selections cho cart item có combo_id
      const comboSelection = item.combo_id
        ? comboSelections
            .filter((cs) => cs.cart_id === item.cart_id)
            .map((cs) => ({
              ...cs,
              product: cs.product || null, // Đảm bảo product đã được gán
            }))
        : [];

      // Lấy giá của sản phẩm hoặc combo
      const productPrice = priceInfo ? priceInfo.price : 0;
      const comboPrice = combo ? combo.price : 0;

      // Lấy giá của crust dựa trên size
      let price_crust = null;
      if (crustInfo && sizeInfo) {
        if (sizeInfo.size_name === "Vừa") {
          price_crust = crustInfo.medium_price;
        } else if (sizeInfo.size_name === "Lớn") {
          price_crust = crustInfo.large_price;
        }
      }

      // Tính tổng giá của cartItem (bao gồm cả crust nếu có)
      const totalPrice = item.product_id
        ? Math.round(
            (productPrice + (price_crust ? parseFloat(price_crust) : 0)) *
              item.quantity
          )
        : comboPrice * item.quantity;

      return {
        ...item,
        totalPrice, // Gán tổng giá cho cartItem
        details: {
          product: product
            ? {
                ...product,
                size_name: sizeInfo ? sizeInfo.size_name : null,
                base_name: baseInfo ? baseInfo.base_name : null,
                crust_name: crustInfo ? crustInfo.crust_name : null,
                price: productPrice,
                price_crust: price_crust, // Thêm giá của crust vào product details
              }
            : null,
          combo: combo
            ? {
                ...combo,
                price: comboPrice,
                selections: comboSelection, // Đã chứa đầy đủ thông tin product
              }
            : null,
        },
      };
    });

    // Tính tổng tiền của giỏ hàng
    const grandTotal = cartDetails.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    return {
      cartItems: cartDetails,
      grandTotal,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error("Lỗi khi lấy giỏ hàng!");
  }
};

const updateCartItem = async (user_id, updateCart) => {
  try {
    if (!user_id) throw new Error("Chưa xác định được người dùng!");
    if (!updateCart || updateCart.length === 0)
      throw new Error("Thiếu dữ liệu cập nhật giỏ hàng!");

    const deleteIds = [];
    const updateData = [];

    for (const item of updateCart) {
      const { cart_id, quantity } = item;

      if (!cart_id)
        throw new Error("Thiếu ID sản phẩm trong giỏ hàng cần cập nhật!");
      if (quantity === undefined || quantity < 0)
        throw new Error("Số lượng sản phẩm không hợp lệ!");

      if (quantity === 0) {
        deleteIds.push(cart_id);
      } else {
        updateData.push({ cart_id, quantity });
      }
    }

    // Xóa các sản phẩm có quantity = 0
    if (deleteIds.length > 0) {
      await Cart.deleteByIds(deleteIds);
    }

    // Cập nhật các sản phẩm có quantity > 0
    if (updateData.length > 0) {
      await Cart.updateByIds(updateData);
    }

    const cartDetails = await getCartByUserId(user_id);
    if (!cartDetails || cartDetails.length === 0) {
      console.warn("Giỏ hàng trống!");
      return {
        messageCart: "Giỏ hàng trống!",
      };
    }

    return { message: "Cập nhật giỏ hàng thành công!", cartDetails };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể cập nhật giỏ hàng: ${error.message}`);
  }
};

const removeCartItem = async (user_id, cartIds) => {
  try {
    if (!Array.isArray(cartIds) || cartIds.length === 0) {
      throw new Error("Danh sách sản phẩm không hợp lệ!");
    }

    const response = await Cart.deleteByIds(cartIds);
    const cartDetails = await getCartByUserId(user_id);
    if (!cartDetails || cartDetails.length === 0) {
      console.warn("Giỏ hàng trống!");
      return {
        messageCart: "Giỏ hàng trống!",
      };
    }
    return {
      sucsess: response,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công!",
      cartDetails,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể xóa sản phẩm khỏi giỏ hàng: ${error.message}`);
  }
};

const clearCart = async (userId) => {
  try {
    await Cart.deleteByUserId(userId);
    return { message: "Dọn giỏ hàng thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error("Không thể dọn giỏ hàng!");
  }
};

module.exports = {
  addToCart,
  getCartByUserId,
  updateCartItem,
  removeCartItem,
  clearCart,
};
