(function () {
  var projects = document.querySelectorAll('.js-project');

  // Mirrors the default transform set in CSS: translate3d(-15%, -105%, 0)
  var OFFSET_X = -0.15;
  var OFFSET_Y = -1.05;

  // How much of the image is allowed to run off-screen before it flips.
  // 0.5 = flip once 50% is off-screen, 0.75 = flip once 75% is off-screen (later/more permissive).
  var FLIP_THRESHOLD = 0.6;

  function positionImage(project, event) {
    var img = project.querySelector('.js-project-img');
    if (!img) return;

    var width = img.offsetWidth;
    var height = img.offsetHeight;
    var cursorX = event.clientX;
    var cursorY = event.clientY;

    // Where the image would sit at its default (non-flipped) position
    var left = cursorX + OFFSET_X * width;
    var top = cursorY + OFFSET_Y * height;
    var right = left + width;

    // Flip horizontally if more than FLIP_THRESHOLD of the image's width
    // would spill past the right edge of the viewport
    var overflowRight = right - window.innerWidth;
    var flipX = overflowRight > width * FLIP_THRESHOLD;

    // Flip vertically if more than FLIP_THRESHOLD of the image's height
    // would spill past the top edge of the viewport
    var overflowTop = -top;
    var flipY = overflowTop > height * FLIP_THRESHOLD;

    img.classList.toggle('flip-x', flipX);
    img.classList.toggle('flip-y', flipY);

    img.style.left = cursorX + 'px';
    img.style.top = cursorY + 'px';
  }

  projects.forEach(function (project) {
    project.addEventListener('mousemove', function (event) {
      if (project.classList.contains('show-image')) {
        positionImage(project, event);
      }
    });

    project.addEventListener('mouseenter', function () {
      project.classList.add('show-image');

      if (project.classList.contains('js-project--video')) {
        var projectVid = project.querySelector('.js-project-video');
        if (projectVid) projectVid.play();
      }
    });

    project.addEventListener('mouseleave', function () {
      project.classList.remove('show-image');

      if (project.classList.contains('js-project--video')) {
        var projectVid = project.querySelector('.js-project-video');
        if (projectVid) projectVid.pause();
      }
    });
  });
})();