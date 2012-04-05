$.tinyscroller.live();

$(function(){

  $.LazyJaxDavis(function(router){

    var $root = $('#lazyjaxdavisroot');
    var scrollDefer = null;

    router.option({
      expr: {
        sidenav: /<!-- sidenav start -->([\s\S]*)<!-- sidenav end -->/
      },
      anchorhandler: function(hash){
        $.tinyscroller.scrollTo(hash);
      }
    });

    router.bind('everyfetchstart', function(page){
      $root.css('opacity', 0.6);
      scrollDefer = $.tinyscroller.scrollTo(0);
    });

    router.bind('everyfetchsuccess', function(page){
      $root.css('opacity', 1);
      $('#sidenav').empty().append(page.rip('sidenav'));
      var padding = ($.Deferred()).resolve();
      $.when(scrollDefer, padding).done(function(){
          $newcontent = $(page.rip('content')).hide();
          $root.empty().append($newcontent);
          $.when($newcontent.fadeIn()).done(function(){
            page.trigger('pageready');
          });
      });
    });

    router.bind('everyfetchfail', function(){
      alert('ajax error!');
      $root.css('opacity', 1);
    });

  });

});


