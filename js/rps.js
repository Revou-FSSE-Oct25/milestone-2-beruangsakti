/**
 * Rock Paper Scissors - Samurai Dojo Theme
 * Best of 5 rounds against the Sensei!
 * Features: Round tracking, lifetime stats with localStorage
 */

// ==================== DOM Elements ====================
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

// ==================== Game Data ====================
const choices = ["rock", "paper", "scissors"];  // Array of valid choices
const emojis = { rock: "🪨", paper: "📜", scissors: "✂️" };  // Object mapping choices to emojis

// ==================== Game State ====================
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

// ==================== Game Functions ====================

/**
 * Initializes a new match and resets all scores
 */
function initMatch() {
  playerScore = 0;
  computerScore = 0;
  currentRound = 1;
  roundOver = false;
  matchOver = false;

  // Reset UI elements
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

/**
 * Updates the lifetime stats display from localStorage
 */
function updateLifetimeStats() {
  totalWinsEl.textContent = totalWins;
  totalLossesEl.textContent = totalLosses;
  totalDrawsEl.textContent = totalDraws;
}

/**
 * Randomly selects computer's choice from the choices array
 * @returns {string} "rock", "paper", or "scissors"
 */
function getComputerChoice() {
  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * Determines the winner using logical operators
 * @param {string} player - Player's choice
 * @param {string} computer - Computer's choice
 * @returns {string} "player", "computer", or "draw"
 */
function determineWinner(player, computer) {
  if (player === computer) return "draw";
  
  // Win conditions using logical AND (&&) and OR (||)
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "player";
  }
  return "computer";
}

/**
 * Plays a single round of RPS
 * @param {string} playerChoice - The player's weapon choice
 */
function playRound(playerChoice) {
  if (roundOver || matchOver) return;

  const computerChoice = getComputerChoice();
  const winner = determineWinner(playerChoice, computerChoice);

  // Display choices with emojis from object
  playerChoiceEl.textContent = emojis[playerChoice];
  computerChoiceEl.textContent = emojis[computerChoice];
  
  // Add reveal animation classes
  playerChoiceEl.classList.add("reveal");
  computerChoiceEl.classList.add("reveal");

  // Update scores and result based on winner
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

/**
 * Advances to the next round and resets round state
 */
function nextRound() {
  currentRound++;
  currentRoundEl.textContent = currentRound;
  roundOver = false;

  // Reset choice displays
  playerChoiceEl.textContent = "?";
  computerChoiceEl.textContent = "?";
  playerChoiceEl.className = "choice-display";
  computerChoiceEl.className = "choice-display";
  resultBox.textContent = "Choose your weapon!";
  resultBox.className = "result-box";
  nextRoundBtn.classList.add("hidden");

  enableWeapons();
}

/**
 * Ends the match and displays final result
 * Updates lifetime stats in localStorage
 * @param {string} winner - "player", "computer", or "draw"
 */
function endMatch(winner) {
  matchOver = true;
  nextRoundBtn.classList.add("hidden");
  matchResultEl.classList.remove("hidden");

  // Handle match result with switch statement
  switch (winner) {
    case "player":
      matchResultEl.textContent = "🏆 VICTORY! You are the champion!";
      matchResultEl.classList.add("victory");
      totalWins++;
      localStorage.setItem("rpsWins", totalWins);
      break;
    case "computer":
      matchResultEl.textContent = "🗡️ DEFEAT! Sensei prevails...";
      matchResultEl.classList.add("defeat");
      totalLosses++;
      localStorage.setItem("rpsLosses", totalLosses);
      break;
    default:
      matchResultEl.textContent = "⚖️ STALEMATE! Honor is shared.";
      matchResultEl.classList.add("stalemate");
      totalDraws++;
      localStorage.setItem("rpsDraws", totalDraws);
  }

  updateLifetimeStats();
}

/**
 * Disables all weapon buttons
 */
function disableWeapons() {
  weaponBtns.forEach(btn => btn.disabled = true);
}

/**
 * Enables all weapon buttons
 */
function enableWeapons() {
  weaponBtns.forEach(btn => btn.disabled = false);
}

// ==================== Event Listeners ====================

// Add click listener to each weapon button using forEach
weaponBtns.forEach(btn => {
  btn.addEventListener("click", function() {
    playRound(this.dataset.choice);  // Get choice from data attribute
  });
});

nextRoundBtn.addEventListener("click", nextRound);
newMatchBtn.addEventListener("click", initMatch);

/**
 * Keyboard support:
 * 1/R = Rock, 2/P = Paper, 3/S = Scissors
 * Enter/Space = Next round, N = New match
 */
document.addEventListener("keydown", function(e) {
  // Weapon selection (only when round is active)
  if (!roundOver && !matchOver) {
    switch (e.key.toLowerCase()) {
      case "1":
      case "r":
        playRound("rock");
        break;
      case "2":
      case "p":
        playRound("paper");
        break;
      case "3":
      case "s":
        playRound("scissors");
        break;
    }
  }
  
  // Next round with Enter or Space
  if ((e.key === "Enter" || e.key === " ") && roundOver && !matchOver) {
    e.preventDefault();
    nextRound();
  }
  
  // New match with N key
  if (e.key === "n" || e.key === "N") {
    initMatch();
  }
});

// ==================== Initialize ====================
initMatch();
