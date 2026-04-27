import { io } from "socket.io-client";

const socket = io("http://192.168.1.101:3000");
// const socket = io("http://[IP_ADDRESS]")

export default socket;