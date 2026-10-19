// Web Audio API Sound Effects & Ambient Music Engine for Elimika Play
// Zero external audio files required — works offline and on low-data Android devices.

class GameSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.6;
  private musicInterval: number | null = null;
  private musicPlaying = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtor) {
        this.ctx = new AudioCtor();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    if (mute) {
      this.stopBackgroundMusic();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  private playNote(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    delaySec = 0,
    gainScale = 0.18
  ): void {
    if (this.muted || this.volume <= 0.01) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const startTime = ctx.currentTime + delaySec;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      const peakGain = Math.max(0.001, gainScale * this.volume);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, startTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + durationSec + 0.02);
    } catch {
      // Ignore audio errors on restricted devices
    }
  }

  public playClick(): void {
    this.playNote(520, 0.06, 'triangle', 0, 0.12);
  }

  public playCorrect(): void {
    this.playNote(523.25, 0.12, 'triangle', 0, 0.2); // C5
    this.playNote(659.25, 0.14, 'triangle', 0.09, 0.22); // E5
    this.playNote(783.99, 0.22, 'sine', 0.18, 0.24); // G5
  }

  public playWrong(): void {
    this.playNote(240, 0.16, 'sawtooth', 0, 0.14);
    this.playNote(196, 0.24, 'sawtooth', 0.12, 0.14);
  }

  public playUnlock(): void {
    this.playNote(440, 0.1, 'sine', 0, 0.18);
    this.playNote(554.37, 0.12, 'sine', 0.08, 0.2);
    this.playNote(659.25, 0.14, 'triangle', 0.16, 0.22);
    this.playNote(880, 0.28, 'sine', 0.24, 0.24);
  }

  public playDiscovery(): void {
    this.playNote(587.33, 0.1, 'sine', 0, 0.16);
    this.playNote(880, 0.22, 'triangle', 0.08, 0.2);
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const delays = [0, 0.11, 0.22, 0.34, 0.5, 0.64];
    const durations = [0.12, 0.12, 0.12, 0.18, 0.14, 0.4];
    notes.forEach((n, idx) => {
      this.playNote(n, durations[idx], 'triangle', delays[idx], 0.24);
    });
  }

  public startBackgroundMusic(theme: 'adventure' | 'mystery' = 'adventure'): void {
    if (this.muted || this.musicPlaying) return;
    this.musicPlaying = true;
    const scale =
      theme === 'adventure'
        ? [261.63, 293.66, 329.63, 392.0, 440.0, 523.25] // C major pentatonic
        : [220.0, 246.94, 261.63, 329.63, 349.23, 440.0]; // A minor mystery
    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.muted || !this.musicPlaying) return;
      const freq = scale[step % scale.length];
      this.playNote(freq, 0.45, 'sine', 0, 0.045);
      step = (step + (step % 2 === 0 ? 2 : 1)) % scale.length;
    }, 650);
  }

  public stopBackgroundMusic(): void {
    this.musicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new GameSoundEngine();
