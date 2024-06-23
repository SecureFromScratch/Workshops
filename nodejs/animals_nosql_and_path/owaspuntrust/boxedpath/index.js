const path = require('path');
//const fs = require('fs');
//const fsPromises = fs.promises;
const fsPromises = require('node:fs/promises');

const VALID_PATH_ELEMENT_PATTERN = /^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)?$/;

class BoxedPath {
    constructor(_path, _sandbox) {
        this._unrestrained = path.resolve(_path);
        if (_sandbox instanceof PreprocessedRealpath) {
            this._sandboxRealPath = _sandbox.toString();
        } else {
            this._sandboxRealPath = path.resolve(_sandbox);
        }

        this._validateConstraint();
    }

    _validateConstraint() {
        if (!this._unrestrained.startsWith(this._sandboxRealPath)) {
            throw new Error(`Path ${this._unrestrained} outside of sandbox ${this._sandboxRealPath}`);
        }
    }

    concat(...segments) {
        for (const seg of segments) {
            if (!VALID_PATH_ELEMENT_PATTERN.test(seg)) {
                throw new Error(`Path segment ${seg} contains illegal characters`);
            }
        }
        const newPath = path.join(this._unrestrained, ...segments);
        const boxedPath = new BoxedPath(newPath, new PreprocessedRealpath(this._sandboxRealPath));
        return boxedPath;
    }

    get parent() {
        const parentPath = path.dirname(this._unrestrained);
        return new BoxedPath(parentPath, new PreprocessedRealpath(this._sandboxRealPath));
    }

    get parenOrBase() {
        const parentPath = path.dirname(this._unrestrained);
        try {
            return new BoxedPath(parentPath, new PreprocessedRealpath(this._sandboxRealPath));
        } catch (err) {
            return new BoxedPath(this._sandboxRealPath, new PreprocessedRealpath(this._sandboxRealPath));
        }
    }

    // Returns the path relative to the base of the sandbox
    get relativeToBase() {
        return path.relative(this._sandboxRealPath, this._unrestrained);
    }

    async insecureUnrestrainedRealpath() {
       return await fsPromises.realpath(this._unrestrained.toString());
    }

}

class Sandbox extends BoxedPath {
    constructor(_sandbox) {
        super(_sandbox, _sandbox);
    }

    join(firstPathElement, ...segments) {
        for (const seg of segments) {
            if (!VALID_PATH_ELEMENT_PATTERN.test(seg)) {
                throw new Error(`Path segment ${seg} contains illegal characters`);
            }
        }

        const newPath = (firstPathElement instanceof BoxedPath)
            ? path.join(firstPathElement._unrestrained, ...segments)
            : path.join(firstPathElement, ...segments);
        const boxedPath = new BoxedPath(newPath, new PreprocessedRealpath(this._sandboxRealPath));
        return boxedPath._unrestrained;
    }

}

class PreprocessedRealpath {
    constructor(_realpath) {
        this._realpath = _realpath;
    }

    toString() {
        return this._realpath;
    }
}

// Example usage
// const sandbox = new Sandbox('/path/to/sandbox');
// const boxedPath = sandbox.join('subdir', 'file.txt');
// boxedPath.stat().then(stats => console.log(stats)).catch(err => console.error(err));

module.exports = { BoxedPath, Sandbox };
