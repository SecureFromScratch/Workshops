const fsPromises = require('fs').promises;
const BoxedPath = require('../..'); // Assume BoxedPath is implemented in BoxedPath.js

const boxedPromises = {};

// List of methods to wrap. Extend this list based on your needs.
const singlePathArgMethods = [
    'access',
    'appendFile',
    'chmod', 'chown',
    'lchmod', 'lchown', 'lutimes', 'lstat',
    'mkdir',
    'open', 'opendir', 'readdir', 'readFile', 'readlink',
    'realpath',
    'rmdir', 'rm',
    'stat', 'statfs',
    'truncate',
    'unlink',
    'utimes',
    'watch',
    'writeFile'];

const twoPathArgMethods = [
    'copyFile',
    'cp',
    'link',
    'rename',
    'symlink',
];

singlePathArgMethods.forEach(method => {
    boxedPromises[method] = async function (path, ...args) {
        if (!(path instanceof BoxedPath)) {
            throw new Error('Path must be an instance of BoxedPath');
        }
        // Convert BoxedPath to a string or whatever format fsPromises expects
        const fsPath = await path.insecureUnrestrainedRealpath();
        return fsPromises[method](fsPath, ...args);
    };
});

twoPathArgMethods.forEach(method => {
    boxedPromises[method] = async function (path1, path2, ...args) {
        if (!(path1 instanceof BoxedPath)) {
            throw new Error('First path must be an instance of BoxedPath');
        }
        if (!(path2 instanceof BoxedPath)) {
            throw new Error('Second path must be an instance of BoxedPath');
        }
        // Convert BoxedPath to a string or whatever format fsPromises expects
        const fsPath1 = await path1.insecureUnrestrainedRealpath();
        const fsPath2 = await path2.insecureUnrestrainedRealpath();
        return fsPromises[method](fsPath1, fsPath2, ...args);
    };
});

module.exports = boxedPromises;
