import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Brain, Send, Mic, MicOff, Copy, Check, Volume2, Sparkles, MessageSquare } from "lucide-react";

const Chat = ({ isFloating = false }) => {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [responses]);

  // Focus textarea on mount if not floating
  useEffect(() => {
    if (!isFloating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFloating]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [message]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    const userMessage = message.trim();
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add user message to chat immediately
    setResponses(prev => [...prev, { type: "user", content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const res = await axios.post(
        "https://mental-health-r9h9.onrender.com/api/chat-with-grok",
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let aiContent = typeof res.data.response === 'string' ? res.data.response : res.data.response.response;

      // Clean up if it contains the JSON dump at the end
      if (typeof aiContent === 'string') {
        const jsonMatch = aiContent.match(/\{\s*"response"\s*:/);
        if (jsonMatch && jsonMatch.index !== undefined) {
          aiContent = aiContent.substring(0, jsonMatch.index).trim();
        }
      }

      setResponses(prev => [
        ...prev,
        {
          type: "ai",
          content: aiContent,
          distressScore: res.data.distressScore,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setResponses(prev => [
        ...prev,
        {
          type: "error",
          content: "I'm having trouble connecting. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      // Refocus textarea after response
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);

    if (!isListening) {
      setTimeout(() => {
        setMessage("I'm feeling a bit anxious about my presentation tomorrow.");
        setIsListening(false);
      }, 2000);
    }
  };

  const speakMessage = text => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Get distress level info
  const getDistressInfo = score => {
    if (score < 30) return { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Low" };
    if (score < 70) return { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Moderate" };
    return { color: "bg-rose-100 text-rose-700 border-rose-200", label: "High" };
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col bg-gradient-to-b from-slate-50 to-white ${isFloating ? "h-[500px]" : "h-[calc(100vh-80px)] min-h-[600px]"}`}>
      
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">AI Companion</h2>
            <p className="text-xs text-slate-500">Always here to listen and support you</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {responses.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-200/50">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">How are you feeling today?</h3>
              <p className="text-slate-500 max-w-md mb-8">
                I'm your AI companion, here to listen, support, and help you navigate your emotions. Share what's on your mind.
              </p>
              
              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {[
                  "I'm feeling anxious",
                  "Help me relax",
                  "I need someone to talk to",
                  "Share coping strategies"
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(suggestion)}
                    className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all hover:shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            responses.map((item, index) => (
              <div
                key={index}
                className={`flex gap-3 ${item.type === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {item.type === "user" ? (
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                      You
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${item.type === "user" ? "items-end" : "items-start"} max-w-[80%]`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      item.type === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-md shadow-md shadow-blue-200/30"
                        : item.type === "error"
                        ? "bg-rose-50 text-rose-700 border border-rose-200 rounded-tl-md"
                        : "bg-white text-slate-700 border border-slate-200/60 rounded-tl-md shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{item.content}</p>

                    {/* Distress Score Badge */}
                    {item.distressScore !== undefined && (
                      <div className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-medium border ${getDistressInfo(item.distressScore).color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        Distress Level: {getDistressInfo(item.distressScore).label} ({item.distressScore})
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for AI messages */}
                  {item.type === "ai" && (
                    <div className="flex items-center gap-1 mt-1.5 px-1">
                      <button
                        onClick={() => copyToClipboard(item.content, index)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => speakMessage(item.content)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        title="Read aloud"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Timestamp for user messages */}
                  {item.type === "user" && (
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {formatTime(item.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-slate-200/60 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-xs text-slate-400 ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
                  isListening
                    ? "bg-blue-500 text-white shadow-md animate-pulse"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 py-2.5 px-1 max-h-[150px] min-h-[44px]"
                rows={1}
                disabled={isLoading || isListening}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!message.trim() || isLoading || isListening}
                className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
                  !message.trim() || isLoading || isListening
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
                }`}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Helper Text */}
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Your conversations are private and secure. Press Enter to send.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
