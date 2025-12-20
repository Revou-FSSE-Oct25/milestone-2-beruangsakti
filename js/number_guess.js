const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");
const feedback = document.getElementById("feedback");
const attemptsText = document.getElementById("attempts");

let secretNumber;
let attemptsLeft;
let gameOver;

function initGame() {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  attemptsLeft = 5;
  gameOver = false;

  feedback.textContent = "Make your first guess!";
  attemptsText.textContent = "Attempts left: 5";
  guessInput.value = "";
  guessInput.disabled = false;
  guessBtn.disabled = false;
}

function checkGuess() {
  if (gameOver) return;

  const guess = Number(guessInput.value);

  if (!guess || guess < 1 || guess > 100) {
    feedback.textContent = "Enter a number between 1 and 100.";
    return;
  }

  attemptsLeft--;

  if (guess === secretNumber) {
    feedback.textContent = "Correct! You win 🎉";
    endGame();
  } else if (guess > secretNumber) {
    feedback.textContent = "Too high!";
  } else {
    feedback.textContent = "Too low!";
  }

  attemptsText.textContent = `Attempts left: ${attemptsLeft}`;

  if (attemptsLeft === 0 && !gameOver) {
    feedback.textContent = `Game over! The number was ${secretNumber}`;
    endGame();
  }

  guessInput.value = "";
}

function endGame() {
  gameOver = true;
  guessInput.disabled = true;
  guessBtn.disabled = true;
}

guessBtn.addEventListener("click", checkGuess);

guessInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    checkGuess();
  }
});

restartBtn.addEventListener("click", initGame);

initGame();
