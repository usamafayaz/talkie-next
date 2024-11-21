"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChartPie, ImageIcon, XIcon, SendIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ChatMessages from "@/components/custom/ChatMessage";
import apiKey from "@/utils/geminiKey";
const ChatScreen = () => {
  // State management with precise type definition
  const [messages, setMessages] = useState<
    Array<{
      id: string | number;
      text?: string;
      image?: string;
      user: boolean;
    }>
  >([]);

  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini AI initialization
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  // Initialize chat on component mount
  useEffect(() => {
    const initChat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });
    setChat(initChat);

    // Add initial greeting
    setMessages([
      {
        id: "initial-greeting",
        text: "Hello! I'm your AI assistant. How can I help you today?",
        user: false,
      },
    ]);
  }, []);

  // Get greeting message
  const getGreetingMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));

      // Convert image to base64
      const base64 = await convertToBase64(file);
      setImageBase64(base64);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Remove uploaded image
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send message handler
  const handleSend = async () => {
    if (!input.trim() && !image) return;

    setIsLoading(true);

    try {
      // Generate a unique ID for the message
      const userMessageId = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          text: input,
          user: true,
          ...(imagePreview ? { image: imagePreview } : {}),
        },
      ]);

      // Prepare the input parts
      const inputParts: any[] = [input];

      // Add image if available
      if (imageBase64) {
        // Extract the base64 data without the MIME type prefix
        const base64Data = imageBase64.split(",")[1];

        // Create a GenerativeAI image part
        const imagePart = {
          inlineData: {
            mimeType: image?.type || "image/jpeg",
            data: base64Data,
          },
        };

        inputParts.push(imagePart);
      }

      // Clear input
      setInput("");
      removeImage();
      scrollToBottom();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Send message to Gemini
      const result = await model.generateContent(inputParts);
      const response = await result.response;
      const text = response.text();

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId + 1,
          text: text,
          user: false,
        },
      ]);

      // Reset image
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, there was an error processing your message.",
          user: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press for sending message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0c0f] text-white">
      {/* Header */}
      {/* <header className="flex items-center justify-between p-4 bg-[#1e2029]">
        <div className="flex items-center space-x-4">
          <ChartPie color="#da7758" className="w-10 h-10" />
          <h1 className="text-2xl md:text-4xl text-white">
            {getGreetingMessage()}, Usama
          </h1>
        </div>
      </header> */}

      {/* Chat Container */}
      <div className="flex-grow overflow-y-auto p-4">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative p-4 self-end right-12">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
          >
            <XIcon color="white" className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="absolute bottom-0 p-4 bg-[#1e2029] flex items-center space-x-2 w-[70vw] self-center rounded-t-3xl">
        <div className="flex-grow relative rounded-lg">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Message..."
            className="pr-10 text-white bg-[#1e2029] min-h-[50px] max-h-32 w-full scrollbar-hide resize-none"
          />

          {/* Image Upload - Positioned inside input */}
          <label
            htmlFor="image-upload"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:bg-gray-700 p-2 rounded-full"
          >
            <ImageIcon color="gray" className="w-5 h-5" />
            <input
              type="file"
              id="image-upload"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading || (!input.trim() && !image)}
          className={`
            p-2 rounded-full 
            ${
              isLoading || (!input.trim() && !image)
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#444653] hover:bg-[#565869]"
            }
          `}
        >
          <SendIcon color="white" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
