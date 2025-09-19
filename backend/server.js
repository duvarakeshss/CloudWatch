import "dotenv/config";
import express from "express";
import corsMiddleware from "./middleware/cors.js";
import { swaggerUi, specs } from './config/swagger.js';
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 3000;

// API Logging Middleware
const apiLogger = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to log after response is sent
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} ${res.statusMessage || 'OK'} - ${duration}ms`);

    // Call original end method
    originalEnd.apply(this, args);
  };

  next();
};

app.use(corsMiddleware);
app.use(apiLogger);

app.use(express.json());

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error logging middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR ${req.method} ${req.originalUrl} - ${err.status || 500} ${err.message || 'Internal Server Error'}`);
  next(err);
});

// Routes
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);// Default route
app.get("/", (req, res) => {
  const host = req.hostname || req.ip || 'localhost';
  const message = `🚀 Server running at: http://${host}:${PORT}`;
  console.log(`[${new Date().toISOString()}] GET / - 200 OK - Server status check`);
  res.send(message);
});

// Start server
app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 SERVER STARTED - Server running at: http://localhost:${PORT}`);
  console.log(`[${timestamp}] 📚 API Documentation available at: http://localhost:${PORT}/docs`);
});
