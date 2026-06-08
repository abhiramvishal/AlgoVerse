import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// ── Extended GCD ─────────────────────────────────────────────────────────────
export const extendedEuclideanModule: VisualizationModule<{ a: number; b: number }> = {
  id: "math-extended-euclidean",
  slug: "extended-euclidean",
  title: "Extended Euclidean Algorithm",
  category: ["algorithms", "mathematical"],
  difficulty: "intermediate",
  timeComplexity: "O(log(min(a,b)))",
  spaceComplexity: "O(1)",
  description: "Finds integers x,y such that ax + by = gcd(a,b). Used for modular inverse computation.",
  relatedTopics: ["gcd-euclidean", "chinese-remainder"],
  pythonCode: `def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x, y = extended_gcd(b, a % b)
    return g, y, x - (a // b) * y

a, b = 35, 15
g, x, y = extended_gcd(a, b)
print(f"gcd={g}, x={x}, y={y}")  # gcd=5, x=1, y=-2
print(f"{a}*{x} + {b}*{y} = {a*x + b*y}")`,
  codeSteps: [],
  defaultInput: { a: 35, b: 15 },
  generateSteps(input) {
    const { a, b } = input ?? { a: 35, b: 15 };
    const steps: AnimationStep[] = [];
    const rows: Array<{ a: number; b: number; q: number; x: number; y: number }> = [];

    function ext(aa: number, bb: number): [number, number, number] {
      if (bb === 0) return [aa, 1, 0];
      const [g, x, y] = ext(bb, aa % bb);
      return [g, y, x - Math.floor(aa / bb) * y];
    }

    // Iterative trace
    let aa = a, bb = b;
    const stack: Array<[number, number]> = [];
    while (bb !== 0) {
      stack.push([aa, bb]);
      [aa, bb] = [bb, aa % bb];
    }
    const gcd = aa;

    let x = 1, y = 0;
    rows.push({ a: aa, b: 0, q: 0, x: 1, y: 0 });

    while (stack.length > 0) {
      const [pa, pb] = stack.pop()!;
      const q = Math.floor(pa / pb);
      const nx = y;
      const ny = x - q * y;
      [x, y] = [nx, ny];
      rows.push({ a: pa, b: pb, q, x, y });
    }

    steps.push({
      stepNumber: 1,
      description: `Extended GCD(${a}, ${b}). Find x,y where ${a}x + ${b}y = gcd.`,
      highlightLines: [1],
      visualState: {
        type: "array1d",
        cells: [{ val: `a=${a}`, state: "active" as const }, { val: `b=${b}`, state: "highlighted" as const }],
        label: "Input",
      },
      variables: { a, b },
    });

    for (const row of rows.slice().reverse()) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `${row.a} = ${row.q}×${row.b} + ${row.a % (row.b || 1)}. Back-substitute: x=${row.x}, y=${row.y}`,
        highlightLines: [3, 4],
        visualState: {
          type: "array1d",
          cells: [
            { val: `a=${row.a}`, state: "default" as const },
            { val: `b=${row.b}`, state: "default" as const },
            { val: `x=${row.x}`, state: "active" as const },
            { val: `y=${row.y}`, state: "highlighted" as const },
          ],
          label: `Step (back-substitution)`,
        },
        variables: { a: row.a, b: row.b, q: row.q, x: row.x, y: row.y },
      });
    }

    const [, fx, fy] = ext(a, b);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Result: gcd(${a},${b})=${gcd}. ${a}×${fx} + ${b}×${fy} = ${a * fx + b * fy}.`,
      highlightLines: [5],
      visualState: {
        type: "array1d",
        cells: [
          { val: `gcd=${gcd}`, state: "computed" as const },
          { val: `x=${fx}`, state: "computed" as const },
          { val: `y=${fy}`, state: "computed" as const },
        ],
        label: "Final result",
      },
      variables: { gcd, x: fx, y: fy, verify: `${a}×${fx}+${b}×${fy}=${a * fx + b * fy}` },
    });

    return steps;
  },
};

// ── Segmented Sieve ──────────────────────────────────────────────────────────
export const segmentedSieveModule: VisualizationModule<{ lo: number; hi: number }> = {
  id: "math-segmented-sieve",
  slug: "segmented-sieve",
  title: "Segmented Sieve",
  category: ["algorithms", "mathematical"],
  difficulty: "intermediate",
  timeComplexity: "O(n log log n)",
  spaceComplexity: "O(√n)",
  description: "Find all primes in range [lo, hi] using small primes from simple sieve up to √hi.",
  relatedTopics: ["sieve-eratosthenes"],
  pythonCode: `import math

def segmented_sieve(lo, hi):
    limit = int(math.sqrt(hi)) + 1
    # Sieve small primes
    sieve = [True] * limit
    sieve[0] = sieve[1] = False
    for i in range(2, limit):
        if sieve[i]:
            for j in range(i*i, limit, i):
                sieve[j] = False
    small_primes = [i for i in range(2, limit) if sieve[i]]
    # Segment
    is_prime = [True] * (hi - lo + 1)
    if lo == 1:
        is_prime[0] = False
    for p in small_primes:
        start = max(p*p, ((lo + p - 1) // p) * p)
        for j in range(start, hi + 1, p):
            is_prime[j - lo] = False
    return [lo + i for i, v in enumerate(is_prime) if v]`,
  codeSteps: [],
  defaultInput: { lo: 10, hi: 70 },
  generateSteps(input) {
    const { lo, hi } = input ?? { lo: 10, hi: 70 };
    const steps: AnimationStep[] = [];

    const limit = Math.floor(Math.sqrt(hi)) + 1;
    const smallSieve = new Array(limit).fill(true);
    smallSieve[0] = smallSieve[1] = false;
    for (let i = 2; i < limit; i++) {
      if (smallSieve[i]) for (let j = i * i; j < limit; j += i) smallSieve[j] = false;
    }
    const smallPrimes = smallSieve.map((v, i) => v ? i : -1).filter((v) => v > 0);

    steps.push({
      stepNumber: 1,
      description: `Segmented sieve for primes in [${lo}, ${hi}]. Small primes up to √${hi}=${limit}: [${smallPrimes.join(",")}]`,
      highlightLines: [1, 2, 3],
      visualState: {
        type: "array1d",
        cells: smallPrimes.map((p) => ({ val: p, state: "computed" as const })),
        label: `Small primes (≤${limit})`,
      },
      variables: { lo, hi, smallPrimes: JSON.stringify(smallPrimes) },
    });

    const seg = new Array(hi - lo + 1).fill(true);
    if (lo <= 1) seg[1 - lo] = false;
    if (lo === 0) seg[0] = false;

    for (const p of smallPrimes) {
      const start = Math.max(p * p, Math.ceil(lo / p) * p);
      if (start > hi) continue;
      const before = [...seg];
      for (let j = start; j <= hi; j += p) seg[j - lo] = false;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Mark multiples of prime ${p} starting from ${start}.`,
        highlightLines: [13, 14, 15],
        visualState: {
          type: "sieve",
          numbers: seg.map((v, i) => ({
            val: lo + i,
            state: !v ? "composite" as const : before[i] !== seg[i] ? "current" as const : "unmarked" as const,
          })),
        },
        variables: { prime: p, start, markedCount: seg.filter((v) => !v).length },
      });
    }

    const primes = seg.map((v, i) => v ? lo + i : -1).filter((v) => v > 0);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Primes in [${lo},${hi}]: [${primes.join(",")}]. Total: ${primes.length} primes.`,
      highlightLines: [16],
      visualState: {
        type: "sieve",
        numbers: seg.map((v, i) => ({
          val: lo + i,
          state: v ? "prime" as const : "composite" as const,
        })),
      },
      variables: { primes: JSON.stringify(primes), count: primes.length },
    });

    return steps;
  },
};

// ── Fast Exponentiation ──────────────────────────────────────────────────────
export const fastExponentiationModule: VisualizationModule<{ base: number; exp: number }> = {
  id: "math-fast-exponentiation",
  slug: "fast-exponentiation",
  title: "Fast Exponentiation",
  category: ["algorithms", "mathematical"],
  difficulty: "beginner",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  description: "Compute base^exp in O(log exp) multiplications using binary representation of exponent.",
  relatedTopics: ["miller-rabin", "rsa"],
  pythonCode: `def fast_pow(base, exp, mod=None):
    result = 1
    while exp > 0:
        if exp % 2 == 1:        # odd exponent: multiply in current base
            result *= base
            if mod: result %= mod
        base *= base            # square the base
        if mod: base %= mod
        exp //= 2               # halve exponent
    return result

print(fast_pow(2, 10))   # 1024
print(fast_pow(3, 13))   # 1594323`,
  codeSteps: [],
  defaultInput: { base: 2, exp: 10 },
  generateSteps(input) {
    const { base, exp } = input ?? { base: 2, exp: 10 };
    const steps: AnimationStep[] = [];
    let result = 1;
    let b = base;
    let e = exp;

    steps.push({
      stepNumber: 1,
      description: `Fast Exponentiation: ${base}^${exp}. Binary of ${exp} = ${exp.toString(2)}.`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: exp.toString(2).split("").map((bit) => ({ val: bit, state: "default" as const })),
        label: `Binary of ${exp}`,
      },
      variables: { base, exp, binary: exp.toString(2) },
    });

    while (e > 0) {
      if (e % 2 === 1) {
        result *= b;
        steps.push({
          stepNumber: steps.length + 1,
          description: `exp bit=1: result *= ${b} → result=${result}`,
          highlightLines: [3, 4],
          visualState: {
            type: "array1d",
            cells: [
              { val: `base=${b}`, state: "active" as const },
              { val: `exp=${e}`, state: "highlighted" as const },
              { val: `result=${result}`, state: "computed" as const },
            ],
            label: "State",
          },
          variables: { base: b, exp: e, result },
        });
      }
      b *= b;
      e = Math.floor(e / 2);

      if (e > 0) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Square base: base=${b}, halve exp: exp=${e}`,
          highlightLines: [6, 8],
          visualState: {
            type: "array1d",
            cells: [
              { val: `base=${b}`, state: "highlighted" as const },
              { val: `exp=${e}`, state: "active" as const },
              { val: `result=${result}`, state: "computed" as const },
            ],
            label: "State",
          },
          variables: { base: b, exp: e, result },
        });
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `${base}^${exp} = ${result}. Computed in O(log ${exp}) = ${Math.floor(Math.log2(exp)) + 1} iterations.`,
      highlightLines: [9],
      visualState: {
        type: "array1d",
        cells: [{ val: result, state: "computed" as const }],
        label: `${base}^${exp}`,
      },
      variables: { result, iterations: Math.floor(Math.log2(exp)) + 1 },
    });

    return steps;
  },
};

// ── Chinese Remainder Theorem ────────────────────────────────────────────────
export const chineseRemainderModule: VisualizationModule<{ remainders: number[]; moduli: number[] }> = {
  id: "math-chinese-remainder",
  slug: "chinese-remainder",
  title: "Chinese Remainder Theorem",
  category: ["algorithms", "mathematical"],
  difficulty: "advanced",
  timeComplexity: "O(n log M)",
  spaceComplexity: "O(n)",
  description: "Solves system x ≡ r₁ (mod m₁), x ≡ r₂ (mod m₂), ... when moduli are pairwise coprime.",
  relatedTopics: ["extended-euclidean", "fast-exponentiation"],
  pythonCode: `def ext_gcd(a, b):
    if b == 0: return a, 1, 0
    g, x, y = ext_gcd(b, a % b)
    return g, y, x - (a // b) * y

def crt(remainders, moduli):
    M = 1
    for m in moduli: M *= m
    x = 0
    for r, m in zip(remainders, moduli):
        Mi = M // m
        _, inv, _ = ext_gcd(Mi, m)  # Mi * inv ≡ 1 (mod m)
        x += r * Mi * inv
    return x % M

r = [2, 3, 1]
m = [3, 4, 5]
print(crt(r, m))  # 11 => 11%3=2, 11%4=3, 11%5=1`,
  codeSteps: [],
  defaultInput: { remainders: [2, 3, 1], moduli: [3, 4, 5] },
  generateSteps(input) {
    const { remainders, moduli } = input ?? { remainders: [2, 3, 1], moduli: [3, 4, 5] };
    const steps: AnimationStep[] = [];

    function extGcd(a: number, b: number): [number, number, number] {
      if (b === 0) return [a, 1, 0];
      const [g, x, y] = extGcd(b, a % b);
      return [g, y, x - Math.floor(a / b) * y];
    }

    const M = moduli.reduce((p, c) => p * c, 1);

    steps.push({
      stepNumber: 1,
      description: `CRT: solve x≡${remainders[0]}(mod ${moduli[0]}), x≡${remainders[1]}(mod ${moduli[1]}), x≡${remainders[2]}(mod ${moduli[2]}). M=${M}.`,
      highlightLines: [5, 6],
      visualState: {
        type: "array1d",
        cells: remainders.map((r, i) => ({ val: `r${i}=${r},m${i}=${moduli[i]}`, state: "default" as const })),
        label: "System of congruences",
      },
      variables: { M, n: remainders.length },
    });

    let x = 0;
    for (let i = 0; i < remainders.length; i++) {
      const Mi = M / moduli[i];
      const [, inv] = extGcd(Mi, moduli[i]);
      const normalInv = ((inv % moduli[i]) + moduli[i]) % moduli[i];
      const term = remainders[i] * Mi * normalInv;
      x += term;

      steps.push({
        stepNumber: steps.length + 1,
        description: `i=${i}: M${i}=${Mi}, inv(${Mi} mod ${moduli[i]})=${normalInv}. Term=${remainders[i]}×${Mi}×${normalInv}=${term}.`,
        highlightLines: [8, 9, 10, 11],
        visualState: {
          type: "array1d",
          cells: [
            { val: `r=${remainders[i]}`, state: "active" as const },
            { val: `M${i}=${Mi}`, state: "highlighted" as const },
            { val: `inv=${normalInv}`, state: "computed" as const },
            { val: `term=${term}`, state: "computed" as const },
          ],
          label: `Step ${i + 1}`,
        },
        variables: { i, Mi, inv: normalInv, term, runningSum: x },
      });
    }

    const result = ((x % M) + M) % M;
    steps.push({
      stepNumber: steps.length + 1,
      description: `x = ${x} mod ${M} = ${result}. Verify: ${moduli.map((m, i) => `${result}%${m}=${result % m}`).join(", ")}.`,
      highlightLines: [12],
      visualState: {
        type: "array1d",
        cells: moduli.map((m, i) => ({ val: `${result}%${m}=${result % m}`, state: result % m === remainders[i] ? "computed" as const : "highlighted" as const })),
        label: `Solution: x = ${result}`,
      },
      variables: { solution: result, M },
    });

    return steps;
  },
};

// ── Miller-Rabin Primality Test ──────────────────────────────────────────────
export const millerRabinModule: VisualizationModule<{ n: number; witnesses: number[] }> = {
  id: "math-miller-rabin",
  slug: "miller-rabin",
  title: "Miller-Rabin Primality Test",
  category: ["algorithms", "mathematical"],
  difficulty: "advanced",
  timeComplexity: "O(k log²n)",
  spaceComplexity: "O(1)",
  description: "Probabilistic primality test with negligible error probability using random witnesses.",
  relatedTopics: ["fast-exponentiation", "pollard-rho"],
  pythonCode: `def miller_rabin(n, witnesses):
    if n < 2: return False
    if n == 2 or n == 3: return True
    if n % 2 == 0: return False
    # Write n-1 as 2^r * d
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1; d //= 2
    for a in witnesses:
        x = pow(a, d, n)
        if x == 1 or x == n - 1: continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1: break
        else:
            return False  # definitely composite
    return True  # probably prime

print(miller_rabin(221, [2,3,5]))   # False (221=13*17)
print(miller_rabin(997, [2,3,5]))   # True`,
  codeSteps: [],
  defaultInput: { n: 221, witnesses: [2, 3, 5] },
  generateSteps(input) {
    const { n, witnesses } = input ?? { n: 221, witnesses: [2, 3, 5] };
    const steps: AnimationStep[] = [];

    let r = 0, d = n - 1;
    while (d % 2 === 0) { r++; d = Math.floor(d / 2); }

    steps.push({
      stepNumber: 1,
      description: `Miller-Rabin: test if ${n} is prime. Write ${n}-1=${n - 1} = 2^${r} × ${d}.`,
      highlightLines: [5, 6, 7],
      visualState: {
        type: "array1d",
        cells: [
          { val: `n=${n}`, state: "default" as const },
          { val: `r=${r}`, state: "active" as const },
          { val: `d=${d}`, state: "highlighted" as const },
        ],
        label: `n-1 = 2^r × d`,
      },
      variables: { n, r, d },
    });

    function modPow(base: number, exp: number, mod: number): number {
      let result = 1;
      base %= mod;
      while (exp > 0) {
        if (exp % 2 === 1) result = (result * base) % mod;
        base = (base * base) % mod;
        exp = Math.floor(exp / 2);
      }
      return result;
    }

    let isPrime = true;
    for (const a of witnesses) {
      let x = modPow(a, d, n);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Witness a=${a}: compute ${a}^${d} mod ${n} = ${x}.`,
        highlightLines: [9, 10],
        visualState: {
          type: "array1d",
          cells: [
            { val: `a=${a}`, state: "active" as const },
            { val: `x=${x}`, state: "highlighted" as const },
            { val: x === 1 || x === n - 1 ? "pass!" : "continue", state: x === 1 || x === n - 1 ? "computed" as const : "default" as const },
          ],
          label: `Test with a=${a}`,
        },
        variables: { a, x, n },
      });

      if (x === 1 || x === n - 1) continue;

      let composite = true;
      for (let i = 0; i < r - 1; i++) {
        x = modPow(x, 2, n);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Square: x=${x} mod ${n}${x === n - 1 ? " (inconclusive, continue next witness)" : ""}`,
          highlightLines: [11, 12],
          visualState: {
            type: "array1d",
            cells: [{ val: `x²=${x}`, state: x === n - 1 ? "computed" as const : "active" as const }],
            label: `Squaring round ${i + 1}`,
          },
          variables: { i, x },
        });
        if (x === n - 1) { composite = false; break; }
      }

      if (composite) {
        isPrime = false;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Witness a=${a} proves ${n} is COMPOSITE!`,
          highlightLines: [13, 14],
          visualState: {
            type: "array1d",
            cells: [{ val: `${n} = COMPOSITE`, state: "highlighted" as const }],
            label: "Result",
          },
          variables: { result: "COMPOSITE", witness: a },
        });
        break;
      }
    }

    if (isPrime) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `All witnesses pass. ${n} is PROBABLY PRIME.`,
        highlightLines: [15],
        visualState: {
          type: "array1d",
          cells: [{ val: `${n} = PROBABLY PRIME`, state: "computed" as const }],
          label: "Result",
        },
        variables: { result: "probably prime", witnesses: JSON.stringify(witnesses) },
      });
    }

    return steps;
  },
};

// ── Pollard's Rho ───────────────────────────────────────────────────────────
export const pollardRhoModule: VisualizationModule<{ n: number }> = {
  id: "math-pollard-rho",
  slug: "pollard-rho",
  title: "Pollard's Rho Algorithm",
  category: ["algorithms", "mathematical"],
  difficulty: "advanced",
  timeComplexity: "O(n^(1/4))",
  spaceComplexity: "O(1)",
  description: "Probabilistic integer factorization using Floyd's cycle detection in pseudo-random sequences.",
  relatedTopics: ["miller-rabin", "gcd-euclidean"],
  pythonCode: `from math import gcd

def pollard_rho(n):
    if n % 2 == 0:
        return 2
    x = 2; y = 2; d = 1
    f = lambda x: (x * x + 1) % n
    while d == 1:
        x = f(x)         # tortoise
        y = f(f(y))      # hare
        d = gcd(abs(x - y), n)
    return d if d != n else None

print(pollard_rho(8051))   # 97 (8051 = 83 × 97)`,
  codeSteps: [],
  defaultInput: { n: 8051 },
  generateSteps(input) {
    const { n } = input ?? { n: 8051 };
    const steps: AnimationStep[] = [];

    function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
    const f = (x: number) => (x * x + 1) % n;

    steps.push({
      stepNumber: 1,
      description: `Pollard's Rho factorization of ${n}. Floyd's cycle detection on f(x)=(x²+1) mod ${n}.`,
      highlightLines: [3],
      visualState: {
        type: "array1d",
        cells: [
          { val: `n=${n}`, state: "default" as const },
          { val: "x=2", state: "active" as const },
          { val: "y=2", state: "highlighted" as const },
          { val: "d=1", state: "default" as const },
        ],
        label: "Initial state",
      },
      variables: { n, x: 2, y: 2, d: 1 },
    });

    let x = 2, y = 2, d = 1;
    let iters = 0;
    while (d === 1 && iters < 40) {
      x = f(x);
      y = f(f(y));
      d = gcd(Math.abs(x - y), n);
      iters++;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Iter ${iters}: tortoise x=${x}, hare y=${y}, gcd(|${x}-${y}|,${n})=gcd(${Math.abs(x - y)},${n})=${d}`,
        highlightLines: [8, 9, 10],
        visualState: {
          type: "array1d",
          cells: [
            { val: `x=${x}`, state: "active" as const },
            { val: `y=${y}`, state: "highlighted" as const },
            { val: `d=${d}`, state: d > 1 && d < n ? "computed" as const : "default" as const },
          ],
          label: `Iteration ${iters}`,
        },
        variables: { x, y, d, diff: Math.abs(x - y) },
      });

      if (d > 1) break;
    }

    if (d > 1 && d < n) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Factor found: ${n} = ${d} × ${n / d}.`,
        highlightLines: [11],
        visualState: {
          type: "array1d",
          cells: [
            { val: `${n}`, state: "default" as const },
            { val: `= ${d}`, state: "computed" as const },
            { val: `× ${n / d}`, state: "computed" as const },
          ],
          label: "Factorization",
        },
        variables: { factor1: d, factor2: n / d, product: d * (n / d) },
      });
    }

    return steps;
  },
};
