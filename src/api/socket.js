import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_WEB_URL, {
  transports: ["websocket"], // đảm bảo không bị polling
});