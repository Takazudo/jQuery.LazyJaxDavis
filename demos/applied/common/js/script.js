var __slice = Array.prototype.slice;

jQuery(function($) {
  var Loading, Logger, loading, log, logger;
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
  return $.LazyJaxDavis.configure([
    {
      path: '/jQuery.LazyJaxDavis/demos/applied/',
      fetchstart: function() {
        return log('index.html fetchstart');
      },
      fetchend: function() {
        return log('index.html fetchend');
      },
      afterrefresh: function() {
        return log('index.html afterrefresh');
      },
      fetchfail: function() {
        return log('index.html fetchfail');
      }
    }, {
      path: '/jQuery.LazyJaxDavis/demos/applied/1.html',
      fetchstart: function() {
        return log('1.html fetchstart');
      },
      fetchend: function() {
        return log('1.html fetchend');
      },
      afterrefresh: function() {
        return log('1.html afterrefresh');
      },
      fetchfail: function() {
        return log('1.html fetchfail');
      }
    }
  ], {
    root: $('#lazyjaxdavis-root'),
    everyfetchstart: function() {
      log('everyfetchstart');
      return loading.show();
    },
    everyfetchend: function() {
      log('everyfetchend');
      return loading.hide();
    },
    everybeforerefresh: function() {
      return log('everybeforerefresh');
    },
    everyafterrefresh: function($root) {
      log('everyafterrefresh');
      return $root.hide().fadeIn();
    },
    everyfetchfail: function() {
      return log('everyfetchfail');
    }
  });
});
