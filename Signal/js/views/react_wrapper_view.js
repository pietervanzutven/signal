/* global Backbone: false */
/* global i18n: false */
/* global React: false */
/* global ReactDOM: false */

// eslint-disable-next-line func-names
(function() {
  'use strict';

  window.Whisper = window.Whisper || {};

  window.Whisper.ReactWrapperView = Backbone.View.extend({
    className: 'react-wrapper',
    initialize(options) {
      const {
        Component,
        props,
        onClose,
        tagName,
        className,
        onInitialRender,
        elCallback,
      } = options;
      this.render();
      if (elCallback) {
        elCallback(this.el);
      }

      this.tagName = tagName;
      this.className = className;
      this.Component = Component;
      this.onClose = onClose;
      this.onInitialRender = onInitialRender;

      this.update(props);

      this.hasRendered = false;
    },
    update(props) {
      const updatedProps = this.augmentProps(props);
      const reactElement = React.createElement(this.Component, updatedProps);
      ReactDOM.render(reactElement, this.el, () => {
        if (this.hasRendered) {
          return;
        }

        this.hasRendered = true;
        if (this.onInitialRender) {
          this.onInitialRender();
        }
      });
    },
    augmentProps(props) {
      return Object.assign({}, props, {
        close: () => {
          if (this.onClose) {
            this.onClose();
            return;
          }
          this.remove();
        },
        i18n,
      });
    },
    remove() {
      ReactDOM.unmountComponentAtNode(this.el);
      Backbone.View.prototype.remove.call(this);
    },
  });
})();
