/**
 * Gomoku (Five in a Row) Game
 * A 15x15 board where players take turns placing stones
 * First to get 5 in a row (horizontal, vertical, or diagonal) wins!
 * Features: Undo, win detection, score tracking, AI opponent
 */

import { safeGetItem, safeSetItem, createConfetti } from "./utils.js";

// ==================== Type Definitions ====================
type Player = "black" | "white";
type CellState = Player | null;
type GameMode = "pvp" | "pve";
type Difficulty = "easy" | "medium" | "hard" | "impossible";

interface Move {
  row: number;
  col: number;
  player: Player;
}

interface WinResult {
  winner: Player;
  cells: Array<{ row: number; col: number }>;
}

// ==================== Constants ====================
const BOARD_SIZE = 15;
const WIN_LENGTH = 5;

// Star points for traditional Go board aesthetics (3-3, 3-9, 3-15, etc.)
const STAR_POINTS: Array<{ row: number; col: number }> = [
  { row: 3, col: 3 }, { row: 3, col: 7 }, { row: 3, col: 11 },
  { row: 7, col: 3 }, { row: 7, col: 7 }, { row: 7, col: 11 },
  { row: 11, col: 3 }, { row: 11, col: 7 }, { row: 11, col: 11 }
];

// ==================== DOM Elements ====================
const boardEl = document.getElementById("board") as HTMLDivElement;
const currentPlayerEl = document.getElementById("currentPlayer") as HTMLSpanElement;
const turnTextEl = document.getElementById("turnText") as HTMLSpanElement;
const blackWinsEl = document.getElementById("blackWins") as HTMLSpanElement;
const whiteWinsEl = document.getElementById("whiteWins") as HTMLSpanElement;
const blackLabelEl = document.getElementById("blackLabel") as HTMLSpanElement;
const whiteLabelEl = document.getElementById("whiteLabel") as HTMLSpanElement;
const drawsEl = document.getElementById("draws") as HTMLSpanElement;
const gameResultEl = document.getElementById("gameResult") as HTMLDivElement;
const resultTextEl = document.getElementById("resultText") as HTMLSpanElement;
const undoBtn = document.getElementById("undoBtn") as HTMLButtonElement;
const restartBtn = document.getElementById("restartBtn") as HTMLButtonElement;
const confettiContainer = document.getElementById("confetti-container") as HTMLDivElement;

// Mode selector elements
const pvpBtn = document.getElementById("pvpBtn") as HTMLButtonElement;
const pveBtn = document.getElementById("pveBtn") as HTMLButtonElement;
const difficultySelector = document.getElementById("difficultySelector") as HTMLDivElement;
const easyBtn = document.getElementById("easyBtn") as HTMLButtonElement;
const mediumBtn = document.getElementById("mediumBtn") as HTMLButtonElement;
const hardBtn = document.getElementById("hardBtn") as HTMLButtonElement;
const impossibleBtn = document.getElementById("impossibleBtn") as HTMLButtonElement;

// ==================== Game State ====================
let board: CellState[][] = [];
let currentPlayer: Player = "black";
let gameOver: boolean = false;
let moveHistory: Move[] = [];
let gameMode: GameMode = "pvp";
let difficulty: Difficulty = "medium";
let isAIThinking: boolean = false;

// Stats from localStorage
let blackWins: number = Number(safeGetItem("gomokuBlackWins", "0"));
let whiteWins: number = Number(safeGetItem("gomokuWhiteWins", "0"));
let draws: number = Number(safeGetItem("gomokuDraws", "0"));

// ==================== Game Functions ====================

/**
 * Initializes the game board and resets state
 */
function initGame(): void {
  // Create empty board
  board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = null;
    }
  }
  
  currentPlayer = "black";
  gameOver = false;
  moveHistory = [];
  isAIThinking = false;
  
  // Update UI
  updateTurnIndicator();
  updateStats();
  updateLabels();
  gameResultEl.classList.add("hidden");
  gameResultEl.className = "game-result hidden";
  confettiContainer.innerHTML = "";
  undoBtn.disabled = true;
  
  // Render board
  renderBoard();
}

/**
 * Updates labels based on game mode
 */
function updateLabels(): void {
  if (gameMode === "pve") {
    blackLabelEl.textContent = "⚫ You";
    whiteLabelEl.textContent = "🤖 AI";
  } else {
    blackLabelEl.textContent = "⚫ Black";
    whiteLabelEl.textContent = "⚪ White";
  }
}

/**
 * Renders the game board with all cells
 */
function renderBoard(): void {
  boardEl.innerHTML = "";
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Row ${row + 1}, Column ${col + 1}`);
      
      // Add star point marker for traditional aesthetics
      const isStarPoint = STAR_POINTS.some(
        point => point.row === row && point.col === col
      );
      if (isStarPoint) {
        cell.classList.add("star-point");
      }
      
      // Add stone if present
      const stone = board[row][col];
      if (stone) {
        const stonePiece = document.createElement("div");
        stonePiece.className = `stone-piece ${stone}`;
        cell.appendChild(stonePiece);
        cell.classList.add("occupied");
      }
      
      // Add click handler
      cell.addEventListener("click", () => handleCellClick(row, col));
      
      boardEl.appendChild(cell);
    }
  }
}

/**
 * Handles click on a board cell
 * @param row - Row index
 * @param col - Column index
 */
function handleCellClick(row: number, col: number): void {
  if (gameOver) return;
  if (board[row][col] !== null) return;
  if (isAIThinking) return;
  
  // In PvE mode, only allow player to place black stones
  if (gameMode === "pve" && currentPlayer === "white") return;
  
  // Place stone
  placeStone(row, col);
}

/**
 * Places a stone on the board
 * @param row - Row index
 * @param col - Column index
 */
function placeStone(row: number, col: number): void {
  board[row][col] = currentPlayer;
  moveHistory.push({ row, col, player: currentPlayer });
  undoBtn.disabled = gameMode === "pve"; // Disable undo in AI mode for simplicity
  
  // Update UI
  updateCell(row, col);
  
  // Check for win
  const winResult = checkWin(row, col);
  if (winResult) {
    endGame(winResult);
    return;
  }
  
  // Check for draw (board full)
  if (moveHistory.length === BOARD_SIZE * BOARD_SIZE) {
    endGame(null);
    return;
  }
  
  // Switch player
  currentPlayer = currentPlayer === "black" ? "white" : "black";
  updateTurnIndicator();
  
  // If PvE mode and it's AI's turn, make AI move
  if (gameMode === "pve" && currentPlayer === "white" && !gameOver) {
    makeAIMove();
  }
}

/**
 * Updates a single cell's display
 * @param row - Row index
 * @param col - Column index
 */
function updateCell(row: number, col: number): void {
  const cellIndex = row * BOARD_SIZE + col;
  const cell = boardEl.children[cellIndex] as HTMLDivElement;
  
  // Remove existing stone if any
  const existingStone = cell.querySelector(".stone-piece");
  if (existingStone) {
    existingStone.remove();
  }
  
  const stone = board[row][col];
  if (stone) {
    const stonePiece = document.createElement("div");
    stonePiece.className = `stone-piece ${stone}`;
    cell.appendChild(stonePiece);
    cell.classList.add("occupied");
  } else {
    cell.classList.remove("occupied", "winning");
  }
}

/**
 * Updates the turn indicator display
 */
function updateTurnIndicator(): void {
  currentPlayerEl.className = `current-stone ${currentPlayer}`;
  
  if (gameMode === "pve") {
    if (currentPlayer === "black") {
      turnTextEl.textContent = "Your Turn";
    } else {
      turnTextEl.textContent = "AI Thinking...";
    }
  } else {
    turnTextEl.textContent = currentPlayer === "black" ? "Black's Turn" : "White's Turn";
  }
}

/**
 * Updates the stats display
 */
function updateStats(): void {
  blackWinsEl.textContent = String(blackWins);
  whiteWinsEl.textContent = String(whiteWins);
  drawsEl.textContent = String(draws);
}

/**
 * Checks if the last move resulted in a win
 * @param row - Row of last move
 * @param col - Column of last move
 * @returns WinResult if winner found, null otherwise
 */
function checkWin(row: number, col: number): WinResult | null {
  const player = board[row][col];
  if (!player) return null;
  
  // Directions: horizontal, vertical, diagonal, anti-diagonal
  const directions: Array<{ dr: number; dc: number }> = [
    { dr: 0, dc: 1 },   // horizontal
    { dr: 1, dc: 0 },   // vertical
    { dr: 1, dc: 1 },   // diagonal
    { dr: 1, dc: -1 }   // anti-diagonal
  ];
  
  for (const { dr, dc } of directions) {
    const cells: Array<{ row: number; col: number }> = [{ row, col }];
    
    // Check positive direction
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      cells.push({ row: r, col: c });
      r += dr;
      c += dc;
    }
    
    // Check negative direction
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      cells.push({ row: r, col: c });
      r -= dr;
      c -= dc;
    }
    
    if (cells.length >= WIN_LENGTH) {
      return { winner: player, cells };
    }
  }
  
  return null;
}

/**
 * Ends the game and displays result
 * @param winResult - Win result or null for draw
 */
function endGame(winResult: WinResult | null): void {
  gameOver = true;
  gameResultEl.classList.remove("hidden");
  
  if (winResult) {
    // Highlight winning cells
    for (const { row, col } of winResult.cells) {
      const cellIndex = row * BOARD_SIZE + col;
      const cell = boardEl.children[cellIndex] as HTMLDivElement;
      cell.classList.add("winning");
    }
    
    // Update result display
    const winnerName = winResult.winner === "black" ? "Black" : "White";
    resultTextEl.textContent = `🏆 ${winnerName} Wins!`;
    gameResultEl.classList.add(`${winResult.winner}-wins`);
    
    // Update stats
    if (winResult.winner === "black") {
      blackWins++;
      safeSetItem("gomokuBlackWins", blackWins);
    } else {
      whiteWins++;
      safeSetItem("gomokuWhiteWins", whiteWins);
    }
    
    // Confetti for winner!
    createConfetti(confettiContainer, "samurai", 60);
  } else {
    // Draw
    resultTextEl.textContent = "🤝 It's a Draw!";
    gameResultEl.classList.add("draw");
    draws++;
    safeSetItem("gomokuDraws", draws);
  }
  
  updateStats();
}

/**
 * Undoes the last move
 */
function undoMove(): void {
  if (moveHistory.length === 0 || gameOver) return;
  if (gameMode === "pve") return; // Disable undo in AI mode
  
  const lastMove = moveHistory.pop()!;
  board[lastMove.row][lastMove.col] = null;
  currentPlayer = lastMove.player;
  
  updateCell(lastMove.row, lastMove.col);
  updateTurnIndicator();
  
  if (moveHistory.length === 0) {
    undoBtn.disabled = true;
  }
  
  // Remove winning highlights if any
  const winningCells = boardEl.querySelectorAll(".winning");
  winningCells.forEach(cell => cell.classList.remove("winning"));
  
  // Reset game over state if needed
  if (gameOver) {
    gameOver = false;
    gameResultEl.classList.add("hidden");
    confettiContainer.innerHTML = "";
  }
}

// ==================== AI Logic ====================

/**
 * Makes an AI move based on current difficulty
 */
function makeAIMove(): void {
  if (gameOver || currentPlayer !== "white") return;
  
  isAIThinking = true;
  boardEl.classList.add("ai-thinking");
  
  // Add a small delay to make AI feel more natural
  const delay = difficulty === "easy" ? 300 : difficulty === "medium" ? 500 : 700;
  
  setTimeout(() => {
    const move = calculateAIMove();
    if (move) {
      placeStone(move.row, move.col);
    }
    isAIThinking = false;
    boardEl.classList.remove("ai-thinking");
  }, delay);
}

/**
 * Calculates the best move for AI based on difficulty
 * @returns The best move coordinates
 */
function calculateAIMove(): { row: number; col: number } | null {
  const emptyCells = getEmptyCells();
  if (emptyCells.length === 0) return null;
  
  // Easy: 60% smart with 50% noise, 40% random
  if (difficulty === "easy") {
    if (Math.random() < 0.6) {
      const smartMove = findBestMove(0.5);
      if (smartMove) return smartMove;
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  // Medium: 70% smart with 40% noise, 30% random
  if (difficulty === "medium") {
    if (Math.random() < 0.7) {
      const smartMove = findBestMove(0.4);
      if (smartMove) return smartMove;
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  // Hard: 80% smart with 20% noise, 20% random
  if (difficulty === "hard") {
    if (Math.random() < 0.8) {
      const smartMove = findBestMove(0.2);
      if (smartMove) return smartMove;
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  // Impossible: 100% smart, 0% noise - perfect play
  return findBestMove(0);
}

/**
 * Gets all empty cells on the board
 */
function getEmptyCells(): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

/**
 * Finds the best move using scoring system
 * @param noise - Score randomness factor (0 = perfect, 0.5 = 50% noise)
 */
function findBestMove(noise: number): { row: number; col: number } | null {
  const candidates = getCandidateMoves();
  if (candidates.length === 0) {
    // First move - play center
    return { row: 7, col: 7 };
  }
  
  let bestScore = -Infinity;
  let bestMove: { row: number; col: number } | null = null;
  
  for (const cell of candidates) {
    let score = evaluateMove(cell.row, cell.col);
    
    // Add noise to make AI imperfect (but never miss winning/blocking moves)
    if (noise > 0 && score < 50000) {
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * noise;
      score = score * randomFactor;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = cell;
    }
  }
  
  return bestMove;
}

/**
 * Gets candidate moves (cells near existing stones)
 */
function getCandidateMoves(): Array<{ row: number; col: number }> {
  const candidates = new Set<string>();
  const range = 2; // Look at cells within 2 squares of existing stones
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) {
        // Add nearby empty cells as candidates
        for (let dr = -range; dr <= range; dr++) {
          for (let dc = -range; dc <= range; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
              candidates.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }
  
  return Array.from(candidates).map(s => {
    const [row, col] = s.split(",").map(Number);
    return { row, col };
  });
}

/**
 * Evaluates a move's score
 * @param row - Row index
 * @param col - Column index
 */
function evaluateMove(row: number, col: number): number {
  let score = 0;
  
  // Score for AI (white) - offensive
  board[row][col] = "white";
  score += evaluatePosition(row, col, "white") * 1.1; // Slight offensive preference
  
  // Check if this move wins
  if (checkWin(row, col)) {
    board[row][col] = null;
    return 100000; // Winning move!
  }
  
  board[row][col] = null;
  
  // Score for blocking player (black) - defensive
  board[row][col] = "black";
  const blockScore = evaluatePosition(row, col, "black");
  
  // Check if blocking a winning move
  if (checkWin(row, col)) {
    board[row][col] = null;
    return 90000; // Must block!
  }
  
  score += blockScore;
  board[row][col] = null;
  
  // Center preference (slight bonus for center positions)
  const centerDist = Math.abs(row - 7) + Math.abs(col - 7);
  score += (14 - centerDist) * 2;
  
  return score;
}

/**
 * Evaluates a position's threat level for a player
 * @param row - Row index
 * @param col - Column index  
 * @param player - Player to evaluate for
 */
function evaluatePosition(row: number, col: number, player: Player): number {
  let score = 0;
  
  const directions: Array<{ dr: number; dc: number }> = [
    { dr: 0, dc: 1 },   // horizontal
    { dr: 1, dc: 0 },   // vertical
    { dr: 1, dc: 1 },   // diagonal
    { dr: 1, dc: -1 }   // anti-diagonal
  ];
  
  for (const { dr, dc } of directions) {
    const lineScore = evaluateLine(row, col, dr, dc, player);
    score += lineScore;
  }
  
  return score;
}

/**
 * Evaluates a line in one direction
 */
function evaluateLine(row: number, col: number, dr: number, dc: number, player: Player): number {
  let count = 1;
  let openEnds = 0;
  
  // Check positive direction
  let r = row + dr;
  let c = col + dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
    openEnds++;
  }
  
  // Check negative direction
  r = row - dr;
  c = col - dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r -= dr;
    c -= dc;
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
    openEnds++;
  }
  
  // Score based on count and open ends
  return getLineScore(count, openEnds);
}

/**
 * Returns score for a line based on stone count and open ends
 */
function getLineScore(count: number, openEnds: number): number {
  if (count >= 5) return 100000;
  
  if (openEnds === 0) return 0; // Blocked line, no threat
  
  switch (count) {
    case 4:
      return openEnds === 2 ? 10000 : 5000; // Open 4 vs closed 4
    case 3:
      return openEnds === 2 ? 1000 : 100;   // Open 3 vs closed 3
    case 2:
      return openEnds === 2 ? 50 : 10;      // Open 2 vs closed 2
    case 1:
      return openEnds === 2 ? 5 : 1;
    default:
      return 0;
  }
}

// ==================== Mode Selection ====================

/**
 * Sets the game mode
 * @param mode - "pvp" or "pve"
 */
function setGameMode(mode: GameMode): void {
  gameMode = mode;
  
  // Update button states
  pvpBtn.classList.toggle("active", mode === "pvp");
  pveBtn.classList.toggle("active", mode === "pve");
  
  // Show/hide difficulty selector
  if (mode === "pve") {
    difficultySelector.classList.remove("hidden");
  } else {
    difficultySelector.classList.add("hidden");
  }
  
  // Restart game with new mode
  initGame();
}

/**
 * Sets the AI difficulty
 * @param diff - Difficulty level
 */
function setDifficulty(diff: Difficulty): void {
  difficulty = diff;
  
  // Update button states
  easyBtn.classList.toggle("active", diff === "easy");
  mediumBtn.classList.toggle("active", diff === "medium");
  hardBtn.classList.toggle("active", diff === "hard");
  impossibleBtn.classList.toggle("active", diff === "impossible");
  
  // Restart game
  initGame();
}

// ==================== Event Listeners ====================
restartBtn.addEventListener("click", initGame);
undoBtn.addEventListener("click", undoMove);

// Mode selection
pvpBtn.addEventListener("click", () => setGameMode("pvp"));
pveBtn.addEventListener("click", () => setGameMode("pve"));

// Difficulty selection
easyBtn.addEventListener("click", () => setDifficulty("easy"));
mediumBtn.addEventListener("click", () => setDifficulty("medium"));
hardBtn.addEventListener("click", () => setDifficulty("hard"));
impossibleBtn.addEventListener("click", () => setDifficulty("impossible"));

/**
 * Keyboard support - U to undo, R to restart
 */
document.addEventListener("keydown", function(e: KeyboardEvent): void {
  if (isAIThinking) return; // Ignore input while AI is thinking
  
  switch (e.key.toLowerCase()) {
    case "u":
      if (!undoBtn.disabled && gameMode === "pvp") {
        undoMove();
      }
      break;
    case "r":
      initGame();
      break;
  }
});

// ==================== Initialize ====================
initGame();
