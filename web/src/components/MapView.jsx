// Map panel (UI-02): canvas heatmap drawn once per (line, size, DPR) plus an SVG overlay
// whose tracks and markers follow the playback index. The canvas is never redrawn per frame.
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { buildCividisLut, colorbarTicks, percentileDomain } from '../lib/colormap.js';
import { mapGeometry } from '../lib/geo.js';
import { drErrorAt, errorAt } from '../lib/artifact.js';
import { fmtInt } from '../lib/format.js';
import { usePlaybackIndex } from '../hooks/usePlayback.js';
import {
  CASING, DR, INVALID_BASE, INVALID_STRIPE, JAM_COLOR, SERIES, TEXT_COLOR, TRUTH,
} from '../theme.js';

const MAX_H = 520;
const BAR_W = 160;
const BAR_H = 12;
const SWATCH = 12;
const ROTORS = [[-7, -7], [7, -7], [-7, 7], [7, 7]];

let lutCache = null;
const getLut = () => {
  if (!lutCache) lutCache = buildCividisLut();
  return lutCache;
};

function hexRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

// 4x4 tile with one 45-degree stripe: a 1 px line every 4 px when repeated.
function hatchPattern(ctx) {
  const tile = document.createElement('canvas');
  tile.width = 4;
  tile.height = 4;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(4, 4);
  const [r, g, b] = hexRgb(INVALID_STRIPE);
  for (let k = 0; k < 4; k++) {
    const o = ((3 - k) * 4 + k) * 4;
    img.data[o] = r;
    img.data[o + 1] = g;
    img.data[o + 2] = b;
    img.data[o + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  return ctx.createPattern(tile, 'repeat');
}

function sizeCanvas(canvas, w, h, dpr) {
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawHeatmap(canvas, preview, [d0, d1], W, H, dpr) {
  const { nx, ny, nT, valid } = preview;
  const lut = getLut();
  const base = hexRgb(INVALID_BASE);
  const off = document.createElement('canvas'); // 1 px per cell
  off.width = nx;
  off.height = ny;
  const octx = off.getContext('2d');
  const img = octx.createImageData(nx, ny);
  const span = d1 - d0;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const src = j * nx + i;
      const dst = ((ny - 1 - j) * nx + i) * 4; // row 0 is SOUTH; canvas row 0 is the top
      if (!valid[src]) {
        img.data[dst] = base[0];
        img.data[dst + 1] = base[1];
        img.data[dst + 2] = base[2];
      } else {
        const k = Math.max(0, Math.min(255, Math.round(((nT[src] - d0) / span) * 255)));
        img.data[dst] = lut[3 * k];
        img.data[dst + 1] = lut[3 * k + 1];
        img.data[dst + 2] = lut[3 * k + 2];
      }
      img.data[dst + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  const ctx = sizeCanvas(canvas, W, H, dpr);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(off, 0, 0, W, H);

  // Hatch the invalid cells: one path of horizontal runs, filled with the stripe pattern.
  const cw = W / nx;
  const ch = H / ny;
  const path = new Path2D();
  let any = false;
  for (let j = 0; j < ny; j++) {
    const row = ny - 1 - j;
    let i = 0;
    while (i < nx) {
      if (valid[j * nx + i]) { i += 1; continue; }
      const i0 = i;
      while (i < nx && !valid[j * nx + i]) i += 1;
      path.rect(i0 * cw, row * ch, (i - i0) * cw, ch);
      any = true;
    }
  }
  if (any) {
    ctx.fillStyle = hatchPattern(ctx);
    ctx.fill(path);
  }
}

function drawColorbar(canvas, dpr) {
  const lut = getLut();
  const off = document.createElement('canvas');
  off.width = 256;
  off.height = 1;
  const octx = off.getContext('2d');
  const img = octx.createImageData(256, 1);
  for (let k = 0; k < 256; k++) {
    img.data[4 * k] = lut[3 * k];
    img.data[4 * k + 1] = lut[3 * k + 1];
    img.data[4 * k + 2] = lut[3 * k + 2];
    img.data[4 * k + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  const ctx = sizeCanvas(canvas, BAR_W, BAR_H, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, 0, 0, BAR_W, BAR_H);
}

function drawSwatch(canvas, dpr) {
  const ctx = sizeCanvas(canvas, SWATCH, SWATCH, dpr);
  ctx.fillStyle = INVALID_BASE;
  ctx.fillRect(0, 0, SWATCH, SWATCH);
  ctx.fillStyle = hatchPattern(ctx);
  ctx.fillRect(0, 0, SWATCH, SWATCH);
}

// Width of the stage and the device pixel ratio; both trigger a canvas redraw.
function useStageSize(ref) {
  const [size, setSize] = useState({ width: 0, dpr: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const width = Math.floor(el.getBoundingClientRect().width);
      const dpr = window.devicePixelRatio || 1;
      setSize((s) => (s.width === width && s.dpr === dpr ? s : { width, dpr }));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let mq = null;
    const onDpr = () => {
      measure();
      watchDpr();
    };
    function watchDpr() {
      if (mq) mq.removeEventListener('change', onDpr);
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      mq.addEventListener('change', onDpr);
    }
    watchDpr();
    measure();
    return () => {
      ro.disconnect();
      if (mq) mq.removeEventListener('change', onDpr);
    };
  }, [ref]);
  return size;
}

function Track({ points, color, dash, width = 2, round = false }) {
  if (!points) return null;
  const cap = round ? 'round' : 'butt';
  return (
    <>
      <polyline points={points} fill="none" stroke={CASING} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash || undefined}
        strokeLinejoin="round"
        strokeLinecap={cap}
      />
    </>
  );
}

function Drone({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-7 -7L7 7M7 -7L-7 7" stroke={CASING} strokeWidth={4.5} strokeLinecap="round" />
      <path d="M-7 -7L7 7M7 -7L-7 7" stroke={TRUTH.color} strokeWidth={2} strokeLinecap="round" />
      {ROTORS.map(([cx, cy]) => (
        <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={4.5} fill={TRUTH.color} stroke={CASING} strokeWidth={1.5} />
      ))}
      <rect x={-3.5} y={-3.5} width={7} height={7} rx={1.5} fill={TRUTH.color} stroke={CASING} strokeWidth={1.5} />
    </g>
  );
}

function JamMarker({ x, y, W }) {
  const flip = x > W - 110;
  const x2 = 'M-4 -4L4 4M4 -4L-4 4';
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={7} fill="none" stroke={CASING} strokeWidth={4} />
      <path d={x2} stroke={CASING} strokeWidth={4} strokeLinecap="round" />
      <circle r={7} fill="none" stroke={JAM_COLOR} strokeWidth={2} />
      <path d={x2} stroke={JAM_COLOR} strokeWidth={2} strokeLinecap="round" />
      <text
        x={flip ? -12 : 12}
        y={5}
        textAnchor={flip ? 'end' : 'start'}
        fontSize={14}
        fill={TEXT_COLOR}
        stroke={CASING}
        strokeWidth={3}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        GPS jammed
      </text>
    </g>
  );
}

// The only per-frame part of the map: re-renders on index changes, reads precomputed strings.
const Overlay = memo(function Overlay({ W, H, px, jamIdx, metricStartIdx, trackColor }) {
  const idx = usePlaybackIndex();
  const i = Math.min(idx, px.truth.xy.length - 1);
  const after = i >= jamIdx;
  const sliceStr = (s, from) => s.slice(from, i + 1).join(' ');
  const [tx, ty] = px.truth.xy[i];
  const est = px.est ? px.est.xy[i] : null;
  const dr = px.dr.xy[i];
  const jam = px.truth.xy[jamIdx];
  return (
    <svg className="map-overlay" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" focusable="false">
      <Track points={sliceStr(px.truth.str, 0)} color={TRUTH.color} dash="" />
      {after && <Track points={sliceStr(px.dr.str, jamIdx)} color={DR.color} dash={DR.mapDash} width={2.5} round />}
      {after && px.est && <Track points={sliceStr(px.est.str, jamIdx)} color={trackColor} dash="8 5" />}
      {after && <JamMarker x={jam[0]} y={jam[1]} W={W} />}
      {i >= metricStartIdx && est && (
        <line x1={tx} y1={ty} x2={est[0]} y2={est[1]} stroke={TEXT_COLOR} strokeOpacity={0.6} strokeWidth={1} />
      )}
      {after && (
        <rect x={dr[0] - 6} y={dr[1] - 6} width={12} height={12} fill={DR.color} stroke={CASING} strokeWidth={1.5} />
      )}
      {after && est && (
        <polygon
          points={`${est[0]},${est[1] - 6} ${est[0] + 6},${est[1]} ${est[0]},${est[1] + 6} ${est[0] - 6},${est[1]}`}
          fill={trackColor}
          stroke={CASING}
          strokeWidth={1.5}
        />
      )}
      <Drone x={tx} y={ty} />
    </svg>
  );
});

const ErrorReadout = memo(function ErrorReadout({ view, mapTrack, trackLabel }) {
  const idx = usePlaybackIndex();
  let body;
  if (idx < view.jamIdx) {
    body = <p className="readout-state">GPS available</p>;
  } else if (idx < view.metricStartIdx) {
    body = <p className="readout-state">Collecting first map-matching window…</p>;
  } else {
    const err = errorAt(view, mapTrack, idx);
    body = (
      <>
        <p className="readout-value">{err === null ? 'n/a' : `${fmtInt(err)} m`}</p>
        <p className="readout-dr">Dead reckoning: {fmtInt(drErrorAt(view, idx))} m</p>
      </>
    );
  }
  return (
    <div className="error-readout">
      <p className="readout-label">Position error ({trackLabel})</p>
      {body}
    </div>
  );
});

// The end labels hug the bar ends; drop the middle (0) label if it would overlap them.
const CHAR_PX = 8;
function tickFits(ticks, n, [d0, d1]) {
  if (n === 0 || n === ticks.length - 1) return true;
  const at = (v) => ((v - d0) / (d1 - d0)) * BAR_W;
  const half = (ticks[n].label.length * CHAR_PX) / 2 + 4;
  const leftEnd = at(ticks[0].value) + ticks[0].label.length * CHAR_PX;
  const last = ticks[ticks.length - 1];
  const rightStart = at(last.value) - last.label.length * CHAR_PX;
  const x = at(ticks[n].value);
  return x - half >= leftEnd && x + half <= rightStart;
}

function pixelSeries(xs, ys, toPx) {
  const xy = new Array(xs.length);
  const str = new Array(xs.length);
  for (let k = 0; k < xs.length; k++) {
    const p = toPx(xs[k], ys[k]);
    xy[k] = p;
    str[k] = `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  }
  return { xy, str };
}

function MapBody({ view, mapTrack, trackLabel }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const barRef = useRef(null);
  const swatchRef = useRef(null);
  const { width, dpr } = useStageSize(stageRef);
  const preview = view.preview;
  const domain = useMemo(() => percentileDomain(preview.nT, preview.valid), [preview]);
  const ticks = useMemo(() => colorbarTicks(domain), [domain]);
  const geom = useMemo(() => (width > 0 ? mapGeometry(preview, width, MAX_H) : null), [preview, width]);

  const px = useMemo(() => {
    if (!geom) return null;
    const est = view.est[mapTrack];
    return {
      truth: pixelSeries(view.truth.x, view.truth.y, geom.toPx),
      dr: pixelSeries(view.dr.x, view.dr.y, geom.toPx),
      est: est ? pixelSeries(est.x, est.y, geom.toPx) : null,
    };
  }, [view, mapTrack, geom]);

  useEffect(() => {
    if (geom && canvasRef.current) drawHeatmap(canvasRef.current, preview, domain, geom.W, geom.H, dpr);
  }, [preview, domain, geom, dpr]);

  useEffect(() => {
    if (barRef.current) drawColorbar(barRef.current, dpr);
    if (swatchRef.current) drawSwatch(swatchRef.current, dpr);
  }, [dpr]);

  const trackColor = SERIES[mapTrack]?.color ?? TRUTH.color;
  const [d0, d1] = domain;

  return (
    <>
      <div className="map-stage" ref={stageRef} style={geom ? { height: `${geom.H}px` } : undefined}>
        {geom && px && (
          <div className="map-plot" style={{ width: `${geom.W}px`, height: `${geom.H}px` }}>
            <canvas ref={canvasRef} aria-hidden="true" />
            <Overlay
              W={geom.W}
              H={geom.H}
              px={px}
              jamIdx={view.jamIdx}
              metricStartIdx={view.metricStartIdx}
              trackColor={trackColor}
            />
          </div>
        )}
        <ErrorReadout view={view} mapTrack={mapTrack} trackLabel={trackLabel} />
      </div>
      <div className="map-legend">
        <div className="colorbar">
          <span>Magnetic anomaly (nT)</span>
          <canvas ref={barRef} className="colorbar-canvas" aria-hidden="true" />
          <div className="colorbar-ticks">
            {ticks.map((k, n) => (
              <span
                key={k.value}
                style={{
                  left: `${((k.value - d0) / (d1 - d0)) * 100}%`,
                  transform: n === 0 ? 'none' : n === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                {tickFits(ticks, n, domain) ? k.label : ''}
              </span>
            ))}
          </div>
        </div>
        <div className="legend-item">
          <canvas ref={swatchRef} className="legend-swatch" aria-hidden="true" />
          <span>No survey data</span>
        </div>
      </div>
    </>
  );
}

export default function MapView({ view, mapTrack, sensorLabel }) {
  const h2Id = useId();
  const trackLabel = SERIES[mapTrack]?.label ?? mapTrack;
  return (
    <figure className="map-figure" role="group" aria-labelledby={h2Id} tabIndex={0}>
      <h2 id={h2Id}>Map</h2>
      {view ? (
        <MapBody view={view} mapTrack={mapTrack} trackLabel={trackLabel} />
      ) : (
        <div className="map-loading">Loading precomputed flight…</div>
      )}
      {view && (
        <figcaption>
          Line {view.id} over the {view.mapName} anomaly map
          {sensorLabel ? ` (${sensorLabel})` : ''}. Truth solid white, {trackLabel} dashed, dead reckoning
          dotted green.
        </figcaption>
      )}
    </figure>
  );
}
