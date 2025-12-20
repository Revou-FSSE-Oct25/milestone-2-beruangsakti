const buttons = document.querySelectorAll(".choice-btn");
const playerText = document.getElementById("playerChoice");
const computerText = document.getElementById("computerChoice");
const resultText = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");

const choices = ["rock", "paper", "scissors"];
let gameOver = false;

function getComputerChoice() {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

function determineWinner(player, computer) {
  if (player === computer) {
    return "It's a draw!";
  }

  switch (player) {
    case "rock":
      return computer === "scissors" ? "You win! 🎉" : "You lose 😢";
    case "paper":
      return computer === "rock" ? "You win! 🎉" : "You lose 😢";
    case "scissors":
      return computer === "paper" ? "You win! 🎉" : "You lose 😢";
    default:
      return "";
  }
}

function playGame(playerChoice) {
  if (gameOver) return;

  const computerChoice = getComputerChoice();

  playerText.textContent = `Your choice: ${playerChoice}`;
  computerText.textContent = `Computer choice: ${computerChoice}`;
  resultText.textContent = determineWinner(playerChoice, computerChoice);

  gameOver = true;
}

function restartGame() {
  playerText.textContent = "Your choice: -";
  computerText.textContent = "Computer choice: -";
  resultText.textContent = "Make your move!";
  gameOver = false;
}

buttons.forEach(button => {
  button.addEventListener("click", function () {
    const playerChoice = this.dataset.choice;
    playGame(playerChoice);
  });
});

restartBtn.addEventListener("click", restartGame);
