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

// ==================== Game State ====================
let score;
let timeLeft;
let timerId;
let gameRunning;
let highScore = localStorage.getItem("clickerHighScore") || 0;

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
    localStorage.setItem("clickerHighScore", highScore);
    highScoreText.textContent = highScore;
    finalMessage.textContent = "🎉 NEW HIGH SCORE! " + getScoreMessage(score);
  }
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
