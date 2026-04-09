import { InferenceParams, AeroCoefficients } from '../types'

export function predictCoefficients(p: InferenceParams): AeroCoefficients {
  const { mach, alpha_deg, beta_deg, elevon_L_deg, elevon_R_deg,
    rudder_deg, body_flap_deg, speedbrake_pct, wing_aspect_ratio = 2.5 } = p

  const alpha_rad = alpha_deg * Math.PI / 180
  const beta_rad = beta_deg * Math.PI / 180
  const elevon_sym = (elevon_L_deg + elevon_R_deg) / 2
  const elevon_asym = (elevon_R_deg - elevon_L_deg) / 2

  const AR = wing_aspect_ratio
  const e = 0.82 // Oswald efficiency

  // Prandtl-Glauert compressibility factor
  const M_clamp = Math.min(Math.abs(mach), 0.95)
  const beta_pg = Math.sqrt(1 - M_clamp * M_clamp)

  // Lift curve slope (per radian)
  let CL_alpha_0: number
  if (mach < 1.0) {
    // Subsonic: thin airfoil + P-G
    CL_alpha_0 = (2 * Math.PI * AR) / (AR + 2) / beta_pg
  } else if (mach < 1.2) {
    // Transonic blend
    const t = (mach - 1.0) / 0.2
    const sub = (2 * Math.PI * AR) / (AR + 2) / 0.5
    const sup = 4 / Math.sqrt(mach * mach - 1)
    CL_alpha_0 = sub * (1 - t) + sup * t
  } else {
    // Supersonic: linear theory
    CL_alpha_0 = 4 / Math.sqrt(mach * mach - 1)
  }

  // CL
  const CL_base = CL_alpha_0 * alpha_rad
  const CL_elevon = 0.018 * elevon_sym
  const CL_flap = 0.012 * body_flap_deg
  const CL_sb = -0.002 * speedbrake_pct

  // Stall model (subsonic only)
  let stall_factor = 1.0
  if (mach < 0.9 && alpha_deg > 16) {
    stall_factor = Math.max(0.3, 1 - 0.08 * (alpha_deg - 16))
  }
  const CL = (CL_base + CL_elevon + CL_flap + CL_sb) * stall_factor

  // CD: zero-lift drag + induced + wave drag
  let CD0 = 0.015 + 0.001 * speedbrake_pct / 100 * 0.05
  if (p.landing_gear === 'deployed') CD0 += 0.020

  // Wave drag (supersonic)
  let CD_wave = 0
  if (mach > 1.1) {
    CD_wave = 4 * alpha_rad * alpha_rad / Math.sqrt(Math.max(mach * mach - 1, 0.01))
    CD_wave += 0.008 * (mach - 1)
  } else if (mach > 0.8) {
    // Transonic drag rise
    CD_wave = 0.02 * Math.pow((mach - 0.8) / 0.3, 2)
  }

  const CD_induced = CL * CL / (Math.PI * AR * e)
  const CD_sb = 0.0005 * speedbrake_pct
  const CD = CD0 + CD_induced + CD_wave + CD_sb

  // Side force
  const CY = -0.018 * beta_deg + 0.006 * rudder_deg

  // Roll moment
  const Cl = 0.0004 * elevon_asym - 0.0002 * rudder_deg * Math.sign(beta_deg)

  // Pitch moment
  const Cm0 = -0.03
  const Cm_alpha_coeff = -0.022 - 0.003 * mach
  const Cm = Cm0 + Cm_alpha_coeff * alpha_deg - 0.012 * elevon_sym - 0.008 * body_flap_deg

  // Yaw moment
  const Cn = 0.0015 * beta_deg - 0.001 * rudder_deg

  const LD = Math.abs(CD) > 0.001 ? CL / CD : 0
  const Xcp = Math.abs(CL) > 0.001 ? 0.25 + Cm / CL * (-1) : 0.25

  // Stability derivatives
  const CL_alpha = CL_alpha_0
  const Cm_alpha_deriv = Cm_alpha_coeff
  const Cn_beta = 0.0018 + 0.0008 * mach
  const Cl_beta = -0.0012 - 0.0003 * mach
  const Cm_q = -8.5 - 0.5 * mach
  const Cl_p = -0.42 + 0.02 * mach
  const Cn_r = -0.12 - 0.01 * mach

  return {
    CL: Math.round(CL * 10000) / 10000,
    CD: Math.max(0.001, Math.round(CD * 10000) / 10000),
    CY: Math.round(CY * 10000) / 10000,
    Cl: Math.round(Cl * 10000) / 10000,
    Cm: Math.round(Cm * 10000) / 10000,
    Cn: Math.round(Cn * 10000) / 10000,
    LD: Math.round(LD * 100) / 100,
    Xcp: Math.round(Xcp * 1000) / 1000,
    CL_alpha: Math.round(CL_alpha * 10000) / 10000,
    Cm_alpha: Math.round(Cm_alpha_deriv * 10000) / 10000,
    Cn_beta: Math.round(Cn_beta * 10000) / 10000,
    Cl_beta: Math.round(Cl_beta * 10000) / 10000,
    Cm_q: Math.round(Cm_q * 100) / 100,
    Cl_p: Math.round(Cl_p * 10000) / 10000,
    Cn_r: Math.round(Cn_r * 10000) / 10000,
  }
}
