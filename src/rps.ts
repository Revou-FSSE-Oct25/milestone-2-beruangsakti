/**
 * Rock Paper Scissors - Samurai Dojo Theme
 * Best of 5 rounds against the Sensei!
 * Features: Round tracking, lifetime stats with localStorage
 */

import { safeGetItem, safeSetItem, createConfetti } from "./utils.js";

// ==================== Type Definitions ====================
type Choice = "rock" | "paper" | "scissors";
type RoundWinner = "player" | "computer" | "draw";
type MatchWinner = "player" | "computer" | "draw";

interface EmojiMap {
  rock: string;
  paper: string;
  scissors: string;
}

// ==================== DOM Elements ====================
const weaponBtns = document.querySelectorAll<HTMLButtonElement>(".weapon-btn");
const playerChoiceEl = document.getElementById("playerChoice") as HTMLDivElement;
const computerChoiceEl = document.getElementById("computerChoice") as HTMLDivElement;
const resultBox = document.getElementById("resultBox") as HTMLDivElement;
const playerScoreEl = document.getElementById("playerScore") as HTMLSpanElement;
const computerScoreEl = document.getElementById("computerScore") as HTMLSpanElement;
const currentRoundEl = document.getElementById("currentRound") as HTMLSpanElement;
const nextRoundBtn = document.getElementById("nextRoundBtn") as HTMLButtonElement;
const newMatchBtn = document.getElementById("newMatchBtn") as HTMLButtonElement;
const matchResultEl = document.getElementById("matchResult") as HTMLDivElement;
const totalWinsEl = document.getElementById("totalWins") as HTMLSpanElement;
const totalLossesEl = document.getElementById("totalLosses") as HTMLSpanElement;
const totalDrawsEl = document.getElementById("totalDraws") as HTMLSpanElement;
const confettiContainer = document.getElementById("confetti-container") as HTMLDivElement;

// ==================== Game Data ====================
const choices: Choice[] = ["rock", "paper", "scissors"];  // Array of valid choices
const emojis: EmojiMap = { rock: "🪨", paper: "📜", scissors: "✂️" };  // Object mapping choices to emojis

// ==================== Game State ====================
let playerScore: number = 0;
let computerScore: number = 0;
let currentRound: number = 1;
const totalRounds: number = 5;
const winsNeeded: number = 3;
let roundOver: boolean = false;
let matchOver: boolean = false;

// Lifetime stats from localStorage
let totalWins: number = Number(safeGetItem("rpsWins", "0"));
let totalLosses: number = Number(safeGetItem("rpsLosses", "0"));
let totalDraws: number = Number(safeGetItem("rpsDraws", "0"));

// ==================== Game Functions ====================

/**
 * Initializes a new match and resets all scores
 */
function initMatch(): void {
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
  confettiContainer.innerHTML = "";
  
  updateLifetimeStats();
  enableWeapons();
}

/**
 * Updates the lifetime stats display from localStorage
 */
function updateLifetimeStats(): void {
  totalWinsEl.textContent = String(totalWins);
  totalLossesEl.textContent = String(totalLosses);
  totalDrawsEl.textContent = String(totalDraws);
}

/**
 * Randomly selects computer's choice from the choices array
 * @returns "rock", "paper", or "scissors"
 */
function getComputerChoice(): Choice {
  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * Determines the winner using logical operators
 * @param player - Player's choice
 * @param computer - Computer's choice
 * @returns "player", "computer", or "draw"
 */
function determineWinner(player: Choice, computer: Choice): RoundWinner {
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
 * @param playerChoice - The player's weapon choice
 */
function playRound(playerChoice: Choice): void {
  if (roundOver || matchOver) return;

  const computerChoice: Choice = getComputerChoice();
  const winner: RoundWinner = determineWinner(playerChoice, computerChoice);

  // Display choices with emojis from object
  playerChoiceEl.textContent = emojis[playerChoice];
  computerChoiceEl.textContent = emojis[computerChoice];
  
  // Add reveal animation classes
  playerChoiceEl.classList.add("reveal");
  computerChoiceEl.classList.add("reveal");

  // Update scores and result based on winner
  if (winner === "player") {
    playerScore++;
    playerScoreEl.textContent = String(playerScore);
    resultBox.textContent = "🎉 You win this round!";
    resultBox.className = "result-box win";
    playerChoiceEl.classList.add("winner");
    computerChoiceEl.classList.add("loser");
  } else if (winner === "computer") {
    computerScore++;
    computerScoreEl.textContent = String(computerScore);
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
function nextRound(): void {
  currentRound++;
  currentRoundEl.textContent = String(currentRound);
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
 * @param winner - "player", "computer", or "draw"
 */
function endMatch(winner: MatchWinner): void {
  matchOver = true;
  nextRoundBtn.classList.add("hidden");
  matchResultEl.classList.remove("hidden");

  // Handle match result with switch statement
  switch (winner) {
    case "player":
      matchResultEl.textContent = "🏆 VICTORY! You are the champion!";
      matchResultEl.classList.add("victory");
      totalWins++;
      safeSetItem("rpsWins", totalWins);
      createConfetti(confettiContainer, "samurai", 60);
      break;
    case "computer":
      matchResultEl.textContent = "🗡️ DEFEAT! Sensei prevails...";
      matchResultEl.classList.add("defeat");
      totalLosses++;
      safeSetItem("rpsLosses", totalLosses);
      break;
    default:
      matchResultEl.textContent = "⚖️ STALEMATE! Honor is shared.";
      matchResultEl.classList.add("stalemate");
      totalDraws++;
      safeSetItem("rpsDraws", totalDraws);
  }

  updateLifetimeStats();
}

/**
 * Disables all weapon buttons
 */
function disableWeapons(): void {
  weaponBtns.forEach(btn => btn.disabled = true);
}

/**
 * Enables all weapon buttons
 */
function enableWeapons(): void {
  weaponBtns.forEach(btn => btn.disabled = false);
}

// ==================== Event Listeners ====================

// Add click listener to each weapon button using forEach
weaponBtns.forEach(btn => {
  btn.addEventListener("click", function(this: HTMLButtonElement): void {
    const choice = this.dataset.choice as Choice;
    if (choice) {
      playRound(choice);  // Get choice from data attribute
    }
  });
});

nextRoundBtn.addEventListener("click", nextRound);
newMatchBtn.addEventListener("click", initMatch);

/**
 * Keyboard support:
 * 1/R = Rock, 2/P = Paper, 3/S = Scissors
 * Enter/Space = Next round, N = New match
 */
document.addEventListener("keydown", function(e: KeyboardEvent): void {
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
