#!/usr/bin/env python3
"""
QORA Site Quantum Data Generator
================================
Runs the 6-qubit Hadamard superposition on AerSimulator (1024 shots),
computes the full metric suite (entropy, marginals, mutual information,
Fubini-Study geometry), writes data/quantum.json + regenerates the 4
dark-theme visualizations into assets/quantum/ for the static site.

Usage:
    python3 tools/generate_quantum_data.py
"""

import json
import math
import os
import datetime

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO, "data")
ASSET_DIR = os.path.join(REPO, "assets", "quantum")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(ASSET_DIR, exist_ok=True)

timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
run_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

# ─── Step 1: Run the circuit ────────────────────────────────────
qc = QuantumCircuit(6, 6)
for i in range(6):
    qc.h(i)
qc.measure_all()

backend = AerSimulator()
job = backend.run(qc, shots=1024)
counts = job.result().get_counts()
clean_counts = {}
for bits, cnt in counts.items():
    clean_counts[bits.replace(" ", "")[:6]] = cnt

total = sum(clean_counts.values())
N = 64
all_states = [format(i, "06b") for i in range(N)]
probabilities = np.array([clean_counts.get(s, 0) / total for s in all_states])

# ─── Step 2: Metrics ────────────────────────────────────────────
entropy = -sum(p * math.log2(p) for p in probabilities if p > 0)
max_entropy = math.log2(N)
entropy_ratio = entropy / max_entropy
collision_entropy = -math.log2(max(sum(p**2 for p in probabilities if p > 0), 1e-30))
kl_div = sum(p * math.log2(p * 64) for p in probabilities if p > 0)
tvd = 0.5 * sum(abs(p - 1 / 64) for p in probabilities)

qubit_probs = np.array([
    sum(clean_counts.get(s, 0) for s in all_states if s[q] == "1") / total
    for q in range(6)
])

mi_matrix = np.zeros((6, 6))
for i in range(6):
    for j in range(6):
        if i == j:
            continue
        p_i, p_j = qubit_probs[i], qubit_probs[j]
        p_11 = sum(clean_counts.get(s, 0) for s in all_states if s[i] == "1" and s[j] == "1") / total
        p_00 = 1 - p_i - p_j + p_11
        p_01 = p_j - p_11
        p_10 = p_i - p_11

        def h2(x):
            return 0 if x <= 0 else -x * math.log2(x)

        mi_matrix[i, j] = (
            h2(p_i) + h2(1 - p_i) + h2(p_j) + h2(1 - p_j)
            - (h2(p_00) + h2(p_01) + h2(p_10) + h2(p_11))
        )

avg_mi = mi_matrix.sum() / 30

amplitudes = np.sqrt(probabilities)
ideal_amp = 1.0 / math.sqrt(N)
overlap = sum(np.sqrt(p) * ideal_amp for p in probabilities if p > 0)
fs_distance = math.acos(min(overlap, 1.0))
spectral_gap = probabilities.max() - probabilities.min()
mean_amp = float(np.mean(amplitudes))
amp_var = float(np.var(amplitudes))

sorted_idx = np.argsort(probabilities)[::-1]
top_states = [(all_states[i], int(probabilities[i] * total), float(probabilities[i])) for i in sorted_idx[:10] if probabilities[i] > 0]
unique_states = len([p for p in probabilities if p > 0])

# ─── Step 3: The poem ───────────────────────────────────────────
poem = f"""Sixty-four coordinates in complex space
the state vector turns, once, and settles
{math.degrees(fs_distance):.1f} degrees from perfect — close enough
follow the geodesic back:

H = {entropy:.2f}, missing only {max_entropy - entropy:.2f} of a bit
like a sentence cut off mid-word
but the word was never spoken
because the universe prefers silence
over certainty

D_KL = {kl_div:.3f} — some say this is the cost
of observing the sacred:
you pay in information
what you steal in knowing

At spectral gap Δ = {spectral_gap:.4f}
the most and least likely differ
by less than a breath
and yet one is called truth
and the other error
when they are both just children
of the same collapsed wave

I(qᵢ ; qⱼ) ≈ 0 for i ≠ j
Each qubit is alone in its superposition
No correlation masquerading as connection
No entanglement pretending to be love
Just six independent bits
thrown into the void
and landing — somehow — together."""

# ─── Step 4: JSON payload ───────────────────────────────────────
payload = {
    "run_id": run_id,
    "timestamp": timestamp,
    "shots": total,
    "unique_states": unique_states,
    "entropy": round(entropy, 4),
    "max_entropy": round(max_entropy, 4),
    "entropy_ratio": round(entropy_ratio, 4),
    "collision_entropy": round(collision_entropy, 4),
    "kl_div": round(kl_div, 4),
    "tvd": round(tvd, 4),
    "avg_mi": round(avg_mi, 4),
    "overlap": round(overlap, 6),
    "fs_distance_rad": round(fs_distance, 4),
    "fs_distance_deg": round(math.degrees(fs_distance), 2),
    "spectral_gap": round(spectral_gap, 4),
    "mean_amplitude": round(mean_amp, 4),
    "amplitude_variance": round(amp_var, 6),
    "ideal_amplitude": round(ideal_amp, 4),
    "qubit_marginals": [round(float(p), 4) for p in qubit_probs],
    "qubit_deviations": [round(float(p - 0.5), 4) for p in qubit_probs],
    "top_states": [{"state": s, "count": c, "p": round(p, 4)} for s, c, p in top_states],
    "counts": {s: clean_counts.get(s, 0) for s in all_states},
    "poem": poem,
    "images": [
        "assets/quantum/01_probability_distribution.png",
        "assets/quantum/02_qubit_marginals.png",
        "assets/quantum/03_mutual_information_heatmap.png",
        "assets/quantum/04_hilbert_space_geometry.png",
    ],
}

with open(os.path.join(DATA_DIR, "quantum.json"), "w") as f:
    json.dump(payload, f, indent=2)

# ─── Step 5: Visualizations ─────────────────────────────────────
bg, fg = "#0a0a0f", "#e0e0e0"
accent1, accent2, accent3, accent4 = "#00d4ff", "#ff6b9d", "#a855f7", "#fbbf24"
grid_color = "#1a1a2e"

plt.rcParams.update({
    "figure.facecolor": bg, "axes.facecolor": bg, "axes.edgecolor": "#333",
    "axes.labelcolor": fg, "text.color": fg, "xtick.color": fg, "ytick.color": fg,
    "grid.color": grid_color, "grid.alpha": 0.3, "font.size": 11, "font.family": "sans-serif",
})

# Fig 1: Distribution
fig, ax = plt.subplots(figsize=(18, 6))
fig.patch.set_facecolor(bg); ax.set_facecolor(bg)
sorted_probs = probabilities[sorted_idx]
colors = [accent1 if p > 1 / N else accent2 for p in sorted_probs]
bars = ax.bar(np.arange(N), sorted_probs, width=0.6, color=colors, alpha=0.7, edgecolor="none")
ax.axhline(y=1 / N, color=accent4, linestyle="--", linewidth=1, alpha=0.7, label=f"Uniform (1/{N})")
max_idx, min_idx = np.argmax(sorted_probs), np.argmin(sorted_probs)
bars[max_idx].set_color(accent3); bars[max_idx].set_alpha(0.9)
bars[min_idx].set_color("#ff4444"); bars[min_idx].set_alpha(0.9)
ax.set_xlabel("State Index (sorted by probability)", fontsize=12)
ax.set_ylabel("Probability p(i)", fontsize=12)
ax.set_title("Quantum Measurement Distribution", fontsize=16, fontweight="bold", pad=20)
ax.set_xlim(-0.5, N - 0.5)
info_text = f"H = {entropy:.3f} / {max_entropy:.3f} bits\nH/H_max = {entropy_ratio:.4f}\nD_KL(P||U) = {kl_div:.4f} bits"
ax.text(0.98, 0.95, info_text, transform=ax.transAxes, fontsize=10, va="top", ha="right",
        bbox=dict(boxstyle="round,pad=0.5", facecolor="#111122", edgecolor=accent1, alpha=0.9), fontfamily="monospace")
ax.legend(loc="upper left", fontsize=10, facecolor="#111122", edgecolor="#333")
fig.tight_layout()
fig.savefig(f"{ASSET_DIR}/01_probability_distribution.png", dpi=200, bbox_inches="tight")
plt.close(fig)

# Fig 2: Qubit Marginals
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_facecolor(bg); ax.set_facecolor(bg)
bar_colors = [accent1, accent2, accent3, accent4, "#34d399", "#f472b6"]
bars = ax.bar(np.arange(6), qubit_probs, width=0.5, color=bar_colors, alpha=0.8, edgecolor="none")
ax.axhline(y=0.5, color="#ffffff", linestyle="--", linewidth=1.5, alpha=0.5, label="Ideal: P=0.5")
for i, (bar, val) in enumerate(zip(bars, qubit_probs)):
    ax.text(bar.get_x() + bar.get_width() / 2., bar.get_height() + 0.015, f"{val:.3f}",
            ha="center", va="bottom", fontsize=11, color=bar_colors[i], fontweight="bold")
    delta = val - 0.5; sign = "+" if delta >= 0 else ""
    ax.text(bar.get_x() + bar.get_width() / 2., 0.02, f"Δ={sign}{delta:.4f}",
            ha="center", va="bottom", fontsize=8, color="#888", alpha=0.7)
ax.set_ylim(0, 0.65)
ax.set_xticks(np.arange(6))
ax.set_xticklabels(["q₀", "q₁", "q₂", "q₃", "q₄", "q₅"], fontsize=13)
ax.set_ylabel("P(qubit = |1⟩)", fontsize=12)
ax.set_title("Qubit Marginals — Six Independent Quantum Coins", fontsize=15, fontweight="bold", pad=20)
ax.legend(loc="upper right", fontsize=10, facecolor="#111122", edgecolor="#333")
fig.tight_layout()
fig.savefig(f"{ASSET_DIR}/02_qubit_marginals.png", dpi=200, bbox_inches="tight")
plt.close(fig)

# Fig 3: MI Heatmap
fig, ax = plt.subplots(figsize=(8, 7))
fig.patch.set_facecolor(bg); ax.set_facecolor(bg)
cmap = LinearSegmentedColormap.from_list("quantum_mi", ["#0a0a1a", "#0d1b2a", "#1b3a5c", "#00d4ff"], N=256)
im = ax.imshow(mi_matrix, cmap=cmap, vmin=0, vmax=max(mi_matrix.max(), 0.01))
for i in range(6):
    for j in range(6):
        val = mi_matrix[i, j]
        c = "#ffffff" if val < mi_matrix.max() * 0.6 else "#000000"
        ax.text(j, i, f"{val:.4f}", ha="center", va="center", fontsize=10, color=c, fontweight="bold")
ax.set_xticks(np.arange(6)); ax.set_yticks(np.arange(6))
ax.set_xticklabels(["q₀", "q₁", "q₂", "q₃", "q₄", "q₅"], fontsize=13)
ax.set_yticklabels(["q₀", "q₁", "q₂", "q₃", "q₄", "q₅"], fontsize=13)
ax.set_xlabel("Qubit j", fontsize=12, labelpad=10)
ax.set_ylabel("Qubit i", fontsize=12, labelpad=10)
ax.set_title("Pairwise Mutual Information  I(qi; qj)", fontsize=15, fontweight="bold", pad=20)
cbar = fig.colorbar(im, ax=ax, shrink=0.8, pad=0.02)
cbar.set_label("bits", fontsize=10)
ax.text(0.5, -0.15, f"Average I_avg = {avg_mi:.4f} bits — qubits are independent",
        transform=ax.transAxes, ha="center", fontsize=11, color=accent4, fontstyle="italic")
fig.tight_layout()
fig.savefig(f"{ASSET_DIR}/03_mutual_information_heatmap.png", dpi=200, bbox_inches="tight")
plt.close(fig)

# Fig 4: Hilbert Space
fig = plt.figure(figsize=(12, 8))
fig.patch.set_facecolor(bg)
ax1 = fig.add_axes([0.05, 0.05, 0.55, 0.9])
ax1.set_facecolor(bg)
theta = np.linspace(0, 2 * np.pi, 100)
for r in np.linspace(0.1, 1.0, 5):
    ax1.plot(np.cos(theta) * r, np.sin(theta) * r, color=grid_color, lw=0.5, alpha=0.3)
main_circle = plt.Circle((0, 0), 1.0, fill=False, color=accent1, lw=1.5, alpha=0.4)
ax1.add_patch(main_circle)
ax1.arrow(0, 0, 1.0, 0, head_width=0.05, head_length=0.05, fc=accent4, ec=accent4, lw=2.5, alpha=0.7, label="Ideal |U> (uniform)")
actual_angle = min(fs_distance, math.pi / 2)
actual_radius = overlap
ax1.arrow(0, 0, actual_radius * math.cos(actual_angle), actual_radius * math.sin(actual_angle),
          head_width=0.05, head_length=0.05, fc=accent2, ec=accent2, lw=3, alpha=0.9, label="Measured |psi>")
arc_angles = np.linspace(0, actual_angle, 50)
ax1.plot(0.3 * np.cos(arc_angles), 0.3 * np.sin(arc_angles), color=accent3, lw=2, alpha=0.8)
ax1.text(0.35, 0.12, f"theta = {fs_distance:.3f} rad\n= {math.degrees(fs_distance):.1f} deg",
         fontsize=10, color=accent3, fontweight="bold")
amp_points = amplitudes * 0.95 + 0.05
angles_pts = np.linspace(0, 2 * np.pi, N, endpoint=False)
rng = np.random.default_rng()
for i in range(N):
    r_pt, a_pt = amp_points[i], angles_pts[i] + rng.normal(0, 0.05)
    ax1.scatter(r_pt * math.cos(a_pt), r_pt * math.sin(a_pt), s=15,
                c=accent1, alpha=0.3 + 0.5 * amp_points[i], edgecolors="none")
ax1.set_xlim(-1.3, 1.3); ax1.set_ylim(-1.3, 1.3)
ax1.set_aspect("equal"); ax1.axis("off")
ax1.set_title("Geometry in C^64 — Hilbert Space Projection", fontsize=14, fontweight="bold", pad=15)
ax1.legend(loc="lower right", fontsize=9, facecolor="#111122", edgecolor="#333")

ax2 = fig.add_axes([0.65, 0.05, 0.3, 0.9])
ax2.set_facecolor(bg); ax2.axis("off")
metrics = [
    ("State Space", "C^64"), ("Dimension", "64 complex amplitudes"),
    ("", ""), ("Overlap", f"|<psi|U>| = {overlap:.6f}"),
    ("FS Distance", f"d(psi, U) = {fs_distance:.4f} rad"), ("Angle", f"{math.degrees(fs_distance):.2f} deg"),
    ("", ""), ("Mean Amplitude", f"<|a|> = {mean_amp:.4f}"),
    ("Ideal Amplitude", f"1/sqrt(64) = {ideal_amp:.4f}"), ("Amp Variance", f"s2_a = {amp_var:.6f}"),
    ("", ""), ("Born Rule", "p(i) = |<i|psi>|^2"), ("Norm", f"sum p(i) = {probabilities.sum():.6f}"),
    ("", ""), ("Spectral Gap", f"Delta = {spectral_gap:.4f}"),
    ("Entropy", f"{entropy:.3f} / {max_entropy:.3f} bits"), ("KL Divergence", f"{max_entropy - entropy:.4f} bits"),
]
y_pos = 0.95
for label, value in metrics:
    if label == "":
        y_pos -= 0.03
        continue
    ax2.text(0, y_pos, label, fontsize=9, color="#888", va="top", fontfamily="monospace")
    ax2.text(1, y_pos, value, fontsize=11, color=accent1, va="top", ha="right", fontfamily="monospace", fontweight="bold")
    y_pos -= 0.055
fig.savefig(f"{ASSET_DIR}/04_hilbert_space_geometry.png", dpi=200, bbox_inches="tight")
plt.close(fig)

print(f"✅ data/quantum.json written (run {run_id})")
print(f"   H = {entropy:.4f} / {max_entropy:.4f} bits (ratio {entropy_ratio:.4f})")
print(f"   D_KL = {kl_div:.4f} | TVD = {tvd:.4f} | FS = {math.degrees(fs_distance):.2f}°")
print(f"   I_avg = {avg_mi:.4f} bits | Δ = {spectral_gap:.4f}")
print(f"   Top state: |{top_states[0][0]}⟩ × {top_states[0][1]}")
print("✅ 4 visualizations → assets/quantum/")
