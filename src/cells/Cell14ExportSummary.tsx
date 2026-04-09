import React from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'

const MANIFEST = [
  { n: 1, name: 'Gridded HDF5 Aerotables', format: 'HDF5', size: '148 MB', sha: 'a3f8c1d2...e9b4', team: 'GNC' },
  { n: 2, name: 'DAVE-ML Exchange', format: 'XML', size: '52 MB', sha: 'b7e2a9c4...f1d6', team: 'GNC' },
  { n: 3, name: 'JSBSim XML', format: 'XML', size: '34 MB', sha: 'c4d1f7b8...a2e5', team: 'GNC' },
  { n: 4, name: 'Linearized State-Space', format: 'NPZ', size: '4.2 MB', sha: 'd9b3e6f1...c8a7', team: 'GNC' },
  { n: 5, name: 'Surface Pressures CGNS+VTK', format: 'CGNS', size: '1.6 GB', sha: 'e2c7a4d9...b3f8', team: 'Structures' },
  { n: 6, name: 'Section Loads HDF5+CSV', format: 'HDF5', size: '20 MB', sha: 'f5d8b1e3...c6a2', team: 'Structures' },
  { n: 7, name: 'ASE GAF Matrices', format: 'BDF', size: '45 MB', sha: 'a8e4c2f7...d1b9', team: 'Structures' },
  { n: 8, name: 'TPS Heat Flux CSV+PLT', format: 'CSV', size: '156 MB', sha: 'b1f6d3a8...e4c7', team: 'Structures' },
  { n: 9, name: 'CPACS Full Aircraft XML', format: 'XML', size: '68 MB', sha: 'c4a9e7b2...f3d8', team: 'MDO' },
]

const TEAM_COLORS: Record<string, string> = {
  GNC: '#2563EB',
  Structures: '#D97706',
  MDO: '#059669',
}

const FORMAT_COLORS: Record<string, string> = {
  HDF5: '#2563EB',
  XML: '#059669',
  CGNS: '#0891B2',
  BDF: '#7C3AED',
  NPZ: '#D97706',
  CSV: '#DC2626',
}

const PROVENANCE_NODES = [
  { label: 'LHS DoE', sub: '800 pts', color: '#0891B2' },
  { label: 'Luminary CFD', sub: 'RANS/Euler', color: '#2563EB' },
  { label: 'Physics AI Dataset', sub: '796 cases', color: '#7C3AED' },
  { label: 'GeoTransolver', sub: '600 epochs', color: '#D97706' },
  { label: 'Validated Model', sub: 'MAPE <3%', color: '#059669' },
  { label: 'Export Suite', sub: '9 packages', color: '#059669' },
]

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell14ExportSummary({ cellState, onRunComplete }: Props) {
  React.useEffect(() => {
    if (cellState === 'running') {
      const t = setTimeout(onRunComplete, 500)
      return () => clearTimeout(t)
    }
  }, [cellState, onRunComplete])

  if (cellState === 'idle') return (
    <p className="text-sm text-slate-500">Complete export manifest with SHA-256 hashes, team assignments, and provenance chain from DoE to export packages.</p>
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Full export manifest with cryptographic hashes and data provenance chain.
      </p>

      {/* Export manifest */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Export Manifest</div>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">#</th>
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">Export</th>
                <th className="text-center py-2.5 px-3 font-medium text-slate-500">Format</th>
                <th className="text-right py-2.5 px-3 font-medium text-slate-500">Size</th>
                <th className="text-center py-2.5 px-3 font-medium text-slate-500 hidden md:table-cell">SHA-256</th>
                <th className="text-center py-2.5 px-3 font-medium text-slate-500">Team</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {MANIFEST.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400">{row.n}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{row.name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-white font-bold text-xs"
                      style={{ backgroundColor: FORMAT_COLORS[row.format] ?? '#64748B' }}
                    >
                      {row.format}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{row.size}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400 hidden md:table-cell">{row.sha}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: TEAM_COLORS[row.team] }}
                    >
                      {row.team}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provenance chain */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Data Provenance Chain</div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {PROVENANCE_NODES.map((node, i) => (
              <React.Fragment key={i}>
                <div
                  className="flex flex-col items-center px-3 py-2 rounded-lg border-2 min-w-[90px] text-center"
                  style={{ borderColor: node.color, backgroundColor: node.color + '10' }}
                >
                  <span className="text-xs font-semibold" style={{ color: node.color }}>{node.label}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{node.sub}</span>
                </div>
                {i < PROVENANCE_NODES.length - 1 && (
                  <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Final completion banner */}
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-xl">
        <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
        <div>
          <div className="font-semibold text-base">9 export packages generated</div>
          <div className="text-sm text-emerald-700 mt-0.5">GNC (4) · Aerostructures (4) · MDO (1) · Total: ~2.1 GB</div>
        </div>
      </div>
    </div>
  )
}
