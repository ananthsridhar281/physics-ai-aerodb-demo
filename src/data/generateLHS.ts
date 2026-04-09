import { AeroCase } from '../types'

export function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function lhsStratify(n: number, rng: () => number): number[] {
  const result: number[] = []
  for (let i = 0; i < n; i++) {
    result.push((i + rng()) / n)
  }
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ISA atmosphere: returns [density kg/m3, dynamic viscosity]
function isa(alt_km: number): [number, number] {
  const h = alt_km * 1000
  const T0 = 288.15
  const rho0 = 1.225
  const L = 0.0065
  let T: number, rho: number
  if (h <= 11000) {
    T = T0 - L * h
    rho = rho0 * Math.pow(T / T0, 4.256)
  } else if (h <= 20000) {
    T = 216.65
    rho = 0.3639 * Math.exp(-0.0001577 * (h - 11000))
  } else if (h <= 32000) {
    T = 216.65 + 0.001 * (h - 20000)
    rho = 0.0880 * Math.pow(T / 216.65, -35.16)
  } else if (h <= 47000) {
    T = 228.65 + 0.0028 * (h - 32000)
    rho = 0.01322 * Math.pow(T / 228.65, -17.08)
  } else {
    T = 270.65
    rho = Math.max(0.001322 * Math.exp(-0.001 * (h - 47000)), 1e-5)
  }
  // Sutherland's law
  const mu = 1.716e-5 * Math.pow(T / 273.15, 1.5) * (273.15 + 110.4) / (T + 110.4)
  return [rho, mu]
}

export function generateLHSCases(n = 800): AeroCase[] {
  const rng = seededRandom(42)

  const lhsMach = lhsStratify(n, rng)
  const lhsAlt = lhsStratify(n, rng)
  const lhsAlpha = lhsStratify(n, rng)
  const lhsBeta = lhsStratify(n, rng)
  const lhsNoseR = lhsStratify(n, rng)
  const lhsBodyL = lhsStratify(n, rng)
  const lhsSweep = lhsStratify(n, rng)
  const lhsAR = lhsStratify(n, rng)
  const lhsBFC = lhsStratify(n, rng)
  const lhsElevL = lhsStratify(n, rng)
  const lhsElevR = lhsStratify(n, rng)
  const lhsRudder = lhsStratify(n, rng)
  const lhsBF = lhsStratify(n, rng)
  const lhsSB = lhsStratify(n, rng)

  const cases: AeroCase[] = []

  for (let i = 0; i < n; i++) {
    // Regime-biased Mach sampling
    const machRoll = rng()
    let mach: number
    if (machRoll < 0.40) {
      mach = lerp(0.3, 0.8, lhsMach[i])       // subsonic
    } else if (machRoll < 0.65) {
      mach = lerp(0.8, 1.4, lhsMach[i])       // transonic
    } else if (machRoll < 0.85) {
      mach = lerp(1.4, 3.0, lhsMach[i])       // supersonic
    } else {
      mach = lerp(3.0, 6.0, lhsMach[i])       // hypersonic
    }

    const altitude_km = lerp(0, 60, lhsAlt[i])
    const alpha_deg = lerp(-4, 30, lhsAlpha[i])
    const beta_deg = lerp(-10, 10, lhsBeta[i])
    const reynolds_regime: 'fully_turbulent' | 'laminar_transition' = rng() < 0.70 ? 'fully_turbulent' : 'laminar_transition'
    const landing_gear: 'retracted' | 'deployed' = (mach < 0.4 && rng() < 0.10) ? 'deployed' : 'retracted'

    const nose_radius_mm = lerp(20, 120, lhsNoseR[i])
    const body_length_m = lerp(8, 15, lhsBodyL[i])
    const wing_sweep_deg = lerp(30, 65, lhsSweep[i])
    const wing_aspect_ratio = lerp(1.5, 4.0, lhsAR[i])
    const body_flap_chord_frac = lerp(0.05, 0.20, lhsBFC[i])

    const elevon_L_deg = lerp(-30, 20, lhsElevL[i])
    const elevon_R_deg = lerp(-30, 20, lhsElevR[i])
    const rudder_deg = lerp(-25, 25, lhsRudder[i])
    const body_flap_deg = lerp(-15, 30, lhsBF[i])
    const speedbrake_pct = lerp(0, 100, lhsSB[i])

    // Derived
    const [rho, mu] = isa(altitude_km)
    const a_sound = 340.3 * Math.sqrt(Math.max(1 - 0.0000226 * altitude_km * 1000 / 288.15, 0.1))
    const V = mach * a_sound
    const q_inf_Pa = 0.5 * rho * V * V

    const b_ref_m = body_length_m * 0.45 / Math.sqrt(wing_aspect_ratio)
    const S_ref_m2 = b_ref_m * b_ref_m / wing_aspect_ratio
    const L_ref_m = b_ref_m / wing_aspect_ratio
    const Re_L = rho * V * L_ref_m / Math.max(mu, 1e-10)
    const h_over_b = (altitude_km < 0.2) ? lerp(0.3, 2.0, rng()) : altitude_km * 1000 / b_ref_m

    cases.push({
      mach: Math.round(mach * 1000) / 1000,
      altitude_km: Math.round(altitude_km * 10) / 10,
      alpha_deg: Math.round(alpha_deg * 10) / 10,
      beta_deg: Math.round(beta_deg * 10) / 10,
      reynolds_regime,
      nose_radius_mm: Math.round(nose_radius_mm * 10) / 10,
      body_length_m: Math.round(body_length_m * 100) / 100,
      wing_sweep_deg: Math.round(wing_sweep_deg * 10) / 10,
      wing_aspect_ratio: Math.round(wing_aspect_ratio * 100) / 100,
      body_flap_chord_frac: Math.round(body_flap_chord_frac * 1000) / 1000,
      elevon_L_deg: Math.round(elevon_L_deg * 10) / 10,
      elevon_R_deg: Math.round(elevon_R_deg * 10) / 10,
      rudder_deg: Math.round(rudder_deg * 10) / 10,
      body_flap_deg: Math.round(body_flap_deg * 10) / 10,
      speedbrake_pct: Math.round(speedbrake_pct * 10) / 10,
      landing_gear,
      q_inf_Pa: Math.round(q_inf_Pa),
      S_ref_m2: Math.round(S_ref_m2 * 1000) / 1000,
      L_ref_m: Math.round(L_ref_m * 1000) / 1000,
      b_ref_m: Math.round(b_ref_m * 1000) / 1000,
      Re_L: Math.round(Re_L),
      h_over_b: Math.round(h_over_b * 100) / 100,
    })
  }

  return cases
}
