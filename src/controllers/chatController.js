const express = require('express');
const router = express.Router();
// const fetch = require('node-fetch');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

const chat = async (req, res) => {
    const { message } = req.body;
    const prompt = `
    You are a helpful AI assistant.

    Rules:
    1. Provide only the final answer. It is important that you do not include any explanation on the steps below.
    2. Do not show the intermediate steps information.
    3. Give a short and concise answer to the user's question if they ask for a specific answer like definition, what, who, where, when, how, etc.

    Steps:
    1. Decide if the answer should be a brief sentence or a list of suggestions.
    2. If it is a list of suggestions, first, write a brief and natural introduction based on the original query.
    3. Followed by a list of suggestions, each suggestion should be split by two newlines.`

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    { role: 'system', content: prompt },
                    { role: 'user', content: message }
                ]
            })
        });

        const data = await response.json();

        const content = data.choices?.[0]?.message?.content;

        res.status(200).json({
            reply: content || "No response from AI",
            search_results: data.search_results || [],
        });
    } catch (err) {
        console.error('Perplexity API error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { chat };
