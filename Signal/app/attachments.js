(function () {
  'use strict';

  window.app = window.app || {};
  const exports = window.app.attachments = {};

  const crypto = window.crypto;
  const path = window.path;

  const fse = window.fs_extra;
  const toArrayBuffer = window.to_arraybuffer;
  const { isArrayBuffer, isString } = window.lodash;

  const PATH = 'attachments.noindex';

  //      getPath :: AbsolutePath -> AbsolutePath
  exports.getPath = userDataPath => {
    if (!isString(userDataPath)) {
      throw new TypeError("'userDataPath' must be a string");
    }
    return path.join(userDataPath, PATH);
  };

  //      ensureDirectory :: AbsolutePath -> IO Unit
  exports.ensureDirectory = async userDataPath => {
    if (!isString(userDataPath)) {
      throw new TypeError("'userDataPath' must be a string");
    }
    await fse.ensureDir(exports.getPath(userDataPath));
  };

  //      createReader :: AttachmentsPath ->
  //                      RelativePath ->
  //                      IO (Promise ArrayBuffer)
  exports.createReader = root => {
    if (!isString(root)) {
      throw new TypeError("'root' must be a path");
    }

    return async relativePath => {
      if (!isString(relativePath)) {
        throw new TypeError("'relativePath' must be a string");
      }

      const absolutePath = path.join(root, relativePath);
      const normalized = path.normalize(absolutePath);
      if (!normalized.startsWith(root)) {
        throw new Error('Invalid relative path');
      }
      const buffer = await fse.readFile(normalized);
      return toArrayBuffer(buffer);
    };
  };

  //      createWriterForNew :: AttachmentsPath ->
  //                            ArrayBuffer ->
  //                            IO (Promise RelativePath)
  exports.createWriterForNew = root => {
    if (!isString(root)) {
      throw new TypeError("'root' must be a path");
    }

    return async arrayBuffer => {
      if (!isArrayBuffer(arrayBuffer)) {
        throw new TypeError("'arrayBuffer' must be an array buffer");
      }

      const name = exports.createName();
      const relativePath = exports.getRelativePath(name);
      return exports.createWriterForExisting(root)({
        data: arrayBuffer,
        path: relativePath,
      });
    };
  };

  //      createWriter :: AttachmentsPath ->
  //                      { data: ArrayBuffer, path: RelativePath } ->
  //                      IO (Promise RelativePath)
  exports.createWriterForExisting = root => {
    if (!isString(root)) {
      throw new TypeError("'root' must be a path");
    }

    return async ({ data: arrayBuffer, path: relativePath } = {}) => {
      if (!isString(relativePath)) {
        throw new TypeError("'relativePath' must be a path");
      }

      if (!isArrayBuffer(arrayBuffer)) {
        throw new TypeError("'arrayBuffer' must be an array buffer");
      }

      const buffer = Buffer.from(arrayBuffer);
      const absolutePath = path.join(root, relativePath);
      const normalized = path.normalize(absolutePath);
      if (!normalized.startsWith(root)) {
        throw new Error('Invalid relative path');
      }

      await fse.ensureFile(normalized);
      await fse.writeFile(normalized, buffer);
      return relativePath;
    };
  };

  //      createDeleter :: AttachmentsPath ->
  //                       RelativePath ->
  //                       IO Unit
  exports.createDeleter = root => {
    if (!isString(root)) {
      throw new TypeError("'root' must be a path");
    }

    return async relativePath => {
      if (!isString(relativePath)) {
        throw new TypeError("'relativePath' must be a string");
      }

      const absolutePath = path.join(root, relativePath);
      const normalized = path.normalize(absolutePath);
      if (!normalized.startsWith(root)) {
        throw new Error('Invalid relative path');
      }
      await fse.remove(absolutePath);
    };
  };

  //      createName :: Unit -> IO String
  exports.createName = () => {
    const buffer = crypto.randomBytes(32);
    return buffer.toString('hex');
  };

  //      getRelativePath :: String -> Path
  exports.getRelativePath = name => {
    if (!isString(name)) {
      throw new TypeError("'name' must be a string");
    }

    const prefix = name.slice(0, 2);
    return path.join(prefix, name);
  };

  //      createAbsolutePathGetter :: RootPath -> RelativePath -> AbsolutePath
  exports.createAbsolutePathGetter = rootPath => relativePath => {
    const absolutePath = path.join(rootPath, relativePath);
    const normalized = path.normalize(absolutePath);
    if (!normalized.startsWith(rootPath)) {
      throw new Error('Invalid relative path');
    }
    return normalized;
  };

})();