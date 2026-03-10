"use client";
import React, { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { getGreetingMessage } from "@/utils/helpers";
import ChatInput from "@/components/custom/ChatInput";
import Header from "@/components/custom/Header";
import ChatMessages from "@/components/custom/ChatMessage";
import ModelSelector from "@/components/custom/ModelSelector";
import { motion } from "framer-motion";

const ChatScreen = () => {
  const { messages, isLoading, sendMessage, selectedModel, setSelectedModel, clearMessages } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleExport = () => {
    if (messages.length === 0) return;

    const chatText = messages
      .map((m) => `${m.user ? "You" : "AI"}: ${m.text}`)
      .join("\n\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talkie-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1917] text-white relative">
      <Header
        onClear={clearMessages}
        onExport={handleExport}
        showActions={messages.length > 0}
      />

      {/* Model Selector Overlay */}
      <div className="fixed inset-0 z-[60] flex items-start justify-center pointer-events-none pt-3">
        <div className="pointer-events-auto">
          <ModelSelector
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />
        </div>
      </div>

      <main className="flex-grow overflow-y-auto px-4 md:px-0 scrollbar-hide">
        <div className="max-w-4xl mx-auto w-full pt-24 pb-4">
          {messages.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#ae562f]">
                  {getGreetingMessage()}
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                  How can I help<br />you today?
                </h1>
                <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
                  Start a conversation with Talkie, your intelligent AI companion.
                </p>
              </motion.div>
            </div>
          ) : (
            <>
              <ChatMessages messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} className="h-20" />
            </>
          )}
        </div>
      </main>

      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        messagesExist={messages.length > 0}
      />
    </div>
  );
};

export default ChatScreen;
