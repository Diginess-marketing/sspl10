const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const SYSTEM_PROMPT = `You are a natural language to database query translator.
Translate the user's natural language query into a structured JSON query object for a Supabase JS client.
The database schema for the main table 'player_registrations' includes:
id, full_name, email, phone, city, state, position, preferred_trials, school_name, status, payment_status, payment_amount, created_at, gender, dob, parent_name, razorpay_order_id, razorpay_payment_id

Return ONLY valid JSON that matches this structure:
{
  "table": "player_registrations",
  "select": "comma separated list of columns or *",
  "filters": [
    { "column": "string", "operator": "eq|ilike|in|gt|lt|gte|lte", "value": "string or array" }
  ],
  "order": { "column": "string", "ascending": boolean },
  "limit": number
}

Example: "show me the list of successful registrations"
{
  "table": "player_registrations",
  "select": "*",
  "filters": [
    { "column": "payment_status", "operator": "in", "value": ["captured", "paid", "success"] }
  ],
  "order": { "column": "created_at", "ascending": false },
  "limit": 100
}

If the user asks for a count, just select the columns anyway (we will show the records in a table).
Ensure 'ilike' uses % wildcards in the value (e.g. "%Chennai%").
Do not output markdown, just output the JSON object directly.
`;

/** Strip markdown code fences the model sometimes emits despite instructions. */
const stripCodeFences = (text) => text.replace(/```json/g, '').replace(/```/g, '').trim();

/**
 * Translate a natural-language question into a structured query descriptor.
 *
 * @param {string} question
 * @returns {Promise<Object>} Untrusted query descriptor — validate before use.
 */
async function translateToQuery(question) {
  if (!env.gemini.apiKey) {
    throw ApiError.internal('Gemini API Key is not configured on the server');
  }

  const genAI = new GoogleGenerativeAI(env.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: env.gemini.model });

  const result = await model.generateContent(`${SYSTEM_PROMPT}\nUser Query: ${question}`);
  const responseText = await result.response.text();

  try {
    return JSON.parse(stripCodeFences(responseText));
  } catch (err) {
    logger.error('Failed to parse Gemini response:', responseText);
    throw ApiError.internal('Failed to parse AI response into query object.');
  }
}

module.exports = { translateToQuery, SYSTEM_PROMPT };
