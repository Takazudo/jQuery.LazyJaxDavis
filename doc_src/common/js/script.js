$(function(){

  var $root = $('#lazyjaxdavisroot');

  // tiny loading on top left

  var Loading = (function() {
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

  var loading = new Loading;
  

  // sidenav
  
  var Sidenav = (function(){
    function Sidenav() {
      this.$el = $('#sidenav');
      this.currentify(location.pathname);
    }
    Sidenav.prototype.currentify = function(path) {
      path = path.replace(/#.*/,'');
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

  var sidenav = new Sidenav;


  // tiny plugins for explanation

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

  
  // do it

  new $.LazyJaxDavis(function(router){

    router.bind('everyfetchstart', function(page){
      $root.css('opacity', 0.6);
      window.scrollTo(0, 0);
      loading.show();
      sidenav.currentify(page.path);
    });

    router.bind('everyfetchsuccess', function(page){
      var $newcontent;
      $root.css('opacity', 1);
      loading.hide();
      $newcontent = $(page.rip('content')).hide();
      $root.empty().append($newcontent);
      $newcontent.fadeIn();
      page.trigger('pageready');
    });

    router.bind('everypageready', function(page){
      $('#whatthemaincontent').whatthemaincontent();
      $('#whattheloading').whattheloading();
    });

    router.bind('everyfetchfail', function(){
      alert('ajax error!');
      $root.css('opacity', 1);
      loading.hide();
    });

    router.route([
      {
        path: '/jQuery.LazyJaxDavis/doc/posttest.html',
        method: 'POST'
      }
    ]);

  });
  

});


