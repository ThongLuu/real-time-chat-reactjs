import React, { useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

const CustomEmojiPicker = ({ onEmojiClick, onClose }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose(); // Gọi hàm đóng emoji picker
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      style={{ position: "absolute", bottom: "20%", right: "0" }}
    >
      <EmojiPicker onEmojiClick={onEmojiClick} />
    </div>
  );
};

export default CustomEmojiPicker;
