import { copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const envName = process.argv[2];
const validEnvs = new Set(["uat", "uat-build", "local"]);

if (!validEnvs.has(envName)) {
  console.error("Invalid environment. Use: uat, uat-build or local");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const sourceEnvMap = {
  uat: ".env.uat",
  "uat-build": ".env.uat.build",
  local: ".env.dev.local",
};

const sourceEnvFile = sourceEnvMap[envName];
const sourcePath = path.join(rootDir, sourceEnvFile);
const targetPath = path.join(rootDir, ".env");

let sourceContent = "";
try {
  sourceContent = await readFile(sourcePath, "utf8");
} catch {
  console.error(`Missing environment file: ${sourceEnvFile}`);
  process.exit(1);
}

let targetContent = "";
try {
  targetContent = await readFile(targetPath, "utf8");
} catch {
  // Ignore if target doesn't exist
}

if (sourceContent.trim() === targetContent.trim()) {
  console.log(
    `Applied ${sourceEnvFile} to .env (skipped copy, contents are identical)`,
  );
} else {
  try {
    await copyFile(sourcePath, targetPath);
    console.log(`Applied ${sourceEnvFile} to .env`);
  } catch (err) {
    console.warn(
      `Warning: Could not copy environment file due to permission restrictions (EPERM), but proceeding.`,
    );
  }
}
