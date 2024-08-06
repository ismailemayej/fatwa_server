const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { client } = require("../config/database");

const db = client.db("fatwa");
const usersCollection = db.collection("users");
async function registerUser(req, res) {
  const { name, email, phone, password } = req.body;
  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await usersCollection.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.EXPIRES_IN,
      }
    );
    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { registerUser, loginUser };
