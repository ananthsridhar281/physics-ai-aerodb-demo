import { TrimTarget, TrimResult, InferenceParams } from '../types'
import { predictCoefficients } from './analyticalAeroModel'

function buildParams(alpha: number, elevon: number, bodyFlap: number, target: TrimTarget): InferenceParams {
  return {
    mach: target.mach,
    alpha_deg: alpha,
    beta_deg: target.beta_deg,
    altitude_km: target.altitude_km,
    elevon_L_deg: elevon,
    elevon_R_deg: elevon,
    rudder_deg: 0,
    body_flap_deg: bodyFlap,
    speedbrake_pct: 0,
    wing_sweep_deg: target.wing_sweep_deg ?? 45,
    wing_aspect_ratio: target.wing_aspect_ratio ?? 2.5,
    reynolds_regime: 'fully_turbulent',
    landing_gear: 'retracted',
  }
}

function residuals(alpha: number, elevon: number, bodyFlap: number, target: TrimTarget): [number, number] {
  const p = buildParams(alpha, elevon, bodyFlap, target)
  const c = predictCoefficients(p)
  return [c.CL - target.CL_target, c.Cm - target.Cm_target]
}

export function solveTrim(target: TrimTarget): TrimResult {
  const h = 0.01
  let alpha = 5.0
  let elevon = 0.0
  const bodyFlap = target.bodyFlap_deg ?? 2.15
  const convergenceHistory: number[] = []

  for (let iter = 0; iter < 15; iter++) {
    const [r1, r2] = residuals(alpha, elevon, bodyFlap, target)
    const residNorm = Math.sqrt(r1 * r1 + r2 * r2)
    convergenceHistory.push(residNorm)

    if (residNorm < 1e-7) break

    // Numerical Jacobian
    const [r1_da, r2_da] = residuals(alpha + h, elevon, bodyFlap, target)
    const [r1_de, r2_de] = residuals(alpha, elevon + h, bodyFlap, target)

    const J11 = (r1_da - r1) / h
    const J12 = (r1_de - r1) / h
    const J21 = (r2_da - r2) / h
    const J22 = (r2_de - r2) / h

    const det = J11 * J22 - J12 * J21
    if (Math.abs(det) < 1e-12) break

    const dAlpha = -(J22 * r1 - J12 * r2) / det
    const dElevon = -(-J21 * r1 + J11 * r2) / det

    alpha += Math.max(-5, Math.min(5, dAlpha))
    elevon += Math.max(-5, Math.min(5, dElevon))
  }

  const [r1f, r2f] = residuals(alpha, elevon, bodyFlap, target)
  const finalResidual = Math.sqrt(r1f * r1f + r2f * r2f)
  const trimCoefficients = predictCoefficients(buildParams(alpha, elevon, bodyFlap, target))

  return {
    alpha_deg: Math.round(alpha * 1000) / 1000,
    elevon_sym_deg: Math.round(elevon * 1000) / 1000,
    body_flap_deg: Math.round(bodyFlap * 1000) / 1000,
    iterations: convergenceHistory.length,
    residual: finalResidual,
    convergenceHistory,
    trimCoefficients,
  }
}
