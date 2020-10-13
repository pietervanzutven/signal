/* global _: false */
/* global Backbone: false */
/* global storage: false */
/* global filesize: false */
/* global ConversationController: false */
/* global getAccountManager: false */
/* global i18n: false */
/* global Signal: false */
/* global textsecure: false */
/* global Whisper: false */
/* global wrapDeferred: false */

/* eslint-disable more/no-then */

// eslint-disable-next-line func-names
(function () {
  'use strict';

  window.Whisper = window.Whisper || {};

  const { Message: TypedMessage, Contact, PhoneNumber } = Signal.Types;
  const {
    // loadAttachmentData,
    deleteAttachmentData,
    getAbsoluteAttachmentPath,
  } = Signal.Migrations;

  window.AccountCache = Object.create(null);
  window.AccountJobs = Object.create(null);

  window.doesAcountCheckJobExist = number =>
    Boolean(window.AccountJobs[number]);
  window.checkForSignalAccount = number => {
    if (window.AccountJobs[number]) {
      return window.AccountJobs[number];
    }

    // eslint-disable-next-line more/no-then
    const job = textsecure.messaging
      .getProfile(number)
      .then(() => {
        window.AccountCache[number] = true;
      })
      .catch(() => {
        window.AccountCache[number] = false;
      });

    window.AccountJobs[number] = job;

    return job;
  };

  window.isSignalAccountCheckComplete = number =>
    window.AccountCache[number] !== undefined;
  window.hasSignalAccount = number => window.AccountCache[number];

  window.Whisper.Message = Backbone.Model.extend({
    database: Whisper.Database,
    storeName: 'messages',
    initialize(attributes) {
      if (_.isObject(attributes)) {
        this.set(TypedMessage.initializeSchemaVersion(attributes));
      }

      this.OUR_NUMBER = textsecure.storage.user.getNumber();

      this.on('change:attachments', this.updateImageUrl);
      this.on('destroy', this.onDestroy);
      this.on('change:expirationStartTimestamp', this.setToExpire);
      this.on('change:expireTimer', this.setToExpire);
      this.on('unload', this.unload);
      this.setToExpire();
    },
    idForLogging() {
      return `${this.get('source')}.${this.get('sourceDevice')} ${this.get(
        'sent_at'
      )}`;
    },
    defaults() {
      return {
        timestamp: new Date().getTime(),
        attachments: [],
      };
    },
    validate(attributes) {
      const required = ['conversationId', 'received_at', 'sent_at'];
      const missing = _.filter(required, attr => !attributes[attr]);
      if (missing.length) {
        console.log(`Message missing attributes: ${missing}`);
      }
    },
    isEndSession() {
      const flag = textsecure.protobuf.DataMessage.Flags.END_SESSION;
      // eslint-disable-next-line no-bitwise
      return !!(this.get('flags') & flag);
    },
    isExpirationTimerUpdate() {
      const flag =
        textsecure.protobuf.DataMessage.Flags.EXPIRATION_TIMER_UPDATE;
      // eslint-disable-next-line no-bitwise
      return !!(this.get('flags') & flag);
    },
    isGroupUpdate() {
      return !!this.get('group_update');
    },
    isIncoming() {
      return this.get('type') === 'incoming';
    },
    isUnread() {
      return !!this.get('unread');
    },
    // overriding this to allow for this.unset('unread'), save to db, then fetch()
    // to propagate. We don't want the unset key in the db so our unread index stays
    // small.
    /* eslint-disable */
    fetch(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      const model = this;
      const success = options.success;
      options.success = function (resp) {
        model.attributes = {}; // this is the only changed line
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      const error = options.error;
      options.error = function (resp) {
        if (error) error(model, resp, options);
        model.trigger('error', model, resp, options);
      };
      return this.sync('read', this, options);
    },
    /* eslint-enable */
    /* eslint-disable more/no-then */
    getNameForNumber(number) {
      const conversation = ConversationController.get(number);
      if (!conversation) {
        return number;
      }
      return conversation.getDisplayName();
    },
    getDescription() {
      if (this.isGroupUpdate()) {
        const groupUpdate = this.get('group_update');
        if (groupUpdate.left === 'You') {
          return i18n('youLeftTheGroup');
        } else if (groupUpdate.left) {
          return i18n('leftTheGroup', this.getNameForNumber(groupUpdate.left));
        }

        const messages = [];
        if (groupUpdate.name) {
          messages.push(i18n('titleIsNow', groupUpdate.name));
        }
        if (groupUpdate.joined && groupUpdate.joined.length) {
          const names = _.map(
            groupUpdate.joined,
            this.getNameForNumber.bind(this)
          );
          if (names.length > 1) {
            messages.push(i18n('multipleJoinedTheGroup', names.join(', ')));
          } else {
            messages.push(i18n('joinedTheGroup', names[0]));
          }
        }

        return messages.join(', ');
      }
      if (this.isEndSession()) {
        return i18n('sessionEnded');
      }
      if (this.isIncoming() && this.hasErrors()) {
        return i18n('incomingError');
      }
      return this.get('body');
    },
    isVerifiedChange() {
      return this.get('type') === 'verified-change';
    },
    isKeyChange() {
      return this.get('type') === 'keychange';
    },
    getNotificationText() {
      const description = this.getDescription();
      if (description) {
        return description;
      }
      if (this.get('attachments').length > 0) {
        return i18n('mediaMessage');
      }
      if (this.isExpirationTimerUpdate()) {
        const { expireTimer } = this.get('expirationTimerUpdate');
        return i18n(
          'timerSetTo',
          Whisper.ExpirationTimerOptions.getAbbreviated(expireTimer)
        );
      }
      if (this.isKeyChange()) {
        const phoneNumber = this.get('key_changed');
        const conversation = this.findContact(phoneNumber);
        return i18n(
          'safetyNumberChangedGroup',
          conversation ? conversation.getTitle() : null
        );
      }
      const contacts = this.get('contact');
      if (contacts && contacts.length) {
        return Contact.getName(contacts[0]);
      }

      return '';
    },
    async onDestroy() {
      this.revokeImageUrl();
      const attachments = this.get('attachments');
      await Promise.all(attachments.map(deleteAttachmentData));
    },
    updateImageUrl() {
      this.revokeImageUrl();
      const attachment = this.get('attachments')[0];
      if (attachment) {
        const blob = new Blob([attachment.data], {
          type: attachment.contentType,
        });
        this.imageUrl = URL.createObjectURL(blob);
      } else {
        this.imageUrl = null;
      }
    },
    unload() {
      if (this.quoteThumbnail) {
        URL.revokeObjectURL(this.quoteThumbnail.objectUrl);
        this.quoteThumbnail = null;
      }
      if (this.quotedMessage) {
        this.quotedMessage = null;
      }
      const quote = this.get('quote');
      const attachments = (quote && quote.attachments) || [];
      attachments.forEach(attachment => {
        if (attachment.thumbnail && attachment.thumbnail.objectUrl) {
          URL.revokeObjectURL(attachment.thumbnail.objectUrl);
          // eslint-disable-next-line no-param-reassign
          attachment.thumbnail.objectUrl = null;
        }
      });

      this.revokeImageUrl();
    },
    revokeImageUrl() {
      if (this.imageUrl) {
        URL.revokeObjectURL(this.imageUrl);
        this.imageUrl = null;
      }
    },
    getImageUrl() {
      if (this.imageUrl === undefined) {
        this.updateImageUrl();
      }
      return this.imageUrl;
    },
    getQuoteObjectUrl() {
      const thumbnail = this.quoteThumbnail;
      if (!thumbnail || !thumbnail.objectUrl) {
        return null;
      }

      return thumbnail.objectUrl;
    },
    getQuoteContact() {
      const quote = this.get('quote');
      if (!quote) {
        return null;
      }
      const { author } = quote;
      if (!author) {
        return null;
      }

      return ConversationController.get(author);
    },
    processAttachment(attachment, externalObjectUrl) {
      const { thumbnail } = attachment;
      const objectUrl = (thumbnail && thumbnail.objectUrl) || externalObjectUrl;
      const path = thumbnail && thumbnail.path;

      const thumbnailWithObjectUrl =
        !objectUrl && !path
          ? null
          : Object.assign({}, attachment.thumbnail || {}, {
              objectUrl: objectUrl || path,
            });

      return Object.assign({}, attachment, {
        isVoiceMessage: Signal.Types.Attachment.isVoiceMessage(attachment),
        thumbnail: thumbnailWithObjectUrl,
      });
    },
    getPropsForTimerNotification() {
      const { expireTimer, fromSync, source } = this.get(
        'expirationTimerUpdate'
      );
      const timespan = Whisper.ExpirationTimerOptions.getName(expireTimer || 0);

      const basicProps = Object.assign({},
        { type: 'fromOther' },
        this.findAndFormatContact(source),
        { timespan });

      if (source === this.OUR_NUMBER) {
        return Object.assign({},
          basicProps,
          { type: 'fromMe' });
      } else if (fromSync) {
        return Object.assign({},
          basicProps,
          { type: 'fromSync' });
      }

      return basicProps;
    },
    getPropsForSafetyNumberNotification() {
      const conversation = this.getConversation();
      const isGroup = conversation && !conversation.isPrivate();
      const phoneNumber = this.get('key_changed');
      const onVerify = () =>
        this.trigger('show-identity', this.findContact(phoneNumber));

      return {
        isGroup,
        contact: this.findAndFormatContact(phoneNumber),
        onVerify,
      };
    },
    getPropsForVerificationNotification() {
      const type = this.get('verified') ? 'markVerified' : 'markNotVerified';
      const isLocal = this.get('local');
      const phoneNumber = this.get('verifiedChanged');

      return {
        type,
        isLocal,
        contact: this.findAndFormatContact(phoneNumber),
      };
    },
    getPropsForResetSessionNotification() {
      // It doesn't need anything right now!
      return {};
    },
    findContact(phoneNumber) {
      return ConversationController.get(phoneNumber);
    },
    findAndFormatContact(phoneNumber) {
      const { format } = PhoneNumber;
      const regionCode = storage.get('regionCode');

      const contactModel = this.findContact(phoneNumber);
      const avatar = contactModel ? contactModel.getAvatar() : null;
      const color = contactModel ? contactModel.getColor() : null;

      return {
        phoneNumber: format(phoneNumber, {
          ourRegionCode: regionCode,
        }),
        color,
        avatarPath: avatar ? avatar.url : null,
        name: contactModel ? contactModel.getName() : null,
        profileName: contactModel ? contactModel.getProfileName() : null,
        title: contactModel ? contactModel.getTitle() : null,
      };
    },
    getPropsForGroupNotification() {
      const groupUpdate = this.get('group_update');
      const changes = [];

      if (!groupUpdate.name && !groupUpdate.left && !groupUpdate.joined) {
        changes.push({
          type: 'general',
        });
      }

      if (groupUpdate.joined) {
        changes.push({
          type: 'add',
          contacts: _.map(
            Array.isArray(groupUpdate.joined)
              ? groupUpdate.joined
              : [groupUpdate.joined],
            phoneNumber => this.findAndFormatContact(phoneNumber)
          ),
        });
      }

      if (groupUpdate.left === 'You') {
        changes.push({
          type: 'remove',
          isMe: true,
        });
      } else if (groupUpdate.left) {
        changes.push({
          type: 'remove',
          contacts: _.map(
            Array.isArray(groupUpdate.left)
              ? groupUpdate.left
              : [groupUpdate.left],
            phoneNumber => this.findAndFormatContact(phoneNumber)
          ),
        });
      }

      if (groupUpdate.name) {
        changes.push({
          type: 'name',
          newName: groupUpdate.name,
        });
      }

      return {
        changes,
      };
    },
    getMessagePropStatus() {
      if (!this.isOutgoing()) {
        return null;
      }

      if (this.hasErrors()) {
        return 'error';
      }

      const readBy = this.get('read_by') || [];
      if (readBy.length > 0) {
        return 'read';
      }
      const delivered = this.get('delivered');
      const deliveredTo = this.get('delivered_to') || [];
      if (delivered || deliveredTo.length > 0) {
        return 'delivered';
      }
      const sent = this.get('sent');
      const sentTo = this.get('sent_to') || [];
      if (sent || sentTo.length > 0) {
        return 'sent';
      }

      return 'sending';
    },
    getPropsForMessage() {
      const phoneNumber = this.getSource();
      const contact = this.findAndFormatContact(phoneNumber);
      const contactModel = this.findContact(phoneNumber);

      const authorColor = contactModel ? contactModel.getColor() : null;
      const authorAvatar = contactModel ? contactModel.getAvatar() : null;
      const authorAvatarPath = authorAvatar.url;

      const expirationLength = this.get('expireTimer') * 1000;
      const expireTimerStart = this.get('expirationStartTimestamp');
      const expirationTimestamp =
        expirationLength && expireTimerStart
          ? expireTimerStart + expirationLength
          : null;

      const conversation = this.getConversation();
      const isGroup = conversation && !conversation.isPrivate();

      const attachments = this.get('attachments');
      const firstAttachment = attachments && attachments[0];

      return {
        text: this.createNonBreakingLastSeparator(this.get('body')),
        id: this.id,
        direction: this.isIncoming() ? 'incoming' : 'outgoing',
        timestamp: this.get('sent_at'),
        status: this.getMessagePropStatus(),
        contact: this.getPropsForEmbeddedContact(),
        authorName: contact.name,
        authorProfileName: contact.profileName,
        authorPhoneNumber: contact.phoneNumber,
        authorColor,
        conversationType: isGroup ? 'group' : 'direct',
        attachment: this.getPropsForAttachment(firstAttachment),
        quote: this.getPropsForQuote(),
        authorAvatarPath,
        expirationLength,
        expirationTimestamp,
        onReply: () => this.trigger('reply', this),
        onRetrySend: () => this.retrySend(),
        onShowDetail: () => this.trigger('show-message-detail', this),
        onDelete: () => this.trigger('delete', this),
        onClickAttachment: () =>
          this.trigger('show-lightbox', {
            attachment: firstAttachment,
            message: this,
          }),

        onDownload: () =>
          this.trigger('download', {
            attachment: firstAttachment,
            message: this,
          }),
      };
    },
    createNonBreakingLastSeparator(text) {
      if (!text) {
        return null;
      }

      const nbsp = '\xa0';
      const regex = /(\S)( +)(\S+\s*)$/;
      return text.replace(regex, (match, start, spaces, end) => {
        const newSpaces = _.reduce(
          spaces,
          accumulator => accumulator + nbsp,
          ''
        );
        return `${start}${newSpaces}${end}`;
      });
    },
    getPropsForEmbeddedContact() {
      const regionCode = storage.get('regionCode');
      const { contactSelector } = Contact;

      const contacts = this.get('contact');
      if (!contacts || !contacts.length) {
        return null;
      }

      const contact = contacts[0];
      const firstNumber =
        contact.number && contact.number[0] && contact.number[0].value;
      const onSendMessage = firstNumber
        ? () => {
          this.trigger('open-conversation', firstNumber);
        }
        : null;
      const onClick = async () => {
        // First let's be sure that the signal account check is complete.
        await window.checkForSignalAccount(firstNumber);

        this.trigger('show-contact-detail', {
          contact,
          hasSignalAccount: window.hasSignalAccount(firstNumber),
        });
      };

      // Would be nice to do this before render, on initial load of message
      if (!window.isSignalAccountCheckComplete(firstNumber)) {
        window.checkForSignalAccount(firstNumber).then(() => {
          this.trigger('change');
        });
      }

      return contactSelector(contact, {
        regionCode,
        getAbsoluteAttachmentPath,
        onSendMessage,
        onClick,
        hasSignalAccount: window.hasSignalAccount(firstNumber),
      });
    },
    getPropsForQuote() {
      const quote = this.get('quote');
      if (!quote) {
        return null;
      }

      const objectUrl = this.getQuoteObjectUrl();
      const { author } = quote;
      const contact = this.getQuoteContact();

      const authorPhoneNumber = author;
      const authorProfileName = contact ? contact.getProfileName() : null;
      const authorName = contact ? contact.getName() : null;
      const authorColor = contact ? contact.getColor() : 'grey';
      const isFromMe = contact ? contact.id === this.OUR_NUMBER : false;
      const onClick = () => {
        const { quotedMessage } = this;
        if (quotedMessage) {
          this.trigger('scroll-to-message', { id: quotedMessage.id });
        }
      };

      const firstAttachment = quote.attachments && quote.attachments[0];

      return {
        text: this.createNonBreakingLastSeparator(quote.text),
        attachment: firstAttachment
          ? this.processAttachment(firstAttachment, objectUrl)
          : null,
        isFromMe,
        authorPhoneNumber,
        authorProfileName,
        authorName,
        authorColor,
        onClick: this.quotedMessage ? onClick : null,
      };
    },
    getPropsForAttachment(attachment) {
      if (!attachment) {
        return null;
      }

      const { path, flags, size, screenshot, thumbnail } = attachment;

      return Object.assign({},
        attachment,
        {
          fileSize: size ? filesize(size) : null,
          isVoiceMessage:
            flags &&
            // eslint-disable-next-line no-bitwise
            flags & textsecure.protobuf.AttachmentPointer.Flags.VOICE_MESSAGE,
          url: getAbsoluteAttachmentPath(path),
          screenshot: screenshot
            ? Object.assign({},
              screenshot,
              { url: getAbsoluteAttachmentPath(screenshot.path) })
            : null,
          thumbnail: thumbnail
            ? Object.assign({},
              thumbnail,
              { url: getAbsoluteAttachmentPath(thumbnail.path) })
            : null,
        });
    },
    getPropsForMessageDetail() {
      const newIdentity = i18n('newIdentity');
      const OUTGOING_KEY_ERROR = 'OutgoingIdentityKeyError';

      // Older messages don't have the recipients included on the message, so we fall
      //   back to the conversation's current recipients
      const phoneNumbers = this.isIncoming()
        ? [this.get('source')]
        : this.get('recipients') || this.conversation.getRecipients();

      // This will make the error message for outgoing key errors a bit nicer
      const allErrors = (this.get('errors') || []).map(error => {
        if (error.name === OUTGOING_KEY_ERROR) {
          // eslint-disable-next-line no-param-reassign
          error.message = newIdentity;
        }

        return error;
      });

      // If an error has a specific number it's associated with, we'll show it next to
      //   that contact. Otherwise, it will be a standalone entry.
      const errors = _.reject(allErrors, error => Boolean(error.number));
      const errorsGroupedById = _.groupBy(allErrors, 'number');
      const finalContacts = (phoneNumbers || []).map(id => {
        const errorsForContact = errorsGroupedById[id];
        const isOutgoingKeyError = Boolean(
          _.find(errorsForContact, error => error.name === OUTGOING_KEY_ERROR)
        );

        return Object.assign({},
          this.findAndFormatContact(id),
          {
            status: this.getStatus(id),
            errors: errorsForContact,
            isOutgoingKeyError,
            onSendAnyway: () =>
              this.trigger('force-send', {
                contact: this.findContact(id),
                message: this,
              }),
            onShowSafetyNumber: () =>
              this.trigger('show-identity', this.findContact(id)),
          });
      });

      // The prefix created here ensures that contacts with errors are listed
      //   first; otherwise it's alphabetical
      const sortedContacts = _.sortBy(
        finalContacts,
        contact => `${contact.errors ? '0' : '1'}${contact.title}`
      );

      return {
        sentAt: this.get('sent_at'),
        receivedAt: this.get('received_at'),
        message: Object.assign({},
          this.getPropsForMessage(),
          {
            disableMenu: true,
            // To ensure that group avatar doesn't show up
            conversationType: 'direct',
          }),
        errors,
        contacts: sortedContacts,
      };
    },
    retrySend() {
      const retries = _.filter(
        this.get('errors'),
        this.isReplayableError.bind(this)
      );
      _.map(retries, 'number').forEach(number => {
        this.resend(number);
      });
    },
    getConversation() {
      // This needs to be an unsafe call, because this method is called during
      //   initial module setup. We may be in the middle of the initial fetch to
      //   the database.
      return ConversationController.getUnsafe(this.get('conversationId'));
    },
    getIncomingContact() {
      if (!this.isIncoming()) {
        return null;
      }
      const source = this.get('source');
      if (!source) {
        return null;
      }

      return ConversationController.getOrCreate(source, 'private');
    },
    getSource() {
      if (this.isIncoming()) {
        return this.get('source');
      }

      return this.OUR_NUMBER;
    },
    getContact() {
      return ConversationController.getOrCreate(this.getSource(), 'private');
    },
    isOutgoing() {
      return this.get('type') === 'outgoing';
    },
    hasErrors() {
      return _.size(this.get('errors')) > 0;
    },

    getStatus(number) {
      const readBy = this.get('read_by') || [];
      if (readBy.indexOf(number) >= 0) {
        return 'read';
      }
      const deliveredTo = this.get('delivered_to') || [];
      if (deliveredTo.indexOf(number) >= 0) {
        return 'delivered';
      }
      const sentTo = this.get('sent_to') || [];
      if (sentTo.indexOf(number) >= 0) {
        return 'sent';
      }

      return null;
    },

    send(promise) {
      this.trigger('pending');
      return promise
        .then(result => {
          const now = Date.now();
          this.trigger('done');
          if (result.dataMessage) {
            this.set({ dataMessage: result.dataMessage });
          }
          const sentTo = this.get('sent_to') || [];
          this.save({
            sent_to: _.union(sentTo, result.successfulNumbers),
            sent: true,
            expirationStartTimestamp: now,
          });
          this.trigger('sent', this);
          this.sendSyncMessage();
        })
        .catch(result => {
          const now = Date.now();
          this.trigger('done');
          if (result.dataMessage) {
            this.set({ dataMessage: result.dataMessage });
          }

          let promises = [];

          if (result instanceof Error) {
            this.saveErrors(result);
            if (result.name === 'SignedPreKeyRotationError') {
              promises.push(getAccountManager().rotateSignedPreKey());
            } else if (result.name === 'OutgoingIdentityKeyError') {
              const c = ConversationController.get(result.number);
              promises.push(c.getProfiles());
            }
          } else {
            this.saveErrors(result.errors);
            if (result.successfulNumbers.length > 0) {
              const sentTo = this.get('sent_to') || [];
              this.set({
                sent_to: _.union(sentTo, result.successfulNumbers),
                sent: true,
                expirationStartTimestamp: now,
              });
              promises.push(this.sendSyncMessage());
            }
            promises = promises.concat(
              _.map(result.errors, error => {
                if (error.name === 'OutgoingIdentityKeyError') {
                  const c = ConversationController.get(error.number);
                  promises.push(c.getProfiles());
                }
              })
            );
          }

          return Promise.all(promises).then(() => {
            this.trigger('send-error', this.get('errors'));
          });
        });
    },

    someRecipientsFailed() {
      const c = this.getConversation();
      if (!c || c.isPrivate()) {
        return false;
      }

      const recipients = c.contactCollection.length - 1;
      const errors = this.get('errors');
      if (!errors) {
        return false;
      }

      if (errors.length > 0 && recipients > 0 && errors.length < recipients) {
        return true;
      }

      return false;
    },

    sendSyncMessage() {
      this.syncPromise = this.syncPromise || Promise.resolve();
      this.syncPromise = this.syncPromise.then(() => {
        const dataMessage = this.get('dataMessage');
        if (this.get('synced') || !dataMessage) {
          return Promise.resolve();
        }
        return textsecure.messaging
          .sendSyncMessage(
            dataMessage,
            this.get('sent_at'),
            this.get('destination'),
            this.get('expirationStartTimestamp')
          )
          .then(() => {
            this.save({ synced: true, dataMessage: null });
          });
      });
    },

    saveErrors(providedErrors) {
      let errors = providedErrors;

      if (!(errors instanceof Array)) {
        errors = [errors];
      }
      errors.forEach(e => {
        console.log(
          'Message.saveErrors:',
          e && e.reason ? e.reason : null,
          e && e.stack ? e.stack : e
        );
      });
      errors = errors.map(e => {
        if (
          e.constructor === Error ||
          e.constructor === TypeError ||
          e.constructor === ReferenceError
        ) {
          return _.pick(e, 'name', 'message', 'code', 'number', 'reason');
        }
        return e;
      });
      errors = errors.concat(this.get('errors') || []);

      return this.save({ errors });
    },

    hasNetworkError() {
      const error = _.find(
        this.get('errors'),
        e =>
          e.name === 'MessageError' ||
          e.name === 'OutgoingMessageError' ||
          e.name === 'SendMessageNetworkError' ||
          e.name === 'SignedPreKeyRotationError'
      );
      return !!error;
    },
    removeOutgoingErrors(number) {
      const errors = _.partition(
        this.get('errors'),
        e =>
          e.number === number &&
          (e.name === 'MessageError' ||
            e.name === 'OutgoingMessageError' ||
            e.name === 'SendMessageNetworkError' ||
            e.name === 'SignedPreKeyRotationError' ||
            e.name === 'OutgoingIdentityKeyError')
      );
      this.set({ errors: errors[1] });
      return errors[0][0];
    },
    isReplayableError(e) {
      return (
        e.name === 'MessageError' ||
        e.name === 'OutgoingMessageError' ||
        e.name === 'SendMessageNetworkError' ||
        e.name === 'SignedPreKeyRotationError' ||
        e.name === 'OutgoingIdentityKeyError'
      );
    },
    resend(number) {
      const error = this.removeOutgoingErrors(number);
      if (error) {
        const promise = new textsecure.ReplayableError(error).replay();
        this.send(promise);
      }
    },
    handleDataMessage(dataMessage, confirm) {
      // This function is called from the background script in a few scenarios:
      //   1. on an incoming message
      //   2. on a sent message sync'd from another device
      //   3. in rare cases, an incoming message can be retried, though it will
      //      still go through one of the previous two codepaths
      const message = this;
      const source = message.get('source');
      const type = message.get('type');
      let conversationId = message.get('conversationId');
      if (dataMessage.group) {
        conversationId = dataMessage.group.id;
      }
      const GROUP_TYPES = textsecure.protobuf.GroupContext.Type;

      const conversation = ConversationController.get(conversationId);
      return conversation.queueJob(
        () =>
          new Promise(resolve => {
            const now = new Date().getTime();
            let attributes = { type: 'private' };
            if (dataMessage.group) {
              let groupUpdate = null;
              attributes = {
                type: 'group',
                groupId: dataMessage.group.id,
              };
              if (dataMessage.group.type === GROUP_TYPES.UPDATE) {
                attributes = {
                  type: 'group',
                  groupId: dataMessage.group.id,
                  name: dataMessage.group.name,
                  avatar: dataMessage.group.avatar,
                  members: _.union(
                    dataMessage.group.members,
                    conversation.get('members')
                  ),
                };
                groupUpdate =
                  conversation.changedAttributes(
                    _.pick(dataMessage.group, 'name', 'avatar')
                  ) || {};
                const difference = _.difference(
                  attributes.members,
                  conversation.get('members')
                );
                if (difference.length > 0) {
                  groupUpdate.joined = difference;
                }
                if (conversation.get('left')) {
                  console.log('re-added to a left group');
                  attributes.left = false;
                }
              } else if (dataMessage.group.type === GROUP_TYPES.QUIT) {
                if (source === textsecure.storage.user.getNumber()) {
                  attributes.left = true;
                  groupUpdate = { left: 'You' };
                } else {
                  groupUpdate = { left: source };
                }
                attributes.members = _.without(
                  conversation.get('members'),
                  source
                );
              }

              if (groupUpdate !== null) {
                message.set({ group_update: groupUpdate });
              }
            }
            message.set({
              attachments: dataMessage.attachments,
              body: dataMessage.body,
              contact: dataMessage.contact,
              conversationId: conversation.id,
              decrypted_at: now,
              errors: [],
              flags: dataMessage.flags,
              hasAttachments: dataMessage.hasAttachments,
              hasFileAttachments: dataMessage.hasFileAttachments,
              hasVisualMediaAttachments: dataMessage.hasVisualMediaAttachments,
              quote: dataMessage.quote,
              schemaVersion: dataMessage.schemaVersion,
            });
            if (type === 'outgoing') {
              const receipts = Whisper.DeliveryReceipts.forMessage(
                conversation,
                message
              );
              receipts.forEach(() =>
                message.set({
                  delivered: (message.get('delivered') || 0) + 1,
                })
              );
            }
            attributes.active_at = now;
            conversation.set(attributes);

            if (message.isExpirationTimerUpdate()) {
              message.set({
                expirationTimerUpdate: {
                  source,
                  expireTimer: dataMessage.expireTimer,
                },
              });
              conversation.set({ expireTimer: dataMessage.expireTimer });
            } else if (dataMessage.expireTimer) {
              message.set({ expireTimer: dataMessage.expireTimer });
            }

            // NOTE: Remove once the above uses
            // `Conversation::updateExpirationTimer`:
            const { expireTimer } = dataMessage;
            const shouldLogExpireTimerChange =
              message.isExpirationTimerUpdate() || expireTimer;
            if (shouldLogExpireTimerChange) {
              console.log("Update conversation 'expireTimer'", {
                id: conversation.idForLogging(),
                expireTimer,
                source: 'handleDataMessage',
              });
            }

            if (!message.isEndSession()) {
              if (dataMessage.expireTimer) {
                if (
                  dataMessage.expireTimer !== conversation.get('expireTimer')
                ) {
                  conversation.updateExpirationTimer(
                    dataMessage.expireTimer,
                    source,
                    message.get('received_at'),
                    {
                      fromGroupUpdate: message.isGroupUpdate(),
                    }
                  );
                }
              } else if (
                conversation.get('expireTimer') &&
                // We only turn off timers if it's not a group update
                !message.isGroupUpdate()
              ) {
                conversation.updateExpirationTimer(
                  null,
                  source,
                  message.get('received_at')
                );
              }
            }
            if (type === 'incoming') {
              const readSync = Whisper.ReadSyncs.forMessage(message);
              if (readSync) {
                if (
                  message.get('expireTimer') &&
                  !message.get('expirationStartTimestamp')
                ) {
                  message.set(
                    'expirationStartTimestamp',
                    Math.min(readSync.get('read_at'), Date.now())
                  );
                }
              }
              if (readSync || message.isExpirationTimerUpdate()) {
                message.unset('unread');
                // This is primarily to allow the conversation to mark all older
                // messages as read, as is done when we receive a read sync for
                // a message we already know about.
                Whisper.ReadSyncs.notifyConversation(message);
              } else {
                conversation.set(
                  'unreadCount',
                  conversation.get('unreadCount') + 1
                );
              }
            }

            if (type === 'outgoing') {
              const reads = Whisper.ReadReceipts.forMessage(
                conversation,
                message
              );
              if (reads.length) {
                const readBy = reads.map(receipt => receipt.get('reader'));
                message.set({
                  read_by: _.union(message.get('read_by'), readBy),
                });
              }

              message.set({ recipients: conversation.getRecipients() });
            }

            const conversationTimestamp = conversation.get('timestamp');
            if (
              !conversationTimestamp ||
              message.get('sent_at') > conversationTimestamp
            ) {
              conversation.set({
                lastMessage: message.getNotificationText(),
                timestamp: message.get('sent_at'),
              });
            }

            if (dataMessage.profileKey) {
              const profileKey = dataMessage.profileKey.toArrayBuffer();
              if (source === textsecure.storage.user.getNumber()) {
                conversation.set({ profileSharing: true });
              } else if (conversation.isPrivate()) {
                conversation.set({ profileKey });
              } else {
                ConversationController.getOrCreateAndWait(
                  source,
                  'private'
                ).then(sender => {
                  sender.setProfileKey(profileKey);
                });
              }
            }

            const handleError = error => {
              const errorForLog = error && error.stack ? error.stack : error;
              console.log(
                'handleDataMessage',
                message.idForLogging(),
                'error:',
                errorForLog
              );
              return resolve();
            };

            message.save().then(() => {
              conversation.save().then(() => {
                try {
                  conversation.trigger('newmessage', message);
                } catch (e) {
                  return handleError(e);
                }
                // We fetch() here because, between the message.save() above and
                // the previous line's trigger() call, we might have marked all
                // messages unread in the database. This message might already
                // be read!
                const previousUnread = message.get('unread');
                return message.fetch().then(
                  () => {
                    try {
                      if (previousUnread !== message.get('unread')) {
                        console.log(
                          'Caught race condition on new message read state! ' +
                          'Manually starting timers.'
                        );
                        // We call markRead() even though the message is already
                        // marked read because we need to start expiration
                        // timers, etc.
                        message.markRead();
                      }

                      if (message.get('unread')) {
                        return conversation.notify(message).then(() => {
                          confirm();
                          return resolve();
                        }, handleError);
                      }

                      confirm();
                      return resolve();
                    } catch (e) {
                      return handleError(e);
                    }
                  },
                  () => {
                    try {
                      console.log(
                        'handleDataMessage: Message',
                        message.idForLogging(),
                        'was deleted'
                      );

                      confirm();
                      return resolve();
                    } catch (e) {
                      return handleError(e);
                    }
                  }
                );
              }, handleError);
            }, handleError);
          })
      );
    },
    async markRead(readAt) {
      this.unset('unread');
      if (this.get('expireTimer') && !this.get('expirationStartTimestamp')) {
        const expireTimerStart = Math.min(Date.now(), readAt || Date.now());
        this.set('expirationStartTimestamp', expireTimerStart);
      }
      Whisper.Notifications.remove(
        Whisper.Notifications.where({
          messageId: this.id,
        })
      );
      return wrapDeferred(this.save());
    },
    isExpiring() {
      return this.get('expireTimer') && this.get('expirationStartTimestamp');
    },
    isExpired() {
      return this.msTilExpire() <= 0;
    },
    msTilExpire() {
      if (!this.isExpiring()) {
        return Infinity;
      }
      const now = Date.now();
      const start = this.get('expirationStartTimestamp');
      const delta = this.get('expireTimer') * 1000;
      let msFromNow = start + delta - now;
      if (msFromNow < 0) {
        msFromNow = 0;
      }
      return msFromNow;
    },
    setToExpire() {
      if (this.isExpiring() && !this.get('expires_at')) {
        const start = this.get('expirationStartTimestamp');
        const delta = this.get('expireTimer') * 1000;
        const expiresAt = start + delta;

        // This method can be called due to the expiration-related .set() calls in
        //   handleDataMessage(), but the .save() here would conflict with the
        //   same call at the end of handleDataMessage(). So we only call .save()
        //   here if we've previously saved this model.
        if (!this.isNew()) {
          this.save('expires_at', expiresAt);
        }

        Whisper.ExpiringMessagesListener.update();
        console.log('Set message expiration', {
          expiresAt,
          sentAt: this.get('sent_at'),
        });
      }
    },
  });

  Whisper.MessageCollection = Backbone.Collection.extend({
    model: Whisper.Message,
    database: Whisper.Database,
    storeName: 'messages',
    comparator(left, right) {
      if (left.get('received_at') === right.get('received_at')) {
        return (left.get('sent_at') || 0) - (right.get('sent_at') || 0);
      }

      return (left.get('received_at') || 0) - (right.get('received_at') || 0);
    },
    initialize(models, options) {
      if (options) {
        this.conversation = options.conversation;
      }
    },
    destroyAll() {
      return Promise.all(
        this.models.map(
          m =>
            new Promise((resolve, reject) => {
              m
                .destroy()
                .then(resolve)
                .fail(reject);
            })
        )
      );
    },

    fetchSentAt(timestamp) {
      return new Promise(resolve =>
        this.fetch({
          index: {
            // 'receipt' index on sent_at
            name: 'receipt',
            only: timestamp,
          },
        }).always(resolve)
      );
    },

    getLoadedUnreadCount() {
      return this.reduce((total, model) => {
        const unread = model.get('unread') && model.isIncoming();
        return total + (unread ? 1 : 0);
      }, 0);
    },

    fetchConversation(conversationId, providedLimit, providedUnreadCount) {
      let limit = providedLimit;
      let unreadCount = providedUnreadCount;

      if (typeof limit !== 'number') {
        limit = 100;
      }
      if (typeof unreadCount !== 'number') {
        unreadCount = 0;
      }

      let startingLoadedUnread = 0;
      if (unreadCount > 0) {
        startingLoadedUnread = this.getLoadedUnreadCount();
      }
      return new Promise(resolve => {
        let upper;
        if (this.length === 0) {
          // fetch the most recent messages first
          upper = Number.MAX_VALUE;
        } else {
          // not our first rodeo, fetch older messages.
          upper = this.at(0).get('received_at');
        }
        const options = { remove: false, limit };
        options.index = {
          // 'conversation' index on [conversationId, received_at]
          name: 'conversation',
          lower: [conversationId],
          upper: [conversationId, upper],
          order: 'desc',
          // SELECT messages WHERE conversationId = this.id ORDER
          // received_at DESC
        };
        this.fetch(options).always(resolve);
      }).then(() => {
        if (unreadCount <= 0) {
          return Promise.resolve();
        }

        const loadedUnread = this.getLoadedUnreadCount();
        if (loadedUnread >= unreadCount) {
          return Promise.resolve();
        }

        if (startingLoadedUnread === loadedUnread) {
          // that fetch didn't get us any more unread. stop fetching more.
          return Promise.resolve();
        }

        console.log('fetchConversation: doing another fetch to get all unread');
        return this.fetchConversation(conversationId, limit, unreadCount);
      });
    },

    fetchNextExpiring() {
      this.fetch({ index: { name: 'expires_at' }, limit: 1 });
    },

    fetchExpired() {
      console.log('Load expired messages');
      this.fetch({
        conditions: { expires_at: { $lte: Date.now() } },
        addIndividually: true,
      });
    },
  });
})();
