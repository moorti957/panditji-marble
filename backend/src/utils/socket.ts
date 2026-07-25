import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const setSocketServer = (server: SocketIOServer) => {
  io = server;
};

export const getSocketServer = (): SocketIOServer | null => io;

export default getSocketServer;
