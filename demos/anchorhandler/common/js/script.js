$.tinyscroller.live(); // lively bind events about scroller

$(function(){

  new $.LazyJaxDavis(function(router){

    var $root = $('#lazyjaxdavisroot');
    var scrollDefer = null;

    router.option({
      expr: {
        sidenav: /<!-- sidenav start -->([\s\S]*)<!-- sidenav end -->/
      },
      anchorhandler: function(hash){
        $.tinyscroller.scrollTo(hash); // invoke scrolling
      }
    });

    router.bind('everyfetchstart', function(page){
      $root.css('opacity', 0.6);
      scrollDefer = $.tinyscroller.scrollTo(0); // first, back to top
    });

    router.bind('everyfetchsuccess', function(page){
      $root.css('opacity', 1);
      $('#sidenav').empty().append(page.rip('sidenav'));
      $.when(scrollDefer).done(function(){
          $newcontent = $(page.rip('content')).hide();
          $root.empty().append($newcontent);
          $.when($newcontent.fadeIn()).done(function(){
            // tell the router it's ready
            // when scrolling and fadeIn are both done.
            page.trigger('pageready');
            scrollDefer = null;
          });
      });
    });

    router.bind('everyfetchfail', function(){
      alert('ajax error!');
      $root.css('opacity', 1);
    });

  });

});


