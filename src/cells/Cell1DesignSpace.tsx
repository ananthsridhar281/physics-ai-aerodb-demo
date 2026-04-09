import React from 'react'

interface ParameterRow {
  name: string
  badge: 'continuous' | 'categorical' | 'derived' | 'flag'
  range: string
}

interface CardProps {
  title: string
  borderColor: string
  bgColor: string
  rows: ParameterRow[]
}

function badgeStyle(badge: ParameterRow['badge']): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    continuous: { bg: '#D1FAE5', color: '#065F46' },
    categorical: { bg: '#EDE9FE', color: '#4C1D95' },
    derived: { bg: '#FEF3C7', color: '#78350F' },
    flag: { bg: '#CFFAFE', color: '#164E63' },
  }
  const s = map[badge]
  return {
    backgroundColor: s.bg,
    color: s.color,
    padding: '1px 8px',
    borderRadius: '9999px',
    fontSize: 11,
    fontWeight: 500,
    display: 'inline-block',
    whiteSpace: 'nowrap',
  }
}

function ParamCard({ title, borderColor, bgColor, rows }: CardProps) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${borderColor}`,
        backgroundColor: bgColor,
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid #E2E8F0`,
        borderLeftColor: borderColor,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', color: '#94A3B8', fontWeight: 500, paddingBottom: 6, fontSize: 11 }}>Parameter</th>
            <th style={{ textAlign: 'center', color: '#94A3B8', fontWeight: 500, paddingBottom: 6, fontSize: 11 }}>Type</th>
            <th style={{ textAlign: 'right', color: '#94A3B8', fontWeight: 500, paddingBottom: 6, fontSize: 11 }}>Range / Formula</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
              <td style={{ padding: '5px 0', fontFamily: "'JetBrains Mono', monospace", color: '#1E293B', fontWeight: 500 }}>{row.name}</td>
              <td style={{ padding: '5px 4px', textAlign: 'center' }}>
                <span style={badgeStyle(row.badge)}>{row.badge}</span>
              </td>
              <td style={{ padding: '5px 0', textAlign: 'right', color: '#475569', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>{row.range}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Cell1DesignSpace({ cellState, onRunComplete }: { cellState: 'idle' | 'running' | 'complete'; onRunComplete: () => void }) {
  React.useEffect(() => {
    if (cellState !== 'running') return
    const t = setTimeout(onRunComplete, 600)
    return () => clearTimeout(t)
  }, [cellState, onRunComplete])

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Define the full parameter space for the flight vehicle aerodynamic database — 22 parameters
        across flight conditions, vehicle geometry, and control surfaces.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ParamCard
          title="A — Flight Conditions"
          borderColor="#2563EB"
          bgColor="#F8FAFC"
          rows={[
            { name: 'Mach', badge: 'continuous', range: '0.3 – 6.0' },
            { name: 'altitude_km', badge: 'continuous', range: '0 – 60 km' },
            { name: 'alpha_deg', badge: 'continuous', range: '−4° to +30°' },
            { name: 'beta_deg', badge: 'continuous', range: '−10° to +10°' },
            { name: 'Reynolds_regime', badge: 'categorical', range: 'laminar_transition, fully_turbulent' },
          ]}
        />
        <ParamCard
          title="B — Vehicle Configuration"
          borderColor="#0891B2"
          bgColor="#F8FAFC"
          rows={[
            { name: 'nose_radius_mm', badge: 'continuous', range: '20 – 120 mm' },
            { name: 'body_length_m', badge: 'continuous', range: '8 – 15 m' },
            { name: 'wing_sweep_deg', badge: 'continuous', range: '30° – 65°' },
            { name: 'wing_aspect_ratio', badge: 'continuous', range: '1.5 – 4.0' },
            { name: 'body_flap_chord_frac', badge: 'continuous', range: '0.05 – 0.20' },
          ]}
        />
        <ParamCard
          title="C — Control Surfaces"
          borderColor="#D97706"
          bgColor="#F8FAFC"
          rows={[
            { name: 'elevon_L_deg', badge: 'continuous', range: '−30° to +20°' },
            { name: 'elevon_R_deg', badge: 'continuous', range: '−30° to +20°' },
            { name: 'rudder_deg', badge: 'continuous', range: '−25° to +25°' },
            { name: 'body_flap_deg', badge: 'continuous', range: '−15° to +30°' },
            { name: 'speedbrake_pct', badge: 'continuous', range: '0 – 100 %' },
            { name: 'landing_gear', badge: 'flag', range: 'retracted, deployed' },
          ]}
        />
        <ParamCard
          title="D — Derived Quantities"
          borderColor="#7C3AED"
          bgColor="#F8FAFC"
          rows={[
            { name: 'q_inf_Pa', badge: 'derived', range: '½ρ(alt)V²' },
            { name: 'S_ref_m2', badge: 'derived', range: 'f(wing_span, chord)' },
            { name: 'L_ref_m', badge: 'derived', range: 'mean_aero_chord' },
            { name: 'b_ref_m', badge: 'derived', range: 'wing_span' },
            { name: 'Re_L', badge: 'derived', range: 'ρVL/μ' },
            { name: 'h_over_b', badge: 'derived', range: 'altitude_AGL / b_ref' },
          ]}
        />
      </div>
    </div>
  )
}
