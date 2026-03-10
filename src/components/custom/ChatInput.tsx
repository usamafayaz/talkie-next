import React, { useState, useRef, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  messagesExist,
}) => {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const prompts = [
    { label: "Analyze image", icon: ImageUpIcon, color: "text-emerald-400", prompt: "Help me analyze this image" },
    { label: "Summarize", icon: Text, color: "text-orange-400", prompt: "Summarize the following text:" },
    { label: "Brainstorm", icon: Lightbulb, color: "text-amber-400", prompt: "Let's brainstorm some ideas for" },
    { label: "Advice", icon: GraduationCap, color: "text-indigo-400", prompt: "I need some advice on" },
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
    if ((!input.trim() && !image) || isLoading) return;
    onSend(input, image);
    setInput("");
    removeImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 md:p-8 flex flex-col items-center pointer-events-none`}>
      <div className="w-full max-w-4xl pointer-events-auto">
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
            >
              <div className="mb-4 ml-4">
                <div className="relative w-32 h-32 glass rounded-2xl overflow-hidden group border border-white/20">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover"
                    fill
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500/80 rounded-full transition-colors backdrop-blur-md"
                  >
                    <XIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="input-container p-2 flex items-end space-x-2">
          <div className="flex-grow relative flex items-center">
            <label className="p-3 cursor-pointer hover:bg-white/5 rounded-2xl transition-colors">
              <PaperclipIcon className="w-5 h-5 text-gray-400" />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Message Talkie..."
              className="min-h-[52px] max-h-[200px] py-3 bg-transparent border-none text-white focus-visible:ring-0 placeholder-gray-500 text-lg resize-none scrollbar-hide"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !image)}
            className={`
              p-3.5 rounded-2xl transition-all duration-300
              ${isLoading || (!input.trim() && !image)
                ? "bg-white/5 text-gray-600"
                : "bg-[#ae562f] text-white shadow-lg shadow-[#ae562f]/20 hover:scale-105 active:scale-95"
              }
            `}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUpIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {!messagesExist && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {prompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(item.prompt)}
                  className="glass px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-2"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div >
  );
};

export default ChatInput;
