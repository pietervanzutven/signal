/* global $: false */
/* global _: false */
/* global emojiData: false */
/* global EmojiPanel: false */
/* global moment: false */
/* global extension: false */
/* global i18n: false */
/* global Signal: false */
/* global storage: false */
/* global Whisper: false */

// eslint-disable-next-line func-names
(function() {
  'use strict';

  window.Whisper = window.Whisper || {};

  Whisper.ExpiredToast = Whisper.ToastView.extend({
    render_attributes() {
      return { toastMessage: i18n('expiredWarning') };
    },
  });
  Whisper.BlockedToast = Whisper.ToastView.extend({
    render_attributes() {
      return { toastMessage: i18n('unblockToSend') };
    },
  });
  Whisper.LeftGroupToast = Whisper.ToastView.extend({
    render_attributes() {
      return { toastMessage: i18n('youLeftTheGroup') };
    },
  });

  const MenuView = Whisper.View.extend({
    toggleMenu() {
      this.$('.menu-list').toggle();
    },
  });

  const TimerMenuView = MenuView.extend({
    initialize() {
      this.render();
      this.listenTo(this.model, 'change:expireTimer', this.render);
    },
    events: {
      'click button': 'toggleMenu',
      'click li': 'setTimer',
    },
    setTimer(e) {
      const { seconds } = this.$(e.target).data();
      if (seconds > 0) {
        this.model.updateExpirationTimer(seconds);
      } else {
        this.model.updateExpirationTimer(null);
      }
    },
    render() {
      const seconds = this.model.get('expireTimer');
      if (seconds) {
        const s = Whisper.ExpirationTimerOptions.getAbbreviated(seconds);
        this.$el.attr('data-time', s);
        this.$el.show();
      } else {
        this.$el.attr('data-time', null);
        this.$el.hide();
      }
    },
  });

  Whisper.ConversationLoadingScreen = Whisper.View.extend({
    templateName: 'conversation-loading-screen',
    className: 'conversation-loading-screen',
  });

  Whisper.ConversationView = Whisper.View.extend({
    className() {
      return ['conversation', this.model.get('type')].join(' ');
    },
    id() {
      return `conversation-${this.model.cid}`;
    },
    template: $('#conversation').html(),
    render_attributes() {
      return {
        group: this.model.get('type') === 'group',
        isMe: this.model.isMe(),
        avatar: this.model.getAvatar(),
        expireTimer: this.model.get('expireTimer'),
        'show-members': i18n('showMembers'),
        'end-session': i18n('resetSession'),
        'show-identity': i18n('showSafetyNumber'),
        destroy: i18n('deleteMessages'),
        'send-message': i18n('sendMessage'),
        'disappearing-messages': i18n('disappearingMessages'),
        'android-length-warning': i18n('androidMessageLengthWarning'),
        timer_options: Whisper.ExpirationTimerOptions.models,
        'view-all-media': i18n('viewAllMedia'),
      };
    },
    initialize(options) {
      this.listenTo(this.model, 'destroy', this.stopListening);
      this.listenTo(this.model, 'change:verified', this.onVerifiedChange);
      this.listenTo(this.model, 'change:color', this.updateColor);
      this.listenTo(
        this.model,
        'change:avatar change:profileAvatar',
        this.updateAvatar
      );
      this.listenTo(this.model, 'newmessage', this.addMessage);
      this.listenTo(this.model, 'delivered', this.updateMessage);
      this.listenTo(this.model, 'read', this.updateMessage);
      this.listenTo(this.model, 'opened', this.onOpened);
      this.listenTo(this.model, 'prune', this.onPrune);
      this.listenTo(
        this.model.messageCollection,
        'scroll-to-message',
        this.scrollToMessage
      );
      this.listenTo(
        this.model.messageCollection,
        'reply',
        this.setQuoteMessage
      );
      this.listenTo(
        this.model.messageCollection,
        'show-contact-detail',
        this.showContactDetail
      );
      this.listenTo(
        this.model.messageCollection,
        'open-conversation',
        this.openConversation
      );

      this.lazyUpdateVerified = _.debounce(
        this.model.updateVerified.bind(this.model),
        1000 // one second
      );
      this.throttledGetProfiles = _.throttle(
        this.model.getProfiles.bind(this.model),
        1000 * 60 * 5 // five minutes
      );

      this.render();

      this.loadingScreen = new Whisper.ConversationLoadingScreen();
      this.loadingScreen.render();
      this.loadingScreen.$el.prependTo(this.el);

      this.timerMenu = new TimerMenuView({
        el: this.$('.timer-menu'),
        model: this.model,
      });

      this.window = options.window;
      this.fileInput = new Whisper.FileInputView({
        el: this.$('form.send'),
        window: this.window,
      });

      const getTitleProps = model => ({
        isVerified: model.isVerified(),
        name: model.getName(),
        phoneNumber: model.getNumber(),
        profileName: model.getProfileName(),
      });
      this.titleView = new Whisper.ReactWrapperView({
        className: 'title-wrapper',
        Component: window.Signal.Components.ConversationTitle,
        props: getTitleProps(this.model),
      });
      this.listenTo(this.model, 'change', () =>
        this.titleView.update(getTitleProps(this.model))
      );
      this.$('.conversation-title').prepend(this.titleView.el);

      this.view = new Whisper.MessageListView({
        collection: this.model.messageCollection,
        window: this.window,
      });
      this.$('.discussion-container').append(this.view.el);
      this.view.render();

      this.$messageField = this.$('.send-message');

      this.onResize = this.forceUpdateMessageFieldSize.bind(this);
      this.window.addEventListener('resize', this.onResize);

      this.onFocus = () => {
        if (this.$el.css('display') !== 'none') {
          this.markRead();
        }
      };
      this.window.addEventListener('focus', this.onFocus);

      extension.windows.onClosed(() => {
        this.unload('windows closed');
      });

      this.fetchMessages();

      this.$('.send-message').focus(this.focusBottomBar.bind(this));
      this.$('.send-message').blur(this.unfocusBottomBar.bind(this));

      this.$emojiPanelContainer = this.$('.emoji-panel-container');
    },

    events: {
      keydown: 'onKeyDown',
      'submit .send': 'checkUnverifiedSendMessage',
      'input .send-message': 'updateMessageFieldSize',
      'keydown .send-message': 'updateMessageFieldSize',
      'click .destroy': 'destroyMessages',
      'click .end-session': 'endSession',
      'click .leave-group': 'leaveGroup',
      'click .update-group': 'newGroupUpdate',
      'click .show-identity': 'showSafetyNumber',
      'click .show-members': 'showMembers',
      'click .view-all-media': 'viewAllMedia',
      'click .conversation-menu .hamburger': 'toggleMenu',
      click: 'onClick',
      'click .bottom-bar': 'focusMessageField',
      'click .back': 'resetPanel',
      'click .capture-audio .microphone': 'captureAudio',
      'click .disappearing-messages': 'enableDisappearingMessages',
      'click .scroll-down-button-view': 'scrollToBottom',
      'click button.emoji': 'toggleEmojiPanel',
      'focus .send-message': 'focusBottomBar',
      'change .file-input': 'toggleMicrophone',
      'blur .send-message': 'unfocusBottomBar',
      'loadMore .message-list': 'loadMoreMessages',
      'newOffscreenMessage .message-list': 'addScrollDownButtonWithCount',
      'atBottom .message-list': 'removeScrollDownButton',
      'farFromBottom .message-list': 'addScrollDownButton',
      'lazyScroll .message-list': 'onLazyScroll',
      'close .menu': 'closeMenu',
      'select .message-list .entry': 'messageDetail',
      'force-resize': 'forceUpdateMessageFieldSize',
      'show-identity': 'showSafetyNumber',
      dragover: 'sendToFileInput',
      drop: 'sendToFileInput',
      dragleave: 'sendToFileInput',
    },
    sendToFileInput(e) {
      if (e.originalEvent.dataTransfer.types[0] !== 'Files') {
        return;
      }
      this.fileInput.$el.trigger(e);
    },

    onPrune() {
      if (!this.model.messageCollection.length || !this.lastActivity) {
        return;
      }

      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      if (this.isHidden() && this.lastActivity < oneHourAgo) {
        this.unload('inactivity');
      } else if (this.view.atBottom()) {
        this.trim();
      }
    },

    unload(reason) {
      console.log(
        'unloading conversation',
        this.model.idForLogging(),
        'due to:',
        reason
      );

      this.timerMenu.remove();
      this.fileInput.remove();
      this.titleView.remove();

      if (this.captureAudioView) {
        this.captureAudioView.remove();
      }
      if (this.banner) {
        this.banner.remove();
      }
      if (this.lastSeenIndicator) {
        this.lastSeenIndicator.remove();
      }
      if (this.scrollDownButton) {
        this.scrollDownButton.remove();
      }
      if (this.quoteView) {
        this.quoteView.remove();
      }
      if (this.lightboxGalleryView) {
        this.lightboxGalleryView.remove();
      }
      if (this.panels && this.panels.length) {
        for (let i = 0, max = this.panels.length; i < max; i += 1) {
          const panel = this.panels[i];
          panel.remove();
        }
      }

      this.window.removeEventListener('resize', this.onResize);
      this.window.removeEventListener('focus', this.onFocus);

      window.autosize.destroy(this.$messageField);

      this.view.remove();

      this.remove();

      this.model.messageCollection.forEach(model => {
        model.trigger('unload');
      });
      this.model.messageCollection.reset([]);
    },

    trim() {
      const MAX = 100;
      const toRemove = this.model.messageCollection.length - MAX;
      if (toRemove <= 0) {
        return;
      }

      const models = [];
      for (let i = 0; i < toRemove; i += 1) {
        const model = this.model.messageCollection.at(i);
        models.push(model);
      }

      if (!models.length) {
        return;
      }

      console.log(
        'trimming conversation',
        this.model.idForLogging(),
        'of',
        models.length,
        'old messages'
      );

      this.model.messageCollection.remove(models);
      _.forEach(models, model => {
        model.trigger('unload');
      });
    },

    markAllAsVerifiedDefault(unverified) {
      return Promise.all(
        unverified.map(contact => {
          if (contact.isUnverified()) {
            return contact.setVerifiedDefault();
          }

          return null;
        })
      );
    },

    markAllAsApproved(untrusted) {
      return Promise.all(untrusted.map(contact => contact.setApproved()));
    },

    openSafetyNumberScreens(unverified) {
      if (unverified.length === 1) {
        this.showSafetyNumber(null, unverified.at(0));
        return;
      }

      this.showMembers(null, unverified, { needVerify: true });
    },

    onVerifiedChange() {
      if (this.model.isUnverified()) {
        const unverified = this.model.getUnverified();
        let message;
        if (!unverified.length) {
          return;
        }
        if (unverified.length > 1) {
          message = i18n('multipleNoLongerVerified');
        } else {
          message = i18n('noLongerVerified', unverified.at(0).getTitle());
        }

        // Need to re-add, since unverified set may have changed
        if (this.banner) {
          this.banner.remove();
          this.banner = null;
        }

        this.banner = new Whisper.BannerView({
          message,
          onDismiss: () => {
            this.markAllAsVerifiedDefault(unverified);
          },
          onClick: () => {
            this.openSafetyNumberScreens(unverified);
          },
        });

        const container = this.$('.discussion-container');
        container.append(this.banner.el);
      } else if (this.banner) {
        this.banner.remove();
        this.banner = null;
      }
    },

    enableDisappearingMessages() {
      if (!this.model.get('expireTimer')) {
        this.model.updateExpirationTimer(moment.duration(1, 'day').asSeconds());
      }
    },
    toggleMicrophone() {
      if (
        this.$('.send-message').val().length > 0 ||
        this.fileInput.hasFiles()
      ) {
        this.$('.capture-audio').hide();
      } else {
        this.$('.capture-audio').show();
      }
    },
    toggleLengthWarning() {
      if (this.$('.send-message').val().length > 2000) {
        this.$('.android-length-warning').show();
      } else {
        this.$('.android-length-warning').hide();
      }
    },
    captureAudio(e) {
      e.preventDefault();

      // Note - clicking anywhere will close the audio capture panel, due to
      //   the onClick handler in InboxView, which calls its closeRecording method.

      if (this.captureAudioView) {
        this.captureAudioView.remove();
        this.captureAudioView = null;
      }

      this.captureAudioView = new Whisper.RecorderView();

      const view = this.captureAudioView;
      view.render();
      view.on('send', this.handleAudioCapture.bind(this));
      view.on('closed', this.endCaptureAudio.bind(this));
      view.$el.appendTo(this.$('.capture-audio'));

      this.$('.send-message').attr('disabled', true);
      this.$('.microphone').hide();
    },
    handleAudioCapture(blob) {
      this.fileInput.file = blob;
      this.fileInput.isVoiceNote = true;
      this.fileInput.previewImages();
      this.$('.bottom-bar form').submit();
    },
    endCaptureAudio() {
      this.$('.send-message').removeAttr('disabled');
      this.$('.microphone').show();
      this.captureAudioView = null;
    },

    unfocusBottomBar() {
      this.$('.bottom-bar form').removeClass('active');
    },
    focusBottomBar() {
      this.$('.bottom-bar form').addClass('active');
    },

    onLazyScroll() {
      // The in-progress fetch check is important, because while that happens, lots
      //   of messages are added to the DOM, one by one, changing window size and
      //   generating scroll events.
      if (!this.isHidden() && window.isFocused() && !this.inProgressFetch) {
        this.lastActivity = Date.now();
        this.markRead();
      }
    },
    updateUnread() {
      this.resetLastSeenIndicator();
      // Waiting for scrolling caused by resetLastSeenIndicator to settle down
      setTimeout(this.markRead.bind(this), 1);
    },

    async onLoaded() {
      const view = this.loadingScreen;
      if (view) {
        const openDelta = Date.now() - this.openStart;
        console.log(
          'Conversation',
          this.model.idForLogging(),
          'took',
          openDelta,
          'milliseconds to load'
        );
        this.loadingScreen = null;
        view.remove();
      }
      if (window.fileToken) {
        const file = await Windows.ApplicationModel.DataTransfer.SharedStorageAccessManager.redeemTokenForFileAsync(window.fileToken);
        this.fileInput.file = file;
        this.fileInput.previewImages();
        window.fileToken = null;
      }
    },

    onOpened() {
      this.openStart = Date.now();
      this.lastActivity = Date.now();

      const statusPromise = this.throttledGetProfiles();
      // eslint-disable-next-line more/no-then
      this.statusFetch = statusPromise.then(() =>
        // eslint-disable-next-line more/no-then
        this.model.updateVerified().then(() => {
          this.onVerifiedChange();
          this.statusFetch = null;
          console.log('done with status fetch');
        })
      );

      // We schedule our catch-up decrypt right after any in-progress fetch of
      //   messages from the database, then ensure that the loading screen is only
      //   dismissed when that is complete.
      const messagesLoaded = this.inProgressFetch || Promise.resolve();

      // eslint-disable-next-line more/no-then
      messagesLoaded
        .then(this.model.decryptOldIncomingKeyErrors.bind(this))
        .then(this.onLoaded.bind(this), this.onLoaded.bind(this));

      this.view.resetScrollPosition();
      this.$el.trigger('force-resize');
      this.focusMessageField();

      if (this.inProgressFetch) {
        // eslint-disable-next-line more/no-then
        this.inProgressFetch.then(this.updateUnread.bind(this));
      } else {
        this.updateUnread();
      }
    },

    addScrollDownButtonWithCount() {
      this.updateScrollDownButton(1);
    },

    addScrollDownButton() {
      if (!this.scrollDownButton) {
        this.updateScrollDownButton();
      }
    },

    updateScrollDownButton(count) {
      if (this.scrollDownButton) {
        this.scrollDownButton.increment(count);
      } else {
        this.scrollDownButton = new Whisper.ScrollDownButtonView({ count });
        this.scrollDownButton.render();
        const container = this.$('.discussion-container');
        container.append(this.scrollDownButton.el);
      }
    },

    removeScrollDownButton() {
      if (this.scrollDownButton) {
        const button = this.scrollDownButton;
        this.scrollDownButton = null;
        button.remove();
      }
    },

    removeLastSeenIndicator() {
      if (this.lastSeenIndicator) {
        const indicator = this.lastSeenIndicator;
        this.lastSeenIndicator = null;
        indicator.remove();
      }
    },

    scrollToMessage(options = {}) {
      const { id } = options;

      if (!id) {
        return;
      }

      const el = this.$(`#${id}`);
      if (!el || el.length === 0) {
        return;
      }

      el[0].scrollIntoView();
    },

    async viewAllMedia() {
      // We have to do this manually, since our React component will not propagate click
      //   events up to its parent elements in the DOM.
      this.closeMenu();

      // We fetch more documents than media as they don’t require to be loaded
      // into memory right away. Revisit this once we have infinite scrolling:
      const DEFAULT_MEDIA_FETCH_COUNT = 50;
      const DEFAULT_DOCUMENTS_FETCH_COUNT = 150;

      const conversationId = this.model.get('id');
      const WhisperMessageCollection = Whisper.MessageCollection;
      const rawMedia = await Signal.Backbone.Conversation.fetchVisualMediaAttachments(
        {
          conversationId,
          count: DEFAULT_MEDIA_FETCH_COUNT,
          WhisperMessageCollection,
        }
      );
      const documents = await Signal.Backbone.Conversation.fetchFileAttachments(
        {
          conversationId,
          count: DEFAULT_DOCUMENTS_FETCH_COUNT,
          WhisperMessageCollection,
        }
      );

      // NOTE: Could we show grid previews from disk as well?
      const loadMessages = Signal.Components.Types.Message.loadWithObjectURL(
        Signal.Migrations.loadMessage
      );
      const media = await loadMessages(rawMedia);

      const { getAbsoluteAttachmentPath } = Signal.Migrations;
      const saveAttachment = async ({ message } = {}) => {
        const attachment = message.attachments[0];
        const timestamp = message.received_at;
        Signal.Types.Attachment.save({
          attachment,
          document,
          getAbsolutePath: getAbsoluteAttachmentPath,
          timestamp,
        });
      };

      const onItemClick = async ({ message, type }) => {
        switch (type) {
          case 'documents': {
            saveAttachment({ message });
            break;
          }

          case 'media': {
            const mediaWithObjectURL = media.map(mediaMessage =>
              Object.assign({}, mediaMessage, {
                objectURL: getAbsoluteAttachmentPath(
                  mediaMessage.attachments[0].path
                ),
              })
            );
            const selectedIndex = media.findIndex(
              mediaMessage => mediaMessage.id === message.id
            );
            this.lightboxGalleryView = new Whisper.ReactWrapperView({
              Component: Signal.Components.LightboxGallery,
              props: {
                messages: mediaWithObjectURL,
                onSave: () => saveAttachment({ message }),
                selectedIndex,
              },
              onClose: () => Signal.Backbone.Views.Lightbox.hide(),
            });
            Signal.Backbone.Views.Lightbox.show(this.lightboxGalleryView.el);
            break;
          }

          default:
            throw new TypeError(`Unknown attachment type: '${type}'`);
        }
      };

      const view = new Whisper.ReactWrapperView({
        Component: Signal.Components.MediaGallery,
        props: {
          documents,
          media,
          onItemClick,
        },
        onClose: () => this.resetPanel(),
      });

      this.listenBack(view);
    },

    scrollToBottom() {
      // If we're above the last seen indicator, we should scroll there instead
      // Note: if we don't end up at the bottom of the conversation, button won't go away!
      if (this.lastSeenIndicator) {
        const location = this.lastSeenIndicator.$el.position().top;
        if (location > 0) {
          this.lastSeenIndicator.el.scrollIntoView();
          return;
        }
        this.removeLastSeenIndicator();
      }
      this.view.scrollToBottom();
    },

    resetLastSeenIndicator(options = {}) {
      _.defaults(options, { scroll: true });

      let unreadCount = 0;
      let oldestUnread = null;

      // We need to iterate here because unseen non-messages do not contribute to
      //   the badge number, but should be reflected in the indicator's count.
      this.model.messageCollection.forEach(model => {
        if (!model.get('unread')) {
          return;
        }

        unreadCount += 1;
        if (!oldestUnread) {
          oldestUnread = model;
        }
      });

      this.removeLastSeenIndicator();

      if (oldestUnread) {
        this.lastSeenIndicator = new Whisper.LastSeenIndicatorView({
          count: unreadCount,
        });
        const lastSeenEl = this.lastSeenIndicator.render().$el;

        lastSeenEl.insertBefore(this.$(`#${oldestUnread.get('id')}`));

        if (this.view.atBottom() || options.scroll) {
          lastSeenEl[0].scrollIntoView();
        }

        // scrollIntoView is an async operation, but we have no way to listen for
        //   completion of the resultant scroll.
        setTimeout(() => {
          if (!this.view.atBottom()) {
            this.addScrollDownButtonWithCount(unreadCount);
          }
        }, 1);
      }
    },

    focusMessageField() {
      this.$messageField.focus();
    },

    focusMessageFieldAndClearDisabled() {
      this.$messageField.removeAttr('disabled');
      this.$messageField.focus();
    },

    async loadMoreMessages() {
      if (this.inProgressFetch) {
        return;
      }

      this.view.measureScrollPosition();
      const startingHeight = this.view.scrollHeight;

      await this.fetchMessages();
      // We delay this work to let scrolling/layout settle down first
      setTimeout(() => {
        this.view.measureScrollPosition();
        const endingHeight = this.view.scrollHeight;
        const delta = endingHeight - startingHeight;
        const height = this.view.outerHeight;

        const newScrollPosition = this.view.scrollPosition + delta - height;
        this.view.$el.scrollTop(newScrollPosition);
      }, 1);
    },

    fetchMessages() {
      console.log('fetchMessages');
      this.$('.bar-container').show();
      if (this.inProgressFetch) {
        console.log('Multiple fetchMessage calls!');
      }

      // Avoiding await, since we want to capture the promise and make it available via
      //   this.inProgressFetch
      // eslint-disable-next-line more/no-then
      this.inProgressFetch = this.model
        .fetchContacts()
        .then(() => this.model.fetchMessages())
        .then(() => {
          this.$('.bar-container').hide();
          this.model.messageCollection.where({ unread: 1 }).forEach(m => {
            m.fetch();
          });
          this.inProgressFetch = null;
        })
        .catch(error => {
          console.log(
            'fetchMessages error:',
            error && error.stack ? error.stack : error
          );
          this.inProgressFetch = null;
        });

      return this.inProgressFetch;
    },

    addMessage(message) {
      // This is debounced, so it won't hit the database too often.
      this.lazyUpdateVerified();

      this.model.addSingleMessage(message);
      message.setToExpire();

      if (message.isOutgoing()) {
        this.removeLastSeenIndicator();
      }
      if (this.lastSeenIndicator) {
        this.lastSeenIndicator.increment(1);
      }

      if (!this.isHidden() && !window.isFocused()) {
        // The conversation is visible, but window is not focused
        if (!this.lastSeenIndicator) {
          this.resetLastSeenIndicator({ scroll: false });
        } else if (
          this.view.atBottom() &&
          this.model.get('unreadCount') === this.lastSeenIndicator.getCount()
        ) {
          // The count check ensures that the last seen indicator is still in
          //   sync with the real number of unread, so we can scroll to it.
          //   We only do this if we're at the bottom, because that signals that
          //   the user is okay with us changing scroll around so they see the
          //   right unseen message first.
          this.resetLastSeenIndicator({ scroll: true });
        }
      } else if (!this.isHidden() && window.isFocused()) {
        // The conversation is visible and in focus
        this.markRead();

        // When we're scrolled up and we don't already have a last seen indicator
        //   we add a new one.
        if (!this.view.atBottom() && !this.lastSeenIndicator) {
          this.resetLastSeenIndicator({ scroll: false });
        }
      }
    },
    updateMessage(message) {
      this.model.messageCollection.add(message, { merge: true });
    },

    onClick(e) {
      // If there are sub-panels open, we don't want to respond to clicks
      if (!this.panels || !this.panels.length) {
        this.closeMenu(e);
        this.markRead();
      }
    },

    findNewestVisibleUnread() {
      const collection = this.model.messageCollection;
      const { length } = collection;
      const viewportBottom = this.view.outerHeight;
      const unreadCount = this.model.get('unreadCount') || 0;

      // Start with the most recent message, search backwards in time
      let foundUnread = 0;
      for (let i = length - 1; i >= 0; i -= 1) {
        // Search the latest 30, then stop if we believe we've covered all known
        //   unread messages. The unread should be relatively recent.
        // Why? local notifications can be unread but won't be reflected the
        //   conversation's unread count.
        if (i > 30 && foundUnread >= unreadCount) {
          return null;
        }

        const message = collection.at(i);
        if (!message.get('unread')) {
          // eslint-disable-next-line no-continue
          continue;
        }

        foundUnread += 1;

        const el = this.$(`#${message.id}`);
        const position = el.position();
        const { top } = position;

        // We're fully below the viewport, continue searching up.
        if (top > viewportBottom) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // If the bottom fits on screen, we'll call it visible. Even if the
        //   message is really tall.
        const height = el.height();
        const bottom = top + height;
        if (bottom <= viewportBottom) {
          return message;
        }

        // Continue searching up.
      }

      return null;
    },

    markRead() {
      let unread;

      if (this.view.atBottom()) {
        unread = this.model.messageCollection.last();
      } else {
        unread = this.findNewestVisibleUnread();
      }

      if (unread) {
        this.model.markRead(unread.get('received_at'));
      }
    },

    showMembers(e, providedMembers, options = {}) {
      _.defaults(options, { needVerify: false });

      const members = providedMembers || this.model.contactCollection;

      const view = new Whisper.GroupMemberList({
        model: members,
        // we pass this in to allow nested panels
        listenBack: this.listenBack.bind(this),
        needVerify: options.needVerify,
      });

      this.listenBack(view);
    },

    showSafetyNumber(e, providedModel) {
      let model = providedModel;

      if (!model && this.model.isPrivate()) {
        // eslint-disable-next-line prefer-destructuring
        model = this.model;
      }
      if (model) {
        const view = new Whisper.KeyVerificationPanelView({
          model,
        });
        this.listenBack(view);
      }
    },

    messageDetail(e, data) {
      const view = new Whisper.MessageDetailView({
        model: data.message,
        conversation: this.model,
        // we pass these in to allow nested panels
        listenBack: this.listenBack.bind(this),
        resetPanel: this.resetPanel.bind(this),
      });
      this.listenBack(view);
      view.render();
    },

    // not currently in use
    newGroupUpdate() {
      const view = new Whisper.NewGroupUpdateView({
        model: this.model,
        window: this.window,
      });
      view.render();
      this.listenBack(view);
    },

    showContactDetail({ contact, hasSignalAccount }) {
      const regionCode = storage.get('regionCode');
      const { contactSelector } = Signal.Types.Contact;
      const { getAbsoluteAttachmentPath } = window.Signal.Migrations;

      const view = new Whisper.ReactWrapperView({
        Component: Signal.Components.ContactDetail,
        className: 'contact-detail-pane panel',
        props: {
          contact: contactSelector(contact, {
            regionCode,
            getAbsoluteAttachmentPath,
          }),
          hasSignalAccount,
          onSendMessage: () => {
            const number =
              contact.number && contact.number[0] && contact.number[0].value;
            if (number) {
              this.openConversation(number);
            }
          },
        },
        onClose: () => this.resetPanel(),
      });

      this.listenBack(view);
    },

    async openConversation(number) {
      const conversation = await window.ConversationController.getOrCreateAndWait(
        number,
        'private'
      );
      window.Whisper.events.trigger('showConversation', conversation);
    },

    listenBack(view) {
      this.panels = this.panels || [];
      if (this.panels.length > 0) {
        this.panels[0].$el.hide();
      }
      this.panels.unshift(view);

      if (this.panels.length === 1) {
        this.$('.main.panel, .header-buttons.right').hide();
      }

      view.$el.insertBefore(this.$('.panel').first());

      var currentView = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
      currentView.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.visible;
      if (!window.onbackrequested) {
        window.onbackrequested = currentView.onbackrequested;
      }
      currentView.onbackrequested = function (event) {
        this.resetPanel();
        event && (event.detail[0].handled = true);
      }.bind(this);
    },
    resetPanel() {
      const view = this.panels.shift();
      if (this.panels.length > 0) {
        this.panels[0].$el.show();
      }
      view.remove();

      if (this.panels.length === 0) {
        this.$('.main.panel, .header-buttons.right').show();
        Windows.UI.Core.SystemNavigationManager.getForCurrentView().onbackrequested = window.onbackrequested;
        window.onbackrequested = null;
        this.$el.trigger('force-resize');
      }
    },

    closeMenu(e) {
      if (e && !$(e.target).hasClass('hamburger')) {
        this.$('.conversation-menu .menu-list').hide();
      }
      if (e && !$(e.target).hasClass('clock')) {
        this.$('.timer-menu .menu-list').hide();
      }
    },

    endSession() {
      this.model.endSession();
      this.$('.menu-list').hide();
    },

    leaveGroup() {
      this.model.leaveGroup();
      this.$('.menu-list').hide();
    },

    toggleMenu() {
      this.$('.conversation-menu .menu-list').toggle();
    },

    async destroyMessages() {
      this.$('.menu-list').hide();

      await this.confirm(i18n('deleteConversationConfirmation'));
      this.model.destroyMessages();
      this.remove();
    },

    showSendConfirmationDialog(e, contacts) {
      let message;
      const isUnverified = this.model.isUnverified();

      if (contacts.length > 1) {
        if (isUnverified) {
          message = i18n('changedSinceVerifiedMultiple');
        } else {
          message = i18n('changedRecentlyMultiple');
        }
      } else {
        const contactName = contacts.at(0).getTitle();
        if (isUnverified) {
          message = i18n('changedSinceVerified', [contactName, contactName]);
        } else {
          message = i18n('changedRecently', [contactName, contactName]);
        }
      }

      const dialog = new Whisper.ConfirmationDialogView({
        message,
        okText: i18n('sendAnyway'),
        resolve: () => {
          this.checkUnverifiedSendMessage(e, { force: true });
        },
        reject: () => {
          this.focusMessageFieldAndClearDisabled();
        },
      });

      this.$el.prepend(dialog.el);
      dialog.focusCancel();
    },

    async checkUnverifiedSendMessage(e, options = {}) {
      e.preventDefault();
      this.sendStart = Date.now();
      this.$messageField.attr('disabled', true);

      _.defaults(options, { force: false });

      // This will go to the trust store for the latest identity key information,
      //   and may result in the display of a new banner for this conversation.
      try {
        await this.model.updateVerified();
        const contacts = this.model.getUnverified();
        if (!contacts.length) {
          this.checkUntrustedSendMessage(e, options);
          return;
        }

        if (options.force) {
          await this.markAllAsVerifiedDefault(contacts);
          this.checkUnverifiedSendMessage(e, options);
          return;
        }

        this.showSendConfirmationDialog(e, contacts);
      } catch (error) {
        this.focusMessageFieldAndClearDisabled();
        console.log(
          'checkUnverifiedSendMessage error:',
          error && error.stack ? error.stack : error
        );
      }
    },

    async checkUntrustedSendMessage(e, options = {}) {
      _.defaults(options, { force: false });

      try {
        const contacts = await this.model.getUntrusted();
        if (!contacts.length) {
          this.sendMessage(e);
          return;
        }

        if (options.force) {
          await this.markAllAsApproved(contacts);
          this.sendMessage(e);
          return;
        }

        this.showSendConfirmationDialog(e, contacts);
      } catch (error) {
        this.focusMessageFieldAndClearDisabled();
        console.log(
          'checkUntrustedSendMessage error:',
          error && error.stack ? error.stack : error
        );
      }
    },

    toggleEmojiPanel(e) {
      e.preventDefault();
      if (!this.emojiPanel) {
        this.openEmojiPanel();
      } else {
        this.closeEmojiPanel();
      }
    },
    onKeyDown(event) {
      if (event.key !== 'Escape') {
        return;
      }

      this.closeEmojiPanel();
    },
    openEmojiPanel() {
      this.$emojiPanelContainer.outerHeight(200);
      this.emojiPanel = new EmojiPanel(this.$emojiPanelContainer[0], {
        onClick: this.insertEmoji.bind(this),
      });
      this.updateMessageFieldSize({});
    },
    closeEmojiPanel() {
      if (this.emojiPanel === null) {
        return;
      }

      this.$emojiPanelContainer.empty().outerHeight(0);
      this.emojiPanel = null;
      this.updateMessageFieldSize({});
    },
    insertEmoji(e) {
      const colons = `:${emojiData[e.index].short_name}:`;

      const textarea = this.$messageField[0];
      if (textarea.selectionStart || textarea.selectionStart === '0') {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;

        textarea.value =
          textarea.value.substring(0, startPos) +
          colons +
          textarea.value.substring(endPos, textarea.value.length);
        textarea.selectionStart = startPos + colons.length;
        textarea.selectionEnd = startPos + colons.length;
      } else {
        textarea.value += colons;
      }
      this.focusMessageField();
    },

    async setQuoteMessage(message) {
      this.quote = null;
      this.quotedMessage = message;

      if (this.quoteHolder) {
        this.quoteHolder.unload();
        this.quoteHolder = null;
      }

      if (message) {
        const quote = await this.model.makeQuote(this.quotedMessage);
        this.quote = quote;

        this.focusMessageFieldAndClearDisabled();
      }

      this.renderQuotedMessage();
    },

    renderQuotedMessage() {
      if (this.quoteView) {
        this.quoteView.remove();
        this.quoteView = null;
      }
      if (!this.quotedMessage) {
        this.updateMessageFieldSize({});
        return;
      }

      const message = new Whisper.Message({
        quote: this.quote,
      });
      message.quotedMessage = this.quotedMessage;
      this.quoteHolder = message;

      const props = message.getPropsForQuote();

      this.listenTo(message, 'scroll-to-message', this.scrollToMessage);

      const contact = this.quotedMessage.getContact();
      if (contact) {
        this.listenTo(contact, 'change:color', this.renderQuotedMesage);
      }

      this.quoteView = new Whisper.ReactWrapperView({
        className: 'quote-wrapper',
        Component: window.Signal.Components.Quote,
        props: Object.assign({}, props, {
          text: props.text,
          onClose: () => {
            this.setQuoteMessage(null);
          },
        }),
      });

      const selector =
        storage.get('theme-setting') === 'ios' ? '.bottom-bar' : '.send';

      this.$(selector).prepend(this.quoteView.el);
      this.updateMessageFieldSize({});
    },

    async sendMessage(e) {
      this.removeLastSeenIndicator();
      this.closeEmojiPanel();

      let toast;
      if (extension.expired()) {
        toast = new Whisper.ExpiredToast();
      }
      if (this.model.isPrivate() && storage.isBlocked(this.model.id)) {
        toast = new Whisper.BlockedToast();
      }
      if (!this.model.isPrivate() && this.model.get('left')) {
        toast = new Whisper.LeftGroupToast();
      }

      if (toast) {
        toast.$el.insertAfter(this.$el);
        toast.render();
        this.focusMessageFieldAndClearDisabled();
        return;
      }

      const input = this.$messageField;
      const message = window.Signal.Emoji.replaceColons(input.val()).trim();

      try {
        if (!message.length && !this.fileInput.hasFiles()) {
          return;
        }

        const attachments = await this.fileInput.getFiles();
        const sendDelta = Date.now() - this.sendStart;
        console.log('Send pre-checks took', sendDelta, 'milliseconds');

        this.model.sendMessage(message, attachments, this.quote);

        input.val('');
        this.setQuoteMessage(null);
        this.focusMessageFieldAndClearDisabled();
        this.forceUpdateMessageFieldSize(e);
        this.fileInput.deleteFiles();
      } catch (error) {
        console.log(
          'Error pulling attached files before send',
          error && error.stack ? error.stack : error
        );
      } finally {
        this.focusMessageFieldAndClearDisabled();
      }
    },

    updateColor(model, color) {
      const header = this.$('.conversation-header');
      header.removeClass(Whisper.Conversation.COLORS);
      if (color) {
        header.addClass(color);
      }
      const avatarView = new (Whisper.View.extend({
        templateName: 'avatar',
        render_attributes: { avatar: this.model.getAvatar() },
      }))();
      header.find('.avatar').replaceWith(avatarView.render().$('.avatar'));
    },

    updateAvatar() {
      const header = this.$('.conversation-header');
      const avatarView = new (Whisper.View.extend({
        templateName: 'avatar',
        render_attributes: { avatar: this.model.getAvatar() },
      }))();
      header.find('.avatar').replaceWith(avatarView.render().$('.avatar'));
    },

    updateMessageFieldSize(event) {
      const keyCode = event.which || event.keyCode;

      if (
        keyCode === 13 &&
        !event.altKey &&
        !event.shiftKey &&
        !event.ctrlKey
      ) {
        // enter pressed - submit the form now
        event.preventDefault();
        this.$('.bottom-bar form').submit();
        return;
      }
      this.toggleMicrophone();
      this.toggleLengthWarning();

      this.view.measureScrollPosition();
      window.autosize(this.$messageField);

      const $attachmentPreviews = this.$('.attachment-previews');
      const $bottomBar = this.$('.bottom-bar');
      const includeMargin = true;
      const quoteHeight = this.quoteView
        ? this.quoteView.$el.outerHeight(includeMargin)
        : 0;

      const height =
        this.$messageField.outerHeight() +
        $attachmentPreviews.outerHeight() +
        this.$emojiPanelContainer.outerHeight() +
        quoteHeight +
        parseInt($bottomBar.css('min-height'), 10);

      $bottomBar.outerHeight(height);

      this.view.scrollToBottomIfNeeded();
    },

    forceUpdateMessageFieldSize(event) {
      if (this.isHidden()) {
        return;
      }
      this.view.scrollToBottomIfNeeded();
      window.autosize.update(this.$messageField);
      this.updateMessageFieldSize(event);
    },

    isHidden() {
      return (
        this.$el.css('display') === 'none' ||
        this.$('.panel').css('display') === 'none'
      );
    },
  });
})();
