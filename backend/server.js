import "dotenv/config";
import express from "express";
import corsMiddleware from "./middleware/cors.js";
import { swaggerUi, specs } from './config/swagger.js';
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);

app.use(express.json());

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes

app.use("/users", userRoutes);


app.use("/admin", adminRoutes);// Default route
app.get("/", (req, res) => {
  const host = req.hostname || req.ip || 'localhost';
  res.send(`🚀 Server running at: http://${host}:${PORT}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/docs`);
});
