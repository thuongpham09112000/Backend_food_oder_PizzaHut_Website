const Cart = require("../models/cartModel.js");
const Product = require("../models/productModel.js");

const addToCart = async (cartData) => {
  console.log("cartData", cartData);

  try {
    const {
      user_id,
      product_id,
      combo_id,
      size_id,
      quantity,
      crust_id,
      base_id,
      comboSelections,
    } = cartData;

    if (!user_id || (!product_id && !combo_id) || !quantity) {
      throw new Error("Thông tin giỏ hàng không được để trống!");
    }

    if (product_id) {
      const product = await Product.findById(product_id);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm!");
      }
    }

    if (product_id) {
      if (!size_id) {
        throw new Error(
          "Thiếu thông tin kích thước để thêm sản phẩm vào giỏ hàng!"
        );
      }
      if (!quantity) {
        throw new Error(
          "Thiếu thông tin số lượng để thêm sản phẩm vào giỏ hàng!"
        );
      }
      if (!crust_id) {
        throw new Error(
          "Thiếu thông tin đế bánh để thêm sản phẩm vào giỏ hàng!"
        );
      }
      if (!base_id) {
        throw new Error(
          "Thiếu thông tin đế bánh để thêm sản phẩm vào giỏ hàng!"
        );
      }
    }

    if (combo_id) {
      if (!comboSelections) {
        throw new Error("Thiếu thông tin để thêm combo vào giỏ hàng!");
      }
    }

    let cartItem;
    if (product_id) {
      cartItem = await Cart.findByUserIdAndProductId(user_id, product_id);
    } else if (combo_id) {
      cartItem = await Cart.findByUserIdAndComboId(user_id, combo_id);
    }
    console.log("cartItem", cartItem);
    console.log("product_id", product_id);
    console.log("combo_id", combo_id);

    if (cartItem) {
      cartItem.quantity += quantity;
      await Cart.updateById(cartItem.cart_id, { quantity: cartItem.quantity });

      const oldComboSelections = await Cart.getComboSelectionsByCartId(
        cartItem.cart_id
      );
      console.log("oldComboSelections", oldComboSelections);

      if (oldComboSelections) {
        const selectionsToUpdate = [];
        const selectionsToAdd = [];

        for (const selection of comboSelections) {
          const oldSelection = oldComboSelections.find(
            (old) => old.product_id === selection.product_id
          );

          if (oldSelection) {
            // Nếu sản phẩm đã tồn tại trong combo, cập nhật số lượng
            selectionsToUpdate.push({
              ...oldSelection,
              quantity: selection.quantity,
            });
          } else {
            // Nếu sản phẩm chưa có trong combo, thêm mới
            selectionsToAdd.push({
              cart_id: cartItem.cart_id,
              combo_id,
              product_id: selection.product_id,
              quantity: selection.quantity,
            });
          }
        }

        // Cập nhật các sản phẩm đã có trong combo
        for (const selection of selectionsToUpdate) {
          await Cart.updateComboSelection(
            selection.cart_id,
            combo_id,
            selection.product_id,
            selection.quantity
          );
        }

        // Thêm mới các sản phẩm chưa có vào combo
        if (selectionsToAdd.length > 0) {
          await Cart.addComboSelection(selectionsToAdd);
        }
      }
    } else {
      const newCartItem = await Cart.create({
        user_id,
        product_id,
        combo_id,
        size_id: size_id || null,
        quantity,
        crust_id: crust_id || null,
        base_id: base_id || null,
      });
      console.log("newCartItem", newCartItem);
      console.log(
        "comboSelections",
        combo_id,
        comboSelections,
        comboSelections.length
      );

      if (combo_id && comboSelections && comboSelections.length > 0) {
        const selections = comboSelections.map((selection) => ({
          cart_id: newCartItem,
          combo_id,
          product_id: selection.product_id,
          quantity: selection.quantity,
        }));
        await Cart.addComboSelection(selections);
      }
    }

    return { message: "Thêm sản phẩm vào giỏ hàng thành công!" };
  } catch (error) {
    console.error("Lỗi:" + error.message);
    throw new Error(error.message);
  }
};

const getCartByUserId = async (userId) => {
  try {
    const cartItems = await Cart.findByUserId(userId);
    if (!cartItems || cartItems.length === 0) {
      console.warn("Giỏ hàng trống!");
      return [];
    }

    const productIds = cartItems.map((item) => item.product_id);
    const products = await Product.findByIds(productIds);

    const cartDetails = cartItems.map((item) => {
      const product = products.find((p) => p.product_id === item.product_id);
      return {
        ...item,
        product_name: product ? product.product_name : "Không xác định",
        product_price: product ? product.price : 0,
      };
    });

    return { message: "Lấy giỏ hàng thành công!", cart: cartDetails };
  } catch (error) {
    console.error(error.message);
    throw new Error("Lỗi khi lấy giỏ hàng!");
  }
};

const updateCartItem = async (cartId, quantity) => {
  try {
    if (!cartId || !quantity) {
      throw new Error("Thông tin giỏ hàng không được để trống!");
    }

    const cartItem = await Cart.findById(cartId);
    if (!cartItem) {
      throw new Error("Không tìm thấy sản phẩm trong giỏ hàng!");
    }

    await Cart.updateById(cartId, { quantity });

    return { message: "Cập nhật giỏ hàng thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể cập nhật giỏ hàng: ${error.message}`);
  }
};

const removeCartItem = async (cartId) => {
  try {
    const cartItem = await Cart.findById(cartId);
    if (!cartItem) {
      throw new Error("Không tìm thấy sản phẩm trong giỏ hàng!");
    }

    await Cart.deleteById(cartId);

    return { message: "Xóa sản phẩm khỏi giỏ hàng thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Không thể xóa sản phẩm khỏi giỏ hàng: ${error.message}`);
  }
};

const clearCart = async (userId) => {
  try {
    await Cart.deleteByUserId(userId);
    return { message: "Xóa giỏ hàng thành công!" };
  } catch (error) {
    console.error(error.message);
    throw new Error("Không thể xóa giỏ hàng!");
  }
};

module.exports = {
  addToCart,
  getCartByUserId,
  updateCartItem,
  removeCartItem,
  clearCart,
};
