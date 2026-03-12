export class Rational {
  readonly numerator: number;
  readonly denominator: number;

  constructor(numerator: number, denominator = 1) {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero');
    }
    const sign = denominator < 0 ? -1 : 1;
    const normalizedNumerator = numerator * sign;
    const normalizedDenominator = Math.abs(denominator);
    const divisor = gcd(Math.abs(normalizedNumerator), normalizedDenominator);
    this.numerator = normalizedNumerator / divisor;
    this.denominator = normalizedDenominator / divisor;
  }

  static fromInteger(value: number) {
    return new Rational(value, 1);
  }

  add(other: Rational) {
    return new Rational(this.numerator * other.denominator + other.numerator * this.denominator, this.denominator * other.denominator);
  }

  sub(other: Rational) {
    return new Rational(this.numerator * other.denominator - other.numerator * this.denominator, this.denominator * other.denominator);
  }

  mul(other: Rational) {
    return new Rational(this.numerator * other.numerator, this.denominator * other.denominator);
  }

  div(other: Rational) {
    if (other.numerator === 0) {
      throw new Error('Division by zero');
    }
    return new Rational(this.numerator * other.denominator, this.denominator * other.numerator);
  }

  equals(other: Rational) {
    return this.numerator === other.numerator && this.denominator === other.denominator;
  }

  toNumber() {
    return this.numerator / this.denominator;
  }

  toString() {
    if (this.denominator === 1) {
      return `${this.numerator}`;
    }
    return `${this.numerator}/${this.denominator}`;
  }
}

export function gcd(a: number, b: number): number {
  let x = a;
  let y = b;
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}
