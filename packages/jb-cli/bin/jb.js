#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cmd = process.argv[2];

if (!cmd) {
  console.log("Usage: jb <command>");
  process.exit(1);
}

async function run() {
  if (cmd === "doctor") {
    const mod = await import(path.join(__dirname, "commands/doctor.js"));
    if (mod.default) await mod.default();
    process.exit(0);
  } else {
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
  }
}

run();
