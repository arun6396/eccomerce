const replacement = require("../model/replacement");
const order = require("../model/order");
const products = require("../model/product");


exports.createReplacement = async (req, res) => {
  try {
    const { previousOrderId, replaceOrderId, newProductId } = req.body;

    const preOrder = await order.findById(previousOrderId);
    const replaceOrder = await order.findById(replaceOrderId);
    if (!preOrder)
      return res.status(404).json({ message: "Previous order not found" });
    if (!replaceOrder)
      return res.status(404).json({ message: "Replacement order not found" });

    const newProduct = await products.findById(newProductId);
    if (!newProduct)
      return res.status(404).json({ message: "New product not found" });

    const oldProductId = replaceOrder.productId;

    await products.findByIdAndUpdate(oldProductId, { $inc: { stock: 1 } });
    await products.findByIdAndUpdate(newProductId, { $inc: { stock: -1 } });

    replaceOrder.productId = newProductId;
    await replaceOrder.save();

    const newReplacement = await replacement.create({
      previousOrderId,
      replaceOrderId,
      newProductId,
    });

    res.status(200).json({
      message: "Replacement successfully processed",
      newReplacement,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllReplacement = async (req, res) => {
  try {
    const replacements = await replacement.find();
    if (!replacements.length) {
      return res.status(404).json({ message: "Replacement is not found" });
    }
    res.status(200).json(replacements);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.getReplacementById = async (req, res) => {
  try {
    const replacements = await replacement.findById(req.params.id);
    if (!replacements) {
      return res.status(404).json({ message: "Replacement is not found" });
    }
    res.status(200).json(replacements);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.updateReplacementById = async (req, res) => {
  try {
    const replacements = await replacement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!replacements) {
      return res.status(404).json({ message: "Replacement not found" });
    }
    res.status(200).json(replacements);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.deleteReplacementById = async (req, res) => {
  try {
    const replacements = await replacement.findByIdAndDelete(req.params.id);
    if (!replacements) {
      return res.status(404).json({ message: "Replacement not found" });
    }
    res.status(200).json({ message: "Replacement delete successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};
