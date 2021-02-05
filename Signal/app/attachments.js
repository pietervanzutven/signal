(function () {
  'use strict';

  window.app = window.app || {};
  const exports = window.app.attachments = {};

  const crypto = window.crypto;
  const path = window.path;
  const { app, shell, remote } = window.electron;

  const pify = window.pify;
  const glob = window.glob;
  const fse = window.fs_extra;
  const toArrayBuffer = window.to_arraybuffer;
  const { map, isArrayBuffer, isString } = window.lodash;
  const sanitizeFilename = window.sanitize_filename;
  const getGuid = window.uuid.v4;

  let xattr;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    xattr = window.fs_xattr;
  } catch (e) {
    console.log('x-attr dependncy did not load successfully');
  }

  const PATH = 'attachments.noindex';
  const STICKER_PATH = 'stickers.noindex';
  const TEMP_PATH = 'temp';
  const DRAFT_PATH = 'drafts.noindex';

  exports.getAllAttachments = async userDataPath => {
    const dir = exports.getPath(userDataPath);
    const pattern = path.join(dir, '**', '*');

    const files = await pify(glob)(pattern, { nodir: true });
    return map(files, file => path.relative(dir, file));
  };

  exports.getAllStickers = async userDataPath => {
    const dir = exports.getStickersPath(userDataPath);
    const pattern = path.join(dir, '**', '*');

    const files = await pify(glob)(pattern, { nodir: true });
    return map(files, file => path.relative(dir, file));
  };

  exports.getAllDraftAttachments = async userDataPath => {
    const dir = exports.getDraftPath(userDataPath);
    const pattern = path.join(dir, '**', '*');

    const files = await pify(glob)(pattern, { nodir: true });
    return map(files, file => path.relative(dir, file));
  };

  exports.getBuiltInImages = async () => {
    const dir = path.join(__dirname, '../images');
    const pattern = path.join(dir, '**', '*.svg');

    const files = await pify(glob)(pattern, { nodir: true });
    return map(files, file => path.relative(dir, file));
  };

  //      getPath :: AbsolutePath -> AbsolutePath
  exports.getPath = userDataPath => {
    if (!isString(userDataPath)) {
      throw new TypeError("'userDataPath' must be a string");
    }
    return path.join(userDataPath, PATH);
  };

  //      getStickersPath :: AbsolutePath -> AbsolutePath
  exports.getStickersPath = userDataPath => {
    if (!isString(userDataPath)) {
      throw new TypeError("'userDataPath' must be a string");
    }
    return path.join(userDataPath, STICKER_PATH);
  };

  //      getTempPath :: AbsolutePath -> AbsolutePath
  exports.getTempPath = userDataPath => {
    if (!isString(userDataPath)) {
      throw new TypeError("'userDataPath' must be a string");
    }
    return path.join(userDataPath, TEMP_PATH);
  };

  //      getDraftPath :: AbsolutePath -> AbsolutePath
  exports.getDraftPath = userDataPath => {
    if (!isString(userDataPath)) {
      throw new TypeError("'userDataPath' must be a string");
    }
    return path.join(userDataPath, DRAFT_PATH);
  };

  //      clearTempPath :: AbsolutePath -> AbsolutePath
  exports.clearTempPath = userDataPath => {
    const tempPath = exports.getTempPath(userDataPath);
    return fse.emptyDir(tempPath);
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

  exports.createDoesExist = root => {
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
      try {
        await fse.access(normalized, fse.constants.F_OK);
        return true;
      } catch (error) {
        return false;
      }
    };
  };

  exports.copyIntoAttachmentsDirectory = root => {
    if (!isString(root)) {
      throw new TypeError("'root' must be a path");
    }

    return async sourcePath => {
      if (!isString(sourcePath)) {
        throw new TypeError('sourcePath must be a string');
      }

      const name = exports.createName();
      const relativePath = exports.getRelativePath(name);
      const absolutePath = path.join(root, relativePath);
      const normalized = path.normalize(absolutePath);
      if (!normalized.startsWith(root)) {
        throw new Error('Invalid relative path');
      }

      await fse.ensureFile(normalized);
      await fse.copy(sourcePath, normalized);
      return relativePath;
    };
  };

  exports.writeToDownloads = async ({ data, name }) => {
    const appToUse = app || remote.app;
    const downloadsPath =
      appToUse.getPath('downloads') || appToUse.getPath('home');
    const sanitized = sanitizeFilename(name);

    const extension = path.extname(sanitized);
    const basename = path.basename(sanitized, extension);
    const getCandidateName = count => `${basename} (${count})${extension}`;

    const existingFiles = await fse.readdir(downloadsPath);
    let candidateName = sanitized;
    let count = 0;
    while (existingFiles.includes(candidateName)) {
      count += 1;
      candidateName = getCandidateName(count);
    }

    const target = path.join(downloadsPath, candidateName);
    const normalized = path.normalize(target);
    if (!normalized.startsWith(downloadsPath)) {
      throw new Error('Invalid filename!');
    }

    await fse.writeFile(normalized, Buffer.from(data));

    if (process.platform === 'darwin' && xattr) {
      // kLSQuarantineTypeInstantMessageAttachment
      const type = '0003';

      // Hexadecimal seconds since epoch
      const timestamp = Math.trunc(Date.now() / 1000).toString(16);

      const appName = 'Signal';
      const guid = getGuid();

      // https://ilostmynotes.blogspot.com/2012/06/gatekeeper-xprotect-and-quarantine.html
      const attrValue = `${type};${timestamp};${appName};${guid}`;

      await xattr.set(normalized, 'com.apple.quarantine', attrValue);
    }

    return {
      fullPath: normalized,
      name: candidateName,
    };
  };

  exports.openFileInDownloads = async name => {
    const shellToUse = shell || remote.shell;
    const appToUse = app || remote.app;

    const downloadsPath =
      appToUse.getPath('downloads') || appToUse.getPath('home');
    const target = path.join(downloadsPath, name);

    const normalized = path.normalize(target);
    if (!normalized.startsWith(downloadsPath)) {
      throw new Error('Invalid filename!');
    }

    shellToUse.showItemInFolder(normalized);
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

  exports.deleteAll = async ({ userDataPath, attachments }) => {
    const deleteFromDisk = exports.createDeleter(exports.getPath(userDataPath));

    for (let index = 0, max = attachments.length; index < max; index += 1) {
      const file = attachments[index];
      // eslint-disable-next-line no-await-in-loop
      await deleteFromDisk(file);
    }

    console.log(`deleteAll: deleted ${attachments.length} files`);
  };

  exports.deleteAllStickers = async ({ userDataPath, stickers }) => {
    const deleteFromDisk = exports.createDeleter(
      exports.getStickersPath(userDataPath)
    );

    for (let index = 0, max = stickers.length; index < max; index += 1) {
      const file = stickers[index];
      // eslint-disable-next-line no-await-in-loop
      await deleteFromDisk(file);
    }

    console.log(`deleteAllStickers: deleted ${stickers.length} files`);
  };

  exports.deleteAllDraftAttachments = async ({ userDataPath, stickers }) => {
    const deleteFromDisk = exports.createDeleter(
      exports.getDraftPath(userDataPath)
    );

    for (let index = 0, max = stickers.length; index < max; index += 1) {
      const file = stickers[index];
      // eslint-disable-next-line no-await-in-loop
      await deleteFromDisk(file);
    }

    console.log(`deleteAllDraftAttachments: deleted ${stickers.length} files`);
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