import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fertilizerRoutes from "./router/fertilizerRoutes.js";
import ingestionRouter from "./router/ingestionRouter.js";
import { connectDatabase, connectRAGDatabase } from "./utils/database.js";

const app = express();

app.use(express.json());
app.use("/api/fertilizers", fertilizerRoutes);
app.use("/api/ingest", ingestionRouter);

connectDatabase();
connectRAGDatabase();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL
    }
});

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);
});

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
