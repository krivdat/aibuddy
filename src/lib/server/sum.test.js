import { describe, it, expect } from 'vitest';

const sum = (a, b) => a + b;

describe('Sum function', () => {
  it('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
