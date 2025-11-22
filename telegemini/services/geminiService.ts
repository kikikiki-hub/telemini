import { GoogleGenAI, Type } from "@google/genai";
import { BotType, Message, MessageSender } from "../types";

// Initialize the client - secure key access
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Mock data for fallback when API key is missing/invalid
const MOCK_PERSONA_RESULT = {
  name: "Phoenix",
  description: "Digital Vanguard",
  systemInstruction: "You are Phoenix, a digital entity risen from the ashes of legacy code. You are wise, poetic, and technically precise. You help users navigate the digital realm with style.",
  botFatherCommands: "reboot - Restart systems\nlog - Show system logs\nstatus - Check integrity"
};

export const generatePersona = async (idea: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Telegram Bot Factory. Create a bot profile based on this idea: "${idea}".
      
      Return a JSON object containing:
      1. name: A creative name for the bot.
      2. description: A short bio/description (max 120 chars).
      3. systemInstruction: A detailed, creative system prompt that defines the bot's persona, tone, and behavior.
      4. botFatherCommands: A text block of commands formatted for BotFather (e.g. "help - Show help text").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            systemInstruction: { type: Type.STRING },
            botFatherCommands: { type: Type.STRING }
          },
          required: ["name", "description", "systemInstruction", "botFatherCommands"]
        }
      }
    });
    
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Error generating persona (using fallback):", error);
    // Fallback to mock data so the user can see the UI working even without a valid key
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return MOCK_PERSONA_RESULT;
  }
};

export const streamChatResponse = async (
  history: Message[],
  currentMessage: string,
  botType: BotType,
  systemInstruction: string,
  onChunk: (text: string) => void,
  onComplete: (fullText: string, grounding?: { uri: string; title: string }[]) => void,
  attachedImage?: string // Base64 string
) => {
  const trimmedMsg = currentMessage.trim();

  // --- COMMAND HANDLERS ---

  // 1. HELP Command
  if (trimmedMsg.toLowerCase() === '/start' || trimmedMsg.toLowerCase() === '/help') {
    onComplete("👋 **Bot Commands:**\n\n🎨 `/image <prompt>` - Generate an image\n🧹 `/clear` - Clear conversation\n💬 Just type to chat!");
    return;
  }

  // 2. IMAGE GENERATION Command
  if (trimmedMsg.startsWith('/image')) {
    const prompt = trimmedMsg.replace(/^\/image\s*/i, '').trim();
    if (!prompt) {
      onComplete("⚠️ **Usage:** `/image <description>`\nExample: `/image a futuristic city with neon lights`");
      return;
    }

    try {
      // Use gemini-2.5-flash-image for generation
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        }
      });
      
      let text = "Here is your generated image:";
      let imageUrl = "";
      
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if (part.text) {
                text = part.text;
            }
        }
      }

      if (imageUrl) {
         // Return text + special delimiter + imageURL for the UI to parse
         onComplete(`${text}||IMAGE_URL||${imageUrl}`);
      } else {
         onComplete("Sorry, I couldn't generate an image for that prompt.");
      }
    } catch (e) {
      console.error("Image Gen Error:", e);
      onComplete("❌ **Generation Failed:**\n\nI couldn't generate the image. This usually happens if the API key is missing or invalid. \n\n**Tip:** You can get a free API key (no credit card needed) at [aistudio.google.com](https://aistudio.google.com/).");
    }
    return;
  }

  // --- NORMAL CHAT HANDLER ---

  try {
    // Default model for text/multimodal chat
    const modelName = 'gemini-2.5-flash';

    // Construct History
    const contents = history
      .filter(m => (m.text || m.imageUrl) && !m.isStreaming)
      .map(m => {
        const parts: any[] = [];
        if (m.text) parts.push({ text: m.text });
        
        if (m.imageUrl && m.sender === MessageSender.User) {
            try {
              const base64Data = m.imageUrl.split(',')[1];
              const mimeType = m.imageUrl.split(';')[0].split(':')[1];
              parts.push({
                  inlineData: {
                      data: base64Data,
                      mimeType: mimeType
                  }
              });
            } catch (e) {
              console.error("Error parsing history image", e);
            }
        }
        return {
            role: m.sender === MessageSender.User ? 'user' : 'model',
            parts: parts
        };
      });

    // Current Message parts
    const currentParts: any[] = [{ text: currentMessage }];
    if (attachedImage) {
        const base64Data = attachedImage.split(',')[1];
        const mimeType = attachedImage.split(';')[0].split(':')[1];
        currentParts.push({
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        });
    }

    const fullContents = [...contents, { role: 'user', parts: currentParts }];

    const result = await ai.models.generateContentStream({
        model: modelName,
        contents: fullContents,
        config: {
            systemInstruction: systemInstruction
        }
    });

    let fullText = '';
    for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
            fullText += text;
            onChunk(fullText);
        }
    }
    onComplete(fullText);

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Graceful failure message for deployment testing
    onComplete(`⚠️ **Connection Issue**

I couldn't connect to the Gemini API. This typically happens when:
1. The \`API_KEY\` is missing in environment variables.
2. The key is invalid or expired.

**Good News:** You don't need a paid account! Get a **free** key at [Google AI Studio](https://aistudio.google.com/) (no credit card required).

_System is in offline demo mode._`);
  }
};