import dotenv from 'dotenv';
dotenv.config();

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import { fileURLToPath } from 'url';
import path from 'path';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Environment Variables:", {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  DB_HOST: process.env.DB_HOST
});


console.log('Loading env from:', envPath);


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });
  
  // console.log({
  //   __dirname, 
  //   cwd: process.cwd(),
  //   distExists: fs.existsSync('/app/dist'),
  //   distContents: fs.readdirSync('/app/dist')
  // });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.

  const host = process.env.DB_HOST || '0.0.0.0'; // Tambahin fallback
  const port = Number(process.env.PORT); // Default 5000 kalau ga ada di env
  
  console.log('DB URL:', process.env.DATABASE_URL);

  server.listen({
    host,  // Use the host from .env or default
    port,
    reusePort: true,
  }, () => {
    log(`Server running on http://${host}:${port}`);
  });
})();
