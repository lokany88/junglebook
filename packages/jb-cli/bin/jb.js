#!/usr/bin/env node

if (cmd === "doctor") {
  import("./commands/doctor.js").then(m => m.default?.() ?? null);
  process.exit(0);
}
