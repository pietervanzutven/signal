/* global window */

(function () {
  'use strict';

  const { ipcRenderer: ipc, remote } = window.electron;
  const sharp = window.sharp;
  const pify = window.pify;
  const { readFile } = window.fs;
  const config = window.url.parse(window.location.toString(), true).query;
  const { noop, uniqBy } = window.lodash;
  const { deriveStickerPackKey } = window.crypto;
  const { makeGetter } = window.preload_utils;

  const { dialog } = remote;
  const { systemPreferences } = remote.require('electron');

  window.ROOT_PATH = window.location.href.startsWith('file') ? '../../' : '/';
  window.PROTO_ROOT = '../../protos';
  window.getEnvironment = () => config.environment;
  window.getVersion = () => config.version;
  window.getGuid = window.uuid.v4;

  window.localeMessages = ipc.sendSync('locale-data');

  require_logging();
  const Signal = window.signal;

  window.Signal = Signal.setup({});

  const { initialize: initializeWebAPI } = window.web_api;

  const WebAPI = initializeWebAPI({
    url: config.serverUrl,
    cdnUrl: config.cdnUrl,
    certificateAuthority: config.certificateAuthority,
    contentProxyUrl: config.contentProxyUrl,
    proxyUrl: config.proxyUrl,
  });

  window.convertToWebp = async (path, width = 512, height = 512) => {
    const pngBuffer = await pify(readFile)(path);
    const buffer = await sharp(pngBuffer)
      .resize({
        width,
        height,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp()
      .toBuffer();

    return {
      path,
      buffer,
      src: `data:image/webp;base64,${buffer.toString('base64')}`,
    };
  };

  window.encryptAndUpload = async (
    manifest,
    stickers,
    cover,
    onProgress = noop
  ) => {
    const usernameItem = await window.Signal.Data.getItemById('number_id');
    const passwordItem = await window.Signal.Data.getItemById('password');

    if (!usernameItem || !passwordItem) {
      const { message } = window.localeMessages[
        'StickerCreator--Authentication--error'
      ];

      dialog.showMessageBox({
        type: 'warning',
        message,
      });

      throw new Error(message);
    }

    const { value: username } = usernameItem;
    const { value: password } = passwordItem;

    const packKey = window.libsignal.crypto.getRandomBytes(32);
    const encryptionKey = await deriveStickerPackKey(packKey);
    const iv = window.libsignal.crypto.getRandomBytes(16);

    const server = WebAPI.connect({ username, password });

    const uniqueStickers = uniqBy([...stickers, { webp: cover }], 'webp');

    const manifestProto = new window.textsecure.protobuf.StickerPack();
    manifestProto.title = manifest.title;
    manifestProto.author = manifest.author;
    manifestProto.stickers = stickers.map(({ emoji }, id) => {
      const s = new window.textsecure.protobuf.StickerPack.Sticker();
      s.id = id;
      s.emoji = emoji;

      return s;
    });
    const coverSticker = new window.textsecure.protobuf.StickerPack.Sticker();
    coverSticker.id =
      uniqueStickers.length === stickers.length ? 0 : uniqueStickers.length - 1;
    coverSticker.emoji = '';
    manifestProto.cover = coverSticker;

    const encryptedManifest = await encrypt(
      manifestProto.toArrayBuffer(),
      encryptionKey,
      iv
    );
    const encryptedStickers = await Promise.all(
      uniqueStickers.map(({ webp }) => encrypt(webp.buffer, encryptionKey, iv))
    );

    const packId = await server.putStickers(
      encryptedManifest,
      encryptedStickers,
      onProgress
    );

    const hexKey = window.Signal.Crypto.hexFromBytes(packKey);

    ipc.send('install-sticker-pack', packId, hexKey);

    return { packId, key: hexKey };
  };

  async function encrypt(data, key, iv) {
    const { ciphertext } = await window.textsecure.crypto.encryptAttachment(
      // Convert Node Buffer to ArrayBuffer
      window.Signal.Crypto.concatenateBytes(data),
      key,
      iv
    );

    return ciphertext;
  }

  const getThemeSetting = makeGetter('theme-setting');

  async function resolveTheme() {
    const theme = (await getThemeSetting()) || 'light';
    if (process.platform === 'darwin' && theme === 'system') {
      return systemPreferences.isDarkMode() ? 'dark' : 'light';
    }
    return theme;
  }

  async function applyTheme() {
    window.document.body.classList.remove('dark-theme');
    window.document.body.classList.remove('light-theme');
    window.document.body.classList.add(`${await resolveTheme()}-theme`);
  }

  window.addEventListener('DOMContentLoaded', applyTheme);

  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    applyTheme
  );
})();