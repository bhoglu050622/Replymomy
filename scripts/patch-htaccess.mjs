// Runs after `next build` on Hostinger's server.
// Patches the Passenger .htaccess to cap workers at 1 so multiple processes
// never race to bind port 3000, which causes 503s.
import { existsSync, readFileSync, writeFileSync } from "fs";

const HTACCESS = "/home/u228387150/domains/replymommy.com/public_html/.htaccess";

if (!existsSync(HTACCESS)) {
  // Running locally — nothing to patch
  process.exit(0);
}

let content = readFileSync(HTACCESS, "utf8");

if (content.includes("PassengerMaxPoolSize")) {
  // Already patched
  process.exit(0);
}

content = content.replace(
  "RewriteRule",
  "PassengerMaxPoolSize 1\nPassengerMinInstances 1\nRewriteRule"
);

writeFileSync(HTACCESS, content);
console.log("Patched .htaccess with PassengerMaxPoolSize 1");
