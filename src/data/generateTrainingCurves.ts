import { TrainingPoint } from '../types'
import { seededRandom } from './generateLHS'

function smoothLoss(epoch: number, a: number, b: number, c: number, rng: () => number, noiseScale = 0.002): number {
  return a * Math.exp(-b * epoch) + c + (rng() - 0.5) * 2 * noiseScale
}

export function generateDoMinoCurves(seed = 42): TrainingPoint[] {
  const rng = seededRandom(seed)
  const epochs = [20, 50, 100, 200, 400, 600, 800]
  return epochs.map(epoch => ({
    epoch,
    trainLoss: Math.max(0.001, smoothLoss(epoch, 0.68, 0.0048, 0.0045, rng, 0.003)),
    valLoss: Math.max(0.001, smoothLoss(epoch, 0.72, 0.0045, 0.007, rng, 0.004)),
  }))
}

export function generateGeoTransolverCurves(seed = 99): TrainingPoint[] {
  const rng = seededRandom(seed)
  const epochs = [20, 50, 100, 200, 400, 600]
  return epochs.map(epoch => ({
    epoch,
    trainLoss: Math.max(0.001, smoothLoss(epoch, 0.58, 0.0065, 0.003, rng, 0.002)),
    valLoss: Math.max(0.001, smoothLoss(epoch, 0.60, 0.0062, 0.004, rng, 0.003)),
  }))
}
