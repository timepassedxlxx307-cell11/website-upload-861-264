(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  function setupSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));

    forms.forEach(function (form) {
      var input = form.querySelector('[data-movie-search]');
      var panel = form.closest('.search-panel');
      var scope = panel ? panel.parentElement.querySelector('[data-search-scope]') : document.querySelector('[data-search-scope]');
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-card]')) : [];
      var filterRow = panel ? panel.querySelector('[data-filter-row]') : null;
      var buttons = filterRow ? Array.prototype.slice.call(filterRow.querySelectorAll('[data-filter]')) : [];
      var currentFilter = '全部';

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var filter = normalize(currentFilter);

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-title'));
          var queryMatched = !query || haystack.indexOf(query) !== -1;
          var filterMatched = filter === '全部' || !filter || haystack.indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !(queryMatched && filterMatched));
        });
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter();
      });

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          currentFilter = button.getAttribute('data-filter') || '全部';
          applyFilter();
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-play-overlay]');
      var stream = player.getAttribute('data-stream');
      var hls = null;
      var initialized = false;

      if (!video || !stream) {
        return;
      }

      function attachStream() {
        if (initialized) {
          return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function beginPlay() {
        attachStream();

        if (overlay) {
          overlay.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', beginPlay);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlay();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  setupHero();
  setupSearch();
  setupPlayers();
})();
