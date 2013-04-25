$(function(){

  // logger

  var Logger = (function() {
    function Logger() {
      this.$el = $('<div id="logger"></div>');
      $('body').append(this.$el);
    }
    Logger.prototype.items = [];
    Logger.prototype.log = function(msg, cls) {
      var $item,
        _this = this;
      $item = $("<div>" + msg + "</div>");
      if(cls){
        $item.addClass(cls);
      }
      this.$el.prepend($item);
      this.items.push($item);
      setTimeout(function() {
        return $item.remove();
      }, 4000);
      if (this.items.length > 30) this.items[0].remove();
      return this;
    };
    Logger.prototype.loglight = function(msg) {
      this.log(msg, 'light');
    };
    return Logger;
  })();

  var logger = new Logger;
  var log = function(msg) { logger.log(msg); };
  var loglight = function(msg) { logger.loglight(msg); };

  new $.LazyJaxDavis(function(router){

    var $root = $('#lazyjaxdavisroot');

    router.bind('everyfetchstart', function(page){
      $root.css('opacity', 0.6);
      window.scrollTo(0, 0);
      log('everyfetchstart');
    });

    router.bind('everyfetchsuccess', function(page){
      log('everyfetchsuccess');
      $root.css('opacity', 1);
      $newcontent = $(page.rip('content')).hide();
      $root.empty().append($newcontent);
      $newcontent.fadeIn();
      page.trigger('pageready');
    });

    router.bind('everypageready', function(){
      log('everypageready');
    });

    router.bind('everyfetchfail', function(){
      log('everyfetchfail');
      $root.css('opacity', 1);
    });

    router.route([
      {
        path: '/jQuery.LazyJaxDavis/demos/pagespecificevents/',
        fetchstart: function(){
          loglight('fetchstart: /jQuery.LazyJaxDavis/demos/pagespecificevents/');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /jQuery.LazyJaxDavis/demos/pagespecificevents/');
        },
        pageready: function(){
          loglight('pageready: /jQuery.LazyJaxDavis/demos/pagespecificevents/');
        }
      },
      {
        path: '/jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo1.html',
        fetchstart: function(){
          loglight('fetchstart: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo1.html');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo1.html');
        },
        pageready: function(){
          loglight('pageready: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo1.html');
        }
      },
      {
        path: '/jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo2.html',
        fetchstart: function(){
          loglight('fetchstart: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo2.html');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo2.html');
        },
        pageready: function(){
          loglight('pageready: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo2.html');
        }
      },
      {
        path: '/jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo3.html',
        fetchstart: function(){
          loglight('fetchstart: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo3.html');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo3.html');
        },
        pageready: function(){
          loglight('pageready: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/foo3.html');
        }
      },
      // this routing makes error because this conflicts with the path regexp pattern of the item below
      //{
      //  path: '/jQuery.LazyJaxDavis/demos/pagespecificevents/pages/bar1.html',
      //  fetchstart: function(){
      //    loglight('fetchstart: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/bar1.html');
      //  },
      //  fetchsuccess: function(){
      //    loglight('fetchsuccess: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/bar1.html');
      //  },
      //  pageready: function(){
      //    loglight('pageready: /jQuery.LazyJaxDavis/demos/pagespecificevents/pages/bar1.html');
      //  }
      //},
      {
        path: /bar[0-9]+\.html/,
        fetchstart: function(){
          loglight('fetchstart: /bar[0-9]+\.html/');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /bar[0-9]+\.html/');
        },
        pageready: function(){
          loglight('pageready: /bar[0-9]+\.html/');
        }
      }
    ]);

  });

});


