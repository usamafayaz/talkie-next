import React, { useState } from "react";
import { Copy, X, Check } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

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

const ImageModal: React.FC<{
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ imageSrc, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
        >
          <X size={28} />
        </button>
        <div className="relative w-full h-full min-h-[50vh] min-w-[70vw]">
          <Image
            src={imageSrc}
            alt="Enlarged"
            className="rounded-xl object-contain shadow-2xl"
            fill
            sizes="90vw"
            priority
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-white/5">
        <span className="text-xs font-mono text-gray-400 uppercase">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "javascript"}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          background: "transparent",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-32">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex w-full ${message.user ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] md:max-w-[75%] px-5 py-3 transition-all duration-300 ${message.user ? "chat-bubble-user" : "chat-bubble-ai"
              }`}
          >
            {message.image && (
              <div
                className="relative w-full max-w-sm aspect-square mb-3 rounded-lg overflow-hidden border border-white/10 cursor-zoom-in"
                onClick={() => setSelectedImage(message.image as string)}
              >
                <Image
                  src={message.image}
                  alt="Message image"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />
              </div>
            )}
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <CodeBlock
                        language={match[1]}
                        value={String(children).replace(/\n$/, "")}
                      />
                    ) : (
                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.text || ""}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-[#2c2b28] py-4 px-6 rounded-2xl border border-white/5 shadow-md flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <ImageModal
        imageSrc={selectedImage || ""}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default ChatMessages;
