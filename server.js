require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
const routes = require("./routes");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", routes);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Fatwa server is Running",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});

// Start the server and connect to the database
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
