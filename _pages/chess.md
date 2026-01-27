---
layout: chess
title: Chess
permalink: /chess/
---

<div class="chess-container">
  <div class="chess-game">
    <div class="chess-board-wrapper">
      <div id="chess-board" style="width: 400px"></div>
    </div>

    <div class="chess-sidebar">
      <div class="game-controls">
        <h3>Game Controls</h3>
        <div class="control-buttons">
          <button id="new-game-btn" class="btn btn-primary">New Game</button>
          <button id="flip-board-btn" class="btn btn-secondary">Flip Board</button>
        </div>

        <div class="game-mode-selector">
          <h4>Game Mode</h4>
          <select id="game-mode-select" class="form-control">
            <option value="human-vs-human">Human vs Human</option>
            <option value="human-vs-computer">Human vs Computer</option>
          </select>
        </div>

        <div id="difficulty-selector" class="difficulty-selector" style="display: none;">
          <h4>Difficulty</h4>
          <select id="difficulty-select" class="form-control">
            <option value="1">Beginner (Level 1)</option>
            <option value="3">Easy (Level 3)</option>
            <option value="5">Intermediate (Level 5)</option>
            <option value="8">Advanced (Level 8)</option>
            <option value="10">Master (Level 10)</option>
          </select>
        </div>

        <div id="side-selector" class="side-selector" style="display: none;">
          <h4>Play As</h4>
          <select id="side-select" class="form-control">
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
        </div>
      </div>

      <div class="game-status">
        <h3>Game Status</h3>
        <div id="game-status-text">Ready to start</div>
        <div id="turn-indicator"></div>
      </div>

      <div class="move-history">
        <h3>Move History</h3>
        <div id="move-list"></div>
      </div>
    </div>
  </div>
</div>
