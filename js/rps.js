const weaponBtns = document.querySelectorAll(".weapon-btn");
const playerChoiceEl = document.getElementById("playerChoice");
const computerChoiceEl = document.getElementById("computerChoice");
const resultBox = document.getElementById("resultBox");
const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");
const currentRoundEl = document.getElementById("currentRound");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const newMatchBtn = document.getElementById("newMatchBtn");
const matchResultEl = document.getElementById("matchResult");
const totalWinsEl = document.getElementById("totalWins");
const totalLossesEl = document.getElementById("totalLosses");
const totalDrawsEl = document.getElementById("totalDraws");

const choices = ["rock", "paper", "scissors"];
const emojis = { rock: "🪨", paper: "📜", scissors: "✂️" };

let playerScore = 0;
let computerScore = 0;
let currentRound = 1;
let totalRounds = 5;
let winsNeeded = 3;
let roundOver = false;
let matchOver = false;

// Lifetime stats from localStorage
let totalWins = Number(localStorage.getItem("rpsWins")) || 0;
let totalLosses = Number(localStorage.getItem("rpsLosses")) || 0;
let totalDraws = Number(localStorage.getItem("rpsDraws")) || 0;

function initMatch() {
  playerScore = 0;
  computerScore = 0;
  currentRound = 1;
  roundOver = false;
  matchOver = false;

  playerScoreEl.textContent = "0";
  computerScoreEl.textContent = "0";
  currentRoundEl.textContent = "1";
  playerChoiceEl.textContent = "?";
  computerChoiceEl.textContent = "?";
  playerChoiceEl.className = "choice-display";
  computerChoiceEl.className = "choice-display";
  resultBox.textContent = "Choose your weapon!";
  resultBox.className = "result-box";
  matchResultEl.classList.add("hidden");
  matchResultEl.className = "match-result hidden";
  nextRoundBtn.classList.add("hidden");
  
  updateLifetimeStats();
  enableWeapons();
}

function updateLifetimeStats() {
  totalWinsEl.textContent = totalWins;
  totalLossesEl.textContent = totalLosses;
  totalDrawsEl.textContent = totalDraws;
}

function getComputerChoice() {
  return choices[Math.floor(Math.random() * choices.length)];
}

function determineWinner(player, computer) {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "player";
  }
  return "computer";
}

function playRound(playerChoice) {
  if (roundOver || matchOver) return;

  const computerChoice = getComputerChoice();
  const winner = determineWinner(playerChoice, computerChoice);

  // Display choices with animation
  playerChoiceEl.textContent = emojis[playerChoice];
  computerChoiceEl.textContent = emojis[computerChoice];
  
  // Add animation classes
  playerChoiceEl.classList.add("reveal");
  computerChoiceEl.classList.add("reveal");

  // Update scores and result
  if (winner === "player") {
    playerScore++;
    playerScoreEl.textContent = playerScore;
    resultBox.textContent = "🎉 You win this round!";
    resultBox.className = "result-box win";
    playerChoiceEl.classList.add("winner");
    computerChoiceEl.classList.add("loser");
  } else if (winner === "computer") {
    computerScore++;
    computerScoreEl.textContent = computerScore;
    resultBox.textContent = "😔 Sensei wins this round!";
    resultBox.className = "result-box lose";
    computerChoiceEl.classList.add("winner");
    playerChoiceEl.classList.add("loser");
  } else {
    resultBox.textContent = "🤝 It's a draw!";
    resultBox.className = "result-box draw";
  }

  roundOver = true;
  disableWeapons();

  // Check for match winner
  if (playerScore >= winsNeeded) {
    endMatch("player");
  } else if (computerScore >= winsNeeded) {
    endMatch("computer");
  } else if (currentRound >= totalRounds) {
    // All rounds played, determine by score
    if (playerScore > computerScore) {
      endMatch("player");
    } else if (computerScore > playerScore) {
      endMatch("computer");
    } else {
      endMatch("draw");
    }
  } else {
    // Show next round button
    nextRoundBtn.classList.remove("hidden");
  }
}

function nextRound() {
  currentRound++;
  currentRoundEl.textContent = currentRound;
  roundOver = false;

  playerChoiceEl.textContent = "?";
  computerChoiceEl.textContent = "?";
  playerChoiceEl.className = "choice-display";
  computerChoiceEl.className = "choice-display";
  resultBox.textContent = "Choose your weapon!";
  resultBox.className = "result-box";
  nextRoundBtn.classList.add("hidden");

  enableWeapons();
}

function endMatch(winner) {
  matchOver = true;
  nextRoundBtn.classList.add("hidden");
  matchResultEl.classList.remove("hidden");

  if (winner === "player") {
    matchResultEl.textContent = "🏆 VICTORY! You are the champion!";
    matchResultEl.classList.add("victory");
    totalWins++;
    localStorage.setItem("rpsWins", totalWins);
  } else if (winner === "computer") {
    matchResultEl.textContent = "🗡️ DEFEAT! Sensei prevails...";
    matchResultEl.classList.add("defeat");
    totalLosses++;
    localStorage.setItem("rpsLosses", totalLosses);
  } else {
    matchResultEl.textContent = "⚖️ STALEMATE! Honor is shared.";
    matchResultEl.classList.add("stalemate");
    totalDraws++;
    localStorage.setItem("rpsDraws", totalDraws);
  }

  updateLifetimeStats();
}

function disableWeapons() {
  weaponBtns.forEach(btn => btn.disabled = true);
}

function enableWeapons() {
  weaponBtns.forEach(btn => btn.disabled = false);
}

// Event Listeners
weaponBtns.forEach(btn => {
  btn.addEventListener("click", function() {
    playRound(this.dataset.choice);
  });
});

nextRoundBtn.addEventListener("click", nextRound);
newMatchBtn.addEventListener("click", initMatch);

// Initialize
initMatch();
