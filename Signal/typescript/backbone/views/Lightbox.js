(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.backbone = window.ts.backbone || {};
    window.ts.backbone.views = window.ts.backbone.views || {};
    const exports = window.ts.backbone.views.Lightbox = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.show = (element) => {
        const container = document.querySelector('.lightbox-container');
        if (!container) {
            throw new TypeError("'.lightbox-container' is required");
        }
        container.innerHTML = '';
        container.style.display = 'block';
        container.appendChild(element);
    };
    exports.hide = () => {
        const container = document.querySelector('.lightbox-container');
        if (!container) {
            return;
        }
        container.innerHTML = '';
        container.style.display = 'none';
    };
})();