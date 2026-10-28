export type TargetType = 'normal' | 'critical' | 'flaky' | 'golden' | 'friendly';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over';
export interface Target { id: number; hole: number; type: TargetType; bornAt: number }
export interface Stats { hits: number; misses: number; bugsCaught: number }
export interface FloatingText { id: number; hole: number; text: string; kind: 'good' | 'bad' }
export type SfxName = 'swing' | 'normal' | 'critical' | 'flaky' | 'golden' | 'friendly' | 'miss' | 'combo' | 'warning' | 'gameover' | 'highscore';
export interface HitResult { targetId: number; type: TargetType; points: number; isBug: boolean; combo: number; comboMilestone: boolean }
