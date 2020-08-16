(function () {
    'use strict';

    window.attachments = {};
    
    const crypto = window.crypto;
    const path = window.path;

    const fse = window.fs_extra;
    const toArrayBuffer = window.to_arraybuffer;
    const { isArrayBuffer, isString } = window.lodash;


    const PATH = 'attachments.noindex';

    //      getPath :: AbsolutePath -> AbsolutePath
    window.attachments.getPath = (userDataPath) => {
        if (!isString(userDataPath)) {
            throw new TypeError('"userDataPath" must be a string');
        }
        return path.join(userDataPath, PATH);
    };

    //      ensureDirectory :: AbsolutePath -> IO Unit
    window.attachments.ensureDirectory = async (userDataPath) => {
        if (!isString(userDataPath)) {
            throw new TypeError('"userDataPath" must be a string');
        }
        await fse.ensureDir(window.attachments.getPath(userDataPath));
    };

    //      createReader :: AttachmentsPath ->
    //                      RelativePath ->
    //                      IO (Promise ArrayBuffer)
    window.attachments.createReader = (root) => {
        if (!isString(root)) {
            throw new TypeError('"root" must be a path');
        }

        return async (relativePath) => {
            if (!isString(relativePath)) {
                throw new TypeError('"relativePath" must be a string');
            }

            const absolutePath = path.join(root, relativePath);
            const buffer = await fse.readFile(absolutePath);
            return toArrayBuffer(buffer);
        };
    };

    //      createWriterForNew :: AttachmentsPath ->
    //                            ArrayBuffer ->
    //                            IO (Promise RelativePath)
    window.attachments.createWriterForNew = (root) => {
        if (!isString(root)) {
            throw new TypeError('"root" must be a path');
        }

        return async (arrayBuffer) => {
            if (!isArrayBuffer(arrayBuffer)) {
                throw new TypeError('"arrayBuffer" must be an array buffer');
            }

            const name = window.attachments.createName();
            const relativePath = window.attachments.getRelativePath(name);
            return window.attachments.createWriterForExisting(root)({
                data: arrayBuffer,
                path: relativePath,
            });
        };
    };

    //      createWriter :: AttachmentsPath ->
    //                      { data: ArrayBuffer, path: RelativePath } ->
    //                      IO (Promise RelativePath)
    window.attachments.createWriterForExisting = (root) => {
        if (!isString(root)) {
            throw new TypeError('"root" must be a path');
        }

        return async ({ data: arrayBuffer, path: relativePath } = {}) => {
            if (!isString(relativePath)) {
                throw new TypeError('"relativePath" must be a path');
            }

            if (!isArrayBuffer(arrayBuffer)) {
                throw new TypeError('"arrayBuffer" must be an array buffer');
            }

            const buffer = Buffer.from(arrayBuffer);
            const absolutePath = path.join(root, relativePath);
            await fse.ensureFile(absolutePath);
            await fse.writeFile(absolutePath, buffer);
            return relativePath;
        };
    };

    //      createDeleter :: AttachmentsPath ->
    //                       RelativePath ->
    //                       IO Unit
    window.attachments.createDeleter = (root) => {
        if (!isString(root)) {
            throw new TypeError('"root" must be a path');
        }

        return async (relativePath) => {
            if (!isString(relativePath)) {
                throw new TypeError('"relativePath" must be a string');
            }

            const absolutePath = path.join(root, relativePath);
            await fse.remove(absolutePath);
        };
    };

    //      createName :: Unit -> IO String
    window.attachments.createName = () => {
        const buffer = crypto.randomBytes(32);
        return buffer.toString('hex');
    };

    //      getRelativePath :: String -> IO Path
    window.attachments.getRelativePath = (name) => {
        if (!isString(name)) {
            throw new TypeError('"name" must be a string');
        }

        const prefix = name.slice(0, 2);
        return path.join(prefix, name);
    };
})();