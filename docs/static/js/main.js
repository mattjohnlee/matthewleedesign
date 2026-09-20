(function () {
  var projects = document.querySelectorAll('.js-project');

  projects.forEach(function (project) {
    project.addEventListener('mousemove', function (event) {
      if (project.classList.contains('show-image')) {
        var projectImg = project.querySelector('.js-project-img');
        if (projectImg) {
          projectImg.style.left = event.clientX + 'px';
          projectImg.style.top = event.clientY + 'px';
        }
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