import { parseExpression, ParseError, tokenize } from './parser';
import { Rational } from './rational';
import type { ValidationResult } from './types';

const allowedPattern = /^[0-9+\-*/()\s]+$/;
const TARGET = new Rational(24, 1);

export function validateExpression(expression: string, numbers: number[]): ValidationResult {
  if (!expression.trim()) {
    return { ok: false, reason: 'Enter an expression first.' };
  }

  if (!allowedPattern.test(expression)) {
    return { ok: false, reason: 'Only digits, +, -, *, /, parentheses, and spaces are allowed.' };
  }

  let tokens;
  try {
    tokens = tokenize(expression);
  } catch (error) {
    return { ok: false, reason: error instanceof ParseError ? error.message : 'Unexpected parse error.' };
  }

  const counts: Record<string, number> = {};
  numbers.forEach((value) => {
    const key = String(value);
    counts[key] = (counts[key] || 0) + 1;
  });

  for (const token of tokens) {
    if (token.type !== 'number') continue;
    const value = Number(token.value);
    const key = String(value);
    if (!counts[key]) {
      return { ok: false, reason: `${value} is not part of this puzzle.` };
    }
    counts[key] -= 1;
  }

  const unused = Object.values(counts).filter((count) => count > 0);
  if (unused.length > 0) {
    return { ok: false, reason: 'Use each card exactly once.' };
  }

  try {
    const parsed = parseExpression(expression);
    if (!parsed.value.equals(TARGET)) {
      return {
        ok: false,
        reason: `Result is ${parsed.value.toString()}, not 24.`
      };
    }
    return {
      ok: true,
      result: parsed.value.toNumber(),
      normalizedExpression: parsed.normalizedExpression
    };
  } catch (error) {
    if (error instanceof ParseError) {
      return { ok: false, reason: error.message };
    }
    if (error instanceof Error && error.message.includes('Denominator cannot be zero')) {
      return { ok: false, reason: 'Division by zero detected.' };
    }
    return { ok: false, reason: 'Invalid expression.' };
  }
}
