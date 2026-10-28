import type { TargetType } from './types';

export const GAME_SECONDS = 60;
export const POINTS: Record<TargetType, number> = { normal: 10, critical: 25, flaky: 15, golden: 50, friendly: -20 };

export function calculateHit(type: TargetType, combo: number) {
  if (type === 'friendly') return { points: POINTS.friendly, combo: 0, isBug: false };
  const nextCombo = combo + 1;
  const multiplier = Math.min(4, 1 + Math.floor(nextCombo / 5));
  return { points: POINTS[type] * multiplier, combo: nextCombo, isBug: true };
}

export function targetLifetime(elapsedSeconds: number) {
  return Math.max(650, 1450 - elapsedSeconds * 11);
}

export function spawnDelay(elapsedSeconds: number) {
  return Math.max(430, 1050 - elapsedSeconds * 9);
}

export function randomType(random = Math.random()): TargetType {
  if (random < .25) return 'friendly';
  if (random < .31) return 'golden';
  if (random < .46) return 'critical';
  if (random < .61) return 'flaky';
  return 'normal';
}

export function getRank(score: number) {
  if (score >= 900) return 'Legendary QA Exorcist';
  if (score >= 550) return 'Senior Bug Slayer';
  if (score >= 250) return 'QA Engineer';
  return 'Junior Bug Hunter';
}
