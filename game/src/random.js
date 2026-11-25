// A small seeded dice-roller for the stall. The kitchen uses one stream of
// seeded numbers so a fixed seed always deals the same tickets, the same
// dishes and the same rushes — that is what makes a screenshot reproducible.

export function makeDice(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  return {
    // Next raw 32-bit value.
    next() {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state;
    },
    // A float in [0, 1).
    float() {
      return this.next() / 4294967296;
    },
    // An integer from 0 up to (but not including) `top`.
    below(top) {
      return Math.floor(this.float() * top);
    },
    // A float between `lo` and `hi`.
    between(lo, hi) {
      return lo + this.float() * (hi - lo);
    },
    // One entry from `list`, picked flat.
    pick(list) {
      return list[this.below(list.length)];
    },
    // A copy of `list` with its entries shuffled in place order.
    shuffled(list) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = this.below(i + 1);
        const hold = copy[i];
        copy[i] = copy[j];
        copy[j] = hold;
      }
      return copy;
    },
  };
}
