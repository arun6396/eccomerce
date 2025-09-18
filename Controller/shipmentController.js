const Shipments = require("../model/shipment");

exports.createShipment = async (req, res) => {
  try {
    const {mobileNumber} = req.body;
    if(!/^\d{10}$/.test(mobileNumber)){
return res.status(400).json({message:" MobileNumber must be 10 digits"})
    }
    const shipment = await Shipments.create({...req.body,mobileNumber});
    res.status(200).json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Shipment does not create",error:err.message
     });
  }
};   
exports.getAllShipment = async (req, res) => {
  try {
    const shipment = await Shipments.find();
    if (!shipment)
      return res.status(404).json({ message: "Shipment address not found" });
    res.status(200).json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Error " + err.meassage });
  }
};

exports.getByShipmentId = async (req, res) => {
  try {
    const shipment = await Shipments.findById(req.params.id);
    if (!shipment)
      return res.status(404).json({ message: "Shipment address not found" });
    res.status(200).json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Error " + err.meassage });
  }
};

exports.updateShipmentAddress = async (req, res) => {
  try {
    const shipment = await Shipments.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!shipment)
      return res.status(404).json({ message: "Shipment address not found" });
    res.status(200).json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Error " + err.meassage });
  }
};

exports.deleteShipmentAddress = async (req, res) => {
  try {
    const shipment = await Shipments.findByIdAndDelete(req.params.id);
    if (!shipment)
      return res.status(404).json({ message: "Shipment address not found" });
    res
      .status(200)
      .json({ meassage: " ShipmentAddress deleted successfully " });
  } catch (err) {
    res.staus(500).json({ message: "Error " + err.meassage });
  }
};
