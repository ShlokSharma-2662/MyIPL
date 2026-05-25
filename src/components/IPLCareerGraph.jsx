import React, { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';

const METRICS = [
  { key: 'runs', label: 'Runs', colorClass: 'text-amber-400', stroke: '#f59e0b' },
  { key: 'wickets', label: 'Wickets', colorClass: 'text-fuchsia-400', stroke: '#d946ef' },
  { key: 'batAvg', label: 'Bat Avg', colorClass: 'text-emerald-400', stroke: '#34d399' },
];

function toNumber(value) {
  if (value === null || value === undefined || value === '-') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function IPLCareerGraph({ series = [] }) {
  const [metric, setMetric] = useState('runs');

  const metricMeta = METRICS.find((m) => m.key === metric) || METRICS[0];

  const graphData = useMemo(() => {
    if (!Array.isArray(series) || series.length === 0) {
      return { points: [], maxVal: 1, minVal: 0, latest: 0, previous: 0 };
    }

    const values = series.map((item) => toNumber(item?.[metric]));
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const latest = values[values.length - 1] || 0;
    const previous = values.length > 1 ? values[values.length - 2] : latest;

    return {
      points: series.map((item, index) => ({
        label: item.label || `S${index + 1}`,
        value: values[index],
      })),
      maxVal,
      minVal,
      latest,
      previous,
    };
  }, [metric, series]);

  const width = 1000;
  const height = 260;
  const padLeft = 42;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 42;

  const usableW = width - padLeft - padRight;
  const usableH = height - padTop - padBottom;
  const count = Math.max(graphData.points.length, 1);
  const valueRange = Math.max(graphData.maxVal - graphData.minVal, 1);

  const chartPoints = graphData.points.map((p, i) => {
    const x = padLeft + (count === 1 ? usableW / 2 : (usableW * i) / (count - 1));
    const normalized = (p.value - graphData.minVal) / valueRange;
    const y = padTop + usableH - normalized * usableH;
    return { ...p, x, y };
  });

  const path = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const delta = graphData.latest - graphData.previous;
  const deltaSign = delta > 0 ? '+' : '';

  if (series.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-zinc-800/50 text-zinc-500 text-sm">
        IPL career graph will appear after you complete at least one season.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-zinc-800/50 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-zinc-500 font-bold">IPL CAREER GRAPH</div>
          <h3 className="text-lg font-black text-zinc-100 flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${metricMeta.colorClass}`} />
            Season-by-season {metricMeta.label} trend
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/70 border border-zinc-800 rounded-lg p-1">
          {METRICS.map((m) => {
            const active = m.key === metric;
            return (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-3 py-1.5 text-[10px] tracking-wider font-bold rounded-md transition-colors ${
                  active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m.label.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/30 border border-zinc-800 rounded-lg px-3 py-2">
          <div className="text-[9px] text-zinc-500 tracking-wider">LATEST</div>
          <div className={`font-mono font-black text-xl ${metricMeta.colorClass}`}>{graphData.latest.toFixed(1).replace('.0', '')}</div>
        </div>
        <div className="bg-black/30 border border-zinc-800 rounded-lg px-3 py-2">
          <div className="text-[9px] text-zinc-500 tracking-wider">PREVIOUS</div>
          <div className="font-mono font-black text-xl text-zinc-200">{graphData.previous.toFixed(1).replace('.0', '')}</div>
        </div>
        <div className="bg-black/30 border border-zinc-800 rounded-lg px-3 py-2">
          <div className="text-[9px] text-zinc-500 tracking-wider">DELTA</div>
          <div className={`font-mono font-black text-xl ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {deltaSign}
            {delta.toFixed(1).replace('.0', '')}
          </div>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl bg-black/20 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={`IPL career ${metricMeta.label} graph`}>
          {[0, 1, 2, 3, 4].map((step) => {
            const y = padTop + (usableH * step) / 4;
            return (
              <line
                key={step}
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {chartPoints.length > 1 && (
            <path d={path} fill="none" stroke={metricMeta.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {chartPoints.map((p, idx) => (
            <g key={p.label}>
              <circle cx={p.x} cy={p.y} r="4.5" fill={metricMeta.stroke} />
              <text x={p.x} y={height - 16} textAnchor="middle" fill="#a1a1aa" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                {p.label}
              </text>
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#e4e4e7" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                {p.value.toFixed(1).replace('.0', '')}
              </text>
              {idx === chartPoints.length - 1 && (
                <text x={p.x + 8} y={p.y + 4} fill={metricMeta.stroke} fontSize="10" fontWeight="700">
                  CURRENT
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
