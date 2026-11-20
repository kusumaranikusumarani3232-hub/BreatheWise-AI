import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Cpu, 
  Trash2 
} from 'lucide-react';
import { sendAIChat } from '../services/api';

const QUICK_PROMPTS = [
  "Is it safe to go outside today?",
  "Can my children play outdoors?",
  "What precautions should elderly family members take?",
  "Is it safe to exercise outside?",
  "How can I improve indoor air quality?",
  "What is a Corsi-Rosenthal DIY air purifier?"
];

export default function AIAssistantPage({ aqiData, userProfile }) {
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: `👋 **Welcome to BreatheWise AI!** I am your personalized atmospheric safety assistant.\n\n` +
        `I am monitoring live conditions in **${aqiData?.city || 'your area'}** ` +
        `(Current AQI: **${aqiData?.aqi || '—'}**, Category: **${aqiData?.category || 'Moderate'}**).\n\n` +
        `Ask me anything about daily smog protection, outdoor workout windows, children's school safety, or affordable indoor air filtration.`,
      mode: "system",
      model: "breathewise-core"
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: "user", content: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const aqiContext = {
        city: aqiData?.city,
        aqi: aqiData?.aqi,
        category: aqiData?.category,
        pm2_5: aqiData?.pm2_5,
        dominant_pollutant: aqiData?.dominant_pollutant,
        temperature: aqiData?.temperature,
        humidity: aqiData?.humidity
      };

      const res = await sendAIChat(
        query.trim(),
        messages.filter(m => m.role !== 'system'),
        aqiContext,
        userProfile
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          mode: res.mode,
          model: res.model,
          suggestions: res.follow_up_suggestions
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an issue processing your request. Please check your network connection and try again.",
          mode: "error"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        content: `Conversation reset. Current context: **${aqiData?.city || 'Your Area'}** (AQI: **${aqiData?.aqi || '—'}**). How can I assist you with your air quality today?`,
        mode: "system"
      }
    ]);
  }, [aqiData?.city, aqiData?.aqi]);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-white">BreatheWise AI Assistant</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-900 text-teal-300 border border-teal-700">
                Context: {aqiData?.city || 'Active'} (AQI {aqiData?.aqi})
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized guidance powered by Groq LLMs & Atmospheric Rule Engines
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear conversation"
          className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                isUser 
                  ? 'bg-teal-700 text-white rounded-br-xs shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
              }`}>
                {/* Markdown format render */}
                <div className="space-y-2 whitespace-pre-line prose prose-sm max-w-none prose-slate">
                  {msg.content}
                </div>

                {/* Engine Mode Pill */}
                {!isUser && msg.mode && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-teal-600" />
                      <span>{msg.mode === 'groq' ? `Groq API (${msg.model})` : 'Expert Rule Engine (Fallback Mode)'}</span>
                    </span>
                    <span className="italic">Non-clinical health guidance</span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-4 shadow-xs flex items-center gap-2 text-slate-500 text-xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
              <span>Analyzing atmospheric inversion and personal safety parameters...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 sm:px-4 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs py-2">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 hidden sm:inline">Suggested:</span>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 border border-slate-200 rounded-lg text-xs transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about outdoor safety, school precautions, indoor air filters..."
            className="flex-1 px-4 py-2.5 text-sm bg-slate-100 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 mt-2">
          BreatheWise AI is an informational tool. It does not provide medical diagnoses or guaranteed protection. Always consult a physician for respiratory conditions.
        </p>
      </div>
    </div>
  );
}
