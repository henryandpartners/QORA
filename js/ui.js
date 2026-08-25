/**
 * UI module — coherence meter, mode display, controls hint.
 */

export function setupUI() {
  const coherenceFill = document.getElementById('coherence-fill');
  const coherenceValue = document.getElementById('coherence-value');
  const modeLabel = document.getElementById('mode-label');
  const modeDesc = document.getElementById('mode-desc');
  const controlsHint = document.getElementById('controls-hint');

  // Fade controls hint after 8 seconds
  setTimeout(() => {
    controlsHint.style.opacity = '0';
    setTimeout(() => { controlsHint.style.display = 'none'; }, 2000);
  }, 10000);

  // Show hint on any interaction
  let hintTimeout;
  const showHint = () => {
    controlsHint.style.opacity = '0.5';
    controlsHint.style.display = 'block';
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => {
      controlsHint.style.opacity = '0';
      setTimeout(() => { controlsHint.style.display = 'none'; }, 2000);
    }, 4000);
  };

  window.addEventListener('mousemove', showHint, { once: false });
  window.addEventListener('keydown', showHint, { once: false });

  function updateCoherenceUI(coherence) {
    const pct = Math.round(coherence * 100);
    coherenceFill.style.width = pct + '%';
    coherenceValue.textContent = pct + '%';

    // Color the percentage based on coherence level
    // The lead color follows the active spectrum theme accent
    const accent = 'var(--qora-accent, #7b61ff)';
    if (coherence > 0.7) {
      coherenceValue.style.color = '#00e5a0';
      coherenceFill.style.background = `linear-gradient(90deg, ${accent}, #00e5a0)`;
    } else if (coherence > 0.3) {
      coherenceValue.style.color = '#ffab40';
      coherenceFill.style.background = `linear-gradient(90deg, ${accent}, #ffab40)`;
    } else {
      coherenceValue.style.color = '#ff6b35';
      coherenceFill.style.background = `linear-gradient(90deg, ${accent}, #ff6b35)`;
    }
  }

  function setMode(id, label, desc) {
    modeLabel.textContent = label;
    modeDesc.textContent = desc;
    modeLabel.className = '';
    if (id === 1) modeLabel.className = 'mode-exciton';
    if (id === 2) modeLabel.className = 'mode-deco';
  }

  return { updateCoherenceUI, setMode };
}
