import React, { useState } from 'react'
import CodeBlock from '../components/CodeBlock'

const codes = {
  hdf5: `import luminary_sdk as lm

# Export gridded HDF5 aerotables for GNC
export = model.export(
    format="hdf5_gridded",
    grid={
        "mach":        np.linspace(0.3, 6.0, 57),
        "alpha_deg":   np.linspace(-4, 30, 35),
        "beta_deg":    np.linspace(-10, 10, 21),
        "elevon_sym":  np.linspace(-30, 20, 26),
        "altitude_km": np.linspace(0, 60, 61),
    },
    outputs=scalar_outputs,
    include_derivatives=True,
    include_ci_bounds=True,
    compression="gzip",
    chunk_shape=(10, 10, 10, 10, 10),
)
export.save("aerodb_rlv_gnc.h5")`,

  daveml: `import luminary_sdk as lm

# Export DAVE-ML for data exchange
export = model.export(
    format="daveml",
    grid={...},          # same grid as HDF5
    xml_version="2.0",
    provenance={
        "author": "Luminary Cloud Physics AI",
        "dataset": "ds-r7k4m2n8p1",
        "model":   "model-geotransolver-aerodb-v1",
    },
)
export.save("aerodb_rlv.dml")`,

  jsbsim: `import luminary_sdk as lm

# Export JSBSim-compatible XML
export = model.export(
    format="jsbsim_xml",
    aircraft_name="RLV_DEMO",
    reference_area_m2=S_ref,
    reference_length_m=L_ref,
    span_m=b_ref,
    coordinate_frame="BODY",
)
export.save("aerodb_rlv_jsbsim.xml")`,

  statespace: `import luminary_sdk as lm
import numpy as np

# Linearize at multiple trim points
trim_points = [
    {"mach": 0.6, "alt_km": 5,  "alpha_deg": 8.2},
    {"mach": 1.5, "alt_km": 15, "alpha_deg": 5.1},
    {"mach": 2.0, "alt_km": 25, "alpha_deg": 6.2},
    {"mach": 4.0, "alt_km": 40, "alpha_deg": 4.8},
]
ss_export = model.linearize(
    trim_points=trim_points,
    format="scipy_statespace",
    states=["alpha", "beta", "p", "q", "r"],
)
ss_export.save("aerodb_rlv_statespace.npz")`,
}

const EXPORTS = [
  { id: 'hdf5', title: 'Gridded HDF5 Aerotables', badge: 'HDF5', size: '148 MB', badgeColor: '#2563EB', code: codes.hdf5 },
  { id: 'daveml', title: 'DAVE-ML Exchange Format', badge: 'XML', size: '52 MB', badgeColor: '#059669', code: codes.daveml },
  { id: 'jsbsim', title: 'JSBSim XML', badge: 'XML', size: '34 MB', badgeColor: '#D97706', code: codes.jsbsim },
  { id: 'ss', title: 'Linearized State-Space', badge: 'NPZ', size: '4.2 MB', badgeColor: '#7C3AED', code: codes.statespace },
]

function ExportCard({ title, badge, size, badgeColor, code }: typeof EXPORTS[0]) {
  const [progress, setProgress] = useState(-1)
  const [done, setDone] = useState(false)

  const handleDownload = async () => {
    if (done || progress >= 0) return
    setProgress(0)
    setDone(false)
    for (let p = 0; p <= 100; p += 8) {
      await new Promise(r => setTimeout(r, 120))
      setProgress(p)
    }
    setProgress(100)
    setDone(true)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span
            className="inline-block text-xs font-bold px-2 py-0.5 rounded text-white mb-1.5"
            style={{ backgroundColor: badgeColor }}
          >
            {badge}
          </span>
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          <div className="text-xs text-slate-400 mt-0.5">Size: {size}</div>
        </div>
      </div>
      <CodeBlock code={code} />
      {progress >= 0 && !done && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
          <div className="h-1.5 rounded-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: badgeColor }} />
        </div>
      )}
      <button
        onClick={handleDownload}
        disabled={done || progress >= 0}
        className="w-full py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
        style={done
          ? { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0' }
          : { backgroundColor: badgeColor, color: 'white', borderColor: badgeColor }
        }
      >
        {done ? '✅ Downloaded' : progress >= 0 ? `Downloading… ${progress}%` : `Download ${size}`}
      </button>
    </div>
  )
}

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell11ExportGNC({ cellState, onRunComplete }: Props) {
  React.useEffect(() => {
    if (cellState === 'running') {
      const t = setTimeout(onRunComplete, 500)
      return () => clearTimeout(t)
    }
  }, [cellState, onRunComplete])

  if (cellState === 'idle') return (
    <p className="text-sm text-slate-500">Export the trained AeroDB in GNC-consumable formats: gridded HDF5, DAVE-ML, JSBSim XML, and linearized state-space matrices.</p>
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Export GeoTransolver AeroDB to GNC engineering formats.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {EXPORTS.map(e => <ExportCard key={e.id} {...e} />)}
      </div>
    </div>
  )
}
