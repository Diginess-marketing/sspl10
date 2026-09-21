import fs from 'fs';
import path from 'path';
import axios from 'axios';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_TOKENS = 300;
const TEMPERATURE = 0.3;

const FALLBACK_REPLY =
  "I'm currently experiencing high traffic. Please try again later or contact our support team on WhatsApp at 8807775960.";

const knowledgePath = path.join(env.rootDir, 'data', 'knowledge.json');

/** Load the FAQ knowledge base once at boot. */
function loadKnowledgeBase() {
  try {
    if (!fs.existsSync(knowledgePath)) {
      logger.warn('Knowledge base file not found at:', knowledgePath);
      return { faqs: [] };
    }
    return JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
  } catch (err) {
    logger.error('Error loading knowledge base:', err);
    return { faqs: [] };
  }
}

const knowledgeBase = loadKnowledgeBase();

const systemPrompt = `
You are the AI Customer Care Agent for SSPL T10 (ssplt10.co.in), a professional T-10 tennis ball cricket league in India.
Your goal is to assist players, selectors, and fans with their queries in a helpful, professional, and concise manner.

Use the following Knowledge Base to answer questions. If the answer is not in the knowledge base, politely say you don't know and ask them to contact support at +91-8807775960 or customercare@ssplt10.co.in.

Knowledge Base:
${JSON.stringify(knowledgeBase.faqs, null, 2)}

Key Information:
- Registration Fee: ₹699 + 18% GST.
- Age: 12+ years (No upper age limit).
- Website: www.ssplt10.co.in
- WhatsApp Support: 8807775960

Key People (Management):
- Chairman: Nawabzada Mohammed Asif Ali (Dewan to the Prince of Arcot).
- Star Patron: Mr. Ravi Mohan (Indian Actor & Passionate Cricketer).
- Managing Director: Loganathan Thangapazham Anand (L.T. Anand). He brings decades of expertise in finance, governance, and strategy.
- Strategic Advisor: Dilip Narayanan.
- Advisors: Mr. C.P. Rao (Former Principal Chief Commissioner, GST & Customs), Mr. Puhazhendi Kaliyappan (Former Quality Leader, GE Healthcare), Adv Sheela (Legal Advisor).

About SSPL:
- Vision: To elevate the potential of street cricket to form the next generation of game-changers. Officially standardize gully cricket.
- Mission: Scouting street champs. Launching future stars.
- Format: T-10 tennis ball cricket. Season 1 has 12 teams, 25 players each.
- Finals: Sharjah Stadium (First ever South Indian tennis ball league to play in an international stadium).
- Ball: 'Sixit Light Tennis Ball'.

Selection Process:
1. Registration -> 2. Trials (Level 1-3 Nets, Level 4 AI) -> 3. Auction -> 4. League Matches.

Tone:
- Professional, encouraging, and clear.
- Be concise. Do not write long paragraphs unless necessary.
- You can answer in English or Hinglish if the user asks in Hindi/Hinglish.

CRITICAL INSTRUCTION ON TRIAL RESULTS:
If the user asks for their trial results, asks to check their results, or provides their number for results, DO NOT provide any results or ask for their details. Instead, you MUST ONLY reply with the link: https://ssplt10.co.in/trial-results
`;

/**
 * Answer a support question via Sarvam's OpenAI-compatible chat endpoint.
 * Never throws — on any failure it returns a support fallback message so the
 * chat surface always has something to show.
 *
 * @param {string} userMessage
 * @param {Array<{role:string, content:string}>} history Prior turns.
 * @returns {Promise<string>}
 */
export async function generateResponse(userMessage, history = []) {
  if (!env.sarvam.apiKey) {
    logger.error('SARVAM_API_KEY is not configured; cannot generate a reply.');
    return FALLBACK_REPLY;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await axios.post(
      env.sarvam.url,
      {
        model: env.sarvam.model,
        messages,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      },
      {
        headers: {
          'api-subscription-key': env.sarvam.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (text) return text;

    logger.error('Unexpected Sarvam response:', JSON.stringify(response.data));
    return "I couldn't process your request. Please contact our support team on WhatsApp at 8807775960.";
  } catch (error) {
    logger.error('Error generating AI response:', error.response?.data || error.message);
    return FALLBACK_REPLY;
  }
}
