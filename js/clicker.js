/**
 * Clicker Game - Arcade Style
 * Click as many times as you can in 10 seconds!
 * Features: High score tracking with localStorage
 */

// ==================== DOM Elements ====================
const clickBtn = document.getElementById("clickBtn");
const restartBtn = document.getElementById("restartBtn");
const timerText = document.getElementById("timer");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const finalMessage = document.getElementById("finalMessage");
const confettiContainer = document.getElementById("confetti-container");

// ==================== Game State ====================
let score;
let timeLeft;
let timerId;
let gameRunning;
let highScore = safeGetItem("clickerHighScore", 0);

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
 * Initializes the game state and resets the UI
 */
function initGame() {
  score = 0;
  timeLeft = 10;
  gameRunning = false;

  scoreText.textContent = "0";
  timerText.textContent = "10";
  timerText.classList.remove("warning");
  highScoreText.textContent = highScore;
  finalMessage.textContent = "";
  finalMessage.classList.remove("new-record");
  confettiContainer.innerHTML = "";

  clickBtn.disabled = false;
  clearInterval(timerId);
}

/**
 * Starts the countdown timer
 */
function startTimer() {
  timerId = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;

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
function handleClick() {
  // Start game on first click
  if (!gameRunning) {
    gameRunning = true;
    startTimer();
  }

  if (timeLeft > 0) {
    score++;
    scoreText.textContent = score;

    // Score bump animation
    scoreText.classList.remove("bump");
    void scoreText.offsetWidth;
    scoreText.classList.add("bump");

    // Pop animation - remove and re-add class to trigger
    clickBtn.classList.remove("pop");
    void clickBtn.offsetWidth; // Trigger reflow to restart animation
    clickBtn.classList.add("pop");
  }
}

/**
 * Returns a message based on the player's score using switch statement
 * @param {number} score - The player's final score
 * @returns {string} A message corresponding to score tier
 */
function getScoreMessage(score) {
  // Determine score tier
  let tier;
  if (score >= 50) tier = "legendary";
  else if (score >= 40) tier = "amazing";
  else if (score >= 30) tier = "great";
  else if (score >= 20) tier = "good";
  else if (score >= 10) tier = "okay";
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
function endGame() {
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
    highScoreText.textContent = highScore;
    finalMessage.textContent = "🎉 NEW HIGH SCORE! " + getScoreMessage(score);
    finalMessage.classList.add("new-record");
    createConfetti();
  }
}

/**
 * Creates confetti animation for high score celebration
 */
function createConfetti() {
  const colors = ["#38bdf8", "#f43f5e", "#fbbf24", "#22c55e", "#a78bfa", "#fb7185"];
  
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
clickBtn.addEventListener("click", handleClick);
restartBtn.addEventListener("click", initGame);

/**
 * Keyboard support - Space or Enter to click, R to restart
 */
document.addEventListener("keydown", function(e) {
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
