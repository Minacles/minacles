import { WebSocketServer } from "ws";

export const createWebSocketServer = (options: {
  port: number;
  host?: string;
}) => {
  const { port, host = "0.0.0.0" } = options;
  const wss = new WebSocketServer({ port, host, path: "/ws" });

  wss.on("connection", (ws, request) => {
    console.log(request);
    console.log("New client connected");

    ws.on("message", (message) => {
      console.log(`Received: ${message}`);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  console.log(`> WebSocket server is running on ws://${host}:${port}/ws`);
};
