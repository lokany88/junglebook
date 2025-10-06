
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");

const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const log = (...a)=>process.stdout.write(a.join(" ")+"\n");
const err = (...a)=>process.stderr.write(a.join(" ")+"\n");

function usage(code=0){
  log(`jb v${pkg.version}
Usage:
  jb --help
  jb --version
  jb doctor
  jb audit
  jb create-app "<Name>" [--template=nextjs-worker|django-compliance] [--slug=my-app]

Description:
  doctor      Print environment + repo checks.
  audit       Minimal self-audit: required files and workflows present.
  create-app  Scaffolds a new app directory and adds it to workspaces.`);
  process.exit(code);
}

function slugify(s){
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/(^-|-$)/g,"")
    .slice(0,64) || "app";
}

function readJSON(p){ return JSON.parse(fs.readFileSync(p,"utf8")); }
function writeJSON(p,obj){
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function ensureWorkspace(pkgJsonPath, newWorkspacePath){
  const root = readJSON(pkgJsonPath);
  if(Array.isArray(root.workspaces)){
    if(!root.workspaces.includes(newWorkspacePath)){
      root.workspaces = Array.from(new Set([...root.workspaces, newWorkspacePath]));
    }
  } else if (root.workspaces && Array.isArray(root.workspaces.packages)){
    if(!root.workspaces.packages.includes(newWorkspacePath)){
      root.workspaces.packages = Array.from(new Set([...root.workspaces.packages, newWorkspacePath]));
    }
  } else {
    // initialize
    root.workspaces = [newWorkspacePath];
  }
  writeJSON(pkgJsonPath, root);
}

function ensureTurbo(turboPath){
  const minimal = {
    "$schema": "https://turbo.build/schema.json",
    "pipeline": {
      "build": { "cache": true, "dependsOn": ["^build"] },
      "lint":  { "cache": true },
      "audit": { "cache": false }
    }
  };
  if(!fs.existsSync(turboPath)){
    writeJSON(turboPath, minimal);
    return;
  }
  const existing = readJSON(turboPath);
  // shallow merge: keep existing keys, add missing pipeline targets
  existing.pipeline = existing.pipeline || {};
  for(const [k,v] of Object.entries(minimal.pipeline)){
    existing.pipeline[k] = existing.pipeline[k] || v;
  }
  if(!existing["$schema"]) existing["$schema"] = minimal["$schema"];
  writeJSON(turboPath, existing);
}

function doctor(){
  const checks = [];
  try { checks.push({name:"node -v", ok:true, value:process.version}); } catch(e){ checks.push({name:"node -v", ok:false, value:String(e)}); }
  try { checks.push({name:"npm -v", ok:true, value:require('child_process').execSync('npm -v').toString().trim()}); } catch(e){ checks.push({name:"npm -v", ok:false, value:String(e)}); }
  try {
    const pkgRoot = readJSON(path.join(repoRoot,"package.json"));
    checks.push({name:"root package.json", ok:true, value: pkgRoot.name || "(no name)"});
  } catch(e){ checks.push({name:"root package.json", ok:false, value:String(e)}); }
  try {
    const wf = path.join(repoRoot,".github/workflows/integrity-build-gate.yml");
    checks.push({name:"integrity-build-gate workflow", ok:fs.existsSync(wf), value: wf});
  } catch(e){ checks.push({name:"integrity workflow check", ok:false, value:String(e)}); }
  return checks;
}

function writeTemplateManifests(){
  const base = path.join(repoRoot,"packages","templates");
  fs.mkdirSync(base,{recursive:true});
  const t1 = {
    name: "nextjs-worker",
    stack: "Next.js + Cloudflare Workers + D1/Turso",
    deploy: "cloudflare",
    status: "experimental",
    files: []
  };
  const t2 = {
    name: "django-compliance",
    stack: "Django + Postgres",
    deploy: "aws",
    status: "experimental",
    files: []
  };
  fs.writeFileSync(path.join(base,"nextjs-worker.json"), JSON.stringify(t1,null,2)+"\n");
  fs.writeFileSync(path.join(base,"django-compliance.json"), JSON.stringify(t2,null,2)+"\n");
}

function createApp(argv){
  let name = null;
  let template = "nextjs-worker";
  let customSlug = null;
  for(let i=0;i<argv.length;i++){
    const a = argv[i];
    if(a.startsWith("--template=")) template = a.split("=")[1];
    else if(a.startsWith("--slug=")) customSlug = a.split("=")[1];
    else if(!name) name = a;
  }
  if(!name) { err("Missing app name."); usage(1); }
  if(!["nextjs-worker","django-compliance"].includes(template)){
    err(`Unknown template: ${template}`); process.exit(2);
  }

  writeTemplateManifests();

  const slug = customSlug ? slugify(customSlug) : slugify(name);
  const appDir = path.join(repoRoot,"apps",slug);
  fs.mkdirSync(appDir,{recursive:true});

  // Minimal package for visibility in workspaces and CI
  const appPkg = {
    "name": slug,
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "build": "node -e \"console.log('build ok: "+slug+"')\"",
      "lint": "echo 'lint ok: "+slug+"'"
    },
    "jbTemplate": template
  };
  fs.writeFileSync(path.join(appDir,"package.json"), JSON.stringify(appPkg,null,2)+"\n");
  fs.writeFileSync(path.join(appDir,"README.md"), `# ${name}\n\nScaffolded by jb using template: \`${template}\`.\n`);

  // Add to workspaces
  ensureWorkspace(path.join(repoRoot,"package.json"), `apps/${slug}`);

  log(`✅ Created app at apps/${slug} using template ${template}`);
}

function runAudit(){
  const report = {
    timestamp: new Date().toISOString(),
    required: {
      integrityWorkflow: fs.existsSync(path.join(repoRoot,".github/workflows/integrity-build-gate.yml")),
      turboJson: fs.existsSync(path.join(repoRoot,"turbo.json"))
    },
    apps: []
  };
  const appsDir = path.join(repoRoot,"apps");
  if(fs.existsSync(appsDir)){
    for(const d of fs.readdirSync(appsDir)){
      const p = path.join(appsDir,d,"package.json");
      if(fs.existsSync(p)){
        const ap = readJSON(p);
        report.apps.push({name: ap.name, hasBuild: !!(ap.scripts && ap.scripts.build)});
      }
    }
  }
  const out = path.join(repoRoot,"audit-report.json");
  fs.writeFileSync(out, JSON.stringify(report,null,2)+"\n");
  log(`✅ Wrote ${out}`);
}

function main(){
  const args = process.argv.slice(2);
  if(args.includes("--help")) usage(0);
  if(args.includes("--version")) { log(pkg.version); process.exit(0); }
  const cmd = args[0] || "";
  if(cmd === "doctor"){ const r=doctor(); for(const c of r){ log((c.ok?"[ok]":"[!!]"), c.name, "-", c.value); } process.exit(0); }
  if(cmd === "audit"){ ensureTurbo(path.join(repoRoot,"turbo.json")); runAudit(); process.exit(0); }
  if(cmd === "create-app"){ ensureTurbo(path.join(repoRoot,"turbo.json")); createApp(args.slice(1)); process.exit(0); }
  usage(1);
}

main();
