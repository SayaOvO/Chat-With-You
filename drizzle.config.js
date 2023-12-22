import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local"});

/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./lib/schema.ts",
    out: "./migrations",
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL,
    }
};