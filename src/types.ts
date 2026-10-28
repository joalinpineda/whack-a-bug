export type TargetType = 'normal' | 'critical' | 'golden' | 'feature';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over';
export interface Target { id: number; hole: number; type: TargetType; bornAt: number }
export interface Stats { hits: number; misses: number; bugsCaught: number }
export interface FloatingText { id: number; hole: number; text: string; kind: 'good' | 'bad' }
