document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.mobile-menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isHidden = mobileNav.hasAttribute('hidden');
      if (isHidden) {
        mobileNav.removeAttribute('hidden');
        menuButton.textContent = '×';
      } else {
        mobileNav.setAttribute('hidden', '');
        menuButton.textContent = '☰';
      }
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5000);
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.closest('main') || document;
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var reset = panel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-filter-empty]');
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!selectedYear || cardYear === selectedYear) && (!selectedType || cardType === selectedType);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        apply();
      });
    }
  });

  if (window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = document.querySelector('[data-search-page-input]');
    var title = document.querySelector('[data-search-title]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    if (input) {
      input.value = q;
    }
    function movieCard(movie) {
      return [
        '<article class="movie-card">',
        '<a href="' + movie.url + '" class="poster-link" aria-label="观看 ' + movie.safeTitle + '">',
        '<span class="poster-frame">',
        '<img src="' + movie.cover + '" alt="' + movie.safeTitle + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="card-badge">' + movie.type + '</span>',
        '<span class="card-duration">' + movie.duration + '</span>',
        '<span class="card-play">▶</span>',
        '</span>',
        '</a>',
        '<h3><a href="' + movie.url + '">' + movie.safeTitle + '</a></h3>',
        '<p>' + movie.safeDesc + '</p>',
        '<div class="card-meta"><span>★ ' + movie.rating + '</span><span>' + movie.year + '</span><a href="' + movie.categoryUrl + '">' + movie.category + '</a></div>',
        '</article>'
      ].join('');
    }
    function renderSearch(keyword) {
      var normalized = (keyword || '').trim().toLowerCase();
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return !normalized || movie.search.indexOf(normalized) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = normalized ? '搜索结果：' + keyword + '（' + matched.length + '）' : '推荐浏览';
      }
      if (results) {
        results.innerHTML = matched.map(movieCard).join('');
      }
      if (empty) {
        empty.hidden = matched.length !== 0;
      }
    }
    renderSearch(q);
  }
});
