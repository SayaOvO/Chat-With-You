import { NextApiResponseWithSocket } from "@/types";
import { NextApiRequest } from "next";
import { Server } from "socket.io";

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const io = new Server(res.socket.server, {
      path,
    });
    res.socket.server.io = io;
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
