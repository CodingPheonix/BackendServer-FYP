import "dotenv/config";
import cors from 'cors';
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fertilizerRoutes from "./router/fertilizerRoutes.js";
import ingestionRouter from "./router/ingestionRouter.js";
import retrievalRouter from "./router/retrievalRouter.js";
import sessionRouter from "./router/sessionRouter.js";
import chatRouter from "./router/chatRouter.js";
import { connectDatabase, connectRAGDatabase } from "./utils/database.js";
import { LiveAPIController } from "./GeminiAdapter/LiveAPIController.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "").split(',').map(url => url.trim());

app.use(cors({
    origin: allowedOrigins
}))
app.use(express.json());

// Gracefully handle malformed JSON requests
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     if (err instanceof SyntaxError && 'body' in err) {
//         res.status(400).json({ error: 'Malformed JSON payload received.' });
//         return;
//     }
//     next(err);
// });

app.get('/', (req, res) => {
    res.send("hello world");
})

app.use("/api/fertilizers", fertilizerRoutes);
app.use("/api/ingest", ingestionRouter);
app.use("/api/retrieve", retrievalRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/chats", chatRouter);

connectDatabase();
connectRAGDatabase();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins
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
