import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobRoutes from "./routes/job.routes.js";
import initWebSocket from "./websocket/ws.server.js";
import "./workers/application.worker.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "DevHire API running" });
});

// HTTP server banao — WS iske upar chale ga
const server = createServer(app);

// WebSocket attach karo
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
