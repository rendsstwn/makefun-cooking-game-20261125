// Tiny kitchen sounds, made with the Web Audio oscillator — no files, no
// network. Everything stays silent until the player first touches a key or
// the screen, because browsers only let sound start after a gesture.

export function createSounder() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(freq, length, kind, gain) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    if (audio.state === 'suspended') audio.resume();
    const voice = audio.createOscillator();
    const amp = audio.createGain();
    voice.type = kind ?? 'sine';
    voice.frequency.value = freq;
    amp.gain.setValueAtTime(gain ?? 0.08, audio.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + length);
    voice.connect(amp);
    amp.connect(audio.destination);
    voice.start();
    voice.stop(audio.currentTime + length);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    pickup() {
      tone(520, 0.09, 'triangle', 0.07);
    },
    place() {
      tone(340, 0.08, 'triangle', 0.06);
    },
    chop() {
      tone(190, 0.06, 'square', 0.05);
      tone(240, 0.05, 'square', 0.04);
    },
    sizzle() {
      tone(880, 0.12, 'sawtooth', 0.025);
    },
    serve() {
      tone(660, 0.1, 'sine', 0.09);
      setTimeout(() => tone(880, 0.14, 'sine', 0.09), 90);
    },
    ready() {
      tone(990, 0.08, 'sine', 0.07);
    },
    alarm() {
      tone(440, 0.16, 'square', 0.05);
      setTimeout(() => tone(440, 0.16, 'square', 0.05), 200);
    },
    click() {
      tone(700, 0.05, 'triangle', 0.05);
    },
  };
}
