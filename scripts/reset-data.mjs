import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const seedPath = path.join(dataDir, "seed.json");
const databasePath = path.join(dataDir, "db.json");

await mkdir(dataDir, { recursive: true });
await copyFile(seedPath, databasePath);
console.log(`Reset ${path.relative(process.cwd(), databasePath)} from seed.json`);
