export type CellState = 'idle' | 'running' | 'complete'

export interface AeroCase {
  // Flight conditions
  mach: number
  altitude_km: number
  alpha_deg: number
  beta_deg: number
  reynolds_regime: 'fully_turbulent' | 'laminar_transition'
  // Vehicle config
  nose_radius_mm: number
  body_length_m: number
  wing_sweep_deg: number
  wing_aspect_ratio: number
  body_flap_chord_frac: number
  // Control surfaces
  elevon_L_deg: number
  elevon_R_deg: number
  rudder_deg: number
  body_flap_deg: number
  speedbrake_pct: number
  landing_gear: 'retracted' | 'deployed'
  // Derived
  q_inf_Pa: number
  S_ref_m2: number
  L_ref_m: number
  b_ref_m: number
  Re_L: number
  h_over_b: number
}

export interface AeroCoefficients {
  CL: number
  CD: number
  CY: number
  Cl: number
  Cm: number
  Cn: number
  LD: number
  Xcp: number
  CL_alpha: number
  Cm_alpha: number
  Cn_beta: number
  Cl_beta: number
  Cm_q: number
  Cl_p: number
  Cn_r: number
}

export interface InferenceParams {
  mach: number
  alpha_deg: number
  beta_deg: number
  altitude_km: number
  elevon_L_deg: number
  elevon_R_deg: number
  rudder_deg: number
  body_flap_deg: number
  speedbrake_pct: number
  wing_sweep_deg: number
  wing_aspect_ratio: number
  reynolds_regime: 'fully_turbulent' | 'laminar_transition'
  landing_gear: 'retracted' | 'deployed'
}

export interface TrainingPoint {
  epoch: number
  trainLoss: number
  valLoss: number
}

export interface ParityPair {
  truth: number
  predicted: number
}

export interface TrimTarget {
  CL_target: number
  Cm_target: number
  mach: number
  altitude_km: number
  beta_deg: number
  wing_sweep_deg: number
  wing_aspect_ratio: number
  bodyFlap_deg?: number
}

export interface TrimResult {
  alpha_deg: number
  elevon_sym_deg: number
  body_flap_deg: number
  iterations: number
  residual: number
  convergenceHistory: number[]
  trimCoefficients: AeroCoefficients
}
