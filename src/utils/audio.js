// Zero-dependency retro Web Audio API sound generator in pure JavaScript
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.08, volume = 0.15) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext could be blocked by browser policy prior to interaction
    }
  }

  playEat() {
    this.playBeep(600, 'triangle', 0.07, 0.2);
    setTimeout(() => this.playBeep(880, 'triangle', 0.09, 0.2), 60);
  }

  playJump() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  playHit() {
    this.playBeep(180, 'sawtooth', 0.12, 0.25);
  }

  playClear() {
    this.playBeep(523.25, 'sine', 0.08, 0.18);
    setTimeout(() => this.playBeep(659.25, 'sine', 0.08, 0.18), 70);
    setTimeout(() => this.playBeep(783.99, 'sine', 0.14, 0.22), 140);
  }

  playGameOver() {
    this.playBeep(320, 'sawtooth', 0.15, 0.2);
    setTimeout(() => this.playBeep(260, 'sawtooth', 0.15, 0.2), 120);
    setTimeout(() => this.playBeep(180, 'sawtooth', 0.25, 0.25), 240);
  }

  playClick() {
    this.playBeep(800, 'sine', 0.03, 0.08);
  }
}

export const sounds = new SoundSystem();
