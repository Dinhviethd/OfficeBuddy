import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

// Use SQLite for local development
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: path.resolve(__dirname, "../../data/database.sqlite"),
  synchronize: true,
  logging: false,
  entities: [
    __dirname + "/../modules/**/*.entity.{ts,js}",
    __dirname + "/../modules/**/*.model.{ts,js}",
  ],
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
});


export const initDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Connected to Supabase (Postgres)");

    const migrations = await AppDataSource.runMigrations();
    if (migrations.length > 0) {
      console.log(`✅ Executed ${migrations.length} migration(s)`);
    }
  } catch (error) {
    console.error("❌ Failed to connect to Supabase");
    console.error(error);
    process.exit(1);
  }
};
