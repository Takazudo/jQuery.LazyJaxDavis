/*! jQuery.LazyJaxDavis (https://github.com/Takazudo/jQuery.LazyJaxDavis)
 * lastupdate: 2013-07-13
 * version: 0.2.2
 * author: "Takazudo" Takeshi Takatsudo
 * License: MIT */
(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function($, window, document) {
    var $document, error, info, ns, wait;
    ns = {};
    $document = $(document);
    wait = ns.wait = function(time) {
      return $.Deferred(function(defer) {
        return setTimeout(function() {
          return defer.resolve();
        }, time);
      });
    };
    $.support.pushstate = $.isFunction(window.history.pushState);
    ns.isToId = function(path) {
      if ((path.charAt(0)) === '#') {
        return true;
      } else {
        return false;
      }
    };
    ns.trimAnchor = function(str) {
      return str.replace(/#.*/, '');
    };
    ns.trimGetVals = function(path) {
      return path.replace(/\?.*/, '');
    };
    ns.tryParseAnotherPageAnchor = function(path) {
      var res, ret;
      if (ns.isToId(path)) {
        return false;
      }
      if ((path.indexOf('#')) === -1) {
        return false;
      }
      res = path.match(/^([^#]+)#(.+)/);
      ret = {
        path: res[1]
      };
      if (res[2]) {
        ret.hash = "#" + res[2];
      }
      return ret;
    };
    ns.filterStr = function(str, expr, captureAll) {
      var res;
      if (captureAll) {
        res = [];
        str.replace(expr, function(matched, captured) {
          return res.push(captured);
        });
        return res;
      } else {
        res = str.match(expr);
        if (res && res[1]) {
          return $.trim(res[1]);
        } else {
          return null;
        }
      }
    };
    ns.logger = window.Davis ? (new Davis.logger).logger : null;
    ns.info = info = function(msg) {
      if (!ns.logger) {
        return;
      }
      return ns.logger.info(msg);
    };
    ns.error = error = function(msg) {
      if (!ns.logger) {
        return;
      }
      return ns.logger.error(msg);
    };
    ns.fetchPage = (function() {
      var current;
      current = null;
      return function(url, options) {
        var ret;
        ret = $.Deferred(function(defer) {
          var defaults;
          if ((current != null ? current.abort : void 0) != null) {
            current.abort();
          }
          defaults = {
            url: url
          };
          options = $.extend(defaults, options);
          current = $.ajax(options);
          return current.then(function(res) {
            current = null;
            return defer.resolve(res);
          }, function(xhr, msg) {
            var aborted;
            aborted = msg === 'abort';
            return defer.reject(aborted);
          });
        }).promise();
        ret.abort = function() {
          return current != null ? typeof current.abort === "function" ? current.abort() : void 0 : void 0;
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
        if (!list) {
          return;
        }
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          callback = list[_i];
          if (callback.apply(this, args) === false) {
            break;
          }
        }
        return this;
      };

      Event.prototype.unbind = function(ev, callback) {
        var cb, i, list, _i, _len, _ref;
        if (!ev) {
          this._callbacks = {};
          return this;
        }
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return this;
        }
        if (!callback) {
          delete this._callbacks[ev];
          return this;
        }
        for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
          cb = list[i];
          if (!(cb === callback)) {
            continue;
          }
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
        this._items.push(ns.trimAnchor(location.pathname));
      }

      HistoryLogger.prototype.push = function(obj) {
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

      HistoryLogger.prototype.isToSamePageRequst = function(path) {
        var last;
        path = ns.trimAnchor(path);
        last = ns.trimAnchor(this.last());
        if (!last) {
          return false;
        }
        if (path === last) {
          return true;
        } else {
          return false;
        }
      };

      HistoryLogger.prototype.size = function() {
        return this._items.length;
      };

      return HistoryLogger;

    })();
    ns.Page = (function(_super) {
      var eventNames;

      __extends(Page, _super);

      eventNames = ['fetchstart', 'fetchsuccess', 'fetchabort', 'fetchfail', 'pageready', 'anchorhandler'];

      Page.prototype.options = {
        ajxoptions: {
          dataType: 'text',
          cache: true
        },
        expr: null,
        updatetitle: true,
        title: null
      };

      Page.prototype.router = null;

      Page.prototype.config = null;

      Page.prototype._text = null;

      function Page(request, config, routed, router, options, hash) {
        var anchorhandler, _ref, _ref1,
          _this = this;
        this.request = request;
        this.routed = routed;
        this.router = router;
        this.hash = hash;
        Page.__super__.constructor.apply(this, arguments);
        this.config = $.extend({}, this.config, config);
        this.options = $.extend(true, {}, this.options, options);
        if (($.type(this.config.path)) === 'string') {
          this.path = this.config.path;
        } else {
          this.path = this.request.path;
        }
        $.each(eventNames, function(i, eventName) {
          return $.each(_this.config, function(key, val) {
            if (eventName !== key) {
              return true;
            }
            return _this.bind(eventName, val);
          });
        });
        anchorhandler = ((_ref = this.config) != null ? _ref.anchorhandler : void 0) || ((_ref1 = this.options) != null ? _ref1.anchorhandler : void 0);
        if (anchorhandler) {
          this._anchorhandler = anchorhandler;
        }
        this.bind('pageready', function() {
          if (!_this.hash) {
            return;
          }
          return _this._anchorhandler.call(_this, _this.hash);
        });
      }

      Page.prototype._anchorhandler = function(hash) {
        var top;
        if (!hash) {
          return this;
        }
        top = ($document.find(hash)).offset().top;
        window.scrollTo(0, top);
        return this;
      };

      Page.prototype.fetch = function() {
        var currentFetch, o, path, _ref, _ref1, _ref2,
          _this = this;
        currentFetch = null;
        path = this.request.path;
        o = ((_ref = this.options) != null ? _ref.ajaxoptions : void 0) || {};
        if ((_ref1 = this.config) != null ? _ref1.method : void 0) {
          o.type = this.config.method;
        }
        if ((_ref2 = this.request) != null ? _ref2.params : void 0) {
          o.data = $.extend(true, {}, o.data, this.request.params);
        }
        this._fetchDefer = $.Deferred(function(defer) {
          currentFetch = ns.fetchPage(path, o);
          return currentFetch.then(function(text) {
            _this._text = text;
            _this.updatetitle();
            return defer.resolve();
          }, function(aborted) {
            return defer.reject({
              aborted: aborted
            });
          }).always(function() {
            return _this._fetchDefer = null;
          });
        });
        this._fetchDefer.abort = function() {
          return currentFetch.abort();
        };
        return this._fetchDefer;
      };

      Page.prototype.abort = function() {
        var _ref;
        if ((_ref = this._fetchDefer) != null) {
          _ref.abort();
        }
        return this;
      };

      Page.prototype.rip = function(exprKey, captureAll) {
        var expr, res, _ref, _ref1;
        if (!this._text) {
          return null;
        }
        if (!exprKey) {
          return this._text;
        }
        expr = (_ref = this.options) != null ? (_ref1 = _ref.expr) != null ? _ref1[exprKey] : void 0 : void 0;
        if (!expr) {
          return null;
        }
        res = ns.filterStr(this._text, expr, captureAll);
        if (!res) {
          error("ripper could not find the text for key: " + exprKey);
        }
        return res;
      };

      Page.prototype.ripAll = function(exprKey) {
        return this.rip(exprKey, true);
      };

      Page.prototype.updatetitle = function() {
        var title;
        if (!this.options.updatetitle) {
          return this;
        }
        title = null;
        if (!title && this._text) {
          title = this.rip('title');
        }
        if (!title) {
          return this;
        }
        document.title = title;
        return this;
      };

      return Page;

    })(ns.Event);
    ns.Router = (function(_super) {

      __extends(Router, _super);

      Router.prototype.options = {
        ajaxoptions: {
          dataType: 'text',
          cache: true,
          type: 'GET'
        },
        expr: {
          title: /<title[^>]*>([^<]*)<\/title>/,
          content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
        },
        davis: {
          linkSelector: 'a:not([href^=#]):not(.apply-nolazy)',
          formSelector: 'form:not(.apply-nolazy)',
          throwErrors: false,
          handleRouteNotFound: true
        },
        minwaittime: 0,
        updatetitle: true,
        firereadyonstart: true,
        ignoregetvals: false
      };

      function Router(initializer) {
        Router.__super__.constructor.apply(this, arguments);
        this.history = new ns.HistoryLogger;
        initializer.call(this, this);
        if (this.options.davis) {
          this._setupDavis();
        }
        this.firePageready(!this.options.firereadyonstart);
        this.fireTransPageready();
      }

      Router.prototype._createPage = function(request, config, routed, hash) {
        var o, res;
        o = {
          expr: this.options.expr,
          updatetitle: this.options.updatetitle
        };
        if (this.options.anchorhandler) {
          o.anchorhandler = this.options.anchorhandler;
        }
        if (config != null ? config.ajaxoptions : void 0) {
          o.ajaxoptions = config.ajaxoptions;
        } else if (this.options.ajaxoptions) {
          o.ajaxoptions = this.options.ajaxoptions;
        }
        if (!hash && (request != null ? request.path : void 0)) {
          res = ns.tryParseAnotherPageAnchor(request.path);
          hash = res.hash || null;
        }
        return new ns.Page(request, config, routed, this, o, hash);
      };

      Router.prototype._setupDavis = function() {
        var completePage, self, _ref;
        if (!$.support.pushstate) {
          return;
        }
        self = this;
        completePage = function(page) {
          page.bind('pageready', function() {
            self._findWhosePathMatches('page', page.path);
            self.trigger('everypageready');
            return self.fireTransPageready();
          });
          self.history.push(page.path);
          return self.fetch(page);
        };
        this.davis = new Davis(function() {
          var davis,
            _this = this;
          davis = this;
          if (self.pages) {
            $.each(self.pages, function(i, pageConfig) {
              var method;
              if ($.type(pageConfig.path) === 'regexp') {
                return;
              }
              method = (pageConfig.method || 'get').toLowerCase();
              davis[method](pageConfig.path, function(request) {
                var page;
                if (self.history.isToSamePageRequst(request.path)) {
                  return;
                }
                page = self._createPage(request, pageConfig, true);
                return completePage(page);
              });
              return true;
            });
          }
          if (self.options.davis.handleRouteNotFound) {
            davis.bind('routeNotFound', function(request) {
              var config, hash, page, path, res, routed;
              if (ns.isToId(request.path)) {
                self.trigger('toid', request.path);
                return;
              }
              res = ns.tryParseAnotherPageAnchor(request.path);
              hash = res.hash || null;
              path = res.path || request.path;
              if (self.history.isToSamePageRequst(path)) {
                return;
              }
              config = (self._findWhosePathMatches('page', path)) || null;
              routed = config ? true : false;
              page = self._createPage(request, config, routed, hash);
              return completePage(page);
            });
          }
          return davis.configure(function(config) {
            return $.each(self.options.davis, function(key, val) {
              config[key] = val;
              return true;
            });
          });
        });
        if ((_ref = self.davisInitializer) != null) {
          _ref.call(davis);
        }
        this._tweakDavis();
        return this;
      };

      Router.prototype._tweakDavis = function() {
        var warn,
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

      Router.prototype._findWhosePathMatches = function(target, requestedPath, handleMulti) {
        var configs, matched, trimedPath,
          _this = this;
        if (target === 'page') {
          if (this.pages && this.pages.length) {
            configs = this.pages;
          } else {
            return null;
          }
        } else if (target === 'transRoutes') {
          if (this.transRoutes && this.transRoutes.length) {
            configs = this.transRoutes;
            handleMulti = true;
          } else {
            return null;
          }
        }
        matched = [];
        trimedPath = ns.trimGetVals(requestedPath);
        $.each(configs, function(i, config) {
          var path;
          if (_this.options.ignoregetvals || config.ignoregetvals) {
            path = trimedPath;
          } else {
            path = requestedPath;
          }
          if ($.type(config.path) === 'regexp') {
            if (config.path.test(path)) {
              matched.push(config);
              if (handleMulti) {
                return true;
              }
            } else {
              return true;
            }
          }
          if (config.path === path) {
            matched.push(config);
            if (handleMulti) {
              return true;
            }
          }
          return true;
        });
        if (!handleMulti && (matched.length > 1)) {
          error("2 or more expr was matched about: " + requestedPath);
          $.each(matched, function(i, config) {
            return error("dumps detected page configs - path:" + config.path);
          });
          return false;
        }
        if (handleMulti) {
          return matched;
        } else {
          return matched[0] || null;
        }
      };

      Router.prototype.fetch = function(page) {
        var _this = this;
        return $.Deferred(function(defer) {
          page.trigger('fetchstart', page);
          _this.trigger('everyfetchstart', page);
          return ($.when(page.fetch(), wait(_this.options.minwaittime))).then(function() {
            page.trigger('fetchsuccess', page);
            _this.trigger('everyfetchsuccess', page);
            return defer.resolve();
          }, function(error) {
            if (error.aborted) {
              page.trigger('fetchabort', page);
              return _this.trigger('everyfetchabort', page);
            } else {
              page.trigger('fetchfil', page);
              return _this.trigger('everyfetchfail', page);
            }
          });
        }).promise();
      };

      Router.prototype.stop = function() {
        var _ref;
        if ((_ref = this.davis) != null) {
          _ref.stop();
        }
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

      Router.prototype.firePageready = function(skipEvery) {
        var page, _ref;
        if ((_ref = this.pages) != null ? _ref.length : void 0) {
          page = this._findWhosePathMatches('page', location.pathname);
          if (page) {
            if (typeof page.pageready === "function") {
              page.pageready();
            }
          }
        }
        if (skipEvery) {
          return this;
        }
        this.trigger('everypageready');
        return this;
      };

      Router.prototype.fireTransPageready = function() {
        var routings, _ref;
        if ((_ref = this.transRoutes) != null ? _ref.length : void 0) {
          routings = this._findWhosePathMatches('transRoutes', location.pathname);
          if (!routings.length) {
            return this;
          }
          $.each(routings, function(i, routing) {
            return typeof routing.pageready === "function" ? routing.pageready() : void 0;
          });
        }
        return this;
      };

      Router.prototype.route = function(pages) {
        this.pages = pages;
        return this;
      };

      Router.prototype.routeTransparents = function(transRoutes) {
        this.transRoutes = transRoutes;
        return this;
      };

      Router.prototype.routeDavis = function(initializer) {
        this.davisInitializer = initializer;
        return this;
      };

      Router.prototype.option = function(options) {
        if (!options) {
          return this.options;
        }
        return this.options = $.extend(true, {}, this.options, options);
      };

      return Router;

    })(ns.Event);
    $.LazyJaxDavisNs = ns;
    return $.LazyJaxDavis = ns.Router;
  })(jQuery, this, this.document);

}).call(this);
