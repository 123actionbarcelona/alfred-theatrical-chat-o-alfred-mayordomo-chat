// api/alfred.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    res.status(200).json({ response: reply || 'Disculpe, no he podido formular respuesta.' });
  } catch (error) {
    console.error('🔴 Error en la llamada a OpenAI:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
