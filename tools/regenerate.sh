#!/bin/bash
# QORA daily quantum oracle refresh
# Re-runs the 6-qubit circuit, regenerates data/quantum.json + the 4
# visualizations, commits, and pushes to main (Pages serves main directly).
set -euo pipefail

REPO="/Users/fathomers/workspace/qora-web"
PY="/Users/fathomers/.openclaw/workspace/qora/quantum-backend/venv/bin/python3"

cd "$REPO"

# Pull latest to avoid push rejection (cron + manual edits may diverge)
git pull --ff-only origin main 2>/dev/null || true

"$PY" tools/generate_quantum_data.py

# Commit + push (generator writes a timestamped run_id, so there's always a diff)
git add data/ assets/quantum/
git commit -m "Quantum oracle refresh $(date +%Y-%m-%d)" || echo "no changes to commit"
git push origin main

echo "--- REFRESH COMPLETE ---"
