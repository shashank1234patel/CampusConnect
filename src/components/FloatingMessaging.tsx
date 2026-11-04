import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Edit, 
  Search, 
  Send,
  MessageSquare
} from 'lucide-react';

export const FloatingMessaging: React.FC = () => {
  const { currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const conversations = [
    {
      id: 'guruprasad',
      name: 'Guruprasad Limkar',
      headline: 'Student at Intellipaat School Of Technology',
      avatar: 'GL',
      lastMessage: 'Thanks Shashank! Are you attending HackNova 2026 this weekend?',
      time: '1h',
      unread: true
    },
    {
      id: 'sarah',
      name: 'Sarah Jenkins',
      headline: 'ACM Student Chapter Lead',
      avatar: 'SJ',
      lastMessage: 'We have reserved your mentor pass for the hackathon.',
      time: '1d',
      unread: false
    },
    {
      id: 'admin',
      name: 'Prof. Vikram Sharma',
      headline: 'Dean of Student Affairs',
      avatar: 'VS',
      lastMessage: 'Your campus event proposal has been officially approved.',
      time: '2d',
      unread: false
    }
  ];

  return (
    <div className="fixed bottom-0 right-4 z-40 w-72 sm:w-80 shadow-2xl rounded-t-xl border border-slate-200/90 bg-white overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
            {currentUser?.name.charAt(0) || 'S'}
          </div>
          <span className="font-bold text-slate-800 text-xs">Messaging</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active on Campus" />
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1 hover:text-slate-800 rounded"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1 hover:text-slate-800 rounded"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-slate-800 rounded">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {isOpen && (
        <div className="h-80 flex flex-col bg-slate-50">
          {/* Search bar inside messaging */}
          <div className="p-2 bg-white border-b border-slate-200">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-slate-500 text-xs">
              <Search className="w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search messages"
                className="bg-transparent focus:outline-none text-xs w-full text-slate-800"
              />
            </div>
          </div>

          {/* Conversations list or active chat */}
          {activeChat ? (
            <div className="flex-1 flex flex-col justify-between p-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-xs">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="text-xs font-semibold text-[#0a66c2] hover:underline"
                >
                  &larr; Back
                </button>
                <span className="font-bold text-slate-800">
                  {conversations.find(c => c.id === activeChat)?.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 shadow-2xs max-w-[85%]">
                  {conversations.find(c => c.id === activeChat)?.lastMessage}
                </div>
                {messageInput && (
                  <div className="bg-indigo-600 text-white p-2 rounded-lg text-xs ml-auto max-w-[85%]">
                    {messageInput}
                  </div>
                )}
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessageInput('');
                }}
                className="flex gap-1.5 pt-1 border-t border-slate-200"
              >
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-[#0a66c2]"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-[#0a66c2] text-white rounded hover:bg-[#004182]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveChat(c.id)}
                  className="p-2.5 flex items-start gap-2.5 hover:bg-slate-100/80 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {c.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                      <span className="text-[10px] text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{c.headline}</p>
                    <p className="text-xs text-slate-700 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  {c.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#0a66c2] shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
