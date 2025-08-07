"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";


export default function WordCloudForm() {
  const [title, setTitle] = useState("");
  const [words, setWords] = useState("");
  const {user} = useAuth();
  const adminId = user?.id;
  const socket = useSocket();
  const handleSubmit = () => {
    if (!words.trim()) return;

    socket?.emit("create-wordcloud-admin", {
      adminId,
      title,
      words: words.replace(/\s/g, ""), // "OOP,Encapsulation"
    });

    setTitle("");
    setWords("");
    alert("Word cloud sent!");
  };

  return (
    <div className="p-4 border rounded-xl space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold">Create Word Cloud</h2>

      <Textarea
        placeholder="Enter question or instruction"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Input
        placeholder="Comma-separated words (e.g., OOP,Encapsulation)"
        value={words}
        onChange={(e) => setWords(e.target.value)}
      />

      <Button onClick={handleSubmit}>Send to Participants</Button>
    </div>
  );
}
