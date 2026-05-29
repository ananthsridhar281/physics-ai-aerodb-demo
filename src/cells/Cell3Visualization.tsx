import React, { useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer,
} from 'recharts'
import { generateLHSCases, seededRandom } from '../data/generateLHS'

const SCATTER_COLOR = '#2563EB'

function normalSample(rng: () => number, mu: number, sigma: number) {
  const u1 = Math.max(rng(), 1e-10)
  const u2 = rng()
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function buildHistogram(values: number[], bins: number): { x: string; count: number }[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const w = (max - min) / bins
  const counts = Array(bins).fill(0)
  values.forEach(v => {
    const i = Math.min(Math.floor((v - min) / w), bins - 1)
    counts[i]++
  })
  return counts.map((c, i) => ({
    x: (min + (i + 0.5) * w).toFixed(2),
    count: c,
  }))
}

const HEATMAP_DATA = {
  rows: ['CL', 'CD', 'CY', 'Cl', 'Cm', 'Cn'],
  cols: ['Mach', 'alpha', 'beta', 'elevon_L', 'rudder', 'body_flap', 'sweep', 'altitude', 'nose_r', 'spdbrk'],
  values: [
    [-0.15, 0.92, 0.02, 0.45, 0.03, 0.18, -0.12, -0.08, 0.04, -0.22],
    [ 0.65, 0.78, 0.05, 0.12, 0.02,  0.08,  0.18,  0.22, 0.15,  0.48],
    [ 0.05, 0.03, 0.88, 0.02, 0.72,  0.01,  0.04,  0.01, 0.02,  0.02],
    [ 0.08, 0.12, 0.45, 0.62, 0.35,  0.05, -0.22,  0.02, 0.01,  0.05],
    [ 0.22,-0.88, 0.03,-0.67, 0.04, -0.55,  0.15,  0.05, 0.08, -0.12],
    [ 0.06, 0.04, 0.82, 0.03, 0.68,  0.02,  0.05,  0.01, 0.01,  0.03],
  ],
}

function heatColor(v: number): string {
  const abs = Math.abs(v)
  const r = v > 0
    ? Math.round(220 - 170 * (1 - abs))
    : Math.round(37 + 150 * abs)
  const g = v > 0
    ? Math.round(252 - 200 * abs)
    : Math.round(99 + 50 * (1 - abs))
  const b = v > 0
    ? Math.round(248 - 220 * abs)
    : Math.round(235 - 120 * abs)
  return `rgb(${r},${g},${b})`
}

export default function Cell3Visualization({ cellState, onRunComplete }: { cellState: 'idle' | 'running' | 'complete'; onRunComplete: () => void }) {
  React.useEffect(() => {
    if (cellState !== 'running') return
    const t = setTimeout(onRunComplete, 700)
    return () => clearTimeout(t)
  }, [cellState, onRunComplete])
  const cases = useMemo(() => generateLHSCases(800), [])
  const sample200 = useMemo(() => cases.slice(0, 200), [cases])

  const rng = useMemo(() => seededRandom(7), [])
  const clSamples = useMemo(() => Array.from({ length: 800 }, () => normalSample(rng, 0.45, 0.38)), [])
  const cdSamples = useMemo(() => Array.from({ length: 800 }, () => Math.abs(normalSample(rng, 0.12, 0.09))), [])
  const cmSamples = useMemo(() => Array.from({ length: 800 }, () => normalSample(rng, -0.02, 0.15)), [])

  const clHist = useMemo(() => buildHistogram(clSamples, 20), [clSamples])
  const cdHist = useMemo(() => buildHistogram(cdSamples, 20), [cdSamples])
  const cmHist = useMemo(() => buildHistogram(cmSamples, 20), [cmSamples])

  const scatterPoints = useMemo(() => sample200.map(c => ({
    mach: c.mach,
    alpha: c.alpha_deg,
    elevon: c.elevon_L_deg,
    alt: c.altitude_km,
  })), [sample200])

  if (cellState === 'idle') return null

  return (
    <div className="space-y-6">
      {/* Chart 1: Scatter matrix */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Parameter Scatter — Mach vs α vs Elevon_L vs Altitude
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1 text-center">Mach vs α (deg)</div>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mach" name="Mach" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Mach', position: 'insideBottom', offset: -3, fontSize: 10, fill: '#94A3B8' }} />
                <YAxis dataKey="alpha" name="α" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E2E8F0' }} />
                <Scatter data={scatterPoints} fill={SCATTER_COLOR} fillOpacity={0.55} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1 text-center">Mach vs Elevon_L</div>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mach" name="Mach" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Mach', position: 'insideBottom', offset: -3, fontSize: 10, fill: '#94A3B8' }} />
                <YAxis dataKey="elevon" name="Elevon_L" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E2E8F0' }} />
                <Scatter data={scatterPoints} fill={SCATTER_COLOR} fillOpacity={0.55} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1 text-center">α vs Altitude (km)</div>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="alpha" name="α" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'α (deg)', position: 'insideBottom', offset: -3, fontSize: 10, fill: '#94A3B8' }} />
                <YAxis dataKey="alt" name="Alt" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E2E8F0' }} />
                <Scatter data={scatterPoints} fill={SCATTER_COLOR} fillOpacity={0.55} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 2: Output histograms */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Output Distributions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'CL', data: clHist, color: '#2563EB' },
            { label: 'CD', data: cdHist, color: '#059669' },
            { label: 'Cm', data: cmHist, color: '#7C3AED' },
          ].map(({ label, data, color }) => (
            <div key={label}>
              <div className="text-xs text-slate-400 mb-1 text-center">{label} distribution</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="x" tick={{ fontSize: 9, fill: '#94A3B8' }} interval={4} />
                  <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <Bar dataKey="count" fill={color} fillOpacity={0.7} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 5: Sensitivity Heatmap */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Pearson Correlation Heatmap (r)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ width: 40, padding: '4px 6px', textAlign: 'left', color: '#94A3B8', fontWeight: 500 }}></th>
                {HEATMAP_DATA.cols.map(c => (
                  <th key={c} style={{ padding: '4px 6px', color: '#64748B', fontWeight: 500, fontSize: 10, whiteSpace: 'nowrap' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEATMAP_DATA.rows.map((row, ri) => (
                <tr key={row}>
                  <td style={{ padding: '4px 6px', fontWeight: 600, color: '#1E293B', fontFamily: 'monospace' }}>{row}</td>
                  {HEATMAP_DATA.values[ri].map((v, ci) => (
                    <td key={ci} style={{
                      padding: '4px 6px',
                      backgroundColor: heatColor(v),
                      textAlign: 'center',
                      borderRadius: 4,
                      border: '2px solid white',
                      fontFamily: 'monospace',
                      fontWeight: 500,
                      color: Math.abs(v) > 0.5 ? 'white' : '#334155',
                      minWidth: 48,
                    }}>
                      {v.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgb(37,99,235)' }} />
            <span>Strong negative</span>
          </div>
          <div className="w-8 h-3 rounded" style={{ background: 'linear-gradient(90deg, rgb(37,99,235), #F8FAFC, rgb(220,38,38))' }} />
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgb(220,38,38)' }} />
            <span>Strong positive</span>
          </div>
        </div>
      </div>
    </div>
  )
}
