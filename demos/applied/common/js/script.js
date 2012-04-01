$(function(){

  var $root, Loading, Logger, loading, log, logger, Sidenav, sidenav;


  // tiny logger on top right

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
  log = function(msg) { logger.log(msg); };


  // tiny loading on top left

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
  

  // sidenav
  
  Sidenav = (function(){
    function Sidenav() {
      this.$el = $('#sidenav');
      this.currentify(location.pathname);
    }
    Sidenav.prototype.currentify = function(path) {
      $('li', this.$el).each(function(){
        var $li = $(this);
        var $a = $('a', $li);
        if($a.attr('href')===path){
          $li.addClass('current');
        }else{
          $li.removeClass('current');
        }
      });
    };
    return Sidenav;
  })();

  sidenav = new Sidenav;


  // define the root of the main content

  $root = $('#lazyjaxdavisroot');

  
  $.fn.whatthemaincontent = function(){
    return this.each(function(){
      var $btn = $(this);
      var hilighted = false;
      $btn.click(function(){
        if(hilighted){
          hilighted = false;
          $root.css('background', 'none');
          $btn.html('Let me know what you mean');
        }else{
          hilighted = true;
          $root.css('background', '#faa');
          $btn.html('OK, bring me back');
        }
      });
    });
  };

  $.fn.whattheloading = function(){
    return this.each(function(){
      var $btn = $(this);
      var visible = false;
      $btn.click(function(){
        if(visible){
          loading.hide();
          visible = false;
          $btn.html('Let me know what you mean');
        }else{
          loading.show();
          visible = true;
          $btn.html('OK, bring me back');
        }
      });
    });
  };

  $.fn.applyCommonThings = function(){
    return this.each(function(){
      $('#whatthemaincontent', this).whatthemaincontent();
      $('#whattheloading', this).whattheloading();
    });
  };

  $('body').applyCommonThings();


  // do it
  //
  //$(document).on('click', $.LazyJaxDavis.prototype.options.davis.linkSelector, function(){
  //  console.log('this is!!!');
  //});
  
  window.d = $.LazyJaxDavis({
    init: function(){
      log('init');
    },
    everyfetchstart: function(page) {
      log('everyfetchstart');
      $root.css('opacity', 0.6);
      window.scrollTo(0, 0);
      loading.show();
      sidenav.currentify(page.path);
    },
    everyfetchsuccess: function(page) {
      var $newcontent;
      log('everyfetchsuccess');
      $root.css('opacity', 1);
      loading.hide();
      $newcontent = $(page.rip('content')).hide();
      $root.empty().append($newcontent);
      $newcontent.fadeIn();
      page.trigger('pageready');
    },
    everypageready: function(){
      log('everypageready');
      $root.applyCommonThings();
    },
    everyfetchfail: function() {
      log('everyfetchfail');
    },
    //anchorhandler: function(hash){
    //  console.log(hash);
    //},
  },[
    {
      path: '/jQuery.LazyJaxDavis/demos/applied/_site/posttest.html',
      method: 'POST'
    },
    {
      path: '/jQuery.LazyJaxDavis/demos/applied/_site/gettest.html',
      method: 'GET'
    }
    //{
    //  //anchorhandler: function(hash){
    //  //  log('custom anchor handler');
    //  //},
    //  path: '/jQuery.LazyJaxDavis/demos/applied/_site/posttest.html',
    //  method: 'POST',
    //  //fetchstart: function() {
    //  //  log('toppage fetchstart');
    //  //},
    //  //fetchsuccess: function() {
    //  //  log('toppage fetchsuccess');
    //  //},
    //  //pageready: function(){
    //  //  log('toppage pageready');
    //  //}
    //}
  ]);


});


