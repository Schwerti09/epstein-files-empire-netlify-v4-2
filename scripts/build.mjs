import fs from "node:fs";
import path from "node:path";

const mustExist = [
  "site/index.html",
  "site/styles.css",
  "site/js/render.js",
  "netlify/functions/documents.mjs",
  "database/schema.sql"
];

let ok = true;
for (const file of mustExist) {
  if (!fs.existsSync(path.resolve(file))) {
    console.error("Missing file:", file);
    ok = false;
  }
}
if (!ok) process.exit(1);

console.log("✅ Build ok (static publish = /site)");
