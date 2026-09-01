// Web Audio Synth & Speech Synthesis for kid-friendly Arabic learning

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private isSoundEnabled: boolean = true;
  private isVoiceEnabled: boolean = true;

  constructor() {
    // Lazy AudioContext initialization
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
  }

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a gentle pop/click for UI buttons
  public playPop() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  // Play snap sound when geometric shapes snap together
  public playSnap() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(587.33, this.audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch {
      // ignore
    }
  }

  // Play edge measurement touch chime
  public playChime(pitchIndex = 0) {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const freq = notes[pitchIndex % notes.length];

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch {
      // ignore
    }
  }

  // Play cheerful success celebration fanfare
  public playSuccess() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, index) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0.01, now + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.45);
      });
    } catch {
      // ignore
    }
  }

  // Play a soft encouraging sound when a retry is needed (never harsh or negative)
  public playGentleEncourage() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, this.audioCtx.currentTime); // G4
      osc.frequency.exponentialRampToValueAtTime(329.63, this.audioCtx.currentTime + 0.25); // E4

      gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.28);
    } catch {
      // ignore
    }
  }

  // Enhance Arabic text so all TTS engines pronounce units (centimetres, square centimetres, etc.) and Tanween (التنوين) clearly
  private formatArabicSpeechText(text: string): string {
    if (!text) return '';

    let formatted = text;

    // 1. Expand scientific / abbreviated units into fully vocalized Arabic words
    // Square centimetres: سم² or سم2 or سنتيمتر مربع
    formatted = formatted
      .replace(/(\d+)\s*سم²/g, '$1 سَنْتِيمِتْراً مُرَبَّعاً')
      .replace(/سم²/g, 'سَنْتِيمِتْراً مُرَبَّعاً')
      .replace(/(\d+)\s*سم2/g, '$1 سَنْتِيمِتْراً مُرَبَّعاً')
      .replace(/سم2/g, 'سَنْتِيمِتْراً مُرَبَّعاً');

    // Square metres: م² or م2
    formatted = formatted
      .replace(/(\d+)\s*م²/g, '$1 مِتْراً مُرَبَّعاً')
      .replace(/م²/g, 'مِتْراً مُرَبَّعاً')
      .replace(/(\d+)\s*م2/g, '$1 مِتْراً مُرَبَّعاً')
      .replace(/م2/g, 'مِتْراً مُرَبَّعاً');

    // Linear centimetres: سم (e.g. 10 سم, 5 سم, أو سم منفردة)
    formatted = formatted
      .replace(/(\d+)\s*سم\b/g, '$1 سَنْتِيمِتْراً')
      .replace(/(\d+)\s*سَمْ\b/g, '$1 سَنْتِيمِتْراً')
      .replace(/(\d+)\s*سِمْ\b/g, '$1 سَنْتِيمِتْراً')
      .replace(/\bسم\b/g, 'سَنْتِيمِتْراً')
      .replace(/\bسَمْ\b/g, 'سَنْتِيمِتْراً');

    // Linear metres: م when preceded by numbers (e.g. 24 م -> 24 مِتْراً)
    formatted = formatted
      .replace(/(\d+)\s*م\b/g, '$1 مِتْراً');

    // Mathematical multiplication symbol '×' pronunciation for children
    formatted = formatted.replace(/(\d+)\s*×\s*(\d+)/g, '$1 ضَرْبُ $2');

    // 2. Tanween Fath, Damm, Kasr phonetic enhancement for crisp Arabic TTS
    formatted = formatted
      // Tanween Fath on Taa Marbuta (ةً -> تَنْ)
      .replace(/ة\u064B/g, 'تَنْ')
      .replace(/ـة\u064B/g, 'تَنْ')
      // Tanween Fath with Alif (اً or ـاً or ً -> َنْ)
      .replace(/(\u064B)ا/g, 'َنْ')
      .replace(/ا\u064B/g, 'َنْ')
      .replace(/\u064B/g, 'َنْ')
      // Tanween Damm on Taa Marbuta (ةٌ -> تُنْ)
      .replace(/ة\u064C/g, 'تُنْ')
      .replace(/ـة\u064C/g, 'تُنْ')
      // Tanween Damm (ٌ -> ُنْ)
      .replace(/\u064C/g, 'ُنْ')
      // Tanween Kasr on Taa Marbuta (ةٍ -> تِنْ)
      .replace(/ة\u064D/g, 'تِنْ')
      .replace(/ـة\u064D/g, 'تِنْ')
      // Tanween Kasr (ٍ -> ِنْ)
      .replace(/\u064D/g, 'ِنْ');

    return formatted;
  }

  // Speak Arabic instruction or phrase with improved Tanween & clear pronunciation
  public speakArabic(text: string) {
    if (!this.isVoiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel(); // cancel previous

      // Phonetically enhance units and Tanween so TTS reads it crisply
      const phoneticText = this.formatArabicSpeechText(text);

      const utterance = new SpeechSynthesisUtterance(phoneticText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.92; // natural, clear kid-friendly pacing
      utterance.pitch = 1.05; // warm, cheerful tone

      // Try finding the best Arabic voice
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (v) =>
          v.lang === 'ar-SA' ||
          v.lang.startsWith('ar') ||
          v.name.toLowerCase().includes('arabic') ||
          v.name.toLowerCase().includes('maged') ||
          v.name.toLowerCase().includes('tarik') ||
          v.name.toLowerCase().includes('laila')
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();
