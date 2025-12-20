/**
 * Clicker Game - Arcade Style
 * Click as many times as you can in 10 seconds!
 * Features: High score tracking with localStorage
 */

import { safeGetItem, safeSetItem, createConfetti } from "./utils.js";

// ==================== Type Definitions ====================
type ScoreTier = "legendary" | "amazing" | "great" | "good" | "okay" | "low";

// ==================== DOM Elements ====================
const clickBtn = document.getElementById("clickBtn") as HTMLButtonElement;
const restartBtn = document.getElementById("restartBtn") as HTMLButtonElement;
const timerText = document.getElementById("timer") as HTMLSpanElement;
const scoreText = document.getElementById("score") as HTMLSpanElement;
const highScoreText = document.getElementById("highScore") as HTMLSpanElement;
const finalMessage = document.getElementById("finalMessage") as HTMLParagraphElement;
const confettiContainer = document.getElementById("confetti-container") as HTMLDivElement;

// ==================== Game State ====================
let score: number = 0;
let timeLeft: number = 10;
let timerId: number | undefined;
let gameRunning: boolean = false;
let highScore: number = Number(safeGetItem("clickerHighScore", "0"));

// ==================== Game Functions ====================

/**
 * Initializes the game state and resets the UI
 */
function initGame(): void {
  score = 0;
  timeLeft = 10;
  gameRunning = false;

  scoreText.textContent = "0";
  timerText.textContent = "10";
  timerText.classList.remove("warning");
  highScoreText.textContent = String(highScore);
  finalMessage.textContent = "";
  finalMessage.classList.remove("new-record");
  confettiContainer.innerHTML = "";

  clickBtn.disabled = false;
  clearInterval(timerId);
}

/**
 * Starts the countdown timer
 */
function startTimer(): void {
  timerId = window.setInterval(() => {
    timeLeft--;
    timerText.textContent = String(timeLeft);

    // Warning effect for last 3 seconds
    if (timeLeft <= 3 && timeLeft > 0) {
      timerText.classList.add("warning");
    }

    if (timeLeft === 0) {
      endGame();
    }
  }, 1000);
}

/**
 * Handles each click on the button
 */
function handleClick(): void {
  // Start game on first click
  if (!gameRunning) {
    gameRunning = true;
    startTimer();
  }

  if (timeLeft > 0) {
    score++;
    scoreText.textContent = String(score);

    // Score bump animation
    scoreText.classList.remove("bump");
    void (scoreText as HTMLElement).offsetWidth;
    scoreText.classList.add("bump");

    // Pop animation - remove and re-add class to trigger
    clickBtn.classList.remove("pop");
    void (clickBtn as HTMLElement).offsetWidth; // Trigger reflow to restart animation
    clickBtn.classList.add("pop");
  }
}

/**
 * Returns a message based on the player's score using switch statement
 * @param playerScore - The player's final score
 * @returns A message corresponding to score tier
 */
function getScoreMessage(playerScore: number): string {
  // Determine score tier
  let tier: ScoreTier;
  if (playerScore >= 50) tier = "legendary";
  else if (playerScore >= 40) tier = "amazing";
  else if (playerScore >= 30) tier = "great";
  else if (playerScore >= 20) tier = "good";
  else if (playerScore >= 10) tier = "okay";
  else tier = "low";

  // Return message based on tier using switch
  switch (tier) {
    case "legendary":
      return "🔥 Legendary! You're insane!";
    case "amazing":
      return "🏆 Amazing! Pro clicker!";
    case "great":
      return "👏 Great job!";
    case "good":
      return "👍 Not bad!";
    case "okay":
      return "🙂 Keep practicing!";
    default:
      return "😅 You can do better!";
  }
}

/**
 * Ends the game and checks for high score
 */
function endGame(): void {
  clearInterval(timerId);
  clickBtn.disabled = true;
  gameRunning = false;
  timerText.classList.remove("warning");
  timerText.textContent = "0";
  
  // Show final score message
  finalMessage.textContent = getScoreMessage(score);
  
  // Check and update high score in localStorage
  if (score > highScore) {
    highScore = score;
    safeSetItem("clickerHighScore", highScore);
    highScoreText.textContent = String(highScore);
    finalMessage.textContent = "🎉 NEW HIGH SCORE! " + getScoreMessage(score);
    finalMessage.classList.add("new-record");
    createConfetti(confettiContainer, "arcade");
  }
}

// ==================== Event Listeners ====================
clickBtn.addEventListener("click", handleClick);
restartBtn.addEventListener("click", initGame);

/**
 * Keyboard support - Space or Enter to click, R to restart
 */
document.addEventListener("keydown", function(e: KeyboardEvent): void {
  // Space or Enter to click (prevent page scroll with Space)
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    if (!clickBtn.disabled) {
      handleClick();
    }
  }
  
  // R to restart game
  if (e.key === "r" || e.key === "R") {
    initGame();
  }
});

// ==================== Initialize ====================
initGame();
