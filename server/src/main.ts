import dotenv from 'dotenv'

// Load environment variables FIRST, before any other imports
dotenv.config()

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import path from 'path'
import router from './routes/index'
import { initDatabase } from '@/configs/database.config'
import errorHandler from "@/middlewares/errorHandlermiddleware";
import aiRouter from "@/modules/ai/ai.route";

const app = express()
const server = createServer(app)

// Phục vụ thư mục tĩnh public chứa Web Portal
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use("/api", router)
app.use("/api/ai", aiRouter);

app.get("/api-status", (req, res) => {
    res.json({ 
        success: true, 
        message: "eOffice API Server is running",
        timestamp: new Date()
    })
})

app.use(errorHandler.notFound)
app.use(errorHandler.errorHandler)

//for deploy client build
// app.get(/(.*)/, (req, res) => {
//     res.sendFile(path.join(clientBuildPath, 'index.html'));
// });

const PORT = process.env.PORT || 8000

const bootstrap = async () => {
    await initDatabase();

    server.listen(PORT, () => {
        console.log(`Server run at http://localhost:${PORT}`)
    })
}

bootstrap().catch(err => {
    console.error("Failed to start server!");
    console.error(err);
    process.exit(1);
});
