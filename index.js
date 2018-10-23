/**
 * @fileoverview Cross-platform file path sorting library for Node.js
 * @author Milos Djermanovic <milos.djermanovic@gmail.com>
 */

'use strict';

const nodePathAPI = require('path');

// Path types. Order of keys defines default order of path types in the sorted array.
const posixPathType = {
  rel: 1, // relative
  home: 2, // ~/... ~user/...
  abs: 3, // /...
};
const windowsPathType = {
  rel: 1, // relative
  home: 2, // ~\...
  abs: 3, // \...
  drel: 4, // C:...
  dabs: 5, // C:\...
  unc: 6, // \\server\share\...
  nms: 7, // \\?\... \\.\...
};
const otherPlatformPathType = {
  nonroot: 1,
};
const otherRoot = 0;

/**
 * Sort options object.
 *
 * @typedef {Object} SortOptions
 * @property {string} [pathKey] Key of a property whose value is path string.
 * @property {boolean} [shallowFirst] If true, content of a directory will come before the content of its subdirectories.
 * @property {boolean} [deepFirst] If true, content of a directory will come after the content of its subdirectories.
 * @property {boolean} [homePathsSupported] If true, paths starting with '~' will be treated as 'home' paths.
 * @property {string[]} [posixOrder] POSIX path types order. Permutation of ['rel', 'home', 'abs'].
 * @property {string[]} [windowsOrder] Windows path types order. Permutation of ['rel', 'home', 'abs', 'drel', 'dabs', 'unc', 'nms'].
 * @property {Function} [segmentCompareFn] Function used to compare path segments.
 */

/**
 * Internal cross-platform file path sorting function.
 *
 * @param {Object} pathAPI Provides platform-specific normalize(), parse() and sep.
 * @param {(string[]|any[])} paths Array of path strings or objects containing path strings.
 * @param {SortOptions} [options] Sort options.
 * @returns {(string[]|any[])} Sorted array.
 */
function _sort(
  pathAPI,
  paths,
  {
    pathKey,
    shallowFirst = false,
    deepFirst = false,
    homePathsSupported = false,
    posixOrder,
    windowsOrder,
    segmentCompareFn = (a, b) => a.localeCompare(b),
  } = {}
) {
  validateOptions();
  // Never throw an error caused by the paths argument. It can be anything, and it can contain anything.
  if (!Array.isArray(paths)) return paths;

  const pathOrder = preparePathOrder();
  // Never call prototype methods on entry arrays and objects directly.
  const parsedPaths = [].map.call(paths, parse);
  // Both map and sort will preserve holes. Sort will put holes at the end.
  return parsedPaths.sort(compare).map(parsedPath => parsedPath.original);

  function validateOptions() {
    if (pathKey !== undefined && typeof pathKey !== 'string') {
      throw new Error(
        'Invalid arguments: pathKey must be a string or undefined.'
      );
    }
    if (deepFirst && shallowFirst) {
      throw new Error(
        'Invalid arguments: Only one of shallowFirst and deepFirst can have a truthy value.'
      );
    }
    validateOrder(posixPathType, posixOrder, 'posixOrder');
    validateOrder(windowsPathType, windowsOrder, 'windowsOrder');
    if (typeof segmentCompareFn !== 'function') {
      throw new Error(
        'Invalid argument: segmentCompareFunction must be a function or undefined.'
      );
    }
  }

  function validateOrder(type, order, paramName) {
    if (order !== undefined) {
      if (!Array.isArray(order)) {
        throw new Error(
          `Invalid arguments: ${paramName} must be an array or undefined.`
        );
      }
      const keys = Object.keys(type);
      if (
        keys.length !== order.length ||
        !keys.every(key => [].indexOf.call(order, key) >= 0)
      ) {
        throw new Error(
          `Invalid arguments: ${paramName} must be a permutation of ${JSON.stringify(
            keys
          )} array or undefined.`
        );
      }
    }
  }

  function preparePathOrder() {
    let order;
    // Prepare sort order by path type. Map over keys can be replaced with Object.values from ES2017
    if (pathAPI.sep === '/') {
      // Posix
      if (posixOrder) {
        // Custom
        order = [].map.call(posixOrder, key => posixPathType[key]);
      } else {
        // Predefined
        order = Object.keys(posixPathType).map(key => posixPathType[key]);
      }
    } else if (pathAPI.sep === '\\') {
      // Windows
      if (windowsOrder) {
        // Custom
        order = [].map.call(windowsOrder, key => windowsPathType[key]);
      } else {
        // Predefined
        order = Object.keys(windowsPathType).map(key => windowsPathType[key]);
      }
    } else {
      // Other platform
      order = Object.keys(otherPlatformPathType).map(
        key => otherPlatformPathType[key]
      );
    }
    // Paths with unrecognized parsed root will be at the end. It should never happen, though.
    order.push(otherRoot);
    return order;
  }

  function parse(path) {
    const original = path;

    // Find the path string in the given element
    let pathString = undefined;
    if (typeof path === 'string') {
      pathString = path;
    } else if (
      pathKey !== undefined &&
      path !== null &&
      typeof path === 'object' &&
      typeof path[pathKey] === 'string'
    ) {
      pathString = path[pathKey];
    }

    if (pathString === undefined) {
      // Unreadable element
      return { original, pathString };
    }

    // Parse and normalize never throw if you send a string, and always return strings
    const normalizedPathString = pathAPI.normalize(pathString);
    let { root, dir, base } = pathAPI.parse(normalizedPathString);

    let pathType = undefined;
    if (pathAPI.sep === '/') {
      // Posix
      if (root) {
        if (root === '/') {
          pathType = posixPathType.abs;
          // Optimization. Also, without this line files from the root dir would be
          // wrongly treated as files from /""/ (empty name dir in the root dir)
          dir = dir.slice(1);
        } else {
          pathType = otherRoot;
        }
      } else {
        if (homePathsSupported && pathString.startsWith('~')) {
          pathType = posixPathType.home;
        } else {
          pathType = posixPathType.rel;
        }
      }
    } else if (pathAPI.sep === '\\') {
      // Windows
      if (root) {
        if (root.startsWith('\\\\')) {
          if (root.length > 2 && (root[2] === '?' || root[2] === '.')) {
            // There is no need to check root[3], it must be '\\'
            // Otherwise, normalize() and parse() would produce a completely different root
            pathType = windowsPathType.nms;
          } else {
            pathType = windowsPathType.unc;
          }
          if (dir.endsWith('\\')) {
            // Optimization. Also, remove separator from the end to avoid the empty name subdir problem
            dir = dir.slice(2, -1);
          } else {
            // Optimization
            dir = dir.slice(2);
          }
        } else if (root.startsWith('\\')) {
          pathType = windowsPathType.abs;
          // Optimization. Also, without this line files from the root dir would be
          // wrongly treated as files from \""\ (empty name dir in the root dir)
          dir = dir.slice(1);
        } else if (root.endsWith(':\\')) {
          pathType = windowsPathType.dabs;
          if (dir.endsWith('\\')) {
            // This can be only the root dir (e.g. C:\), that's how parse() works.
            // Remove ':' and also remove separator from the end to avoid the empty name subdir problem
            dir = `${dir.slice(0, root.length - 2)}${dir.slice(
              root.length - 1,
              -1
            )}`;
          } else {
            // Remove ':'
            dir = `${dir.slice(0, root.length - 2)}${dir.slice(
              root.length - 1
            )}`;
          }
        } else if (root.endsWith(':')) {
          pathType = windowsPathType.drel;
          if (dir.length === root.length) {
            // Remove ':'
            dir = dir.slice(0, -1);
          } else {
            // Remove ':' and add `\\` between drive and subdir as they should be individually compared
            dir = `${dir.slice(0, root.length - 1)}\\${dir.slice(root.length)}`;
          }
        } else {
          pathType = otherRoot;
        }
      } else {
        if (homePathsSupported && pathString.startsWith('~')) {
          pathType = windowsPathType.home;
        } else {
          pathType = windowsPathType.rel;
        }
      }
    } else {
      // Other platform
      if (root) {
        pathType = otherRoot;
      } else {
        pathType = otherPlatformPathType.nonroot;
      }
    }

    // Root is always included in dir
    const dirs = dir ? dir.split(pathAPI.sep) : [];

    return { original, pathString, normalizedPathString, pathType, dirs, base };
  }

  function compare(
    {
      pathString: leftPathString,
      normalizedPathString: leftNormalizedPathString,
      pathType: leftPathType,
      dirs: leftDirs,
      base: leftBase,
    },
    {
      pathString: rightPathString,
      normalizedPathString: rightNormalizedPathString,
      pathType: rightPathType,
      dirs: rightDirs,
      base: rightBase,
    }
  ) {
    // Unreadable elements will be at the end, before holes
    const leftUnreadable = leftPathString === undefined ? 1 : 0;
    const rightUnreadable = rightPathString === undefined ? -1 : 0;
    if (leftUnreadable || rightUnreadable) {
      return leftUnreadable + rightUnreadable;
    }

    // Different types of paths are never directly compared
    if (leftPathType !== rightPathType) {
      // Find first in the list, which should always contain both.
      for (const pathType of pathOrder) {
        if (pathType === leftPathType) return -1;
        if (pathType === rightPathType) return 1;
      }
    }

    // Same types of paths. Compare dirs first.
    for (let i = 0; i < leftDirs.length && i < rightDirs.length; i++) {
      const result = segmentCompareFn(leftDirs[i], rightDirs[i]);
      if (result !== 0) return result;
    }

    // Dirs match, but one path might be deeper.
    if (leftDirs.length === rightDirs.length) {
      // Dirs completely match.
      const result = segmentCompareFn(leftBase, rightBase);
      if (result !== 0) return result;
      // Two normalized paths are equal, compare full unnormalized versions.
      return segmentCompareFn(leftPathString, rightPathString);
    } else if (!(deepFirst || shallowFirst)) {
      // Base vs directory
      const result =
        leftDirs.length < rightDirs.length
          ? segmentCompareFn(leftBase, rightDirs[leftDirs.length])
          : segmentCompareFn(leftDirs[rightDirs.length], rightBase);
      if (result !== 0) return result;
      // Directory vs its content, compare full normalized paths
      return segmentCompareFn(
        leftNormalizedPathString,
        rightNormalizedPathString
      );
    } else {
      // Deep vs shallow. Exactly one of deepFirst and shallowFirst is true, no need to test both.
      return (
        (leftDirs.length < rightDirs.length ? -1 : 1) * (deepFirst ? -1 : 1)
      );
    }
  }
}

/**
 * Cross-platform file path sorting function.
 *
 * @param {(string[]|any[])} paths Array of path strings or objects containing path strings.
 * @param {SortOptions} [options] Sort options.
 * @returns {(string[]|any[])} Sorted array.
 */
function sort(paths, options) {
  return _sort(nodePathAPI, paths, options);
}

/**
 * POSIX-specific file path sorting function.
 *
 * @param {(string[]|any[])} paths Array of path strings or objects containing path strings.
 * @param {SortOptions} [options] Sort options.
 * @returns {(string[]|any[])} Sorted array.
 */
function posixSort(paths, options) {
  return _sort(nodePathAPI.posix, paths, options);
}

/**
 * Windows-specific file path sorting function.
 *
 * @param {(string[]|any[])} paths Array of path strings or objects containing path strings.
 * @param {SortOptions} [options] Sort options.
 * @returns {(string[]|any[])} Sorted array.
 */
function windowsSort(paths, options) {
  return _sort(nodePathAPI.win32, paths, options);
}

module.exports = {
  sort,
  posix: {
    sort: posixSort,
  },
  windows: {
    sort: windowsSort,
  },
};
