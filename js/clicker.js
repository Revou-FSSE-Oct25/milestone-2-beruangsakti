const clickBtn = document.getElementById("clickBtn");
const restartBtn = document.getElementById("restartBtn");
const timerText = document.getElementById("timer");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const finalMessage = document.getElementById("finalMessage");

let score;
let timeLeft;
let timerId;
let gameRunning;
let highScore = localStorage.getItem("clickerHighScore") || 0;

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

function handleClick() {
  if (!gameRunning) {
    gameRunning = true;
    startTimer();
  }

  if (timeLeft > 0) {
    score++;
    scoreText.textContent = score;

    // Pop animation
    clickBtn.classList.remove("pop");
    void clickBtn.offsetWidth; // Trigger reflow to restart animation
    clickBtn.classList.add("pop");
  }
}

function getScoreMessage(score) {
  if (score >= 50) return "🔥 Legendary! You're insane!";
  if (score >= 40) return "🏆 Amazing! Pro clicker!";
  if (score >= 30) return "👏 Great job!";
  if (score >= 20) return "👍 Not bad!";
  if (score >= 10) return "🙂 Keep practicing!";
  return "😅 You can do better!";
}

function endGame() {
  clearInterval(timerId);
  clickBtn.disabled = true;
  gameRunning = false;
  timerText.classList.remove("warning");
  timerText.textContent = "0";
  
  // Show final score message
  finalMessage.textContent = getScoreMessage(score);
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("clickerHighScore", highScore);
    highScoreText.textContent = highScore;
    finalMessage.textContent = "🎉 NEW HIGH SCORE! " + getScoreMessage(score);
  }
}

clickBtn.addEventListener("click", handleClick);
restartBtn.addEventListener("click", initGame);

initGame();
