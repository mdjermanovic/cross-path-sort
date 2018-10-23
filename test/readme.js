const { expect } = require('chai');
const {
  sort,
  posix: { sort: posixSort },
  windows: { sort: windowsSort },
} = require('../index');

const pathsExample2 = [
  'one.js',
  'test/one_spec.js',
  '/mylibs/hash.js',
  'two.js',
  '/mylibs/encode/url.js',
  '/mylibs/assign.js',
  'test/shared/init.js',
  'test/two_spec.js',
  'config/env.js',
];
const pathsExample3 = ['b\\a.js', 'c.js', 'a.js'];

describe('README - Sort function', () => {
  it('Should work well for readme example #1.1', () => {
    expect(
      sort(['one.js', 'test/one_spec.js', 'test/two_spec.js', 'two.js'], {
        shallowFirst: true,
      })
    ).to.deep.equal([
      'one.js',
      'two.js',
      'test/one_spec.js',
      'test/two_spec.js',
    ]);
  });

  it('Should work well for readme example #1.2', () => {
    expect(
      windowsSort(['api.js', 'C:\\util\\hash.js', 'engine.js'], {
        shallowFirst: true,
      })
    ).to.deep.equal(['api.js', 'engine.js', 'C:\\util\\hash.js']);
  });

  it('Should work well for readme example #2.1', () => {
    const result = [
      'one.js',
      'two.js',
      'config/env.js',
      'test/one_spec.js',
      'test/two_spec.js',
      'test/shared/init.js',
      '/mylibs/assign.js',
      '/mylibs/hash.js',
      '/mylibs/encode/url.js',
    ];

    expect(sort(pathsExample2, { shallowFirst: true })).to.deep.equal(result);
    expect(posixSort(pathsExample2, { shallowFirst: true })).to.deep.equal(
      result
    );
    expect(windowsSort(pathsExample2, { shallowFirst: true })).to.deep.equal(
      result
    );
  });

  it('Should work well for readme example #2.2', () => {
    const result = [
      'config/env.js',
      'test/shared/init.js',
      'test/one_spec.js',
      'test/two_spec.js',
      'one.js',
      'two.js',
      '/mylibs/encode/url.js',
      '/mylibs/assign.js',
      '/mylibs/hash.js',
    ];

    expect(sort(pathsExample2, { deepFirst: true })).to.deep.equal(result);
    expect(posixSort(pathsExample2, { deepFirst: true })).to.deep.equal(result);
    expect(windowsSort(pathsExample2, { deepFirst: true })).to.deep.equal(
      result
    );
  });

  it('Should work well for readme example #2.3', () => {
    const result = [
      'config/env.js',
      'one.js',
      'test/one_spec.js',
      'test/shared/init.js',
      'test/two_spec.js',
      'two.js',
      '/mylibs/assign.js',
      '/mylibs/encode/url.js',
      '/mylibs/hash.js',
    ];

    expect(sort(pathsExample2)).to.deep.equal(result);
    expect(posixSort(pathsExample2)).to.deep.equal(result);
    expect(windowsSort(pathsExample2)).to.deep.equal(result);
  });

  it('Should work well for readme example #3.1', () => {
    const result = ['a.js', 'c.js', 'b\\a.js'];
    expect(windowsSort(pathsExample3, { shallowFirst: true })).to.deep.equal(
      result
    );
  });

  it('Should work well for readme example #3.2', () => {
    const result = ['a.js', 'b\\a.js', 'c.js'];
    expect(posixSort(pathsExample3, { shallowFirst: true })).to.deep.equal(
      result
    );
  });

  it('Should work well for readme example #4.1', () => {
    const obj1 = { file: 'c.js' };
    const obj2 = { file: 'b/a.js' };
    const obj3 = {};
    const obj4 = { file: 'a.js' };
    const paths = [obj1, obj2, obj3, obj4];

    const sortedPaths = sort(paths, {
      pathKey: 'file',
      shallowFirst: true,
    });

    expect(sortedPaths).to.deep.equal([obj4, obj1, obj2, obj3]);
  });

  it('Should work well for readme example #5.1', () => {
    const result = [
      '/mylibs/assign.js',
      '/mylibs/hash.js',
      '/mylibs/encode/url.js',
      'one.js',
      'two.js',
      'config/env.js',
      'test/one_spec.js',
      'test/two_spec.js',
      'test/shared/init.js',
    ];

    const shallowFirst = true;
    const posixOrder = ['abs', 'home', 'rel'];
    const windowsOrder = ['abs', 'dabs', 'unc', 'nms', 'drel', 'home', 'rel'];

    expect(
      sort(pathsExample2, { shallowFirst, posixOrder, windowsOrder })
    ).to.deep.equal(result);
    expect(
      posixSort(pathsExample2, { shallowFirst, posixOrder, windowsOrder })
    ).to.deep.equal(result);
    expect(
      windowsSort(pathsExample2, { shallowFirst, posixOrder, windowsOrder })
    ).to.deep.equal(result);
  });
});
