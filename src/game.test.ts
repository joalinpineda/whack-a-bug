import { describe, expect, it } from 'vitest';
import { calculateHit, getRank, randomType, spawnDelay, targetLifetime } from './game';
describe('game rules', () => {
  it('scores normal hits and grows combos', () => expect(calculateHit('normal', 0)).toEqual({ points: 10, combo: 1, isBug: true }));
  it('applies a multiplier at five hits', () => expect(calculateHit('critical', 4).points).toBe(50));
  it('resets combo for features', () => expect(calculateHit('feature', 8)).toEqual({ points: -20, combo: 0, isBug: false }));
  it('keeps targets playable as difficulty rises', () => { expect(targetLifetime(60)).toBeGreaterThanOrEqual(650); expect(spawnDelay(60)).toBeGreaterThanOrEqual(430); });
  it('maps random rolls to configured target types', () => { expect(randomType(.01)).toBe('golden'); expect(randomType(.9)).toBe('normal'); });
  it('assigns performance ranks', () => { expect(getRank(100)).toBe('Junior Bug Hunter'); expect(getRank(1000)).toBe('Legendary QA Exorcist'); });
});
