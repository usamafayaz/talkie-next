import React from "react";
import { Copy } from "lucide-react";
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
  return (
    <div className="space-y-4 pb-24">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.user ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] p-4 rounded-lg shadow-sm ${
              message.user
                ? "bg-gray-800 text-white"
                : "bg-gray-700 text-gray-400 border border-gray-600"
            }`}
          >
            {message.image && (
              <div className="h-72 w-72 overflow-hidden mb-2 rounded-md">
                <Image
                  height={300}
                  width={300}
                  src={message.image}
                  alt="Message image"
                  className="rounded-md mb-4"
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
          <div className="bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-500 border-t-gray-300" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
