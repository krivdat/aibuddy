import { error, fail } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '$env/static/private';
import all_personas from '$lib/server/personas.json';
import {
  getChatHistory,
  saveChatHistory,
  createChatId
} from '$lib/server/db.js';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Helper to get or create chat ID
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @param {string} personaId
 */
function getOrCreateChatId(cookies, personaId) {
  let chatId = cookies.get(`chatid_${personaId}`);
  if (!chatId) {
    chatId = createChatId();
    cookies.set(`chatid_${personaId}`, chatId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax'
    });
  }
  return chatId;
}

/**
 * Helper to create system instruction
 * @param {object} persona
 */
function createSystemInstruction(persona) {
  return (
    persona.system_prompt +
    '\nKeep your responses concise and to the point, like in a real-time chat. Avoid long monologues.\nIf the user speaks to you in a language other than English, you MUST respond in that same language, while still maintaining your persona. In the end you eventually answer the question'
  );
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, cookies }) {
  const persona = all_personas.find((p) => p.id === params.personaId);

  if (!persona) {
    console.error('Persona not found:', params.personaId);
    throw error(404, 'Persona not found');
  }

  const chatId = getOrCreateChatId(cookies, params.personaId);
  let messages = getChatHistory(chatId);

  // If history is empty, generate an initial greeting
  if (messages.length === 0 && persona.initial_greeting_prompt) {
    try {
      const systemInstruction = createSystemInstruction(persona);
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        },
        history: []
      });

      const response = await chat.sendMessage({
        message: persona.initial_greeting_prompt
      });

      const greeting = response.text;

      if (greeting) {
        const initialMessage = { role: 'model', content: greeting };
        messages.push(initialMessage);
        saveChatHistory(chatId, params.personaId, messages);
      }
    } catch (err) {
      console.error('Failed to generate initial greeting:', err);
      // Fallback: Just start with empty chat if generation fails
    }
  }

  return {
    persona: {
      id: persona.id,
      name: persona.name,
      avatar: persona.avatar
    },
    messages
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  send: async ({ request, params, cookies }) => {
    try {
      const formData = await request.formData();
      const userInput = formData.get('userInput');

      if (!userInput || typeof userInput !== 'string') {
        return fail(400, { error: 'Invalid user input.' });
      }

      const persona = all_personas.find((p) => p.id === params.personaId);
      if (!persona) {
        return fail(404, { error: 'Persona not found.' });
      }

      const chatId = getOrCreateChatId(cookies, params.personaId);
      const messages = getChatHistory(chatId);

      // Reconstruct history for API
      // API expects { role: 'user' | 'model', parts: [{ text: string }] }
      let apiHistoryFormatted = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // If history starts with model (greeting), prepend the prompt that generated it
      if (
        apiHistoryFormatted.length > 0 &&
        apiHistoryFormatted[0].role === 'model'
      ) {
        const prompt = persona.initial_greeting_prompt || 'Hello';
        apiHistoryFormatted.unshift({
          role: 'user',
          parts: [{ text: prompt }]
        });
      }

      const systemInstruction = createSystemInstruction(persona);

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        },
        history: apiHistoryFormatted
      });

      const response = await chat.sendMessage({
        message: userInput
      });
      const answerText = response.text;

      const userMsg = { role: 'user', content: userInput };
      const modelMsg = { role: 'model', content: answerText };

      const newMessages = [...messages, userMsg, modelMsg];
      saveChatHistory(chatId, params.personaId, newMessages);

      return { success: true, answer: modelMsg };
    } catch (err) {
      console.error('Chat action error:', err);
      return fail(500, { error: 'Internal server error.' });
    }
  },
  clear: async ({ params, cookies }) => {
    try {
      const chatId = getOrCreateChatId(cookies, params.personaId);
      saveChatHistory(chatId, params.personaId, []);
      return {
        success: true,
        messages: []
      };
    } catch (err) {
      console.error('Clear chat error:', err);
      return fail(500, { error: 'Failed to clear chat.' });
    }
  }
};
