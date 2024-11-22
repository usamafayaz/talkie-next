"use client";
import React from "react";
import { useChat } from "@/hooks/useChat";
import { getGreetingMessage } from "@/utils/helpers";
import ChatInput from "@/components/custom/ChatInput";
import Header from "@/components/custom/Header";
import ChatMessages from "@/components/custom/ChatMessage";

const ChatScreen = () => {
  const { messages, isLoading, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-screen bg-[#2c2b28] text-white relative px-[15vw]">
      <Header />
      <div
        className={`flex-grow overflow-y-auto p-4 relative scrollbar-hide mt-8`}
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
      </div>
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        messagesExist={messages.length > 0}
      />
    </div>
  );
};

export default ChatScreen;
