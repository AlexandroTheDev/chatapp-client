import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BE);

export default socket;