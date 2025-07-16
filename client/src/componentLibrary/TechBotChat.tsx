import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SAMPLE_PROMPTS = [
  'What is the difference between AI and Machine Learning?',
  'Show me a Python example for bubble sort.',
  'Explain the OSI model in networking.',
  'How do I navigate this site?',
  'What is a neural network?'
];

// Get or generate a persistent userId for the session
function getUserId() {
  let id = localStorage.getItem('techbot_userId');
  if (!id || typeof id !== 'string') {
    id = uuidv4();
    localStorage.setItem('techbot_userId', id);
  }
  return id;
}

const TechBotChat: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "👋 Hi, I'm TechBot! Ask me anything about IT, AI, Computer Science, or site navigation. Try a sample prompt below!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Convert local messages to OpenAI format
  const getHistoryForApi = () => {
    return messages.slice(1).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(msgs => [...msgs, { sender: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId,
          history: getHistoryForApi()
        })
      });
      const data = await res.json();
      // Use backend's returned history for perfect sync
      if (data.history && Array.isArray(data.history)) {
        setMessages([
          { sender: 'bot', text: "👋 Hi, I'm TechBot! Ask me anything about IT, AI, Computer Science, or site navigation. Try a sample prompt below!" },
          ...data.history.map((msg: any) => ({
            sender: msg.role === 'user' ? 'user' : 'bot',
            text: msg.content
          }))
        ]);
      } else {
        setMessages(msgs => [...msgs, { sender: 'bot', text: data.reply }]);
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: 'Sorry, I had trouble answering that.' }]);
    }
    setLoading(false);
  };

  const handlePrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs md:max-w-md bg-white rounded-xl shadow-lg flex flex-col border border-gray-200">
      <div className="bg-primary text-white rounded-t-xl px-4 py-3 flex items-center gap-2">
        <span className="font-bold text-lg">TechBot</span>
        <span className="text-xs bg-secondary text-white px-2 py-1 rounded">AI Assistant</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 h-72 md:h-96 text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-line ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}
              style={{ wordBreak: 'break-word' }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            className="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs hover:bg-primary hover:text-white transition-colors"
            onClick={() => handlePrompt(prompt)}
            disabled={loading}
          >
            {prompt}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 pb-4">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default TechBotChat; 