import React, { useEffect, useRef } from 'react'
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
  const doneRef = useRef(false)

  useEffect(() => {
    if (cellState !== 'running') return
    doneRef.current = false
    const t = setTimeout(onRunComplete, 400)
    return () => { doneRef.current = true; clearTimeout(t) }
  }, [cellState])

  const showOutput = cellState === 'complete'

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Generate 800 stratified Latin Hypercube cases with regime-biased Mach splits and edge-biased corners.
      </p>
      <CodeBlock code={samplingCode} />

      {showOutput && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          800 cases created.
        </div>
      )}
    </div>
  )
}
