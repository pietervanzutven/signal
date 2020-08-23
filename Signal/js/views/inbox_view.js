/* global ConversationController: false */
/* global extension: false */
/* global getInboxCollection: false */
/* global i18n: false */
/* global Whisper: false */

// eslint-disable-next-line func-names
(function () {
  'use strict';

  window.Whisper = window.Whisper || {};

  Whisper.ConversationStack = Whisper.View.extend({
    className: 'conversation-stack',
    open(conversation) {
      const id = `conversation-${conversation.cid}`;
      if (id !== this.el.firstChild.id) {
        this.$el.first().find('video, audio').each(function pauseMedia() {
          this.pause();
        });
        let $el = this.$(`#${id}`);
        if ($el === null || $el.length === 0) {
          const view = new Whisper.ConversationView({
            model: conversation,
            window: this.model.window,
          });
          // eslint-disable-next-line prefer-destructuring
          $el = view.$el;
        }
        $el.prependTo(this.el);
      }
      conversation.trigger('opened');

      var gutter = $('.gutter');
      var stack = $('.conversation-stack');
      while (window.onbackrequested) {
        Windows.UI.Core.SystemNavigationManager.getForCurrentView().onbackrequested.call();
      }
      if (window.innerWidth < 600) {
        gutter.hide();
        stack.show();
      }
      var currentView = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
      currentView.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.visible;
      currentView.onbackrequested = function (event) {
        if (currentView.appViewBackButtonVisibility === Windows.UI.Core.AppViewBackButtonVisibility.visible) {
          $('.conversation.placeholder').prependTo(stack);
          if (window.innerWidth < 600) {
            gutter.show();
            stack.hide();
          }
          currentView.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.collapsed;
          event.detail[0].handled = true;
        }
      };
    },
  });

  Whisper.FontSizeView = Whisper.View.extend({
    defaultSize: 14,
    maxSize: 30,
    minSize: 14,
    initialize() {
      this.currentSize = this.defaultSize;
      this.render();
    },
    events: { keydown: 'zoomText' },
    zoomText(e) {
      if (!e.ctrlKey) {
        return;
      }
      const keyCode = e.which || e.keyCode;
      const maxSize = 22; // if bigger text goes outside send-message textarea
      const minSize = 14;
      if (keyCode === 189 || keyCode === 109) {
        if (this.currentSize > minSize) {
          this.currentSize -= 1;
        }
      } else if (keyCode === 187 || keyCode === 107) {
        if (this.currentSize < maxSize) {
          this.currentSize += 1;
        }
      }
      this.render();
    },
    render() {
      this.$el.css('font-size', `${this.currentSize}px`);
    },
  });


  Whisper.AppLoadingScreen = Whisper.View.extend({
    templateName: 'app-loading-screen',
    className: 'app-loading-screen',
    updateProgress(count) {
      if (count > 0) {
        const message = i18n('loadingMessages', count.toString());
        this.$('.message').text(message);
      }
    },
    render_attributes: {
      message: i18n('loading'),
    },
  });

  Whisper.InboxView = Whisper.View.extend({
    templateName: 'two-column',
    className: 'inbox index',
    initialize(options = {}) {
      this.ready = false;
      this.render();
      this.$el.attr('tabindex', '1');

      // eslint-disable-next-line no-new
      new Whisper.FontSizeView({ el: this.$el });

      this.conversation_stack = new Whisper.ConversationStack({
        el: this.$('.conversation-stack'),
        model: { window: options.window },
      });

      if (!options.initialLoadComplete) {
        this.appLoadingScreen = new Whisper.AppLoadingScreen();
        this.appLoadingScreen.render();
        this.appLoadingScreen.$el.prependTo(this.el);
        this.startConnectionListener();
      }

      const inboxCollection = getInboxCollection();

      inboxCollection.on('messageError', () => {
        this.networkStatusView.render();
      });

      this.inboxListView = new Whisper.ConversationListView({
        el: this.$('.inbox'),
        collection: inboxCollection,
      }).render();

      this.inboxListView.listenTo(
        inboxCollection,
        'add change:timestamp change:name change:number',
        this.inboxListView.updateLocation
      );
      this.inboxListView.listenTo(
        inboxCollection,
        'remove',
        this.inboxListView.removeItem
      );

      this.searchView = new Whisper.ConversationSearchView({
        el: this.$('.search-results'),
        input: this.$('input.search'),
      });

      this.searchView.$el.hide();

      this.listenTo(this.searchView, 'hide', function toggleVisibility() {
        this.searchView.$el.hide();
        this.inboxListView.$el.show();
      });
      this.listenTo(this.searchView, 'show', function toggleVisibility() {
        this.searchView.$el.show();
        this.inboxListView.$el.hide();
      });
      this.listenTo(
        this.searchView,
        'open',
        this.openConversation.bind(this, null)
      );

      this.networkStatusView = new Whisper.NetworkStatusView();
      this.$el.find('.network-status-container')
        .append(this.networkStatusView.render().el);

      extension.windows.onClosed(() => {
        this.inboxListView.stopListening();
      });

      if (extension.expired()) {
        const banner = new Whisper.ExpiredAlertBanner().render();
        banner.$el.prependTo(this.$el);
        this.$el.addClass('expired');
      }
    },
    render_attributes: {
      welcomeToSignal: i18n('welcomeToSignal'),
      selectAContact: i18n('selectAContact'),
      searchForPeopleOrGroups: i18n('searchForPeopleOrGroups'),
      submitDebugLog: i18n('submitDebugLog'),
      backup: i18n('backup'),
      settings: i18n('settings'),
      openReleaseNotes: i18n('goToReleaseNotes'),
      openForums: i18n('goToForums'),
      openSupportPage: i18n('goToSupportPage'),
      openNewBugForm: i18n('fileABug'),
      showAbout: i18n('aboutSignalDesktop'),
      setupWithImport: i18n('menuSetupWithImport'),
      setupAsNewDevice: i18n('menuSetupAsNewDevice'),
      setupAsStandalone: i18n('menuSetupAsStandalone'),
      restartSignal: i18n('restartSignal'),
    },
    events: {
      click: 'onClick',
      'click #header': 'focusHeader',
      'click .conversation': 'focusConversation',
      'click .global-menu .hamburger': 'toggleMenu',
      'click .show-debug-log': window.showDebugLog,
      'click .backup': window.showBackupScreen,
      'click .show-settings': 'showSettings',
      'click .open-release-notes': window.openReleaseNotes,
      'click .open-forums': window.openForums,
      'click .open-support-page': window.openSupportPage,
      'click .open-new-bug-form': window.openNewBugForm,
      'click .show-about': window.showAbout,
      'click .setup-with-import': window.setupWithImport,
      'click .setup-as-new-device': window.setupAsNewDevice,
      'click .setup-as-standalone': window.setupAsStandalone,
      'select .gutter .conversation-list-item': 'openConversation',
      'input input.search': 'filterContacts',
    },
    startConnectionListener() {
      this.interval = setInterval(() => {
        const status = window.getSocketStatus();
        switch (status) {
          case WebSocket.CONNECTING:
            break;
          case WebSocket.OPEN:
            clearInterval(this.interval);
            // if we've connected, we can wait for real empty event
            this.interval = null;
            break;
          case WebSocket.CLOSING:
          case WebSocket.CLOSED:
            clearInterval(this.interval);
            this.interval = null;
            // if we failed to connect, we pretend we got an empty event
            this.onEmpty();
            break;
          default:
            console.log(
              'Whisper.InboxView::startConnectionListener:',
              'Unknown web socket status:', status
            );
            break;
        }
      }, 1000);
    },
    onEmpty() {
      const view = this.appLoadingScreen;
      if (view) {
        this.appLoadingScreen = null;
        view.remove();
      }
    },
    onProgress(count) {
      const view = this.appLoadingScreen;
      if (view) {
        view.updateProgress(count);
      }
    },
    focusConversation(e) {
      if (e && this.$(e.target).closest('.placeholder').length) {
        return;
      }

      this.$('#header, .gutter').addClass('inactive');
      this.$('.conversation-stack').removeClass('inactive');
    },
    focusHeader() {
      this.$('.conversation-stack').addClass('inactive');
      this.$('#header, .gutter').removeClass('inactive');
      this.$('.conversation:first .menu').trigger('close');
    },
    reloadBackgroundPage() {
      window.location.reload();
    },
    showSettings() {
      if (this.$el.find('.settings').length) {
        return;
      }
      const view = new Whisper.SettingsView();
      view.$el.appendTo(this.el);
    },
    filterContacts(e) {
      this.searchView.filterContacts(e);
      const input = this.$('input.search');
      if (input.val().length > 0) {
        input.addClass('active');
        const textDir = window.getComputedStyle(input[0]).direction;
        if (textDir === 'ltr') {
          input.removeClass('rtl').addClass('ltr');
        } else if (textDir === 'rtl') {
          input.removeClass('ltr').addClass('rtl');
        }
      } else {
        input.removeClass('active');
      }
    },
    openConversation(e, conversation) {
      this.searchView.hideHints();
      if (conversation) {
        this.conversation_stack.open(ConversationController.get(conversation.id));
        this.focusConversation();
      }
    },
    toggleMenu() {
        this.$('.global-menu .menu-list').toggle();
    },
    closeRecording(e) {
      if (e && this.$(e.target).closest('.capture-audio').length > 0) {
        return;
      }
      this.$('.conversation:first .recorder').trigger('close');
    },
    closeMenu(e) {
      if (e && this.$(e.target).parent('.global-menu').length > 0) {
        return;
      }

      this.$('.global-menu .menu-list').hide();
    },
    onClick(e) {
      this.closeMenu(e);
      this.closeRecording(e);
    },
  });

  Whisper.ExpiredAlertBanner = Whisper.View.extend({
    templateName: 'expired_alert',
    className: 'expiredAlert clearfix',
    render_attributes() {
      return {
        expiredWarning: i18n('expiredWarning'),
        upgrade: i18n('upgrade'),
      };
    },
  });
}());
