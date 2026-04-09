import React, { useState } from 'react'
import CodeBlock from '../components/CodeBlock'

const codes = {
  cgns: `import luminary_sdk as lm

# Export surface pressure & skin friction fields — CGNS + VTK
surface_export = model.export_surface_fields(
    format="cgns_vtk",
    fields=["pressure_coeff", "skin_friction_x",
            "skin_friction_y", "skin_friction_z"],
    cases=trimmed_cases,           # 796 converged runs
    mesh_resolution="fine",        # original CFD surface mesh
    include_normals=True,
    include_areas=True,
)
surface_export.save_cgns("surfaces_rlv.cgns")
surface_export.save_vtk("surfaces_rlv_vtk/")`,

  loads: `import luminary_sdk as lm
import pandas as pd

# Export section loads — integrated over span stations
loads_export = model.export_section_loads(
    n_span_stations=50,
    reference_lengths={"chord": L_ref, "span": b_ref},
    outputs=["Cl_sec", "Cd_sec", "Cm_sec",
             "Fy_N", "Fz_N", "Mx_Nm"],
    cases=trimmed_cases,
)
loads_export.save_hdf5("section_loads.h5")
loads_export.save_csv("section_loads_csv/")`,

  gaf: `import luminary_sdk as lm
import numpy as np

# Export Generalized Aerodynamic Force matrices
# for aeroelastic stability analysis (ASE)
gaf_export = model.export_gaf_matrices(
    reduced_frequencies=np.array([
        0.0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 1.0,
    ]),
    mach_list=[0.6, 0.9, 1.2, 2.0, 4.0],
    structural_modes=48,      # from FEM eigensolution
    format="nastran_bdf",
)
gaf_export.save("gaf_matrices.bdf")`,

  tps: `import luminary_sdk as lm

# Export TPS heat flux for thermal protection system sizing
tps_export = model.export_heat_flux(
    cases=hypersonic_cases,       # M > 3.0, peak-heating traj
    outputs=["heat_flux_W_m2", "stagnation_T_K",
             "recovery_T_K", "Stanton_number"],
    zones=["nose", "windward", "leeward", "wing_LE"],
    format="csv_plt",
)
tps_export.save_csv("heat_flux_tps.csv")
tps_export.save_plt("heat_flux_tps.plt")`,
}

const EXPORTS = [
  { id: 'cgns', title: 'Surface Pressures CGNS + VTK', badge: 'CGNS', size: '1.6 GB', badgeColor: '#0891B2', code: codes.cgns },
  { id: 'loads', title: 'Section Loads HDF5 + CSV', badge: 'HDF5', size: '20 MB', badgeColor: '#2563EB', code: codes.loads },
  { id: 'gaf', title: 'ASE GAF Matrices (BDF)', badge: 'BDF', size: '45 MB', badgeColor: '#7C3AED', code: codes.gaf },
  { id: 'tps', title: 'TPS Heat Flux CSV + PLT', badge: 'CSV', size: '156 MB', badgeColor: '#DC2626', code: codes.tps },
]

function ExportCard({ title, badge, size, badgeColor, code }: typeof EXPORTS[0]) {
  const [progress, setProgress] = useState(-1)
  const [done, setDone] = useState(false)

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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block text-xs font-bold px-2 py-0.5 rounded text-white mb-1.5" style={{ backgroundColor: badgeColor }}>{badge}</span>
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
      <button onClick={handleDownload} disabled={done || progress >= 0}
        className="w-full py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
        style={done ? { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0' } : { backgroundColor: badgeColor, color: 'white', borderColor: badgeColor }}
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

export default function Cell12ExportStructures({ cellState, onRunComplete }: Props) {
  React.useEffect(() => {
    if (cellState === 'running') {
      const t = setTimeout(onRunComplete, 500)
      return () => clearTimeout(t)
    }
  }, [cellState, onRunComplete])

  if (cellState === 'idle') return (
    <p className="text-sm text-slate-500">Export aerostructures data: surface fields (CGNS/VTK), section loads, GAF matrices for ASE, and TPS heat flux.</p>
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Export surface fields and integrated loads for structures and thermal teams.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {EXPORTS.map(e => <ExportCard key={e.id} {...e} />)}
      </div>
    </div>
  )
}
