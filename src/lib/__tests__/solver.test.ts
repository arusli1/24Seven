import { describe, expect, it } from 'vitest';
import { solvePuzzle } from '../solver';

describe('solver', () => {
  it('finds a solution when one exists', () => {
    const result = solvePuzzle([1, 3, 4, 6]);
    expect(result).not.toBeNull();
    expect(result?.expression).toBeTruthy();
  });
});
