/**
 * 2D探索画面のスクリーンショットを docs/images/ に出力
 * Usage: node scripts/capture-world2d.mjs
 */
import { createServer } from "node:http";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "docs", "images");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".json": "application/json",
};

function serve(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const path = req.url?.split("?")[0] || "/";
      const rel = path === "/" ? "/scripts/world2d-gallery.html" : path;
      const file = join(root, rel.replace(/^\//, "").replace(/\.\./g, ""));
      if (!file.startsWith(root) || !existsSync(file)) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = file.slice(file.lastIndexOf("."));
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(readFileSync(file));
    });
    server.listen(port, () => resolve(server));
  });
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const port = 4177;
  const server = await serve(port);
  const url = `http://127.0.0.1:${port}/scripts/world2d-gallery.html`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  page.on("pageerror", (err) => console.error("PAGE ERR:", err.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("body[data-ready='1']", { timeout: 15000 });

  await page.locator("#hero-wrap canvas").screenshot({
    path: join(outDir, "world2d-explore.png"),
  });

  await page.screenshot({
    path: join(outDir, "world2d-gallery.png"),
    fullPage: true,
  });

  await browser.close();
  server.close();
  console.log("Saved docs/images/world2d-explore.png");
  console.log("Saved docs/images/world2d-gallery.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
