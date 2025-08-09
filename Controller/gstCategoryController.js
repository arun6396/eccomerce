const gstCategory = require('../model/gstCategory');


exports.createGst=async(req,res)=>{
try{
const gst = await gstCategory.create(req.body);
res.status(200).json(gst);
}
catch(error){
    res.status(500).json({message:"Server error ", error})
}
}

exports.getAllGst=async(req,res)=>{
    try{
        const gst = await gstCategory.find();
        if(!gst){ return res.status(404).json({message:"GST category not found"});}
        res.status(200).json(gst);
    }
    catch(error){
        res.status(500).json({message:"Server error ", error})
    }
}

exports.getGStById=async(req,res)=>{
    try{
        const gst = await gstCategory.findById(req.params.id);
        if(!gst){
            res.status(404).json({message:"GST category not found"});
        }
        res.status(200).json(gst);
    }
    catch(error){
        res.status(500).json({message:"Server error",error})
    }
}


exports.updateGst=async(req,res)=>{
    try{
        const gst =await gstCategory.findByIdAndUpdate(req.params.id,req.body,{new:true});
        if(!gst){
            return res.status(404).json({message:"GST Category not found"});
        }
        res.status(200).json(gst)
    }
    catch(error){
        res.status(500).json({message:"Server error ",error})
    }
}

exports.deleteGst = async(req,res)=>{
    try{
        const gst = await gstCategory.findByIdAndDelete(req.params.id);
        if(!gst){
            return res.status(404).json({message:"Gst Category not found"});
        }
        res.status(200).json({message:"GST Category deleted successfully"});
    }
    catch(error){
        res.status(500).json({message:"Server error " , error});
    }
}