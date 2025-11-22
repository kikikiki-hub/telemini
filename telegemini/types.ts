export enum MessageSender {
  User = 'user',
  Bot = 'bot',
}

export enum BotType {
  General = 'general',
  Vision = 'vision',
  Artist = 'artist',
  Search = 'search'
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string;
  type: BotType;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  color: string;
  description: string;
  systemInstruction?: string; // Custom persona instructions
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: Date;
  imageUrl?: string; // For sending images TO the bot or receiving FROM artist bot
  isStreaming?: boolean;
  groundingSources?: { uri: string; title: string }[];
}

export interface ChatSession {
  contactId: string;
  messages: Message[];
}