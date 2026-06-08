import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `import math

def dist(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def closest_pair(points):
    points.sort(key=lambda p: p[0])
    return _closest(points)

def _closest(pts):
    n = len(pts)
    if n <= 3:
        return min_brute(pts)
    mid = n // 2
    mx = pts[mid][0]
    dl = _closest(pts[:mid])
    dr = _closest(pts[mid:])
    d = min(dl, dr)
    strip = [p for p in pts if abs(p[0]-mx) < d]
    strip.sort(key=lambda p: p[1])
    for i in range(len(strip)):
        for j in range(i+1, min(i+8, len(strip))):
            d = min(d, dist(strip[i], strip[j]))
    return d`;

const POINTS = [
  { x: 2, y: 3, id: 0, state: "default" as const },
  { x: 12, y: 30, id: 1, state: "default" as const },
  { x: 40, y: 50, id: 2, state: "default" as const },
  { x: 5, y: 1, id: 3, state: "default" as const },
  { x: 12, y: 10, id: 4, state: "default" as const },
  { x: 3, y: 4, id: 5, state: "default" as const },
  { x: 25, y: 14, id: 6, state: "default" as const },
  { x: 35, y: 28, id: 7, state: "default" as const },
];

export const closestPairModule: VisualizationModule<null> = {
  id: "divide-conquer-closest-pair",
  slug: "closest-pair",
  title: "Closest Pair of Points",
  category: ["algorithms", "divide-conquer"],
  difficulty: "advanced",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  description:
    "Find the closest pair of points using divide and conquer.",
  relatedTopics: ["convex-hull-graham", "geometry"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const pts = POINTS.map((p) => ({ ...p }));

    function dist(a: typeof pts[0], b: typeof pts[0]) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    function snapshot(states: Map<number, string>, lines: [number, number][] = []) {
      return {
        type: "geometry",
        points: pts.map((p) => ({
          ...p,
          state: states.get(p.id) ?? "default",
        })),
        lines: lines.map(([a, b]) => ({ x1: pts[a].x, y1: pts[a].y, x2: pts[b].x, y2: pts[b].y })),
        polygon: [],
        hullPoints: [],
        label: "",
      };
    }

    steps.push({
      stepNumber: 1,
      description: "Closest pair: sort points by x-coordinate.",
      highlightLines: [7],
      visualState: snapshot(new Map()),
      variables: { n: pts.length },
    });

    const sorted = [...pts].sort((a, b) => a.x - b.x);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Sorted by x: ${sorted.map((p) => `(${p.x},${p.y})`).join(", ")}`,
      highlightLines: [7],
      visualState: snapshot(new Map(sorted.map((p, i) => [p.id, i < sorted.length / 2 ? "active" : "highlighted"]))),
      variables: { midX: sorted[Math.floor(sorted.length / 2)].x },
    });

    // Divide step
    const mid = Math.floor(sorted.length / 2);
    const leftPts = sorted.slice(0, mid);
    const rightPts = sorted.slice(mid);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Divide at midpoint x=${sorted[mid].x}. Left: ${leftPts.length} pts, Right: ${rightPts.length} pts.`,
      highlightLines: [13, 14],
      visualState: snapshot(new Map([
        ...leftPts.map((p) => [p.id, "active"] as [number, string]),
        ...rightPts.map((p) => [p.id, "highlighted"] as [number, string]),
      ])),
      variables: { midX: sorted[mid].x },
    });

    // Brute force left half
    let minDist = Infinity;
    let bestPair: [number, number] = [0, 1];
    for (let i = 0; i < leftPts.length; i++) {
      for (let j = i + 1; j < leftPts.length; j++) {
        const d = dist(leftPts[i], leftPts[j]);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Left: check dist(${leftPts[i].id}, ${leftPts[j].id}) = ${d.toFixed(2)}.`,
          highlightLines: [11],
          visualState: snapshot(new Map([
            [leftPts[i].id, "active"],
            [leftPts[j].id, "active"],
          ]), [[leftPts[i].id, leftPts[j].id]]),
          variables: { distance: +d.toFixed(2), minDist: +minDist.toFixed(2) },
        });
        if (d < minDist) { minDist = d; bestPair = [leftPts[i].id, leftPts[j].id]; }
      }
    }

    // Brute force right half
    for (let i = 0; i < rightPts.length; i++) {
      for (let j = i + 1; j < rightPts.length; j++) {
        const d = dist(rightPts[i], rightPts[j]);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Right: check dist(${rightPts[i].id}, ${rightPts[j].id}) = ${d.toFixed(2)}.`,
          highlightLines: [15, 16],
          visualState: snapshot(new Map([
            [rightPts[i].id, "active"],
            [rightPts[j].id, "active"],
          ]), [[rightPts[i].id, rightPts[j].id]]),
          variables: { distance: +d.toFixed(2), minDist: +minDist.toFixed(2) },
        });
        if (d < minDist) { minDist = d; bestPair = [rightPts[i].id, rightPts[j].id]; }
      }
    }

    // Strip check
    const midX = sorted[mid].x;
    const strip = sorted.filter((p) => Math.abs(p.x - midX) < minDist);
    strip.sort((a, b) => a.y - b.y);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Strip within d=${minDist.toFixed(2)} of midline: ${strip.length} points.`,
      highlightLines: [19, 20],
      visualState: snapshot(new Map(strip.map((p) => [p.id, "highlighted"] as [number, string]))),
      variables: { stripSize: strip.length, d: +minDist.toFixed(2) },
    });

    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < Math.min(i + 8, strip.length); j++) {
        const d = dist(strip[i], strip[j]);
        if (d < minDist) {
          minDist = d;
          bestPair = [strip[i].id, strip[j].id];
          steps.push({
            stepNumber: steps.length + 1,
            description: `Strip: new minimum dist(${strip[i].id},${strip[j].id}) = ${d.toFixed(2)}.`,
            highlightLines: [21, 22],
            visualState: snapshot(new Map([
              [strip[i].id, "active"],
              [strip[j].id, "active"],
            ]), [[strip[i].id, strip[j].id]]),
            variables: { newMinDist: +d.toFixed(2) },
          });
        }
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Closest pair: points ${bestPair[0]} and ${bestPair[1]}, distance = ${minDist.toFixed(3)}.`,
      highlightLines: [23],
      visualState: snapshot(new Map([
        [bestPair[0], "active"],
        [bestPair[1], "active"],
      ]), [bestPair]),
      variables: { closestPair: bestPair, minDistance: +minDist.toFixed(3) },
    });

    return steps;
  },
};
