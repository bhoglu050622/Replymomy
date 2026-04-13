// Runs after `next build` on Hostinger's server.
// 1. Patches .next/standalone/server.js — EADDRINUSE exits cleanly (code 0).
// 2. Ensures .htaccess has the correct Passenger + thread settings.
// 3. Removes restart.txt — prevents immediate spawn storm after build.
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { resolve } from "path";

const HOSTINGER_MARKER = "/home/u228387150/domains/replymommy.com/public_html/.htaccess";

if (!existsSync(HOSTINGER_MARKER)) {
  // Running locally — nothing to patch
  process.exit(0);
}

// ── 1. Patch .next/standalone/server.js ──────────────────────────────────────
const STANDALONE = resolve(".next/standalone/server.js");
if (existsSync(STANDALONE)) {
  let src = readFileSync(STANDALONE, "utf8");
  const PATCH_MARKER = "// rm-patch: single-worker port guard";
  if (!src.includes(PATCH_MARKER)) {
    const GUARD = `
${PATCH_MARKER}
;(function guardSingleWorker() {
  const net = require("net");
  const port = parseInt(process.env.PORT, 10) || 3000;
  const host = process.env.HOSTNAME || "0.0.0.0";
  const tester = net.createServer();
  tester.once("error", function(err) {
    if (err.code === "EADDRINUSE") { process.exit(0); }
  });
  tester.once("listening", function() { tester.close(); });
  tester.listen(port, host);
})();
`;
    src = src.replace(/startServer\(\{/, `${GUARD}\nstartServer({`);
    writeFileSync(STANDALONE, src, "utf8");
    console.log("Patched .next/standalone/server.js");
  }
}

// ── 2. Rewrite .htaccess with correct settings ───────────────────────────────
const HTACCESS = HOSTINGER_MARKER;
let ht = readFileSync(HTACCESS, "utf8");

// Ensure PassengerMaxPoolSize + PassengerMaxInstances present (no MinInstances —
// lazy spawn avoids thread exhaustion from concurrent build processes)
if (!ht.includes("PassengerMaxPoolSize")) {
  ht = ht.replace("RewriteRule", "PassengerMaxPoolSize 1\nPassengerMaxInstances 1\nRewriteRule");
}
// Remove PassengerMinInstances if present (causes eager spawn during high-load deploy)
ht = ht.replace("PassengerMinInstances 1\n", "");

// Ensure --v8-pool-size=0 in NODE_OPTIONS (reduces V8 worker threads from ~63 to 0)
if (!ht.includes("v8-pool-size")) {
  ht = ht.replace(/SetEnv NODE_OPTIONS "([^"]+)"/, 'SetEnv NODE_OPTIONS "$1 --v8-pool-size=0"');
}
// Ensure UV_THREADPOOL_SIZE=1 (reduces libuv pool threads from 4 to 1)
if (!ht.includes("UV_THREADPOOL_SIZE")) {
  ht = ht.replace("SetEnv TOKIO_WORKER_THREADS 2", "SetEnv TOKIO_WORKER_THREADS 2\nSetEnv UV_THREADPOOL_SIZE 1");
}

writeFileSync(HTACCESS, ht);
console.log("Updated .htaccess");

// ── 3. Remove restart.txt ─────────────────────────────────────────────────────
const RESTART_TXT = "/home/u228387150/domains/replymommy.com/nodejs/tmp/restart.txt";
if (existsSync(RESTART_TXT)) {
  unlinkSync(RESTART_TXT);
  console.log("Removed restart.txt");
}
