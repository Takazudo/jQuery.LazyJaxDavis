/*! jQuery.LazyJaxDavis - v0.0.0 -  4/1/2012
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

    function Page(request, config, routed, router, _expr) {
      var _this = this;
      this.request = request;
      this.config = config;
      this.routed = routed;
      this.router = router;
      this._expr = _expr;
      Page.__super__.constructor.apply(this, arguments);
      $.each(eventNames, function(i, eventName) {
        return $.each(_this.config, function(key, val) {
          if (eventName !== key) return true;
          return _this.bind(eventName, val);
        });
      });
      this._handleAnotherPageAnchor();
    }

    Page.prototype._handleAnotherPageAnchor = function() {
      var res,
        _this = this;
      res = ns.tryParseAnotherPageAnchor(this.request.path);
      if (!(res != null ? res.hash : void 0)) {
        this.path = this.request.path;
        return this;
      }
      this._hash = res.hash;
      this.path = res.path;
      this.bind('fetchend', function() {
        return location.href = _this._hash;
      });
      return this;
    };

    Page.prototype.fetch = function() {
      var _this = this;
      return $.Deferred(function(defer) {
        _this.trigger('fetchstart', _this);
        return (ns.fetchPage(_this.request.path)).then(function(text) {
          _this._text = text;
          _this.trigger('fetchend', _this);
          return defer.resolve();
        }, function(aborted) {
          if (!aborted) _this.trigger('fetchfail', _this);
          return defer.reject({
            aborted: aborted
          });
        });
      });
    };

    Page.prototype.rip = function(exprKey) {
      if (!this._text) return null;
      if (!exprKey) return this._text;
      return ns.filterStr(this._text, this._expr[exprKey]);
    };

    return Page;

  })(ns.Event);
  ns.Router = (function(_super) {
    var eventNames;

    __extends(Router, _super);

    eventNames = ['everyfetchstart', 'everyfetchend', 'everybeforerefresh', 'everyafterrefresh', 'everyfetchfail'];

    Router.prototype.options = {
      expr: {
        title: /<title[^>]*>([^<]*)<\/title>/,
        content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
      },
      davis: {
        linkSelector: 'a:not(.apply-nolazy)',
        formSelector: 'form:not(.apply-nolazy)',
        throwErrors: false,
        handleRouteNotFound: true
      },
      minwaittime: 0,
      updatetitle: true
    };

    function Router(pages, options, extraRoute) {
      if (!(this instanceof arguments.callee)) {
        return new ns.Router(pages, options, extraRoute);
      }
      if (!$.isArray(pages)) {
        extraRoute = options;
        options = pages;
        pages = null;
      }
      this.pages = pages;
      Router.__super__.constructor.apply(this, arguments);
      this.extraRoute = extraRoute || $.noop;
      this.options = $.extend(true, {}, this.options, options);
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

    Router.prototype._createPage = function(request, config, routed) {
      return new ns.Page(request, config, routed, this, this.options.expr);
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
        $.each(self.pages, function(i, pageConfig) {
          davis.get(pageConfig.path, function(request) {
            var page;
            if (self.logger.isToSamePageRequst(request)) return;
            page = self._createPage(request, pageConfig, true);
            self.logger.log(page);
            return self.fetch(page);
          });
          return true;
        });
        return self.extraRoute.call(davis);
      });
      if (this.options.davis.handleRouteNotFound) {
        this.davis.bind('routeNotFound', function(request) {
          var page;
          if (ns.isToId(request.path)) {
            self.trigger('toid', request.path);
            return;
          }
          if (self.logger.isToSamePageRequst(request)) return;
          page = self._createPage(request, {}, false);
          self.logger.log(page);
          return self.fetch(page);
        });
      }
      this.davis.configure(function(config) {
        return $.each(_this.options.davis, function(key, val) {
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
      this._tweakDavis();
      return this;
    };

    Router.prototype._tweakDavis = function() {
      var info, warn,
        _this = this;
      warn = this.davis.logger.warn;
      info = this.davis.logger.info;
      this.davis.logger.warn = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if ((args[0].indexOf('routeNotFound')) !== -1) {
          args[0] = args[0].replace(/routeNotFound/, 'unRouted');
          return info.apply(_this.davis.logger, args);
        } else {
          return warn.apply(_this.davis.logger, args);
        }
      };
      return this;
    };

    Router.prototype.fetch = function(page) {
      var _this = this;
      return $.Deferred(function(defer) {
        _this.trigger('everyfetchstart', page);
        return ($.when(page.fetch(), wait(_this.options.minwaittime))).then(function() {
          _this.trigger('everyfetchend', page);
          if (_this.options.updatetitle) document.title = page.rip('title');
          return defer.resolve();
        }, function() {
          return _this.trigger('everyfetchfail', page);
        });
      }).promise();
    };

    Router.prototype.stop = function() {
      var _ref;
      if ((_ref = this.davis) != null) _ref.stop();
      return this;
    };

    Router.prototype.navigate = function(path, method) {
      var request;
      if (this.davis) {
        request = new Davis.Request({
          method: method || 'get',
          fullPath: path,
          title: ''
        });
        Davis.location.assign(request);
      } else {
        location.href = path;
      }
      return this;
    };

    return Router;

  })(ns.Event);
  $.LazyJaxDavisNs = ns;
  return $.LazyJaxDavis = ns.Router;
})(jQuery, this, this.document);
