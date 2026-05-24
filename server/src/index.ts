import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
import { env } from "./config/env";
import { assignmentRouter } from "./routes/assignment.route";
import { paperRouter } from "./routes/paper.route";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import { SocketManager } from "./socket/socket";
import { startQuestionWorker } from "./workers/question.worker";
import { startPDFWorker } from "./workers/pdf.worker";
import { startUploadWorker } from "./workers/upload.worker";

const app = new Hono();
const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const engine = new Engine();

io.bind(engine);

SocketManager.init(io);

logger.info("Initializing BullMQ background workers...");
startQuestionWorker();
startPDFWorker();
startUploadWorker();

app.use("*", cors());

app.use("/pdfs/*", serveStatic({ root: "./public" }));
app.use("/temp/*", serveStatic({ root: "./public" }));

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "VedaAI Assignment Server is running.",
    timestamp: new Date().toLocaleString("en-IN"),
    env: env.NODE_ENV,
  });
});

app.route("/api/assignments", assignmentRouter);
app.route("/api/papers", paperRouter);

app.onError(errorHandler);

logger.info(`Starting server on port ${env.PORT}...`);

const { websocket } = engine.handler();
const port = env.PORT || 3001;

export default {
  port: port,
  idleTimeout: 30,

  fetch(req: Request, server: any) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/socket.io/")) {
      return engine.handleRequest(req, server);
    } else {
      return app.fetch(req, server);
    }
  },

  websocket,
};
