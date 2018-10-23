const { expect } = require('chai');
const sinon = require('sinon');
const sinonTest = require('sinon-test');
const path = require('path');
const { permutation } = require('js-combinatorics');
const {
  sort,
  posix: { sort: posixSort },
  windows: { sort: windowsSort },
} = require('../index');

const test = sinonTest(sinon);

describe('Edge Cases - Sort function', () => {
  it('Should simply return paths argument if it is not an array', () => {
    expect(sort()).to.be.undefined;
    expect(sort(null)).to.be.null;
    expect(sort(5)).to.equal(5);
    expect(sort(true)).to.equal(true);
    expect(sort('foo')).to.equal('foo');
    // same reference
    const obj = {};
    expect(sort(obj)).to.equal(obj);
    const fn = () => {};
    expect(sort(fn)).to.equal(fn);
  });

  it('Should return a new empty array if paths argument is an empty array', () => {
    // new reference
    const ary = [];
    const sortedAry = sort(ary);
    expect(sortedAry).to.deep.equal(ary);
    expect(sortedAry).to.not.equal(ary);
  });

  it('Should work well with mixed strings and objects', () => {
    const o1 = { myKey: 'd' };
    const o2 = { myKey: 'b' };
    const paths = [o1, 'c', o2, 'e', 'a'];
    const result = ['a', o2, 'c', o1, 'e'];
    expect(sort(paths, { pathKey: 'myKey' })).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(sort(p, { pathKey: 'myKey' })).to.deep.equal(result)
      );
  });

  it('Should put unreadable elements after the readable ones, in no particular order, and holes after them', () => {
    const o1 = { myKey: 'a' };
    const o2 = { wrongKey: 'b' };
    // eslint-disable-next-line no-sparse-arrays
    const paths = [, 'b', o2, , 5, null, o1];
    const sortedPaths = sort(paths, { pathKey: 'myKey' });

    expect(sortedPaths.length).to.equal(7);
    // readable, sorted
    expect(sortedPaths.slice(0, 2)).to.deep.equal([o1, 'b']);
    // unreadable
    expect(sortedPaths.slice(2, 5)).to.have.members([5, o2, null]);
    // holes at the end
    expect(Object.keys(sortedPaths)).to.have.members(['0', '1', '2', '3', '4']);

    permutation(paths)
      .toArray()
      .forEach(p => {
        // Combinatorics doesn't preserve holes, we have to manually delete keys
        for (let i = 0; i < p.length; i++) {
          if (p[i] === undefined) delete p[i];
        }

        const s = sort(p, { pathKey: 'myKey' });
        expect(s.length).to.equal(7);
        expect(s.slice(0, 2)).to.deep.equal([o1, 'b']);
        expect(s.slice(2, 5)).to.have.members([5, o2, null]);
        expect(Object.keys(s)).to.have.members(['0', '1', '2', '3', '4']);
      });

    // additional checks for undefined
    expect(sort(['b', undefined, 'a'])).to.deep.equal(['a', 'b', undefined]);
    expect(sort([undefined])).to.deep.equal([undefined]);
  });

  it('Should work well if the paths arrays has no prototype', () => {
    const paths = ['b', 'c', 'a'];
    Object.setPrototypeOf(paths, null);
    expect(sort(paths)).to.deep.equal(['a', 'b', 'c']);
  });

  it('Should work well if the windowsOrder array has no prototype', () => {
    const p1 = 'C:\\a';
    const p2 = '\\\\a\\a\\a';
    const p3 = '\\\\?\\C:\\a';
    const p4 = 'C:a';
    const p5 = '\\a';
    const p6 = 'a';
    const p7 = '~/a';
    const paths = [p1, p2, p3, p4, p5, p6, p7];
    const windowsOrder = ['abs', 'drel', 'nms', 'rel', 'dabs', 'home', 'unc'];
    Object.setPrototypeOf(windowsOrder, null);
    const result = [p5, p4, p3, p6, p1, p7, p2];
    expect(
      windowsSort(paths, { windowsOrder, homePathsSupported: true })
    ).to.deep.equal(result);
  });

  it('Should work well if the posixOrder array has no prototype', () => {
    const p1 = 'a';
    const p2 = '~/a';
    const p3 = '/a';
    const paths = [p1, p2, p3];
    const posixOrder = ['abs', 'rel', 'home'];
    Object.setPrototypeOf(posixOrder, null);
    const result = [p3, p1, p2];
    expect(
      posixSort(paths, { posixOrder, homePathsSupported: true })
    ).to.deep.equal(result);
  });

  it(
    'Should work well with unexpected Posix root types',
    test(function() {
      // Sinon sandbox
      const paths = ['a', 'srv:/b/a', 'srv:/a/b', '/a', 'srv:/a/a'];

      // Standard parse, srv: is simply a directory name in a relative path
      expect(posixSort(paths)).to.deep.equal([
        'a',
        'srv:/a/a',
        'srv:/a/b',
        'srv:/b/a',
        '/a',
      ]);

      // let's make srv:/ root
      const realParse = path.posix.parse;
      this.stub(path.posix, 'parse').callsFake(function(path) {
        const parsedPath = realParse(path);
        if (path.startsWith('srv:/')) {
          parsedPath.root = 'srv:/';
        }
        return parsedPath;
      });
      // unexpected root paths will be at the end of root paths
      expect(posixSort(paths)).to.deep.equal([
        'a',
        '/a',
        'srv:/a/a',
        'srv:/a/b',
        'srv:/b/a',
      ]);
    })
  );

  it(
    'Should work well with unexpected Windows root types',
    test(function() {
      // Sinon sandbox
      const paths = ['a', '@\\b\\a', '@\\a\\b', 'C:\\a', '@\\a\\a'];

      // Standard parse, @ is somehow parsed as a directory name in a relative path
      expect(windowsSort(paths)).to.deep.equal([
        '@\\a\\a',
        '@\\a\\b',
        '@\\b\\a',
        'a',
        'C:\\a',
      ]);

      // let's make @\\ root
      const realParse = path.win32.parse;
      this.stub(path.win32, 'parse').callsFake(function(path) {
        const parsedPath = realParse(path);
        if (path.startsWith('@\\')) {
          parsedPath.root = '@\\';
        }
        return parsedPath;
      });
      // unexpected root paths will be at the end of root paths
      expect(windowsSort(paths)).to.deep.equal([
        'a',
        'C:\\a',
        '@\\a\\a',
        '@\\a\\b',
        '@\\b\\a',
      ]);
    })
  );
});
