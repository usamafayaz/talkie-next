import React from "react";
import { ChevronDown, Zap, Sparkles, Brain, FlaskConical, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Model {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    tag: string;
    provider: "google" | "openai" | "groq";
}

const models: Model[] = [
    {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        description: "Truly free and blazing fast (Groq)",
        icon: Zap,
        tag: "Free",
        provider: "groq",
    },
    {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Powerful and efficient OpenAI model",
        icon: Cpu,
        tag: "Smart",
        provider: "openai",
    },
    {
        id: "gemini-3-flash-preview",
        name: "Gemini 3.0 Flash",
        description: "Latest generation preview model",
        icon: Sparkles,
        tag: "Preview",
        provider: "google",
    },
];

interface ModelSelectorProps {
    selectedModel: string;
    onSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
    selectedModel,
    onSelect,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const currentModel = models.find((m) => m.id === selectedModel) || models[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full glass hover:bg-white/10 transition-all border border-white/10"
            >
                <currentModel.icon className="w-4 h-4 text-[#ae562f]" />
                <span className="text-sm font-medium text-white/90">
                    {currentModel.name}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full  -translate-x-1/2 mt-2 w-72 glass-dark rounded-2xl p-2 z-20 border border-white/10 shadow-2xl backdrop-blur-2xl"
                        >
                            <div className="space-y-1">
                                {models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            onSelect(model.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-start space-x-3 p-3 rounded-xl transition-all ${selectedModel === model.id
                                            ? "bg-white/10 border border-white/10"
                                            : "hover:bg-white/5 border border-transparent"
                                            }`}
                                    >
                                        <div className="mt-1 p-2 rounded-lg bg-black/20">
                                            <model.icon
                                                className={`w-4 h-4 ${selectedModel === model.id
                                                    ? "text-[#ae562f]"
                                                    : "text-gray-400"
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex-grow text-left">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-white">
                                                    {model.name}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 font-medium">
                                                    {model.tag}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {model.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModelSelector;
