import { describe, expect, it } from 'vitest';
import { validateExpression } from '../validate';

describe('validateExpression', () => {
  it('rejects extra numbers', () => {
    const result = validateExpression('5+5+5+5', [1, 3, 4, 6]);
    expect(result.ok).toBe(false);
  });

  it('accepts a valid expression', () => {
    const result = validateExpression('(8/(3-2))*6', [8, 3, 2, 6]);
    expect(result.ok).toBe(true);
  });
});
