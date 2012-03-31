---
layout: default
title: Top page
---

## {{ page.title }} content

This page is the test of jQuery.LazyJaxDavis.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque quis dui diam, at hendrerit nulla. Etiam sodales, erat ut tempor venenatis, nisi nunc bibendum felis, eget fermentum lorem magna et ipsum. Etiam ac neque odio. Aenean et mi nec leo tincidunt consequat et semper turpis. Cras auctor orci sed lorem venenatis et lobortis tellus tristique. Ut id porta turpis. Nullam velit nunc, porta vitae interdum nec, elementum ut leo. Vestibulum eget lacus ut magna venenatis lacinia. Integer rutrum ligula et sapien ultricies et lobortis nisl pretium. Ut ac lacus eget justo condimentum scelerisque eu in eros. Nunc sit amet justo vel turpis volutpat ullamcorper quis ac lectus. Sed interdum pretium risus hendrerit pretium. Nunc aliquet vestibulum ipsum et condimentum. Maecenas id enim a tellus facilisis gravida. Nam porttitor felis vitae libero iaculis ut mattis lacus eleifend. Duis id purus et mauris dignissim vestibulum et at est.

### {{ page.title }} heading

Curabitur lobortis, lectus quis pulvinar suscipit, lacus tellus sollicitudin nisl, vel adipiscing metus erat in sem. Phasellus viverra, turpis eget euismod dapibus, diam lacus mollis mauris, malesuada luctus elit orci vitae lectus. Donec fermentum ultricies volutpat. Aliquam in gravida ante. Fusce sed turpis justo, placerat interdum ante. Duis tempor vulputate aliquam. Aliquam eget libero nec mi mollis imperdiet eu porta lorem. Ut mollis, ligula vel pharetra pharetra, odio mauris accumsan mi, id tempor lectus lacus et nunc. Vestibulum sapien nibh, laoreet in tempus rutrum, dictum a ipsum. Maecenas sed mauris nibh, in porttitor magna. Mauris sapien purus, facilisis consequat venenatis id, volutpat non ligula.

Nam pretium porta posuere. Morbi volutpat aliquam dictum. Suspendisse tincidunt tellus vitae eros venenatis aliquam. Sed condimentum justo quis magna fringilla in placerat sapien interdum. Vestibulum nisi orci, dictum sed aliquam venenatis, faucibus vel elit. Sed magna nisl, suscipit ut dapibus ullamcorper, aliquet sit amet ligula. Donec ultricies leo sed ligula sagittis rutrum. Donec mattis facilisis dui, in elementum felis porta quis. Suspendisse condimentum, lectus vel auctor consectetur, tortor lorem dignissim erat, eu vulputate orci nisi porttitor justo. In eleifend magna ac purus malesuada vel interdum diam accumsan. Nulla quis dui nisl. Proin nisl est, scelerisque vitae dapibus ac, congue sed massa. Phasellus diam libero, malesuada ut facilisis ultricies, egestas id magna.

Vivamus nec quam lorem, tincidunt gravida nunc. Donec ante dolor, consequat non fringilla nec, pulvinar cursus metus. Sed sit amet turpis velit. Pellentesque sed est lectus, nec mollis dolor. Suspendisse lectus lacus, adipiscing id pretium eget, porttitor vitae ante. Vestibulum pellentesque ligula diam. Praesent ipsum lectus, consequat vitae facilisis in, interdum at nibh. Vivamus libero purus, pharetra eu fermentum sit amet, dignissim quis urna. Suspendisse ut nisi tortor, quis bibendum ipsum. Etiam elit tellus, accumsan et feugiat non, rhoncus in velit. Donec arcu turpis, laoreet vitae fermentum vitae, placerat sit amet augue. Sed hendrerit sagittis mattis. Phasellus nec diam eros, sed bibendum nulla.

### {{ page.title }} heading

Curabitur lobortis, lectus quis pulvinar suscipit, lacus tellus sollicitudin nisl, vel adipiscing metus erat in sem. Phasellus viverra, turpis eget euismod dapibus, diam lacus mollis mauris, malesuada luctus elit orci vitae lectus. Donec fermentum ultricies volutpat. Aliquam in gravida ante. Fusce sed turpis justo, placerat interdum ante. Duis tempor vulputate aliquam. Aliquam eget libero nec mi mollis imperdiet eu porta lorem. Ut mollis, ligula vel pharetra pharetra, odio mauris accumsan mi, id tempor lectus lacus et nunc. Vestibulum sapien nibh, laoreet in tempus rutrum, dictum a ipsum. Maecenas sed mauris nibh, in porttitor magna. Mauris sapien purus, facilisis consequat venenatis id, volutpat non ligula.

Nam pretium porta posuere. Morbi volutpat aliquam dictum. Suspendisse tincidunt tellus vitae eros venenatis aliquam. Sed condimentum justo quis magna fringilla in placerat sapien interdum. Vestibulum nisi orci, dictum sed aliquam venenatis, faucibus vel elit. Sed magna nisl, suscipit ut dapibus ullamcorper, aliquet sit amet ligula. Donec ultricies leo sed ligula sagittis rutrum. Donec mattis facilisis dui, in elementum felis porta quis. Suspendisse condimentum, lectus vel auctor consectetur, tortor lorem dignissim erat, eu vulputate orci nisi porttitor justo. In eleifend magna ac purus malesuada vel interdum diam accumsan. Nulla quis dui nisl. Proin nisl est, scelerisque vitae dapibus ac, congue sed massa. Phasellus diam libero, malesuada ut facilisis ultricies, egestas id magna.

### {{ page.title }} code snipet test CoffeeScript

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque quis dui diam, at hendrerit nulla. Etiam sodales, erat ut tempor venenatis, nisi nunc bibendum felis, eget fermentum lorem magna et ipsum. Etiam ac neque odio. Aenean et mi nec leo tincidunt consequat et semper turpis. Cras auctor orci sed lorem venenatis et lobortis tellus tristique. Ut id porta turpis. Nullam velit nunc, porta vitae interdum nec, elementum ut leo. Vestibulum eget lacus ut magna venenatis lacinia. Integer rutrum ligula et sapien ultricies et lobortis nisl pretium. Ut ac lacus eget justo condimentum scelerisque eu in eros. Nunc sit amet justo vel turpis volutpat ullamcorper quis ac lectus. Sed interdum pretium risus hendrerit pretium. Nunc aliquet vestibulum ipsum et condimentum. Maecenas id enim a tellus facilisis gravida. Nam porttitor felis vitae libero iaculis ut mattis lacus eleifend. Duis id purus et mauris dignissim vestibulum et at est.

{% highlight coffeescript %}
class ns.BasicLoader extends ns.Event
  constructor: ->
    super
    @items = []

  add: (loaderItem) ->
    if ($.type loaderItem) is 'string'
      src = loaderItem
      loaderItem = new ns.LoaderItem src
    @items.push loaderItem
    loaderItem

  load: ->
    count = 0
    laodDeferreds = $.map @items, (item) =>
      item.bind 'complete', ($img) =>
        @trigger 'itemload', $img, count
        count++
      .load()
    $.Deferred (defer) =>
      ($.when.apply @, laodDeferreds).always (imgs...) =>
        $imgs = $(imgs)
        @trigger 'allload', $imgs
        defer.resolve $imgs

  kill: ->
    $.each @items, (i, item) ->
      item.unbind()
    @trigger 'kill'
    @unbind()
    @
{% endhighlight %}

### {{ page.title }} code snipet test JavaScript

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque quis dui diam, at hendrerit nulla. Etiam sodales, erat ut tempor venenatis, nisi nunc bibendum felis, eget fermentum lorem magna et ipsum. Etiam ac neque odio. Aenean et mi nec leo tincidunt consequat et semper turpis. Cras auctor orci sed lorem venenatis et lobortis tellus tristique. Ut id porta turpis. Nullam velit nunc, porta vitae interdum nec, elementum ut leo. Vestibulum eget lacus ut magna venenatis lacinia. Integer rutrum ligula et sapien ultricies et lobortis nisl pretium. Ut ac lacus eget justo condimentum scelerisque eu in eros. Nunc sit amet justo vel turpis volutpat ullamcorper quis ac lectus. Sed interdum pretium risus hendrerit pretium. Nunc aliquet vestibulum ipsum et condimentum. Maecenas id enim a tellus facilisis gravida. Nam porttitor felis vitae libero iaculis ut mattis lacus eleifend. Duis id purus et mauris dignissim vestibulum et at est.

{% highlight coffeescript %}
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
{% endhighlight %}
