import * as aiQueryService from '../../service/aiQueryService.js';
import * as dynamicQueryModel from '../../model/dynamicQueryModel.js';
import * as validation from './aiQueryValidation.js';

/**
 * POST /api/admin/ai-query
 * Translate a natural-language question into a Supabase query, run it, and
 * return both the interpreted query and its rows.
 */
export const handleQuery = async (req, res) => {
  const { query } = validation.validateQuery(req.body);

  const descriptor = await aiQueryService.translateToQuery(query);
  const { query: executed, data } = await dynamicQueryModel.run(descriptor);

  res.json({ success: true, query: executed, data });
};
