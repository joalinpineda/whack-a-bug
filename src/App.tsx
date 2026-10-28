import { useCallback, useEffect, useRef, useState } from 'react';
import { getRank } from './game';
import { useGame } from './useGame';
import type { Target, TargetType } from './types';

const labels: Record<TargetType, string> = { normal: 'BUG', critical: 'CRIT', golden: 'GOLD', feature: 'FEAT' };

function Atmosphere() { return <><div className="stars"/><div className="moon"><span/></div><div className="ghost g1">◜◝</div><div className="ghost g2">◜◝</div><div className="skyline"/><div className="fog fog1"/><div className="fog fog2"/></>; }

function Logo() { return <div className="logo-wrap"><div className="eyebrow">HAUNTED SOFTWARE PRESENTS</div><h1>WHACK<span>-A-</span>BUG</h1><div className="logo-bug">☠</div><p>Some bugs refuse to stay dead.</p></div>; }

function StartScreen({ start, highScore }: { start: () => void; highScore: number }) {
  return <main className="screen start-screen"><Atmosphere/><section className="start-card"><Logo/><div className="instructions"><h2>PRODUCTION IS HAUNTED</h2><p>Whack escaped bugs. Do <em>not</em> ship the feature.</p><div className="legend"><span>🪲 <b>+10</b></span><span>🔥 <b>+25</b></span><span>⭐ <b>+50</b></span><span>🎁 <b>−20</b></span></div><small>Chain hits to unleash combo multipliers!</small></div><button className="arcade-button" onClick={start}>START SHIFT <i>▶</i></button><div className="high-score">LOCAL HIGH SCORE <strong>{String(highScore).padStart(5, '0')}</strong></div></section><footer>INSERT COFFEE TO CONTINUE • v1.0.0</footer></main>;
}

function Sprite({ type }: { type: TargetType }) {
  return <div className={`sprite ${type}`}><i className="antenna left"/><i className="antenna right"/><div className="sprite-head"><i/><i/></div><div className="sprite-body">{type === 'feature' ? 'F' : type === 'critical' ? '!' : type === 'golden' ? '★' : 'x'}</div><small>{labels[type]}</small></div>;
}

function Hole({ index, target, onHit, float }: { index: number; target?: Target; onHit: (t: Target) => void; float?: { text: string; kind: string } }) {
  return <div className="plot"><div className="dirt">{target && <button className="target" aria-label={`${target.type} target`} onPointerDown={() => onHit(target)}><Sprite type={target.type}/></button>}{float && <span className={`float ${float.kind}`}>{float.text}</span>}</div><div className="stone"><span>{index === 4 ? 'PROD' : index % 3 === 0 ? '404' : index % 3 === 1 ? 'RIP' : 'BUG'}</span><small>{index === 4 ? 'DO NOT DEPLOY' : index % 2 ? 'NULL POINTER' : 'HERE LIES A FIX'}</small></div>{index === 0 && <i className="pumpkin">◉</i>}{index === 8 && <i className="laptop">›_</i>}</div>;
}

function GameScreen({ game, muted, setMuted }: { game: ReturnType<typeof useGame>; muted: boolean; setMuted: (m: boolean) => void }) {
  const multiplier = Math.min(4, 1 + Math.floor(game.combo / 5));
  return <main className="screen game-screen"><Atmosphere/><header className="hud"><div><small>SCORE</small><strong>{String(game.score).padStart(5, '0')}</strong></div><div className="title-mini">WHACK-A-BUG<small>GRAVEYARD SHIFT</small></div><div className={game.time <= 10 ? 'danger' : ''}><small>TIME</small><strong>00:{String(game.time).padStart(2, '0')}</strong></div></header><div className="controls"><span className={game.combo ? 'combo active' : 'combo'}>COMBO x{multiplier} <b>{game.combo}</b></span><div><button onClick={game.pause} aria-label="Pause">{game.status === 'paused' ? '▶' : 'Ⅱ'}</button><button onClick={() => setMuted(!muted)} aria-label="Mute">{muted ? '🔇' : '🔊'}</button></div></div><section className="graveyard">{Array.from({ length: 9 }, (_, index) => <Hole key={index} index={index} target={game.targets.find(t => t.hole === index)} onHit={game.hit} float={game.floats.find(f => f.hole === index)}/>)}</section>{game.message && <div className="toast">⚠ {game.message}</div>}{game.status === 'paused' && <div className="pause-overlay"><div><h2>SHIFT PAUSED</h2><p>The bugs are plotting…</p><button className="arcade-button" onClick={game.pause}>RESUME</button></div></div>}</main>;
}

function GameOver({ game, highScore, playAgain }: { game: ReturnType<typeof useGame>; highScore: number; playAgain: () => void }) {
  const total = game.stats.hits + game.stats.misses; const accuracy = total ? Math.round(game.stats.hits / total * 100) : 0; const rank = getRank(game.score);
  const summary = accuracy >= 85 ? 'Production lives to deploy another day.' : accuracy >= 60 ? 'A few bugs escaped into the backlog.' : 'The developers insist it works locally.';
  return <main className="screen over-screen"><Atmosphere/><section className="over-card"><div className="skull">☠</div><h1>SHIFT COMPLETE</h1><p className="summary">{summary}</p><div className="final-score"><small>FINAL SCORE</small><strong>{String(game.score).padStart(5, '0')}</strong>{game.score >= highScore && game.score > 0 && <span>NEW HIGH SCORE!</span>}</div><div className="stats"><div><b>{game.stats.bugsCaught}</b><small>BUGS CAUGHT</small></div><div><b>{accuracy}%</b><small>ACCURACY</small></div><div><b>{highScore}</b><small>HIGH SCORE</small></div></div><div className="rank"><small>PERFORMANCE RANK</small><strong>{rank}</strong></div><button className="arcade-button" onClick={playAgain}>CLOCK IN AGAIN ↻</button></section></main>;
}

export default function App() {
  const [muted, setMuted] = useState(false); const audio = useRef<AudioContext | null>(null);
  const playSound = useCallback((tone: 'hit' | 'bad' | 'gold') => { if (muted) return; const ctx = audio.current ??= new AudioContext(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = tone === 'bad' ? 'sawtooth' : 'square'; o.frequency.setValueAtTime(tone === 'gold' ? 880 : tone === 'hit' ? 440 : 140, ctx.currentTime); if (tone === 'gold') o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + .12); g.gain.setValueAtTime(.08, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .16); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .17); }, [muted]);
  const game = useGame(playSound); const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('wab-high-score')) || 0);
  useEffect(() => { if (game.status === 'over' && game.score > highScore) { setHighScore(game.score); localStorage.setItem('wab-high-score', String(game.score)); } }, [game.status, game.score, highScore]);
  if (game.status === 'idle') return <StartScreen start={game.start} highScore={highScore}/>;
  if (game.status === 'over') return <GameOver game={game} highScore={Math.max(highScore, game.score)} playAgain={game.start}/>;
  return <GameScreen game={game} muted={muted} setMuted={setMuted}/>;
}
