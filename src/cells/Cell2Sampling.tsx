import React, { useEffect, useRef, useState } from 'react'
import CodeBlock from '../components/CodeBlock'

const samplingCode = `# LHS Sampling Configuration
n_cases = 800
mach_regime_split = {
    "subsonic":    0.40,  # M = 0.3–0.8
    "transonic":   0.25,  # M = 0.8–1.4
    "supersonic":  0.20,  # M = 1.4–3.0
    "hypersonic":  0.15,  # M = 3.0–6.0
}
reynolds_split = {
    "fully_turbulent":    0.70,
    "laminar_transition": 0.30,
}
edge_biased_fraction    = 0.20  # high-alpha, max-deflection corners
gear_deployed_fraction  = 0.10  # subsonic-only cases
asymmetric_elevon_frac  = 0.35
ground_effect_cases     = 60    # h/b = 0.3–2.0, M < 0.4

import luminary_sdk as lm
doe = lm.PhysicsAI.DoE.latin_hypercube(
    n_samples=n_cases,
    parameters=param_space,
    seed=42,
    edge_biased_fraction=edge_biased_fraction,
    stratify_by=["mach_regime", "reynolds_regime"],
)`

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell2Sampling({ cellState, onRunComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    if (cellState !== 'running') return
    doneRef.current = false
    setProgress(0)

    let p = 0
    const tick = () => {
      if (doneRef.current) return
      p = Math.min(p + 5, 100)
      setProgress(p)
      if (p < 100) {
        setTimeout(tick, 100)
      } else {
        setTimeout(onRunComplete, 300)
      }
    }
    const t = setTimeout(tick, 100)
    return () => { doneRef.current = true; clearTimeout(t) }
  }, [cellState])

  const showOutput = cellState === 'running' || cellState === 'complete'
  const showStats = cellState === 'complete' || (cellState === 'running' && progress === 100)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Generate 800 stratified Latin Hypercube cases with regime-biased Mach splits and edge-biased corners.
      </p>
      <CodeBlock code={samplingCode} />

      {showOutput && (
        <div className="mt-3 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Generating LHS cases…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, backgroundColor: '#2563EB' }}
              />
            </div>
          </div>

          {showStats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([['Subsonic', '320', '#0891B2'], ['Transonic', '200', '#D97706'], ['Supersonic', '160', '#EA580C'], ['Hypersonic', '120', '#DC2626']] as const).map(([label, value, color]) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([['Turbulent', '560', '#2563EB'], ['Laminar/trans', '240', '#7C3AED'], ['Edge-biased', '160', '#059669'], ['Ground effect', '60', '#D97706']] as const).map(([label, value, color]) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
