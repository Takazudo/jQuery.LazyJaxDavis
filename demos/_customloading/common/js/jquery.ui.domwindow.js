/*! jQuery.ui.domwindow - v0.1.3 -  3/29/2012
 * https://github.com/Takazudo/jQuery.ui.domwindow
 * Copyright (c) 2012 "Takazudo" Takeshi Takatsudo; Licensed MIT */

(function() {
  var __slice = Array.prototype.slice;

  (function($, win, doc) {
    var $doc, $win, DomwindowApi, domwindowApi, genOverlayOptions, genUniqId, getInfoFromOpener, ie6, ns, offsetX, offsetY, resolveSilently, round, viewportH, viewportW, wait, widgets;
    $win = $(win);
    $doc = $(doc);
    round = Math.round;
    win.domwindowNs = ns = {};
    win.domwindowApi = domwindowApi = null;
    widgets = ns.widgets = {
      $dialog: null,
      $overlay: null
    };
    ie6 = (function() {
      var $el;
      $el = $('<div><!--[if IE 6]><i></i><![endif]--></div>');
      if ($el.find('i').size()) {
        return true;
      } else {
        return false;
      }
    })();
    resolveSilently = function() {
      return $.Deferred(function(defer) {
        return defer.resolve();
      });
    };
    viewportH = ns.viewportH = function() {
      return win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight;
    };
    viewportW = ns.viewportW = function() {
      return win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
    };
    offsetY = ns.offsetY = function() {
      return win.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop;
    };
    offsetX = ns.offsetX = function() {
      return win.pageXOffset || doc.documentElement.scrollLeft || doc.body.scrollLeft;
    };
    wait = function(time) {
      return $.Deferred(function(defer) {
        return setTimeout(function() {
          return defer.resolve();
        }, time);
      });
    };
    $.widget('ui.hideoverlay', {
      options: {
        overlayfade: true,
        spinnersrc: null,
        maxopacity: 0.8,
        bgiframe: false,
        spinjs: false,
        spinjs_options: {
          color: '#fff',
          lines: 15,
          length: 22,
          radius: 40
        }
      },
      widgetEventPrefix: 'hideoverlay.',
      _active: false,
      _create: function() {
        this.$el = this.element;
        this.$spinner = $('.ui-hideoverlay-spinner', this.$el);
        if (this.options.spinjs) this.$spinner.css('background', 'none');
        this.$bg = $('.ui-hideoverlay-bg', this.$el);
        this._preloadSpinner();
        this._eventify();
        this._handleIE6();
        return this;
      },
      _attachSpinjs: function() {
        if (!this._showDefer) return this;
        if (!this._spinning) return this;
        return (new Spinner(this.options.spinjs_options)).spin(this.$spinner[0]);
      },
      _handleIE6: function() {
        if (!ie6) return this;
        this._resize();
        if (this.options.bgiframe && $.fn.bgiframe) this.$el.bgiframe();
        return this;
      },
      _resize: function() {
        var h, w;
        if (!ie6) return this;
        w = $win.width();
        h = $win.height();
        this.$el.css({
          width: w,
          height: h,
          top: $win.scrollTop(),
          left: $win.scrollLeft()
        });
        return this.$bg.css({
          width: w,
          height: h
        });
      },
      _eventify: function() {
        var _this = this;
        if (!ie6) return this;
        $win.bind('resize scroll', function() {
          return _this._resize();
        });
        return this;
      },
      _showOverlayEl: function(woSpinner) {
        var _this = this;
        return $.Deferred(function(defer) {
          var animTo, cssTo;
          _this.$spinner.hide();
          _this.$el.css('display', 'block');
          cssTo = {
            opacity: 0
          };
          animTo = {
            opacity: _this.options.maxopacity
          };
          if (_this.options.overlayfade) {
            return ($.when(_this.$bg.stop().css(cssTo).animate(animTo, 200))).done(function() {
              if (!woSpinner) {
                if (_this.options.spinjs) {
                  _this.$spinner.show();
                  _this._attachSpinjs();
                }
                _this.$spinner.hide().fadeIn();
              }
              return defer.resolve();
            });
          } else {
            _this.$bg.css(animTo);
            if (!woSpinner) {
              if (_this.options.spinjs) {
                _this.$spinner.show();
                _this._attachSpinjs();
              }
              _this.$spinner.show();
            }
            return defer.resolve();
          }
        }).promise();
      },
      _hideOverlayEl: function() {
        var _this = this;
        return $.Deferred(function(defer) {
          var animTo, done;
          animTo = {
            opacity: 0
          };
          done = function() {
            _this.$el.css('display', 'none');
            _this.$spinner.show();
            return defer.resolve();
          };
          if (_this.options.overlayfade) {
            return ($.when(_this.$bg.stop().animate(animTo, 100))).done(function() {
              return done();
            });
          } else {
            _this.$bg.css(animTo);
            return done();
          }
        }).promise();
      },
      _preloadSpinner: function() {
        var src;
        src = this.options.spinnersrc;
        if (!src) return this;
        (new Image).src = src;
        return this;
      },
      show: function(woSpinner) {
        var _this = this;
        if (this._showDefer) return this._showDefer;
        if (this._active) return resolveSilently();
        this._active = true;
        if (woSpinner) {
          this.hideSpinner();
        } else {
          this._spinning = true;
          this.$spinner.show();
        }
        this._trigger('showstart');
        this._showDefer = this._showOverlayEl(woSpinner);
        this._showDefer.done(function() {
          _this._showDefer = null;
          return _this._trigger('showend');
        });
        return this._showDefer;
      },
      hide: function() {
        var _this = this;
        if (this._showDefer) {
          this._showDefer.done(function() {
            return _this.hide();
          });
          return this;
        }
        if (!this._active) return resolveSilently();
        this._active = false;
        this._trigger('hidestart');
        this._hideDefer = this._hideOverlayEl();
        this._hideDefer.done(function() {
          _this._hideDefer = null;
          return _this._trigger('hideend');
        });
        return this._hideDefer;
      },
      hideSpinner: function() {
        this._spinning = false;
        this.$spinner.stop().empty().hide();
        return this;
      }
    });
    $.ui.hideoverlay.create = function(options) {
      var src;
      src = "<div class=\"ui-hideoverlay\" id=\"domwindow-hideoverlay\">\n  <div class=\"ui-hideoverlay-bg\"></div>\n  <div class=\"ui-hideoverlay-spinner\"></div>\n</div>";
      return $(src).hideoverlay(options);
    };
    $.ui.hideoverlay.destroy = function(options) {
      if (!widgets.$overlay) return false;
      widgets.$overlay.hideoverlay('destroy').remove();
      widgets.$overlay = null;
      return true;
    };
    $.ui.hideoverlay.setup = function(options) {
      var $overlay;
      $.ui.hideoverlay.destroy();
      $overlay = $.ui.hideoverlay.create(options).appendTo('body');
      widgets.$overlay = $overlay;
      return $overlay;
    };
    $.widget('ui.domwindowdialog', {
      options: {
        spinjs: false,
        height: 500,
        width: 500,
        fixedMinY: 30,
        selector_open: '.apply-domwindow-open',
        selector_close: '.apply-domwindow-close',
        ajaxdialog: true,
        ajaxdialog_avoidcache: true,
        ajaxdialog_mindelay: 300,
        iframedialog: false,
        iddialog: false,
        overlay: true,
        overlayclickclose: true
      },
      widgetEventPrefix: 'domwindowdialog.',
      _create: function() {
        this.$el = this.element;
        this.$el.css({
          width: this.options.width,
          height: this.options.height
        });
        this._eventify();
        return this;
      },
      _eventify: function() {
        var self,
          _this = this;
        self = this;
        $doc.on('click', this.options.selector_open, function(e) {
          var info;
          e.preventDefault();
          info = getInfoFromOpener(this);
          return self.open.apply(self, info);
        });
        $doc.on('click', this.options.selector_close, function(e) {
          e.preventDefault();
          return _this.close();
        });
        $win.on('resize', function() {
          return _this.center();
        });
        return this;
      },
      setOverlay: function($overlay) {
        var _this = this;
        if (!this.options.overlay) return this;
        this.$overlay = $overlay;
        this.overlay = $overlay.data('hideoverlay');
        if (this.options.overlayclickclose) {
          this.$overlay.bind('click', function() {
            return _this.close();
          });
        }
        return this;
      },
      center: function() {
        var elH, elW, isBottomOver, isLeftOver, offX, offY, props, vpH, vpW;
        props = {};
        elH = this.$el.outerHeight();
        elW = this.$el.outerWidth();
        vpW = viewportW();
        vpH = viewportH();
        offY = offsetY();
        offX = offsetX();
        isLeftOver = vpW < elW;
        isBottomOver = vpH < elH + 50;
        if (isLeftOver) {
          props.left = 0;
          if (isBottomOver) {
            props.position = 'absolute';
            props.top = this.options.fixedMinY + offY;
          } else {
            props.position = 'absolute';
            props.top = round(vpH / 2) - round(elH / 2) + offY;
          }
        } else {
          if (isBottomOver) {
            props.position = 'absolute';
            props.top = this.options.fixedMinY + offY;
            props.left = round(vpW / 2) - round(elW / 2) + offX;
          } else {
            props.top = round(vpH / 2) - round(elH / 2);
            props.left = round(vpW / 2) - round(elW / 2);
            if (ie6) {
              props.position = 'absolute';
              props.top += offY;
              props.left += offX;
            } else {
              props.position = 'fixed';
            }
          }
        }
        this.$el.css(props);
        return this;
      },
      open: function(src, options) {
        var $target, complete, currentOpen, defer, delay, dialogType, h, o, w, _ref, _ref2, _ref3, _ref4,
          _this = this;
        o = options;
        this._isOpen = true;
        this._currentOpen = currentOpen = {};
        currentOpen.defer = $.Deferred();
        complete = function() {
          if (currentOpen.killed) return;
          _this.$el.fadeIn(200, function() {
            var _ref;
            if ((_ref = _this.overlay) != null) _ref.hideSpinner();
            _this._trigger('afteropen', {}, {
              dialog: _this.$el
            });
            return _this._currentOpen = null;
          });
          wait(0).done(function() {
            return _this.center();
          });
          return currentOpen.defer.resolve();
        };
        dialogType = null;
        if ($.isFunction(src)) {
          dialogType = 'deferred';
        } else {
          if (src.indexOf('#') === 0) {
            dialogType = 'id';
            src = src.replace(/^#/, '');
          } else {
            if (this.options.ajaxdialog) dialogType = 'ajax';
            if (this.options.iframedialog) dialogType = 'iframe';
            if (this.options.iddialog) dialogType = 'id';
            if (o != null ? o.ajaxdialog : void 0) dialogType = 'ajax';
            if (o != null ? o.iframedialog : void 0) dialogType = 'iframe';
            if (o != null ? o.iddialog : void 0) dialogType = 'id';
          }
        }
        if (dialogType === 'id') {
          $target = $('#' + src);
          this.$lastIdTarget = $target;
          if ($target.is(':ui-domwindow')) {
            o = $.extend({}, $target.domwindow('createApiOpenOptions'), o);
          }
        } else {
          this.$lastIdTarget = null;
        }
        this._attachOneTimeEvents(o, 'open', currentOpen);
        w = (o != null ? o.width : void 0) || this.options.width;
        h = (o != null ? o.height : void 0) || this.options.height;
        this.$el.css({
          width: w,
          height: h
        });
        this._trigger('beforeopen', {}, {
          dialog: this.$el
        });
        delay = this.options.ajaxdialog_mindelay;
        switch (dialogType) {
          case 'deferred':
            if ((_ref = this.overlay) != null) _ref.show();
            defer = $.Deferred();
            src.apply(this, [defer]);
            $.when(defer, wait(delay)).done(function(data) {
              _this.$el.empty().append(data);
              return complete();
            });
            break;
          case 'ajax':
            if ((_ref2 = this.overlay) != null) _ref2.show();
            $.when(this._ajaxGet(src), wait(delay)).done(function() {
              var args, data;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              data = args[0][0];
              _this.$el.empty().append(data);
              return complete();
            });
            break;
          case 'iframe':
            if ((_ref3 = this.overlay) != null) _ref3.show(true);
            this.$el.empty().append(this._createIframeSrc(src));
            complete();
            break;
          case 'id':
            if ((_ref4 = this.overlay) != null) _ref4.show(true);
            this.$el.empty().append($target.html());
            complete();
        }
        currentOpen.kill = function() {
          return currentOpen.killed = true;
        };
        return currentOpen;
      },
      close: function(options) {
        var _this = this;
        return $.Deferred(function(defer) {
          var _ref;
          if (!_this._isOpen) return _this;
          if (_this.$lastIdTarget) {
            options = $.extend({}, options, _this.$lastIdTarget.domwindow('createApiCloseOptions'));
          }
          _this._attachOneTimeEvents(options, 'close');
          if ((_ref = _this._currentOpen) != null) _ref.kill();
          _this._isOpen = false;
          _this._trigger('beforeclose', {}, {
            dialog: _this.$el
          });
          return wait(0).done(function() {
            var _ref2;
            if ((_ref2 = _this.overlay) != null) _ref2.hide();
            return _this.$el.fadeOut(200, function() {
              defer.resolve();
              return _this._trigger('afterclose', {}, {
                dialog: _this.$el
              });
            });
          });
        });
      },
      _attachOneTimeEvents: function(localOptions, command, currentOpen) {
        var events,
          _this = this;
        if (!localOptions) return this;
        events = ['beforeclose', 'afterclose'];
        if (command === 'open') $.merge(events, ['beforeopen', 'afteropen']);
        $.each(events, function(i, ev) {
          if (localOptions[ev]) {
            return _this.$el.one("" + _this.widgetEventPrefix + ev, function() {
              var args;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              if (currentOpen != null ? currentOpen.killed : void 0) return;
              return localOptions[ev].apply(this.$el, args);
            });
          }
        });
        return this;
      },
      _ajaxGet: function(url) {
        var options;
        options = {
          url: url,
          dataType: 'text'
        };
        if (this.options.ajaxdialog_avoidcache) options.cache = false;
        return $.ajax(options);
      },
      _createIframeSrc: function(url) {
        var name;
        name = genUniqId();
        return "<iframe\n  frameborder=\"0\" hspace=\"0\" wspace=\"0\" src=\"" + url + "\" name=\"" + name + "\"\n  style=\"width:100%; height:100%; border:none; background-color:#fff\"\n></iframe>";
      }
    });
    $.ui.domwindowdialog.create = function(options) {
      var src;
      src = "<div class=\"ui-domwindowdialog\"></div>";
      return $(src).domwindowdialog(options);
    };
    $.ui.domwindowdialog.destroy = function() {
      if (!widgets.$dialog) return false;
      widgets.$dialog.domwindowdialog('destroy').remove();
      widgets.$dialog = null;
      return true;
    };
    $.ui.domwindowdialog.setup = function(options) {
      var $dialog, overlayOptions;
      $.ui.domwindowdialog.destroy();
      $dialog = $.ui.domwindowdialog.create(options);
      $dialog.appendTo('body');
      overlayOptions = genOverlayOptions(options);
      $dialog.domwindowdialog('setOverlay', $.ui.hideoverlay.setup(overlayOptions));
      domwindowApi = win.domwindowApi = new DomwindowApi($dialog);
      widgets.$dialog = $dialog;
      return $dialog;
    };
    genOverlayOptions = function(options) {
      var ret;
      ret = {};
      if (!options) return ret;
      $.each($.ui.hideoverlay.prototype.options, function(key) {
        if (options[key] !== void 0) return ret[key] = options[key];
      });
      return ret;
    };
    getInfoFromOpener = ns.getInfoFromOpener = function(el) {
      var $el, o, ret, src;
      $el = $(el);
      ret = [];
      src = $el.data('domwindowUrl') || $el.data('domwindowId');
      if (!src) src = $el.attr('href').replace(/^#/, '');
      ret.push(src);
      o = {};
      if ($el.data('domwindowAjaxdialog')) o.ajaxdialog = true;
      if ($el.data('domwindowIframedialog')) o.iframedialog = true;
      if ($el.data('domwindowIddialog')) o.iddialog = true;
      (function() {
        var h;
        h = $el.data('domwindowHeight');
        if (h) return o.height = h;
      })();
      (function() {
        var w;
        w = $el.data('domwindowWidth');
        if (w) return o.width = w;
      })();
      ret.push(o);
      return ret;
    };
    genUniqId = function() {
      return "domwindow-uniqid-" + (Math.round(Math.random() * 1000));
    };
    DomwindowApi = (function() {

      function DomwindowApi($dialog) {
        this.$dialog = $dialog;
        this.dialog = this.$dialog.data('domwindowdialog');
      }

      DomwindowApi.prototype.open = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.dialog.open.apply(this.dialog, args);
      };

      DomwindowApi.prototype.close = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.dialog.close.apply(this.dialog, args);
      };

      return DomwindowApi;

    })();
    return $.widget('ui.domwindow', {
      options: {
        iddialog: true
      },
      widgetEventPrefix: 'domwindow.',
      _create: function() {
        var _this = this;
        this.$el = this.element;
        this._id = this.$el.attr('id') || (function() {
          var id;
          id = genUniqId();
          _this.$el.attr('id', id);
          return id;
        })();
        return this;
      },
      createApiOpenOptions: function() {
        var o, self;
        self = this;
        o = $.extend({}, this.options);
        delete o.beforeopen;
        delete o.afteropen;
        delete o.beforeclose;
        delete o.afterclose;
        return $.extend(o, {
          beforeopen: function(e, data) {
            return self._trigger('beforeopen', e, data);
          },
          afteropen: function(e, data) {
            return self._trigger('afteropen', e, data);
          }
        });
      },
      createApiCloseOptions: function() {
        var o, self;
        self = this;
        o = {};
        delete o.beforeopen;
        delete o.afteropen;
        delete o.beforeclose;
        delete o.afterclose;
        return $.extend(o, {
          beforeclose: function(e, data) {
            return self._trigger('beforeclose', e, data);
          },
          afterclose: function(e, data) {
            return self._trigger('afterclose', e, data);
          }
        });
      },
      open: function() {
        return domwindowApi.open(this._id, this.createApiOpenOptions());
      },
      close: function() {
        return domwindowApi.close();
      }
    });
  })(jQuery, this, this.document);

}).call(this);
