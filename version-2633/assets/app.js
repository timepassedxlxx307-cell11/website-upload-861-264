document.addEventListener('DOMContentLoaded', function () {
  setupNavigation();
  setupSearchForms();
  setupHero();
  setupRails();
  setupFilters();
  setupPlayer();
});

function setupNavigation() {
  var button = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (!button || !panel) {
    return;
  }

  button.addEventListener('click', function () {
    panel.classList.toggle('is-open');
  });
}

function setupSearchForms() {
  document.querySelectorAll('.search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var value = input ? input.value.trim() : '';

      if (value) {
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });
}

function setupHero() {
  var hero = document.querySelector('.hero');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
  var prev = hero.querySelector('.hero-prev');
  var next = hero.querySelector('.hero-next');
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      start();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);

  show(0);
  start();
}

function setupRails() {
  document.querySelectorAll('[data-rail-control]').forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('data-rail-target');
      var rail = document.getElementById(targetId);
      var direction = button.getAttribute('data-rail-control');

      if (!rail) {
        return;
      }

      rail.scrollBy({
        left: direction === 'left' ? -420 : 420,
        behavior: 'smooth'
      });
    });
  });
}

function setupFilters() {
  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var listName = input.getAttribute('data-filter-input');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list="' + listName + '"] [data-search-text]'));

    function applyFilter() {
      var value = input.value.trim().toLowerCase();

      items.forEach(function (item) {
        var text = item.getAttribute('data-search-text').toLowerCase();
        item.classList.toggle('hidden-card', value && text.indexOf(value) === -1);
      });
    }

    input.addEventListener('input', applyFilter);

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input.id === 'site-search-input') {
      input.value = query;
      applyFilter();
    }
  });
}

function setupPlayer() {
  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.video-cover');
    var button = shell.querySelector('.video-play');
    var message = shell.querySelector('.video-message');
    var stream = shell.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.add('is-visible');
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            return;
          }

          showMessage('播放暂时无法加载，请稍后再试');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      loadVideo();
      video.controls = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    if (cover) {
      cover.addEventListener('click', function () {
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}
