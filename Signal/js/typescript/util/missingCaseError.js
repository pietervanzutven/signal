function require_ts_util_missingCaseError() {
    "use strict";

    const exports = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    // `missingCaseError` is useful for compile-time checking that all `case`s in
    // a `switch` statement have been handled, e.g.
    //
    // type AttachmentType = 'media' | 'documents';
    //
    // const type: AttachmentType = selectedTab;
    // switch (type) {
    //   case 'media':
    //     return <MediaGridItem/>;
    //   case 'documents':
    //     return <DocumentListItem/>;
    //   default:
    //     return missingCaseError(type);
    // }
    //
    // If we extended `AttachmentType` to `'media' | 'documents' | 'links'` the code
    // above would trigger a compiler error stating that `'links'` has not been
    // handled by our `switch` / `case` statement which is useful for code
    // maintenance and system evolution.
    exports.missingCaseError = (x) => new TypeError(`Unhandled case: ${x}`);

    return exports;
}