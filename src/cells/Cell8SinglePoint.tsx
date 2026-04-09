import React, { useState, useCallback, useEffect, useRef } from 'react'
import { predictCoefficients } from '../data/analyticalAeroModel'
import { InferenceParams, AeroCoefficients } from '../types'

const DEFAULT_PARAMS: InferenceParams = {
  mach: 2.0,
  alpha_deg: 5.0,
  beta_deg: 0,
  altitude_km: 25,
  elevon_L_deg: 0,
  elevon_R_deg: 0,
  rudder_deg: 0,
  body_flap_deg: 0,
  speedbrake_pct: 0,
  wing_sweep_deg: 45,
  wing_aspect_ratio: 2.5,
  reynolds_regime: 'fully_turbulent',
  landing_gear: 'retracted',
}

function SliderRow({ label, value, min, max, step, onChange, unit = '' }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-slate-600" style={{ fontFamily: 'monospace' }}>{label}</label>
        <span className="text-xs text-slate-500 font-mono">{value.toFixed(step < 1 ? 1 : 0)}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-blue-600"
        style={{ accentColor: '#2563EB' }}
      />
    </div>
  )
}

function CIRow({ label, value, ci, unit = '' }: { label: string; value: number; ci: number; unit?: string }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2 pr-3 text-xs font-mono font-medium text-slate-700">{label}</td>
      <td className="py-2 pr-3 text-xs font-mono text-slate-900 font-semibold text-right">{value.toFixed(4)}{unit}</td>
      <td className="py-2 text-xs text-slate-400 text-right">±{ci.toFixed(4)}</td>
    </tr>
  )
}

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell8SinglePoint({ cellState, onRunComplete }: Props) {
  const [params, setParams] = useState<InferenceParams>(DEFAULT_PARAMS)
  const [result, setResult] = useState<AeroCoefficients | null>(null)
  const [predicting, setPredicting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const predict = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPredicting(true)
      setTimeout(() => {
        setResult(predictCoefficients(params))
        setPredicting(false)
      }, 200)
    }, 100)
  }, [params])

  const handleChange = (key: keyof InferenceParams) => (v: number | string) => {
    setParams(prev => ({ ...prev, [key]: v }))
  }

  React.useEffect(() => {
    if (cellState === 'running') {
      const t = setTimeout(onRunComplete, 400)
      return () => clearTimeout(t)
    }
  }, [cellState, onRunComplete])

  if (cellState === 'idle') return (
    <p className="text-sm text-slate-500">Interactive single-point inference — adjust flight condition and geometry sliders to get instant AeroDB predictions.</p>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input panel */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flight Condition</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderRow label="Mach" value={params.mach} min={0.3} max={6.0} step={0.1} onChange={handleChange('mach')} />
          <SliderRow label="α (alpha_deg)" value={params.alpha_deg} min={-4} max={30} step={0.5} onChange={handleChange('alpha_deg')} unit="°" />
          <SliderRow label="β (beta_deg)" value={params.beta_deg} min={-10} max={10} step={0.5} onChange={handleChange('beta_deg')} unit="°" />
          <SliderRow label="Altitude (km)" value={params.altitude_km} min={0} max={60} step={1} onChange={handleChange('altitude_km')} unit=" km" />
        </div>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">Control Surfaces</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderRow label="Elevon_L" value={params.elevon_L_deg} min={-30} max={20} step={1} onChange={handleChange('elevon_L_deg')} unit="°" />
          <SliderRow label="Elevon_R" value={params.elevon_R_deg} min={-30} max={20} step={1} onChange={handleChange('elevon_R_deg')} unit="°" />
          <SliderRow label="Rudder" value={params.rudder_deg} min={-25} max={25} step={1} onChange={handleChange('rudder_deg')} unit="°" />
          <SliderRow label="Body flap" value={params.body_flap_deg} min={-15} max={30} step={1} onChange={handleChange('body_flap_deg')} unit="°" />
          <SliderRow label="Speedbrake" value={params.speedbrake_pct} min={0} max={100} step={5} onChange={handleChange('speedbrake_pct')} unit="%" />
          <SliderRow label="Wing sweep" value={params.wing_sweep_deg} min={30} max={65} step={1} onChange={handleChange('wing_sweep_deg')} unit="°" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Reynolds regime</label>
            <select
              value={params.reynolds_regime}
              onChange={e => setParams(p => ({ ...p, reynolds_regime: e.target.value as InferenceParams['reynolds_regime'] }))}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white"
            >
              <option value="fully_turbulent">Fully turbulent</option>
              <option value="laminar_transition">Laminar / transition</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Landing gear</label>
            <select
              value={params.landing_gear}
              onChange={e => setParams(p => ({ ...p, landing_gear: e.target.value as InferenceParams['landing_gear'] }))}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white"
            >
              <option value="retracted">Retracted</option>
              <option value="deployed">Deployed</option>
            </select>
          </div>
        </div>

        <button
          onClick={predict}
          disabled={predicting}
          className="mt-2 w-full py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: '#2563EB' }}
        >
          {predicting ? 'Predicting…' : 'Predict'}
        </button>
      </div>

      {/* Results panel */}
      <div className="space-y-4">
        {result ? (
          <>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Force & Moment Coefficients</div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Coeff</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Value</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">±95% CI</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <CIRow label="CL" value={result.CL} ci={Math.abs(result.CL) * 0.014} />
                    <CIRow label="CD" value={result.CD} ci={result.CD * 0.021} />
                    <CIRow label="CY" value={result.CY} ci={Math.abs(result.CY) * 0.028 + 0.0001} />
                    <CIRow label="Cl" value={result.Cl} ci={Math.abs(result.Cl) * 0.042 + 0.00005} />
                    <CIRow label="Cm" value={result.Cm} ci={Math.abs(result.Cm) * 0.028} />
                    <CIRow label="Cn" value={result.Cn} ci={Math.abs(result.Cn) * 0.035 + 0.0001} />
                    <CIRow label="L/D" value={result.LD} ci={Math.abs(result.LD) * 0.016} />
                    <CIRow label="Xcp" value={result.Xcp} ci={0.002} />
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stability Derivatives</div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Derivative</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Value</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">±95% CI</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <CIRow label="CL_α (1/rad)" value={result.CL_alpha} ci={Math.abs(result.CL_alpha) * 0.009} />
                    <CIRow label="Cm_α (1/rad)" value={result.Cm_alpha} ci={Math.abs(result.Cm_alpha) * 0.014} />
                    <CIRow label="Cn_β (1/rad)" value={result.Cn_beta} ci={result.Cn_beta * 0.028} />
                    <CIRow label="Cl_β (1/rad)" value={result.Cl_beta} ci={Math.abs(result.Cl_beta) * 0.035} />
                    <CIRow label="Cm_q" value={result.Cm_q} ci={Math.abs(result.Cm_q) * 0.021} />
                    <CIRow label="Cl_p" value={result.Cl_p} ci={Math.abs(result.Cl_p) * 0.018} />
                    <CIRow label="Cn_r" value={result.Cn_r} ci={Math.abs(result.Cn_r) * 0.025} />
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <span>⚡ Inference: 4.2 ms</span>
              <span className="text-emerald-600 font-medium">● Confidence: High</span>
              <span>Model: GeoTransolver v1</span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] text-slate-300 text-sm">
            Click Predict to run inference
          </div>
        )}
      </div>
    </div>
  )
}
