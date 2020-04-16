(function () {
  // Add your Javascript here

    this.$window        = $(window);
    this.$project  = $('.js-project');

    this.$project.mousemove(function( event ) {
      if ($(this).hasClass('show-image')) {

        var $projectImg = $(this).find('.js-project-img');

        $projectImg
        .css({
          'left': event.clientX + 'px',
          'top': event.clientY + 'px'
        });
      }
    })

    $project.hover(function() {
      $(this).addClass('show-image')

      if ($(this).hasClass('js-project--video')) {
        var $projectVid = $(this).find('.js-project-video');
        $projectVid.get(0).play();
      }
    },

    function(){
      $(this).removeClass('show-image');

      if ($(this).hasClass('js-project--video')) {
        var $projectVid = $(this).find('.js-project-video');
        $projectVid.get(0).pause();
      }
    });
})();
