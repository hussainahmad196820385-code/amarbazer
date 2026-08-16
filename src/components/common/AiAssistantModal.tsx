import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { getTranslation } from '../../translations';

export const AiAssistantModal: React.FC = () => {
  const { isAiOpen, setIsAiOpen, language } = useApp();

  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    {
      sender: 'ai',
      text: language === 'bn'
        ? 'আসসালামু আলাইকুম! আমি আমার বাজার এআই সহকারী। বাংলাদেশ ডিজিটাল মার্কেটপ্লেস এ কোন পণ্য খুঁজছেন? যেকোনো প্রশ্ন করতে পারেন (যেমন: ৫০,০০০ টাকার টিভি, জামদানি শাড়ির যত্ন, বা উপহারের পরামর্শ)।'
        : 'Assalamu Alaikum! Welcome to AmarBazar AI Assistant. How can I help you find the best Bangladeshi or international products today?'
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isAiOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await api.askAiAssistant(userMsg, language);
      setMessages(prev => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: language === 'bn' 
            ? 'দুঃখিত, বর্তমানে সংযোগে সমস্যা হচ্ছে। তবে আপনি আমাদের ক্যাটাগরি প্যানেলে প্রচুর ডিসকাউন্ট পণ্য খুঁজে পাবেন!'
            : 'Sorry, I am having trouble connecting right now. Please check our categories for awesome deals!'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 flex flex-col h-[520px] overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {language === 'bn' ? 'আমার বাজার এআই শপিং অ্যাসিস্ট্যান্ট' : 'AmarBazar AI Shopping Assistant'}
              </h3>
              <p className="text-[10px] text-emerald-200">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAiOpen(false)}
            className="p-1 hover:bg-white/10 rounded-full transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/50 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex space-x-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-400 font-medium italic text-[11px] p-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>
                {language === 'bn' ? 'আমার বাজার এআই চিন্তা করছে...' : 'AmarBazar AI is searching products...'}
              </span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex overflow-x-auto space-x-2 text-[11px] scrollbar-none">
          <button
            onClick={() => setInput(language === 'bn' ? 'ঈদের জন্য সেরা পাঞ্জাবি দেখাও' : 'Show top Eid Panjabi')}
            className="px-2.5 py-1 bg-white dark:bg-slate-700 border rounded-full text-slate-600 dark:text-slate-300 shrink-0 hover:border-emerald-500 transition"
          >
            {language === 'bn' ? 'ঈদের পাঞ্জাবি' : 'Eid Panjabi'}
          </button>
          <button
            onClick={() => setInput(language === 'bn' ? 'ওয়ালটন টিভির সাথে স্যামসাং ফোনের তুলনা করো' : 'Compare Walton TV & Samsung Phone')}
            className="px-2.5 py-1 bg-white dark:bg-slate-700 border rounded-full text-slate-600 dark:text-slate-300 shrink-0 hover:border-emerald-500 transition"
          >
            {language === 'bn' ? 'ওয়ালটন টিভি' : 'Walton TV'}
          </button>
          <button
            onClick={() => setInput(language === 'bn' ? 'ঢাকার বাইরে ডেলিভারি খরচ কত?' : 'What is shipping cost outside Dhaka?')}
            className="px-2.5 py-1 bg-white dark:bg-slate-700 border rounded-full text-slate-600 dark:text-slate-300 shrink-0 hover:border-emerald-500 transition"
          >
            {language === 'bn' ? 'ডেলিভারি চার্জ' : 'Shipping Charges'}
          </button>
        </div>

        {/* Input area */}
        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={getTranslation(language, 'aiPlaceholder')}
            className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
