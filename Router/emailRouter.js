const express = require("express");
const emailController = require("../Controller/emailController");
const router = express.Router();

router.post("/send", emailController.sendUserEmail);
module.exports = router;
