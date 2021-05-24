require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const util_1 = require("../util");
    const getSelectionHTML = () => {
        const selection = window.getSelection();
        if (selection === null) {
            return '';
        }
        const range = selection.getRangeAt(0);
        const contents = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(contents);
        return div.innerHTML;
    };
    class SignalClipboard {
        constructor(quill) {
            this.quill = quill;
            this.quill.root.addEventListener('copy', e => this.onCaptureCopy(e, false));
            this.quill.root.addEventListener('cut', e => this.onCaptureCopy(e, true));
        }
        onCaptureCopy(event, isCut = false) {
            event.preventDefault();
            if (event.clipboardData === null) {
                return;
            }
            const range = this.quill.getSelection();
            if (range === null) {
                return;
            }
            const contents = this.quill.getContents(range.index, range.length);
            if (contents === null) {
                return;
            }
            const { ops } = contents;
            if (ops === undefined) {
                return;
            }
            const text = util_1.getTextFromOps(ops);
            const html = getSelectionHTML();
            event.clipboardData.setData('text/plain', text);
            event.clipboardData.setData('text/html', html);
            if (isCut) {
                this.quill.deleteText(range.index, range.length, 'user');
            }
        }
    }
    exports.SignalClipboard = SignalClipboard;
});