import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fertilizerRoutes from "./router/fertilizerRoutes.js";
import ingestionRouter from "./router/ingestionRouter.js";
import retrievalRouter from "./router/retrievalRouter.js";
import sessionRouter from "./router/sessionRouter.js";
import { connectDatabase, connectRAGDatabase } from "./utils/database.js";
import { LiveAPIController } from "./GeminiAdapter/LiveAPIController.js";

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("hello world");
})

app.use("/api/fertilizers", fertilizerRoutes);
app.use("/api/ingest", ingestionRouter);
app.use("/api/retrieve", retrievalRouter);
app.use("/api/sessions", sessionRouter);

connectDatabase();
connectRAGDatabase();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL as string
    }
});

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    const liveApiController = new LiveAPIController(socket);
    liveApiController.connect();
});

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
