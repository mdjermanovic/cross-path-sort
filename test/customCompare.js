const { expect } = require('chai');
const { permutation } = require('js-combinatorics');
const { sort } = require('..');

describe('Custom Compare - Sort function', () => {
  it('Should work well with a custom segment compare function #1', () => {
    const paths = ['c', 'B', 'b', 'a', 'C', 'A'];
    const function1 = (a, b) => -a.localeCompare(b);
    const result = ['C', 'c', 'B', 'b', 'A', 'a'];
    expect(sort(paths, { segmentCompareFn: function1 })).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(sort(p, { segmentCompareFn: function1 })).to.deep.equal(result)
      );
  });

  it('Should work well with a custom segment compare function #2', () => {
    const paths = ['c', 'B', 'b', 'a', 'C', 'A'];
    const function2 = (a, b) => (a < b ? -1 : b < a ? 1 : 0);
    const result = ['A', 'B', 'C', 'a', 'b', 'c'];
    expect(sort(paths, { segmentCompareFn: function2 })).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(sort(p, { segmentCompareFn: function2 })).to.deep.equal(result)
      );
  });
});
