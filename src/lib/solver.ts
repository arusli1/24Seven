import { Rational } from './rational';

interface TraceStep {
  operands: [string, string];
  op: string;
  resultExpr: string;
  resultValue: Rational;
}

export interface SolverResult {
  expression: string;
  steps: TraceStep[];
}

const TARGET = new Rational(24, 1);
const cache = new Map<string, SolverResult | null>();

export function solvePuzzle(numbers: number[]): SolverResult | null {
  const key = toKey(numbers.map((n) => Rational.fromInteger(n)));
  if (cache.has(key)) {
    return cache.get(key)!;
  }
  const rationals = numbers.map((n) => Rational.fromInteger(n));
  const exprs = numbers.map((n) => n.toString());
  const result = search(rationals, exprs);
  cache.set(key, result);
  return result;
}

function toKey(values: Rational[]) {
  return values
    .map((value) => `${value.numerator}/${value.denominator}`)
    .sort()
    .join('|');
}

function search(values: Rational[], exprs: string[]): SolverResult | null {
  if (values.length === 1) {
    if (values[0].equals(TARGET)) {
      return { expression: exprs[0], steps: [] };
    }
    return null;
  }

  for (let i = 0; i < values.length; i += 1) {
    for (let j = 0; j < values.length; j += 1) {
      if (i === j) continue;
      const remainingVals: Rational[] = [];
      const remainingExprs: string[] = [];
      for (let k = 0; k < values.length; k += 1) {
        if (k !== i && k !== j) {
          remainingVals.push(values[k]);
          remainingExprs.push(exprs[k]);
        }
      }

      const a = values[i];
      const b = values[j];
      const exprA = exprs[i];
      const exprB = exprs[j];

      for (const combo of combine(a, exprA, b, exprB)) {
        const child = search([...remainingVals, combo.value], [...remainingExprs, combo.expr]);
        if (child) {
          return {
            expression: child.expression,
            steps: [{ operands: [exprA, exprB], op: combo.op, resultExpr: combo.expr, resultValue: combo.value }, ...child.steps]
          };
        }
      }
    }
  }
  return null;
}

function combine(a: Rational, exprA: string, b: Rational, exprB: string) {
  const results: { value: Rational; expr: string; op: string }[] = [];
  results.push({ value: a.add(b), expr: `(${exprA}+${exprB})`, op: '+' });
  results.push({ value: a.sub(b), expr: `(${exprA}-${exprB})`, op: '-' });
  results.push({ value: b.sub(a), expr: `(${exprB}-${exprA})`, op: '-' });
  results.push({ value: a.mul(b), expr: `(${exprA}*${exprB})`, op: '*' });
  if (b.numerator !== 0) {
    results.push({ value: a.div(b), expr: `(${exprA}/${exprB})`, op: '/' });
  }
  if (a.numerator !== 0) {
    results.push({ value: b.div(a), expr: `(${exprB}/${exprA})`, op: '/' });
  }
  return results;
}

export function getHints(numbers: number[]) {
  const solution = solvePuzzle(numbers);
  if (!solution) return [];
  const steps = solution.steps;
  if (steps.length === 0) {
    return [
      {
        description: 'This puzzle evaluates directly to 24 without additional hints.',
        expression: solution.expression
      }
    ];
  }
  const hints = steps.slice(0, 3).map((step, index) => {
    if (index === 0) {
      return {
        description: `Hint 1: Try combining ${step.operands[0]} and ${step.operands[1]} with ${step.op}.`
      };
    }
    if (index === 1) {
      return {
        description: `Hint 2: Aim for ${step.resultExpr} as an intermediate result.`
      };
    }
    return {
      description: 'Full solution',
      expression: solution.expression
    };
  });
  if (hints.length < 3) {
    hints.push({ description: 'Full solution', expression: solution.expression });
  }
  return hints;
}
