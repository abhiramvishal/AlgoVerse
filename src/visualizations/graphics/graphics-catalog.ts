import { createPlaceholderModule } from "@/visualizations/placeholder";

// Rasterization
export const bresenhamLineModule = createPlaceholderModule(
  "bresenham-line", "bresenham-line", "Bresenham's Line Algorithm",
  ["computer-graphics", "rasterization"], "intermediate",
);
export const bresenhamCircleModule = createPlaceholderModule(
  "bresenham-circle", "bresenham-circle", "Bresenham's Circle Algorithm",
  ["computer-graphics", "rasterization"], "intermediate",
);
export const scanlineFillModule = createPlaceholderModule(
  "scanline-fill", "scanline-fill", "Scanline Fill",
  ["computer-graphics", "rasterization"], "intermediate",
);
export const floodFillModule = createPlaceholderModule(
  "flood-fill", "flood-fill", "Flood Fill",
  ["computer-graphics", "rasterization"], "beginner",
);

// Ray Tracing
export const raySphereModule = createPlaceholderModule(
  "ray-sphere", "ray-sphere", "Ray-Sphere Intersection",
  ["computer-graphics", "ray-tracing"], "advanced",
);
export const rayTriangleModule = createPlaceholderModule(
  "ray-triangle", "ray-triangle", "Ray-Triangle Intersection",
  ["computer-graphics", "ray-tracing"], "advanced",
);
export const shadowRaysModule = createPlaceholderModule(
  "shadow-rays", "shadow-rays", "Shadow Rays",
  ["computer-graphics", "ray-tracing"], "advanced",
);

// Transformations
export const twoDRotationModule = createPlaceholderModule(
  "2d-rotation", "2d-rotation", "2D Rotation",
  ["computer-graphics", "transformations"], "beginner",
);
export const threeDRotationModule = createPlaceholderModule(
  "3d-rotation", "3d-rotation", "3D Rotation",
  ["computer-graphics", "transformations"], "intermediate",
);
export const affineTransformationsModule = createPlaceholderModule(
  "affine-transformations", "affine-transformations", "Affine Transformations",
  ["computer-graphics", "transformations"], "intermediate",
);
export const homogeneousCoordsModule = createPlaceholderModule(
  "homogeneous-coords", "homogeneous-coords", "Homogeneous Coordinates",
  ["computer-graphics", "transformations"], "intermediate",
);

// Clipping
export const cohenSutherlandModule = createPlaceholderModule(
  "cohen-sutherland", "cohen-sutherland", "Cohen-Sutherland Clipping",
  ["computer-graphics", "clipping"], "intermediate",
);
export const sutherlandHodgmanModule = createPlaceholderModule(
  "sutherland-hodgman", "sutherland-hodgman", "Sutherland-Hodgman Clipping",
  ["computer-graphics", "clipping"], "advanced",
);
