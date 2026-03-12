import { describe, expect, it } from 'vitest';
import { Rational } from '../rational';

describe('Rational', () => {
  it('reduces fractions automatically', () => {
    const value = new Rational(4, 8);
    expect(value.numerator).toBe(1);
    expect(value.denominator).toBe(2);
  });

  it('adds and subtracts correctly', () => {
    const result = Rational.fromInteger(3).add(new Rational(1, 2));
    expect(result.toString()).toBe('7/2');
  });
});
