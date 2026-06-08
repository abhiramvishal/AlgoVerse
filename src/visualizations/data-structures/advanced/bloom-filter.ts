import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `import mmh3
from bitarray import bitarray

class BloomFilter:
    def __init__(self, size, hash_count):
        self.size = size
        self.hash_count = hash_count
        self.bit_array = bitarray(size)
        self.bit_array.setall(0)

    def _hashes(self, item):
        return [mmh3.hash(item, i) % self.size for i in range(self.hash_count)]

    def insert(self, item):
        for h in self._hashes(item):
            self.bit_array[h] = 1

    def lookup(self, item):
        return all(self.bit_array[h] for h in self._hashes(item))`;

const SIZE = 16;

function simpleHash(word: string, seed: number): number {
  let h = seed * 31;
  for (let i = 0; i < word.length; i++) {
    h = (h * 31 + word.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h) % SIZE;
}

function getHashes(word: string): number[] {
  return [simpleHash(word, 1), simpleHash(word, 2), simpleHash(word, 3)];
}

export const bloomFilterModule: VisualizationModule<{ words: string[]; lookups: string[] }> = {
  id: "data-structures-advanced-bloom-filter",
  slug: "bloom-filter",
  title: "Bloom Filter",
  category: ["data-structures", "advanced"],
  difficulty: "advanced",
  timeComplexity: "O(k) insert/lookup (k = hash functions)",
  spaceComplexity: "O(m) (m = bit array size)",
  description: "A space-efficient probabilistic data structure that tests set membership with possible false positives.",
  relatedTopics: ["hash-table-linear-probing"],
  pythonCode,
  codeSteps: [],
  defaultInput: {
    words: ["hello", "world", "foo", "bar"],
    lookups: ["hello", "foo", "baz", "qux"],
  },
  generateSteps(input) {
    const { words, lookups } = input;
    const bits = new Array(SIZE).fill(0);
    const steps: AnimationStep[] = [];

    const snap = (desc: string, active: number[], computed: number[], lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells: bits.map((b, i) => ({
            val: b,
            state: active.includes(i) ? "active" : computed.includes(i) ? "computed" : b === 1 ? "highlighted" : "default",
          })),
          label: `Bloom Filter Bit Array (size=${SIZE})`,
          pointer: active.map((i) => ({ index: i, label: "h" })),
        },
        variables: { bitsSet: bits.filter((b) => b === 1).length, ...vars },
      });
    };

    snap("Initialize Bloom filter with 16-bit array, all zeros. Using 3 hash functions.", [], [], [1, 2, 3, 4, 5, 6, 7, 8, 9], {
      size: SIZE,
      hashCount: 3,
    });

    for (const word of words) {
      const hashes = getHashes(word);
      snap(
        `Insert "${word}": hash positions = [${hashes.join(", ")}].`,
        hashes,
        [],
        [13, 14, 15],
        { word, hashes },
      );
      for (const h of hashes) bits[h] = 1;
      snap(
        `Set bits [${hashes.join(", ")}] to 1 for "${word}".`,
        [],
        hashes,
        [14, 15],
        { word, hashes, bitsSet: bits.filter((b) => b === 1).length },
      );
    }

    snap("All words inserted. Bit array state:", [], [], [], {
      insertedWords: words,
      bitsSet: bits.filter((b) => b === 1).length,
    });

    for (const word of lookups) {
      const hashes = getHashes(word);
      const allSet = hashes.every((h) => bits[h] === 1);
      snap(
        `Lookup "${word}": check positions [${hashes.join(", ")}]. All set? ${allSet}.`,
        hashes,
        [],
        [17, 18],
        { word, hashes, allSet },
      );

      const isKnownInserted = words.includes(word);
      const result = allSet
        ? isKnownInserted
          ? `"${word}" is in the set (true positive).`
          : `"${word}" says YES but is NOT in set — FALSE POSITIVE!`
        : `"${word}" is definitely NOT in the set.`;

      snap(result, [], allSet ? hashes : [], [18], {
        word,
        result: allSet ? "MAYBE IN SET" : "DEFINITELY NOT IN SET",
        falsePositive: allSet && !isKnownInserted,
      });
    }

    return steps;
  },
};
