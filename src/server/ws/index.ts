import { WebSocketServer } from "ws";
import { logger } from "@/lib/logger";

export const createWebSocketServer = (options: {
  port: number;
  host?: string;
}) => {
  const { port, host = "0.0.0.0" } = options;
  const wss = new WebSocketServer({ port, host, path: "/ws" });

  wss.on("connection", (ws, request) => {
    logger.info(request);
    logger.info("New client connected");

    ws.on("message", (message) => {
      logger.info(`Received: ${message}`);
    });

    ws.on("close", () => {
      logger.info("Client disconnected");
    });
  });

  logger.info(`> WebSocket server is running on ws://${host}:${port}/ws`);
};
