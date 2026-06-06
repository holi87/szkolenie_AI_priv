// server.mjs — minimalny statyczny serwer plikow (zero zaleznosci, zero CDN — ADR-0002).
// Serwuje CALE repo z jednego korzenia, zeby OBA renderowane zrodla rozwiazywaly sie sciezkami wzglednymi:
//   - produkcja:  /genai-llm-training/index.html  (jej assets/*.js + fetch('data/*.json') dzialaja relatywnie),
//   - mockupy:    /docs/design/claude-redesign-2026-06/mockup-0X.html (standalone, wlasny <style>).
// Uruchamiany i zamykany WEWNATRZ capture.mjs → caly audyt = jedna komenda `node capture.mjs`.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, extname } from "node:path";

// Minimalna mapa typow MIME — tylko to, czego uzywa appka i mockupy (statyczny hosting).
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/**
 * Startuje statyczny serwer z korzeniem `rootDir`. Zwraca { server, baseUrl, close }.
 * Sciezki spoza korzenia (traversal `..`) sa odrzucane 403 — defensywnie, mimo ze to lokalny tool.
 */
export async function startStaticServer(rootDir) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";

      // Zabezpieczenie przed path traversal: normalizuj i upewnij sie, ze cel zostaje w korzeniu.
      const filePath = normalize(join(rootDir, pathname));
      if (!filePath.startsWith(normalize(rootDir))) {
        res.writeHead(403).end("Forbidden");
        return;
      }

      const body = await readFile(filePath);
      const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "content-type": type }).end(body);
    } catch (err) {
      const code = err && err.code === "ENOENT" ? 404 : 500;
      res.writeHead(code).end(code === 404 ? "Not Found" : "Server Error");
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const close = () => new Promise((resolve) => server.close(resolve));
  return { server, baseUrl, close };
}
