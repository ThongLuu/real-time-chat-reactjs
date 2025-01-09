import React from "react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState("Room 1");
  const [sender, setSender] = useState("");
  const [isDialogVisible, setIsDialogVisible] = useState(false); // Trạng thái Dialog

  // Kết nối socket
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Gán sender
  useEffect(() => {
    joinRoom(currentRoom);
    let savedSender = localStorage.getItem("chat_sender");
    if (!savedSender) {
      savedSender = `User-${uuidv4().slice(0, 6)}`;
      localStorage.setItem("chat_sender", savedSender);
    }
    setSender(savedSender);
    const savedMessages = localStorage.getItem(currentRoom);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [socket]);

  // Nhận tin nhắn
  useEffect(() => {
    if (socket) {
      socket.off("chat_message");
      socket.on("chat_message", (message) => {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, message];
          localStorage.setItem(currentRoom, JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      });
    }
  }, [socket, currentRoom]);

  // Gửi tin nhắn
  const sendMessage = () => {
    if (socket && newMessage.trim() && currentRoom) {
      const messagePayload = {
        sender,
        content: newMessage.trim(),
        roomName: currentRoom,
      };
      socket.emit("chat_message", messagePayload);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender, content: newMessage.trim() },
      ]);
      setNewMessage("");
    }
  };

  // Thay đổi phòng chat
  const joinRoom = (roomName) => {
    if (socket) {
      setCurrentRoom(roomName);
      setMessages([]);
      const savedMessages = localStorage.getItem(roomName);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      socket.emit("join_room", roomName);
    }
  };

  return (
    <div>
      <div className="absolute" style={{ bottom: "25%", right: "5%" }}>
        {/* Nút mở Dialog */}
        <Button
          icon="pi pi-comments"
          rounded
          severity="danger"
          aria-label="Search"
          onClick={() => setIsDialogVisible(true)}
        />

        {/* Dialog chứa giao diện chat */}
        <Dialog
          header="Chat Application"
          visible={isDialogVisible}
          style={{ width: "60vw" }}
          onHide={() => setIsDialogVisible(false)}
          maximizable
        >
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="bg-gray-100 p-4 shadow-md w-3 sm:w-3">
              <h3 className="text-lg font-bold mb-4" style={{ color: "black" }}>
                Chat Rooms
              </h3>
              <div className="space-y-2">
                {["Room 1", "Room 2", "Room 3"].map((room) => (
                  <div
                    key={room}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition ${
                      currentRoom === room
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                    onClick={() => joinRoom(room)}
                  >
                    <div className="flex items-center gap-2 align-items-center">
                      <span style={{ color: "black" }}>{room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-column flex-grow-1 w-9 sm:w-9">
              {/* Messages */}
              <div
                className="flex-grow-1 p-4 overflow-auto"
                style={{ maxHeight: "calc(100vh - 88px)" }}
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === sender
                        ? "justify-content-start"
                        : "justify-content-end"
                    } mb-3`}
                  >
                    <div
                      className={`p-3 rounded-lg shadow-md bg-blue-500 text-white border-round-lg`}
                    >
                      <div className="font-bold">{msg.sender}</div>
                      <div>{msg.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex align-items-center p-4 bg-white border-top-1 border-gray-300">
                <InputText
                  className="flex-grow-1 w-full h-2rem"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <Button
                  label="Send"
                  icon="pi pi-send"
                  className="p-button-rounded p-button-primary ml-2 p-2"
                  onClick={sendMessage}
                  disabled={!currentRoom}
                />
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Chat;
