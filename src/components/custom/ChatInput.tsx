import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  XIcon,
  ArrowUpIcon,
  PaperclipIcon,
  ImageUpIcon,
  Gift,
  Text,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import Image from "next/image";
import { ChatInputProps } from "@/utils/types";
import { motion } from "framer-motion";

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  messagesExist,
}) => {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buttonVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const buttons = [
    {
      label: "Analyze images",
      icon: ImageUpIcon,
      color: "text-green-500",
      textInput: "Help me analyze this image ",
    },
    {
      label: "Summarize text",
      icon: Text,
      color: "text-orange-500",
      textInput: "Summarize ",
    },
    {
      label: "Surprise me",
      icon: Gift,
      color: "text-blue-500",
      textInput: "Surprise me ",
    },
    {
      label: "Brainstorm",
      icon: Lightbulb,
      color: "text-yellow-500",
      textInput: "Brainstorm ideas ",
    },
    {
      label: "Get advice",
      icon: GraduationCap,
      color: "text-blue-400",
      textInput: "Get advice ",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    onSend(input, image);
    setInput("");
    removeImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setShowTooltip(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {imagePreview && (
        <div
          className={`
            relative z-10 p-4 md:h-40 h-24 md:w-[65vw] w-[75vw] self-center overflow-hidden 
            bg-[#282623] rounded-t-3xl border border-[#383933] 
            border-opacity-10 
            ${messagesExist ? "bottom-[11vh] md:bottom-[14vh]" : ""}
          `}
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
            messagesExist
              ? "absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-t-3xl px-4 pt-4"
              : "relative mx-auto mb-36 rounded-3xl p-4"
          }
           bg-[#393937] md:w-[70vw] w-[85vw] flex items-center space-x-2 border border-[#454640] border-opacity-10
        `}
      >
        <div className="flex-grow relative rounded-lg">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask Anything..."
            className="pr-10 text-white bg-[#393937] w-full resize-none placeholder-gray-400 focus:outline-none scrollbar-hide "
          />
          <label
            htmlFor="image-upload"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:bg-[#2c2b28] p-2 rounded-xl transition-colors"
          >
            <PaperclipIcon color="gray" className="w-5 h-5" />
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
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative"
        >
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !image)}
            className={`
              p-2 rounded-xl transition-colors
              ${
                isLoading || (!input.trim() && !image)
                  ? "bg-gray-500"
                  : "bg-[#ae562f] hover:bg-[#a84b23]"
              }
            `}
          >
            <ArrowUpIcon color="white" className="w-5 h-5" />
          </button>
          {showTooltip && (
            <div className="flex items-center justify-center absolute w-32 h-8 -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded-md shadow-lg">
              {isLoading || (!input.trim() && !image)
                ? "Message is empty"
                : "Send message"}
            </div>
          )}
        </div>
      </div>
      {!messagesExist && (
        <motion.div
          variants={buttonVariant}
          initial={"hidden"}
          animate={"visible"}
          className="fixed bottom-20 hidden md:flex space-x-4 self-center"
        >
          {buttons.map((button, index) => (
            <button
              onClick={() => {
                setInput(button.textInput);
                textareaRef.current?.focus();
              }}
              key={index}
              className="flex items-center px-4 py-2 bg-[#393937] rounded-lg hover:bg-[#21211e] transition focus:outline-none"
            >
              <span className="flex items-center">
                <button.icon className={`w-5 h-5 mr-2 ${button.color}`} />
              </span>
              <span className="text-white text-sm font-thin">
                {button.label}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </>
  );
};

export default ChatInput;
