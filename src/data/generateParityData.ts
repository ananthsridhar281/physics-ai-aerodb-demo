import { ParityPair } from '../types'
import { seededRandom } from './generateLHS'

// Box-Muller normal distribution
function seededNormal(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-10)
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function generateParityPairs(
  nPoints: number,
  mapePercent: number,
  seed: number,
  minVal: number,
  maxVal: number
): ParityPair[] {
  const rng = seededRandom(seed)
  const pairs: ParityPair[] = []
  for (let i = 0; i < nPoints; i++) {
    const truth = minVal + rng() * (maxVal - minVal)
    const relNoise = seededNormal(rng) * (mapePercent / 100)
    const predicted = truth * (1 + relNoise)
    pairs.push({
      truth: Math.round(truth * 10000) / 10000,
      predicted: Math.round(predicted * 10000) / 10000,
    })
  }
  return pairs
}

export function computeR2(pairs: ParityPair[]): number {
  const n = pairs.length
  const mean = pairs.reduce((s, p) => s + p.truth, 0) / n
  let ss_res = 0, ss_tot = 0
  for (const p of pairs) {
    ss_res += (p.truth - p.predicted) ** 2
    ss_tot += (p.truth - mean) ** 2
  }
  return Math.max(0, 1 - ss_res / (ss_tot + 1e-12))
}

export function computeMAPE(pairs: ParityPair[]): number {
  const n = pairs.length
  const sum = pairs.reduce((s, p) => s + Math.abs((p.truth - p.predicted) / (Math.abs(p.truth) + 1e-6)), 0)
  return (sum / n) * 100
}
