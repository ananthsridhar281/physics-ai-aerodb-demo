import React, { useState, useCallback } from 'react'
import { CellState } from './types'
import CellContainer from './components/CellContainer'

import Cell1DesignSpace from './cells/Cell1DesignSpace'
import Cell2Sampling from './cells/Cell2Sampling'
import Cell3Visualization from './cells/Cell3Visualization'
import Cell4Dataset from './cells/Cell4Dataset'
import Cell5Domino from './cells/Cell5Domino'
import Cell6GeoTransolver from './cells/Cell6GeoTransolver'
import Cell7Comparison from './cells/Cell7Comparison'
import Cell8SinglePoint from './cells/Cell8SinglePoint'
import Cell11ExportGNC from './cells/Cell11ExportGNC'
import Cell12ExportStructures from './cells/Cell12ExportStructures'
import Cell13ExportCPACS from './cells/Cell13ExportCPACS'
import Cell14ExportSummary from './cells/Cell14ExportSummary'

const TOTAL_CELLS = 12

const CELLS = [
  { index: 1, title: 'Design Space Definition', description: '22 parameters, 4 groups', completion: '✅ Design space defined — 800 cases, 22 parameters', accent: '#2563EB' },
  { index: 2, title: 'Latin Hypercube Sampling', description: '800 stratified cases', completion: '✅ Generated 800 valid cases, 0 rejected', accent: '#2563EB' },
  { index: 3, title: 'Parameter Space Visualization', description: 'Scatter, histograms, heatmap', completion: '✅ Visualizations complete — 5 charts rendered', accent: '#0891B2' },
  { index: 4, title: 'Dataset Creation', description: '796 cases, 5 surface fields', completion: '✅ Dataset ds-r7k4m2n8p1 — 796 cases, 5 surface fields, 15 scalar outputs', accent: '#0891B2' },
  { index: 5, title: 'DoMINO Training', description: '800 epochs, CL MAPE 1.4%', completion: '✅ DoMINO trained — 800 epochs, final loss 0.0052, CL MAPE 1.4%', accent: '#7C3AED' },
  { index: 6, title: 'GeoTransolver Training', description: '600 epochs, CL MAPE 0.9%', completion: '✅ GeoTransolver trained — 600 epochs, final loss 0.0038, CL MAPE 0.9%', accent: '#D97706' },
  { index: 7, title: 'Architecture Comparison', description: 'DoMINO vs GeoTransolver', completion: '✅ Comparison complete — GeoTransolver outperforms DoMINO on all 10 outputs', accent: '#2563EB' },
  { index: 8, title: 'Single Point Inference', description: 'Interactive sliders + force/moment table', completion: '✅ Single-point query interface ready', accent: '#2563EB' },
  { index: 9, title: 'GNC Exports', description: 'HDF5, DAVE-ML, JSBSim, State-space', completion: '✅ 4 GNC export packages ready', accent: '#2563EB' },
  { index: 10, title: 'Aerostructures Exports', description: 'CGNS, loads, GAF, TPS', completion: '✅ 4 Aerostructures export packages ready', accent: '#D97706' },
  { index: 11, title: 'CPACS Export', description: 'CPACS v3.4 MDO interchange', completion: '✅ CPACS export ready — schema validation passed', accent: '#059669' },
  { index: 12, title: 'Export Summary & Provenance', description: '9 packages, full manifest', completion: '✅ 9 export packages generated — GNC (4), Aerostructures (4), MDO (1)', accent: '#059669' },
]

export default function App() {
  const [cellStates, setCellStates] = useState<Record<number, CellState>>(
    Object.fromEntries(Array.from({ length: TOTAL_CELLS }, (_, i) => [i + 1, 'idle']))
  )

  const completedCount = Object.values(cellStates).filter(s => s === 'complete').length

  const setRunning = useCallback((idx: number) => {
    setCellStates(prev => ({ ...prev, [idx]: 'running' }))
  }, [])

  const setComplete = useCallback((idx: number) => {
    setCellStates(prev => ({ ...prev, [idx]: 'complete' }))
  }, [])

  const handleRun = useCallback((cellIndex: number) => {
    return () => {
      setRunning(cellIndex)
    }
  }, [setRunning])

  const isLocked = (cellIndex: number) => {
    if (cellIndex === 1) return false
    return cellStates[cellIndex - 1] !== 'complete'
  }

  const progressDots = Array.from({ length: TOTAL_CELLS }, (_, i) => i + 1)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Sticky nav */}
      <div
        className="sticky top-0 z-50 bg-white border-b"
        style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded border"
                style={{ color: '#059669', borderColor: '#059669', backgroundColor: '#F0FDF4' }}
              >
                Physics AI Workflow
              </span>
              <span className="text-sm font-bold text-slate-900 truncate">Aerodynamic Database Generation</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              Flight Vehicle AeroDB — DoE → Dataset → Train → Evaluate → Export
            </div>
          </div>

          {/* Progress */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
            <div className="text-xs font-medium text-slate-600">
              {completedCount} / {TOTAL_CELLS} cells complete
            </div>
            <div className="flex gap-1">
              {progressDots.map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: cellStates[i] === 'complete'
                      ? '#059669'
                      : cellStates[i] === 'running'
                      ? '#2563EB'
                      : '#E2E8F0',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-8 space-y-0">
        {CELLS.map(({ index, title, description, completion, accent }) => (
          <CellContainer
            key={index}
            cellIndex={index}
            title={title}
            description={description}
            isLocked={isLocked(index)}
            onRun={handleRun(index)}
            completionMessage={completion}
            cellState={cellStates[index]}
            accentColor={accent}
          >
            <CellBody
              cellIndex={index}
              cellState={cellStates[index]}
              onRunComplete={() => setComplete(index)}
            />
          </CellContainer>
        ))}
      </div>
    </div>
  )
}

// Route cell index to cell component
function CellBody({ cellIndex, cellState, onRunComplete }: {
  cellIndex: number
  cellState: CellState
  onRunComplete: () => void
}) {
  switch (cellIndex) {
    case 1: return <Cell1DesignSpace cellState={cellState} onRunComplete={onRunComplete} />
    case 2: return <Cell2Sampling cellState={cellState} onRunComplete={onRunComplete} />
    case 3: return <Cell3Visualization cellState={cellState} onRunComplete={onRunComplete} />
    case 4: return <Cell4Dataset cellState={cellState} onRunComplete={onRunComplete} />
    case 5: return <Cell5Domino cellState={cellState} onRunComplete={onRunComplete} />
    case 6: return <Cell6GeoTransolver cellState={cellState} onRunComplete={onRunComplete} />
    case 7: return <Cell7Comparison cellState={cellState} onRunComplete={onRunComplete} />
    case 8: return <Cell8SinglePoint cellState={cellState} onRunComplete={onRunComplete} />
    case 9: return <Cell11ExportGNC cellState={cellState} onRunComplete={onRunComplete} />
    case 10: return <Cell12ExportStructures cellState={cellState} onRunComplete={onRunComplete} />
    case 11: return <Cell13ExportCPACS cellState={cellState} onRunComplete={onRunComplete} />
    case 12: return <Cell14ExportSummary cellState={cellState} onRunComplete={onRunComplete} />
    default: return null
  }
}
