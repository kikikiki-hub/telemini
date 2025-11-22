import { BotType, Contact } from './types';

export const CONTACTS: Contact[] = [
  {
    id: 'my-bot',
    name: 'Gemini Assistant',
    avatarUrl: 'https://ui-avatars.com/api/?name=Gemini+Bot&background=0ea5e9&color=fff',
    type: BotType.General,
    color: 'bg-blue-500',
    description: 'AI Assistant • Click settings to customize',
    lastMessage: 'Type /help to start',
    lastMessageTime: 'Now',
    systemInstruction: "You are a helpful, intelligent Telegram bot. Be concise, witty, and helpful. Use Markdown for formatting."
  }
];

export const MOCK_INITIAL_MESSAGES: Record<string, string> = {
  'my-bot': "👋 **Hello! I am your Gemini Assistant.**\n\nI can help you with text, analysis, and creativity.\n\n**Available Commands:**\n🎨 `/image <prompt>` - Generate an AI image\n🧹 `/clear` - Clear chat history\n❓ `/help` - Show this menu\n\n*Click the ⚙️ icon in the header to rename me or change my personality!*",
};