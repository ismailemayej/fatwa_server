const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { client } = require("../config/database");
const db = client.db("fatwa");
const usersCollection = db.collection("users");
async function registerUser(req, res) {
  const { name, email, phone, role, password } = req.body;
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
      role,
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
      { email: user.email, name: user.name, role: user.role },
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
async function getUserEmail(req, res) {
  const useremail = req.query.email;
  try {
    // Use findOne instead of find to get a single user
    const result = await usersCollection.findOne({ email: useremail });
    if (!result) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}
// profile update
async function updateUserProfile(req, res) {
  const email = req.params.email;
  const supply = req.body;
  const filter = { email };
  const updateDoc = {
    $set: {
      email: supply.email,
      phone: supply.phone,
      name: supply.name,
    },
  };
  try {
    const options = { upsert: true };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}
// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await usersCollection.find().toArray();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
module.exports = {
  registerUser,
  loginUser,
  getUserEmail,
  getAllUsers,
  updateUserProfile,
};
