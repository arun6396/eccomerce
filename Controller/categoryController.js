const category = require("../model/category");

exports.createCategory = async (req, res) => {
  try {
    const newCategory = await category.create(req.body);
    res.status(200).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const getCategory = await category.find().populate("createdBy");
    if (!getCategory.length) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(getCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const getCategory = await category
      .findById(req.params.id)
      .populate("createdBy");
    if (!getCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(getCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.updateCategoryId = async (req, res) => {
  try {
    const updateCategoty = await category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updateCategoty) {
      return res.status(404).josn({ message: "Category not found" });
    }
    res.status(200).json(updateCategoty);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCategoryById = async (req, res) => {
  try {
    const deleteCategory = await category.findByIdAndDelete(req.params.id);
    if (!deleteCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(deleteCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};
