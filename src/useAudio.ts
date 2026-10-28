import { useCallback, useEffect, useRef, useState } from 'react';
import type { SfxName } from './types';

type AudioPrefs = { music: boolean; sfx: boolean; musicVolume: number; sfxVolume: number };
const defaults: AudioPrefs = { music: true, sfx: true, musicVolume: .28, sfxVolume: .55 };

export function useAudio() {
  const [prefs, setPrefs] = useState<AudioPrefs>(() => { try { return { ...defaults, ...JSON.parse(localStorage.getItem('winmill-audio') || '{}') }; } catch { return defaults; } });
  const ctx = useRef<AudioContext | null>(null); const musicTimer = useRef<number | undefined>(undefined); const step = useRef(0);
  const ensure = useCallback(() => ctx.current ??= new AudioContext(), []);
  useEffect(() => localStorage.setItem('winmill-audio', JSON.stringify(prefs)), [prefs]);

  const note = useCallback((frequency: number, duration: number, volume: number, type: OscillatorType = 'square', delay = 0) => {
    const audio = ensure(); const start = audio.currentTime + delay; const oscillator = audio.createOscillator(); const gain = audio.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start); gain.gain.setValueAtTime(Math.max(.0001, volume), start); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(start); oscillator.stop(start + duration);
  }, [ensure]);

  const noise = useCallback((duration: number, volume: number, frequency: number, delay = 0) => {
    const audio = ensure(); const length = Math.ceil(audio.sampleRate * duration); const buffer = audio.createBuffer(1, length, audio.sampleRate); const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    const source = audio.createBufferSource(); const filter = audio.createBiquadFilter(); const gain = audio.createGain(); const start = audio.currentTime + delay;
    source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = frequency; gain.gain.setValueAtTime(volume, start); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter).connect(gain).connect(audio.destination); source.start(start);
  }, [ensure]);

  const sfx = useCallback((name: SfxName) => {
    if (!prefs.sfx) return; const v = prefs.sfxVolume * .13;
    if (name === 'swing') { noise(.07, v*.55, 700); note(140, .09, v*.45, 'triangle'); return; }
    if (name === 'miss') { note(105,.16,v*.85,'triangle'); noise(.1,v*.5,320); return; }
    if (name === 'normal') { note(190,.11,v*.8,'sine'); note(110,.14,v*.55,'triangle',.035); noise(.1,v*.65,480); return; }
    if (name === 'critical') { note(115,.17,v,'sine'); note(68,.2,v*.7,'triangle',.025); noise(.14,v*.8,360); return; }
    if (name === 'flaky') { note(245,.08,v*.65,'sine'); note(170,.11,v*.6,'sine',.035); note(215,.13,v*.45,'triangle',.07); noise(.11,v*.55,650); return; }
    if (name === 'golden') { note(520,.1,v*.7,'sine'); note(880,.16,v*.8,'square',.05); noise(.12,v*.5,1800); return; }
    const patterns: Record<Exclude<SfxName, 'swing'|'miss'|'normal'|'critical'|'flaky'|'golden'>, number[]> = { friendly: [180, 135, 105], combo: [440, 660, 880], warning: [220, 220], gameover: [330, 247, 165, 110], highscore: [523, 659, 784, 1047] };
    patterns[name].forEach((f, i) => note(f, name === 'gameover' ? .24 : .13, v, name === 'friendly' ? 'sawtooth' : 'square', i * .075));
  }, [noise, note, prefs.sfx, prefs.sfxVolume]);

  const stopMusic = useCallback(() => { if (musicTimer.current) clearInterval(musicTimer.current); musicTimer.current = undefined; step.current = 0; }, []);
  const startMusic = useCallback(() => {
    stopMusic(); if (!prefs.music) return; ensure().resume();
    const melody = [330,0,392,440,392,0,330,294,262,0,330,392,466,440,392,0]; const bass = [110,110,98,98,87,87,98,98];
    const play = () => { const i = step.current++; const m = melody[i % melody.length]; if (m) note(m, .15, prefs.musicVolume * .045, 'square'); if (i % 2 === 0) note(bass[Math.floor(i / 2) % bass.length], .28, prefs.musicVolume * .055, 'triangle'); if (i % 4 === 2) note(70, .05, prefs.musicVolume * .025, 'sawtooth'); };
    play(); musicTimer.current = window.setInterval(play, 180);
  }, [ensure, note, prefs.music, prefs.musicVolume, stopMusic]);
  useEffect(() => stopMusic, [stopMusic]);
  return { prefs, setPrefs, sfx, startMusic, stopMusic };
}
