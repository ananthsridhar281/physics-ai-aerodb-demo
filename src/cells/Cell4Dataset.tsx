import React from 'react'
import CodeBlock from '../components/CodeBlock'
import TrainingLog from '../components/TrainingLog'

const datasetCode = `import luminary_sdk as lm

# Connect to project
project = lm.Project.get("p-aerodb-rlv-2026")

# Fetch completed simulation runs
runs = project.runs.list(
    status=["completed"],
    tags=["aerodb-doe-batch-1"],
)
print(f"Found {len(runs)} runs")

# Build scalar output list
scalar_outputs = [
    "CL", "CD", "CY", "Cl", "Cm", "Cn",
    "LD_ratio", "Xcp_norm",
    "CL_alpha", "Cm_alpha", "Cn_beta",
    "Cl_beta", "Cm_q", "Cl_p", "Cn_r",
]

# Surface fields to include
surface_fields = [
    "pressure_coeff",
    "skin_friction_x", "skin_friction_y", "skin_friction_z",
    "heat_flux_W_m2",
]

# Create Physics AI dataset
dataset = lm.PhysicsAI.Dataset.create(
    project_id="p-aerodb-rlv-2026",
    run_ids=[r.id for r in runs],
    scalar_outputs=scalar_outputs,
    surface_fields=surface_fields,
    name="aerodb-rlv-2026-v1",
)
print(f"Dataset created: {dataset.id}")`

const logLines = [
  'Connecting to project p-aerodb-rlv-2026...',
  'Authentication OK — workspace: luminary-aero',
  'Found 800 simulation runs (796 completed, 4 failed/canceled)',
  'Building case list with 13 scalar parameters...',
  'Validating parameter bounds and uniqueness...',
  'Fetching surface fields: pressure_coeff...',
  'Fetching surface fields: skin_friction_x/y/z...',
  'Fetching surface fields: heat_flux_W_m2...',
  'Processing 796 cases × 5 surface fields...',
  'Creating Physics AI dataset...',
  'Dataset created: ds-r7k4m2n8p1',
  '796 cases, 5 surface fields, 15 scalar parameters',
  'Dataset validation passed — no NaN values detected',
]

interface Props {
  cellState: 'idle' | 'running' | 'complete'
  onRunComplete: () => void
}

export default function Cell4Dataset({ cellState, onRunComplete }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Connect to the Luminary project, fetch completed RANS/Euler runs, and assemble a Physics AI
        dataset with surface fields and scalar outputs.
      </p>
      <CodeBlock code={datasetCode} />

      {(cellState === 'running' || cellState === 'complete') && (
        <div className="mt-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Log Output</div>
          <TrainingLog
            lines={logLines}
            delayMs={250}
            onComplete={onRunComplete}
            accentColor="#0891B2"
          />
        </div>
      )}
    </div>
  )
}
