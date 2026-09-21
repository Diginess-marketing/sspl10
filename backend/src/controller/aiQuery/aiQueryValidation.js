const ApiError = require('../../utils/ApiError');

const MAX_QUERY_LENGTH = 1000;

/**
 * Validate an admin natural-language query request.
 * @returns {{query:string}}
 */
function validateQuery(body = {}) {
  const { query } = body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    throw ApiError.badRequest('Query is required');
  }
  if (query.length > MAX_QUERY_LENGTH) {
    throw ApiError.badRequest(`Query must be ${MAX_QUERY_LENGTH} characters or fewer`);
  }

  return { query: query.trim() };
}

module.exports = { MAX_QUERY_LENGTH, validateQuery };
