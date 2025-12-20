const clickBtn = document.getElementById("clickBtn");
const restartBtn = document.getElementById("restartBtn");
const timerText = document.getElementById("timer");
const scoreText = document.getElementById("score");

let score;
let timeLeft;
let timerId;
let gameRunning;

function initGame() {
  score = 0;
  timeLeft = 10;
  gameRunning = false;

  scoreText.textContent = "Score: 0";
  timerText.textContent = "Time left: 10";

  clickBtn.disabled = false;
  clearInterval(timerId);
}

function startTimer() {
  timerId = setInterval(() => {
    timeLeft--;
    timerText.textContent = `Time left: ${timeLeft}`;

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
    scoreText.textContent = `Score: ${score}`;
  }
}

function endGame() {
  clearInterval(timerId);
  clickBtn.disabled = true;
  gameRunning = false;
  timerText.textContent = "Time's up!";
}

clickBtn.addEventListener("click", handleClick);
restartBtn.addEventListener("click", initGame);

initGame();
