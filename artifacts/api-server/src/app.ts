import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import http from "http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const staticDir = path.join(process.cwd(), "artifacts/houseboat/dist/public");
  if (fs.existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
  }
} else {
  // In development, proxy everything that isn't /api to the Vite dev server
  const VITE_PORT = 5173;

  app.use((req, res) => {
    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: VITE_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${VITE_PORT}`,
      },
    };

    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxy.on("error", (_err) => {
      if (!res.headersSent) {
        res.status(502).send("Vite dev server not reachable. Make sure the houseboat workflow is running.");
      }
    });

    req.pipe(proxy, { end: true });
  });
}

export default app;
