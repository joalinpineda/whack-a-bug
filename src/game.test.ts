import { describe, expect, it } from 'vitest';
import { calculateHit, getRank, randomType, spawnDelay, targetLifetime } from './game';
describe('game rules', () => {
  it('scores normal hits and grows combos', () => expect(calculateHit('normal', 0)).toEqual({ points: 10, combo: 1, isBug: true }));
  it('applies a multiplier at five hits', () => expect(calculateHit('critical', 4).points).toBe(50));
  it('scores flaky bugs', () => expect(calculateHit('flaky', 0)).toEqual({ points: 15, combo: 1, isBug: true }));
  it('resets combo for friendly targets', () => expect(calculateHit('friendly', 8)).toEqual({ points: -20, combo: 0, isBug: false }));
  it('keeps targets playable as difficulty rises', () => { expect(targetLifetime(60)).toBeGreaterThanOrEqual(650); expect(spawnDelay(60)).toBeGreaterThanOrEqual(430); });
  it('spawns 25% friendly targets and 75% bugs', () => { expect(randomType(.24)).toBe('friendly'); expect(randomType(.25)).toBe('golden'); expect(randomType(.5)).toBe('flaky'); expect(randomType(.9)).toBe('normal'); });
  it('assigns performance ranks', () => { expect(getRank(100)).toBe('Junior Bug Hunter'); expect(getRank(1000)).toBe('Legendary QA Exorcist'); });
});
