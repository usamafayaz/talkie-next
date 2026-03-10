import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const googleKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

const genAI = googleKey ? new GoogleGenerativeAI(googleKey) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;

export async function POST(req: Request) {
    try {
        const { messages, image, modelId } = await req.json();
        const modelName = modelId || "gemini-3-flash-preview";

        // Handle Google Models
        if (modelName.startsWith("gemini")) {
            if (!genAI) {
                return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
            }

            const model = genAI.getGenerativeModel({ model: modelName });
            const history = messages.slice(0, -1).map((msg: any) => ({
                role: msg.role === "model" ? "model" : "user",
                parts: [{ text: msg.content || "" }],
            }));

            const chat = model.startChat({ history });
            const lastMessage = messages[messages.length - 1].content || "";

            let result;
            if (image) {
                const imagePart = {
                    inlineData: {
                        mimeType: image.mimeType,
                        data: image.data,
                    },
                };
                result = await chat.sendMessage([lastMessage, imagePart]);
            } else {
                result = await chat.sendMessage(lastMessage);
            }

            const response = await result.response;
            return NextResponse.json({ text: response.text() });
        }

        // Handle OpenAI Models
        if (modelName.startsWith("gpt")) {
            if (!openai) {
                return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
            }

            const openaiMessages = messages.map((msg: any) => ({
                role: msg.role === "model" ? "assistant" : "user",
                content: msg.content || "",
            }));

            // Handle image in last message if present
            if (image) {
                const lastIdx = openaiMessages.length - 1;
                const textContent = openaiMessages[lastIdx].content;
                openaiMessages[lastIdx].content = [
                    { type: "text", text: textContent },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${image.mimeType};base64,${image.data}`,
                        },
                    },
                ];
            }

            const response = await openai.chat.completions.create({
                model: modelName,
                messages: openaiMessages,
            });

            return NextResponse.json({ text: response.choices[0].message.content });
        }

        // Handle Groq Models
        if (modelName.includes("llama")) {
            if (!groq) {
                return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
            }

            const groqMessages = messages.map((msg: any) => ({
                role: msg.role === "model" ? "assistant" : "user",
                content: msg.content || "",
            }));

            if (image) {
                return NextResponse.json({ error: "Groq (Llama) models do not support image analysis in this version. Please use Gemini for images." }, { status: 400 });
            }

            const response = await groq.chat.completions.create({
                model: modelName,
                messages: groqMessages,
            });

            return NextResponse.json({ text: response.choices[0].message.content });
        }

        return NextResponse.json({ error: "Unknown model provider requested." }, { status: 400 });

    } catch (error: any) {
        console.error("Chat API Error:", error);

        let errorMessage = error.message || "An error occurred during the chat request.";
        let statusCode = 500;

        // Custom handling for OpenAI Quota issues
        if (error.status === 429) {
            errorMessage = "OpenAI Quota Exceeded. Please ensure you have added a payment method (at least $5 credit) to your OpenAI account at platform.openai.com.";
            statusCode = 429;
        } else if (error.message?.includes("quota")) {
            errorMessage = "API Quota Exceeded. Please check your credit balance or rate limits.";
            statusCode = 429;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
