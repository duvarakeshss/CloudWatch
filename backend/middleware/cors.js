import cors from "cors";

const corsOptions = {
  origin: [
    "http://192.168.1.84:5173",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://192.168.1.84:5173",
    "http://172.16.121.211:5173",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

export default cors(corsOptions);