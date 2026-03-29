import http from "http";
import net from "net";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

// In development, proxy WebSocket upgrade requests (Vite HMR) to the Vite dev server
if (process.env.NODE_ENV !== "production") {
  const VITE_PORT = 5173;

  server.on("upgrade", (req, socket, head) => {
    const target = net.connect(VITE_PORT, "127.0.0.1", () => {
      const reqLine = `${req.method} ${req.url} HTTP/1.1\r\n`;
      const headers = Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("\r\n");
      target.write(`${reqLine}${headers}\r\n\r\n`);
      target.write(head);
      target.pipe(socket);
      socket.pipe(target);
    });

    target.on("error", () => {
      socket.destroy();
    });
    socket.on("error", () => {
      target.destroy();
    });
  });
}

server.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
