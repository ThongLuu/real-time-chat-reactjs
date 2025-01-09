import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import "./real-time-chat.css";

const CustomerChat = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [roomName, setRoomName] = useState(null); // Phòng hiện tại
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn
  const socket = useRef(null); // Tham chiếu đến socket

  useEffect(() => {
    // Khởi tạo socket khi component mount
    socket.current = io("http://localhost:3001");

    socket.current.on("load_messages", (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socket.current.on("chat_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      // Hủy kết nối socket khi component unmount
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []); // Chỉ chạy một lần khi component được render

  const handleSendMessage = () => {
    if (!roomName) {
      // Tạo room mới nếu chưa tham gia phòng nào
      const newRoomName = `room_${Date.now()}`;
      setRoomName(newRoomName);

      socket.current.emit("join_room", newRoomName, () => {
        console.log("Joined room successfully");
        sendMessage(newRoomName);
      });
    } else {
      // Nếu đã tham gia phòng, gửi tin nhắn trực tiếp
      sendMessage(roomName);
    }
  };

  const sendMessage = (room) => {
    if (message.trim()) {
      socket.current.emit("chat_message", {
        roomName: room,
        sender: "Customer",
        content: message,
      });
      setMessage(""); // Xóa nội dung input
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex gap-3">
        <div className="w-2rem h-2rem">
          <img
            className="w-full h-full"
            src="https://4.bp.blogspot.com/-Z-lhtEdInSQ/ZVrwztGZr8I/AAAAAABF0dQ/YJlpw5NBYzQZL0SaAyXvpg6GoeLDoWwbQCNcBGAsYHQ/logo_livechat__3_.png?imgmax=3000"
          />
        </div>
        <div>
          <div className="text-white text-sm">GEARVN</div>
          <div className="text-sm" style={{ color: "hsla(0,0%,100%,.7)" }}>
            Chat với chúng tôi
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className="border-round-bottom-2xl">
        <InputText
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border-none customer-chat-input"
          placeholder="Nhập nội dung..."
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <Button
          label="Gửi"
          onClick={handleSendMessage}
          className="p-button-danger mt-2"
        />
      </div>
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Button */}
      <div className="absolute" style={{ bottom: "25%", right: "5%" }}>
        <Button
          icon="pi pi-comments"
          rounded
          severity="danger"
          aria-label="Search"
          onClick={() => setIsDialogVisible(true)}
        />
      </div>

      {/* Dialog */}
      <Dialog
        appendTo="self"
        className="shadow-none customer-chat-dialog"
        header={renderHeader}
        headerClassName="bg-red-600 border-round-top-2xl"
        footer={renderFooter}
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        style={{
          width: "320px",
          position: "absolute",
          bottom: "25%",
          right: "0",
        }}
      >
        {/* Hiển thị tin nhắn trong body */}
        <div
          className="chat-messages"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {messages.map((msg, index) => (
            <div key={index} className="message-item">
              <strong>{msg.sender}: </strong>
              <span>{msg.content}</span>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
};

export default CustomerChat;
