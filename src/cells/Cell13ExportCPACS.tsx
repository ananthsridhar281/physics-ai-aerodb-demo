import React, { useState } from 'react'
import CodeBlock from '../components/CodeBlock'

const cpacsCode = `import luminary_sdk as lm

# Export CPACS (Common Parametric Aircraft Configuration Schema)
# for MDO / full aircraft design interchange
cpacs_export = model.export(
    format="cpacs",
    cpacs_version="3.4",
    aircraft_uid="RLV_DEMO_2026",
    aerodynamics={
        "polar_type": "incremental",
        "include_stability_derivatives": True,
        "reference_values": {
            "area": S_ref,
            "length": L_ref,
            "span": b_ref,
        },
    },
    performance={
        "mach_range": [0.3, 6.0],
        "alpha_range": [-4.0, 30.0],
        "altitude_range": [0, 60],
    },
    provenance={
        "source": "Luminary Cloud Physics AI AeroDB",
        "model_id": "model-geotransolver-aerodb-v1",
        "dataset_id": "ds-r7k4m2n8p1",
        "generated": "2026-04-08T12:00:00Z",
        "validation_status": "MAPE < 3% on all scalar outputs",
    },
    metadata={
        "organization": "Luminary Cloud",
        "program": "RLV Demo 2026",
        "discipline": "Aerodynamics",
    },
)
cpacs_export.validate()       # schema validation
cpacs_export.save("aerodb_rlv_cpacs.xml")`

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell13ExportCPACS({ cellState, onRunComplete }: Props) {
  const [progress, setProgress] = useState(-1)
  const [done, setDone] = useState(false)

  React.useEffect(() => {
    if (cellState === 'running') {
      const t = setTimeout(onRunComplete, 400)
      return () => clearTimeout(t)
    }
  }, [cellState, onRunComplete])

  const handleDownload = async () => {
    if (done || progress >= 0) return
    setProgress(0)
    for (let p = 0; p <= 100; p += 8) {
      await new Promise(r => setTimeout(r, 120))
      setProgress(p)
    }
    setProgress(100)
    setDone(true)
  }

  if (cellState === 'idle') return (
    <p className="text-sm text-slate-500">Export the AeroDB in CPACS XML format for MDO and full-aircraft design interchange.</p>
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Export in CPACS 3.4 format — Common Parametric Aircraft Configuration Schema used by DLR, Airbus,
        and major MDO frameworks (SUMO, TIGL, CPACS-Creator, OpenMDAO CPACS-Integration).
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <span className="inline-block text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: '#059669' }}>XML</span>
          <div>
            <div className="text-sm font-semibold text-slate-800">CPACS XML — Full Aircraft MDO</div>
            <div className="text-xs text-slate-400 mt-0.5">Size: 68 MB · CPACS v3.4 · Schema-validated</div>
          </div>
        </div>
        <CodeBlock code={cpacsCode} />
        {progress >= 0 && !done && (
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: '#059669' }} />
          </div>
        )}
        <button onClick={handleDownload} disabled={done || progress >= 0}
          className="w-full py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          style={done ? { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0' } : { backgroundColor: '#059669', color: 'white', borderColor: '#059669' }}
        >
          {done ? '✅ Downloaded' : progress >= 0 ? `Downloading… ${progress}%` : 'Download 68 MB'}
        </button>
      </div>
    </div>
  )
}
