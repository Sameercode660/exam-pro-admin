"use client";

import React, { useEffect } from "react";

export type MessageType = "success" | "error" | "info";

interface MessageProps {
  type: MessageType;
  text: string;
  onClose: () => void; // 👈 new prop
}

const Message: React.FC<MessageProps> = ({ type, text, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // 👈 auto remove from parent
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses =
    "p-4 rounded-md shadow-md text-sm font-medium transition-all duration-300 ease-in-out";
  const typeClasses =
    type === "success"
      ? "bg-green-100 text-green-700 border border-green-300"
      : type === "error"
      ? "bg-red-100 text-red-700 border border-red-300"
      : "bg-blue-100 text-blue-700 border border-blue-300";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {text}
    </div>
  );
};

export default Message;
