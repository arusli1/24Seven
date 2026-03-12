export type DifficultyTier = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface Puzzle {
  id: string;
  numbers: [number, number, number, number];
  difficulty: number;
  tier: DifficultyTier;
  solveRate?: number;
  solutions?: string[];
}

export interface ValidationSuccess {
  ok: true;
  result: number;
  normalizedExpression: string;
}

export interface ValidationFailure {
  ok: false;
  reason: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export interface SolutionHint {
  description: string;
  expression?: string;
}

export interface SpeedrunSummary {
  puzzlesSolved: number;
  totalAttempts: number;
  invalidAttempts: number;
  averageSolveMs: number;
  timeLimit: number;
}
