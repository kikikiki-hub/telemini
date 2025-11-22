import React from 'react';
import { Contact } from '../types';
import { MenuIcon, SearchIcon } from './Icons';

interface SidebarProps {
  contacts: Contact[];
  activeContactId: string;
  onSelectContact: (id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  contacts, 
  activeContactId, 
  onSelectContact, 
  isOpen,
  toggleSidebar
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-30 w-80 bg-[#17212b] border-r border-black/20 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
      `}>
        {/* Header */}
        <div className="p-3 flex items-center gap-4 shrink-0">
          <button className="text-[#707579] hover:text-white transition-colors p-2">
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-[#242f3d] text-[#f5f5f5] placeholder-[#707579] text-sm rounded-full py-2 pl-10 pr-4 focus:outline-none focus:bg-[#2b5278]/20 border border-transparent focus:border-[#2b5278]"
            />
            <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-[#707579]" />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => {
                onSelectContact(contact.id);
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={`
                flex items-center gap-3 p-2 mx-2 rounded-lg cursor-pointer transition-colors select-none
                ${activeContactId === contact.id ? 'bg-[#2b5278]' : 'hover:bg-[#202b36]'}
              `}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0 overflow-hidden ${contact.color}`}>
                {contact.avatarUrl ? (
                    <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover" />
                ) : (
                    contact.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-[#f5f5f5] truncate">{contact.name}</h3>
                  <span className={`text-xs ${activeContactId === contact.id ? 'text-[#e5e5e5]' : 'text-[#6c7883]'}`}>
                    {contact.lastMessageTime}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <p className={`text-sm truncate pr-2 ${activeContactId === contact.id ? 'text-[#dbeafe]' : 'text-[#707579]'}`}>
                    {contact.lastMessage}
                  </p>
                  {contact.unreadCount && contact.unreadCount > 0 && (
                    <span className={`
                      min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center
                      ${activeContactId === contact.id ? 'bg-white text-[#2b5278]' : 'bg-[#3e546a] text-white'}
                    `}>
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
