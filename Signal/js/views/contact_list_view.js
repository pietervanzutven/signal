/* global Whisper: false */
/* global textsecure: false */

// eslint-disable-next-line func-names
(function () {
  window.Whisper = window.Whisper || {};

  Whisper.ContactListView = Whisper.ListView.extend({
    tagName: 'div',
    itemView: Whisper.View.extend({
      tagName: 'div',
      className: 'contact',
      templateName: 'contact',
      initialize(options) {
        this.ourNumber = textsecure.storage.user.getNumber();
        this.listenBack = options.listenBack;
        this.loading = false;
        this.conversation = options.conversation;

        this.listenTo(this.model, 'change', this.render);
      },
      render() {
        if (this.contactView) {
          this.contactView.remove();
          this.contactView = null;
        }

        const formattedContact = this.model.format();

        this.contactView = new Whisper.ReactWrapperView({
          className: 'contact-wrapper',
          Component: window.Signal.Components.ContactListItem,
          props: Object.assign({},
            formattedContact,
            {
              onClick: () =>
                this.conversation.trigger(
                  'show-contact-modal',
                  formattedContact.id
                ),
            }
          ),
        });
        this.$el.append(this.contactView.el);
        return this;
      },
    }),
  });
})();
