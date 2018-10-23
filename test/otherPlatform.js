const { expect } = require('chai');
const path = require('path');
const { sort } = require('..');
const sinon = require('sinon');
const sinonTest = require('sinon-test');

const test = sinonTest(sinon);

describe('Unknown platform - Sort function', () => {
  it(
    'Should work well on RISC OS',
    test(function() {
      // Sinon sandbox
      // RISCOS-like paths
      const paths = [
        'a.b/js',
        'ADFS::HardDisc.$.b/js',
        'ADFS::HardDisc.$.a.a/js',
        'b/js',
        'ADFS::HardDisc.$.a/js',
        'b.a/js',
        'a.a/js',
        'd/js',
      ];

      this.stub(path, 'sep').value('.');
      this.stub(path, 'normalize').callsFake(function(path) {
        return path;
      });
      this.stub(path, 'parse').callsFake(function(path) {
        let root = '';
        let dir = '';
        let base = '';
        const lastSepIndex = path.lastIndexOf('.');
        if (lastSepIndex === -1) {
          base = path;
        } else {
          dir = path.slice(0, lastSepIndex);
          base = path.slice(lastSepIndex + 1);
          const rootIndex = path.indexOf('$');
          if (rootIndex !== -1) {
            root = path.slice(0, rootIndex);
          }
        }
        return { root, dir, base };
      });
      expect(sort(paths, { shallowFirst: true })).to.deep.equal([
        'b/js',
        'd/js',
        'a.a/js',
        'a.b/js',
        'b.a/js',
        'ADFS::HardDisc.$.a/js',
        'ADFS::HardDisc.$.b/js',
        'ADFS::HardDisc.$.a.a/js',
      ]);
    })
  );
});
