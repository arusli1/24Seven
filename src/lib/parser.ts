import { Rational } from './rational';

export type TokenType = 'number' | 'operator' | 'paren';

export interface Token {
  type: TokenType;
  value: string;
}

const OPERATORS = new Set(['+', '-', '*', '/']);
const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2
};

const LEFT_ASSOC = new Set(['+', '-', '*', '/']);

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function tokenize(expression: string): Token[] {
  if (!expression.trim()) {
    throw new ParseError('Expression is empty');
  }

  const tokens: Token[] = [];
  const pattern = /\d+|[+\-*/()]|\s+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(expression)) !== null) {
    const value = match[0];
    if (/^\s+$/.test(value)) {
      continue;
    }
    if (/^\d+$/.test(value)) {
      tokens.push({ type: 'number', value });
      continue;
    }
    if (OPERATORS.has(value)) {
      tokens.push({ type: 'operator', value });
      continue;
    }
    if (value === '(' || value === ')') {
      tokens.push({ type: 'paren', value });
      continue;
    }
    throw new ParseError(`Unexpected token "${value}"`);
  }
  return tokens;
}

export function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  tokens.forEach((token, index) => {
    if (token.type === 'number') {
      output.push(token);
      return;
    }

    if (token.type === 'operator') {
      const prev = tokens[index - 1];
      if (!prev || (prev.type === 'operator' && prev.value !== ')') || (prev.type === 'paren' && prev.value === '(')) {
        throw new ParseError('Unary operators are not supported.');
      }
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type === 'operator' &&
          ((LEFT_ASSOC.has(token.value) && PRECEDENCE[token.value] <= PRECEDENCE[top.value]) ||
            PRECEDENCE[token.value] < PRECEDENCE[top.value])) {
          output.push(stack.pop()!);
        } else {
          break;
        }
      }
      stack.push(token);
      return;
    }

    if (token.type === 'paren') {
      if (token.value === '(') {
        stack.push(token);
        return;
      }
      // closing
      let foundOpen = false;
      while (stack.length) {
        const top = stack.pop()!;
        if (top.type === 'paren' && top.value === '(') {
          foundOpen = true;
          break;
        }
        output.push(top);
      }
      if (!foundOpen) {
        throw new ParseError('Mismatched parentheses');
      }
    }
  });

  while (stack.length) {
    const token = stack.pop()!;
    if (token.type === 'paren') {
      throw new ParseError('Mismatched parentheses');
    }
    output.push(token);
  }
  return output;
}

export function evaluateRpn(rpn: Token[]): Rational {
  const stack: Rational[] = [];
  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(Rational.fromInteger(Number(token.value)));
      continue;
    }
    if (token.type === 'operator') {
      if (stack.length < 2) {
        throw new ParseError('Insufficient operands');
      }
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token.value) {
        case '+':
          stack.push(a.add(b));
          break;
        case '-':
          stack.push(a.sub(b));
          break;
        case '*':
          stack.push(a.mul(b));
          break;
        case '/':
          stack.push(a.div(b));
          break;
        default:
          throw new ParseError(`Unknown operator ${token.value}`);
      }
      continue;
    }
    throw new ParseError('Unknown token type in RPN');
  }

  if (stack.length !== 1) {
    throw new ParseError('Expression could not be reduced');
  }
  return stack[0];
}

export function parseExpression(expression: string) {
  const tokens = tokenize(expression);
  const rpn = toRpn(tokens);
  const value = evaluateRpn(rpn);
  return {
    value,
    rpn,
    normalizedExpression: tokens.map((token) => token.value).join(' ')
  };
}
