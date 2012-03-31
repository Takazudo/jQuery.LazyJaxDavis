var __slice = Array.prototype.slice;

jQuery(function($) {
  var $root, Loading, Logger, loading, log, logger;
  Logger = (function() {

    function Logger() {
      this.$el = $('<div id="logger"></div>');
      $('body').append(this.$el);
    }

    Logger.prototype.items = [];

    Logger.prototype.log = function(msg) {
      var $item,
        _this = this;
      $item = $("<div>" + msg + "</div>");
      this.$el.prepend($item);
      this.items.push($item);
      setTimeout(function() {
        return $item.remove();
      }, 4000);
      if (this.items.length > 30) this.items[0].remove();
      return this;
    };

    return Logger;

  })();
  logger = new Logger;
  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return logger.log.apply(logger, args);
  };
  Loading = (function() {

    function Loading() {
      this.$el = $('<div id="loading">Loading...</div>').hide();
      $('body').append(this.$el);
    }

    Loading.prototype.show = function() {
      this.$el.show();
      return this;
    };

    Loading.prototype.hide = function() {
      this.$el.hide();
      return this;
    };

    return Loading;

  })();
  loading = new Loading;
  $root = $('#lazyjaxdavis-root');
  return window.jaxdavis = $.LazyJaxDavis([
    {
      path: '/jQuery.LazyJaxDavis/demos/applied/',
      fetchstart: function() {
        return log('index.html fetchstart');
      },
      fetchend: function() {
        return log('index.html fetchend');
      }
    }, {
      path: '/jQuery.LazyJaxDavis/demos/applied/1.html',
      fetchstart: function() {
        return log('1.html fetchstart');
      },
      fetchend: function() {
        return log('1.html fetchend');
      }
    }
  ], {
    everyfetchstart: function() {
      log('everyfetchstart');
      return loading.show();
    },
    everyfetchend: function(page) {
      log('everyfetchend');
      loading.hide();
      return $root.html(page.rip('content'));
    },
    everyfetchfail: function() {
      return log('everyfetchfail');
    }
  }, function() {
    return this.get('/jQuery.LazyJaxDavis/demos/applied/2.html', function(req) {
      return console.log('davis routing applied');
    });
  });
});
