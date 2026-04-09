import React, { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { predictCoefficients } from '../data/analyticalAeroModel'

const MACH_VALS = [0.6, 0.9, 1.2, 2.0, 4.0]
const MACH_COLORS = ['#0891B2', '#D97706', '#EA580C', '#7C3AED', '#DC2626']
const MACH_LABELS = ['M=0.6 (subsonic)', 'M=0.9 (transonic)', 'M=1.2 (supersonic)', 'M=2.0 (supersonic)', 'M=4.0 (hypersonic)']

const ALPHA_RANGE = Array.from({ length: 35 }, (_, i) => -4 + i)

function buildSweepData(alphaRange: number[], machVals: number[]) {
  return alphaRange.map(alpha => {
    const row: Record<string, number> = { alpha }
    machVals.forEach(m => {
      const c = predictCoefficients({
        mach: m, alpha_deg: alpha, beta_deg: 0, altitude_km: 25,
        elevon_L_deg: 0, elevon_R_deg: 0, rudder_deg: 0, body_flap_deg: 0,
        speedbrake_pct: 0, wing_sweep_deg: 45, wing_aspect_ratio: 2.5,
        reynolds_regime: 'fully_turbulent', landing_gear: 'retracted',
      })
      row[`CL_${m}`] = c.CL
      row[`CD_${m}`] = c.CD
      row[`Cm_${m}`] = c.Cm
    })
    return row
  })
}

// Drag polar: CL vs CD for each Mach
function buildPolarData(alphaRange: number[], machVals: number[]) {
  return machVals.map((m, mi) => ({
    mach: m,
    color: MACH_COLORS[mi],
    label: MACH_LABELS[mi],
    data: alphaRange.map(alpha => {
      const c = predictCoefficients({
        mach: m, alpha_deg: alpha, beta_deg: 0, altitude_km: 25,
        elevon_L_deg: 0, elevon_R_deg: 0, rudder_deg: 0, body_flap_deg: 0,
        speedbrake_pct: 0, wing_sweep_deg: 45, wing_aspect_ratio: 2.5,
        reynolds_regime: 'fully_turbulent', landing_gear: 'retracted',
      })
      return { CD: c.CD, CL: c.CL, alpha }
    }),
  }))
}

// L/D vs Mach at alpha=5
function buildLDvsMach() {
  const machs = Array.from({ length: 40 }, (_, i) => 0.3 + i * 0.15)
  return machs.map(m => {
    const c = predictCoefficients({
      mach: m, alpha_deg: 5, beta_deg: 0, altitude_km: 25,
      elevon_L_deg: 0, elevon_R_deg: 0, rudder_deg: 0, body_flap_deg: 0,
      speedbrake_pct: 0, wing_sweep_deg: 45, wing_aspect_ratio: 2.5,
      reynolds_regime: 'fully_turbulent', landing_gear: 'retracted',
    })
    return { mach: Math.round(m * 10) / 10, LD: c.LD }
  })
}

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell9Sweep({ cellState, onRunComplete }: Props) {
  const sweepData = useMemo(() => buildSweepData(ALPHA_RANGE, MACH_VALS), [])
  const polarSeries = useMemo(() => buildPolarData(ALPHA_RANGE, MACH_VALS), [])
  const ldData = useMemo(() => buildLDvsMach(), [])

  React.useEffect(() => {
    if (cellState === 'running') {
      const t = setTimeout(onRunComplete, 600)
      return () => clearTimeout(t)
    }
  }, [cellState, onRunComplete])

  if (cellState === 'idle') return (
    <p className="text-sm text-slate-500">Sweep α from −4° to +30° across Mach regimes to visualize CL, CD polar, Cm stability, and L/D efficiency.</p>
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Parameter sweep: α from −4° to +30° across Mach = [0.6, 0.9, 1.2, 2.0, 4.0].
        Hold conditions: β=0°, alt=25 km, elevons=0°, body flap=0°.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A: CL vs alpha */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 mb-3">A — CL vs α</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sweepData} margin={{ top: 5, right: 10, bottom: 15, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="alpha" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'α (deg)', position: 'insideBottom', offset: -8, fontSize: 10, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'CL', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ fontSize: 10, border: '1px solid #E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {MACH_VALS.map((m, i) => (
                <Line key={m} dataKey={`CL_${m}`} name={`M=${m}`} stroke={MACH_COLORS[i]} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* B: Drag polar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 mb-3">B — Drag Polar (CL vs CD)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart margin={{ top: 5, right: 10, bottom: 15, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="CD" type="number" domain={[0, 'auto']} tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'CD', position: 'insideBottom', offset: -8, fontSize: 10, fill: '#94A3B8' }} />
              <YAxis dataKey="CL" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'CL', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {polarSeries.map(s => (
                <Line
                  key={s.mach} data={s.data} dataKey="CL" name={`M=${s.mach}`}
                  stroke={s.color} strokeWidth={1.5} dot={false} isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* C: Cm vs alpha */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 mb-3">C — Cm vs α (stability)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sweepData} margin={{ top: 5, right: 10, bottom: 15, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="alpha" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'α (deg)', position: 'insideBottom', offset: -8, fontSize: 10, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Cm', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ fontSize: 10, border: '1px solid #E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {MACH_VALS.map((m, i) => (
                <Line key={m} dataKey={`Cm_${m}`} name={`M=${m}`} stroke={MACH_COLORS[i]} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* D: L/D vs Mach */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 mb-3">D — L/D vs Mach (α = 5°)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ldData} margin={{ top: 5, right: 10, bottom: 15, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mach" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Mach', position: 'insideBottom', offset: -8, fontSize: 10, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'L/D', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ fontSize: 10, border: '1px solid #E2E8F0' }} />
              <Line dataKey="LD" name="L/D" stroke="#2563EB" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
