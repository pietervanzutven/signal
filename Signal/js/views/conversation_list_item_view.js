/* global Whisper, _, extension, Backbone, Mustache */

// eslint-disable-next-line func-names
(function() {
  'use strict';

  window.Whisper = window.Whisper || {};

  // list of conversations, showing user/group and last message sent
  Whisper.ConversationListItemView = Whisper.View.extend({
    tagName: 'div',
    className() {
      return `conversation-list-item contact ${this.model.cid}`;
    },
    templateName: 'conversation-preview',
    events: {
      click: 'select',
    },
    initialize() {
      // auto update
      this.listenTo(
        this.model,
        'change',
        _.debounce(this.render.bind(this), 1000)
      );
      this.listenTo(this.model, 'destroy', this.remove); // auto update
      this.listenTo(this.model, 'opened', this.markSelected); // auto update

      const updateLastMessage = _.debounce(
        this.model.updateLastMessage.bind(this.model),
        1000
      );
      this.listenTo(
        this.model.messageCollection,
        'add remove',
        updateLastMessage
      );
      this.listenTo(this.model, 'newmessage', updateLastMessage);

      extension.windows.onClosed(() => {
        this.stopListening();
      });
      this.timeStampView = new Whisper.TimestampView({ brief: true });
      this.model.updateLastMessage();
    },

    markSelected() {
      this.$el
        .addClass('selected')
        .siblings('.selected')
        .removeClass('selected');
    },

    select() {
      this.markSelected();
      this.$el.trigger('select', this.model);
    },

    remove() {
      if (this.nameView) {
        this.nameView.remove();
        this.nameView = null;
      }
      if (this.bodyView) {
        this.bodyView.remove();
        this.bodyView = null;
      }
      Backbone.View.prototype.remove.call(this);
    },

    render() {
      const lastMessage = this.model.get('lastMessage');

      this.$el.html(
        Mustache.render(
          _.result(this, 'template', ''),
          {
            last_message: Boolean(lastMessage),
            last_message_timestamp: this.model.get('timestamp'),
            number: this.model.getNumber(),
            avatar: this.model.getAvatar(),
            unreadCount: this.model.get('unreadCount'),
          },
          this.render_partials()
        )
      );
      this.timeStampView.setElement(this.$('.last-timestamp'));
      this.timeStampView.update();

      if (this.nameView) {
        this.nameView.remove();
        this.nameView = null;
      }
      this.nameView = new Whisper.ReactWrapperView({
        className: 'name-wrapper',
        Component: window.Signal.Components.ContactName,
        props: {
          phoneNumber: this.model.getNumber(),
          name: this.model.getName(),
          profileName: this.model.getProfileName(),
        },
      });
      this.$('.name').append(this.nameView.el);

      if (lastMessage) {
        if (this.bodyView) {
          this.bodyView.remove();
          this.bodyView = null;
        }
        this.bodyView = new Whisper.ReactWrapperView({
          className: 'body-wrapper',
          Component: window.Signal.Components.MessageBody,
          props: {
            text: lastMessage,
            disableJumbomoji: true,
            disableLinks: true,
          },
        });
        this.$('.last-message').append(this.bodyView.el);
      }

      const unread = this.model.get('unreadCount');
      if (unread > 0) {
        this.$el.addClass('unread');
      } else {
        this.$el.removeClass('unread');
      }

      return this;
    },
  });
})();
