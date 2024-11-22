"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ChartPie,
  ImageIcon,
  XIcon,
  SendIcon,
  ArrowUpIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ChatMessages from "@/components/custom/ChatMessage";
import apiKey from "@/utils/geminiKey";
import Image from "next/image";

const ChatScreen = () => {
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
  const [chatInstance, setChatInstance] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Initialize chat instance
  useEffect(() => {
    const initializeChat = async () => {
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 2000,
        },
      });
      setChatInstance(chat);
    };

    initializeChat();
  }, []);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      const base64 = await convertToBase64(file);
      setImageBase64(base64);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Updated handleSend to use chat history
  const handleSend = async () => {
    if (!input.trim() && !image) return;
    if (!chatInstance) return;

    setIsLoading(true);

    try {
      const userMessageId = Date.now();
      const userMessage = {
        id: userMessageId,
        text: input,
        user: true,
        ...(imagePreview ? { image: imagePreview } : {}),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Prepare the input parts for the current message
      let response;
      const inputValue = input;

      if (imageBase64) {
        const base64Data = imageBase64.split(",")[1];

        const imagePart = {
          inlineData: {
            mimeType: image?.type || "image/jpeg",
            data: base64Data,
          },
        };
        setInput("");
        removeImage();
        scrollToBottom();
        // For messages with images, we'll use generateContent instead of chat
        const result = await model.generateContent([inputValue, imagePart]);
        response = await result.response;
      } else {
        // For text-only messages, use the chat instance
        setInput("");
        const result = await chatInstance.sendMessage(inputValue);
        response = await result.response;
      }

      const aiResponse = {
        id: userMessageId + 1,
        text: response.text(),
        user: false,
      };

      setMessages((prev) => [...prev, aiResponse]);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Rest of the component (JSX) remains the same
  return (
    <div className="flex flex-col h-screen bg-[#2c2b28] text-white relative px-[15vw]">
      <header className="fixed top-0 left-0 right-0  flex items-center h-12 bg-[#2c2b28] px-4">
        <h1 className="text-xl font-semibold text-white">Talkie</h1>
      </header>
      <div
        className={`${
          messages.length === 0 ? "h-1/2" : "flex-grow"
        } overflow-y-auto p-4 relative scrollbar-hide mt-8`}
      >
        {messages.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                {getGreetingMessage()}
              </h1>
              <p className="text-xl">How can I assist you today?</p>
            </div>
          </div>
        ) : (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div
          className={`relative z-10 p-4 h-40 w-[65vw] self-center overflow-hidden bg-[#282623] rounded-t-3xl border border-[#383933] border-opacity-10 ${
            messages.length !== 0 && "bottom-[17vh]"
          }`}
        >
          <div className="relative h-full w-44">
            <Image
              src={imagePreview}
              alt="Preview"
              className="object-cover h-full w-full rounded-lg border border-gray-400"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 left-2 hover:bg-red-500 bg-[#3a3a38] rounded-full p-1 transition-colors duration-200"
            >
              <XIcon color="white" className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`
          ${
            messages.length === 0
              ? "relative mx-auto w-[70vw] mb-32 rounded-3xl"
              : "absolute bottom-0 w-[70vw] left-1/2 transform -translate-x-1/2 rounded-t-3xl"
          }
          p-4 bg-[#393937] flex items-center space-x-2 border border-[#454640] border-opacity-10
        `}
      >
        <div className="flex-grow relative rounded-lg">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask Anything..."
            className="pr-10 text-white bg-[#393937] w-full resize-none placeholder-gray-400 focus:outline-none scrollbar-hide"
          />
          <label
            htmlFor="image-upload"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:bg-[#2c2b28] p-2 rounded-full transition-colors"
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
        {(input.trim() || image) && (
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !image)}
            className={`
            p-2 rounded-xl transition-colors
            ${
              isLoading || (!input.trim() && !image)
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#ae562f] hover:bg-[#b1562e]"
            }
          `}
          >
            <ArrowUpIcon color="white" className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
