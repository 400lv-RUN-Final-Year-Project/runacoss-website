const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// In-memory chat history store (for demo/dev)
const chatHistories = {};

// POST /api/chatbot
router.post('/', async (req, res) => {
  const { message, userId = 'anonymous', history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // Retrieve or initialize chat history for this user
  if (!chatHistories[userId]) chatHistories[userId] = [];
  // Add previous history and new user message
  let chatHistory = Array.isArray(history) && history.length > 0 ? history : chatHistories[userId];
  chatHistory = [...chatHistory, { role: 'user', content: message }];

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are TechBot, a helpful, friendly assistant for a university tech community. Answer questions about IT, AI, Computer Science, Software Engineering, and help with site navigation. Give code, diagrams, and links where helpful.' },
          ...chatHistory
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });
    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    // Add bot reply to history
    chatHistories[userId] = [...chatHistory, { role: 'assistant', content: reply }];
    res.json({ reply, history: chatHistories[userId] });
  } catch (err) {
    res.status(500).json({ error: 'Chatbot error', details: err.message });
  }
});

module.exports = router; 