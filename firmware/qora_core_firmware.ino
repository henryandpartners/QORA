/*
 * QORA-1 — Quantum Organic Resonance Apparatus
 * Firmware for ESP32-S3 (Dual-Core LX7 @ 240MHz)
 * 
 * Hardware Configuration:
 * - Microcontroller: ESP32-S3-WROOM-1 (16MB Flash, 8MB Octal PSRAM)
 * - Spectrometer: AMS AS7341 11-Channel (I2C: SDA GPIO 8, SCL GPIO 9, Addr 0x39)
 * - Presence Matrix: VL53L8CX / VL53L1X ToF (I2C: SDA GPIO 8, SCL GPIO 9)
 * - Optical Nodes: 24x SK6812 RGBW Micro-LEDs (GPIO 48)
 * - Laser Diode: 405nm UV-Violet (GPIO 2, 5kHz PWM)
 * - Touch Ring: Brass Resonator Contact (Touch Pin T1 / GPIO 1)
 * - Haptic Audio: MAX98357A I2S DAC (BCLK GPIO 12, LRCK GPIO 13, DOUT GPIO 14)
 *   driving Dayton Audio DAEX25FHE-4 Transducer (40Hz Phonon Bath)
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_NeoPixel.h>
#include <driver/i2s.h>
#include <math.h>

// ─── Pin Configurations ──────────────────────────────────────────
#define PIN_I2C_SDA        8
#define PIN_I2C_SCL        9
#define PIN_LASER_PWM      2
#define PIN_TOUCH_RING     1
#define PIN_LED_DATA       48
#define PIN_I2S_BCLK       12
#define PIN_I2S_LRCK       13
#define PIN_I2S_DOUT       14

#define NUM_FMO_NODES      24
#define LASER_PWM_CHANNEL  0
#define LASER_PWM_FREQ     5000
#define LASER_PWM_RES      8

// ─── Optical & Lighting Engine ──────────────────────────────────
Adafruit_NeoPixel strip(NUM_FMO_NODES, PIN_LED_DATA, NEO_GRBW + NEO_KHZ800);

// ─── Quantum & Exciton State Variables ──────────────────────────
struct ExcitonState {
  float populations[NUM_FMO_NODES]; // Real populations on 24 BCL nodes
  float phase[NUM_FMO_NODES];       // Coherent phase across trimer
  float global_coherence;           // 0.0 (Decoherent) to 1.0 (Pure Coherence)
  float observer_distance;          // Distance in meters from ToF
  bool  is_touching;                // Galvanic contact flag
  uint32_t last_update;
};

ExcitonState g_state;

// ─── Audio I2S & 40Hz Phonon Synthesizer ────────────────────────
#define I2S_NUM            I2S_NUM_0
#define SAMPLE_RATE        44100
#define AUDIO_BUF_SIZE     256

TaskHandle_t TaskQuantumHandle;
TaskHandle_t TaskAudioHandle;

// Precalculated sine wave for 40Hz phonon mode
float g_audio_phase = 0.0f;

void init_i2s() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = AUDIO_BUF_SIZE,
    .use_apll = false,
    .tx_desc_auto_clear = true,
    .fixed_mclk = 0
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = PIN_I2S_BCLK,
    .ws_io_num = PIN_I2S_LRCK,
    .data_out_num = PIN_I2S_DOUT,
    .data_in_num = I2S_PIN_NO_CHANGE
  };

  i2s_driver_install(I2S_NUM, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM, &pin_config);
}

// ─── Core 1 Audio Task: 40Hz Phonon Tactile Drone ────────────────
void task_audio_engine(void *pvParameters) {
  int16_t buffer[AUDIO_BUF_SIZE * 2];
  size_t bytes_written;

  while (true) {
    float coherence = g_state.global_coherence;
    float base_freq = 40.0f; // 40Hz Gamma frequency

    // When decoherent, add entropy distortion & noise
    for (int i = 0; i < AUDIO_BUF_SIZE; i++) {
      float dt = 1.0f / SAMPLE_RATE;
      g_audio_phase += 2.0f * M_PI * base_freq * dt;
      if (g_audio_phase >= 2.0f * M_PI) g_audio_phase -= 2.0f * M_PI;

      // Clean sine wave in coherent mode
      float sample = sinf(g_audio_phase);

      // Add harmonic overtones + decoherence noise if collapsed
      if (coherence < 0.4f) {
        float noise = ((float)rand() / (float)RAND_MAX - 0.5f) * 0.4f;
        sample = sample * 0.6f + noise * (1.0f - coherence);
      }

      int16_t sample_int = (int16_t)(sample * 16000.0f);
      buffer[i * 2]     = sample_int; // Left
      buffer[i * 2 + 1] = sample_int; // Right
    }

    i2s_write(I2S_NUM, buffer, sizeof(buffer), &bytes_written, portMAX_DELAY);
  }
}

// ─── Core 0 Quantum Simulation Task (60 FPS) ────────────────────
void task_quantum_simulation(void *pvParameters) {
  strip.begin();
  strip.setBrightness(180);
  strip.show();

  float t = 0.0f;

  while (true) {
    t += 0.035f;

    // 1. Read Capacitive Touch Ring
    int touch_val = touchRead(PIN_TOUCH_RING);
    g_state.is_touching = (touch_val < 30); // Touch threshold

    // 2. Compute Observer Effect & Coherence
    // Simulated reading or ToF read
    float d = g_state.observer_distance;
    float dist_norm = (d - 0.2f) / 2.3f;
    if (dist_norm < 0.0f) dist_norm = 0.0f;
    if (dist_norm > 1.0f) dist_norm = 1.0f;

    if (g_state.is_touching) {
      g_state.global_coherence = 0.05f; // Hard collapse upon physical touch
    } else {
      g_state.global_coherence = powf(dist_norm, 0.75f);
    }

    float coh = g_state.global_coherence;

    // 3. Update 24 FMO Chromophore Populations (Lindblad approximation)
    for (int i = 0; i < NUM_FMO_NODES; i++) {
      int subunit = i / 8; // 3 subunits of 8 BCLs
      int bcl_idx = i % 8;

      if (coh >= 0.35f) {
        // Coherent wavepacket flowing synchronously across trimer
        float phase = t * 2.8f - bcl_idx * 0.75f + subunit * (2.0f * M_PI / 3.0f);
        float pop = 0.5f + 0.5f * sinf(phase);
        g_state.populations[i] = pop;

        // Color: Pure Coherent Cyan-Emerald (#00e5a0)
        uint8_t r = (uint8_t)(pop * 0);
        uint8_t g = (uint8_t)(pop * 229);
        uint8_t b = (uint8_t)(pop * 160);
        uint8_t w = (uint8_t)(pop * 40);
        strip.setPixelColor(i, strip.Color(r, g, b, w));
      } else {
        // Decoherent State: Chaotic localized energy spikes & red/amber glow
        float jitter = (float)rand() / (float)RAND_MAX;
        g_state.populations[i] = jitter;

        // Color: Decoherent Ruby Crimson (#ff0055) to Amber (#ff6b35)
        uint8_t r = (uint8_t)(jitter * 255);
        uint8_t g = (uint8_t)(jitter * 20);
        uint8_t b = (uint8_t)(jitter * 45);
        uint8_t w = 0;
        strip.setPixelColor(i, strip.Color(r, g, b, w));
      }
    }

    strip.show();

    // 4. Modulate 405nm Laser Diode
    // Increase pump intensity slightly when coherent to demonstrate Stokes shift
    uint8_t laser_duty = coh >= 0.35f ? 190 : 80;
    ledcWrite(PIN_LASER_PWM, laser_duty);

    vTaskDelay(pdMS_TO_TICKS(16)); // ~60 FPS
  }
}

// ─── Setup ───────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL, 400000);

  // Configure Laser PWM
  ledcAttach(PIN_LASER_PWM, LASER_PWM_FREQ, LASER_PWM_RES);
  ledcWrite(PIN_LASER_PWM, 150);

  // Initialize State
  g_state.global_coherence = 0.95f;
  g_state.observer_distance = 2.5f;
  g_state.is_touching = false;

  // Initialize Audio I2S
  init_i2s();

  Serial.println(F("=================================================="));
  Serial.println(F(" QORA-1 — Quantum Organic Resonance Apparatus"));
  Serial.println(F(" Hardware Initialized • Core 0: Quantum | Core 1: I2S"));
  Serial.println(F("=================================================="));

  // Spawn Core 1 Audio Task
  xTaskCreatePinnedToCore(
    task_audio_engine,
    "AudioPhononTask",
    4096,
    NULL,
    2,
    &TaskAudioHandle,
    1 // Pin to Core 1
  );

  // Spawn Core 0 Quantum Simulation Task
  xTaskCreatePinnedToCore(
    task_quantum_simulation,
    "QuantumSimTask",
    8192,
    NULL,
    1,
    &TaskQuantumHandle,
    0 // Pin to Core 0
  );
}

// ─── Main Loop (Telemetry & Sensor Polling) ─────────────────────
void loop() {
  // Read Distance Sensor (Simulated or Real I2C read)
  // Example I2C polling every 50ms:
  static uint32_t last_poll = 0;
  if (millis() - last_poll > 50) {
    last_poll = millis();
    // In production: read VL53L8CX / VL53L1X distance register
    // g_state.observer_distance = read_distance_sensor();
  }

  delay(10);
}
