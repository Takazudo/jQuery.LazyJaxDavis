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
    Logger.prototype.logblue = function(msg) {
      this.log(msg, 'blue');
    };
    return Logger;
  })();

  var logger = new Logger;
  var log = function(msg) { logger.log(msg); };
  var loglight = function(msg) { logger.loglight(msg); };
  var logblue = function(msg) { logger.logblue(msg); };

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
        path: '/jQuery.LazyJaxDavis/demos/transparents/',
        fetchstart: function(){
          loglight('fetchstart: /jQuery.LazyJaxDavis/demos/transparents/');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /jQuery.LazyJaxDavis/demos/transparents/');
        },
        pageready: function(){
          loglight('pageready: /jQuery.LazyJaxDavis/demos/transparents/');
        }
      },
      {
        path: /\/2010\//,
        fetchstart: function(){
          loglight('fetchstart: /\\/2010\\//');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /\\/2010\\//');
        },
        pageready: function(){
          loglight('pageready: /\\/2010\\//');
        }
      },
      {
        path: /\/2011\//,
        fetchstart: function(){
          loglight('fetchstart: /\\/2011\\//');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /\\/2011\\//');
        },
        pageready: function(){
          loglight('pageready: /\\/2011\\//');
        }
      },
      {
        path: /\/2012\//,
        fetchstart: function(){
          loglight('fetchstart: /\\/2012\\//');
        },
        fetchsuccess: function(){
          loglight('fetchsuccess: /\\/2012\\//');
        },
        pageready: function(){
          loglight('pageready: /\\/2012\\//');
        }
      }
    ]);

    router.routeTransparents([
      {
        path: /\/pages\//,
        pageready: function(){
          logblue('transparent routing - pageready: /\\/pages\\//');
        }
      }
    ]);

  });

});


