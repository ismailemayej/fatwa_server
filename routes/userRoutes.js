const express = require("express");
const {
  registerUser,
  loginUser,
  getUserEmail,
  updateUserProfile,
  getAllUsers,
} = require("../controllers/userController");
const router = express.Router();
// router.post("/:email", updateUserProfile);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getUserEmail);
router.get("/all", getAllUsers);
module.exports = router;
