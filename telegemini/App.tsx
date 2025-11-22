import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import BotSettingsModal from './components/BotSettingsModal';
import { CONTACTS, MOCK_INITIAL_MESSAGES } from './constants';
import { ChatSession, Message, MessageSender, Contact } from './types';
import { streamChatResponse } from './services/geminiService';

// Helper to load contacts from storage or fall back to defaults
const loadContacts = (): Contact[] => {
  try {
    const saved = localStorage.getItem('telegemini_contacts');
    return saved ? JSON.parse(saved) : CONTACTS;
  } catch (e) {
    console.error("Failed to load contacts", e);
    return CONTACTS;
  }
};

const App: React.FC = () => {
  // 1. Manage Contacts State (persisted)
  const [contacts, setContacts] = useState<Contact[]>(loadContacts);

  // 2. Initialize Chats based on loaded contacts
  const [chats, setChats] = useState<Record<string, ChatSession>>(() => {
    const initialContacts = loadContacts();
    const initial: Record<string, ChatSession> = {};
    initialContacts.forEach(c => {
      initial[c.id] = {
        contactId: c.id,
        messages: [{
          id: `init-${c.id}`,
          sender: MessageSender.Bot,
          text: c.lastMessage || MOCK_INITIAL_MESSAGES[c.id] || "Hello!",
          timestamp: new Date()
        }]
      };
    });
    return initial;
  });

  const [activeContactId, setActiveContactId] = useState<string>(contacts[0]?.id || CONTACTS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];
  const currentChat = chats[activeContactId] || { contactId: activeContactId, messages: [] };

  // Save contacts to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('telegemini_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const handleSendMessage = useCallback(async (text: string, image?: string) => {
    const currentContact = contacts.find(c => c.id === activeContactId);
    if (!currentContact) return;

    // CLIENT SIDE COMMANDS
    if (text.trim().toLowerCase() === '/clear') {
        setChats(prev => ({
            ...prev,
            [activeContactId]: {
                contactId: activeContactId,
                messages: [{
                    id: Date.now().toString(),
                    sender: MessageSender.Bot,
                    text: "🧹 **Chat cleared.**",
                    timestamp: new Date()
                }]
            }
        }));
        return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: MessageSender.User,
      text,
      imageUrl: image,
      timestamp: new Date()
    };

    // 1. Add User Message
    setChats(prev => ({
      ...prev,
      [activeContactId]: {
        ...prev[activeContactId],
        messages: [...prev[activeContactId].messages, newMessage]
      }
    }));

    // 2. Add Placeholder Bot Message
    const botMsgId = (Date.now() + 1).toString();
    const botPlaceholder: Message = {
      id: botMsgId,
      sender: MessageSender.Bot,
      text: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setChats(prev => ({
      ...prev,
      [activeContactId]: {
        ...prev[activeContactId],
        messages: [...prev[activeContactId].messages, botPlaceholder]
      }
    }));

    // 3. Call Service with Dynamic System Instruction from State
    const history = chats[activeContactId].messages;
    
    await streamChatResponse(
      history,
      text,
      currentContact.type,
      currentContact.systemInstruction || "You are a helpful assistant.",
      (chunk) => {
        // Update streaming text
        setChats(prev => {
           const msgs = [...prev[activeContactId].messages];
           const lastMsg = msgs[msgs.length - 1];
           if (lastMsg.id === botMsgId) {
             lastMsg.text = chunk;
           }
           return {
             ...prev,
             [activeContactId]: { ...prev[activeContactId], messages: msgs }
           };
        });
      },
      (fullText, groundingSources) => {
        // Finalize message
        setChats(prev => {
           const msgs = [...prev[activeContactId].messages];
           const lastMsgIndex = msgs.findIndex(m => m.id === botMsgId);
           
           if (lastMsgIndex !== -1) {
             let finalText = fullText;
             let imageUrl: string | undefined = undefined;

             if (fullText.includes('||IMAGE_URL||')) {
                 const parts = fullText.split('||IMAGE_URL||');
                 finalText = parts[0];
                 imageUrl = parts[1];
             }

             msgs[lastMsgIndex] = {
               ...msgs[lastMsgIndex],
               text: finalText,
               imageUrl: imageUrl,
               isStreaming: false,
               groundingSources: groundingSources
             };
           }
           
           return {
             ...prev,
             [activeContactId]: { ...prev[activeContactId], messages: msgs }
           };
        });
      },
      image
    );

  }, [activeContactId, contacts, chats]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f172a] text-white font-sans">
        <Sidebar 
            contacts={contacts}
            activeContactId={activeContactId}
            onSelectContact={(id) => {
                setActiveContactId(id);
                setSidebarOpen(false);
            }}
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col min-w-0 relative z-0">
            <ChatWindow 
                activeContact={activeContact}
                messages={currentChat.messages}
                onSendMessage={handleSendMessage}
                onBack={() => setSidebarOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />
        </div>

        <BotSettingsModal 
            contact={activeContact}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onSave={handleUpdateContact}
        />
    </div>
  );
};

export default App;