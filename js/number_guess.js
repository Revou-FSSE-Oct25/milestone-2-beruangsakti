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

let secretNumber;
let attemptsLeft;
let attemptsUsed;
let gameOver;
let guesses = [];
let bestScore = localStorage.getItem("guessGameBest") || null;
let winStreak = Number(localStorage.getItem("guessGameStreak")) || 0;
let rangeMin = 1;
let rangeMax = 100;

function initGame() {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  attemptsLeft = 9;
  attemptsUsed = 0;
  gameOver = false;
  guesses = [];
  rangeMin = 1;
  rangeMax = 100;

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

function addGuessToHistory(guess, result) {
  const chip = document.createElement("span");
  chip.classList.add("guess-chip", result);
  
  let arrow = "";
  if (result === "high") arrow = " ↑";
  if (result === "low") arrow = " ↓";
  if (result === "correct") arrow = " ✓";
  
  chip.textContent = guess + arrow;
  guessHistory.appendChild(chip);
}

function checkGuess() {
  if (gameOver) return;

  const guess = Number(guessInput.value);

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

  if (guess === secretNumber) {
    feedback.textContent = `🎉 Case closed! Solved in ${attemptsUsed} ${attemptsUsed === 1 ? "interrogation" : "interrogations"}!`;
    feedback.className = "feedback-box case-notes correct";
    addGuessToHistory(guess, "correct");
    
    // Update win streak
    winStreak++;
    localStorage.setItem("guessGameStreak", winStreak);
    winStreakText.textContent = winStreak;
    
    // Check for new best score
    if (!bestScore || attemptsUsed < bestScore) {
      bestScore = attemptsUsed;
      localStorage.setItem("guessGameBest", bestScore);
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
    localStorage.setItem("guessGameStreak", winStreak);
    winStreakText.textContent = winStreak;
    endGame();
  }

  guessInput.value = "";
  guessInput.focus();
}

function endGame() {
  gameOver = true;
  guessInput.disabled = true;
  guessBtn.disabled = true;
}

function updateRangeHint() {
  rangeHintText.textContent = `Suspect range: ${rangeMin} - ${rangeMax}`;
  rangeHintText.classList.add("range-updated");
  setTimeout(() => rangeHintText.classList.remove("range-updated"), 300);
}

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

guessBtn.addEventListener("click", checkGuess);

guessInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    checkGuess();
  }
});

restartBtn.addEventListener("click", initGame);

initGame();
