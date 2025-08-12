const users = require("../model/users");
const products = require("../model/product");
const { options } = require("../Router/productRouter");
const gstCategory = require("../model/gstCategory");
const discount = require("../model/discount");
const Category = require("../model/category");

exports.createProduct = async (req, res) => {
  try {
    const stock = Number(req.body.stock) || 0;
    const quantity = Number(req.body.quantity) || 0;

    const updatedStock = stock + quantity;

    const newProduct = await products.create({
      ...req.body,
      stock: updatedStock,
    });

    res.status(200).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

exports.getAllProductId = async (req, res) => {
  try {
    const product = await products
      .find()
      .populate("categoryById")
      .populate("gstCategoryId")
      .populate("discountId")
      .populate("createdBy");
    if (!product.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error " + err });
  }
};
exports.getProductById = async (req, res) => {
  try {
    const product = await products
      .findById(req.params.id)
      .populate("categoryById")
      .populate("gstCategoryId")
      .populate("discountId")
      .populate("createdBy");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error ", err });
  }
};
exports.updateProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const stock = Number(product.stock) || 0;
    const quantity = Number(req.body.quantity) || 0;
    const updateStock = stock + quantity;
    const updateProduct = await products.findByIdAndUpdate(
      productId,
      { ...req.body, stock: updateStock, updatedBy: req.user._id },
      { new: true }
    );
    if (!updateProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updateProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error });
  }
};

exports.deleteProductById = async (req, res) => {
  try {
    const product = await products.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found " });
    res.status(200).json({ message: "Product successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error ", error });
  }
};

exports.findProductByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const foundProducts = await products
      .find({ categoryById: categoryId })
      .populate({
        path: "categoryById",
        select: "name description",
      });

    if (foundProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this category" });
    }

    res.status(200).json(foundProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.productSearch = async (req, res) => {
  try {
    const { name, category, brand } = req.query;

    let filter = {};
    if (name) {
      filter.ProductName = { $regex: name, $options: "i" };
    }
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    let query = products
      .find(filter)
      .populate("gstCategoryId")
      .populate("discountId")
      .populate("createdBy");

    if (category) {
      query = query.populate({
        path: "categoryById",
        match: { name: { $regex: category, $options: "i" } },
      });
    } else {
      query = query.populate("categoryById");
    }

    const productsFound = await query;

    const filteredProducts = category
      ? productsFound.filter((p) => p.categoryById)
      : productsFound;

    if (!filteredProducts.length) {
      return res
        .status(404)
        .json({ message: "No product matches your criteria" });
    }

    res.status(200).json(filteredProducts);
  } catch (error) {
    console.error("Product search error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.findByProductBrand = async (req, res) => {
  try {
    const { brand } = req.query;
    if (!brand) {
      res.status(404).json({ message: "Brand query is required" });
    }
    const productFound = await products
      .find({
        brand: { $regex: brand, options: "i" },
      })
      .populate("categoryById")
      .populate("gstCategoryId")
      .populate("discountId")
      .populate("createdBy");
    if (!productFound) {
      return res.status(400).json({ message: "Product not Found" });
    }
    res.status(200).json({ productFound });
  } catch (error) {
    res.status(500).json({ message: "Server Error ", error });
  }
};

exports.findByProductName = async (req, res) => {
  try {
    const { ProductName } = req.query;
    if (!ProductName) {
      return res
        .status(400)
        .json({ message: "Product name query parameter required" });
    }
    const ProductFound = await products.find({
      ProductName: { $regex: ProductName, $options: "i" },
    });
    if (!ProductFound) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(ProductFound);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error });
  }
};

exports.findProductByCategoryName = async (req, res) => {
  try {
    const { categoryName } = req.query;
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const Product = await products
      .find({ categoryById: category._id })
      .populate("categoryById");
    res.status(200).json(Product);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.updateQuantityById = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;

    const product = await products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const currentStock = Number(product.stock) || 0;
    const productQuantity = Number(quantity) || 0;
    const updatedStock = currentStock + productQuantity;

    const productUpdate = await products.findByIdAndUpdate(
      productId,
      { stock: updatedStock },
      { new: true }
    );

    res.status(200).json({
      message: "Product quantity updated successfully",
      product: productUpdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
