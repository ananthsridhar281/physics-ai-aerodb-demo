import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, BarChart, Bar,
  ResponsiveContainer,
} from 'recharts'
import CodeBlock from '../components/CodeBlock'
import TrainingLog from '../components/TrainingLog'
import { generateGeoTransolverCurves } from '../data/generateTrainingCurves'
import { generateParityPairs } from '../data/generateParityData'

const geoCode = `import luminary_sdk as lm

# GeoTransolver — Geometry-aware Transformer architecture
job = lm.PhysicsAI.TrainingJob.create(
    dataset_id="ds-r7k4m2n8p1",
    architecture="GeoTransolver",
    hyperparameters={
        "epochs": 600,
        "batch_size": 32,
        "learning_rate": 5e-4,
        "lr_scheduler": "warmup_cosine",
        "warmup_epochs": 20,
        "n_heads": 8,
        "n_transformer_layers": 12,
        "hidden_dim": 512,
        "patch_size": 0.05,        # normalized geometry units
        "geo_encoding": "fourier",  # positional encoding type
        "dropout": 0.04,
        "weight_decay": 5e-5,
        "train_split": 0.80,
        "val_split": 0.10,
        "test_split": 0.10,
    },
    resources={
        "gpu_count": 8,
        "gpu_type": "A100-80GB",
    },
)
job.submit()
print(f"Training job submitted: {job.id}")`

const logLines = [
  '2026-04-02 11:15:15 - Submitting GeoTransolver training job...',
  '2026-04-02 11:15:20 - Training job submitted: tj-g7r2k5n1p8',
  '2026-04-02 11:15:30 - Resources: 8× A100-80GB allocated',
  '2026-04-02 11:16:00 - Status: Acquiring resources...',
  '2026-04-02 11:16:30 - Status: Warmup phase (20 epochs)...',
  '2026-04-02 11:16:50 - Epoch  20/600 | Loss: 0.5823 | Val: 0.6012',
  '2026-04-02 11:17:10 - Epoch  50/600 | Loss: 0.2541 | Val: 0.2789',
  '2026-04-02 11:17:35 - Epoch 100/600 | Loss: 0.0923 | Val: 0.1087',
  '2026-04-02 11:18:00 - Epoch 200/600 | Loss: 0.0312 | Val: 0.0431',
  '2026-04-02 11:18:30 - Epoch 400/600 | Loss: 0.0098 | Val: 0.0143',
  '2026-04-02 11:19:00 - Epoch 600/600 | Loss: 0.0038 | Val: 0.0052',
  '2026-04-02 11:19:05 - Training complete. Model: model-geotransolver-aerodb-v1',
  '2026-04-02 11:19:30 - Evaluation complete.',
]

const trainCurves = generateGeoTransolverCurves(99)
const clParity = generateParityPairs(100, 0.9, 44, -0.3, 1.5)
const cmParity = generateParityPairs(100, 1.4, 55, -0.8, 0.4)
const ldParity = generateParityPairs(100, 1.1, 66, 0, 18)

function parityDiag(data: { truth: number; predicted: number }[]) {
  const vals = data.map(d => d.truth)
  return [{ truth: Math.min(...vals), predicted: Math.min(...vals) }, { truth: Math.max(...vals), predicted: Math.max(...vals) }]
}

function buildErrHist(data: { truth: number; predicted: number }[]) {
  const errs = data.map(d => Math.abs((d.truth - d.predicted) / (Math.abs(d.truth) + 1e-6)) * 100)
  const max = Math.max(...errs)
  return Array.from({ length: 10 }, (_, i) => ({
    bin: `${((i / 10) * max).toFixed(1)}–${(((i + 1) / 10) * max).toFixed(1)}`,
    count: errs.filter(e => e >= (i / 10) * max && e < ((i + 1) / 10) * max).length,
  }))
}

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell6GeoTransolver({ cellState, onRunComplete }: Props) {
  const [logDone, setLogDone] = useState(false)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Train a GeoTransolver surrogate using geometry-aware transformer attention with Fourier positional
        encoding — 35–45% lower MAPE on stability derivatives vs DoMINO.
      </p>
      <CodeBlock code={geoCode} />

      {(cellState === 'running' || cellState === 'complete') && (
        <div className="space-y-4 mt-2">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Training Log</div>
            <TrainingLog
              lines={logLines}
              delayMs={280}
              onComplete={() => { setLogDone(true); onRunComplete() }}
              accentColor="#D97706"
            />
          </div>

          {(logDone || cellState === 'complete') && (
            <>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Training Loss (log scale)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trainCurves} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Epoch', position: 'insideBottom', offset: -3, fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis scale="log" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E2E8F0' }} />
                    <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
                    <Line dataKey="trainLoss" name="Train" stroke="#D97706" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line dataKey="valLoss" name="Val" stroke="#D97706" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parity Plots</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'CL', data: clParity, r2: 0.997, mape: 0.9, diag: parityDiag(clParity) },
                    { label: 'Cm', data: cmParity, r2: 0.991, mape: 1.4, diag: parityDiag(cmParity) },
                    { label: 'L/D', data: ldParity, r2: 0.995, mape: 1.1, diag: parityDiag(ldParity) },
                  ].map(({ label, data, r2, mape, diag }) => (
                    <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1 font-medium text-center">{label}</div>
                      <ResponsiveContainer width="100%" height={160}>
                        <ScatterChart margin={{ top: 5, right: 5, bottom: 15, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="truth" name="Truth" tick={{ fontSize: 9, fill: '#94A3B8' }} label={{ value: 'CFD', position: 'insideBottom', offset: -5, fontSize: 9, fill: '#94A3B8' }} />
                          <YAxis dataKey="predicted" name="Pred" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                          <Tooltip contentStyle={{ fontSize: 10 }} />
                          <Scatter data={data} fill="#D97706" fillOpacity={0.55} r={3} isAnimationActive={false} />
                          <Scatter data={diag} fill="none" line={{ stroke: '#94A3B8', strokeDasharray: '4 2' }} isAnimationActive={false} />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-3 text-xs text-slate-500 mt-1">
                        <span>R²={r2}</span>
                        <span>MAPE={mape}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Error Distributions (%)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'CL', hist: buildErrHist(clParity) },
                    { label: 'Cm', hist: buildErrHist(cmParity) },
                    { label: 'L/D', hist: buildErrHist(ldParity) },
                  ].map(({ label, hist }) => (
                    <div key={label}>
                      <div className="text-xs text-slate-400 mb-1 text-center">{label} % error</div>
                      <ResponsiveContainer width="100%" height={130}>
                        <BarChart data={hist} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="bin" tick={false} />
                          <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} />
                          <Bar dataKey="count" fill="#D97706" fillOpacity={0.7} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
