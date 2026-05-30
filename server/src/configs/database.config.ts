import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in environment");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
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
