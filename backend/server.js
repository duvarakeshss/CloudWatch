require("dotenv").config();
const express = require("express");
const cors = require("cors"); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://192.168.1.84:5173",
          "http://localhost:5173",
          "http://localhost:3000", 
          "http://192.168.1.84:5173", 
          "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

// Routes
const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

// Default route
app.get("/", (req, res) => {
  res.send(`🚀 Server running at: http://192.168.1.46:${PORT}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://192.168.1.46:${PORT}`);
});
