import { createPlaceholderModule } from "@/visualizations/placeholder";

export const convexHullGrahamModule = createPlaceholderModule(
  "convex-hull-graham", "convex-hull-graham", "Convex Hull (Graham Scan)",
  ["algorithms", "geometry"], "advanced",
);

export const convexHullJarvisModule = createPlaceholderModule(
  "convex-hull-jarvis", "convex-hull-jarvis", "Convex Hull (Jarvis March)",
  ["algorithms", "geometry"], "intermediate",
);

export const lineIntersectionModule = createPlaceholderModule(
  "line-intersection", "line-intersection", "Line Intersection",
  ["algorithms", "geometry"], "intermediate",
);

export const pointInPolygonModule = createPlaceholderModule(
  "point-in-polygon", "point-in-polygon", "Point in Polygon",
  ["algorithms", "geometry"], "intermediate",
);
