const users = require("../model/users");
const products = require("../model/product");
const { options } = require("../Router/productRouter");
const gstCategory = require("../model/gstCategory");
const discount = require("../model/discount");

exports.createProduct = async (req, res) => {
  try {
    const {
      ProductName,
      price,
      quantity,
      category,
      brand,
      description,
      stock,
      isAvailable,
    } = req.body;
    const newProduct = new products({
      ProductName,
      price,
      quantity,
      category,
      brand,
      description,
      stock,
      isAvailable,
      gstCategoryId:req.body.gstCategoryId,
      discountId:req.body.discountId,
      createdBy: req.body.createdBy,
    });
    await newProduct.save();
    res.status(200).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error ", err });
  }
};

exports.getAllProductId = async (req, res) => {
  try {
    const product = await products.find().populate("gstCategoryId").populate("discountId").populate("createdBy");
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
    const product = await products.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error ", err });
  }
};
exports.updateProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateProduct = await products.findByIdAndUpdate(
      productId,
      { ...req.body, updatedBy: req.user._id },
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

exports.findByProductCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const product = await products.find({ category: category });
    if (!product) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.productSearch = async (req, res) => {
  try {
    const { name, category, brand } = req.query;

    let filter = {};

    if (name) {
      filter.ProductName = { $regex: name, $options: "i" };
    }
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    const productsFound = await products
      .find(filter)
      .populate("gstCategoryId")
      .populate("discountId")
      .populate("createdBy");

    if (!productsFound.length) {
      return res.status(404).json({ message: "No Product match your criteria" });
    }

    res.status(200).json(productsFound);
  } catch (error) {
    console.error("Product search error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.findByProductBrand= async(req,res)=>{
  try{
    const{brand} = req.query
    if(!brand){
      res.status(404).json({message:"Brand query is required"})
    }
    const productFound = await products.find({
      brand:{$regex:brand,options:"i"}
    }).populate("gstCategoryId")
    .populate("discountId").populate("createdBy")
    if(!productFound){
      return res.status(400).json({message : "Product not Found"});
    }
    res.status(200).json({productFound})
  }
catch(error){
  res.status(500).json({message:"Server Error ",error})
}

}

exports.findByProductName =async(req,res)=>{
  try{
  const{ProductName}=req.query
if(!ProductName){
  return res.status(400).json({message:"Product name query parameter required"})
}
const ProductFound = await products.find({
  ProductName:{$regex:ProductName,$options:"i"}
});
if(!ProductFound){
  return res.status(404).json({message:"Product not found"})
}
res.status(200).json(ProductFound)
}
catch(error){
  res.status(500).json({message:"Server error " ,error})
}
}