import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer,
} from 'recharts'
import { generateDoMinoCurves } from '../data/generateTrainingCurves'
import { generateGeoTransolverCurves } from '../data/generateTrainingCurves'
import { Info } from 'lucide-react'

const dominoCurves = generateDoMinoCurves(42)
const geoCurves = generateGeoTransolverCurves(99)

// Combine on shared epoch axis (pad geo to 800 with last value)
const lastGeo = geoCurves[geoCurves.length - 1]
const combinedCurves = dominoCurves.map(d => {
  const g = geoCurves.find(g => g.epoch <= d.epoch) ?? lastGeo
  return {
    epoch: d.epoch,
    dominoTrain: d.trainLoss,
    dominoVal: d.valLoss,
    geoTrain: g.trainLoss,
    geoVal: g.valLoss,
  }
})

const OUTPUTS = [
  { name: 'CL',    domino: 1.4, geo: 0.9 },
  { name: 'CD',    domino: 2.1, geo: 1.3 },
  { name: 'CY',    domino: 3.8, geo: 2.2 },
  { name: 'Cl',    domino: 4.2, geo: 2.6 },
  { name: 'Cm',    domino: 2.8, geo: 1.4 },
  { name: 'Cn',    domino: 3.5, geo: 2.1 },
  { name: 'L/D',   domino: 1.6, geo: 1.1 },
  { name: 'Cm_α',  domino: 5.2, geo: 2.9 },
  { name: 'Cn_β',  domino: 4.8, geo: 2.7 },
  { name: 'Xcp',   domino: 2.3, geo: 1.5 },
]

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell7Comparison({ cellState, onRunComplete }: Props) {
  React.useEffect(() => {
    if (cellState === 'running') {
      const t = setTimeout(onRunComplete, 800)
      return () => clearTimeout(t)
    }
  }, [cellState, onRunComplete])

  if (cellState === 'idle') return (
    <p className="text-sm text-slate-500">Compare DoMINO and GeoTransolver on convergence speed, final loss, and MAPE across all outputs.</p>
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Side-by-side comparison of DoMINO and GeoTransolver convergence and accuracy across all 10 aerodynamic outputs.
      </p>

      {/* Combined loss */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Combined Training Loss (log scale)
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={combinedCurves} margin={{ top: 5, right: 20, bottom: 15, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Epoch', position: 'insideBottom', offset: -8, fontSize: 10, fill: '#94A3B8' }} />
            <YAxis scale="log" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E2E8F0' }} />
            <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="dominoTrain" name="DoMINO Train" stroke="#7C3AED" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="dominoVal" name="DoMINO Val" stroke="#7C3AED" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
            <Line dataKey="geoTrain" name="GeoTransolver Train" stroke="#D97706" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="geoVal" name="GeoTransolver Val" stroke="#D97706" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MAPE bar chart */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          MAPE by Output (%) — Lower is Better
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={OUTPUTS} margin={{ top: 5, right: 20, bottom: 5, left: 10 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} unit="%" />
            <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E2E8F0' }} formatter={(v: number) => [`${v}%`]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="domino" name="DoMINO" fill="#7C3AED" fillOpacity={0.8} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="geo" name="GeoTransolver" fill="#D97706" fillOpacity={0.8} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key takeaway */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3.5 rounded-lg">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <span>
          GeoTransolver achieves <strong>35–45% lower MAPE</strong> on stability derivatives (Cm_α, Cn_β) —
          critical for GNC consumption. Final val loss: DoMINO 0.0078 vs GeoTransolver 0.0052.
        </span>
      </div>
    </div>
  )
}
