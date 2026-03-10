import { useState } from "react";
import { Message } from "@/utils/types";
import { convertToBase64 } from "@/utils/helpers";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");

  const sendMessage = async (text: string, image: File | null) => {
    if (!text.trim() && !image) return;

    setIsLoading(true);

    try {
      const userMessageId = Date.now();
      const userMessage: Message = {
        id: userMessageId,
        text,
        user: true,
      };

      let imageData = null;

      if (image) {
        const imageBase64 = await convertToBase64(image);
        const [meta, data] = imageBase64.split(",");
        const mimeType = meta.match(/:(.*?);/)?.[1] || "image/jpeg";

        imageData = {
          mimeType,
          data,
        };

        userMessage.image = URL.createObjectURL(image);
      }

      setMessages((prev) => [...prev, userMessage]);

      const history = messages.map((msg) => ({
        role: msg.user ? "user" : "model",
        content: msg.text || "",
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: text }],
          image: imageData,
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from AI");
      }

      const data = await response.json();

      const aiResponse: Message = {
        id: userMessageId + 1,
        text: data.text,
        user: false,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Error: ${error.message || "An unexpected error occurred."}`,
          user: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    selectedModel,
    setSelectedModel,
    clearMessages,
  };
};
