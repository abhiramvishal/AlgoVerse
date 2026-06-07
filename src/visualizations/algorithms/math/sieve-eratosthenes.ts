import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def sieve_eratosthenes(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for multiple in range(p*p, n+1, p):
                is_prime[multiple] = False
        p += 1
    return [i for i in range(2, n+1) if is_prime[i]]`;

export const sieveEratosthenesModule: VisualizationModule<number> = {
  id: "math-sieve-eratosthenes",
  slug: "sieve-eratosthenes",
  title: "Sieve of Eratosthenes",
  category: ["algorithms", "math"],
  difficulty: "beginner",
  timeComplexity: "O(n log log n)",
  spaceComplexity: "O(n)",
  description: "Finds all primes up to n by iteratively marking multiples of each prime as composite.",
  relatedTopics: ["gcd-euclidean", "miller-rabin"],
  pythonCode,
  codeSteps: [],
  defaultInput: 50,
  generateSteps(input) {
    const n = Math.min(input ?? 50, 50);
    const steps: AnimationStep[] = [];
    const state: ("prime" | "composite" | "current" | "unmarked")[] = new Array(n - 1).fill("unmarked");
    // numbers[i] = i + 2

    function makeNumbers() {
      return state.map((s, i) => ({ val: i + 2, state: s }));
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Sieve of Eratosthenes up to ${n}. Start with all numbers 2..${n} unmarked.`,
      highlightLines: [1, 2],
      visualState: { type: "sieve", numbers: makeNumbers() },
      variables: { n },
    });

    for (let p = 2; p * p <= n; p++) {
      const pIdx = p - 2;
      if (state[pIdx] === "composite") continue;

      state[pIdx] = "current";
      steps.push({
        stepNumber: steps.length + 1,
        description: `${p} is prime. Mark all multiples of ${p} starting from ${p * p}.`,
        highlightLines: [4, 5, 6],
        visualState: { type: "sieve", numbers: makeNumbers() },
        variables: { p, startMark: p * p },
      });

      for (let multiple = p * p; multiple <= n; multiple += p) {
        const mIdx = multiple - 2;
        if (state[mIdx] !== "composite") {
          state[mIdx] = "composite";
          steps.push({
            stepNumber: steps.length + 1,
            description: `Mark ${multiple} (= ${p} × ${multiple / p}) as composite.`,
            highlightLines: [6, 7],
            visualState: { type: "sieve", numbers: makeNumbers() },
            variables: { p, multiple },
          });
        }
      }

      state[pIdx] = "prime";
    }

    // Mark remaining unmarked as prime
    for (let i = 0; i < state.length; i++) {
      if (state[i] === "unmarked" || state[i] === "current") state[i] = "prime";
    }

    const primes = state.map((s, i) => i + 2).filter((_, i) => state[i] === "prime");
    steps.push({
      stepNumber: steps.length + 1,
      description: `Sieve complete. Primes up to ${n}: [${primes.join(", ")}].`,
      highlightLines: [9, 10],
      visualState: { type: "sieve", numbers: makeNumbers() },
      variables: { primeCount: primes.length, primes: primes.join(",") },
    });

    return steps;
  },
};
