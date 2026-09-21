const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handleQuery = async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ success: false, error: "Query is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: "Gemini API Key is not configured on the server" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `You are a natural language to database query translator.
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

        const result = await model.generateContent(systemPrompt + "\nUser Query: " + query);
        const responseText = await result.response.text();
        
        let queryObj;
        try {
            // Clean up possible markdown code blocks if the AI still outputs them
            const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            queryObj = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
            return res.status(500).json({ success: false, error: "Failed to parse AI response into query object." });
        }

        // Build Supabase Query
        if (!queryObj.table) {
            queryObj.table = 'player_registrations';
        }
        if (!queryObj.select) {
            queryObj.select = '*';
        }

        let sbQuery = supabase.from(queryObj.table).select(queryObj.select);

        if (queryObj.filters && Array.isArray(queryObj.filters)) {
            queryObj.filters.forEach(f => {
                if (f.operator === 'eq') sbQuery = sbQuery.eq(f.column, f.value);
                else if (f.operator === 'ilike') sbQuery = sbQuery.ilike(f.column, f.value);
                else if (f.operator === 'in') sbQuery = sbQuery.in(f.column, f.value);
                else if (f.operator === 'gt') sbQuery = sbQuery.gt(f.column, f.value);
                else if (f.operator === 'lt') sbQuery = sbQuery.lt(f.column, f.value);
                else if (f.operator === 'gte') sbQuery = sbQuery.gte(f.column, f.value);
                else if (f.operator === 'lte') sbQuery = sbQuery.lte(f.column, f.value);
            });
        }

        if (queryObj.order) {
            sbQuery = sbQuery.order(queryObj.order.column, { ascending: queryObj.order.ascending });
        } else {
            // default order
            sbQuery = sbQuery.order('created_at', { ascending: false });
        }

        if (queryObj.limit) {
            sbQuery = sbQuery.limit(queryObj.limit);
        } else {
            sbQuery = sbQuery.limit(500); // safety limit
        }

        const { data, error } = await sbQuery;

        if (error) {
            console.error("Supabase query error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            query: queryObj,
            data: data
        });

    } catch (err) {
        console.error('AI Query failed:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
