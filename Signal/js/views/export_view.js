;(function () {
  'use strict';
  window.Whisper = window.Whisper || {};

  var State = {
    DISCONNECTING: 1,
    EXPORTING: 2,
    COMPLETE: 3,
  };

  var STEPS = {
    INTRODUCTION: 1,
    CHOOSE: 2,
    EXPORTING: 3,
    COMPLETE: 4,
    UNINSTALL: 5,
  };    

  function getCacheBuster() {
    return Math.random().toString(36).substring(7);
  }

  Whisper.Export = {
    isComplete: function() {
      return storage.get('backupState') === State.COMPLETE;
    },
    inProgress: function() {
      return storage.get('backupState') > 0 || this.everComplete();
    },
    markComplete: function(target) {
      storage.put('backupState', State.COMPLETE);
      storage.put('backupEverCompleted', true);
      if (target) {
        storage.put('backupStorageLocation', target);
      }
    },
    cancel: function() {
      return Promise.all([
        storage.remove('backupState'),
        storage.remove('backupEverCompleted'),
        storage.remove('backupStorageLocation')
      ]);
    },
    beginExport: function() {
      storage.put('backupState', State.EXPORTING);

      var everAttempted = this.everAttempted();
      storage.put('backupEverAttempted', true);

      // If this is the second time the user is attempting to export, we'll exclude
      //   client-specific encryption configuration. Yes, this will fire if the user
      //   initially attempts to save to a read-only directory or something like that, but
      //   it will prevent the horrible encryption errors which result from import to the
      //   same client config more than once. They can import the same message history
      //   more than once, so we preserve that.
      return Whisper.Backup.getDirectoryForExport().then(function(directory) {
          return Whisper.Backup.backupToDirectory(directory);
      });
    },
    init: function() {
      storage.put('backupState', State.DISCONNECTING);
      Whisper.events.trigger('start-shutdown');
    },
    everAttempted: function() {
      return Boolean(storage.get('backupEverAttempted'));
    },
    everComplete: function() {
      return Boolean(storage.get('backupEverCompleted'));
    },
    getExportLocation: function() {
      return storage.get('backupStorageLocation');
    }
  };

  Whisper.ExportView = Whisper.View.extend({
    templateName: 'export-flow-template',
    className: 'full-screen-flow',
    events: {
      'click .start': 'onClickStart',
      'click .choose': 'onClickChoose',
      'click .submit-debug-log': 'onClickDebugLog',
      'click .cancel': 'onClickCancel',
      'click .restart': window.restart
    },
    initialize: function() {
      this.step = STEPS.INTRODUCTION;

      // init() tells MessageReceiver to disconnect and drain its queue, will fire
      //   'shutdown-complete' event when that is done. Might result in a synchronous
      //   event, so call it after we register our callback.
      Whisper.events.once('shutdown-complete', function() {
        this.shutdownComplete = true;
      }.bind(this));
      Whisper.Export.init();

      if (!Whisper.Export.inProgress()) {
        this.render();
        return;
      }

      this.render();
    },
    render_attributes: function() {
      if (this.error) {
        return {
          isError: true,
          errorHeader: i18n('exportErrorHeader'),
          error: i18n('exportError'),
          tryAgain: i18n('chooseFolderAndTryAgain'),
          debugLogButton: i18n('submitDebugLog'),
        };
      }

      var location = Whisper.Export.getExportLocation() || i18n('selectedLocation');
      var downloadLocation = 'https://github.com/pietervanzutven/signal/releases';

      return {
        cancelButton: i18n('upgradeLater'),
        debugLogButton: i18n('submitDebugLog'),

        isStep1: this.step === 1,
        startHeader: i18n('startExportHeader'),
        startParagraph1: i18n('startExportIntroParagraph1'),
        startParagraph2: i18n('startExportIntroParagraph2'),
        startParagraph3: i18n('startExportIntroParagraph3'),
        moreInformation: i18n('moreInformation'),
        startButton: i18n('imReady'),

        isStep2: this.step === 2,
        chooseHeader: i18n('saveHeader'),
        choose: i18n('saveDataPrompt'),
        chooseButton: i18n('chooseDirectory'),

        isStep3: this.step === 3,
        exportHeader: i18n('savingData'),

        isStep4: this.step === 4,
        completeHeader: i18n('completeHeader'),
        completeIntro: i18n('completeIntro'),
        completeLocation: location,
        completeNextSteps: i18n('completeNextSteps'),
        downloadLocation: downloadLocation,
        installButton: i18n('getNewVersion'),
      };
    },
    onClickStart: function() {
      this.selectStep(STEPS.CHOOSE);
    },
    onClickChoose: function() {
      this.error = null;

      if (!this.shutdownComplete) {
        console.log("Preventing export start; we haven't disconnected from the server");
        this.error = true;
        this.render();
        return;
      }

      return this.beginExport();

      this.render();
    },
    onClickCancel: function() {
      this.cancel();
    },
    onClickDebugLog: function() {
      this.openDebugLog();
    },

    cancel: function() {
      Whisper.Export.cancel().then(function() {
        console.log('Restarting now');
        window.location.reload();
      });
    },
    selectStep: function(step) {
      this.step = step;
      this.render();
    },

    openDebugLog: function() {
      this.closeDebugLog();
      this.debugLogView = new Whisper.DebugLogView();
      this.debugLogView.$el.appendTo(this.el);
    },
    closeDebugLog: function() {
      if (this.debugLogView) {
        this.debugLogView.remove();
        this.debugLogView = null;
      }
    },

    beginExport: function() {
      this.selectStep(STEPS.EXPORTING);

      Whisper.Export.beginExport()
        .then(this.completeExport.bind(this))
        .catch(function(error) {
          // We ensure that a restart of the app acts as if the user never tried
          //   to export.
          Whisper.Export.cancel();

          // We special-case the error we get when the user cancels out of the
          //   filesystem choice dialog: it's not shown an error.
          if (!error || error.name !== 'ChooseError') {
            this.error = error || new Error('in case we reject() null!');
          }

          // Because this is our first time attempting to export, we go back to
          //   the choice step. Compare this to the end of onClickChoose().
          this.selectStep(STEPS.CHOOSE);
        }.bind(this));
    },
    completeExport: function(target) {
      // This will prevent connection to the server on future app launches
      Whisper.Export.markComplete(target);
      this.selectStep(STEPS.COMPLETE);
    },
  });
}());