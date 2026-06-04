import { createPlaceholderModule } from "@/visualizations/placeholder";

export const gcdEuclideanModule = createPlaceholderModule(
  "gcd-euclidean", "gcd-euclidean", "GCD (Euclidean Algorithm)",
  ["algorithms", "mathematical"], "beginner",
);

export const extendedEuclideanModule = createPlaceholderModule(
  "extended-euclidean", "extended-euclidean", "Extended Euclidean Algorithm",
  ["algorithms", "mathematical"], "intermediate",
);

export const sieveEratosthenesModule = createPlaceholderModule(
  "sieve-eratosthenes", "sieve-eratosthenes", "Sieve of Eratosthenes",
  ["algorithms", "mathematical"], "beginner",
);

export const segmentedSieveModule = createPlaceholderModule(
  "segmented-sieve", "segmented-sieve", "Segmented Sieve",
  ["algorithms", "mathematical"], "intermediate",
);

export const fastExponentiationModule = createPlaceholderModule(
  "fast-exponentiation", "fast-exponentiation", "Fast Exponentiation",
  ["algorithms", "mathematical"], "intermediate",
);

export const chineseRemainderModule = createPlaceholderModule(
  "chinese-remainder", "chinese-remainder", "Chinese Remainder Theorem",
  ["algorithms", "mathematical"], "advanced",
);

export const millerRabinModule = createPlaceholderModule(
  "miller-rabin", "miller-rabin", "Miller-Rabin Primality Test",
  ["algorithms", "mathematical"], "advanced",
);

export const pollardRhoModule = createPlaceholderModule(
  "pollard-rho", "pollard-rho", "Pollard's Rho Factoring",
  ["algorithms", "mathematical"], "advanced",
);
