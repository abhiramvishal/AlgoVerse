import type { AnimationStep, VisualizationModule } from "@/types/visualization";

function toBits(n: number, width = 8): number[] {
  return Array.from({ length: width }, (_, i) => (n >> (width - 1 - i)) & 1);
}

// ── Bitwise Operations ───────────────────────────────────────────────────────
export const bitBasicsModule: VisualizationModule<{ a: number; b: number }> = {
  id: "bit-basics",
  slug: "bit-basics",
  title: "Bitwise Operations",
  category: ["algorithms", "bit-manipulation"],
  difficulty: "beginner",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "AND, OR, XOR, NOT, left shift, right shift — the six fundamental bitwise operations.",
  relatedTopics: ["xor-tricks", "bitmask-basics"],
  pythonCode: `a, b = 45, 27  # 00101101, 00011011
print(bin(a & b))   # AND  = 00001001 = 9
print(bin(a | b))   # OR   = 00111111 = 63
print(bin(a ^ b))   # XOR  = 00110110 = 54
print(bin(~a & 0xFF))# NOT = 11010010 = 210
print(bin(a << 1))  # SHL  = 01011010 = 90
print(bin(a >> 1))  # SHR  = 00010110 = 22`,
  codeSteps: [],
  defaultInput: { a: 45, b: 27 },
  generateSteps(input) {
    const { a, b } = input ?? { a: 45, b: 27 };
    const steps: AnimationStep[] = [];
    const ops: Array<{ name: string; result: number; line: number; desc: string }> = [
      { name: "AND", result: a & b, line: 2, desc: `1 only where BOTH bits are 1` },
      { name: "OR", result: a | b, line: 3, desc: `1 where EITHER bit is 1` },
      { name: "XOR", result: a ^ b, line: 4, desc: `1 where bits DIFFER` },
      { name: "NOT a", result: (~a) & 0xFF, line: 5, desc: `Flip all bits of a` },
      { name: "SHL (a<<1)", result: a << 1, line: 6, desc: `Multiply by 2` },
      { name: "SHR (a>>1)", result: a >> 1, line: 7, desc: `Integer divide by 2` },
    ];

    steps.push({
      stepNumber: 1,
      description: `Bitwise Operations: a=${a} (${a.toString(2).padStart(8, "0")}), b=${b} (${b.toString(2).padStart(8, "0")})`,
      highlightLines: [1],
      visualState: {
        type: "bits",
        number: a,
        bits: toBits(a),
        activeBits: [],
        label: `a = ${a}`,
        operandB: { bits: toBits(b), number: b },
      },
      variables: { a, b, aBin: a.toString(2).padStart(8, "0"), bBin: b.toString(2).padStart(8, "0") },
    });

    for (const op of ops) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `${op.name}: ${op.desc}. Result = ${op.result} (${op.result.toString(2).padStart(8, "0")})`,
        highlightLines: [op.line],
        visualState: {
          type: "bits",
          number: a,
          bits: toBits(a),
          activeBits: toBits(op.result).map((b, i) => b === 1 ? i : -1).filter((i) => i >= 0),
          label: `${op.name} result`,
          result: { bits: toBits(op.result), number: op.result },
          operandB: op.name.startsWith("S") || op.name === "NOT a" ? undefined : { bits: toBits(b), number: b },
        },
        variables: { operation: op.name, result: op.result, binary: op.result.toString(2).padStart(8, "0") },
      });
    }

    return steps;
  },
};

// ── Brian Kernighan ──────────────────────────────────────────────────────────
export const brianKernighanModule: VisualizationModule<{ n: number }> = {
  id: "bit-brian-kernighan",
  slug: "brian-kernighan",
  title: "Brian Kernighan's Bit Count",
  category: ["algorithms", "bit-manipulation"],
  difficulty: "beginner",
  timeComplexity: "O(set bits)",
  spaceComplexity: "O(1)",
  description: "Count set bits (1s) in O(set bits) by repeatedly clearing the lowest set bit with n &= n-1.",
  relatedTopics: ["bit-basics", "xor-tricks"],
  pythonCode: `def count_bits(n):
    count = 0
    while n:
        n &= n - 1   # clear lowest set bit
        count += 1
    return count

print(count_bits(52))   # 52=110100 → 3 set bits`,
  codeSteps: [],
  defaultInput: { n: 52 },
  generateSteps(input) {
    const { n: initN } = input ?? { n: 52 };
    const steps: AnimationStep[] = [];
    let n = initN;
    let count = 0;

    steps.push({
      stepNumber: 1,
      description: `Brian Kernighan: count set bits in ${n} (${n.toString(2)}). Set bits: ${n.toString(2).split("").filter((b) => b === "1").length}`,
      highlightLines: [1, 2],
      visualState: {
        type: "bits",
        number: n,
        bits: toBits(n),
        activeBits: toBits(n).map((b, i) => b === 1 ? i : -1).filter((i) => i >= 0),
        label: `n = ${n}`,
      },
      variables: { n, binary: n.toString(2), count },
    });

    while (n > 0) {
      const prev = n;
      n &= n - 1;
      count++;

      steps.push({
        stepNumber: steps.length + 1,
        description: `n &= (n-1): ${prev.toString(2)} & ${(prev - 1).toString(2)} = ${n.toString(2)}. Cleared bit. count=${count}`,
        highlightLines: [3, 4],
        visualState: {
          type: "bits",
          number: prev,
          bits: toBits(prev),
          activeBits: toBits(n).map((b, i) => b === 1 ? i : -1).filter((i) => i >= 0),
          label: `After clearing lowest set bit`,
          result: { bits: toBits(n), number: n },
        },
        variables: { prev: prev.toString(2), n: n.toString(2), count },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `${initN} has ${count} set bits.`,
      highlightLines: [5],
      visualState: {
        type: "array1d",
        cells: [{ val: `${initN} → ${count} bits`, state: "computed" as const }],
        label: "Result",
      },
      variables: { n: initN, setBits: count },
    });

    return steps;
  },
};

// ── Power of Two ─────────────────────────────────────────────────────────────
export const powerOfTwoModule: VisualizationModule<{ values: number[] }> = {
  id: "bit-power-of-two",
  slug: "power-of-two",
  title: "Power of Two Check",
  category: ["algorithms", "bit-manipulation"],
  difficulty: "beginner",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "Check if n is a power of 2 in O(1) using n & (n-1) == 0 (only powers of 2 have exactly one set bit).",
  relatedTopics: ["bit-basics", "brian-kernighan"],
  pythonCode: `def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0

# Powers of 2:    1,2,4,8,16,32,64 → True
# Non-powers: 3,5,6,7,9,10 → False
for n in [16, 18, 32, 7, 64]:
    print(f"{n}: {is_power_of_two(n)}")`,
  codeSteps: [],
  defaultInput: { values: [16, 18, 32, 7, 64] },
  generateSteps(input) {
    const { values } = input ?? { values: [16, 18, 32, 7, 64] };
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: `Power of Two: n & (n-1) == 0 iff n has exactly one set bit (i.e., is 2^k).`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: values.map((v) => ({ val: v, state: "default" as const })),
        label: "Test values",
      },
      variables: { values: JSON.stringify(values) },
    });

    for (const v of values) {
      const isPow = v > 0 && (v & (v - 1)) === 0;
      steps.push({
        stepNumber: steps.length + 1,
        description: `${v} (${v.toString(2)}): ${v} & ${v - 1} = ${v & (v - 1)} → ${isPow ? "IS power of 2" : "NOT power of 2"}`,
        highlightLines: [2],
        visualState: {
          type: "bits",
          number: v,
          bits: toBits(v),
          activeBits: isPow ? [] : toBits(v & (v - 1)).map((b, i) => b === 1 ? i : -1).filter((i) => i >= 0),
          label: `${v} & (${v}-1)`,
          result: { bits: toBits(v & (v - 1)), number: v & (v - 1) },
        },
        variables: { n: v, nMinus1: v - 1, and: v & (v - 1), isPowerOf2: isPow },
      });
    }

    return steps;
  },
};

// ── XOR Tricks ───────────────────────────────────────────────────────────────
export const xorTricksModule: VisualizationModule<{ arr: number[] }> = {
  id: "bit-xor-tricks",
  slug: "xor-tricks",
  title: "XOR Tricks",
  category: ["algorithms", "bit-manipulation"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Find the single non-duplicate in O(n) time, O(1) space using XOR. Every number XORed with itself = 0.",
  relatedTopics: ["bit-basics", "brian-kernighan"],
  pythonCode: `def find_single(arr):
    result = 0
    for x in arr:
        result ^= x    # x ^ x = 0; x ^ 0 = x
    return result

# Properties: x^x=0, x^0=x, XOR is commutative
arr = [1,2,3,2,1,4,4,5,5,3,6]
print(find_single(arr))   # 6 (only non-duplicate)`,
  codeSteps: [],
  defaultInput: { arr: [1, 2, 3, 2, 1, 4, 4, 5, 5, 3, 6] },
  generateSteps(input) {
    const { arr } = input ?? { arr: [1, 2, 3, 2, 1, 4, 4, 5, 5, 3, 6] };
    const steps: AnimationStep[] = [];
    let result = 0;

    steps.push({
      stepNumber: 1,
      description: `XOR trick: find single non-duplicate. XOR all elements; duplicates cancel (x^x=0).`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: arr.map((v) => ({ val: v, state: "default" as const })),
        label: "Input array",
      },
      variables: { arr: JSON.stringify(arr), result: 0 },
    });

    for (let i = 0; i < arr.length; i++) {
      const prev = result;
      result ^= arr[i];

      steps.push({
        stepNumber: steps.length + 1,
        description: `XOR ${prev} ^ ${arr[i]} = ${result} (${result.toString(2)})`,
        highlightLines: [3, 4],
        visualState: {
          type: "bits",
          number: prev,
          bits: toBits(prev),
          activeBits: [],
          label: `XOR step ${i + 1}`,
          operandB: { bits: toBits(arr[i]), number: arr[i] },
          result: { bits: toBits(result), number: result },
        },
        variables: { index: i, element: arr[i], prev, result },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Single non-duplicate = ${result}. All other elements appeared twice and cancelled out.`,
      highlightLines: [5],
      visualState: {
        type: "array1d",
        cells: [{ val: result, state: "computed" as const }],
        label: "Single element",
      },
      variables: { answer: result },
    });

    return steps;
  },
};

// ── Bitmask Fundamentals ─────────────────────────────────────────────────────
export const bitmaskBasicsModule: VisualizationModule<{ n: number; position: number }> = {
  id: "bit-bitmask-basics",
  slug: "bitmask-basics",
  title: "Bitmask Fundamentals",
  category: ["algorithms", "bit-manipulation"],
  difficulty: "intermediate",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "Set, clear, toggle, check individual bits and use bitmasks to represent subsets.",
  relatedTopics: ["bit-basics", "xor-tricks"],
  pythonCode: `n, pos = 13, 2   # n = 1101, pos=2 (0-indexed from right)
# Check bit:  (n >> pos) & 1
print((n >> pos) & 1)         # 1
# Set bit:    n | (1 << pos)
print(n | (1 << pos))         # 1101 | 0100 = 1101 = 13 (already set)
# Clear bit:  n & ~(1 << pos)
print(n & ~(1 << pos))        # 1101 & 1011 = 1001 = 9
# Toggle bit: n ^ (1 << pos)
print(n ^ (1 << pos))         # 1101 ^ 0100 = 1001 = 9
# Subset of {0,1,2}: use bitmask 3-bit int
for mask in range(8):
    subset = [i for i in range(3) if mask & (1 << i)]
    print(f"mask={bin(mask)}: {subset}")`,
  codeSteps: [],
  defaultInput: { n: 13, position: 2 },
  generateSteps(input) {
    const { n, position: pos } = input ?? { n: 13, position: 2 };
    const steps: AnimationStep[] = [];

    const ops = [
      { name: "Check bit", result: (n >> pos) & 1, desc: `(${n} >> ${pos}) & 1 = ${(n >> pos) & 1}` },
      { name: "Set bit", result: n | (1 << pos), desc: `${n} | (1<<${pos}) = ${n | (1 << pos)}` },
      { name: "Clear bit", result: n & ~(1 << pos), desc: `${n} & ~(1<<${pos}) = ${n & ~(1 << pos)}` },
      { name: "Toggle bit", result: n ^ (1 << pos), desc: `${n} ^ (1<<${pos}) = ${n ^ (1 << pos)}` },
    ];

    steps.push({
      stepNumber: 1,
      description: `Bitmask operations on n=${n} (${n.toString(2).padStart(8, "0")}), position ${pos}.`,
      highlightLines: [1],
      visualState: {
        type: "bits",
        number: n,
        bits: toBits(n),
        activeBits: [7 - pos], // convert to display index
        label: `n = ${n}, pos = ${pos}`,
      },
      variables: { n, pos, mask: 1 << pos },
    });

    for (const [i, op] of ops.entries()) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `${op.name}: ${op.desc}`,
        highlightLines: [i * 2 + 2],
        visualState: {
          type: "bits",
          number: n,
          bits: toBits(n),
          activeBits: [7 - pos],
          label: op.name,
          result: { bits: toBits(op.result & 0xFF), number: op.result & 0xFF },
        },
        variables: { operation: op.name, result: op.result, binary: (op.result & 0xFF).toString(2).padStart(8, "0") },
      });
    }

    // Subset enumeration
    steps.push({
      stepNumber: steps.length + 1,
      description: `Bitmask for subsets: enumerate all 2^3=8 subsets of {0,1,2}.`,
      highlightLines: [10, 11, 12],
      visualState: {
        type: "array1d",
        cells: Array.from({ length: 8 }, (_, mask) => ({
          val: `{${[0, 1, 2].filter((i) => mask & (1 << i)).join(",")}}`,
          state: "default" as const,
        })),
        label: "All subsets of {0,1,2}",
      },
      variables: { totalSubsets: 8 },
    });

    return steps;
  },
};
