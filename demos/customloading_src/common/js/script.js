$(function(){

  new $.LazyJaxDavis(function(router){

    var $overlay = $.ui.hideoverlay.setup({
      spinnersrc: '/jQuery.LazyJaxDavis/demos/customloading/common/img/spinner.gif'
    });
    var $root = $('#lazyjaxdavisroot');

    router.option({
      minwaittime: 800
    });

    router.bind('everyfetchstart', function(page){
      window.scrollTo(0, 0);
      $overlay.hideoverlay('show');
    });

    router.bind('everyfetchsuccess', function(page){
      $overlay
        .one('hideoverlay.hideend', function(){
          $root.empty().append(page.rip('content'));
          page.trigger('pageready');
        })
        .hideoverlay('hide');
    });

    router.bind('everyfetchfail', function(){
      alert('ajax error!');
    });

  });

});


