import { describe, expect, it } from 'vitest';
import { LAND_COVER_TYPES } from '../engine/index.ts';
import { landCoverForYear } from '../data/scenario.ts';
import { TOUR } from './tour.ts';

const grid2025 = landCoverForYear(2025);

describe('TOUR', () => {
  it('is the seven-step concept walkthrough', () => {
    expect(TOUR).toHaveLength(7);
    // Titles are numbered 1..7 in order.
    TOUR.forEach((step, i) => {
      expect(step.title.startsWith(`${i + 1}.`)).toBe(true);
      expect(step.body.length).toBeGreaterThan(0);
    });
  });

  it('only ever edits in-bounds cells to real land cover types', () => {
    for (const step of TOUR) {
      for (const [index, type] of step.state.edits) {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(grid2025.cells.length);
        expect(LAND_COVER_TYPES).toContain(type);
      }
    }
  });

  it('demos land on the cells the story needs in 2025', () => {
    const pixelStep = TOUR.find((s) => s.title.startsWith('6.'))!;
    const restoreStep = TOUR.find((s) => s.title.startsWith('7.'))!;

    // Step 6 turns an intact forest cell barren.
    for (const [index, to] of pixelStep.state.edits) {
      expect(to).toBe('barren');
      expect(grid2025.cells[index]).toBe('forest');
    }

    // Step 7 restores the developed corridor that split the forest back to forest.
    expect(restoreStep.state.edits.size).toBeGreaterThan(0);
    for (const [index, to] of restoreStep.state.edits) {
      expect(to).toBe('forest');
      expect(grid2025.cells[index]).toBe('developed');
    }
  });
});
