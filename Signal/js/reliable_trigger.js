(function() {
  // Note: this is all the code required to customize Backbone's trigger() method to make
  //   it resilient to exceptions thrown by event handlers. Indentation and code styles
  //   were kept inline with the Backbone implementation for easier diffs.

  // The changes are:
  //   1. added 'name' parameter to triggerEvents to give it access to the current event name
  //   2. added try/catch handlers to triggerEvents with error logging inside every while loop

  // And of course, we update the protoypes of Backbone.Model/Backbone.View as well as
  //   Backbone.Events itself

  var arr = [];

  var slice = arr.slice;

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, name, args) {
    var ev,
      i = -1,
      l = events.length,
      a1 = args[0],
      a2 = args[1],
      a3 = args[2];
    var logError = function(error) {
      console.log(
        'Model caught error triggering',
        name,
        'event:',
        error && error.stack ? error.stack : error
      );
    };
    switch (args.length) {
      case 0:
        while (++i < l) {
          try {
            (ev = events[i]).callback.call(ev.ctx);
          } catch (error) {
            logError(error);
          }
        }
        return;
      case 1:
        while (++i < l) {
          try {
            (ev = events[i]).callback.call(ev.ctx, a1);
          } catch (error) {
            logError(error);
          }
        }
        return;
      case 2:
        while (++i < l) {
          try {
            (ev = events[i]).callback.call(ev.ctx, a1, a2);
          } catch (error) {
            logError(error);
          }
        }
        return;
      case 3:
        while (++i < l) {
          try {
            (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
          } catch (error) {
            logError(error);
          }
        }
        return;
      default:
        while (++i < l) {
          try {
            (ev = events[i]).callback.apply(ev.ctx, args);
          } catch (error) {
            logError(error);
          }
        }
        return;
    }
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  function trigger(name) {
    if (!this._events) return this;
    var args = slice.call(arguments, 1);
    if (!eventsApi(this, 'trigger', name, args)) return this;
    var events = this._events[name];
    var allEvents = this._events.all;
    if (events) triggerEvents(events, name, args);
    if (allEvents) triggerEvents(allEvents, name, arguments);
    return this;
  }

  Backbone.Model.prototype.trigger = Backbone.View.prototype.trigger = Backbone.Collection.prototype.trigger = Backbone.Events.trigger = trigger;
})();
