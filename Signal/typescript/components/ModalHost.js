require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const react_dom_1 = require("react-dom");
    exports.ModalHost = React.memo(({ onClose, children }) => {
        const [root, setRoot] = React.useState(null);
        React.useEffect(() => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            setRoot(div);
            return () => {
                document.body.removeChild(div);
                setRoot(null);
            };
        }, []);
        React.useEffect(() => {
            const handler = (event) => {
                if (event.key === 'Escape') {
                    onClose();
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            document.addEventListener('keydown', handler);
            return () => {
                document.removeEventListener('keydown', handler);
            };
        }, [onClose]);
        // This makes it easier to write dialogs to be hosted here; they won't have to worry
        //   as much about preventing propagation of mouse events.
        const handleCancel = React.useCallback((e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }, [onClose]);
        return root
            ? react_dom_1.createPortal(React.createElement("div", { role: "presentation", className: "module-modal-host__overlay", onClick: handleCancel }, children), root)
            : null;
    });
});