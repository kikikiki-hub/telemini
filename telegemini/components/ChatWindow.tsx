import React, { useRef, useEffect, useState } from 'react';
import { Contact, Message, MessageSender } from '../types';
import MessageBubble from './MessageBubble';
import { ChevronLeftIcon, PaperclipIcon, SendIcon, XIcon, ImageIcon, SettingsIcon } from './Icons';

interface ChatWindowProps {
  activeContact: Contact;
  messages: Message[];
  onSendMessage: (text: string, image?: string) => void;
  onBack: () => void; // For mobile view
  onOpenSettings: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeContact, messages, onSendMessage, onBack, onOpenSettings }) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage) return;
    onSendMessage(inputText, attachedImage || undefined);
    setInputText('');
    setAttachedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAttachedImage(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  return (
    <div className="flex flex-col h-full bg-[#0e1621] bg-telegram-pattern relative">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#17212b] border-b border-black/20 shadow-sm z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onBack} className="md:hidden text-[#707579] hover:text-white">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${activeContact.color}`}>
            {activeContact.avatarUrl ? (
                <img src={activeContact.avatarUrl} alt={activeContact.name} className="w-full h-full object-cover rounded-full" />
            ) : (
                activeContact.name.charAt(0)
            )}
          </div>
          
          <div className="min-w-0">
            <h2 className="font-semibold text-white text-sm md:text-base truncate">{activeContact.name}</h2>
            <p className="text-xs text-[#707579] truncate">{activeContact.description}</p>
          </div>
        </div>

        <button 
            onClick={onOpenSettings}
            className="p-2 text-[#707579] hover:text-white transition-colors rounded-full hover:bg-white/5"
            title="Customize Bot"
        >
            <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 md:p-4 bg-[#17212b] shrink-0">
        {/* Attachment Preview */}
        {attachedImage && (
            <div className="flex items-center gap-2 mb-2 px-2">
                <div className="relative group">
                    <img src={attachedImage} alt="Attached" className="h-16 w-16 object-cover rounded-lg border border-[#2b5278]" />
                    <button 
                        onClick={() => setAttachedImage(null)}
                        className="absolute -top-1 -right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <XIcon className="w-3 h-3" />
                    </button>
                </div>
                <span className="text-xs text-[#707579]">Image attached</span>
            </div>
        )}

        <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <button 
                className="p-3 text-[#707579] hover:text-[#8774e1] transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Image"
            >
                <PaperclipIcon className="w-6 h-6" />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />

            <div className="flex-1 bg-[#242f3d] rounded-2xl flex items-center min-h-[48px] border border-transparent focus-within:border-[#2b5278] transition-colors">
                <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message..."
                    className="flex-1 bg-transparent text-white placeholder-[#707579] px-4 py-3 focus:outline-none resize-none max-h-[150px] custom-scrollbar"
                    rows={1}
                />
            </div>

            <button 
                onClick={handleSend}
                disabled={!inputText.trim() && !attachedImage}
                className={`
                    p-3 rounded-full transition-all duration-200 flex items-center justify-center
                    ${(!inputText.trim() && !attachedImage) 
                        ? 'bg-[#242f3d] text-[#707579] cursor-not-allowed' 
                        : 'bg-[#2b5278] text-white hover:bg-[#336291] shadow-lg transform active:scale-95'
                    }
                `}
            >
                <SendIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-[#535b64]">AI can make mistakes. Review generated info.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;