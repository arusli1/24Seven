import { describe, expect, it } from 'vitest';
import { evaluateRpn, parseExpression, tokenize, toRpn } from '../parser';

describe('parser', () => {
  it('tokenizes input', () => {
    const tokens = tokenize('3 + 4');
    expect(tokens).toHaveLength(3);
  });

  it('evaluates expression', () => {
    const parsed = parseExpression('(8/(3-2))*6');
    expect(parsed.value.toNumber()).toBe(48);
  });

  it('throws for mismatched parentheses', () => {
    expect(() => toRpn(tokenize('(3+4'))).toThrow();
  });

  it('throws for insufficient operands', () => {
    expect(() => evaluateRpn([{ type: 'operator', value: '+' } as any])).toThrow();
  });
});
