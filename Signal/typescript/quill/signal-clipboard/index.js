require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const quill_delta_1 = __importDefault(require("quill-delta"));
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
    const replaceAngleBrackets = (text) => {
        const entities = [
            [/&/g, '&amp;'],
            [/</g, '&lt;'],
            [/>/g, '&gt;'],
        ];
        return entities.reduce((acc, [re, replaceValue]) => acc.replace(re, replaceValue), text);
    };
    class SignalClipboard {
        constructor(quill) {
            this.quill = quill;
            this.quill.root.addEventListener('copy', e => this.onCaptureCopy(e, false));
            this.quill.root.addEventListener('cut', e => this.onCaptureCopy(e, true));
            this.quill.root.addEventListener('paste', e => this.onCapturePaste(e));
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
            event.clipboardData.setData('text/signal', html);
            if (isCut) {
                this.quill.deleteText(range.index, range.length, 'user');
            }
        }
        onCapturePaste(event) {
            if (event.clipboardData === null) {
                return;
            }
            this.quill.focus();
            const clipboard = this.quill.getModule('clipboard');
            const selection = this.quill.getSelection();
            if (selection === null) {
                return;
            }
            const text = event.clipboardData.getData('text/plain');
            const html = event.clipboardData.getData('text/signal');
            const clipboardDelta = html
                ? clipboard.convert(html)
                : clipboard.convert(replaceAngleBrackets(text));
            const { scrollTop } = this.quill.scrollingContainer;
            this.quill.selection.update('silent');
            if (selection) {
                setTimeout(() => {
                    const delta = new quill_delta_1.default()
                        .retain(selection.index)
                        .concat(clipboardDelta);
                    this.quill.updateContents(delta, 'user');
                    this.quill.setSelection(delta.length(), 0, 'silent');
                    this.quill.scrollingContainer.scrollTop = scrollTop;
                }, 1);
            }
            event.preventDefault();
        }
    }
    exports.SignalClipboard = SignalClipboard;
});