import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateHit, GAME_SECONDS, randomType, spawnDelay, targetLifetime } from './game';
import type { FloatingText, GameStatus, Stats, Target } from './types';

const quips = ['Works on my machine!', 'Cannot reproduce.', 'Regression detected!', 'Who pushed to main?', 'Friday deploy detected!', 'Flaky test escaped!', 'Severity: CRITICAL!', 'QA saves production again!'];

export function useGame(onSound: (tone: 'hit' | 'bad' | 'gold') => void) {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [time, setTime] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [stats, setStats] = useState<Stats>({ hits: 0, misses: 0, bugsCaught: 0 });
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [message, setMessage] = useState('');
  const nextId = useRef(1);
  const timeRef = useRef(time); timeRef.current = time;
  const statusRef = useRef(status); statusRef.current = status;

  const start = useCallback(() => {
    setTime(GAME_SECONDS); setScore(0); setCombo(0); setTargets([]); setFloats([]);
    setStats({ hits: 0, misses: 0, bugsCaught: 0 }); setMessage(''); setStatus('playing');
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const timer = window.setInterval(() => setTime(t => {
      if (t <= 1) { setStatus('over'); setTargets([]); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    let cancelled = false;
    let timeout = 0;
    const spawn = () => {
      if (cancelled || statusRef.current !== 'playing') return;
      const id = nextId.current++;
      const occupied = new Set<number>();
      setTargets(current => { current.forEach(t => occupied.add(t.hole)); return current; });
      const free = Array.from({ length: 9 }, (_, i) => i).filter(i => !occupied.has(i));
      if (free.length) {
        const hole = free[Math.floor(Math.random() * free.length)];
        const target: Target = { id, hole, type: randomType(), bornAt: Date.now() };
        setTargets(current => [...current.filter(t => t.hole !== hole), target]);
        window.setTimeout(() => setTargets(current => {
          const escaped = current.some(t => t.id === id);
          if (escaped && target.type !== 'feature') { setCombo(0); setStats(s => ({ ...s, misses: s.misses + 1 })); }
          return current.filter(t => t.id !== id);
        }), targetLifetime(GAME_SECONDS - timeRef.current));
      }
      timeout = window.setTimeout(spawn, spawnDelay(GAME_SECONDS - timeRef.current));
    };
    timeout = window.setTimeout(spawn, 500);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = window.setInterval(() => {
      if (Math.random() < .45) { setMessage(quips[Math.floor(Math.random() * quips.length)]); window.setTimeout(() => setMessage(''), 2200); }
    }, 5500);
    return () => clearInterval(id);
  }, [status]);

  const hit = useCallback((target: Target) => {
    if (statusRef.current !== 'playing') return;
    setTargets(current => current.filter(t => t.id !== target.id));
    setCombo(current => {
      const result = calculateHit(target.type, current);
      setScore(s => Math.max(0, s + result.points));
      setStats(s => ({ hits: s.hits + 1, misses: s.misses, bugsCaught: s.bugsCaught + (result.isBug ? 1 : 0) }));
      setFloats(f => [...f, { id: target.id, hole: target.hole, text: `${result.points > 0 ? '+' : ''}${result.points}`, kind: result.isBug ? 'good' : 'bad' }]);
      window.setTimeout(() => setFloats(f => f.filter(x => x.id !== target.id)), 700);
      onSound(target.type === 'golden' ? 'gold' : result.isBug ? 'hit' : 'bad');
      if (target.type === 'feature') setMessage("It's a feature, not a bug!");
      return result.combo;
    });
  }, [onSound]);

  return { status, time, score, combo, targets, stats, floats, message, start, hit, pause: () => setStatus(s => s === 'playing' ? 'paused' : 'playing') };
}
