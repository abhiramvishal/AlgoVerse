import type { VisualizationModule, AnimationStep } from "@/types/visualization";

function arr(stepNumber: number, description: string, lines: number[], cells: {val: string|number, state: string}[], label: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "array1d", cells, label }, variables: vars };
}
function mat(stepNumber: number, description: string, lines: number[], matrix: (string|number)[][], rowLabels: string[], colLabels: string[], active: [number,number] | null, title: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "matrix", matrix, rowLabels, colLabels, active, highlighted: active ? [active] : [], title }, variables: vars };
}

// ─── Bresenham's Line Algorithm ───────────────────────────────────────────────
export const bresenhamLineModule: VisualizationModule<{x1:number,y1:number,x2:number,y2:number}> = {
  id: "bresenham-line", slug: "bresenham-line", title: "Bresenham's Line Algorithm",
  category: ["graphics"], difficulty: "beginner",
  timeComplexity: "O(max(dx,dy))", spaceComplexity: "O(1)",
  description: "Rasterize a line using only integer arithmetic — no floating point needed.",
  relatedTopics: [],
  pythonCode: `def bresenham_line(x0, y0, x1, y1):
    points = []
    dx = abs(x1 - x0)
    dy = abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy
    while True:
        points.append((x0, y0))
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy; x0 += sx
        if e2 < dx:
            err += dx; y0 += sy
    return points`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: {x0:0,y0:0,x1:6,y1:4} as any,
  generateSteps(input: any) {
    const {x1=6, y1=4} = input as {x1:number,y1:number};
    let x=0,y=0,err=x1-y1;
    const points: [number,number][] = [];
    while(true) {
      points.push([x,y]);
      if(x===x1&&y===y1) break;
      const e2=2*err;
      if(e2>-y1){err-=y1;x++;}
      if(e2<x1){err+=x1;y++;}
      if(points.length>20) break;
    }
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Draw line (0,0)→(${x1},${y1})`,[1,2,3,4,5,6],[{val:`dx=${x1}`,state:"default"},{val:`dy=${y1}`,state:"default"},{val:`err=${x1-y1}`,state:"active"}],"Init",{dx:x1,dy:y1}));
    points.forEach((p,i) => {
      steps.push(arr(i+2,`Plot (${p[0]},${p[1]})`,[8],points.slice(0,i+1).map(([px,py])=>({val:`(${px},${py})`,state:i===i?"highlighted":"computed"})),"Pixels",{x:p[0],y:p[1]}));
    });
    return steps;
  }
};

// ─── Bresenham's Circle ───────────────────────────────────────────────────────
export const bresenhamCircleModule: VisualizationModule<number> = {
  id: "bresenham-circle", slug: "bresenham-circle", title: "Bresenham's Circle",
  category: ["graphics"], difficulty: "beginner",
  timeComplexity: "O(r)", spaceComplexity: "O(r)",
  description: "Rasterize a circle using midpoint algorithm — 8-way symmetry, integer ops only.",
  relatedTopics: [],
  pythonCode: `def bresenham_circle(cx, cy, r):
    x, y = 0, r
    d = 3 - 2 * r  # decision parameter
    points = []
    while y >= x:
        # 8-way symmetry: plot 8 octants
        for (dx, dy) in [(x,y),(y,x),(x,-y),(y,-x),
                         (-x,y),(-y,x),(-x,-y),(-y,-x)]:
            points.append((cx+dx, cy+dy))
        if d < 0:
            d += 4*x + 6
        else:
            d += 4*(x - y) + 10
            y -= 1
        x += 1
    return points`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: 5,
  generateSteps(r) {
    const steps: AnimationStep[] = [];
    let x=0, y=r, d=3-2*r;
    const pts: [number,number][] = [];
    while(y>=x) {
      pts.push([x,y]);
      if(d<0) d+=4*x+6; else { d+=4*(x-y)+10; y--; }
      x++;
      if(pts.length>12) break;
    }
    steps.push(arr(1,`Circle r=${r}: start at (0,${r}), d=${3-2*r}`,[1,2,3],[{val:`x=0`,state:"active"},{val:`y=${r}`,state:"active"},{val:`d=${3-2*r}`,state:"computed"}],"Init",{r}));
    pts.forEach((p,i) => {
      steps.push(arr(i+2,`(${p[0]},${p[1]}) → 8 pixels via symmetry`,[5,6,7,8],pts.slice(0,i+1).map(([px,py])=>({val:`(${px},${py})`,state:"computed"})).concat([{val:"×8",state:"highlighted"}]),`Octant step ${i+1}`,{x:p[0],y:p[1]}));
    });
    return steps;
  }
};

// ─── Scanline Fill ────────────────────────────────────────────────────────────
export const scanlineFillModule: VisualizationModule<number[][]> = {
  id: "scanline-fill", slug: "scanline-fill", title: "Scanline Fill",
  category: ["graphics"], difficulty: "intermediate",
  timeComplexity: "O(n·h)", spaceComplexity: "O(n)",
  description: "Fill a polygon by scanning horizontal lines and filling between edge intersections.",
  relatedTopics: [],
  pythonCode: `def scanline_fill(polygon, color):
    min_y = min(p[1] for p in polygon)
    max_y = max(p[1] for p in polygon)
    for y in range(min_y, max_y + 1):
        intersections = []
        n = len(polygon)
        for i in range(n):
            x1,y1 = polygon[i]
            x2,y2 = polygon[(i+1) % n]
            if y1 <= y < y2 or y2 <= y < y1:
                # Edge intersection with scanline y
                t = (y - y1) / (y2 - y1)
                x = x1 + t * (x2 - x1)
                intersections.append(x)
        intersections.sort()
        for i in range(0, len(intersections), 2):
            fill_span(intersections[i], intersections[i+1], y, color)`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 15, highlightLines: [15] },
  ],
  defaultInput: [[0,0],[10,0],[8,6],[5,8],[2,6]],
  generateSteps(poly) {
    const ys = poly.map(p=>p[1]);
    const minY=Math.min(...ys), maxY=Math.max(...ys);
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Polygon with ${poly.length} vertices, scan y=${minY}..${maxY}`,[2,3],poly.map(p=>({val:`(${p[0]},${p[1]})`,state:"active"})),"Polygon",{minY,maxY}));
    for (let y=minY; y<=maxY; y+=2) {
      const ints: number[] = [];
      const n=poly.length;
      for(let i=0;i<n;i++){
        const [x1,y1]=poly[i],[x2,y2]=poly[(i+1)%n];
        if((y1<=y&&y<y2)||(y2<=y&&y<y1)){
          const t=(y-y1)/(y2-y1);
          ints.push(x1+t*(x2-x1));
        }
      }
      ints.sort((a,b)=>a-b);
      if(ints.length>=2) {
        steps.push(arr(Math.floor(y/2)+2,`Scanline y=${y}: fill x=[${ints[0].toFixed(1)},${ints[1].toFixed(1)}]`,[4,5,6,7,8,9,10,11,12,13,14,15],
          [{val:`y=${y}`,state:"active"},{val:`x_l=${ints[0].toFixed(1)}`,state:"computed"},{val:`x_r=${ints[1].toFixed(1)}`,state:"computed"},{val:"FILL",state:"highlighted"}],`Scanline y=${y}`,{spans:ints.length/2}));
      }
    }
    return steps;
  }
};

// ─── Flood Fill ───────────────────────────────────────────────────────────────
export const floodFillModule: VisualizationModule<{seed:[number,number],size:number}> = {
  id: "flood-fill", slug: "flood-fill", title: "Flood Fill",
  category: ["graphics"], difficulty: "beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Fill connected region from a seed pixel using BFS or DFS.",
  relatedTopics: [],
  pythonCode: `from collections import deque

def flood_fill_bfs(grid, sr, sc, new_color):
    old_color = grid[sr][sc]
    if old_color == new_color:
        return grid
    queue = deque([(sr, sc)])
    grid[sr][sc] = new_color
    while queue:
        r, c = queue.popleft()
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r+dr, c+dc
            if 0<=nr<len(grid) and 0<=nc<len(grid[0]) and grid[nr][nc]==old_color:
                grid[nr][nc] = new_color
                queue.append((nr, nc))
    return grid`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: {seed:[2,2], size:5},
  generateSteps({seed, size}) {
    const grid = Array.from({length:size},()=>Array(size).fill(0));
    // Border
    for(let i=0;i<size;i++){grid[0][i]=1;grid[size-1][i]=1;grid[i][0]=1;grid[i][size-1]=1;}
    const steps: AnimationStep[] = [];
    const flat = grid.flat().map((v,i)=>({val:v===1?"█":" ",state:i===seed[0]*size+seed[1]?"active":"default" as string}));
    steps.push(arr(1,`Seed=(${seed[0]},${seed[1]}), flood fill interior`,[6,7],flat,"Grid",{seed,size}));
    const queue: [number,number][] = [seed as [number,number]];
    const filled: Set<string> = new Set([`${seed[0]},${seed[1]}`]);
    for(let step=0;step<Math.min(8,size*size);step++) {
      if(!queue.length) break;
      const [r,c]=queue.shift()!;
      [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr,nc])=>{
        if(nr>=0&&nr<size&&nc>=0&&nc<size&&grid[nr][nc]===0&&!filled.has(`${nr},${nc}`)) {
          filled.add(`${nr},${nc}`); queue.push([nr,nc]);
        }
      });
      const cells = grid.flat().map((v,i)=>{
        const ri=Math.floor(i/size),ci=i%size;
        return {val:v===1?"█":filled.has(`${ri},${ci}`)?"░":" ",state:ri===r&&ci===c?"highlighted":"default" as string};
      });
      steps.push(arr(step+2,`Fill (${r},${c}), queue size=${queue.length}`,[9,10,11,12,13,14],cells,`Step ${step+1}`,{filled:filled.size}));
    }
    return steps;
  }
};

// ─── Ray-Sphere Intersection ──────────────────────────────────────────────────
export const raySphereModule: VisualizationModule<{radius:number}> = {
  id: "ray-sphere", slug: "ray-sphere", title: "Ray-Sphere Intersection",
  category: ["graphics"], difficulty: "intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Solve quadratic equation to find ray-sphere intersection points.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def ray_sphere(ray_origin, ray_dir, sphere_center, radius):
    oc = ray_origin - sphere_center
    a = np.dot(ray_dir, ray_dir)
    b = 2 * np.dot(oc, ray_dir)
    c = np.dot(oc, oc) - radius**2
    discriminant = b**2 - 4*a*c
    if discriminant < 0:
        return None              # no intersection
    sqrt_d = np.sqrt(discriminant)
    t1 = (-b - sqrt_d) / (2*a)  # near intersection
    t2 = (-b + sqrt_d) / (2*a)  # far intersection
    if t1 > 0: return t1
    if t2 > 0: return t2
    return None

def shade(t, ray, normal, light):
    hit = ray.origin + t * ray.dir
    diffuse = max(0, np.dot(normalize(normal(hit)), light))
    return diffuse`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: {radius: 3},
  generateSteps({radius}) {
    const steps: AnimationStep[] = [];
    const oc=[3,0,0], rd=[-1,0,0];
    const a=1, b=2*(oc[0]*rd[0]), c=oc[0]**2-radius**2;
    const disc=b**2-4*a*c;
    const t1=(-b-Math.sqrt(disc))/(2*a), t2=(-b+Math.sqrt(disc))/(2*a);
    steps.push(arr(1,"Ray from (3,0,0) direction (-1,0,0) toward sphere",[3,4],[{val:"origin=(3,0,0)",state:"active"},{val:"dir=(-1,0,0)",state:"active"}],"Ray",{radius}));
    steps.push(arr(2,`Compute oc, quadratic coefficients a=${a},b=${b.toFixed(1)},c=${c.toFixed(1)}`,[4,5,6],[{val:`a=${a}`,state:"computed"},{val:`b=${b.toFixed(1)}`,state:"computed"},{val:`c=${c.toFixed(1)}`,state:"computed"}],"Quadratic",{}));
    steps.push(arr(3,`Discriminant = ${disc.toFixed(2)} > 0 → 2 intersections`,[7,8],[{val:`disc=${disc.toFixed(2)}`,state:"highlighted"},{val:"2 hits",state:"active"}],"Discriminant",{disc:disc.toFixed(2)}));
    steps.push(arr(4,`t1=${t1.toFixed(2)} (near), t2=${t2.toFixed(2)} (far)`,[11,12],[{val:`t1=${t1.toFixed(2)}`,state:"highlighted"},{val:`t2=${t2.toFixed(2)}`,state:"computed"}],"Intersections",{near:t1.toFixed(2),far:t2.toFixed(2)}));
    steps.push(arr(5,"Return t1 (nearest hit); compute normal at hit point",[13,17,18],[{val:`hit=(${(3+t1).toFixed(2)},0,0)`,state:"highlighted"},{val:"shade→pixel",state:"computed"}],"Shading",{t:t1.toFixed(2)}));
    return steps;
  }
};

// ─── Ray-Triangle Intersection ────────────────────────────────────────────────
export const rayTriangleModule: VisualizationModule<{px:number,py:number}> = {
  id: "ray-triangle", slug: "ray-triangle", title: "Ray-Triangle Intersection",
  category: ["graphics"], difficulty: "intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Möller–Trumbore algorithm for ray-triangle intersection in O(1).",
  relatedTopics: [],
  pythonCode: `import numpy as np

def moller_trumbore(ray_origin, ray_dir, v0, v1, v2, eps=1e-7):
    e1 = v1 - v0
    e2 = v2 - v0
    h  = np.cross(ray_dir, e2)
    a  = np.dot(e1, h)
    if abs(a) < eps:
        return None  # ray parallel to triangle
    f = 1.0 / a
    s = ray_origin - v0
    u = f * np.dot(s, h)
    if u < 0 or u > 1:
        return None  # outside triangle
    q = np.cross(s, e1)
    v = f * np.dot(ray_dir, q)
    if v < 0 or u+v > 1:
        return None
    t = f * np.dot(e2, q)
    return t if t > eps else None`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 16, highlightLines: [16] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: {px:0.25, py:0.25},
  generateSteps({px, py}) {
    const steps: AnimationStep[] = [];
    // Triangle v0=(0,0,0), v1=(1,0,0), v2=(0,1,0); ray fired at z=0 plane,
    // hitting (px, py). For this unit triangle the barycentric coords are u=px, v=py.
    const u = px, v = py;
    const uOk = u >= 0 && u <= 1;
    const vOk = v >= 0 && (u + v) <= 1;
    const hit = uOk && vOk && v >= 0;
    const f2 = (x:number)=>x.toFixed(2);

    steps.push(arr(1,`Triangle v0=(0,0,0), v1=(1,0,0), v2=(0,1,0). Ray hits plane at (${f2(px)}, ${f2(py)}).`,[3],
      [{val:"v0",state:"active"},{val:"v1",state:"active"},{val:"v2",state:"active"},{val:`P=(${f2(px)},${f2(py)})`,state:"highlighted"}],"Triangle + ray",{px,py}));
    steps.push(arr(2,"Compute edge vectors e1=v1-v0, e2=v2-v0.",[4,5],
      [{val:"e1=(1,0,0)",state:"computed"},{val:"e2=(0,1,0)",state:"computed"}],"Edges",{}));
    steps.push(arr(3,`h=cross(dir,e2), a=dot(e1,h)=1.0 (not parallel).`,[6,7],
      [{val:"h=(0,0,-1)",state:"computed"},{val:"a=1.0",state:"highlighted"}],"Determinant",{parallel:false}));
    steps.push(arr(4,`Barycentric: u=${f2(u)} (${uOk?"0≤u≤1 ✓":"out of range ✗"}).`,[10,11],
      [{val:`u=${f2(u)}`,state:uOk?"highlighted":"active"}],"Check u",{u:+f2(u),uValid:uOk}));
    steps.push(arr(5,`v=${f2(v)}, u+v=${f2(u+v)} (${vOk?"u+v≤1 ✓":"u+v>1 or v<0 ✗"}).`,[13,14,15],
      [{val:`v=${f2(v)}`,state:vOk?"highlighted":"active"},{val:`u+v=${f2(u+v)}`,state:vOk?"computed":"active"}],"Check v",{v:+f2(v),vValid:vOk}));
    steps.push(arr(6, hit ? `HIT! Point (${f2(px)}, ${f2(py)}) is inside the triangle.` : `MISS — point (${f2(px)}, ${f2(py)}) is outside the triangle.`,[18],
      [{val:hit?"HIT":"MISS",state:"highlighted"}], hit?"Intersection":"No intersection",{result:hit?"HIT":"MISS"}));
    return steps;
  }
};

// ─── Shadow Rays ──────────────────────────────────────────────────────────────
export const shadowRaysModule: VisualizationModule<number> = {
  id: "shadow-rays", slug: "shadow-rays", title: "Shadow Rays",
  category: ["graphics"], difficulty: "intermediate",
  timeComplexity: "O(n) per pixel", spaceComplexity: "O(1)",
  description: "Cast secondary rays toward lights; occluded pixels are in shadow.",
  relatedTopics: [],
  pythonCode: `def shade_point(hit, normal, lights, scene):
    color = ambient_color * Ka
    for light in lights:
        # Direction to light
        L = normalize(light.pos - hit)
        dist = length(light.pos - hit)
        # Cast shadow ray
        shadow_ray = Ray(hit + eps*normal, L)
        occluder = scene.intersect(shadow_ray)
        if occluder and occluder.t < dist:
            continue  # in shadow, skip this light
        # Diffuse (Lambertian)
        NdotL = max(0, dot(normal, L))
        color += light.color * Kd * NdotL
        # Specular (Phong)
        R = reflect(-L, normal)
        VdotR = max(0, dot(-ray_dir, R))
        color += light.color * Ks * VdotR**shininess
    return color`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: 2,
  generateSteps(lights) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Hit point: shoot ${lights} shadow ray(s) toward lights`,[3],[{val:"ambient",state:"default"},{val:`${lights} lights`,state:"active"}],"Shading",{lights}));
    for(let i=0;i<lights;i++){
      steps.push(arr(i+2,`Light ${i}: cast shadow ray`,[7,8],[{val:`L${i}_dir`,state:"active"},{val:"shadow_ray",state:"computed"}],"Shadow ray",{light:i}));
      const occluded=i===0;
      steps.push(arr(i+lights+2,`Light ${i}: ${occluded?"SHADOW (occluded)":"illuminated"}`,[9,10],[{val:`L${i}`,state:occluded?"highlighted":"active"},{val:occluded?"shadow":"lit",state:occluded?"active":"highlighted"}],`Shadow test`,{occluded}));
    }
    steps.push(arr(2*lights+2,"Sum diffuse+specular from unoccluded lights",[11,12,13,14,15,16],[{val:"diffuse",state:"computed"},{val:"specular",state:"computed"},{val:"final_color",state:"highlighted"}],"Final color",{}));
    return steps;
  }
};

// ─── 2D Rotation ─────────────────────────────────────────────────────────────
export const twoDRotationModule: VisualizationModule<{angle:number,points:number[][]}> = {
  id: "2d-rotation", slug: "2d-rotation", title: "2D Rotation",
  category: ["graphics"], difficulty: "beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Rotate 2D points about origin using 2×2 rotation matrix.",
  relatedTopics: [],
  pythonCode: `import numpy as np, math

def rotate_2d(points, angle_deg):
    theta = math.radians(angle_deg)
    R = np.array([
        [math.cos(theta), -math.sin(theta)],
        [math.sin(theta),  math.cos(theta)]
    ])
    return [R @ p for p in points]

# Rotate about arbitrary pivot (cx, cy):
def rotate_about(points, angle_deg, cx, cy):
    pts = [(x-cx, y-cy) for x,y in points]
    rotated = rotate_2d(pts, angle_deg)
    return [(x+cx, y+cy) for x,y in rotated]`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
  ],
  defaultInput: {angle:45, points:[[1,0],[0,1],[-1,0],[0,-1]]},
  generateSteps({angle, points}) {
    const theta=angle*Math.PI/180;
    const cos=Math.cos(theta), sin=Math.sin(theta);
    const rotated=points.map(([x,y])=>[(x*cos-y*sin),(x*sin+y*cos)]);
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Rotate ${points.length} points by ${angle}°`,[3,4,5,6,7],points.map(([x,y])=>({val:`(${x},${y})`,state:"active"})),"Original",{angle}));
    steps.push(arr(2,`R(${angle}°): cos=${cos.toFixed(2)}, sin=${sin.toFixed(2)}`,[4,5,6,7],[{val:`[${cos.toFixed(2)}, -${sin.toFixed(2)}]`,state:"computed"},{val:`[${sin.toFixed(2)},  ${cos.toFixed(2)}]`,state:"computed"}],"Rotation matrix",{}));
    rotated.forEach(([x,y],i) => {
      steps.push(arr(i+3,`Point ${i}: R·(${points[i][0]},${points[i][1]}) = (${x.toFixed(2)},${y.toFixed(2)})`,[8],[{val:`(${x.toFixed(2)},${y.toFixed(2)})`,state:"highlighted"}],`Rotated ${i}`,{original:points[i],rotated:[x.toFixed(2),y.toFixed(2)]}));
    });
    return steps;
  }
};

// ─── 3D Rotation ─────────────────────────────────────────────────────────────
export const threeDRotationModule: VisualizationModule<{ax:number,ay:number,az:number}> = {
  id: "3d-rotation", slug: "3d-rotation", title: "3D Rotation",
  category: ["graphics"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Rotate 3D points using Euler angles (Rx, Ry, Rz) or quaternions.",
  relatedTopics: [],
  pythonCode: `import numpy as np, math

def Rx(a): c,s=math.cos(a),math.sin(a); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def Ry(a): c,s=math.cos(a),math.sin(a); return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def Rz(a): c,s=math.cos(a),math.sin(a); return np.array([[c,-s,0],[s,c,0],[0,0,1]])

def euler_rotate(point, ax, ay, az):
    return Rz(az) @ Ry(ay) @ Rx(ax) @ point

# Quaternion rotation (avoids gimbal lock)
def quat_rotate(point, axis, angle):
    q = np.array([math.cos(angle/2), *[math.sin(angle/2)*a for a in axis]])
    p = np.array([0, *point])
    q_conj = np.array([q[0], -q[1], -q[2], -q[3]])
    return quat_mul(quat_mul(q, p), q_conj)[1:]`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 11, highlightLines: [11] },
  ],
  defaultInput: {ax:30,ay:45,az:0},
  generateSteps({ax,ay,az}) {
    const r=(d:number)=>d*Math.PI/180;
    const point=[1,0,0];
    // Apply Rx
    const afterRx=[point[0],point[1]*Math.cos(r(ax))-point[2]*Math.sin(r(ax)),point[1]*Math.sin(r(ax))+point[2]*Math.cos(r(ax))];
    // Apply Ry
    const afterRy=[afterRx[0]*Math.cos(r(ay))+afterRx[2]*Math.sin(r(ay)),afterRx[1],-afterRx[0]*Math.sin(r(ay))+afterRx[2]*Math.cos(r(ay))];
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Rotate (1,0,0) by Rx=${ax}°, Ry=${ay}°, Rz=${az}°`,[7],[{val:"(1,0,0)",state:"active"}],"Original",{ax,ay,az}));
    steps.push(arr(2,`Apply Rx(${ax}°)`,[3],[{val:`(${afterRx.map(v=>v.toFixed(2)).join(",")})`,state:"computed"}],"After Rx",{ax}));
    steps.push(arr(3,`Apply Ry(${ay}°)`,[4],[{val:`(${afterRy.map(v=>v.toFixed(2)).join(",")})`,state:"computed"}],"After Ry",{ay}));
    steps.push(arr(4,"Final rotated point",[7],[{val:`(${afterRy.map(v=>v.toFixed(2)).join(",")})`,state:"highlighted"}],"Result",{euler:[ax,ay,az]}));
    steps.push(arr(5,"Alternative: quaternion (no gimbal lock)",[10,11,12,13],[{val:"q=[cos,sin·axis]",state:"computed"},{val:"avoids gimbal lock",state:"active"}],"Quaternion",{}));
    return steps;
  }
};

// ─── Affine Transformations ───────────────────────────────────────────────────
export const affineTransformationsModule: VisualizationModule<{x:number,y:number}> = {
  id: "affine-transformations", slug: "affine-transformations", title: "Affine Transformations",
  category: ["graphics"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(1)",
  description: "Translate, scale, rotate, and shear using 3×3 matrices in homogeneous coords.",
  relatedTopics: [],
  pythonCode: `import numpy as np

# Homogeneous 2D transformations (3x3 matrices)
def translate(tx, ty):
    return np.array([[1,0,tx],[0,1,ty],[0,0,1]])

def scale(sx, sy):
    return np.array([[sx,0,0],[0,sy,0],[0,0,1]])

def rotate(theta):
    c,s = np.cos(theta), np.sin(theta)
    return np.array([[c,-s,0],[s,c,0],[0,0,1]])

def shear(hx, hy):
    return np.array([[1,hx,0],[hy,1,0],[0,0,1]])

# Compose transformations: T * R * S
def transform(points, matrices):
    M = np.eye(3)
    for mat in matrices:
        M = mat @ M
    # Apply M to each point (homogeneous)
    return [M @ np.array([x, y, 1]) for x,y in points]`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: {x:2, y:1},
  generateSteps({x, y}) {
    const steps: AnimationStep[] = [];
    const f = (n:number)=>n.toFixed(2);
    const pt = (a:number,b:number)=>`(${f(a)}, ${f(b)})`;

    steps.push(arr(1,`Original point ${pt(x,y)}.`,[3],
      [{val:pt(x,y),state:"active"}],"Point",{x,y}));

    // Scale(2,2)
    let sx = x*2, sy = y*2;
    steps.push(arr(2,`Scale(2,2): ${pt(x,y)} → ${pt(sx,sy)}.`,[6,7],
      [{val:"S=[2,0;0,2;0,0,1]",state:"computed"},{val:pt(sx,sy),state:"highlighted"}],"After Scale",{sx:2,sy:2,result:pt(sx,sy)}));

    // Rotate(45°)
    const th = Math.PI/4, c = Math.cos(th), s = Math.sin(th);
    let rx = sx*c - sy*s, ry = sx*s + sy*c;
    steps.push(arr(3,`Rotate(45°): ${pt(sx,sy)} → ${pt(rx,ry)}.`,[9,10,11],
      [{val:"R=[cos,-sin;sin,cos]",state:"computed"},{val:pt(rx,ry),state:"highlighted"}],"After Rotate",{theta:"45°",result:pt(rx,ry)}));

    // Translate(1,1)
    let tx = rx+1, ty = ry+1;
    steps.push(arr(4,`Translate(1,1): ${pt(rx,ry)} → ${pt(tx,ty)}.`,[3,4,5],
      [{val:"T=[1,0,1;0,1,1;0,0,1]",state:"computed"},{val:pt(tx,ty),state:"highlighted"}],"After Translate",{result:pt(tx,ty)}));

    steps.push(arr(5,`Composition M=T·R·S maps ${pt(x,y)} → ${pt(tx,ty)} in one matrix multiply.`,[16,17,18,19,20],
      [{val:"M=T·R·S",state:"computed"},{val:`${pt(x,y)}→${pt(tx,ty)}`,state:"highlighted"}],"TRS composed",{final:pt(tx,ty)}));
    return steps;
  }
};

// ─── Homogeneous Coordinates ──────────────────────────────────────────────────
export const homogeneousCoordsModule: VisualizationModule<{x:number,y:number}> = {
  id: "homogeneous-coords", slug: "homogeneous-coords", title: "Homogeneous Coordinates",
  category: ["graphics"], difficulty: "intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Unify translation, rotation, and projection in a single matrix multiplication.",
  relatedTopics: [],
  pythonCode: `import numpy as np

# 2D: (x,y) → (x,y,1) in homogeneous form
# Allows translation as matrix multiplication

def to_homogeneous(p): return np.array([*p, 1.0])
def from_homogeneous(p): return p[:2] / p[2]  # perspective divide

# Perspective projection (3D→2D)
def perspective_matrix(fov, aspect, near, far):
    f = 1 / np.tan(fov/2)
    return np.array([
        [f/aspect, 0,  0,                    0],
        [0,        f,  0,                    0],
        [0,        0,  (far+near)/(near-far), 2*far*near/(near-far)],
        [0,        0, -1,                    0]
    ])

# Project 3D point to clip coords
def project(p3d, M):
    h = M @ to_homogeneous(p3d)
    return from_homogeneous(h)  # divide by w`,
  codeSteps: [
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 19, highlightLines: [19] },
  ],
  defaultInput: {x:3, y:2},
  generateSteps({x, y}) {
    const steps: AnimationStep[] = [];
    const f = (n:number)=>n.toFixed(2);

    steps.push(arr(1,`2D point (${f(x)}, ${f(y)}) → homogeneous (${f(x)}, ${f(y)}, 1).`,[6],
      [{val:`(${f(x)},${f(y)})`,state:"active"},{val:`→(${f(x)},${f(y)},1)`,state:"computed"}],"Homogeneous lift (w=1)",{x,y,w:1}));

    // Translate(2,2) as a matrix multiply (works because of the homogeneous w)
    const tx = x+2, ty = y+2;
    steps.push(arr(2,`Translate(2,2) as matrix·vector: (${f(x)},${f(y)},1) → (${f(tx)},${f(ty)},1).`,[6],
      [{val:"T·v",state:"computed"},{val:`(${f(tx)},${f(ty)},1)`,state:"highlighted"}],"Translate via matrix",{tx:2,ty:2,result:`(${f(tx)},${f(ty)})`}));

    // Lift to 3D at depth z = (x+y+1), then perspective divide
    const z = Math.abs(x) + Math.abs(y) + 1;
    steps.push(arr(3,`Place at depth z=${f(z)}: homogeneous (${f(tx)}, ${f(ty)}, ${f(z)}, 1).`,[6],
      [{val:`(${f(tx)},${f(ty)},${f(z)})`,state:"active"},{val:"w=1",state:"computed"}],"Homogeneous 3D",{z}));

    // Perspective divide by w' = z
    const ndcx = tx/z, ndcy = ty/z;
    steps.push(arr(4,`Perspective matrix sets w' = z = ${f(z)}.`,[9,10,11,12,13],
      [{val:`w'=${f(z)}`,state:"highlighted"}],"Clip space",{wPrime:+f(z)}));
    steps.push(arr(5,`Perspective divide ÷w': NDC = (${f(ndcx)}, ${f(ndcy)}). Farther points shrink toward center.`,[7,16,17],
      [{val:`÷${f(z)}`,state:"active"},{val:`NDC=(${f(ndcx)},${f(ndcy)})`,state:"highlighted"}],"NDC after divide",{ndc:`(${f(ndcx)},${f(ndcy)})`}));
    return steps;
  }
};

// ─── Cohen-Sutherland Clipping ────────────────────────────────────────────────
export const cohenSutherlandModule: VisualizationModule<{x1:number,y1:number,x2:number,y2:number}> = {
  id: "cohen-sutherland", slug: "cohen-sutherland", title: "Cohen-Sutherland Clipping",
  category: ["graphics"], difficulty: "intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Clip line segments to a rectangular viewport using region outcodes.",
  relatedTopics: [],
  pythonCode: `INSIDE=0; LEFT=1; RIGHT=2; BOTTOM=4; TOP=8

def outcode(x, y, xmin, xmax, ymin, ymax):
    code = INSIDE
    if   x < xmin: code |= LEFT
    elif x > xmax: code |= RIGHT
    if   y < ymin: code |= BOTTOM
    elif y > ymax: code |= TOP
    return code

def cohen_sutherland(x0,y0,x1,y1, xmin,xmax,ymin,ymax):
    c0, c1 = outcode(x0,y0,...), outcode(x1,y1,...)
    while True:
        if not (c0 | c1):    return (x0,y0,x1,y1)  # trivially accept
        if c0 & c1:          return None             # trivially reject
        c = c0 if c0 else c1
        if c & TOP:    y = ymax; x = x0+(x1-x0)*(ymax-y0)/(y1-y0)
        elif c & BOTTOM: y = ymin; x = x0+(x1-x0)*(ymin-y0)/(y1-y0)
        elif c & RIGHT:  x = xmax; y = y0+(y1-y0)*(xmax-x0)/(x1-x0)
        elif c & LEFT:   x = xmin; y = y0+(y1-y0)*(xmin-x0)/(x1-x0)
        if c == c0: x0,y0,c0 = x,y,outcode(x,y,...)
        else:       x1,y1,c1 = x,y,outcode(x,y,...)`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: {x1:-5,y1:3,x2:8,y2:7} as any,
  generateSteps(input: any) {
    const {x1=-5,y1=3,x2=8,y2=7}=input;
    const steps: AnimationStep[] = [];
    const viewport={xmin:0,xmax:5,ymin:0,ymax:5};
    const oc=(x:number,y:number)=>{let c=0;if(x<0)c|=1;if(x>5)c|=2;if(y<0)c|=4;if(y>5)c|=8;return c;};
    const c0=oc(x1,y1),c1=oc(x2,y2);
    steps.push(arr(1,`Line (${x1},${y1})→(${x2},${y2}), viewport [0..5]x[0..5]`,[1],[{val:`c0=${c0.toString(2).padStart(4,'0')}`,state:"active"},{val:`c1=${c1.toString(2).padStart(4,'0')}`,state:"active"}],"Outcodes",{viewport}));
    steps.push(arr(2,`c0|c1=${(c0|c1).toString(2)} != 0 -> not trivially inside`,[11],[{val:`OR=${c0|c1}`,state:"computed"},{val:`AND=${c0&c1}`,state:"computed"}],"Check",{accept:false,reject:(c0&c1)!==0}));
    steps.push(arr(3,`c0=${c0}: endpoint (${x1},${y1}) is LEFT of viewport`,[13,14],[{val:`clip LEFT`,state:"active"},{val:"intersect x=0",state:"computed"}],"Clip LEFT",{boundary:"x=0"}));
    steps.push(arr(4,"New endpoint at (0, 4.2) — recompute outcode",[18],[{val:"(0,4.2)",state:"highlighted"},{val:"c0=0000",state:"computed"}],"Updated p0",{inside:true}));
    steps.push(arr(5,"Both inside → ACCEPT clipped segment",[11],[{val:"accept",state:"highlighted"},{val:"(0,4.2)→(5,5.8)",state:"highlighted"}],"Clipped line",{result:"accepted"}));
    return steps;
  }
};

// ─── Sutherland-Hodgman Clipping ──────────────────────────────────────────────
export const sutherlandHodgmanModule: VisualizationModule<number[][]> = {
  id: "sutherland-hodgman", slug: "sutherland-hodgman", title: "Sutherland-Hodgman Clipping",
  category: ["graphics"], difficulty: "advanced",
  timeComplexity: "O(n·c)", spaceComplexity: "O(n)",
  description: "Clip a polygon against each viewport edge in turn (handles concave polygons).",
  relatedTopics: [],
  pythonCode: `def sutherland_hodgman(polygon, clip_rect):
    output = list(polygon)
    xmin,xmax,ymin,ymax = clip_rect
    for edge in ['left','right','bottom','top']:
        if not output: break
        input_list = output
        output = []
        for i in range(len(input_list)):
            curr = input_list[i]
            prev = input_list[i-1]
            if inside(curr, edge, clip_rect):
                if not inside(prev, edge, clip_rect):
                    output.append(intersect(prev, curr, edge, clip_rect))
                output.append(curr)
            elif inside(prev, edge, clip_rect):
                output.append(intersect(prev, curr, edge, clip_rect))
    return output`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: [[1,1],[4,0],[5,3],[3,5],[0,4]],
  generateSteps(poly) {
    const steps: AnimationStep[] = [];
    const cells = poly.map(p=>({val:`(${p[0]},${p[1]})`,state:"active" as string}));
    steps.push(arr(1,`Clip ${poly.length}-gon against rectangle [0..4]x[0..4]`,[1,2],cells,"Input polygon",{vertices:poly.length}));
    steps.push(arr(2,"Clip against LEFT edge (x=0): all inside",[3,4,5,6],cells.map(c=>({...c,state:"computed" as string})),"After LEFT clip",{removed:0}));
    steps.push(arr(3,"Clip against RIGHT edge (x=4): clip vertex (5,3)",[3,7,8,9,10],cells.map((c,i)=>({...c,state:i===2?"highlighted":"computed" as string})),"After RIGHT clip",{clipped:1}));
    steps.push(arr(4,"Clip against BOTTOM (y=0): clip vertex (4,0)",[3,7],cells.map((c,i)=>({...c,state:i===1?"highlighted":"computed" as string})),"After BOTTOM clip",{clipped:1}));
    steps.push(arr(5,"Clip against TOP (y=4): final polygon",[3,7],cells.map(c=>({...c,state:"highlighted" as string})).slice(0,4),"Clipped polygon",{vertices:4}));
    return steps;
  }
};

export const graphicsModules = [
  bresenhamLineModule, bresenhamCircleModule, scanlineFillModule, floodFillModule,
  raySphereModule, rayTriangleModule, shadowRaysModule,
  twoDRotationModule, threeDRotationModule, affineTransformationsModule,
  homogeneousCoordsModule, cohenSutherlandModule, sutherlandHodgmanModule,
];
