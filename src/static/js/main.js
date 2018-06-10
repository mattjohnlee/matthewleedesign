(function () {
  // Add your Javascript here

    this.$window        = $(window);
    this.$interestItem  = $('.js-interest-item');

    this.$interestItem.mousemove(function( event ) {
      if ($(this).hasClass('show-image')) {

        var $projectImg = $(this).find('.js-hp-hover-img');

        $projectImg.css({
          'left': event.clientX + 'px',
          'top': event.clientY + 'px'
        }).attr('src', $projectImg.data('src'));
      }
    }).hover(function() {
      $(this).addClass('show-image')
    },
    function(){
      $(this).removeClass('show-image');
    });
})();
