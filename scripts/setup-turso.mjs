import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
  process.exit(1);
}

const client = createClient({ url, authToken });

const raw = readFileSync(
  join(__dirname, "../prisma/migrations/20260509180700_init/migration.sql"),
  "utf8"
);

// Strip comment lines, split by semicolons
const statements = raw
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Running ${statements.length} SQL statements on Turso...\n`);

for (const statement of statements) {
  try {
    await client.execute(statement + ";");
    const preview = statement.slice(0, 70).replace(/\s+/g, " ");
    console.log("✓", preview);
  } catch (err) {
    if (err.message?.includes("already exists")) {
      console.log("⚠ Already exists (skipping):", statement.slice(0, 50).replace(/\s+/g, " "));
    } else {
      console.error("✗ Failed:", err.message);
    }
  }
}

console.log("\n✅ Turso database is ready!");
client.close();
