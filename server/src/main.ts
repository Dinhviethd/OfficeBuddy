import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import path from 'path'
import jwt from 'jsonwebtoken'
import router from './routes/index'
import { initDatabase } from '@/configs/database.config'
import errorHandler from "@/middlewares/errorHandlermiddleware";


dotenv.config()
const app = express()
const server = createServer(app)

// Static files serving (if needed for deployment)
// const clientBuildPath = path.resolve('/app/public');
// app.use(express.static(clientBuildPath));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// TODO: Database initialization disabled for now
// To enable: Install SQLite3 (npm install sqlite3) or configure PostgreSQL connection
// See database.config.ts for configuration
// initDatabase().catch(err => {
//     console.error("Failed to connect to database!");
//     console.error(err);
//     process.exit(1);
// });

app.use("/api", router)

app.get("/", (req, res) => {
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


server.listen(PORT, () => {
    console.log(`Server run at http://localhost:${PORT}`)
})