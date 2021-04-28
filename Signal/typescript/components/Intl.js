(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Intl = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    class Intl extends react_1.default.Component {
        getComponent(index, placeholderName, key) {
            const { id, components } = this.props;
            if (!components) {
                // tslint:disable-next-line no-console
                console.log(`Error: Intl component prop not provided; Metadata: id '${id}', index ${index}, placeholder '${placeholderName}'`);
                return;
            }
            if (Array.isArray(components)) {
                if (!components || !components.length || components.length <= index) {
                    // tslint:disable-next-line no-console
                    console.log(`Error: Intl missing provided component for id '${id}', index ${index}`);
                    return;
                }
                return react_1.default.createElement(react_1.default.Fragment, { key: key }, components[index]);
            }
            const value = components[placeholderName];
            if (!value) {
                // tslint:disable-next-line no-console
                console.log(`Error: Intl missing provided component for id '${id}', placeholder '${placeholderName}'`);
                return;
            }
            return react_1.default.createElement(react_1.default.Fragment, { key: key }, value);
        }
        render() {
            const { components, id, i18n, renderText } = this.props;
            const text = i18n(id);
            const results = [];
            const FIND_REPLACEMENTS = /\$([^$]+)\$/g;
            // We have to do this, because renderText is not required in our Props object,
            //   but it is always provided via defaultProps.
            if (!renderText) {
                return;
            }
            if (Array.isArray(components) && components.length > 1) {
                throw new Error('Array syntax is not supported with more than one placeholder');
            }
            let componentIndex = 0;
            let key = 0;
            let lastTextIndex = 0;
            let match = FIND_REPLACEMENTS.exec(text);
            if (!match) {
                return renderText({ text, key: 0 });
            }
            while (match) {
                if (lastTextIndex < match.index) {
                    const textWithNoReplacements = text.slice(lastTextIndex, match.index);
                    results.push(renderText({ text: textWithNoReplacements, key: key }));
                    key += 1;
                }
                const placeholderName = match[1];
                results.push(this.getComponent(componentIndex, placeholderName, key));
                componentIndex += 1;
                key += 1;
                // @ts-ignore
                lastTextIndex = FIND_REPLACEMENTS.lastIndex;
                match = FIND_REPLACEMENTS.exec(text);
            }
            if (lastTextIndex < text.length) {
                results.push(renderText({ text: text.slice(lastTextIndex), key: key }));
                key += 1;
            }
            return results;
        }
    }
    exports.Intl = Intl;
    Intl.defaultProps = {
        renderText: ({ text, key }) => (react_1.default.createElement(react_1.default.Fragment, { key: key }, text)),
    };
})();