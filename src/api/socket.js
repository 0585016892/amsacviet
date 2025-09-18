import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_WEB_URL, {
  withCredentials: true,
  extraHeaders: {
    "ngrok-skip-browser-warning": "true", // tránh warning
  },
  transports: ["websocket"], // đảm bảo không bị polling
});