import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const POINTS = [
  { x: 40, y: 160 }, { x: 80, y: 60 }, { x: 160, y: 120 }, { x: 240, y: 200 },
  { x: 300, y: 80 }, { x: 340, y: 200 }, { x: 200, y: 260 }, { x: 120, y: 220 },
];

function cross(O: {x:number;y:number}, A: {x:number;y:number}, B: {x:number;y:number}) {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

// ── Convex Hull: Graham Scan ─────────────────────────────────────────────────
export const convexHullGrahamModule: VisualizationModule<null> = {
  id: "geo-convex-hull-graham",
  slug: "convex-hull-graham",
  title: "Convex Hull (Graham Scan)",
  category: ["algorithms", "geometry"],
  difficulty: "advanced",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  description: "Find the convex hull of a point set. Sort by polar angle, then use a stack with left-turn test.",
  relatedTopics: ["convex-hull-jarvis", "closest-pair"],
  pythonCode: `def cross(O, A, B):
    return (A[0]-O[0])*(B[1]-O[1]) - (A[1]-O[1])*(B[0]-O[0])

def graham_scan(points):
    points = sorted(points)
    # Build lower hull
    lower = []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    # Build upper hull
    upper = []
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const pts = POINTS.map((p, i) => ({ ...p, id: i, state: "default" as const }));

    steps.push({
      stepNumber: 1,
      description: `Graham Scan on ${pts.length} points. Sort by x-coordinate.`,
      highlightLines: [4],
      visualState: { type: "geometry", points: pts, label: "Input points" },
      variables: { n: pts.length },
    });

    const sorted = [...POINTS].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);

    steps.push({
      stepNumber: 2,
      description: `Sorted by x. Build lower hull.`,
      highlightLines: [5, 6],
      visualState: {
        type: "geometry",
        points: sorted.map((p, i) => ({ ...p, id: i, state: "default" as const })),
        label: "Sorted points",
      },
      variables: { phase: "lower hull" },
    });

    // Lower hull
    const lower: typeof POINTS = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Add (${p.x},${p.y}) to lower hull. Stack: [${lower.map((q) => `(${q.x},${q.y})`).join(",")}]`,
        highlightLines: [7, 8, 9],
        visualState: {
          type: "geometry",
          points: sorted.map((q, i) => ({
            ...q, id: i,
            state: lower.includes(q) ? "hull" as const : p.x === q.x && p.y === q.y ? "active" as const : "default" as const,
          })),
          hullPoints: lower.map((q, i) => i),
          label: "Lower hull building",
        },
        variables: { stackSize: lower.length },
      });
    }

    // Upper hull
    const upper: typeof POINTS = [];
    for (const p of [...sorted].reverse()) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }

    const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
    const hullIndices = new Set(hull.map((p) => sorted.indexOf(p)));

    steps.push({
      stepNumber: steps.length + 1,
      description: `Convex Hull complete! ${hull.length} hull points.`,
      highlightLines: [13, 14, 15],
      visualState: {
        type: "geometry",
        points: sorted.map((p, i) => ({
          ...p, id: i,
          state: hullIndices.has(i) ? "hull" as const : "default" as const,
        })),
        hullPoints: [...hullIndices],
        label: "Convex Hull",
      },
      variables: { hullSize: hull.length, totalPoints: sorted.length },
    });

    return steps;
  },
};

// ── Convex Hull: Jarvis March ─────────────────────────────────────────────────
export const convexHullJarvisModule: VisualizationModule<null> = {
  id: "geo-convex-hull-jarvis",
  slug: "convex-hull-jarvis",
  title: "Convex Hull (Jarvis March)",
  category: ["algorithms", "geometry"],
  difficulty: "intermediate",
  timeComplexity: "O(nh)",
  spaceComplexity: "O(h)",
  description: "Gift wrapping algorithm: always pick the most counterclockwise point from current position.",
  relatedTopics: ["convex-hull-graham"],
  pythonCode: `def jarvis_march(points):
    n = len(points)
    l = min(range(n), key=lambda i: points[i][0])
    hull = []
    p = l
    while True:
        hull.append(p)
        q = (p + 1) % n
        for r in range(n):
            if cross(points[p], points[q], points[r]) < 0:
                q = r
        p = q
        if p == l:
            break
    return hull`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const pts = POINTS;

    steps.push({
      stepNumber: 1,
      description: `Jarvis March (gift wrapping) on ${pts.length} points. Start from leftmost point.`,
      highlightLines: [1, 2],
      visualState: {
        type: "geometry",
        points: pts.map((p, i) => ({ ...p, id: i, state: "default" as const })),
        label: "Input",
      },
      variables: { n: pts.length },
    });

    const n = pts.length;
    const l = pts.reduce((li, p, i) => p.x < pts[li].x ? i : li, 0);
    const hull: number[] = [];
    let p = l;

    do {
      hull.push(p);
      let q = (p + 1) % n;
      for (let r = 0; r < n; r++) {
        if (cross(pts[p], pts[q], pts[r]) < 0) q = r;
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `At (${pts[p].x},${pts[p].y}): most CCW point is (${pts[q].x},${pts[q].y}). Add to hull.`,
        highlightLines: [6, 7, 8],
        visualState: {
          type: "geometry",
          points: pts.map((pt, i) => ({
            ...pt, id: i,
            state: hull.includes(i) ? "hull" as const : i === q ? "active" as const : "default" as const,
          })),
          hullPoints: [...hull],
          label: `Hull so far: ${hull.length} points`,
        },
        variables: { current: p, next: q, hullSize: hull.length },
      });

      p = q;
    } while (p !== l && hull.length < n);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Jarvis March complete! Convex hull has ${hull.length} vertices.`,
      highlightLines: [12],
      visualState: {
        type: "geometry",
        points: pts.map((pt, i) => ({
          ...pt, id: i,
          state: hull.includes(i) ? "hull" as const : "default" as const,
        })),
        hullPoints: hull,
        label: "Final Hull",
      },
      variables: { hullVertices: hull.length },
    });

    return steps;
  },
};

// ── Line Segment Intersection ────────────────────────────────────────────────
export const lineIntersectionModule: VisualizationModule<null> = {
  id: "geo-line-intersection",
  slug: "line-intersection",
  title: "Line Segment Intersection",
  category: ["algorithms", "geometry"],
  difficulty: "intermediate",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "Determine if two line segments intersect using cross-product orientation tests.",
  relatedTopics: ["convex-hull-graham"],
  pythonCode: `def orientation(p, q, r):
    val = (q[1]-p[1])*(r[0]-q[0]) - (q[0]-p[0])*(r[1]-q[1])
    if val == 0: return 0   # collinear
    return 1 if val > 0 else 2  # CW or CCW

def on_segment(p, q, r):
    return (min(p[0],r[0]) <= q[0] <= max(p[0],r[0]) and
            min(p[1],r[1]) <= q[1] <= max(p[1],r[1]))

def segments_intersect(p1, q1, p2, q2):
    d1 = orientation(p2, q2, p1)
    d2 = orientation(p2, q2, q1)
    d3 = orientation(p1, q1, p2)
    d4 = orientation(p1, q1, q2)
    if d1 != d2 and d3 != d4: return True
    # Check collinear cases
    if d1==0 and on_segment(p2,p1,q2): return True
    if d2==0 and on_segment(p2,q1,q2): return True
    if d3==0 and on_segment(p1,p2,q1): return True
    if d4==0 and on_segment(p1,q2,q1): return True
    return False`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];

    function orient(p: {x:number;y:number}, q: {x:number;y:number}, r: {x:number;y:number}) {
      return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    }

    const segments: Array<[{x:number;y:number},{x:number;y:number}]> = [
      [{ x: 60, y: 200 }, { x: 260, y: 80 }],
      [{ x: 80, y: 100 }, { x: 240, y: 200 }],
      [{ x: 280, y: 60 }, { x: 360, y: 220 }],
      [{ x: 300, y: 80 }, { x: 380, y: 140 }],
    ];

    steps.push({
      stepNumber: 1,
      description: "Line Intersection test. Two pairs of segments. Pair A (blue): crosses. Pair B (orange): parallel.",
      highlightLines: [9],
      visualState: {
        type: "geometry",
        points: segments.flatMap(([a, b], si) => [
          { ...a, id: si * 2, state: si < 2 ? "active" as const : "default" as const },
          { ...b, id: si * 2 + 1, state: si < 2 ? "active" as const : "default" as const },
        ]),
        lines: segments.map(([a, b]) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })),
        label: "Segments",
      },
      variables: { pairs: 2 },
    });

    // Test pair 1
    const [p1, q1] = segments[0], [p2, q2] = segments[1];
    const d1 = orient(p2, q2, p1), d2 = orient(p2, q2, q1);
    const d3 = orient(p1, q1, p2), d4 = orient(p1, q1, q2);
    const intersects1 = (d1 !== 0 || d2 !== 0) && (Math.sign(d1) !== Math.sign(d2)) && (Math.sign(d3) !== Math.sign(d4));

    steps.push({
      stepNumber: 2,
      description: `Pair A: d1=${d1>0?"CCW":d1<0?"CW":"col"}, d2=${d2>0?"CCW":d2<0?"CW":"col"}, d3,d4 differ signs → ${intersects1 ? "INTERSECT" : "NO intersection"}.`,
      highlightLines: [10, 11, 12, 13, 14],
      visualState: {
        type: "geometry",
        points: [
          { ...p1, id: 0, state: "active" as const },
          { ...q1, id: 1, state: "active" as const },
          { ...p2, id: 2, state: "highlighted" as const },
          { ...q2, id: 3, state: "highlighted" as const },
        ],
        lines: [{ x1: p1.x, y1: p1.y, x2: q1.x, y2: q1.y }, { x1: p2.x, y1: p2.y, x2: q2.x, y2: q2.y }],
        label: intersects1 ? "Pair A: INTERSECT" : "Pair A: No intersection",
      },
      variables: { d1, d2, d3, d4, result: intersects1 },
    });

    // Test pair 2 (parallel)
    const [p3, q3] = segments[2], [p4, q4] = segments[3];
    const e1 = orient(p3, q3, p4), e2 = orient(p3, q3, q4);
    const e3 = orient(p4, q4, p3), e4 = orient(p4, q4, q3);
    const intersects2 = Math.sign(e1) !== Math.sign(e2) && Math.sign(e3) !== Math.sign(e4);

    steps.push({
      stepNumber: 3,
      description: `Pair B: d1,d2 same sign → ${intersects2 ? "INTERSECT" : "NO intersection (parallel segments)"}.`,
      highlightLines: [14],
      visualState: {
        type: "geometry",
        points: [
          { ...p3, id: 0, state: "default" as const },
          { ...q3, id: 1, state: "default" as const },
          { ...p4, id: 2, state: "default" as const },
          { ...q4, id: 3, state: "default" as const },
        ],
        lines: [{ x1: p3.x, y1: p3.y, x2: q3.x, y2: q3.y }, { x1: p4.x, y1: p4.y, x2: q4.x, y2: q4.y }],
        label: intersects2 ? "Pair B: INTERSECT" : "Pair B: Parallel (no intersection)",
      },
      variables: { e1, e2, e3, e4, result: intersects2 },
    });

    return steps;
  },
};

// ── Point in Polygon ──────────────────────────────────────────────────────────
export const pointInPolygonModule: VisualizationModule<null> = {
  id: "geo-point-in-polygon",
  slug: "point-in-polygon",
  title: "Point in Polygon",
  category: ["algorithms", "geometry"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Ray casting algorithm: count how many times a ray from the test point crosses the polygon edges.",
  relatedTopics: ["line-intersection"],
  pythonCode: `def point_in_polygon(polygon, point):
    x, y = point
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > y) != (yj > y) and
                x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const polygon = [
      { x: 100, y: 80 }, { x: 280, y: 60 }, { x: 340, y: 180 },
      { x: 260, y: 280 }, { x: 100, y: 260 },
    ];
    const testPoints = [
      { x: 200, y: 180, inside: true },
      { x: 60, y: 150, inside: false },
      { x: 300, y: 130, inside: true },
    ];

    steps.push({
      stepNumber: 1,
      description: "Point in Polygon using ray casting. Cast horizontal ray from test point, count edge crossings.",
      highlightLines: [1, 2],
      visualState: {
        type: "geometry",
        points: polygon.map((p, i) => ({ ...p, id: i, state: "hull" as const })),
        polygon: polygon.map((_, i) => i),
        label: "Polygon",
      },
      variables: { vertices: polygon.length },
    });

    for (const tp of testPoints) {
      // Ray casting
      let inside = false;
      let j = polygon.length - 1;
      const crossings: number[] = [];
      for (let i = 0; i < polygon.length; i++) {
        const { x: xi, y: yi } = polygon[i];
        const { x: xj, y: yj } = polygon[j];
        if ((yi > tp.y) !== (yj > tp.y) && tp.x < ((xj - xi) * (tp.y - yi)) / (yj - yi) + xi) {
          inside = !inside;
          crossings.push(i);
        }
        j = i;
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `Test point (${tp.x},${tp.y}): ray crosses ${crossings.length} edge(s) → ${inside ? "INSIDE" : "OUTSIDE"} polygon.`,
        highlightLines: [6, 7, 8, 9],
        visualState: {
          type: "geometry",
          points: [
            ...polygon.map((p, i) => ({ ...p, id: i, state: "hull" as const })),
            { x: tp.x, y: tp.y, id: polygon.length, state: inside ? "active" as const : "current" as const },
          ],
          polygon: polygon.map((_, i) => i),
          label: `(${tp.x},${tp.y}) is ${inside ? "INSIDE" : "OUTSIDE"}`,
        },
        variables: { testX: tp.x, testY: tp.y, crossings: crossings.length, inside },
      });
    }

    return steps;
  },
};
