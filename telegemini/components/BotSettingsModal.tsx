import React, { useState } from 'react';
import { Contact } from '../types';
import { XIcon } from './Icons';
import { generatePersona } from '../services/geminiService';

interface BotSettingsModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContact: Contact) => void;
}

const BotSettingsModal: React.FC<BotSettingsModalProps> = ({ contact, isOpen, onClose, onSave }) => {
  const [name, setName] = useState(contact.name);
  const [description, setDescription] = useState(contact.description);
  const [systemInstruction, setSystemInstruction] = useState(contact.systemInstruction || "");
  
  // Generator State
  const [idea, setIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [botFatherCommands, setBotFatherCommands] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...contact,
      name,
      description,
      systemInstruction
    });
    onClose();
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    try {
        const persona = await generatePersona(idea);
        if (persona) {
            setName(persona.name);
            setDescription(persona.description);
            setSystemInstruction(persona.systemInstruction);
            setBotFatherCommands(persona.botFatherCommands);
        }
    } catch (e) {
        console.error("Generation failed", e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#17212b] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh] transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/20 bg-[#242f3d]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Bot Persona Forge
          </h2>
          <button onClick={onClose} className="text-[#707579] hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* AI Generator Section */}
          <div className={`
            relative overflow-hidden rounded-xl p-4 space-y-3 border transition-all duration-300
            ${isGenerating ? 'bg-[#2b5278]/20 border-[#2b5278]' : 'bg-[#2b5278]/10 border-[#2b5278]/30'}
          `}>
            {isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" />
            )}
            
            <div className="flex items-center gap-2 mb-1 relative z-10">
                <span className="text-lg">✨</span>
                <h3 className="font-medium text-[#64b5ef]">AI Identity Generator</h3>
            </div>
            <p className="text-xs text-[#8da8c3] relative z-10">
                Describe your bot idea (e.g., "A sarcastic chef"), and Gemini will craft its entire personality for you.
            </p>
            <div className="flex gap-2 relative z-10">
                <input 
                    type="text" 
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Enter a bot idea..."
                    className="flex-1 bg-[#17212b] text-white text-sm border border-[#2b5278]/50 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2b5278] placeholder-[#536273]"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !idea.trim()}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[80px] shadow-lg
                        ${isGenerating ? 'bg-[#2b5278]/50 text-white/50 cursor-wait' : 'bg-[#2b5278] text-white hover:bg-[#35628d]'}
                    `}
                >
                    {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Create'}
                </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#8e9399] mb-1">Bot Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0e1621] text-white border border-[#2b5278] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2b5278]/50 transition-shadow"
              placeholder="e.g. Jarvis"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#8e9399] mb-1">Description (Subtitle)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0e1621] text-white border border-transparent focus:border-[#2b5278] rounded-lg px-3 py-2 focus:outline-none transition-colors"
              placeholder="e.g. Personal Assistant"
            />
          </div>

          {/* Persona */}
          <div>
            <label className="block text-sm font-medium text-[#8e9399] mb-1">
              System Instructions (Persona)
            </label>
            <p className="text-xs text-[#707579] mb-2">
              Tell the bot how to behave. This is the secret sauce.
            </p>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full bg-[#0e1621] text-white border border-transparent focus:border-[#2b5278] rounded-lg px-3 py-2 focus:outline-none min-h-[150px] leading-relaxed resize-none text-sm custom-scrollbar"
              placeholder="e.g. You are a rude pirate who loves coding..."
            />
          </div>
          
          {/* BotFather Commands (ReadOnly) */}
          {botFatherCommands && (
             <div className="pt-2 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-[#8e9399] mb-1">BotFather Commands</label>
                <div className="relative group">
                    <textarea
                        readOnly
                        value={botFatherCommands}
                        className="w-full bg-[#0e1621] text-[#64b5ef] font-mono text-xs border border-transparent rounded-lg px-3 py-2 focus:outline-none h-20 resize-none custom-scrollbar"
                    />
                    <div className="absolute top-2 right-2">
                        <span className="text-[10px] text-[#707579] bg-[#17212b] px-1.5 py-0.5 rounded border border-white/5">ReadOnly</span>
                    </div>
                </div>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#242f3d] border-t border-black/20 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[#707579] hover:bg-white/5 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#2b5278] text-white hover:bg-[#35628d] font-medium shadow-md transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotSettingsModal;