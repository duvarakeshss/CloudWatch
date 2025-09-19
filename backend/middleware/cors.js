import cors from "cors";

// Get allowed origins from environment variable or use defaults
const getAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ORIGIN;
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }

  // Default origins for development and Docker
  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://192.168.0.112:5173",  // WiFi IP
    "http://192.168.1.84:5173",   // Another local IP
    "http://172.16.121.211:5173", // Docker network IP
    "http://172.18.0.1:5173",     // Docker gateway
    "http://172.20.144.1:5173",   // WSL IP
    "http://frontend:5173",       // Docker service name
    "http://backend:5000"         // Backend service
  ];
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

export default cors(corsOptions);