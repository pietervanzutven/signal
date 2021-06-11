require(exports => {
    "use strict";
    // Copyright 2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const Attachment_1 = require("../types/Attachment");
    const MINIMUM_FULL_SIZE_DIMENSION = 200;
    function shouldUseFullSizeLinkPreviewImage({ isStickerPack, image, }) {
        if (isStickerPack || !Attachment_1.isImageAttachment(image)) {
            return false;
        }
        const { width, height } = image;
        return (isDimensionFullSize(width) &&
            isDimensionFullSize(height) &&
            !isRoughlySquare(width, height));
    }
    exports.shouldUseFullSizeLinkPreviewImage = shouldUseFullSizeLinkPreviewImage;
    function isDimensionFullSize(dimension) {
        return (typeof dimension === 'number' && dimension >= MINIMUM_FULL_SIZE_DIMENSION);
    }
    function isRoughlySquare(width, height) {
        return Math.abs(1 - width / height) < 0.05;
    }
});