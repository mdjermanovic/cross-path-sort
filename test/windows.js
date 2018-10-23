const { expect } = require('chai');
const { permutation } = require('js-combinatorics');
const {
  windows: { sort },
} = require('../index');

// for testing shallow/deep options through all types
const sdTestPrefixes = [
  '',
  'dir\\',
  '\\',
  '\\dir\\',
  '~',
  '~\\',
  '~\\dir\\',
  'C:',
  'C:dir\\',
  'C:\\',
  'C:\\dir\\',
  '\\\\server\\share\\',
  '\\\\server\\share\\dir\\',
  '\\\\?\\C:\\',
  '\\\\?\\C:\\dir\\',
  '\\\\.\\C:\\',
  '\\\\.\\C:\\dir\\',
];
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

if (describe === 6) {
  sdTest();
}

describe('Windows Sort function', () => {
  it('Should have default options per specification', () => {
    // detailed tests are below, this is just to check default options, which are:
    // default type order, treat tilde paths as relative, don't keep directory content together
    const paths = [
      'C:\\a',
      'a\\a',
      'a',
      'C:a',
      'a.js',
      '~\\a',
      '\\\\.\\C:\\a',
      '\\\\server\\share\\a',
      '\\\\?\\C:\\a',
      '\\a',
    ];
    const result = [
      '~\\a',
      'a',
      'a\\a',
      'a.js',
      '\\a',
      'C:a',
      'C:\\a',
      '\\\\server\\share\\a',
      '\\\\?\\C:\\a',
      '\\\\.\\C:\\a',
    ];
    expect(sort(paths)).to.deep.equal(result);
  });

  it('Should not keep directory content together, if both shallowFirst and deepFirst are false #1', () => {
    const paths = ['a\\a\\a', 'a', 'a.js', 'b', 'a\\a.js', 'a\\a'];
    const result = ['a', 'a\\a', 'a\\a\\a', 'a\\a.js', 'a.js', 'b'];
    sdTest(paths, { shallowFirst: false, deepFirst: false }, result);
  });

  it('Should not keep directory content together, if both shallowFirst and deepFirst are false #2', () => {
    const paths = ['a\\a', 'a', 'c', 'b', 'b\\a'];
    const result = ['a', 'a\\a', 'b', 'b\\a', 'c'];
    sdTest(paths, { shallowFirst: false, deepFirst: false }, result);
  });

  it('Should not keep directory content together, if both shallowFirst and deepFirst are false #3', () => {
    const paths = ['b\\a', 'a\\a', 'c', 'a\\b', 'd\\a'];
    const result = ['a\\a', 'a\\b', 'b\\a', 'c', 'd\\a'];
    sdTest(paths, { shallowFirst: false, deepFirst: false }, result);
  });

  it('Should put subdirectory content after the directory content, if shallowFirst is true #1', () => {
    const paths = ['a\\a', 'b', 'd', 'c\\a'];
    const result = ['b', 'd', 'a\\a', 'c\\a'];
    sdTest(paths, { shallowFirst: true }, result);
  });

  it('Should put subdirectory content after the directory content, if shallowFirst is true #2', () => {
    const paths = ['a\\b', 'a\\a', 'b', 'a\\a\\a', 'b\\a'];
    const result = ['b', 'a\\a', 'a\\b', 'a\\a\\a', 'b\\a'];
    sdTest(paths, { shallowFirst: true }, result);
  });

  it('Should put subdirectory content after the directory content, if shallowFirst is true #3', () => {
    const paths = ['b\\a', 'a\\b', 'b', 'a'];
    const result = ['a', 'b', 'a\\b', 'b\\a'];
    sdTest(paths, { shallowFirst: true }, result);
  });

  it('Should put subdirectory content after the directory content, if shallowFirst is true #4', () => {
    const paths = ['a\\b', 'a\\a', 'a\\a\\b', 'b\\a', 'a\\b\\a', 'a\\a\\a'];
    const result = ['a\\a', 'a\\b', 'a\\a\\a', 'a\\a\\b', 'a\\b\\a', 'b\\a'];
    sdTest(paths, { shallowFirst: true }, result);
  });

  it('Should put subdirectory content before the directory content, if deepFirst is true #1', () => {
    const paths = ['b\\d', 'b', 'a', 'd\\d'];
    const result = ['b\\d', 'd\\d', 'a', 'b'];
    sdTest(paths, { deepFirst: true }, result);
  });

  it('Should put subdirectory content before the directory content, if deepFirst is true #2', () => {
    const paths = ['b\\a', 'b\\b', 'a', 'b\\b\\b', 'a\\b'];
    const result = ['a\\b', 'b\\b\\b', 'b\\a', 'b\\b', 'a'];
    sdTest(paths, { deepFirst: true }, result);
  });

  it('Should put subdirectory content before the directory content, if deepFirst is true #3', () => {
    const paths = ['b\\a', 'a\\b', 'b', 'a'];
    const result = ['a\\b', 'b\\a', 'a', 'b'];
    sdTest(paths, { deepFirst: true }, result);
  });

  it('Should put subdirectory content before the directory content, if deepFirst is true #4', () => {
    const paths = ['a\\b', 'a\\a', 'a\\a\\b', 'b\\a', 'a\\b\\a', 'a\\a\\a'];
    const result = ['a\\a\\a', 'a\\a\\b', 'a\\b\\a', 'a\\a', 'a\\b', 'b\\a'];
    sdTest(paths, { deepFirst: true }, result);
  });

  it('Should treat paths starting with tilde as relative paths, if homePathsSupported is false', () => {
    const paths = ['a', '~\\a', '\\a', '~'];
    const result = ['~', '~\\a', 'a', '\\a'];
    expect(
      sort(paths, {
        homePathsSupported: false,
        windowsOrder: ['rel', 'abs', 'drel', 'dabs', 'unc', 'nms', 'home'],
      })
    ).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(
          sort(p, {
            homePathsSupported: false,
            windowsOrder: ['rel', 'abs', 'drel', 'dabs', 'unc', 'nms', 'home'],
          })
        ).to.deep.equal(result)
      );
  });

  it('Should treat paths starting with tilde as home paths, if homePathsSupported is true', () => {
    const paths = ['a', '~\\a', '\\a', '~'];
    const result = ['a', '\\a', '~', '~\\a'];
    expect(
      sort(paths, {
        homePathsSupported: true,
        windowsOrder: ['rel', 'abs', 'drel', 'dabs', 'unc', 'nms', 'home'],
      })
    ).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(
          sort(p, {
            homePathsSupported: true,
            windowsOrder: ['rel', 'abs', 'drel', 'dabs', 'unc', 'nms', 'home'],
          })
        ).to.deep.equal(result)
      );
  });

  it('Should correctly compare drive letters in drel type of paths', () => {
    const paths = ['D:a', 'C:b', 'D:b', 'C:a\\a', 'C:a', 'D:'];
    const result = ['C:a', 'C:b', 'C:a\\a', 'D:', 'D:a', 'D:b'];
    expect(sort(paths, { shallowFirst: true })).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(sort(p, { shallowFirst: true })).to.deep.equal(result)
      );
  });

  it('Should correctly compare drive letters in dabs type of paths', () => {
    const paths = ['D:\\a', 'C:\\b', 'D:\\b', 'C:\\a\\a', 'C:\\a', 'D:\\'];
    const result = ['C:\\a', 'C:\\b', 'C:\\a\\a', 'D:\\', 'D:\\a', 'D:\\b'];
    expect(sort(paths, { shallowFirst: true })).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(sort(p, { shallowFirst: true })).to.deep.equal(result)
      );
  });

  it('Should correctly compare servers in unc type of paths', () => {
    const paths = [
      '\\\\srv2\\share1\\a',
      '\\\\srv1\\share2\\b',
      '\\\\srv2\\share1\\b',
      '\\\\srv1\\share2\\a\\a',
      '\\\\srv1\\share2\\a',
      '\\\\srv2\\share1',
    ];
    const result = [
      '\\\\srv1\\share2\\a',
      '\\\\srv1\\share2\\b',
      '\\\\srv1\\share2\\a\\a',
      '\\\\srv2\\share1',
      '\\\\srv2\\share1\\a',
      '\\\\srv2\\share1\\b',
    ];
    expect(sort(paths, { shallowFirst: true })).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(sort(p, { shallowFirst: true })).to.deep.equal(result)
      );
  });

  it('Should correctly compare shared folders in unc type of paths', () => {
    const paths = [
      '\\\\server\\share2\\a',
      '\\\\server\\share1\\b',
      '\\\\server\\share2\\b',
      '\\\\server\\share1\\a\\a',
      '\\\\server\\share1\\a',
      '\\\\server\\share2',
    ];
    const result = [
      '\\\\server\\share1\\a',
      '\\\\server\\share1\\b',
      '\\\\server\\share1\\a\\a',
      '\\\\server\\share2',
      '\\\\server\\share2\\a',
      '\\\\server\\share2\\b',
    ];
    expect(sort(paths, { shallowFirst: true })).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(sort(p, { shallowFirst: true })).to.deep.equal(result)
      );
  });

  it('Should correctly compare segments in nms type of paths', () => {
    const paths = [
      '\\\\?\\D:\\a',
      '\\\\?\\C:\\b',
      '\\\\?\\D:\\b',
      '\\\\?\\C:\\a\\a',
      '\\\\?\\C:\\a',
      '\\\\?\\D:',
    ];
    const result = [
      '\\\\?\\C:\\a',
      '\\\\?\\C:\\b',
      '\\\\?\\C:\\a\\a',
      '\\\\?\\D:',
      '\\\\?\\D:\\a',
      '\\\\?\\D:\\b',
    ];
    expect(sort(paths, { shallowFirst: true })).to.deep.equal(result);
    permutation(paths)
      .toArray()
      .forEach(p =>
        expect(sort(p, { shallowFirst: true })).to.deep.equal(result)
      );
  });

  it('Should order path types as specified with the windowsOrder argument', () => {
    const paths = [
      '~\\a',
      'C:a',
      '\\a',
      'a',
      '\\\\?\\C:\\a',
      '\\\\server\\share\\a',
      'C:\\a',
    ];
    expect(
      sort(paths, {
        homePathsSupported: true,
        windowsOrder: ['abs', 'unc', 'rel', 'nms', 'drel', 'home', 'dabs'],
      })
    ).to.deep.equal([
      '\\a',
      '\\\\server\\share\\a',
      'a',
      '\\\\?\\C:\\a',
      'C:a',
      '~\\a',
      'C:\\a',
    ]);
  });

  it('Should use normalized versions of paths #1', () => {
    const paths = ['b', 'a\\a', 'a', '.\\\\b', '.\\a'];
    const result = ['.\\a', 'a', '.\\\\b', 'b', 'a\\a'];

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

  it('Should use normalized versions of paths #2', () => {
    // forward slash instead of the backslash
    const paths = [
      'a/a',
      '/a/a',
      'b',
      '/a',
      'C:/b',
      '//?/C:/b',
      'a/b',
      '//?/C:/a',
      '/b',
      '//server/share/b',
      'C:/a',
      '//server/share/a',
    ];
    expect(
      sort(paths, {
        shallowFirst: true,
        windowsOrder: ['abs', 'unc', 'rel', 'nms', 'drel', 'home', 'dabs'],
      })
    ).to.deep.equal([
      '/a',
      '/b',
      '/a/a',
      '//server/share/a',
      '//server/share/b',
      'b',
      'a/a',
      'a/b',
      '//?/C:/a',
      '//?/C:/b',
      'C:/a',
      'C:/b',
    ]);
  });
});
