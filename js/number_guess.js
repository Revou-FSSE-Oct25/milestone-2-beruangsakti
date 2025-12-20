/**
 * Number Guessing Game - Detective Case File Theme
 * Guess the secret number between 1-100 in 9 attempts!
 * Features: Guess history, range narrowing, win streak, confetti celebration
 */

// ==================== DOM Elements ====================
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");
const feedback = document.getElementById("feedback");
const attemptsText = document.getElementById("attempts");
const bestScoreText = document.getElementById("bestScore");
const guessHistory = document.getElementById("guessHistory");
const rangeHintText = document.getElementById("rangeHint");
const winStreakText = document.getElementById("winStreak");
const confettiContainer = document.getElementById("confetti-container");

// ==================== Game State ====================
let secretNumber;
let attemptsLeft;
let attemptsUsed;
let gameOver;
let guesses = [];  // Array to store all guesses
let bestScore = safeGetItem("guessGameBest", null);
let winStreak = Number(safeGetItem("guessGameStreak", 0));
let rangeMin = 1;
let rangeMax = 100;

// ==================== Storage Helpers ====================

/**
 * Safely retrieves an item from localStorage
 * @param {string} key - The storage key
 * @param {*} defaultValue - Default value if retrieval fails
 * @returns {*} The stored value or default
 */
function safeGetItem(key, defaultValue) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (e) {
    console.warn("localStorage not available:", e.message);
    return defaultValue;
  }
}

/**
 * Safely stores an item in localStorage
 * @param {string} key - The storage key
 * @param {*} value - The value to store
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage not available:", e.message);
  }
}

// ==================== Game Functions ====================

/**
 * Initializes the game with a new secret number and resets UI
 */
function initGame() {
  // Generate random number between 1-100
  secretNumber = Math.floor(Math.random() * 100) + 1;
  attemptsLeft = 9;
  attemptsUsed = 0;
  gameOver = false;
  guesses = [];
  rangeMin = 1;
  rangeMax = 100;

  // Reset UI elements
  feedback.textContent = "Awaiting your first lead...";
  feedback.className = "feedback-box case-notes";
  attemptsText.textContent = "9";
  bestScoreText.textContent = bestScore ? bestScore : "-";
  winStreakText.textContent = winStreak;
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
 * @param {number} guess - The guessed number
 * @param {string} result - "high", "low", or "correct"
 */
function addGuessToHistory(guess, result) {
  const chip = document.createElement("span");
  chip.classList.add("guess-chip", result);
  
  // Add directional arrow based on result
  let arrow = "";
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
function checkGuess() {
  if (gameOver) return;

  const guess = Number(guessInput.value);

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
  attemptsText.textContent = attemptsLeft;

  // Check if guess is correct
  if (guess === secretNumber) {
    feedback.textContent = `🎉 Case closed! Solved in ${attemptsUsed} ${attemptsUsed === 1 ? "interrogation" : "interrogations"}!`;
    feedback.className = "feedback-box case-notes correct";
    addGuessToHistory(guess, "correct");
    
    // Update win streak
    winStreak++;
    safeSetItem("guessGameStreak", winStreak);
    winStreakText.textContent = winStreak;
    
    // Check for new best score
    if (!bestScore || attemptsUsed < bestScore) {
      bestScore = attemptsUsed;
      safeSetItem("guessGameBest", bestScore);
      bestScoreText.textContent = bestScore;
    }
    
    // Trigger confetti!
    createConfetti();
    
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
    winStreakText.textContent = winStreak;
    endGame();
  }

  guessInput.value = "";
  guessInput.focus();
}

/**
 * Disables input when game is over
 */
function endGame() {
  gameOver = true;
  guessInput.disabled = true;
  guessBtn.disabled = true;
}

/**
 * Updates the range hint display with current narrowed range
 */
function updateRangeHint() {
  rangeHintText.textContent = `Suspect range: ${rangeMin} - ${rangeMax}`;
  rangeHintText.classList.add("range-updated");
  setTimeout(() => rangeHintText.classList.remove("range-updated"), 300);
}

/**
 * Creates confetti animation on win
 * Uses for loop to generate 50 confetti pieces
 */
function createConfetti() {
  const colors = ["#a78bfa", "#4ade80", "#fbbf24", "#f87171", "#60a5fa", "#38bdf8"];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + "s";
    confetti.style.animationDuration = (Math.random() * 1 + 2) + "s";
    confettiContainer.appendChild(confetti);
  }
  
  // Clean up confetti after animation
  setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 3000);
}

// ==================== Event Listeners ====================
guessBtn.addEventListener("click", checkGuess);

// Allow Enter key to submit guess
guessInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    checkGuess();
  }
});

restartBtn.addEventListener("click", initGame);

/**
 * Keyboard support - R to restart game
 */
document.addEventListener("keydown", function(e) {
  if (e.key === "r" || e.key === "R") {
    // Only restart if not typing in input
    if (document.activeElement !== guessInput) {
      initGame();
    }
  }
});

// ==================== Initialize ====================
initGame();
