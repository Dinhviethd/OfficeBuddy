import dotenv from 'dotenv'

// Load environment variables FIRST, before any other imports
dotenv.config()

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import router from './routes/index'
import { initDatabase } from '@/configs/database.config'
import errorHandler from "@/middlewares/errorHandlermiddleware";

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
