/**
 * Homepage Stats Loader
 * Loads and displays game statistics from localStorage
 */

import { safeGetItem } from "./utils.js";

// ==================== DOM Elements ====================
const clickerHighScoreEl = document.getElementById("clickerHighScore") as HTMLSpanElement;
const guessBestScoreEl = document.getElementById("guessBestScore") as HTMLSpanElement;
const rpsWinRateEl = document.getElementById("rpsWinRate") as HTMLSpanElement;
const gomokuWinsEl = document.getElementById("gomokuWins") as HTMLSpanElement;

// ==================== Stats Loading ====================

/**
 * Loads all game stats from localStorage and updates the UI
 */
function loadStats(): void {
  loadClickerStats();
  loadGuessBestScore();
  loadRpsStats();
  loadGomokuStats();
}

/**
 * Loads clicker game high score
 */
function loadClickerStats(): void {
  const highScore = safeGetItem("clickerHighScore", "0");
  clickerHighScoreEl.textContent = highScore !== "0" ? highScore : "-";
}

function loadGuessBestScore(): void {
  const bestScore = safeGetItem("guessGameBest", null);
  guessBestScoreEl.textContent = bestScore ? bestScore : "-";
}


/**
 * Loads RPS win rate percentage
 */
function loadRpsStats(): void {
  const wins = parseInt(safeGetItem("rpsWins", "0"));
  const losses = parseInt(safeGetItem("rpsLosses", "0"));
  const total = wins + losses;
  
  if (total > 0) {
    const winRate = Math.round((wins / total) * 100);
    rpsWinRateEl.textContent = `${winRate}%`;
  } else {
    rpsWinRateEl.textContent = "-";
  }
}

/**
 * Loads Gomoku total wins (black + white)
 */
function loadGomokuStats(): void {
  const blackWins = parseInt(safeGetItem("gomokuBlackWins", "0"));
  const whiteWins = parseInt(safeGetItem("gomokuWhiteWins", "0"));
  const totalWins = blackWins + whiteWins;
  
  gomokuWinsEl.textContent = totalWins > 0 ? String(totalWins) : "-";
}

// ==================== Initialize ====================
loadStats();
