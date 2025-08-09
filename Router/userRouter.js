const express = require("express");
const userController = require("../Controller/userController");
const verifyToken = require("../middleware/authMiddleware");
const { use } = require("./userRouter");

const router = express.Router();

router.post("/register", userController.registerUser);
router.get("/get", verifyToken, userController.getAllUser);
router.get("/get/:id", verifyToken, userController.getUserById);
router.put("/update/:id", verifyToken, userController.updateUserById);
router.delete("/delete/:id", verifyToken, userController.deleteUserById);
router.post("/login", userController.loginUserByUsername);
router.post("/login/email", userController.loginUserByEmail);
router.post("/login/mobilenumber", userController.loginUserByMobileNumber);

module.exports = router;
