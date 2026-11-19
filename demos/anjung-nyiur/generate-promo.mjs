import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createServer as createProbe } from "node:net";
import { readFile, mkdir, rm, stat, copyFile } from "node:fs/promises";
import { join, extname, resolve, sep } from "node:path";

const root = resolve("demos/anjung-nyiur");
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
let port;
let debugPort;
const downloads = join(root, `.video-downloads-${process.pid}`);
const profile = join(root, `.chrome-render-${process.pid}`);
const mime = { ".html": "text/html; charset=utf-8", ".webp": "image/webp", ".css": "text/css" };

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://127.0.0.1:${port}`).pathname);
    const file = resolve(root, `.${pathname}`);
    if (!file.startsWith(root)) throw new Error("Invalid path");
    const contents = await readFile(file);
    response.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
    response.end(contents);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

let browser;
let control;
let page;
const connections = new Set();

function connect(url) {
  return new Promise((resolveConnection, rejectConnection) => {
    const socket = new WebSocket(url);
    connections.add(socket);
    const pending = new Map();
    let nextId = 1;
    socket.addEventListener("open", () => resolveConnection({
      send(method, params = {}) {
        const id = nextId++;
        return new Promise((resolveCommand, rejectCommand) => {
          pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
          socket.send(JSON.stringify({ id, method, params }));
        });
      },
      socket
    }));
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const item = pending.get(message.id);
      if (!item) return;
      pending.delete(message.id);
      if (message.error) item.reject(new Error(message.error.message));
      else item.resolve(message.result);
    });
    socket.addEventListener("error", rejectConnection);
  });
}

async function waitFor(predicate, label, timeout = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
    } catch { }
    await new Promise((resolveWait) => setTimeout(resolveWait, 300));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function render(format, expectedName) {
  const response = await control.send("Target.createTarget", {
    url: `http://127.0.0.1:${port}/render-promo.html?format=${format}`
  });
  const target = await waitFor(async () => {
    const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    return targets.find((item) => item.id === response.targetId && item.webSocketDebuggerUrl);
  }, "render tab");
  page = await connect(target.webSocketDebuggerUrl);
  await waitFor(async () => {
    const result = await page.send("Runtime.evaluate", { expression: "document.documentElement.dataset.done === 'true' || document.documentElement.dataset.error", returnByValue: true });
    return result.result?.value;
  }, `${expectedName} render`, 60_000);
  const result = await page.send("Runtime.evaluate", { expression: "({done: document.documentElement.dataset.done, error: document.documentElement.dataset.error, status: document.querySelector('#status').textContent})", returnByValue: true });
  const outcome = result.result.value;
  if (outcome.error) throw new Error(outcome.error);
  await waitFor(async () => {
    try { return (await stat(join(downloads, expectedName))).size > 100_000; }
    catch { return false; }
  }, `${expectedName} download`, 30_000);
  console.log(`${expectedName}: ${outcome.status}`);
  await page.send("Page.close").catch(() => {});
  page.socket.close();
  page = undefined;
}

try {
  const reservePort = () => new Promise((resolvePort, rejectPort) => {
    const probe = createProbe();
    probe.once("error", rejectPort);
    probe.listen(0, "127.0.0.1", () => {
      const value = probe.address().port;
      probe.close((error) => error ? rejectPort(error) : resolvePort(value));
    });
  });
  port = await reservePort();
  debugPort = await reservePort();
  await mkdir(downloads, { recursive: true });
  server.listen(port, "127.0.0.1");
  await new Promise((resolveListen) => server.once("listening", resolveListen));
  browser = spawn(chrome, [
    "--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--autoplay-policy=no-user-gesture-required"
  ], { stdio: "ignore", windowsHide: true });
  await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`).catch(() => null);
    return response?.ok ? response.json() : false;
  }, "Chrome DevTools", 20_000).then(async (info) => {
    control = await connect(info.webSocketDebuggerUrl);
    await control.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads, eventsEnabled: true });
  });
  await render("wide", "promo-wide.webm");
  await render("vertical", "promo-vertical.webm");
  await copyFile(join(downloads, "promo-wide.webm"), join(root, "promo-wide.webm"));
  await copyFile(join(downloads, "promo-vertical.webm"), join(root, "promo-vertical.webm"));
} finally {
  page?.socket.close();
  for (const socket of connections) socket.close();
  if (browser) {
    const exited = new Promise((resolveExit) => browser.once("exit", resolveExit));
    browser.kill();
    await exited;
  }
  server.close();
  const resolvedProfile = resolve(profile);
  if (!resolvedProfile.startsWith(root + sep)) throw new Error(`Refusing to remove browser profile outside ${root}`);
  await rm(resolvedProfile, { recursive: true, force: true });
  const resolvedDownloads = resolve(downloads);
  if (!resolvedDownloads.startsWith(root + sep)) throw new Error(`Refusing to remove downloads outside ${root}`);
  await rm(resolvedDownloads, { recursive: true, force: true });
}
