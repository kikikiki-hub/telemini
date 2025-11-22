import React from 'react';
import { Message, MessageSender } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.User;

  // Helper to render text with simple markdown-like behavior
  const renderText = (text: string) => {
    // Detect explicit image separation if present (fallback if App doesn't parse it)
    const parts = text.split('||IMAGE_URL||');
    const displayContent = parts[0].trim();
    
    return (
      <div className="whitespace-pre-wrap break-words">
        {displayContent}
        {message.groundingSources && message.groundingSources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-xs font-medium opacity-70 mb-1">Sources:</p>
            <ul className="space-y-1">
              {message.groundingSources.map((source, idx) => (
                <li key={idx}>
                  <a 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs underline opacity-80 hover:opacity-100 truncate block"
                  >
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative
          ${isUser 
            ? 'bg-[#2b5278] text-white rounded-br-sm' 
            : 'bg-[#182533] text-[#e2e8f0] rounded-bl-sm'
          }
        `}
      >
        {message.imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden bg-black/20">
                <img src={message.imageUrl} alt="Attachment" className="max-w-full max-h-80 object-contain" />
            </div>
        )}
        
        {renderText(message.text)}
        
        <div className={`text-[11px] mt-1 text-right ${isUser ? 'text-[#8da8c3]' : 'text-[#6c7883]'}`}>
          {message.isStreaming ? (
            <span className="inline-block w-2 h-2 bg-[#6c7883] rounded-full animate-pulse"/>
          ) : (
            message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
