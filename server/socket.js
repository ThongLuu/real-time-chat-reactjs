const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const server = http.createServer(app);

// Cấu hình CORS
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://192.168.0.37:3000",
      "http://localhost:3002",
      "http://192.168.0.37:3002",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  },
});

// Đọc dữ liệu từ file JSON
let roomsMessages = {};
const messagesFilePath = "./messages.json";

// Kiểm tra nếu file tồn tại và đọc dữ liệu từ file
if (fs.existsSync(messagesFilePath)) {
  const rawData = fs.readFileSync(messagesFilePath);
  roomsMessages = JSON.parse(rawData);
  console.log("Loaded roomsMessages from file:", roomsMessages);
} else {
  console.log("No existing messages file found, starting with empty data.");
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_room", (roomName, callback) => {
    socket.join(roomName);
    console.log(`${socket.id} joined room ${roomName}`);

    if (roomsMessages[roomName]) {
      socket.emit("load_messages", roomsMessages[roomName]);
    }

    if (callback) {
      callback();
    }
  });

  socket.on("chat_message", (message) => {
    const { roomName, sender, content } = message;

    if (!roomsMessages[roomName]) {
      roomsMessages[roomName] = [];
    }

    roomsMessages[roomName].push({ sender, content });

    fs.writeFileSync(messagesFilePath, JSON.stringify(roomsMessages, null, 2));

    io.to(roomName).emit("chat_message", { sender, content });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.0.37:3000",
      "http://localhost:3002",
      "http://192.168.0.37:3002",
    ], // Cho phép cả localhost và IP của bạn
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);

// API lấy danh sách phòng từ message.json
app.get("/api/rooms", (req, res) => {
  const rawData = fs.readFileSync(messagesFilePath);
  const response = JSON.parse(rawData); // Lấy danh sách phòng
  res.json(response); // Trả về danh sách tên phòng
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
