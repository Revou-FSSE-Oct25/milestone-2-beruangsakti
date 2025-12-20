/**
 * Number Guessing Game - Detective Case File Theme
 * Guess the secret number between 1-100 in 9 attempts!
 * Features: Guess history, range narrowing, win streak, confetti celebration
 */

import { safeGetItem, safeSetItem, createConfetti } from "./utils.js";

// ==================== Type Definitions ====================
type GuessResult = "high" | "low" | "correct";

// ==================== DOM Elements ====================
const guessInput = document.getElementById("guessInput") as HTMLInputElement;
const guessBtn = document.getElementById("guessBtn") as HTMLButtonElement;
const restartBtn = document.getElementById("restartBtn") as HTMLButtonElement;
const feedback = document.getElementById("feedback") as HTMLDivElement;
const attemptsText = document.getElementById("attempts") as HTMLSpanElement;
const bestScoreText = document.getElementById("bestScore") as HTMLSpanElement;
const guessHistory = document.getElementById("guessHistory") as HTMLDivElement;
const rangeHintText = document.getElementById("rangeHint") as HTMLDivElement;
const winStreakText = document.getElementById("winStreak") as HTMLSpanElement;
const confettiContainer = document.getElementById("confetti-container") as HTMLDivElement;

// ==================== Game State ====================
let secretNumber: number = 0;
let attemptsLeft: number = 9;
let attemptsUsed: number = 0;
let gameOver: boolean = false;
let bestScore: number | null = safeGetItem("guessGameBest", null) ? Number(safeGetItem("guessGameBest", null)) : null;
let winStreak: number = Number(safeGetItem("guessGameStreak", "0"));
let rangeMin: number = 1;
let rangeMax: number = 100;

// ==================== Game Functions ====================

/**
 * Initializes the game with a new secret number and resets UI
 */
function initGame(): void {
  // Generate random number between 1-100
  secretNumber = Math.floor(Math.random() * 100) + 1;
  attemptsLeft = 9;
  attemptsUsed = 0;
  gameOver = false;
  rangeMin = 1;
  rangeMax = 100;

  // Reset UI elements
  feedback.textContent = "Awaiting your first lead...";
  feedback.className = "feedback-box case-notes";
  attemptsText.textContent = "9";
  bestScoreText.textContent = bestScore ? String(bestScore) : "-";
  winStreakText.textContent = String(winStreak);
  rangeHintText.textContent = "Suspect range: 1 - 100";
  rangeHintText.className = "range-hint evidence-note";
  guessHistory.innerHTML = "";
  confettiContainer.innerHTML = "";
  guessInput.value = "";
  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessInput.focus();
}

/**
 * Adds a guess chip to the history display
 * @param guess - The guessed number
 * @param result - "high", "low", or "correct"
 */
function addGuessToHistory(guess: number, result: GuessResult): void {
  const chip = document.createElement("span");
  chip.classList.add("guess-chip", result);
  
  // Add directional arrow based on result
  let arrow: string = "";
  switch (result) {
    case "high":
      arrow = " ↑";
      break;
    case "low":
      arrow = " ↓";
      break;
    case "correct":
      arrow = " ✓";
      break;
    default:
      arrow = "";
  }
  
  chip.textContent = guess + arrow;
  guessHistory.appendChild(chip);
}

/**
 * Validates and processes the player's guess
 * Updates feedback, history, and checks win/lose conditions
 */
function checkGuess(): void {
  if (gameOver) return;

  const guess: number = Number(guessInput.value);

  // Validate input is within range
  if (!guess || guess < 1 || guess > 100) {
    feedback.textContent = "⚠️ Invalid lead! Enter 1-100";
    feedback.className = "feedback-box case-notes error";
    guessInput.classList.add("input-shake");
    setTimeout(() => guessInput.classList.remove("input-shake"), 400);
    return;
  }

  attemptsLeft--;
  attemptsUsed++;
  attemptsText.textContent = String(attemptsLeft);

  // Check if guess is correct
  if (guess === secretNumber) {
    feedback.textContent = `🎉 Case closed! Solved in ${attemptsUsed} ${attemptsUsed === 1 ? "interrogation" : "interrogations"}!`;
    feedback.className = "feedback-box case-notes correct";
    addGuessToHistory(guess, "correct");
    
    // Update win streak
    winStreak++;
    safeSetItem("guessGameStreak", winStreak);
    winStreakText.textContent = String(winStreak);
    
    // Check for new best score
    if (!bestScore || attemptsUsed < bestScore) {
      bestScore = attemptsUsed;
      safeSetItem("guessGameBest", bestScore);
      bestScoreText.textContent = String(bestScore);
    }
    
    // Trigger confetti!
    createConfetti(confettiContainer, "detective");
    
    endGame();
  } else if (guess > secretNumber) {
    // Narrow range
    if (guess < rangeMax) rangeMax = guess - 1;
    updateRangeHint();
    
    feedback.textContent = `🔼 Too high! The suspect is smaller.`;
    feedback.className = "feedback-box case-notes too-high";
    addGuessToHistory(guess, "high");
  } else {
    // Narrow range
    if (guess > rangeMin) rangeMin = guess + 1;
    updateRangeHint();
    
    feedback.textContent = `🔽 Too low! The suspect is larger.`;
    feedback.className = "feedback-box case-notes too-low";
    addGuessToHistory(guess, "low");
  }

  if (attemptsLeft === 0 && !gameOver) {
    feedback.textContent = `💼 Case went cold! It was ${secretNumber}`;
    feedback.className = "feedback-box case-notes error";
    // Reset win streak on loss
    winStreak = 0;
    safeSetItem("guessGameStreak", winStreak);
    winStreakText.textContent = String(winStreak);
    endGame();
  }

  guessInput.value = "";
  guessInput.focus();
}

/**
 * Disables input when game is over
 */
function endGame(): void {
  gameOver = true;
  guessInput.disabled = true;
  guessBtn.disabled = true;
}

/**
 * Updates the range hint display with current narrowed range
 */
function updateRangeHint(): void {
  rangeHintText.textContent = `Suspect range: ${rangeMin} - ${rangeMax}`;
  rangeHintText.classList.add("range-updated");
  setTimeout(() => rangeHintText.classList.remove("range-updated"), 300);
}

// ==================== Event Listeners ====================
guessBtn.addEventListener("click", checkGuess);

// Allow Enter key to submit guess
guessInput.addEventListener("keydown", function (e: KeyboardEvent): void {
  if (e.key === "Enter") {
    checkGuess();
  }
});

restartBtn.addEventListener("click", initGame);

/**
 * Keyboard support - R to restart game
 */
document.addEventListener("keydown", function(e: KeyboardEvent): void {
  if (e.key === "r" || e.key === "R") {
    // Only restart if not typing in input
    if (document.activeElement !== guessInput) {
      initGame();
    }
  }
});

// ==================== Initialize ====================
initGame();
