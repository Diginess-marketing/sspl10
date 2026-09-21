/**
 * Escape a single CSV field: wrap in quotes and double any embedded quote.
 */
const escapeField = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

/**
 * Build a CSV document.
 *
 * @param {string[]} headers Column headings, written as the first row.
 * @param {Array<Array<*>>} rows Row values, in the same order as `headers`.
 * @returns {string}
 */
function toCsv(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeField).join(','));
  }
  return `${lines.join('\n')}\n`;
}

module.exports = { toCsv, escapeField };
