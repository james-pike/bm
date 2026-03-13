import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, ".vercel", "output");
const funcDir = path.join(outputDir, "functions", "_qwik-city.func");
const staticDir = path.join(outputDir, "static");
const serverDir = path.join(root, "server");
const clientDir = path.join(root, "dist");
const publicDir = path.join(root, "public");

// Create output directories
fs.mkdirSync(funcDir, { recursive: true });
fs.mkdirSync(staticDir, { recursive: true });

// Copy server build to function directory
if (fs.existsSync(serverDir)) {
  fs.cpSync(serverDir, funcDir, { recursive: true });
}

// Write Vercel Build Output config
fs.writeFileSync(
  path.join(outputDir, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/.*", dest: "/_qwik-city" },
      ],
    },
    null,
    2
  )
);

// Write edge function config
fs.writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "edge",
      entrypoint: "entry.vercel-edge.js",
    },
    null,
    2
  )
);

// Copy client dist to static dir
if (fs.existsSync(clientDir)) {
  fs.cpSync(clientDir, staticDir, { recursive: true });
}

// Copy public assets to static dir
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, staticDir, { recursive: true });
}

console.log("Vercel Build Output API structure created.");
