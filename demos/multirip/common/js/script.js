$(function(){

  new $.LazyJaxDavis(function(router){

    var $root = $('#lazyjaxdavisroot');
    var $sidenav = $('#sidenav');

    router.option({
      expr:{
        sidenav: /<!-- sidenav start -->([\s\S]*)<!-- sidenav end -->/
      }
    });

    router.bind('everyfetchstart', function(page){
      $root.css('opacity', 0.6);
      window.scrollTo(0, 0);
    });

    router.bind('everyfetchsuccess', function(page){

      $root.css('opacity', 1);
      $newcontent = $(page.rip('content')).hide();
      $root.empty().append($newcontent);
      $newcontent.fadeIn();

      $sidenav.html(page.rip('sidenav'));

      page.trigger('pageready');

    });

    router.bind('everyfetchfail', function(){
      alert('ajax error!');
      $root.css('opacity', 1);
    });

  });

});


