"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Use SQLite for local development
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: path_1.default.resolve(__dirname, "../../data/database.sqlite"),
    synchronize: true,
    logging: false,
    entities: [
        __dirname + "/../modules/**/*.entity.{ts,js}",
        __dirname + "/../modules/**/*.model.{ts,js}",
    ],
    migrations: [__dirname + "/../migrations/*.{ts,js}"],
});
const initDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log("✅ Connected to Supabase (Postgres)");
        const migrations = await exports.AppDataSource.runMigrations();
        if (migrations.length > 0) {
            console.log(`✅ Executed ${migrations.length} migration(s)`);
        }
    }
    catch (error) {
        console.error("❌ Failed to connect to Supabase");
        console.error(error);
        process.exit(1);
    }
};
exports.initDatabase = initDatabase;
