# QORA-1 Physical Fabrication & Assembly Guide

**Quantum Organic Resonance Apparatus — Real-Life Device Build Manual**  
**Author:** Henry Tan / Fathomers  
**Target Build:** Single Desktop / Pedestal Physical Installation Artifact  

---

## 1. Fabrication Strategy & 3D Printing

All 3D manufacturing files are located in `/Users/fathomers/workspace/qora-device/model/stl/`.

### Component Printing Matrix

| Part Name | Recommended Process | Material | Infill / Layer Height | Notes |
|---|---|---|---|---|
| `qora_base_enclosure.stl` | FDM (Bambu Lab / Prusa) or CNC | Bambu PETG-CF or Black Anodized 6061 Aluminum | 25% Gyroid, 0.16mm layer | Rigid foundation to transfer vibrations from Dayton transducer. |
| `qora_brass_touch_ring.stl` | Metal Lathe / Waterjet | Solid C36000 Brass | Solid metal | Polished mirror finish; wired to ESP32 touch pin. |
| `qora_optical_deck.stl` | FDM / SLS | Matte Black PETG or Delrin | 100% solid, 0.12mm layer | Optical barrier preventing internal LED light bleed into spectrometer. |
| `qora_fmo_chromophore_lattice.stl` | SLA / MSLA Resin | Formlabs Tough 2000 or Siraya Tech Fast Navy | 50µm layer, oriented at 45° | Contains the 24 BCL reaction nodes and internal fiber-routing channels. Post-cure thoroughly. |
| `qora_outer_crystalline_shroud.stl` | SLA Resin | High-Clarity Clear Resin (Formlabs Clear V4 or Anycubic Water-Wash) | 50µm layer | After washing, spray with 2K automotive clearcoat for optical glass transparency. |
| `qora_quartz_bio_cell.stl` | Reference CAD | Fused Quartz Tube (JGS1) | N/A (Off-the-shelf) | 25mm OD × 22mm ID × 95mm H quartz tube. |

---

## 2. Optical Sample Preparation (Living Quantum Substrate)

To achieve room-temperature quantum biological fluorescence and exciton resonance:

### Option A: Organic Chlorophyll-a Extract (Easiest & Dramatic Visual)
1. **Source:** 20g fresh baby spinach leaves or organic *Spirulina platensis* powder.
2. **Extraction:**
   - Macerate leaves in a mortar with 50mL of 80% food-grade ethanol or pure vegetable glycerin.
   - Filter through a fine coffee filter (0.2µm PTFE syringe filter recommended for optical clarity).
3. **Fluorescence Verification:**
   - In daylight, the solution appears deep emerald green.
   - When illuminated with a 405nm violet beam, the solution will instantly glow **blood-red ruby (668nm)** via the Stokes shift.
4. **Loading the Cuvette:**
   - Fill the quartz tube to 80% volume (~35mL).
   - Seat top and bottom with Viton O-rings to prevent evaporation and solvent degradation.

### Option B: Living Cyanobacteria Culture
- For long-term living installations, fill the cell with a culture of *Synechococcus elongatus* or *Spirulina* suspended in BG-11 growth medium. Under gentle 405nm pulsed excitation, the cyanobacteria continue photosynthesizing and fluctuating in real time.

---

## 3. Electronics & Wiring Assembly

1. **Base Foundation Sub-Assembly:**
   - Mount the **Dayton Audio DAEX25FHE-4** transducer to the center boss of the `qora_base_enclosure.stl` using 3M structural thermal adhesive tape.
   - Install the **USB-C PD trigger board** into the rear port cutout.
   - Fasten the **ESP32-S3 DevKit** and **MAX98357A I2S amplifier** to internal M3 brass standoffs.

2. **Optical Deck & Emitter Ring:**
   - Install the 24 **SK6812 RGBW micro-LEDs** onto the underside of `qora_optical_deck.stl`.
   - Insert 24 lengths of **1.0mm PMMA optical fiber** into the LED apertures, securing each with optical clear UV glue.
   - Route each fiber strand upward through the designated conduits in `qora_fmo_chromophore_lattice.stl` until the tip terminates flush inside each BCL sphere node.

3. **Spectrometer & Laser Alignment:**
   - Mount the **AS7341 breakout** into the 90° optical cradle on the optical deck.
   - Insert the **OG590 optical filter** (or 650nm long-pass) between the cuvette and the AS7341 aperture.
   - Press-fit the **405nm laser diode module** into the bottom vertical borehole, aligned dead-center through the quartz tube bottom.

4. **Touch Ring & Outer Shroud:**
   - Slip the **spun brass touch ring** over the base chassis perimeter and solder a single lead wire directly to ESP32 Touch Pin T1 (GPIO 1).
   - Lower the `qora_outer_crystalline_shroud.stl` over the assembly and secure the top cap with the knurled brass M3 crown thumbscrew.

---

## 4. Software Setup & Flashing

1. Open `firmware/qora_core_firmware.ino` in Arduino IDE or VS Code PlatformIO.
2. Select Board: **ESP32S3 Dev Module**
   - Flash Size: 16MB
   - Partition Scheme: 16MB (3MB APP / 9MB FATFS)
   - PSRAM: OPI PSRAM
   - CPU Frequency: 240MHz
3. Install Libraries:
   - `Adafruit NeoPixel`
   - `Adafruit AS7341`
4. Connect via USB-C and flash firmware.
5. Open Serial Monitor @ 115200 baud to verify sensor telemetry and 60 FPS quantum loop.

---

## 5. Exhibition & Experience Setup

- **Placement:** Position the device on a waist-height pedestal (approx. 90–100cm height) in a dimly lit gallery or room.
- **Ambient Lighting:** Keep ambient light low (subdued warm tungsten or darkness) so the deep violet laser and 668nm ruby fluorescence are intensely visible through the translucent crystalline shroud.
- **Visitor Experience:**
  - **Distance > 2.0m:** The device glows in synchronized, smooth cyan-emerald waves, vibrating gently at 40Hz (gamma coherence).
  - **Visitor Approaches (< 0.8m):** The ToF sensor detects spatial invasion; quantum coherence cascades downward.
  - **Visitor Touches Brass Ring:** Direct bio-impedance triggers an instantaneous collapse: the 24 BCL nodes flash chaotic crimson/amber, the 405nm excitation spikes, and the tactile transducer buzzes with decoherence entropy.
