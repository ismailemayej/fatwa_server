const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("fatwa");
    const collection = db.collection("users");
    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, phone, password } = req.body;
      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Insert user into the database
      await collection.insertOne({
        name,
        email,
        phone,
        password: hashedPassword,
      });
      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;
      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });
      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });
    // Increment the like count for a question
    app.post("/api/v1/ans/:qn/like", async (req, res) => {
      const qn = parseInt(req.params.qn);

      try {
        const result = await AllData.updateOne(
          { qn: qn },
          { $inc: { likes: 1 } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Question not found" });
        }
        res.send({ status: true, message: "Question liked successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    //========================All Data =============================
    const AllData = db.collection("alldata");
    // create Question data
    app.post("/api/v1/ans", async (req, res) => {
      const Supply = req.body;
      const result = await AllData.insertOne(Supply);
      res.send(result);
    });
    // Get all  Question and answer data for user
    app.get("/api/v1/ans", async (req, res) => {
      try {
        let query = {};

        // Check if `approve` query parameter is present
        if (req.query.approve) {
          // Ensure that the `approve` parameter is correctly parsed as a boolean
          query.approve = req.query.approve === "true";
        }
        if (req.query.pending) {
          // Ensure that the `approve` parameter is correctly parsed as a boolean
          query.pending = req.query.pending === "true";
        }
        // Check if `priority` query parameter is present
        if (req.query.priority) {
          query.priority = req.query.priority;
        }
        // Check if `useremail` query parameter is present
        if (req.query.useremail) {
          query.useremail = req.query.useremail;
        }
        const cursor = AllData.find(query);
        const supply = await cursor.toArray();
        res.send({ status: true, data: supply });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ status: false, message: "Internal Server Error" });
      }
    });
    // Get all sorted by most recent Question and answer
    app.get("/api/v1/recent-posts", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const cursor = AllData.find(query).sort({ createdAt: -1 }).limit(5);
      const supply = await cursor.toArray();
      res.send({ status: true, data: supply });
    });
    // get single question data by question number
    app.get("/api/v1/ans/:qn", async (req, res) => {
      const qn = parseInt(req.params.qn);
      try {
        const result = await AllData.findOne({ qn: qn });
        if (!result) {
          return res.status(404).send({ message: "Data not found" });
        }
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });
    // Question data update
    app.put("/api/v1/ans/:qn", async (req, res) => {
      const id = parseInt(req.params.qn);
      const supply = req.body;
      const filter = { qn: id };
      const updateDoc = {
        $set: {
          headline: supply.headline,
          question: supply.question,
          ans: supply.ans,
          proof: supply.proof,
          approve: supply.approve,
          pending: supply.pending,
        },
      };

      const options = { upsert: true };

      try {
        const result = await AllData.updateOne(filter, updateDoc, options);
        res.json(result);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ status: false, message: "Internal Server Error" });
      }
    });
    // Delete Question data
    app.delete("/api/v1/ans/:qn", async (req, res) => {
      const id = parseInt(req.params.qn);
      const result = await AllData.deleteOne({
        qn: id,
      });
      console.log(result);
      res.send(result);
    });
    // add search functionality
    app.get("/api/v1/search", async (req, res) => {
      const { query } = req.query;
      try {
        const results = await AllData.find({
          question: { $regex: query, $options: "i" },
        }).toArray();
        res.send({ status: true, data: results });
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });
    // Top 50 trending Q&A
    app.get("/api/v1/trending", async (req, res) => {
      try {
        const results = await AllData.find({})
          .sort({ views: -1 })
          .limit(50)
          .toArray();
        res.send({ status: true, data: results });
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });
    // Endpoint to get a single trending post by qn
    app.get("/api/v1/trending/:qn", async (req, res) => {
      const qn = parseInt(req.params.qn);
      try {
        const result = await AllData.findOne({ qn: qn });
        if (!result) {
          return res.status(404).send({ message: "Post not found" });
        }
        res.send({ status: true, data: result });
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });
    // Start the server
    app.listen(port, () => {
      console.log(`Fatwa Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Fatwa server is Running",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
