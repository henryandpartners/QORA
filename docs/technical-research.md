# QORA: Technical Research

## Biological Quantum Computing: State of the Art

### What We Know Is Real

**Quantum Coherence in Photosynthesis** (Engel et al., 2007, Nature)
- 2D electronic spectroscopy revealed long-lived (~660 fs) quantum coherence in the FMO complex of green sulfur bacteria (*Chlorobaculum tepidum*)
- Excitons explore multiple energy transfer pathways simultaneously (quantum walk)
- Results in near-100% energy transfer efficiency
- This is **room-temperature quantum coherence** in a biological system — the foundational evidence for QORA's scientific plausibility

**Quantum Effects in Enzyme Catalysis**
- Proton tunneling in enzymes (e.g., aromatic amine oxidase) demonstrates quantum behavior in biological reactions
- Electron transfer via tunneling is fundamental to respiration and photosynthesis
- These are not edge cases — they are core biochemical mechanisms

**Radical Pair Mechanism & Magnetoreception**
- European robins navigate using quantum entanglement in cryptochrome proteins in their eyes
- Spin-correlated radical pairs maintain quantum coherence for microseconds at physiological temperatures
- This is quantum sensing in a living animal, evolved naturally

**Olfactory Tunneling Theory** (Turin, 1996; Luca Turin)
- Smell may work via electron tunneling through odorant molecules
- The nose detects molecular vibrations, not just shapes
- If confirmed, this is another quantum sense operating at room temperature

### What Is Speculative (But Plausible)

**Protein-Based Qubits**
- Aromatic amino acid chains (tryptophan, phenylalanine, tyrosine) have π-electron systems that could theoretically support qubit states
- The π-stacking in protein secondary structures creates extended electron clouds
- Hypothesis: engineered protein scaffolds could host addressable qubit states via optical control

**Phonon Isolation in Proteins**
- Proteins have internal vibrational modes (phonons) that could be engineered to *protect* rather than destroy coherence
- Instead of fighting the thermal bath, couple the qubit to specific phonon modes (phonon-mediated coherence)
- This is the core innovation of QORA: proteins as quantum error correction, not quantum decoherence

**DNA as Quantum Wire**
- DNA base stacking creates π-π orbital overlap → possible electron transport pathway
- Some evidence of long-range charge transfer in DNA (up to 34 nm)
- Speculative: could DNA nanostructures serve as qubit interconnects?

### What Is Pure Speculation (Art Territory)

**Room-Temperature Biological Quantum Computer**
- No one has demonstrated a programmable, addressable biological quantum processor
- The coherence times observed in biology are femtoseconds to microseconds — far short of what's needed for computation
- BUT: art doesn't need to build a working quantum computer. It needs to make the *possibility* tangible.

---

## Key Proteins & Complexes for QORA

### Fenna-Matthews-Olson (FMO) Complex
- **PDB:** 3ENI, 5BOP
- **Function:** Excitonic energy transfer in green sulfur bacteria
- **Why:** First biological system where quantum coherence was observed
- **Structure:** Trimer, each monomer has 7-8 bacteriochlorophyll molecules
- **Visual:** Beautiful 3D structure, perfect for sculpture

### Photosystem II (PSII)
- **PDB:** 3WU2, 4UB6
- **Function:** Water splitting in oxygenic photosynthesis
- **Why:** Contains Mn4CaO5 cluster — a metal center that may use quantum effects
- **Visual:** Massive complex (~700 kDa), visually striking

### Cryptochrome
- **PDB:** 1R36, 6JQW
- **Function:** Blue light photoreceptor, magnetoreception via radical pairs
- **Why:** Quantum entanglement in a protein that animals use to navigate
- **Visual:** Compact, elegant structure with FAD cofactor

### Microtubules
- **PDB:** Various tubulin structures
- **Function:** Cytoskeleton, intracellular transport
- **Why:** Penrose-Hameroff "Orch OR" theory of consciousness (controversial but visually and conceptually rich)
- **Visual:** Beautiful cylindrical arrays

---

## Visualization Technology

### Real-Time Quantum Simulation
- **Shadertoy/WebGL:** GPU-accelerated particle systems for exciton visualization
- **OpenFermion / Qiskit:** Real quantum simulation (not just aesthetic) — could run actual quantum circuits and visualize the output
- **Three.js:** 3D rendering of protein structures with particle overlays

### Protein Structure Visualization
- **PyMOL / ChimeraX:** Standard structural biology visualization tools
- **NGL Viewer:** WebGL-based protein viewer — could embed in web experience
- **Mol*:** Modern molecular visualization, high-quality rendering

### Sensor Integration
- **Azure Kinect DK:** Depth camera for visitor tracking (up to 6 people simultaneously)
- **Intel RealSense:** Alternative depth camera, lower cost
- **Microphone array:** Ambient sound analysis for audio-reactive elements

---

## Living Culture Component

### Organism Selection
| Organism | Pros | Cons |
|----------|------|------|
| *Synechocystis* sp. PCC 6803 | Model organism, well-studied, transforms easily | Requires sterile conditions |
| *Spirulina* (Arthrospira) | Easy to culture, safe, visually striking | Less studied for quantum effects |
| *Chlamydomonas reinhardtii* | Model green alga, chloroplast quantum effects known | Motile (swims), harder to contain |
| *Prochlorococcus* | Most abundant photosynthetic organism on Earth | Hard to culture |

**Recommendation:** *Synechocystis* — model organism with extensive quantum biology literature.

### Fluorescence Imaging
- **Excitation:** Blue LED (450-470 nm)
- **Emission:** Red fluorescence (680-700 nm) from chlorophyll
- **Camera:** Modified webcam with long-pass filter (>650 nm)
- **Processing:** OpenCV for real-time image analysis → data feed to visualization

---

## Key Papers to Read

1. Engel, G.S. et al. (2007). "Evidence for wavelike energy transfer through quantum coherence in photosynthetic systems." *Nature* 446:782–786.
2. Collini, E. et al. (2010). "Coherently wired light-harvesting in photosynthetic marine algae at ambient temperature." *Nature* 463:644–647.
3. Lambert, N. et al. (2013). "Quantum biology." *Nature Physics* 9:10–18.
4. Huelga, S.F. & Plenio, M.B. (2013). "Vibrations, quanta and life." *Contemporary Physics* 54:181–207.
5. Gauger, E.M. et al. (2011). "Sensitivity of magnetic compass to weak radio frequency fields." *Physical Review Letters* 106:040503.
6. Cai, J., Caruso, F. & Plenio, M.B. (2010). "Does the magnetic sense exploit quantum effects?" *Physical Review Letters* 104:220401.
7. Scholes, G.D. et al. (2017). "Using coherence to enhance function in chemical and biophysical systems." *Nature* 543:647–656.
8. Lambert, N. et al. (2013). "Quantum bio-mimicry: from photosynthesis to artificial light-harvesting."

---

## Feasibility Assessment

| Claim | Scientific Status | Art Viability |
|-------|------------------|---------------|
| Quantum coherence in biology | ✅ Proven (FMO, cryptochrome) | High |
| Room-temperature quantum states | ✅ Proven (photosynthesis, magnetoreception) | High |
| Protein-based qubits | ⚠️ Theoretical, some evidence | Medium (as art concept) |
| Biological quantum computer | ❌ Not demonstrated | High (as speculation/art) |
| Quantum consciousness (Orch OR) | ❌ Highly controversial | Medium (provocative but risky) |

**Bottom line:** The science of quantum biology is real and well-documented. The leap to a biological quantum computer is speculative — but that's exactly where art lives. QORA uses established science as its foundation and speculation as its creative territory.

---

*Created: 2026-05-27*
*Status: Initial research compilation*
