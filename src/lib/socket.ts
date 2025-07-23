
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

class SocketSingleton {
  private static instance: Socket;

  static getInstance(): Socket {
    if (!SocketSingleton.instance) {
      SocketSingleton.instance = io(SOCKET_URL, {
        transports: ["websocket"],
      });
    }
    return SocketSingleton.instance;
  }
}

export default SocketSingleton;
