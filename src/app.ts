import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDatabase } from "./utils/database.js";
import fertilizerRoutes from "./router/fertilizerRoutes.js";

const app = express();

app.use(express.json());
app.use("/api/fertilizers", fertilizerRoutes);

connectDatabase();

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
