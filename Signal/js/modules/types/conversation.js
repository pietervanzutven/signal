/* global dcodeIO, crypto */

(function () {
  'use strict';

  window.types = window.types || {};

  const fse = window.fs_extra;
  const { isFunction, isNumber } = window.lodash;
  const { createLastMessageUpdate } = window.ts.types.Conversation;

  async function computeHash(arraybuffer) {
    const hash = await crypto.subtle.digest({ name: 'SHA-512' }, arraybuffer);
    return arrayBufferToBase64(hash);
  }

  function arrayBufferToBase64(arraybuffer) {
    return dcodeIO.ByteBuffer.wrap(arraybuffer).toString('base64');
  }

  function base64ToArrayBuffer(base64) {
    return dcodeIO.ByteBuffer.wrap(base64, 'base64').toArrayBuffer();
  }

  function buildAvatarUpdater({ field }) {
    return async (conversation, data, options = {}) => {
      if (!conversation) {
        return conversation;
      }

      const avatar = conversation[field];
      const { writeNewAttachmentData, deleteAttachmentData } = options;
      if (!isFunction(writeNewAttachmentData)) {
        throw new Error(
          'Conversation.buildAvatarUpdater: writeNewAttachmentData must be a function'
        );
      }
      if (!isFunction(deleteAttachmentData)) {
        throw new Error(
          'Conversation.buildAvatarUpdater: deleteAttachmentData must be a function'
        );
      }

      const newHash = await computeHash(data);

      if (!avatar || !avatar.hash) {
        return Object.assign({},
          conversation,
          {
            avatar: {
              hash: newHash,
              path: await writeNewAttachmentData(data),
            },
          }
        );
      }

      const { hash, path } = avatar;

      if (hash === newHash) {
        return conversation;
      }

      await deleteAttachmentData(path);

      return Object.assign({},
        conversation,
        {
          avatar: {
            hash: newHash,
            path: await writeNewAttachmentData(data),
          },
        }
      );
    };
  }

  const maybeUpdateAvatar = buildAvatarUpdater({ field: 'avatar' });
  const maybeUpdateProfileAvatar = buildAvatarUpdater({
    field: 'profileAvatar',
  });

  async function upgradeToVersion2(conversation, options) {
    if (conversation.version >= 2) {
      return conversation;
    }

    const { writeNewAttachmentData } = options;
    if (!isFunction(writeNewAttachmentData)) {
      throw new Error(
        'Conversation.upgradeToVersion2: writeNewAttachmentData must be a function'
      );
    }

    let { avatar, profileAvatar, profileKey } = conversation;

    if (avatar && avatar.data) {
      if (typeof avatar.data === 'string') {
        avatar.data = (await fse.readFile(avatar.data)).buffer;
      }
      avatar = {
        hash: await computeHash(avatar.data),
        path: await writeNewAttachmentData(avatar.data),
      };
    }

    if (profileAvatar && profileAvatar.data) {
      if (typeof profileAvatar.data === 'string') {
        profileAvatar.data = (await fse.readFile(profileAvatar.data)).buffer;
      }
      profileAvatar = {
        hash: await computeHash(profileAvatar.data),
        path: await writeNewAttachmentData(profileAvatar.data),
      };
    }

    if (profileKey && profileKey.byteLength) {
      profileKey = arrayBufferToBase64(profileKey);
    }

    return Object.assign({},
      conversation,
      {
        version: 2,
        avatar,
        profileAvatar,
        profileKey,
      }
    );
  }

  async function migrateConversation(conversation, options = {}) {
    if (!conversation) {
      return conversation;
    }
    if (!isNumber(conversation.version)) {
      // eslint-disable-next-line no-param-reassign
      conversation.version = 1;
    }

    return upgradeToVersion2(conversation, options);
  }

  window.types.conversation = {
    migrateConversation,
    maybeUpdateAvatar,
    maybeUpdateProfileAvatar,
    createLastMessageUpdate,
    arrayBufferToBase64,
    base64ToArrayBuffer,
  };
})();