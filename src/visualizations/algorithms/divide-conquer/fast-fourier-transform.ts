import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type FFTInput = number[];

const pythonCode = `import cmath

def fft(a):
    n = len(a)
    if n == 1:
        return a
    even = fft(a[0::2])
    odd = fft(a[1::2])
    T = [cmath.exp(-2j * cmath.pi * k / n) * odd[k] for k in range(n//2)]
    return [even[k] + T[k] for k in range(n//2)] + \
           [even[k] - T[k] for k in range(n//2)]`;

export const fastFourierTransformModule: VisualizationModule<FFTInput> = {
  id: "divide-conquer-fft",
  slug: "fast-fourier-transform",
  title: "Fast Fourier Transform",
  category: ["algorithms", "divide-conquer"],
  difficulty: "advanced",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n log n)",
  description:
    "FFT butterfly diagram: divide signal into even/odd halves, combine with twiddle factors.",
  relatedTopics: ["karatsuba", "strassen"],
  pythonCode,
  codeSteps: [],
  defaultInput: [1, 2, 3, 4, 0, 0, 0, 0],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const n = input.length;

    // Simplified: show bit-reversal permutation then butterfly stages
    steps.push({
      stepNumber: 1,
      description: `FFT on ${n}-point signal. Input: [${input.join(",")}].`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: input.map((v) => ({ val: String(v), state: "default" as const })),
        label: "Stage 0: Input",
        pointers: [],
      },
      variables: { n, stages: Math.log2(n) },
    });

    // Bit-reversal permutation
    const bitRev = [...input];
    const bits = Math.log2(n);
    for (let i = 0; i < n; i++) {
      let rev = 0;
      let x = i;
      for (let b = 0; b < bits; b++) {
        rev = (rev << 1) | (x & 1);
        x >>= 1;
      }
      if (rev > i) {
        [bitRev[i], bitRev[rev]] = [bitRev[rev], bitRev[i]];
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Bit-reversal permutation: [${bitRev.join(",")}]`,
      highlightLines: [3, 4, 5],
      visualState: {
        type: "array1d",
        cells: bitRev.map((v) => ({ val: String(v), state: "highlighted" as const })),
        label: "After bit-reversal",
        pointers: [],
      },
      variables: { bitReversed: [...bitRev] },
    });

    // Butterfly stages
    const work = bitRev.map((v) => ({ re: v, im: 0 }));
    const numStages = Math.log2(n);

    for (let stage = 1; stage <= numStages; stage++) {
      const groupSize = Math.pow(2, stage);
      const halfGroup = groupSize / 2;

      for (let start = 0; start < n; start += groupSize) {
        for (let k = 0; k < halfGroup; k++) {
          const u = work[start + k];
          const tAngle = -2 * Math.PI * k / groupSize;
          const tRe = Math.cos(tAngle);
          const tIm = Math.sin(tAngle);
          const vRe = work[start + k + halfGroup].re * tRe - work[start + k + halfGroup].im * tIm;
          const vIm = work[start + k + halfGroup].re * tIm + work[start + k + halfGroup].im * tRe;

          work[start + k] = { re: u.re + vRe, im: u.im + vIm };
          work[start + k + halfGroup] = { re: u.re - vRe, im: u.im - vIm };
        }
      }

      const displayVals = work.map((c) =>
        c.im === 0
          ? String(Math.round(c.re * 100) / 100)
          : `${Math.round(c.re * 10) / 10}${c.im >= 0 ? "+" : ""}${Math.round(c.im * 10) / 10}i`
      );

      steps.push({
        stepNumber: steps.length + 1,
        description: `Stage ${stage}/${numStages}: butterfly size=${groupSize}.`,
        highlightLines: [6, 7, 8],
        visualState: {
          type: "array1d",
          cells: displayVals.map((v) => ({ val: v, state: "computed" as const })),
          label: `After stage ${stage}`,
          pointers: [],
        },
        variables: { stage, groupSize, values: displayVals },
      });
    }

    const magnitudes = work.map((c) =>
      String(Math.round(Math.sqrt(c.re * c.re + c.im * c.im) * 10) / 10)
    );

    steps.push({
      stepNumber: steps.length + 1,
      description: "FFT complete. Showing magnitudes |X[k]|.",
      highlightLines: [9, 10],
      visualState: {
        type: "array1d",
        cells: magnitudes.map((v) => ({ val: v, state: "computed" as const })),
        label: "FFT magnitudes |X[k]|",
        pointers: Array.from({ length: n }, (_, i) => ({ index: i, label: `k=${i}` })).slice(0, 4),
      },
      variables: { magnitudes },
    });

    return steps;
  },
};
