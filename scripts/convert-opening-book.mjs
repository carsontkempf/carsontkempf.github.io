#!/usr/bin/env node
/**
 * Opening Book Conversion Script
 * Converts ECO opening data to Zobrist-hashed JSON format
 * Usage: node scripts/convert-opening-book.mjs
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Import chess engine modules
const { Board } = await import(join(rootDir, 'assets/js/chess/engine/board.js'));

/**
 * ECO Opening Database
 * Source: Standard ECO classifications with common variations
 * Format: { eco, name, moves (SAN), fen }
 */
const ECO_DATABASE = [
  // King's Pawn Openings (B00-C99)
  { eco: 'B00', name: "King's Pawn", moves: 'e4', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1' },
  { eco: 'B00', name: "King's Pawn Game", moves: 'e4 d6', fen: 'rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' },
  { eco: 'B01', name: 'Scandinavian Defense', moves: 'e4 d5', fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2' },
  { eco: 'B02', name: "Alekhine's Defense", moves: 'e4 Nf6', fen: 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2' },
  { eco: 'B03', name: "Alekhine's Defense: Modern", moves: 'e4 Nf6 e5', fen: 'rnbqkb1r/pppppppp/5n2/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2' },
  { eco: 'B10', name: 'Caro-Kann Defense', moves: 'e4 c6', fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' },
  { eco: 'B12', name: 'Caro-Kann Defense: Advance', moves: 'e4 c6 d4 d5 e5', fen: 'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3' },
  { eco: 'B20', name: 'Sicilian Defense', moves: 'e4 c5', fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2' },
  { eco: 'B22', name: 'Sicilian Defense: Alapin', moves: 'e4 c5 c3', fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2' },
  { eco: 'B23', name: 'Sicilian Defense: Closed', moves: 'e4 c5 Nc3', fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2' },
  { eco: 'B40', name: 'Sicilian Defense: French Variation', moves: 'e4 c5 Nf3 e6', fen: 'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3' },
  { eco: 'B50', name: 'Sicilian Defense', moves: 'e4 c5 Nf3 d6', fen: 'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3' },
  { eco: 'C00', name: 'French Defense', moves: 'e4 e6', fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' },
  { eco: 'C02', name: 'French Defense: Advance', moves: 'e4 e6 d4 d5 e5', fen: 'rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3' },
  { eco: 'C10', name: 'French Defense: Rubinstein', moves: 'e4 e6 d4 d5 Nc3', fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3' },
  { eco: 'C20', name: "King's Pawn Game", moves: 'e4 e5', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2' },
  { eco: 'C25', name: 'Vienna Game', moves: 'e4 e5 Nc3', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2' },
  { eco: 'C30', name: "King's Gambit", moves: 'e4 e5 f4', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2' },
  { eco: 'C41', name: 'Philidor Defense', moves: 'e4 e5 Nf3 d6', fen: 'rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3' },
  { eco: 'C42', name: 'Petrov Defense', moves: 'e4 e5 Nf3 Nf6', fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3' },
  { eco: 'C44', name: 'Scotch Game', moves: 'e4 e5 Nf3 Nc6 d4', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3' },
  { eco: 'C45', name: 'Scotch Game', moves: 'e4 e5 Nf3 Nc6 d4 exd4', fen: 'r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4' },
  { eco: 'C50', name: 'Italian Game', moves: 'e4 e5 Nf3 Nc6 Bc4', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3' },
  { eco: 'C53', name: 'Italian Game: Giuoco Piano', moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5', fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4' },
  { eco: 'C55', name: 'Italian Game: Two Knights Defense', moves: 'e4 e5 Nf3 Nc6 Bc4 Nf6', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4' },
  { eco: 'C60', name: 'Ruy Lopez', moves: 'e4 e5 Nf3 Nc6 Bb5', fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3' },
  { eco: 'C65', name: 'Ruy Lopez: Berlin Defense', moves: 'e4 e5 Nf3 Nc6 Bb5 Nf6', fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4' },
  { eco: 'C70', name: 'Ruy Lopez: Morphy Defense', moves: 'e4 e5 Nf3 Nc6 Bb5 a6', fen: 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4' },

  // Queen's Pawn Openings (D00-E99)
  { eco: 'D00', name: "Queen's Pawn Game", moves: 'd4', fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1' },
  { eco: 'D00', name: "Queen's Pawn Game", moves: 'd4 d5', fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2' },
  { eco: 'D02', name: "Queen's Pawn Game: London System", moves: 'd4 d5 Nf3 Nf6 Bf4', fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3' },
  { eco: 'D04', name: "Queen's Pawn Game: Colle System", moves: 'd4 d5 Nf3 Nf6 e3', fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq - 0 3' },
  { eco: 'D06', name: "Queen's Gambit", moves: 'd4 d5 c4', fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2' },
  { eco: 'D08', name: "Queen's Gambit Declined: Albin Countergambit", moves: 'd4 d5 c4 e5', fen: 'rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq e6 0 3' },
  { eco: 'D10', name: 'Slav Defense', moves: 'd4 d5 c4 c6', fen: 'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3' },
  { eco: 'D20', name: "Queen's Gambit Accepted", moves: 'd4 d5 c4 dxc4', fen: 'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3' },
  { eco: 'D30', name: "Queen's Gambit Declined", moves: 'd4 d5 c4 e6', fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3' },
  { eco: 'D35', name: "Queen's Gambit Declined: Exchange", moves: 'd4 d5 c4 e6 Nc3 Nf6 cxd5', fen: 'rnbqkb1r/ppp2ppp/4pn2/3P4/3P4/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 4' },
  { eco: 'D50', name: "Queen's Gambit Declined: Modern", moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5', fen: 'rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4' },
  { eco: 'E00', name: "Queen's Pawn Game: Catalan", moves: 'd4 Nf6 c4 e6 g3', fen: 'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3' },
  { eco: 'E20', name: 'Nimzo-Indian Defense', moves: 'd4 Nf6 c4 e6 Nc3 Bb4', fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4' },
  { eco: 'E60', name: "King's Indian Defense", moves: 'd4 Nf6 c4 g6', fen: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3' },
  { eco: 'E70', name: "King's Indian Defense: Normal", moves: 'd4 Nf6 c4 g6 Nc3 Bg7', fen: 'rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4' },
  { eco: 'E90', name: "King's Indian Defense: Classical", moves: 'd4 Nf6 c4 g6 Nc3 Bg7 e4', fen: 'rnbqk2r/ppppppbp/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4' },

  // Flank Openings (A00-A39)
  { eco: 'A00', name: 'English Opening', moves: 'c4', fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1' },
  { eco: 'A00', name: 'Reti Opening', moves: 'Nf3', fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1' },
  { eco: 'A04', name: 'Reti Opening: Pirc Defense', moves: 'Nf3 d6', fen: 'rnbqkbnr/ppp1pppp/3p4/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2' },
  { eco: 'A06', name: 'Reti Opening', moves: 'Nf3 d5', fen: 'rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq d6 0 2' },
  { eco: 'A10', name: 'English Opening', moves: 'c4 c5', fen: 'rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq c6 0 2' },
  { eco: 'A20', name: 'English Opening: Reversed Sicilian', moves: 'c4 e5', fen: 'rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2' },
  { eco: 'A40', name: 'English Defense', moves: 'd4 b6', fen: 'rnbqkbnr/p1pppppp/1p6/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2' },
  { eco: 'A45', name: 'Indian Defense', moves: 'd4 Nf6', fen: 'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2' },
];

/**
 * Convert SAN moves to UCI notation
 * Simple converter for basic moves (handles common openings)
 */
function sanToUci(sanMoves) {
  // For now, we'll skip this conversion and use FEN directly
  // The plan is to just use the FEN strings which are already provided
  return sanMoves.toLowerCase().replace(/\./g, '').trim();
}

/**
 * Calculate ply depth from move string
 */
function calculateDepth(moves) {
  if (!moves) return 0;
  const tokens = moves.trim().split(/\s+/);
  return tokens.length;
}

/**
 * Main conversion function
 */
async function convertOpeningBook() {
  console.log('Converting ECO opening database to Zobrist-hashed format...');
  console.log(`Total positions: ${ECO_DATABASE.length}`);

  const positions = [];
  const index = {};

  for (let i = 0; i < ECO_DATABASE.length; i++) {
    const opening = ECO_DATABASE[i];

    try {
      // Create board from FEN
      const board = new Board();
      board.parseFEN(opening.fen);

      // Get Zobrist hash
      const hash = board.hash.toString();

      // Calculate depth
      const depth = calculateDepth(opening.moves);

      // Create position entry
      const position = {
        hash: hash,
        eco: opening.eco,
        name: opening.name,
        fen: opening.fen,
        moves: opening.moves,
        depth: depth,
        weight: 100 // Default weight
      };

      positions.push(position);
      index[hash] = i;

      if ((i + 1) % 10 === 0) {
        console.log(`Processed ${i + 1}/${ECO_DATABASE.length} positions...`);
      }
    } catch (error) {
      console.error(`Error processing opening "${opening.name}":`, error.message);
    }
  }

  console.log(`Successfully converted ${positions.length} positions`);

  // Create output structure
  const bookData = {
    positions: positions,
    index: index,
    metadata: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      positionCount: positions.length,
      source: 'ECO Standard Classifications'
    }
  };

  return bookData;
}

/**
 * Write book data to JSON file
 */
function writeBookData(bookData) {
  const outputPath = join(rootDir, '_data/chess/openings.json');
  const jsonString = JSON.stringify(bookData, null, 2);

  writeFileSync(outputPath, jsonString, 'utf8');
  console.log(`\nOpening book written to: ${outputPath}`);
  console.log(`File size: ${(jsonString.length / 1024).toFixed(2)} KB`);
  console.log(`Positions: ${bookData.positions.length}`);
}

// Run conversion
try {
  const bookData = await convertOpeningBook();
  writeBookData(bookData);
  console.log('\nConversion complete!');
} catch (error) {
  console.error('Conversion failed:', error);
  process.exit(1);
}
