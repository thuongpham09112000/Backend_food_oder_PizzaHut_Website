const cartService = require("../services/cartService.js");

const cartController = {
  async addItemToCart(req, res) {
    console.log("data", req.body);

    try {
      const response = await cartService.addToCart(req.params.id, req.body);
      return res.status(201).json(response);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getCartItems(req, res) {
    try {
      const response = await cartService.getCartByUserId(req.params.id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async updateCartItem(req, res) {
    try {
      const response = await cartService.updateCartItem(
        req.params.id,
        req.body
      );
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async removeCartItem(req, res) {
    try {
      console.log("removeCartItem", req.body);
      const response = await cartService.removeCartItem(
        req.params.id,
        req.body
      );
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async clearCart(req, res) {
    try {
      const response = await cartService.clearCart(req.user.id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = cartController;
