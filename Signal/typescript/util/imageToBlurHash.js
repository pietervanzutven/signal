require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const blueimp_load_image_1 = __importDefault(require("blueimp-load-image"));
    const blurhash_1 = require("blurhash");
    const loadImageData = async (input) => {
        return new Promise((resolve, reject) => {
            blueimp_load_image_1.default(input, canvasOrError => {
                var _a;
                if (canvasOrError instanceof Event && canvasOrError.type === 'error') {
                    const processError = new Error('imageToBlurHash: Failed to process image');
                    processError.cause = canvasOrError;
                    reject(processError);
                    return;
                }
                if (canvasOrError instanceof HTMLCanvasElement) {
                    const context = canvasOrError.getContext('2d');
                    resolve((_a = context) === null || _a === void 0 ? void 0 : _a.getImageData(0, 0, canvasOrError.width, canvasOrError.height));
                }
                const error = new Error('imageToBlurHash: Failed to place image on canvas');
                reject(error);
                return;
            },
                // Calculating the blurhash on large images is a long-running and
                // synchronous operation, so here we ensure the images are a reasonable
                // size before calculating the blurhash. iOS uses a max size of 200x200
                // and Android uses a max size of 1/16 the original size. 200x200 is
                // easier for us.
                { canvas: true, orientation: true, maxWidth: 200, maxHeight: 200 });
        });
    };
    exports.imageToBlurHash = async (input) => {
        const { data, width, height } = await loadImageData(input);
        // 4 horizontal components and 3 vertical components
        return blurhash_1.encode(data, width, height, 4, 3);
    };
});