import React, { useState } from "react";
import { Copy, X } from "lucide-react";
import Image from "next/image";

interface Message {
  id: string | number;
  text?: string;
  image?: string;
  user: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

// Image Modal Component
const ImageModal: React.FC<{
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ imageSrc, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <div className="relative w-full h-full min-h-[300px] min-w-[700px]">
          <Image
            src={imageSrc}
            alt="Enlarged message image"
            className="rounded-lg object-contain"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

const FormattedText: React.FC<{ text: string; isUser: boolean }> = ({
  text,
  isUser,
}) => {
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeContent = "";

  return (
    <div className="space-y-2">
      {lines.map((line, lineIndex) => {
        // Check for numbered headings
        const numberedHeadingMatch = line.match(/^(\d+\.) \*\*(.*?)\*\*/);
        if (numberedHeadingMatch) {
          const [, number, headingText] = numberedHeadingMatch;
          return (
            <div
              key={lineIndex}
              className={`text-lg font-bold text-white mb-2`}
            >
              {number} {headingText}
            </div>
          );
        }

        // Handle code blocks
        if (line.trim() === "```") {
          if (inCodeBlock) {
            const content = codeContent;
            codeContent = "";
            inCodeBlock = false;
            return (
              <div
                key={lineIndex}
                className="relative bg-gray-800 rounded-md p-4 mb-2 group"
              >
                <pre
                  className={
                    "text-sm font-mono whitespace-pre-wrap overflow-x-auto text-white"
                  }
                >
                  {content}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(content)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={16} color="white" />
                </button>
              </div>
            );
          } else {
            inCodeBlock = true;
            return null;
          }
        }

        if (inCodeBlock) {
          codeContent += line + "\n";
          return null;
        }

        // Handle other formatting
        const parts = line.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/);

        return (
          <div key={lineIndex} className="space-y-1">
            {parts
              .filter((part) => part.trim())
              .map((part, partIndex) => {
                part = part.trim();

                if (part.startsWith("***") && part.endsWith("***")) {
                  return (
                    <span
                      key={`${lineIndex}-${partIndex}`}
                      className={`text-xl font-bold text-white block`}
                    >
                      {part.slice(3, -3).trim()}
                    </span>
                  );
                } else if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <span
                      key={`${lineIndex}-${partIndex}`}
                      className={`text-lg font-bold block text-white`}
                    >
                      {part.slice(2, -2).trim()}
                    </span>
                  );
                } else if (part.startsWith("*") && part.endsWith("*")) {
                  return (
                    <span
                      key={`${lineIndex}-${partIndex}`}
                      className={"italic text-white"}
                    >
                      {part.slice(1, -1).trim()}
                    </span>
                  );
                } else {
                  return (
                    <span
                      key={`${lineIndex}-${partIndex}`}
                      className={"text-white"}
                    >
                      {part}
                    </span>
                  );
                }
              })}
          </div>
        );
      })}
    </div>
  );
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  return (
    <>
      <div className="space-y-4 pb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.user ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-6 py-4 rounded-2xl shadow-sm ${
                message.user
                  ? "bg-[#22211d] text-white"
                  : "bg-[#363632] text-gray-400"
              }`}
            >
              {message.image && (
                <div
                  className="relative w-60 h-60 mb-3 rounded-xl border border-gray-700/30 cursor-pointer"
                  onClick={() => setSelectedImage(message.image)}
                >
                  <Image
                    src={message.image}
                    alt="Message image"
                    className="rounded-xl object-cover hover:scale-105 transition-transform duration-300"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
              )}
              {message.text && (
                <FormattedText text={message.text} isUser={message.user} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#363632] py-4 px-8 rounded-xl shadow-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-500 border-t-gray-300" />
            </div>
          </div>
        )}
      </div>

      <ImageModal
        imageSrc={selectedImage || ""}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

export default ChatMessages;
