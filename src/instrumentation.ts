import { createWebSocketServer } from "./server/ws";

export const register = () => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    createWebSocketServer({ port: 6001 });
  }
};
