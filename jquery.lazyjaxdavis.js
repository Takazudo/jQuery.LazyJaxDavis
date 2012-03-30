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
      path: res[0]
    };
    if (res[2]) ret.hash = "" + res[2];
    return ret;
  };
  ns.fetchPageContent = (function() {
    var current;
    current = null;
    return function(url) {
      return $.Deferred(function(defer) {
        if (current) current.abort();
        return current = $.ajax({
          url: url,
          dataType: 'text',
          cache: true
        }).then(function(res) {
          var content;
          current = null;
          content = ns.filterContent(res);
          return defer.resolve(content);
        }, function(jqXHR, msg) {
          return defer.reject("something wrong or aborted.", msg === 'abort');
        });
      }).promise();
    };
  })();
  ns.filterContent = function(pagestr) {
    var res, ret, started, title;
    started = false;
    res = [];
    ret = {};
    title = null;
    $.each(pagestr.split('\n'), function(i, line) {
      if (title === null) {
        if (/^<title>/.test(line)) ret.title = (line.match(/^<title>([^<]*)/))[1];
      }
      if (line === '<!-- LazyJaxDavis start -->') {
        started = true;
        return;
      }
      if (line === '<!-- LazyJaxDavis end -->') {
        ret.html = res.join('\n');
        return false;
      }
      if (started) return res.push(line);
    });
    return ret;
  };
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
      return this._items.push(obj);
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

    function Page(request, config, routed) {
      var _this = this;
      this.request = request;
      this.config = config;
      this.routed = routed;
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
        return (ns.fetchPageContent(_this.request.path)).then(function(content) {
          _this.trigger('fetchend', _this.router.$root, _this.router);
          return defer.resolve(content);
        }, function(msg, aborted) {
          if (!aborted) {
            _this.trigger('fetchfail', _this.router.$root, _this.router);
          }
          return defer.reject({
            msg: msg,
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

    function Router(pages, options) {
      this.pages = pages;
      this.options = options;
      Router.__super__.constructor.apply(this, arguments);
      this.logger = new ns.HistoryLogger;
      this.options = $.extend({
        linkSelector: 'a:not(.apply-nolazyjax)',
        formSelector: 'form:not(.apply-nolazyjax)',
        throwErrors: false,
        handleRouteNotFound: true
      }, this.options);
      this.$root = $(this.options.root);
      if (!this.$root.size()) return;
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
      self = this;
      if (!Modernizr.history) return;
      this.davis = new Davis(function() {
        var davis;
        davis = this;
        return $.each(self.pages, function(i, pageInfo) {
          davis.get(pageInfo.path, function(request) {
            var page;
            if (self.logger.isToSamePageRequst(request)) return;
            page = new ns.Page(request, pageInfo, true);
            page.router = self;
            self.logger.log(page);
            return self.updateContent(page);
          });
          return true;
        });
      });
      this.davis.bind('routeNotFound', function(request) {
        var page;
        if (ns.isToId(request.path)) {
          self.trigger('toid', request.path);
          return;
        }
        if (self.logger.isToSamePageRequst(request)) return;
        page = new ns.Page(request, {}, false);
        page.router = self;
        self.logger.log(page);
        return self.updateContent(page);
      });
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
        return page.fetch().then(function(content) {
          _this.trigger('everyfetchend', _this.$root, _this);
          page.trigger('beforerefresh', _this.$root, _this);
          _this.trigger('everybeforerefresh', _this.$root, _this);
          _this.$root.html(content.html);
          page.trigger('afterrefresh', _this.$root, _this);
          _this.trigger('everyafterrefresh', _this.$root, _this);
          return defer.resolve();
        }, function() {
          return _this.trigger('everyfetchfail', _this.$root, _this);
        });
      }).promise();
    };

    return Router;

  })(ns.Event);
  ns.configure = function(config, options) {
    return ns.router = new ns.Router(config, options);
  };
  return $.LazyJaxDavis = ns;
})(jQuery, this, this.document);
