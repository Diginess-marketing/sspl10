const aiQueryService = require('../../service/aiQueryService');
const dynamicQueryModel = require('../../model/dynamicQueryModel');
const validation = require('./aiQueryValidation');

/**
 * POST /api/admin/ai-query
 * Translate a natural-language question into a Supabase query, run it, and
 * return both the interpreted query and its rows.
 */
exports.handleQuery = async (req, res) => {
  const { query } = validation.validateQuery(req.body);

  const descriptor = await aiQueryService.translateToQuery(query);
  const { query: executed, data } = await dynamicQueryModel.run(descriptor);

  res.json({ success: true, query: executed, data });
};
