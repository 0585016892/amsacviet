import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_WEB_URL, {
  withCredentials: true,
  transports: ["websocket"], // chỉ dùng websocket, bỏ polling
  extraHeaders: {
    "ngrok-skip-browser-warning": "true",
  },
});
