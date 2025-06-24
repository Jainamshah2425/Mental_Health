import { useState, useRef, useEffect } from "react";
import axios from "axios";


const Chat = ({ isFloating = false }) => {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [responses]);

  // Focus input on mount if not floating
  useEffect(() => {
    if (!isFloating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFloating]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      alert("Please login first");
      return;
    }

    // Add user message to chat immediately
    setResponses([...responses, { type: "user", content: message }]);
    setIsLoading(true);

    try {
      const res = await axios.post(
        "https://mental-health-r9h9.onrender.com/api/chat-with-grok",
        { message }, // Send the message to the updated endpoint
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResponses(prev => [
        ...prev,
        {
          type: "ai",
          content: typeof res.data.response === 'string' ? res.data.response : res.data.response.response,

          distressScore: res.data.distressScore,
        },
      ]);
      setMessage("");
    } catch (error) {
      setResponses(prev => [
        ...prev,
        {
          type: "error",
          content: "I'm having trouble connecting. Please try again in a moment.",
        },
      ]);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);

    if (!isListening) {
      // Simulate voice recognition after 2 seconds
      setTimeout(() => {
        setMessage("I'm feeling a bit anxious about my presentation tomorrow.");
        setIsListening(false);
      }, 2000);
    }
  };

  const speakMessage = text => {
    // Placeholder for Web Speech API
    alert(`Speaking: ${text}`);
  };

  // Get distress level color
  const getDistressColor = score => {
    if (score < 30) return "bg-green-100 text-green-800"; // Adjusted thresholds for better granularity
    if (score < 70) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-none overflow-hidden ${
        isFloating ? "h-[500px]" : "h-[600px]"
      }`}
    >
      <div className="p-4 border-b flex items-center">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 text-sm font-bold">
          AI
        </div>
        <h2 className="text-xl font-medium text-blue-600">AI Companion</h2>
      </div>

      <div className="h-[calc(100%-130px)] overflow-y-auto p-4 space-y-4">
        {responses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                AI
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">How are you feeling today?</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              I'm here to listen and provide support. Share your thoughts or ask for coping
              strategies.
            </p>
          </div>
        ) : (
          responses.map((item, index) => (
            <div
              key={index}
              className={`flex ${item.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {item.type !== "user" && (
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-sm font-bold">
                  AI
                </div>
              )}

              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  item.type === "user"
                    ? "bg-blue-600 text-white"
                    : item.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100"
                }`}
              >
                <p>{item.content}</p>

                {item.distressScore !== undefined && (
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded-full ${getDistressColor(item.distressScore)}`}
                    >
                      Distress: {item.distressScore}
                    </span>

                    <button
                      className="p-1 hover:bg-gray-200 rounded-full"
                      onClick={() => speakMessage(item.content)}
                      title="Read aloud"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        ></path>
                      </svg>
                      <span className="sr-only">Read aloud</span>
                    </button>
                  </div>
                )}
              </div>

              {item.type === "user" && (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1 flex-shrink-0 text-sm font-bold">
                  You
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-sm font-bold">
              AI
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div
                  className="h-2 w-2 bg-blue-600/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="h-2 w-2 bg-blue-600/60 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="h-2 w-2 bg-blue-600/60 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <button
            type="button"
            className={`p-2 rounded-full ${
              isListening
                ? "bg-blue-600 text-white animate-pulse"
                : "border border-gray-300 text-gray-500"
            }`}
            onClick={toggleListening}
            title="Voice input"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              ></path>
            </svg>
            <span className="sr-only">Voice input</span>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="How are you feeling today?"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isListening}
          />

          <button
            type="submit"
            className={`p-2 rounded-full ${
              !message.trim() || isLoading || isListening
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white"
            }`}
            disabled={!message.trim() || isLoading || isListening}
          >
            {isLoading ? (
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            )}
            <span className="sr-only">Send message</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
