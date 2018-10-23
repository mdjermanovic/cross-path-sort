const { expect } = require('chai');
const { sort } = require('../index');

describe('Sort function options validation', () => {
  it('Should throw if pathKey is not a string', () => {
    expect(() => sort(['foo'], { pathKey: true })).to.throw();
    expect(() => sort(['foo'], { pathKey: null })).to.throw();
    expect(() => sort(['foo'], { pathKey: {} })).to.throw();
    expect(() => sort(['foo'], { pathKey: ['bar'] })).to.throw();
  });

  it('Should throw if both shallowFirst and deepFirst are true', () => {
    expect(() =>
      sort(['foo'], { shallowFirst: true, deepFirst: true })
    ).to.throw();
  });

  it('Should throw if posixOrder is not an array', () => {
    expect(() => sort(['foo'], { posixOrder: true })).to.throw();
    expect(() => sort(['foo'], { posixOrder: null })).to.throw();
    expect(() => sort(['foo'], { posixOrder: 5 })).to.throw();
    expect(() => sort(['foo'], { posixOrder: {} })).to.throw();
    expect(() => sort(['foo'], { posixOrder: 'bar' })).to.throw();
  });

  it('Should throw if posixOrder has less than 3 elements', () => {
    expect(() => sort(['foo'], { posixOrder: [] })).to.throw();
    expect(() => sort(['foo'], { posixOrder: ['bar'] })).to.throw();
    expect(() => sort(['foo'], { posixOrder: ['rel'] })).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'home'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['home', 'abs'],
      })
    ).to.throw();
  });

  it('Should throw if posixOrder has more than 3 elements', () => {
    expect(() =>
      sort(['foo'], {
        posixOrder: ['bar', 'bar', 'bar', 'bar'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['bar', 'rel', 'home', 'abs'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'home', 'abs', 'bar'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'home', 'bar', 'abs'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'rel', 'home', 'abs'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'home', 'abs', 'rel'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'home', 'home', 'abs'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'home', 'abs', 'abs'],
      })
    ).to.throw();
  });

  it('Should throw if posixOrder has 3 elements, but some of them are not valid', () => {
    expect(() =>
      sort(['foo'], {
        posixOrder: ['bar', 'home', 'abs'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'home', 'bar'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'bar', 'abs'],
      })
    ).to.throw();
  });

  it('Should throw if posixOrder has 3 elements, but some of them are duplicates', () => {
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'rel', 'abs'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['home', 'home', 'abs'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'home', 'home'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        posixOrder: ['rel', 'abs', 'abs'],
      })
    ).to.throw();
  });

  it('Should throw if windowsOrder is not an array', () => {
    expect(() => sort(['foo'], { windowsOrder: true })).to.throw();
    expect(() => sort(['foo'], { windowsOrder: null })).to.throw();
    expect(() => sort(['foo'], { windowsOrder: 5 })).to.throw();
    expect(() => sort(['foo'], { windowsOrder: {} })).to.throw();
    expect(() => sort(['foo'], { windowsOrder: 'bar' })).to.throw();
  });

  it('Should throw if windowsOrder has less than 7 elements', () => {
    expect(() => sort(['foo'], { windowsOrder: [] })).to.throw();
    expect(() => sort(['foo'], { windowsOrder: ['bar'] })).to.throw();
    expect(() => sort(['foo'], { windowsOrder: ['rel'] })).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['rel', 'home', 'abs', 'drel', 'dabs', 'unc'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['home', 'abs', 'drel', 'dabs', 'unc', 'nms'],
      })
    ).to.throw();
  });

  it('Should throw if windowsOrder has more than 7 elements', () => {
    expect(() =>
      sort(['foo'], {
        windowsOrder: [
          'bar1',
          'bar2',
          'bar3',
          'bar4',
          'bar5',
          'bar6',
          'bar7',
          'bar8',
        ],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: [
          'bar',
          'rel',
          'home',
          'abs',
          'drel',
          'dabs',
          'unc',
          'nms',
        ],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: [
          'rel',
          'home',
          'abs',
          'drel',
          'bar',
          'dabs',
          'unc',
          'nms',
        ],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: [
          'rel',
          'home',
          'abs',
          'drel',
          'dabs',
          'unc',
          'nms',
          'bar',
        ],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: [
          'rel',
          'home',
          'rel',
          'abs',
          'drel',
          'dabs',
          'unc',
          'nms',
        ],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: [
          'rel',
          'home',
          'abs',
          'drel',
          'abs',
          'dabs',
          'unc',
          'nms',
        ],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: [
          'rel',
          'home',
          'abs',
          'drel',
          'dabs',
          'unc',
          'nms',
          'nms',
        ],
      })
    ).to.throw();
  });

  it('Should throw if windowsOrder has 7 elements, but some of them are not valid', () => {
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['bar', 'home', 'abs', 'drel', 'dabs', 'unc', 'nms'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['rel', 'home', 'bar', 'drel', 'dabs', 'unc', 'nms'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['rel', 'home', 'abs', 'drel', 'dabs', 'unc', 'bar'],
      })
    ).to.throw();
  });

  it('Should throw if windowsOrder has 7 valid elements, but some of them are duplicates', () => {
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['rel', 'rel', 'rel', 'rel', 'rel', 'rel', 'rel'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['abs', 'abs', 'abs', 'abs', 'abs', 'abs', 'abs'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['nms', 'nms', 'nms', 'nms', 'nms', 'nms', 'nms'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['rel', 'rel', 'abs', 'drel', 'dabs', 'unc', 'nms'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['rel', 'home', 'home', 'drel', 'dabs', 'unc', 'nms'],
      })
    ).to.throw();
    expect(() =>
      sort(['foo'], {
        windowsOrder: ['rel', 'home', 'abs', 'drel', 'dabs', 'unc', 'unc'],
      })
    ).to.throw();
  });

  it('Should throw if segmentCompareFn is not a function', () => {
    expect(() => sort(['foo'], { segmentCompareFn: true })).to.throw();
    expect(() => sort(['foo'], { segmentCompareFn: null })).to.throw();
    expect(() => sort(['foo'], { segmentCompareFn: {} })).to.throw();
    expect(() => sort(['foo'], { segmentCompareFn: 'bar' })).to.throw();
    expect(() => sort(['foo'], { segmentCompareFn: ['bar'] })).to.throw();
  });
});
