/*! jQuery.LazyJaxDavis - v0.0.0 -  3/31/2012
 * https://github.com/Takazudo/jQuery.LazyJaxDavix
 * Copyright (c) 2012 "Takazudo" Takeshi Takatsudo; Licensed MIT */

var __slice = Array.prototype.slice,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

(function($, win, doc) {
  var ns, wait;
  ns = {};
  wait = ns.wait = function(time) {
    return $.Deferred(function(defer) {
      return setTimeout(function() {
        return defer.resolve();
      }, time);
    });
  };
  $.support.pushstate = Davis.supported();
  ns.isToId = function(path) {
    if ((path.charAt(0)) === '#') {
      return true;
    } else {
      return false;
    }
  };
  ns.tryParseAnotherPageAnchor = function(path) {
    var res, ret;
    if (ns.isToId(path)) return false;
    if ((path.indexOf('#')) === -1) return false;
    res = path.match(/^([^#]+)#(.+)/);
    ret = {
      path: res[1]
    };
    if (res[2]) ret.hash = "#" + res[2];
    return ret;
  };
  ns.filterStr = function(str, expr) {
    var res;
    res = str.match(expr);
    if (res && res[1]) {
      return $.trim(res[1]);
    } else {
      return null;
    }
  };
  ns.fetchPage = (function() {
    var current;
    current = null;
    return function(url) {
      var ret;
      ret = $.Deferred(function(defer) {
        var options;
        if (current) current.abort();
        options = {
          url: url,
          dataType: 'text',
          cache: true
        };
        return current = ($.ajax(options)).then(function(res) {
          current = null;
          return defer.resolve(res);
        }, function(xhr, msg) {
          var aborted;
          aborted = msg === 'abort';
          return defer.reject(aborted);
        });
      }).promise();
      ret.abort = function() {
        return current != null ? current.abort() : void 0;
      };
      return ret;
    };
  })();
  ns.Event = (function() {

    function Event() {
      this._callbacks = {};
    }

    Event.prototype.bind = function(ev, callback) {
      var evs, name, _base, _i, _len;
      evs = ev.split(' ');
      for (_i = 0, _len = evs.length; _i < _len; _i++) {
        name = evs[_i];
        (_base = this._callbacks)[name] || (_base[name] = []);
        this._callbacks[name].push(callback);
      }
      return this;
    };

    Event.prototype.one = function(ev, callback) {
      return this.bind(ev, function() {
        this.unbind(ev, arguments.callee);
        return callback.apply(this, arguments);
      });
    };

    Event.prototype.trigger = function() {
      var args, callback, ev, list, _i, _len, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ev = args.shift();
      list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
      if (!list) return;
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        callback = list[_i];
        if (callback.apply(this, args) === false) break;
      }
      return this;
    };

    Event.prototype.unbind = function(ev, callback) {
      var cb, i, list, _len, _ref;
      if (!ev) {
        this._callbacks = {};
        return this;
      }
      list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
      if (!list) return this;
      if (!callback) {
        delete this._callbacks[ev];
        return this;
      }
      for (i = 0, _len = list.length; i < _len; i++) {
        cb = list[i];
        if (!(cb === callback)) continue;
        list = list.slice();
        list.splice(i, 1);
        this._callbacks[ev] = list;
        break;
      }
      return this;
    };

    return Event;

  })();
  ns.HistoryLogger = (function() {

    function HistoryLogger() {
      this._items = [];
    }

    HistoryLogger.prototype.log = function(obj) {
      this._items.push(obj);
      return this;
    };

    HistoryLogger.prototype.last = function() {
      var l;
      l = this._items.length;
      if (l) {
        return this._items[l - 1];
      } else {
        return null;
      }
    };

    HistoryLogger.prototype.isToSamePageRequst = function(request) {
      var last;
      last = this.last();
      if (!last) return false;
      if (request.path === last.request.path) {
        return true;
      } else {
        return false;
      }
    };

    return HistoryLogger;

  })();
  ns.Page = (function(_super) {
    var eventNames;

    __extends(Page, _super);

    eventNames = ['fetchstart', 'fetchend', 'afterrefresh', 'fetchfail'];

    Page.prototype.router = null;

    function Page(request, config, routed, router) {
      var _this = this;
      this.request = request;
      this.config = config;
      this.routed = routed;
      this.router = router;
      Page.__super__.constructor.apply(this, arguments);
      $.each(eventNames, function(i, eventName) {
        return $.each(_this.config, function(key, val) {
          if (eventName !== key) return true;
          return _this.bind(eventName, val);
        });
      });
      this._eventify_anotherAageAnchor();
    }

    Page.prototype._eventify_anotherAageAnchor = function() {
      var res,
        _this = this;
      res = ns.tryParseAnotherPageAnchor(this.request.path);
      if (!(res != null ? res.hash : void 0)) return this;
      this._hash = res.hash;
      this.bind('fetchend', function() {
        return location.href = _this._hash;
      });
      return this;
    };

    Page.prototype.fetch = function() {
      var _this = this;
      return $.Deferred(function(defer) {
        _this.trigger('fetchstart', _this.router.$root, _this.router);
        return (ns.fetchPage(_this.request.path)).then(function(text) {
          var data;
          data = {
            wholetext: text,
            title: ns.filterStr(text, _this.router.options.exprTitle),
            content: ns.filterStr(text, _this.router.options.exprContent)
          };
          _this.trigger('fetchend', _this.router.$root, _this.router, data);
          return defer.resolve(data);
        }, function(aborted) {
          if (!aborted) {
            _this.trigger('fetchfail', _this.router.$root, _this.router);
          }
          return defer.reject({
            aborted: aborted
          });
        });
      });
    };

    return Page;

  })(ns.Event);
  ns.Router = (function(_super) {
    var eventNames;

    __extends(Router, _super);

    eventNames = ['everyfetchstart', 'everyfetchend', 'everybeforerefresh', 'everyafterrefresh', 'everyfetchfail'];

    Router.prototype.options = {
      exprTitle: /<title[^>]*>([^<]*)<\/title>/,
      exprContent: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/,
      linkSelector: 'a:not(.apply-nolazyjax)',
      formSelector: 'form:not(.apply-nolazyjax)',
      throwErrors: false,
      handleRouteNotFound: true
    };

    function Router(pages, options) {
      if (!(this instanceof arguments.callee)) {
        return new ns.Router(pages, options);
      }
      Router.__super__.constructor.apply(this, arguments);
      this.pages = pages || null;
      this.options = $.extend({}, this.options, options);
      this.$root = this.options.root || null;
      this.logger = new ns.HistoryLogger;
      this._eventify();
      this._setupDavis();
    }

    Router.prototype._eventify = function() {
      var _this = this;
      $.each(eventNames, function(i, eventName) {
        return $.each(_this.options, function(key, val) {
          if (key !== eventName) return true;
          return _this.bind(eventName, val);
        });
      });
      return this;
    };

    Router.prototype._setupDavis = function() {
      var self,
        _this = this;
      if (!$.support.pushstate) return;
      self = this;
      this.davis = new Davis(function() {
        var davis;
        davis = this;
        if (!self.pages) return;
        return $.each(self.pages, function(i, pageInfo) {
          davis.get(pageInfo.path, function(request) {
            var page;
            if (self.logger.isToSamePageRequst(request)) return;
            page = new ns.Page(request, pageInfo, true, self);
            self.logger.log(page);
            return self.updateContent(page);
          });
          return true;
        });
      });
      if (this.options.handleRouteNotFound) {
        this.davis.bind('routeNotFound', function(request) {
          var page;
          if (ns.isToId(request.path)) {
            self.trigger('toid', request.path);
            return;
          }
          if (self.logger.isToSamePageRequst(request)) return;
          page = new ns.Page(request, {}, false, self);
          self.logger.log(page);
          return self.updateContent(page);
        });
      }
      this.davis.configure(function(config) {
        return $.each(_this.options, function(key, val) {
          config[key] = val;
          return true;
        });
      });
      this.bind('toid', function(hash) {
        if (_this.options.toid) {
          return _this.options.toid.call(_this, request.path);
        } else {
          return location.href = hash;
        }
      });
      return this;
    };

    Router.prototype.updateContent = function(page) {
      var _this = this;
      return $.Deferred(function(defer) {
        _this.trigger('everyfetchstart', _this.$root, _this);
        return page.fetch().then(function(data) {
          _this.trigger('everyfetchend', _this.$root, _this);
          page.trigger('beforerefresh', _this.$root, _this);
          _this.trigger('everybeforerefresh', _this.$root, _this);
          _this.$root.html(data.content);
          page.trigger('afterrefresh', _this.$root, _this);
          _this.trigger('everyafterrefresh', _this.$root, _this);
          return defer.resolve();
        }, function() {
          return _this.trigger('everyfetchfail', _this.$root, _this);
        });
      }).promise();
    };

    Router.prototype.destroy = function() {
      var _ref;
      if ((_ref = this.davis) != null) _ref.stop();
      return this;
    };

    return Router;

  })(ns.Event);
  $.LazyJaxDavisNs = ns;
  return $.LazyJaxDavis = ns.Router;
})(jQuery, this, this.document);
