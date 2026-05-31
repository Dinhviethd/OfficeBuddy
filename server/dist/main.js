"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST, before any other imports
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = __importDefault(require("./routes/index"));
const database_config_1 = require("./configs/database.config");
const errorHandlermiddleware_1 = __importDefault(require("./middlewares/errorHandlermiddleware"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Static files serving (if needed for deployment)
// const clientBuildPath = path.resolve('/app/public');
// app.use(express.static(clientBuildPath));
app.use(express_1.default.json({ limit: "5mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api", index_1.default);
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "eOffice API Server is running",
        timestamp: new Date()
    });
});
app.use(errorHandlermiddleware_1.default.notFound);
app.use(errorHandlermiddleware_1.default.errorHandler);
//for deploy client build
// app.get(/(.*)/, (req, res) => {
//     res.sendFile(path.join(clientBuildPath, 'index.html'));
// });
const PORT = process.env.PORT || 8000;
const bootstrap = async () => {
    await (0, database_config_1.initDatabase)();
    server.listen(PORT, () => {
        console.log(`Server run at http://localhost:${PORT}`);
    });
};
bootstrap().catch(err => {
    console.error("Failed to start server!");
    console.error(err);
    process.exit(1);
});
