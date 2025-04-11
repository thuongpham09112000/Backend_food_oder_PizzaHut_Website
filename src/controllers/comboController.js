const comboService = require("../services/comboService.js");
const categoryService = require("../services/categoryService.js");
const authService = require("../services/authService.js");

const comboController = {
  async addCombo(req, res) {
    console.log("req", req.body);
    console.log("req", req.file);

    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await comboService.addCombo(req.body, req.file);
      if (isAdmin) {
        req.flash("success", "Thêm combo mới thành công!");
        return res.redirect("/admin/add-combo");
      }
      return res.status(201).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/add-combo");
      }
      return res.status(400).json({ message: error.message });
    }
  },
  async getAllCombos(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const result = await comboService.getAllCombos();
      let comboData = null;
      if (!result || !result.combos) {
        if (isAdmin) {
          const authData = await authService.getUserInformation(req.user.id);
          const user = authData.user;
          return res.render("combos", { title: "Combos", comboData, user });
        }
        return res.status(404).json({ message: "Không tìm thấy combo nào!" });
      }

      comboData = result.combos;

      if (isAdmin) {
        const authData = await authService.getUserInformation(req.user.id);
        const user = authData.user;
        return res.render("combos", { title: "Combos", comboData, user });
      }
      return res
        .status(200)
        .json({ combos: comboData, message: result.message });
    } catch (error) {
      console.error("Error fetching combos:", error);
      return res.status(500).json({ error: error });
    }
  },
  async getComboById(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const result = await comboService.getComboById(req.params.id);
      const combo = result.combo;
      const categories = await categoryService.getAllCategories();
      const authData = await authService.getUserInformation(req.user.id);
      const user = authData.user;
      if (isAdmin) {
        return res.render("update-combo", {
          title: "Combo",
          combo,
          categories,
          user,
        });
      }
      return res.status(200).json(combo);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  async updateCombo(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await comboService.updateCombo(
        req.params.id,
        req.body,
        req.file
      );
      if (isAdmin) {
        req.flash("success", "Combo đã được cập nhật!");
        return res.redirect(`/admin/update-combo/${req.params.id}`);
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect(`/admin/update-combo/${req.params.id}`);
      }
      return res.status(400).json({ message: error.message });
    }
  },
  async deleteCombo(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const response = await comboService.deleteCombo(req.params.id);
      if (isAdmin) {
        req.flash("success", "Combo đã được xóa!");
        return res.redirect("/admin/combo");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/combo");
      }
      return res.status(500).json({ message: error.message });
    }
  },
  async deleteMultipleCombos(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      const comboIds = req.body.combo_ids;
      if (!comboIds || comboIds.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một combo để xóa!");
      }
      const response = await comboService.deleteMultipleCombos(comboIds);
      if (isAdmin) {
        req.flash("success", "Combos đã được xóa!");
        return res.redirect("/admin/combo");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/combo");
      }
      return res.status(500).json({ error: error });
    }
  },

  async updateStatusCombo(req, res) {
    const isAdmin = req.originalUrl.startsWith("/admin");
    try {
      await comboService.updateStatus(req.body);
      if (isAdmin) {
        req.flash("success", "Trạng thái đã được cập nhật!");
        return res.redirect("/admin/combo");
      }
      return res.status(200).json(response);
    } catch (error) {
      if (isAdmin) {
        req.flash("error", error.message);
        return res.redirect("/admin/combo");
      }
      return res.status(500).json({ error: error });
    }
  },
};

module.exports = comboController;
