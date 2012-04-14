$(function(){

  $.LazyJaxDavis(function(router){

    var $root = $('#lazyjaxdavisroot');
    var $loader = $('<div id="loader">Loading...</div>').appendTo('body');

    router.option({
      expr: {
        imgsrc: /src="([^"]+)"/gi
      }
    });

    router.bind('everyfetchstart', function(page){
      $root.css('opacity', 0.6);
      $loader.show();
      window.scrollTo(0, 0);
    });

    router.bind('everyfetchsuccess', function(page){

      var srcs = page.ripAll('imgsrc');
      var complete = function(){
        $loader.hide();
        $root.css('opacity', 1);
        $newcontent = $(page.rip('content')).hide();
        $root.empty().append($newcontent);
        $newcontent.fadeIn();
        page.trigger('pageready');
      }

      if(!srcs.length){
        // if no imgs found, just complete pagefetch.
        complete();
      }else{
        // if imgs were there, do imgs' preloading.
        var loader = $.ImgLoader({
          srcs: srcs,
          pipesize: 5,
          delay: 0
        });
        loader.load().done(complete);
      }

    });

    router.bind('everyfetchfail', function(){
      alert('ajax error!');
      $root.css('opacity', 1);
    });

  });

});


