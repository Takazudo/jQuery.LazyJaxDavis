$(function(){

  // define the root of the main content

  $.LazyJaxDavis(function(router){

    var $root = $('#lazyjaxdavisroot');

    router.bind('everyfetchstart', function(page){
      $root.css('opacity', 0.6);
      window.scrollTo(0, 0);
    });

    router.bind('everyfetchsuccess', function(page){
      $root.css('opacity', 1);
      $newcontent = $(page.rip('content')).hide();
      $root.empty().append($newcontent);
      $newcontent.fadeIn();
      page.trigger('pageready');
    });

    router.bind('everyfetchfail', function(){
      alert('ajax error!');
      $root.css('opacity', 1);
    });

  });

});


