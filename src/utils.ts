/**
 * Shared Utility Functions
 * Common helpers used across all games
 */

// ==================== Storage Helpers ====================

/**
 * Safely retrieves an item from localStorage
 * @param key - The storage key
 * @param defaultValue - Default value if retrieval fails
 * @returns The stored value or default
 */
export function safeGetItem(key: string, defaultValue: string): string;
export function safeGetItem(key: string, defaultValue: null): string | null;
export function safeGetItem(key: string, defaultValue: string | null): string | null {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (e) {
    console.warn("localStorage not available:", (e as Error).message);
    return defaultValue;
  }
}

/**
 * Safely stores an item in localStorage
 * @param key - The storage key
 * @param value - The value to store
 */
export function safeSetItem(key: string, value: string | number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    console.warn("localStorage not available:", (e as Error).message);
  }
}

// ==================== Animation Helpers ====================

/**
 * Default confetti colors for each game theme
 */
export const CONFETTI_COLORS = {
  arcade: ["#38bdf8", "#f43f5e", "#fbbf24", "#22c55e", "#a78bfa", "#fb7185"],
  detective: ["#a78bfa", "#4ade80", "#fbbf24", "#f87171", "#60a5fa", "#38bdf8"],
  samurai: ["#d4af37", "#8b0000", "#22c55e", "#fbbf24", "#dc2626", "#fef2f2"]
} as const;

export type ConfettiTheme = keyof typeof CONFETTI_COLORS;

/**
 * Creates confetti animation for celebrations
 * @param container - The DOM element to append confetti to
 * @param theme - The color theme to use ('arcade' | 'detective' | 'samurai')
 * @param count - Number of confetti pieces (default: 50)
 */
export function createConfetti(
  container: HTMLElement,
  theme: ConfettiTheme = "arcade",
  count: number = 50
): void {
  const colors = CONFETTI_COLORS[theme];
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + "s";
    confetti.style.animationDuration = (Math.random() * 1 + 2) + "s";
    container.appendChild(confetti);
  }
  
  // Clean up confetti after animation
  setTimeout(() => {
    container.innerHTML = "";
  }, 3000);
}
