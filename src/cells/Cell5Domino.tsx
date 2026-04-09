import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, ReferenceLine, BarChart, Bar,
  ResponsiveContainer,
} from 'recharts'
import CodeBlock from '../components/CodeBlock'
import TrainingLog from '../components/TrainingLog'
import { generateDoMinoCurves } from '../data/generateTrainingCurves'
import { generateParityPairs } from '../data/generateParityData'

const dominoCode = `import luminary_sdk as lm

# DoMINO — Distance-based Multiscale Interpolation
# for Non-local Observations
job = lm.PhysicsAI.TrainingJob.create(
    dataset_id="ds-r7k4m2n8p1",
    architecture="DoMINO",
    hyperparameters={
        "epochs": 800,
        "batch_size": 64,
        "learning_rate": 3e-4,
        "lr_scheduler": "cosine_decay",
        "latent_dim": 256,
        "n_encoder_layers": 6,
        "n_decoder_layers": 4,
        "distance_scales": [0.5, 1.0, 2.0, 5.0, 10.0],
        "multiscale_aggregation": "attention",
        "dropout": 0.05,
        "weight_decay": 1e-4,
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
  '2026-04-02 10:32:00 - Submitting DoMINO training job...',
  '2026-04-02 10:32:05 - Training job submitted: tj-a4k8m2n6r3',
  '2026-04-02 10:32:15 - Resources: 8× A100-80GB allocated',
  '2026-04-02 10:32:45 - Status: Preprocessing data...',
  '2026-04-02 10:33:05 - Status: Building point cloud index...',
  '2026-04-02 10:33:35 - Epoch  20/800 | Loss: 0.6823 | Val: 0.7214',
  '2026-04-02 10:34:00 - Epoch  50/800 | Loss: 0.3412 | Val: 0.3756',
  '2026-04-02 10:34:30 - Epoch 100/800 | Loss: 0.1287 | Val: 0.1534',
  '2026-04-02 10:35:00 - Epoch 200/800 | Loss: 0.0543 | Val: 0.0678',
  '2026-04-02 10:35:30 - Epoch 400/800 | Loss: 0.0198 | Val: 0.0256',
  '2026-04-02 10:36:00 - Epoch 600/800 | Loss: 0.0087 | Val: 0.0124',
  '2026-04-02 10:36:30 - Epoch 800/800 | Loss: 0.0052 | Val: 0.0078',
  '2026-04-02 10:36:35 - Training complete. Model: model-domino-aerodb-v1',
  '2026-04-02 10:37:00 - Evaluation complete.',
]

const trainCurves = generateDoMinoCurves(42)
const clParity = generateParityPairs(100, 1.4, 11, -0.3, 1.5)
const cmParity = generateParityPairs(100, 2.8, 22, -0.8, 0.4)
const ldParity = generateParityPairs(100, 1.6, 33, 0, 18)

function parityDiag(data: { truth: number; predicted: number }[]) {
  const vals = data.map(d => d.truth)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  return [{ truth: minV, predicted: minV }, { truth: maxV, predicted: maxV }]
}

function buildErrHist(data: { truth: number; predicted: number }[]) {
  const errs = data.map(d => Math.abs((d.truth - d.predicted) / (Math.abs(d.truth) + 1e-6)) * 100)
  const bins = 10
  const max = Math.max(...errs)
  return Array.from({ length: bins }, (_, i) => {
    const lo = (i / bins) * max
    const hi = ((i + 1) / bins) * max
    return {
      bin: `${lo.toFixed(1)}–${hi.toFixed(1)}`,
      count: errs.filter(e => e >= lo && e < hi).length,
    }
  })
}

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell5Domino({ cellState, onRunComplete }: Props) {
  const [logDone, setLogDone] = useState(false)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Train a DoMINO surrogate model on the aerodynamic dataset using distance-based multiscale
        interpolation for point-cloud geometric representations.
      </p>
      <CodeBlock code={dominoCode} />

      {(cellState === 'running' || cellState === 'complete') && (
        <div className="space-y-4 mt-2">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Training Log</div>
            <TrainingLog
              lines={logLines}
              delayMs={320}
              onComplete={() => { setLogDone(true); onRunComplete() }}
              accentColor="#7C3AED"
            />
          </div>

          {(logDone || cellState === 'complete') && (
            <>
              {/* Loss curve */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Training Loss (log scale)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trainCurves} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Epoch', position: 'insideBottom', offset: -3, fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis scale="log" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E2E8F0' }} />
                    <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
                    <Line dataKey="trainLoss" name="Train" stroke="#7C3AED" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line dataKey="valLoss" name="Val" stroke="#7C3AED" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Parity plots */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parity Plots</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'CL', data: clParity, r2: 0.992, mape: 1.4, diag: parityDiag(clParity) },
                    { label: 'Cm', data: cmParity, r2: 0.978, mape: 2.8, diag: parityDiag(cmParity) },
                    { label: 'L/D', data: ldParity, r2: 0.989, mape: 1.6, diag: parityDiag(ldParity) },
                  ].map(({ label, data, r2, mape, diag }) => (
                    <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1 font-medium text-center">{label}</div>
                      <ResponsiveContainer width="100%" height={160}>
                        <ScatterChart margin={{ top: 5, right: 5, bottom: 15, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="truth" name="Truth" tick={{ fontSize: 9, fill: '#94A3B8' }} label={{ value: 'CFD', position: 'insideBottom', offset: -5, fontSize: 9, fill: '#94A3B8' }} />
                          <YAxis dataKey="predicted" name="Pred" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                          <Tooltip contentStyle={{ fontSize: 10 }} />
                          <Scatter data={data} fill="#7C3AED" fillOpacity={0.55} r={3} isAnimationActive={false} />
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

              {/* Error histograms */}
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
                          <Bar dataKey="count" fill="#7C3AED" fillOpacity={0.7} radius={[2, 2, 0, 0]} isAnimationActive={false} />
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
