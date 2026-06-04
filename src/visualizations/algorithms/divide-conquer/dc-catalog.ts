import { createPlaceholderModule } from "@/visualizations/placeholder";

export const karatsubaModule = createPlaceholderModule(
  "karatsuba", "karatsuba", "Karatsuba Multiplication",
  ["algorithms", "divide-conquer"], "advanced",
);

export const strassenModule = createPlaceholderModule(
  "strassen", "strassen", "Strassen's Matrix Multiplication",
  ["algorithms", "divide-conquer"], "advanced",
);

export const closestPairModule = createPlaceholderModule(
  "closest-pair", "closest-pair", "Closest Pair of Points",
  ["algorithms", "divide-conquer"], "advanced",
);

export const medianOfMediansModule = createPlaceholderModule(
  "median-of-medians", "median-of-medians", "Median of Medians",
  ["algorithms", "divide-conquer"], "advanced",
);

export const fastFourierTransformModule = createPlaceholderModule(
  "fast-fourier-transform", "fast-fourier-transform", "Fast Fourier Transform",
  ["algorithms", "divide-conquer"], "advanced",
);
