(function () {
    window.attachments = {};

    const crypto = window.crypto;
    const fse = window.fs_extra;
    const isArrayBuffer = window.lodash.isArrayBuffer;
    const isString = window.lodash.isString;
    const path = window.path;


    const PATH = 'attachments.noindex';

    //      getPath :: AbsolutePath -> AbsolutePath
    window.attachments.getPath = (userDataPath) => {
        if (!isString(userDataPath)) {
            throw new TypeError('`userDataPath` must be a string');
        }
        return path.join(userDataPath, PATH);
    };

    //      ensureDirectory :: AbsolutePath -> IO Unit
    window.attachments.ensureDirectory = async (userDataPath) => {
        if (!isString(userDataPath)) {
            throw new TypeError('`userDataPath` must be a string');
        }
        await fse.ensureDir(window.attachments.getPath(userDataPath));
    };

    //      readData :: AttachmentsPath ->
    //                  RelativePath ->
    //                  IO (Promise ArrayBuffer)
    window.attachments.readData = (root) => {
        if (!isString(root)) {
            throw new TypeError('`root` must be a path');
        }

        return async (relativePath) => {
            if (!isString(relativePath)) {
                throw new TypeError('`relativePath` must be a string');
            }

            const absolutePath = path.join(root, relativePath);
            const buffer = await fse.readFile(absolutePath);
            return buffer;
        };
    };

    //      writeData :: AttachmentsPath ->
    //                   ArrayBuffer ->
    //                   IO (Promise RelativePath)
    window.attachments.writeData = (root) => {
        if (!isString(root)) {
            throw new TypeError('`root` must be a path');
        }

        return async (arrayBuffer) => {
            if (!isArrayBuffer(arrayBuffer)) {
                throw new TypeError('`arrayBuffer` must be an array buffer');
            }

            const buffer = arrayBuffer;
            const name = window.attachments.createName();
            const relativePath = window.attachments.getRelativePath(name);
            const absolutePath = path.join(root, relativePath);
            await fse.ensureFile(absolutePath);
            await fse.writeFile(absolutePath, buffer);
            return relativePath;
        };
    };

    //      deleteData :: AttachmentsPath -> IO Unit
    window.attachments.deleteData = (root) => {
        if (!isString(root)) {
            throw new TypeError('`root` must be a path');
        }

        return async (relativePath) => {
            if (!isString(relativePath)) {
                throw new TypeError('`relativePath` must be a string');
            }

            const absolutePath = path.join(root, relativePath);
            await fse.remove(absolutePath);
        };
    };

    //      createName :: Unit -> IO String
    window.attachments.createName = () => {
        const buffer = crypto.getRandomBytes(32);
        return buffer.toString('hex');
    };

    //      getRelativePath :: String -> IO Path
    window.attachments.getRelativePath = (name) => {
        if (!isString(name)) {
            throw new TypeError('`name` must be a string');
        }

        const prefix = name.slice(0, 2);
        return path.join(prefix, name);
    };
})();