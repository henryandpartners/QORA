# QORA-1 Physical Device — Bill of Materials (BOM)

**Project:** QORA (Quantum Organic Resonance Apparatus) — Physical Installation Device  
**Version:** 1.0 (Fabrication-Ready)  
**Author / Lab:** Henry Tan / Fathomers  

---

## 1. Electronics & Compute Core

| Item # | Component | Manufacturer / Part # | Function / Placement | Approx Cost (USD) | Sourcing Source |
|---|---|---|---|---|---|
| E01 | **ESP32-S3 Dev Module** | Espressif `ESP32-S3-DevKitC-1-N16R8` | 240MHz Dual-Core, 16MB Flash, 8MB PSRAM, WiFi/BLE. Main compute & quantum simulation engine. | $6.50 | DigiKey / Mouser / AliExpress |
| E02 | **11-Channel Spectrometer** | AMS / Adafruit `AS7341 Breakout` (PID 4698) | Measures 8-channel visible + Clear + NIR fluorescence from bio-cell. I2C @ 0x39. | $15.95 | Adafruit / DigiKey |
| E03 | **Time-of-Flight Presence Sensor** | STMicro `VL53L8CX` or `VL53L1X` Breakout | 8x8 multizone spatial detection (0.1–3.5m) to detect visitor approach and trigger quantum decoherence. | $14.50 | Pololu / Adafruit / AliExpress |
| E04 | **I2S Mono Class D Amplifier** | Maxim `MAX98357A Breakout` (Adafruit PID 2397) | 3.2W DAC/Amp drives 40Hz phonon acoustic transducer. I2S on GPIO 12/13/14. | $5.95 | Adafruit / DigiKey |
| E05 | **Tactile Resonator Transducer** | Dayton Audio `DAEX25FHE-4` (4Ω, 24W) | Bone-conduction tactile exciter bonded to base to physically generate 40Hz gamma / phonon bath. | $11.50 | Parts Express / Amazon |
| E06 | **Addressable RGBW Micro LEDs** | BTF-Lighting `SK6812 Mini-3535 RGBW` or `WS2812B 2020` | 24 individual micro optical emitters aligned beneath PMMA light guide conduits. | $7.00 | AliExpress / Amazon |
| E07 | **405nm Violet Laser Diode** | 100mW 405nm adjustable focus laser module | Soret band excitation (405nm) to pump chlorophyll-a ground state into fluorescent resonance. | $12.00 | Thorlabs / AliExpress |
| E08 | **USB-C PD 3.0 Trigger Board** | IP2721 / ZY12PDN | Negotiates 5V / 3A (or 9V) from any USB-C PD power bank or wall adapter. | $2.50 | AliExpress / Amazon |
| E09 | **Ultra-Low Noise LDO (3.3V)** | Diodes Inc `AP2112K-3.3` | Clean power for AS7341 spectrometry sensor (bypasses noisy digital rail). | $1.20 | DigiKey |
| E10 | **Decoupling Reservoir Capacitor** | Panasonic `1000µF 16V Low-ESR Radial` | Buffers high-transient bass pulses from the Dayton transducer. | $0.80 | DigiKey |

---

## 2. Optical Subsystem & Bio-Chamber

| Item # | Component | Material / Specs | Function / Placement | Approx Cost (USD) | Sourcing Source |
|---|---|---|---|---|---|
| O01 | **Quartz Bio-Cuvette** | Fused Quartz (JGS1) or Borosilicate 3.3 | Ø25.0 mm OD × Ø22.0 mm ID × 95.0 mm H. Optical transmission >90% down to 200nm. | $22.00 | Hellma / AliExpress Lab Glass |
| O02 | **Viton Sealing O-Rings** | Fluoroelastomer (Viton FKM) 75A | Ø22.0 mm ID × 2.5 mm CS. Solvent resistant (ethanol / glycerol bio-extracts). 4 pcs. | $3.00 | McMaster-Carr / Amazon |
| O03 | **End-Glow Optical Fiber** | PMMA Optical Grade Bare Fiber | Ø1.0 mm or Ø1.5 mm, numerical aperture NA=0.5. 24 lengths (approx 150mm each). | $8.00 | Fiber Optic Store / AliExpress |
| O04 | **Optical Cutoff Filter** | Schott `OG590` or `RG645` Longpass Filter | Ø15.0 mm × 2.0 mm. Sits in front of AS7341 to block scattered 405nm laser, passing pure >650nm fluorescence. | $18.00 | Thorlabs / Knight Optical |
| O05 | **Biological Sample (Chlorophyll-a)** | Organic *Spirulina platensis* or Spinach leaf extract | Extracted into 80% food-grade ethanol / vegetable glycerin. Highly fluorescent room-temp exciton medium. | $5.00 | Local botanical / health food |

---

## 3. Structural & Mechanical Hardware

| Item # | Component | Manufacturing Process | File Name / Spec | Approx Cost (USD) | Sourcing Source |
|---|---|---|---|---|---|
| M01 | **Base Enclosure Chassis** | CNC Machined 6061-T6 Aluminum (Black Anodized) or Bambu Lab PETG-CF | `model/stl/qora_base_enclosure.stl` (Ø200mm × 40mm) | $15–$45 | Local CNC / 3D Print |
| M02 | **Spun Brass Touch Ring** | C36000 Solid Architectural Brass (Mirror Polish + Clear Coat) | `model/stl/qora_brass_touch_ring.stl` (Ø204mm OD × 6mm) | $18.00 | Metal Lathe / SendCutSend |
| M03 | **Optical Separation Deck** | 3D Printed PETG or CNC Delrin/Acetal | `model/stl/qora_optical_deck.stl` (Ø184mm × 14mm) | $8.00 | 3D Print |
| M04 | **FMO 24-Node Chromophore Cage** | SLA / MSLA 3D Printed Tough 2000 or Siraya Tech Fast Navy | `model/stl/qora_fmo_chromophore_lattice.stl` (142×142×110mm) | $12.00 | Formlabs / Anycubic SLA |
| M05 | **Outer Crystalline Shroud** | High-Clarity SLA Resin (Formlabs Clear Resin V4 polished + UV clearcoat) | `model/stl/qora_outer_crystalline_shroud.stl` | $18.00 | Formlabs / Elegoo Saturn |
| M06 | **Brass Knurled Crown Nut** | Machined Brass M3 Knurled Thumbscrew | Fastens top cap; magnetic quick release for cuvette servicing. | $2.50 | McMaster-Carr |
| M07 | **Fasteners & Standoffs** | Black Stainless M3 Hex Socket Screws (M3×8, M3×12) + Brass Heat-Set Inserts | Internal structural anchoring. 20 pcs. | $4.00 | McMaster-Carr / Amazon |

---

## Total Estimated Cost:
- **Core DIY Build (3D-printed PETG + SLA resin):** ~$150 – $180 USD  
- **Museum / Exhibition Grade (CNC Anodized 6061 Aluminum + Fused Quartz):** ~$240 – $290 USD
