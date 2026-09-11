/**
 * A small mathematical expression parser and evaluator.
 *
 * This exists so a student can type an answer the way they would write it —
 * "1/2", "0.5", "2^-1", "sqrt(2)/2", "3sin(x)" — and be marked on what the
 * expression MEANS rather than on whether the characters match a stored
 * string. Everything here is deliberately pure and synchronous so it can be
 * unit tested exhaustively.
 */

export class ExpressionError extends Error {}

type TokenType = "number" | "ident" | "op" | "lparen" | "rparen" | "pipe";

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  arcsin: Math.asin,
  arccos: Math.acos,
  arctan: Math.atan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sec: (x) => 1 / Math.cos(x),
  cosec: (x) => 1 / Math.sin(x),
  csc: (x) => 1 / Math.sin(x),
  cot: (x) => 1 / Math.tan(x),
  ln: Math.log,
  log: Math.log10,
  lg: Math.log10,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  exp: Math.exp,
  abs: Math.abs,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

/** Characters students commonly paste in that mean something standard. */
function normaliseInput(raw: string): string {
  return raw
    .replace(/[−–—]/g, "-") // minus sign, en dash, em dash
    .replace(/[×⋅•]/g, "*") // times, dot operator, bullet
    .replace(/[÷]/g, "/")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenise(input: string): Token[] {
  const src = normaliseInput(input);
  const tokens: Token[] = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === " ") {
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      // Scientific notation, but only when the exponent is genuinely numeric —
      // otherwise "2e" is 2 times Euler's number, not a broken float.
      if (j < src.length && (src[j] === "e" || src[j] === "E")) {
        const after = src.slice(j + 1);
        const m = /^[+-]?\d+/.exec(after);
        if (m) j += 1 + m[0].length;
      }
      const value = src.slice(i, j);
      if ((value.match(/\./g) ?? []).length > 1) {
        throw new ExpressionError(`Malformed number "${value}"`);
      }
      tokens.push({ type: "number", value, pos: i });
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < src.length && /[a-zA-Z_]/.test(src[j])) j++;
      let word = src.slice(i, j);
      // Longest-match a known function or constant out of a run of letters, so
      // "2sinx" tokenises as 2 * sin(x) rather than as a variable called sinx.
      const known = matchLeadingWord(word);
      if (known && known.length < word.length) {
        word = known;
        j = i + known.length;
      }
      tokens.push({ type: "ident", value: word, pos: i });
      i = j;
      continue;
    }

    if ("+-*/^".includes(ch)) {
      tokens.push({ type: "op", value: ch, pos: i });
      i++;
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "{") {
      tokens.push({ type: "lparen", value: "(", pos: i });
      i++;
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      tokens.push({ type: "rparen", value: ")", pos: i });
      i++;
      continue;
    }

    if (ch === "|") {
      tokens.push({ type: "pipe", value: "|", pos: i });
      i++;
      continue;
    }

    throw new ExpressionError(`Unexpected character "${ch}"`);
  }

  return tokens;
}

function matchLeadingWord(word: string): string | null {
  const lower = word.toLowerCase();
  const names = [...Object.keys(FUNCTIONS), ...Object.keys(CONSTANTS)].sort((a, b) => b.length - a.length);
  for (const name of names) {
    if (lower.startsWith(name)) return word.slice(0, name.length);
  }
  return null;
}

export type Node =
  | { kind: "num"; value: number }
  | { kind: "var"; name: string }
  | { kind: "const"; name: string }
  | { kind: "unary"; op: "-" | "+"; operand: Node }
  | { kind: "binary"; op: "+" | "-" | "*" | "/" | "^"; left: Node; right: Node }
  | { kind: "call"; name: string; arg: Node };

/**
 * Recursive descent parser.
 *
 * Precedence, lowest first: + -, then * / and implicit multiplication, then
 * unary minus, then ^ (right associative).
 */
class Parser {
  private pos = 0;
  /**
   * How many modulus bars are currently open. Inside | ... | a bar must close
   * the modulus rather than begin an implicitly multiplied factor, otherwise
   * "|-7|" parses as | times (-7) times | and runs off the end of the input.
   */
  private pipeDepth = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Node {
    const node = this.parseSum();
    if (this.pos < this.tokens.length) {
      throw new ExpressionError(`Unexpected "${this.tokens[this.pos].value}"`);
    }
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private parseSum(): Node {
    let left = this.parseProduct();
    for (;;) {
      const tok = this.peek();
      if (tok?.type === "op" && (tok.value === "+" || tok.value === "-")) {
        this.pos++;
        const right = this.parseProduct();
        left = { kind: "binary", op: tok.value as "+" | "-", left, right };
      } else {
        return left;
      }
    }
  }

  private parseProduct(): Node {
    let left = this.parseUnary();
    for (;;) {
      const tok = this.peek();
      if (tok?.type === "op" && (tok.value === "*" || tok.value === "/")) {
        this.pos++;
        const right = this.parseUnary();
        left = { kind: "binary", op: tok.value as "*" | "/", left, right };
      } else if (this.startsImplicitFactor(tok)) {
        // Implicit multiplication: 2x, 3sin(x), (x+1)(x-2), 2pi.
        const right = this.parseUnary();
        left = { kind: "binary", op: "*", left, right };
      } else {
        return left;
      }
    }
  }

  private startsImplicitFactor(tok: Token | undefined): boolean {
    if (!tok) return false;
    if (tok.type === "pipe") return this.pipeDepth === 0;
    return tok.type === "number" || tok.type === "ident" || tok.type === "lparen";
  }

  private parseUnary(): Node {
    const tok = this.peek();
    if (tok?.type === "op" && (tok.value === "-" || tok.value === "+")) {
      this.pos++;
      const operand = this.parseUnary();
      return { kind: "unary", op: tok.value as "-" | "+", operand };
    }
    return this.parsePower();
  }

  private parsePower(): Node {
    const base = this.parsePrimary();
    const tok = this.peek();
    if (tok?.type === "op" && tok.value === "^") {
      this.pos++;
      // Right associative, and the exponent may itself be signed: 2^-1.
      const exponent = this.parseUnary();
      return { kind: "binary", op: "^", left: base, right: exponent };
    }
    return base;
  }

  private parsePrimary(): Node {
    const tok = this.peek();
    if (!tok) throw new ExpressionError("Unexpected end of expression");

    if (tok.type === "number") {
      this.pos++;
      const value = Number(tok.value);
      if (!Number.isFinite(value)) throw new ExpressionError(`Malformed number "${tok.value}"`);
      return { kind: "num", value };
    }

    if (tok.type === "lparen") {
      this.pos++;
      const inner = this.parseSum();
      const close = this.peek();
      if (close?.type !== "rparen") throw new ExpressionError("Missing closing bracket");
      this.pos++;
      return inner;
    }

    if (tok.type === "pipe") {
      this.pos++;
      this.pipeDepth++;
      let inner: Node;
      try {
        inner = this.parseSum();
      } finally {
        this.pipeDepth--;
      }
      const close = this.peek();
      if (close?.type !== "pipe") throw new ExpressionError("Unclosed | |");
      this.pos++;
      return { kind: "call", name: "abs", arg: inner };
    }

    if (tok.type === "ident") {
      const lower = tok.value.toLowerCase();
      this.pos++;

      if (lower in FUNCTIONS) {
        // Allow both sin(x) and the handwritten sin x.
        const next = this.peek();
        if (next?.type === "lparen") {
          this.pos++;
          const arg = this.parseSum();
          const close = this.peek();
          if (close?.type !== "rparen") throw new ExpressionError("Missing closing bracket");
          this.pos++;
          return { kind: "call", name: lower, arg };
        }
        const arg = this.parsePower();
        return { kind: "call", name: lower, arg };
      }

      if (lower in CONSTANTS) return { kind: "const", name: lower };

      return { kind: "var", name: tok.value };
    }

    throw new ExpressionError(`Unexpected "${tok.value}"`);
  }
}

export function parseExpression(input: string): Node {
  if (!input || !input.trim()) throw new ExpressionError("Empty expression");
  return new Parser(tokenise(input)).parse();
}

/** Every free variable in an expression, in first-appearance order. */
export function variablesIn(node: Node): string[] {
  const seen: string[] = [];
  const walk = (n: Node): void => {
    switch (n.kind) {
      case "var":
        if (!seen.includes(n.name)) seen.push(n.name);
        break;
      case "unary":
        walk(n.operand);
        break;
      case "binary":
        walk(n.left);
        walk(n.right);
        break;
      case "call":
        walk(n.arg);
        break;
    }
  };
  walk(node);
  return seen;
}

export function evaluate(node: Node, scope: Record<string, number> = {}): number {
  switch (node.kind) {
    case "num":
      return node.value;
    case "const":
      return CONSTANTS[node.name];
    case "var": {
      const key = Object.keys(scope).find((k) => k.toLowerCase() === node.name.toLowerCase());
      if (key === undefined) throw new ExpressionError(`Unknown variable "${node.name}"`);
      return scope[key];
    }
    case "unary":
      return node.op === "-" ? -evaluate(node.operand, scope) : evaluate(node.operand, scope);
    case "binary": {
      const l = evaluate(node.left, scope);
      const r = evaluate(node.right, scope);
      switch (node.op) {
        case "+":
          return l + r;
        case "-":
          return l - r;
        case "*":
          return l * r;
        case "/":
          return l / r;
        case "^":
          return Math.pow(l, r);
      }
    }
    // eslint-disable-next-line no-fallthrough
    case "call":
      return FUNCTIONS[node.name](evaluate(node.arg, scope));
  }
}

/** Parse and evaluate in one step. Throws ExpressionError on bad input. */
export function evaluateString(input: string, scope: Record<string, number> = {}): number {
  return evaluate(parseExpression(input), scope);
}
