import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const projectDirName = path.basename(rootDir);
const parentDir = path.dirname(rootDir);

const sourceDir = path.join(rootDir, "build");
const destinationArg = process.argv[3];
const resolvedDestinationFromArg = destinationArg
  ? path.resolve(process.cwd(), destinationArg)
  : null;
const destinationDir =
  resolvedDestinationFromArg ||
  process.env.BUILD_EXPORT_DIR ||
  path.join(parentDir, `${projectDirName}-build`);
const envPath = path.join(rootDir, ".env");
const sourceEnvArg = process.argv[2];
const sourceEnvMap = {
  uat: ".env.uat",
  local: ".env.dev.local",
};
const sourceEnvFile = sourceEnvMap[sourceEnvArg] ?? "unknown";

function parseEnv(content) {
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

try {
  const sourceStats = await stat(sourceDir);
  if (!sourceStats.isDirectory()) {
    console.error("Build source is not a directory: build");
    process.exit(1);
  }
} catch {
  console.error("Build source directory does not exist: build");
  process.exit(1);
}

await mkdir(destinationDir, { recursive: true });

const existingEntries = await readdir(destinationDir);
for (const entry of existingEntries) {
  if (entry === ".git") continue;
  await rm(path.join(destinationDir, entry), { recursive: true, force: true });
}

await cp(sourceDir, destinationDir, { recursive: true, force: true });

let envValues = {};
try {
  const envContent = await readFile(envPath, "utf8");
  envValues = parseEnv(envContent);
} catch {
  console.error("Could not read active .env for snapshot");
  process.exit(1);
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  sourceEnvFile,
  values: envValues,
};

await writeFile(
  path.join(destinationDir, "build-env.json"),
  `${JSON.stringify(snapshot, null, 2)}\n`,
  "utf8",
);

console.log(`Exported build artifacts to ${destinationDir}`);
console.log("Generated build-env.json snapshot");
