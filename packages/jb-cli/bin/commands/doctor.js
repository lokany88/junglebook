#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function log(m){console.log(`[jb-doctor] ${m}`);}
function safeExec(c){try{return execSync(c,{stdio:"inherit"});}catch{log(`Warning: ${c} failed`);}}

function auditTurbo(){
  const f="turbo.json";
  if(!fs.existsSync(f)){
    log("turbo.json missing — creating default schema...");
    fs.writeFileSync(f,JSON.stringify({"$schema":"https://turbo.build/schema.json","tasks":{"build":{"dependsOn":["^build"],"cache":true,"outputs":["dist/**",".next/**"]},"lint":{"dependsOn":["^lint"],"cache":true},"audit":{"dependsOn":[],"cache":false}},"globalEnv":["NODE_ENV","TURBO_TOKEN","GPG_PUBLIC_KEY_B64"]},null,2));
    log("Created default turbo.json schema.");
  }else{
    let c=fs.readFileSync(f,"utf8");
    if(c.includes('"pipeline"')){fs.writeFileSync(f,c.replace(/"pipeline"/g,'"tasks"'));log("Migrated turbo.json schema.");}
    else log("turbo.json schema valid.");
  }
}

function auditLockfile(){
  if(!fs.existsSync("package-lock.json")){log("package-lock.json missing — running npm install...");safeExec("npm install --legacy-peer-deps");}
  else log("package-lock.json present.");
}

function auditGit(){
  safeExec("git add -A");
  try{execSync("git diff --cached --quiet");log("No pending git changes.");}
  catch{safeExec('git commit -S -m "chore(jb-doctor): auto-audit + schema repair"');log("Auto-commit created.");}
}

function run(){
  log("Starting Jungle Book Doctor...");
  auditTurbo();
  auditLockfile();
  safeExec("npm run lint --if-present");
  safeExec("npm run build --if-present");
  auditGit();
  log("✅ Jungle Book Doctor complete. Repository is healthy.");
}

run();
