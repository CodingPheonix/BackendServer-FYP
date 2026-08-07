import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

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
