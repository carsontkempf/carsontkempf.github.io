/**
 * Arrow Overlay - SVG arrow overlay for displaying best moves
 * Part of Carson's Chess Engine
 * @module chess/ui/arrow-overlay
 */

export class ArrowOverlay {
  constructor(boardElementId = 'chess-board') {
    this.boardElement = document.getElementById(boardElementId);
    this.svg = null;
    this.arrow = null;
    this.isFlipped = false;

    this.createSVGOverlay();
    this.setupEventListeners();
  }

  /**
   * Create SVG overlay on chessboard
   */
  createSVGOverlay() {
    if (!this.boardElement) {
      console.error('[ArrowOverlay] Board element not found');
      return;
    }

    // Find chessboard container
    const boardContainer = this.boardElement.querySelector('.board-b72b1');
    if (!boardContainer) {
      console.error('[ArrowOverlay] Chessboard container not found');
      return;
    }

    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'arrow-overlay');
    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '5';

    boardContainer.style.position = 'relative';
    boardContainer.appendChild(this.svg);

    console.log('[ArrowOverlay] SVG overlay created');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for board flip events
    window.addEventListener('chessBoardFlipped', (e) => {
      this.isFlipped = e.detail?.flipped || false;
      console.log('[ArrowOverlay] Board flipped:', this.isFlipped);
      // Redraw arrow if exists
      if (this.arrow && this.arrow.from && this.arrow.to) {
        const { from, to, color } = this.arrow;
        this.drawArrow(from, to, color);
      }
    });
  }

  /**
   * Draw arrow from source to destination square
   * @param {string} fromSquare - Algebraic notation (e.g., 'e2')
   * @param {string} toSquare - Algebraic notation (e.g., 'e4')
   * @param {string} color - Arrow color (default: '#4ec9b0')
   */
  drawArrow(fromSquare, toSquare, color = '#4ec9b0') {
    if (!this.svg) {
      console.error('[ArrowOverlay] SVG not initialized');
      return;
    }

    // Clear existing arrow
    this.clearArrow();

    // Get square positions
    const fromPos = this.getSquarePosition(fromSquare);
    const toPos = this.getSquarePosition(toSquare);

    if (!fromPos || !toPos) {
      console.error('[ArrowOverlay] Could not find square positions:', fromSquare, toSquare);
      return;
    }

    // Create arrow group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'best-move-arrow');

    // Shorten arrow to not cover entire squares
    const shortenedFrom = this.shortenPoint(fromPos, toPos, 0.25);
    const shortenedTo = this.shortenPoint(toPos, fromPos, 0.3);

    // Draw arrow shaft
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', shortenedFrom.x);
    line.setAttribute('y1', shortenedFrom.y);
    line.setAttribute('x2', shortenedTo.x);
    line.setAttribute('y2', shortenedTo.y);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '12');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0.8');

    // Draw arrow head
    const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const headPoints = this.calculateArrowHead(shortenedFrom, shortenedTo, 25);
    arrowHead.setAttribute('points', headPoints);
    arrowHead.setAttribute('fill', color);
    arrowHead.setAttribute('opacity', '0.8');

    g.appendChild(line);
    g.appendChild(arrowHead);
    this.svg.appendChild(g);

    // Store arrow info for redrawing
    this.arrow = { from: fromSquare, to: toSquare, color: color };

    console.log('[ArrowOverlay] Arrow drawn:', fromSquare, '->', toSquare);
  }

  /**
   * Shorten a point along a line by a factor
   * @param {object} point - Point to shorten from
   * @param {object} otherPoint - Other endpoint of line
   * @param {number} factor - How much to shorten (0.0 - 1.0)
   */
  shortenPoint(point, otherPoint, factor) {
    const dx = otherPoint.x - point.x;
    const dy = otherPoint.y - point.y;

    return {
      x: point.x + dx * factor,
      y: point.y + dy * factor
    };
  }

  /**
   * Get center position of a square
   * @param {string} square - Algebraic notation (e.g., 'e4')
   * @returns {object} Position {x, y} or null
   */
  getSquarePosition(square) {
    if (!this.boardElement) return null;

    // Find square element by class
    const squareEl = this.boardElement.querySelector(`.square-${square}`);
    if (!squareEl) {
      console.error('[ArrowOverlay] Square element not found:', square);
      return null;
    }

    const squareRect = squareEl.getBoundingClientRect();
    const svgRect = this.svg.getBoundingClientRect();

    // Calculate center of square relative to SVG
    return {
      x: squareRect.left - svgRect.left + squareRect.width / 2,
      y: squareRect.top - svgRect.top + squareRect.height / 2
    };
  }

  /**
   * Calculate arrow head triangle points
   * @param {object} from - Starting point
   * @param {object} to - Ending point
   * @param {number} size - Size of arrow head
   * @returns {string} SVG polygon points string
   */
  calculateArrowHead(from, to, size) {
    // Calculate angle of arrow
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headAngle = Math.PI / 6; // 30 degrees

    // Calculate three points of triangle
    const x1 = to.x - size * Math.cos(angle - headAngle);
    const y1 = to.y - size * Math.sin(angle - headAngle);
    const x2 = to.x - size * Math.cos(angle + headAngle);
    const y2 = to.y - size * Math.sin(angle + headAngle);

    return `${to.x},${to.y} ${x1},${y1} ${x2},${y2}`;
  }

  /**
   * Clear arrow from board
   */
  clearArrow() {
    if (this.svg) {
      // Remove all arrow elements
      const arrows = this.svg.querySelectorAll('.best-move-arrow');
      arrows.forEach(arrow => arrow.remove());
    }
    this.arrow = null;
  }

  /**
   * Destroy overlay and clean up
   */
  destroy() {
    this.clearArrow();

    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }

    console.log('[ArrowOverlay] Destroyed');
  }
}
