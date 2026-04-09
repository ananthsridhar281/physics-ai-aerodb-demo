import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { solveTrim } from '../data/trimSolver'
import { TrimTarget, TrimResult } from '../types'

const DEFAULT_TARGET: TrimTarget = {
  CL_target: 0.50,
  Cm_target: 0.00,
  mach: 2.0,
  altitude_km: 25,
  beta_deg: 0,
  wing_sweep_deg: 45,
  wing_aspect_ratio: 2.5,
}

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell10TrimSolver({ cellState, onRunComplete }: Props) {
  const [target, setTarget] = useState<TrimTarget>(DEFAULT_TARGET)
  const [result, setResult] = useState<TrimResult | null>(null)
  const [solving, setSolving] = useState(false)

  React.useEffect(() => {
    if (cellState === 'running') {
      const t = setTimeout(onRunComplete, 400)
      return () => clearTimeout(t)
    }
  }, [cellState, onRunComplete])

  const handleSolve = async () => {
    setSolving(true)
    await new Promise(r => setTimeout(r, 350))
    setResult(solveTrim(target))
    setSolving(false)
  }

  if (cellState === 'idle') return (
    <p className="text-sm text-slate-500">Newton iteration trim solver — find (α, elevon_sym, body_flap) such that CL=target and Cm=0.</p>
  )

  const convData = result?.convergenceHistory.map((r, i) => ({
    iter: i + 1,
    residual: r,
  })) ?? []

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Newton iteration: find (α, elevon_sym) such that CL = CL_target and Cm = 0.
        Uses numerical Jacobian via finite differences on the analytical aero model.
      </p>

      {/* Input table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Trim Targets & Conditions</div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Parameter</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Value</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Free?</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  { label: 'Target CL', key: 'CL_target', free: false, step: 0.05 },
                  { label: 'Target Cm', key: 'Cm_target', free: false, step: 0.01 },
                  { label: 'Mach', key: 'mach', free: false, step: 0.1 },
                  { label: 'Altitude (km)', key: 'altitude_km', free: false, step: 1 },
                  { label: 'β (deg)', key: 'beta_deg', free: false, step: 0.5 },
                ].map(({ label, key, free, step }) => (
                  <tr key={key} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 px-3 text-xs font-mono text-slate-700">{label}</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        value={(target as unknown as Record<string, number>)[key]}
                        step={step}
                        onChange={e => setTarget(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                        className="w-20 text-right text-xs border border-slate-200 rounded px-2 py-0.5 font-mono"
                      />
                    </td>
                    <td className="py-2 px-3 text-right text-xs text-slate-400">{free ? '✓' : '—'}</td>
                  </tr>
                ))}
                <tr className="border-b border-slate-100"><td className="py-2 px-3 text-xs font-mono text-slate-700">α (deg)</td><td className="py-2 px-3 text-right text-xs text-slate-400 font-mono">—</td><td className="py-2 px-3 text-right text-xs text-blue-600 font-medium">✓ free</td></tr>
                <tr className="border-b border-slate-100"><td className="py-2 px-3 text-xs font-mono text-slate-700">elevon_sym (deg)</td><td className="py-2 px-3 text-right text-xs text-slate-400 font-mono">—</td><td className="py-2 px-3 text-right text-xs text-blue-600 font-medium">✓ free</td></tr>
                <tr><td className="py-2 px-3 text-xs font-mono text-slate-700">body_flap (deg)</td><td className="py-2 px-3 text-right"><input type="number" step={0.5} value={(target as TrimTarget & { bodyFlap_deg?: number }).bodyFlap_deg ?? 2.15} onChange={e => setTarget(prev => ({ ...prev, bodyFlap_deg: parseFloat(e.target.value) || 0 }))} className="w-20 text-right text-xs border border-slate-200 rounded px-2 py-0.5 font-mono" /></td><td className="py-2 px-3 text-right text-xs text-blue-600 font-medium">✓ free</td></tr>
              </tbody>
            </table>
          </div>
          <button
            onClick={handleSolve}
            disabled={solving}
            className="mt-3 w-full py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            style={{ backgroundColor: '#2563EB' }}
          >
            {solving ? 'Solving…' : 'Solve Trim'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trim Solution</div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Variable</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Initial</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Trimmed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-b border-slate-100"><td className="py-2 px-3 text-xs font-mono text-slate-700">α</td><td className="py-2 px-3 text-right text-xs font-mono text-slate-400">5.000°</td><td className="py-2 px-3 text-right text-xs font-mono font-semibold text-slate-900">{result.alpha_deg.toFixed(3)}°</td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 px-3 text-xs font-mono text-slate-700">Elevon sym</td><td className="py-2 px-3 text-right text-xs font-mono text-slate-400">0.000°</td><td className="py-2 px-3 text-right text-xs font-mono font-semibold text-slate-900">{result.elevon_sym_deg.toFixed(3)}°</td></tr>
                    <tr><td className="py-2 px-3 text-xs font-mono text-slate-700">Body flap</td><td className="py-2 px-3 text-right text-xs font-mono text-slate-400">0.000°</td><td className="py-2 px-3 text-right text-xs font-mono font-semibold text-slate-900">{result.body_flap_deg.toFixed(3)}°</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex gap-3 text-xs text-slate-500">
                <span className="bg-slate-50 border border-slate-200 px-2 py-1 rounded">{result.iterations} iterations</span>
                <span className="bg-slate-50 border border-slate-200 px-2 py-1 rounded font-mono">residual: {result.residual.toExponential(2)}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trimmed Coefficients</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['CL', result.trimCoefficients.CL.toFixed(4)],
                  ['CD', result.trimCoefficients.CD.toFixed(4)],
                  ['Cm', result.trimCoefficients.Cm.toFixed(4)],
                  ['L/D', result.trimCoefficients.LD.toFixed(2)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex justify-between items-center">
                    <span className="text-xs font-mono font-medium text-slate-600">{k}</span>
                    <span className="text-sm font-bold text-slate-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Newton Convergence (log scale)</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={convData} margin={{ top: 5, right: 10, bottom: 15, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="iter" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Iteration', position: 'insideBottom', offset: -8, fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis scale="log" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ fontSize: 10 }} formatter={(v: number) => [v.toExponential(3), 'Residual']} />
                  <Line dataKey="residual" name="‖r‖" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
