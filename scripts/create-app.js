import fs from "fs";
import path from "path";

function generateNextConfig(appPath) {
  const pkgPath = path.join(appPath, "package.json");
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const isESM = pkg.type === "module";
  const configName = isESM ? "next.config.mjs" : "next.config.cjs";
  const template = path.join(
    process.cwd(),
    "templates/next",
    isESM ? "next.config.mjs" : "next.config.cjs"
  );

  const dest = path.join(appPath, configName);
  fs.copyFileSync(template, dest);

  console.log(`✅ Created ${configName} for ${isESM ? "ESM" : "CJS"} project.`);
}

function main() {
  const appName = process.argv[2];
  if (!appName) {
    console.error("❌ Usage: npm run create-app <app-name>");
    process.exit(1);
  }

  const appPath = path.resolve("apps", appName);
  fs.mkdirSync(appPath, { recursive: true });

  // Example: copy from a base Next.js template
  fs.mkdirSync(path.join(appPath, "src"), { recursive: true });

  // Generate config automatically
  generateNextConfig(appPath);
}

main();
