const express = require("express");
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");
const router = express.Router();
router.use("/users", userRoutes);
router.use("/questions", questionRoutes);

module.exports = router;
