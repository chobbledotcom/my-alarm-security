import { join } from "node:path";
import { prep } from "./prepare-dev.js";
import { bun, fs, path } from "./utils.js";

const dev = path(".build", "dev");
const output = path("_site");

console.log("Cleaning _site...");
fs.rm(output);

prep();

console.log("Building site...");

const result = bun.run("build", dev);

if (result.exitCode !== 0) {
  console.error(`\n${"=".repeat(60)}`);
  console.error("BUILD FAILED");
  console.error("=".repeat(60));
  console.error("\nFix the error above and rebuild.\n");
  process.exit(result.exitCode);
}

fs.mv(join(dev, "_site"), output);

console.log("Built to _site/");
