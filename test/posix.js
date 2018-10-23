const { expect } = require('chai');
const { permutation } = require('js-combinatorics');
const {
  posix: { sort },
} = require('../index');

// for testing shallow/deep options through all types
const sdTestPrefixes = ['', 'dir/', '/', '/dir/', '~', '~/', '~/dir/'];
function sdTest(paths, options, result) {
  sdTestPrefixes.forEach(prefix => {
    const testPaths = paths.map(p => prefix + p);
    const resultPaths = result.map(p => prefix + p);
    expect(sort(testPaths, options)).to.deep.equal(resultPaths);
    permutation(testPaths)
      .toArray()
      .forEach(p => expect(sort(p, options)).to.deep.equal(resultPaths));
  });
}

describe('Posix Sort function', () => {
  it('Should have default options per specification', () => {
    // detailed tests are below, this is just to check default options, which are:
    // default type order, treat tilde paths as relative, don't keep directory content together
    const paths = ['/a', 'a', 'a.js', 'a/a', '~/a'];
    const result = ['~/a', 'a', 'a/a', 'a.js', '/a'];
    expect(sort(paths)).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p => expect(sort(p)).to.deep.equal(result));
  });

  it('Should not keep directory content together, if both shallowFirst and deepFirst are false #1', () => {
    const paths = ['a/a/a', 'a', 'a.js', 'b', 'a/a.js', 'a/a'];
    const result = ['a', 'a/a', 'a/a/a', 'a/a.js', 'a.js', 'b'];
    sdTest(paths, { shallowFirst: false, deepFirst: false }, result);
  });

  it('Should not keep directory content together, if both shallowFirst and deepFirst are false #2', () => {
    const paths = ['a/a', 'a', 'c', 'b', 'b/a'];
    const result = ['a', 'a/a', 'b', 'b/a', 'c'];
    sdTest(paths, { shallowFirst: false, deepFirst: false }, result);
  });

  it('Should not keep directory content together, if both shallowFirst and deepFirst are false #3', () => {
    const paths = ['b/a', 'a/a', 'c', 'a/b', 'd/a'];
    const result = ['a/a', 'a/b', 'b/a', 'c', 'd/a'];
    sdTest(paths, { shallowFirst: false, deepFirst: false }, result);
  });

  it('Should put subdirectory content after the directory content, if shallowFirst is true #1', () => {
    const paths = ['a/a', 'b', 'd', 'c/a'];
    const result = ['b', 'd', 'a/a', 'c/a'];
    sdTest(paths, { shallowFirst: true }, result);
  });

  it('Should put subdirectory content after the directory content, if shallowFirst is true #2', () => {
    const paths = ['a/b', 'a/a', 'b', 'a/a/a', 'b/a'];
    const result = ['b', 'a/a', 'a/b', 'a/a/a', 'b/a'];
    sdTest(paths, { shallowFirst: true }, result);
  });

  it('Should put subdirectory content after the directory content, if shallowFirst is true #3', () => {
    const paths = ['b/a', 'a/b', 'b', 'a'];
    const result = ['a', 'b', 'a/b', 'b/a'];
    sdTest(paths, { shallowFirst: true }, result);
  });

  it('Should put subdirectory content after the directory content, if shallowFirst is true #4', () => {
    const paths = ['a/b', 'a/a', 'a/a/b', 'b/a', 'a/b/a', 'a/a/a'];
    const result = ['a/a', 'a/b', 'a/a/a', 'a/a/b', 'a/b/a', 'b/a'];
    sdTest(paths, { shallowFirst: true }, result);
  });

  it('Should put subdirectory content before the directory content, if deepFirst is true #1', () => {
    const paths = ['b/d', 'b', 'a', 'd/d'];
    const result = ['b/d', 'd/d', 'a', 'b'];
    sdTest(paths, { deepFirst: true }, result);
  });

  it('Should put subdirectory content before the directory content, if deepFirst is true #2', () => {
    const paths = ['b/a', 'b/b', 'a', 'b/b/b', 'a/b'];
    const result = ['a/b', 'b/b/b', 'b/a', 'b/b', 'a'];
    sdTest(paths, { deepFirst: true }, result);
  });

  it('Should put subdirectory content before the directory content, if deepFirst is true #3', () => {
    const paths = ['b/a', 'a/b', 'b', 'a'];
    const result = ['a/b', 'b/a', 'a', 'b'];
    sdTest(paths, { deepFirst: true }, result);
  });

  it('Should put subdirectory content before the directory content, if deepFirst is true #4', () => {
    const paths = ['a/b', 'a/a', 'a/a/b', 'b/a', 'a/b/a', 'a/a/a'];
    const result = ['a/a/a', 'a/a/b', 'a/b/a', 'a/a', 'a/b', 'b/a'];
    sdTest(paths, { deepFirst: true }, result);
  });

  it('Should treat paths starting with tilde as relative paths, if homePathsSupported is false', () => {
    const paths = ['a', '~/a', '/a', '~'];
    const result = ['~', '~/a', 'a', '/a'];
    expect(
      sort(paths, {
        homePathsSupported: false,
        posixOrder: ['rel', 'abs', 'home'],
      })
    ).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(
          sort(p, {
            homePathsSupported: false,
            posixOrder: ['rel', 'abs', 'home'],
          })
        ).to.deep.equal(result)
      );
  });

  it('Should treat paths starting with tilde as home paths, if homePathsSupported is true', () => {
    const paths = ['a', '~/a', '/a', '~'];
    const result = ['a', '/a', '~', '~/a'];
    expect(
      sort(paths, {
        homePathsSupported: true,
        posixOrder: ['rel', 'abs', 'home'],
      })
    ).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(
          sort(p, {
            homePathsSupported: true,
            posixOrder: ['rel', 'abs', 'home'],
          })
        ).to.deep.equal(result)
      );
  });

  it('Should order path types as specified with the posixOrder argument', () => {
    const paths = ['~/a', '/a', 'a', '~', 'a/a', '/'];
    expect(
      sort(paths, {
        homePathsSupported: true,
        posixOrder: ['abs', 'rel', 'home'],
      })
    ).to.deep.equal(['/', '/a', 'a', 'a/a', '~', '~/a']);

    const pathTypeMap = new Map([
      ['abs', ['/', '/a']],
      ['rel', ['a', 'a/a']],
      ['home', ['~', '~/a']],
    ]);
    permutation(['rel', 'home', 'abs'])
      .toArray()
      .forEach(posixOrder => {
        const result = [];
        posixOrder.forEach(pathType =>
          result.push(...pathTypeMap.get(pathType))
        );
        permutation(paths)
          .toArray()
          .forEach(p =>
            expect(
              sort(p, {
                homePathsSupported: true,
                posixOrder,
              })
            ).to.deep.equal(result)
          );
      });
  });

  it('Should use normalized versions of paths', () => {
    const paths = ['b', 'a/a', 'a', './/b', './a'];
    const result = ['./a', 'a', './/b', 'b', 'a/a'];

    expect(
      sort(paths, {
        shallowFirst: true,
      })
    ).to.deep.equal(result);

    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(
          sort(p, {
            shallowFirst: true,
          })
        ).to.deep.equal(result)
      );
  });
});
