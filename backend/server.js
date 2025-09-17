require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
const userRoutes = require("./routes/users");
app.use("/users", userRoutes);
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

// Default route
app.get("/", (req, res) => {
  res.send(`🚀 Server running at: http://192.168.0.89:${PORT}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://192.168.0.89:${PORT}`);
});
