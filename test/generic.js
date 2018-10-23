const { expect } = require('chai');
const { sort } = require('../index');

/*
 *  Detailed tests are in posix.js and windows.js suites
 *  sort() function on posix platforms works like posix.sort()
 *  sort() function on windows platforms works like windows.sort()
*/

describe('Generic sort function', () => {
  it('Should work with array of strings', () => {
    expect(sort(['b', 'd', 'c', 'a'])).to.deep.equal(['a', 'b', 'c', 'd']);
  });

  it('Should work with array of objects with a specified key', () => {
    const o1 = { filename: 'b' };
    const o2 = { filename: 'd' };
    const o3 = { filename: 'c' };
    const o4 = { filename: 'a' };
    const pathKey = 'filename';
    expect(sort([o1, o2, o3, o4], { pathKey })).to.deep.equal([o4, o1, o3, o2]);
  });

  it('Should work with arrays with only one element', () => {
    expect(sort(['a'])).to.deep.equal(['a']);
    const o = { f: 'b' };
    expect(sort([o], { pathKey: 'f' })).to.deep.equal([o]);
  });

  it('Should work based on the platform on which it is running', () => {
    const paths = ['b\\a.js', 'c.js', 'a.js'];
    const sortedPaths = sort(paths, { shallowFirst: true });

    if (process.platform === 'win32') {
      expect(sortedPaths).to.deep.equal(['a.js', 'c.js', 'b\\a.js']);
    } else {
      expect(sortedPaths).to.deep.equal(['a.js', 'b\\a.js', 'c.js']);
    }
  });
});
