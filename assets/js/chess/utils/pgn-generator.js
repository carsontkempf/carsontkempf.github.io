/**
 * PGN Generator Utility
 * Generates PGN (Portable Game Notation) format from game data
 */

/**
 * Generate PGN format string from game data
 * @param {Array} moveHistory - Array of move objects with {san, fen, move} properties
 * @param {Object} metadata - Game metadata
 * @param {string} metadata.white - White player name
 * @param {string} metadata.black - Black player name
 * @param {string} metadata.result - Game result ("1-0", "0-1", "1/2-1/2", or "*")
 * @param {string} [metadata.event] - Event name (default: "Casual Game")
 * @param {string} [metadata.site] - Site name (default: "carsontkempf.github.io")
 * @param {string} [metadata.date] - Date in YYYY.MM.DD format
 * @param {string} [metadata.eco] - ECO code (e.g., "C50")
 * @param {string} [metadata.opening] - Opening name (e.g., "Italian Game")
 * @returns {string} PGN formatted string
 */
export function generatePGN(moveHistory, metadata = {}) {
  // Default metadata values
  const event = metadata.event || 'Casual Game';
  const site = metadata.site || 'carsontkempf.github.io';
  const date = metadata.date || formatDate(new Date());
  const round = metadata.round || '?';
  const white = metadata.white || 'White';
  const black = metadata.black || 'Black';
  const result = metadata.result || '*';

  // Build header tags
  const headers = [
    `[Event "${event}"]`,
    `[Site "${site}"]`,
    `[Date "${date}"]`,
    `[Round "${round}"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${result}"]`
  ];

  // Add optional tags
  if (metadata.eco) {
    headers.push(`[ECO "${metadata.eco}"]`);
  }
  if (metadata.opening) {
    headers.push(`[Opening "${metadata.opening}"]`);
  }
  if (metadata.plyCount !== undefined) {
    headers.push(`[PlyCount "${metadata.plyCount}"]`);
  }
  if (metadata.timeControl) {
    headers.push(`[TimeControl "${metadata.timeControl}"]`);
  }

  // Generate move text
  const moveText = generateMoveText(moveHistory, result);

  // Combine headers and move text
  return headers.join('\n') + '\n\n' + moveText + '\n';
}

/**
 * Generate move text from move history
 * @param {Array} moveHistory - Array of move objects with san property
 * @param {string} result - Game result
 * @returns {string} Formatted move text
 */
function generateMoveText(moveHistory, result) {
  if (!moveHistory || moveHistory.length === 0) {
    return result;
  }

  const lines = [];
  let currentLine = '';

  for (let i = 0; i < moveHistory.length; i++) {
    const moveObj = moveHistory[i];
    const san = moveObj.san || moveObj.move || '??';
    const moveNumber = Math.floor(i / 2) + 1;
    const isWhiteMove = i % 2 === 0;

    // Add move number for white moves
    if (isWhiteMove) {
      const moveNumberText = `${moveNumber}. ${san}`;

      // Check if adding this would exceed 80 characters
      if (currentLine.length > 0 && currentLine.length + moveNumberText.length + 1 > 80) {
        lines.push(currentLine);
        currentLine = moveNumberText;
      } else {
        currentLine += (currentLine.length > 0 ? ' ' : '') + moveNumberText;
      }
    } else {
      // Black move - just add the move
      if (currentLine.length + san.length + 1 > 80) {
        lines.push(currentLine);
        currentLine = san;
      } else {
        currentLine += ' ' + san;
      }
    }
  }

  // Add the last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Add result
  const lastLine = lines[lines.length - 1] || '';
  if (lastLine.length + result.length + 1 <= 80) {
    lines[lines.length - 1] = lastLine + ' ' + result;
  } else {
    lines.push(result);
  }

  return lines.join('\n');
}

/**
 * Format date for PGN (YYYY.MM.DD)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * Parse result from game outcome
 * @param {string} outcome - Game outcome ("win", "loss", "draw", "abandoned", etc.)
 * @param {string} userColor - User's color ("white" or "black")
 * @returns {string} PGN result ("1-0", "0-1", "1/2-1/2", "*")
 */
export function parseResult(outcome, userColor = 'white') {
  if (outcome === 'draw') {
    return '1/2-1/2';
  }

  if (outcome === 'win') {
    return userColor === 'white' ? '1-0' : '0-1';
  }

  if (outcome === 'loss') {
    return userColor === 'white' ? '0-1' : '1-0';
  }

  // Abandoned or in progress
  return '*';
}

/**
 * Validate PGN string
 * @param {string} pgn - PGN string to validate
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
export function validatePGN(pgn) {
  const errors = [];

  if (!pgn || typeof pgn !== 'string') {
    return { valid: false, errors: ['PGN must be a non-empty string'] };
  }

  const lines = pgn.split('\n');
  const requiredTags = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
  const foundTags = new Set();

  // Check for required header tags
  for (const line of lines) {
    const tagMatch = line.match(/^\[(\w+)\s+"([^"]+)"\]$/);
    if (tagMatch) {
      foundTags.add(tagMatch[1]);
    }
  }

  for (const tag of requiredTags) {
    if (!foundTags.has(tag)) {
      errors.push(`Missing required tag: [${tag}]`);
    }
  }

  // Check for move text (at least one line that doesn't start with [)
  const hasMoveText = lines.some(line =>
    line.trim().length > 0 && !line.startsWith('[')
  );

  if (!hasMoveText) {
    errors.push('Missing move text');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
