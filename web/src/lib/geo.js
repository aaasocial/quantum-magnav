// Map geometry: local metres -> CSS pixels for the canvas heatmap and the SVG overlay.
// map_preview extents are cell CENTRES; the drawn area spans the cell EDGES.

export function mapGeometry(preview, cssW, maxH = 520) {
  const { nx, ny, x_min: xMin, x_max: xMax, y_min: yMin, y_max: yMax } = preview;
  const dx = (xMax - xMin) / (nx - 1);
  const dy = (yMax - yMin) / (ny - 1);
  const X0 = xMin - dx / 2;
  const Y1 = yMax + dy / 2;
  const spanX = nx * dx;
  const spanY = ny * dy;
  const aspect = spanY / spanX; // H / W (local metres are isotropic)
  let W = Math.max(1, cssW);
  let H = W * aspect;
  if (H > maxH) {
    H = maxH;
    W = H / aspect;
  }
  const toPx = (x, y) => [((x - X0) / spanX) * W, ((Y1 - y) / spanY) * H];
  return { W, H, dx, dy, aspect, toPx };
}
