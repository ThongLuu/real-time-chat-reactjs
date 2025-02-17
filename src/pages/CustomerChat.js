import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import "./real-time-chat.css";
import CustomEmojiPicker from "../components/CustomEmojiPicker";

const CustomerChat = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [roomName, setRoomName] = useState(null); // Phòng hiện tại
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn
  const [sender, setSender] = useState("Customer");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Trạng thái hiển thị Emoji Picker
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

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji); // Thêm emoji vào tin nhắn
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
      <div className="border-round-bottom-2xl flex align-items-center">
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
          icon="pi pi-face-smile"
          className="p-button-text p-2 show-emoji-button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        />
        {showEmojiPicker && (
          <CustomEmojiPicker
            onEmojiClick={handleEmojiClick}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Button */}
      <div className="fixed" style={{ bottom: "15%", right: "5%" }}>
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
          bottom: "15%",
          right: "0",
          border: "none",
        }}
      >
        {/* Hiển thị tin nhắn trong body */}
        <div className="chat-messages pt-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === sender
                  ? "justify-content-start"
                  : "justify-content-end"
              } mb-2`}
            >
              <div
                className={`p-2 rounded-lg shadow-md text-black border-round-lg bg-gray-100`}
              >
                <div className="font-bold">{msg.sender}</div>
                <div>{msg.content}</div>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
};

export default CustomerChat;
