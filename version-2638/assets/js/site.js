(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupNavigation();
        setupHeroSlider();
        setupFilters();
        setupBackTop();
    });

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-main-nav]');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

        if (slides.length < 2) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        panels.forEach(function (panel) {
            var scope = document.querySelector(panel.getAttribute('data-filter-panel'));
            if (!scope) {
                return;
            }

            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var search = panel.querySelector('[data-filter-search]');
            var region = panel.querySelector('[data-filter-region]');
            var sort = panel.querySelector('[data-filter-sort]');
            var empty = document.querySelector(panel.getAttribute('data-empty-target'));

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function matches(card) {
                var query = normalize(search ? search.value : '');
                var selectedRegion = region ? region.value : '';
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));

                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }

                if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
                    return false;
                }

                return true;
            }

            function applySort(visibleCards) {
                if (!sort || !sort.value) {
                    return;
                }

                visibleCards.sort(function (left, right) {
                    var leftNumber = Number(left.getAttribute('data-number')) || 0;
                    var rightNumber = Number(right.getAttribute('data-number')) || 0;
                    var leftYear = Number(left.getAttribute('data-year-number')) || 0;
                    var rightYear = Number(right.getAttribute('data-year-number')) || 0;

                    if (sort.value === 'year-desc') {
                        return rightYear - leftYear || leftNumber - rightNumber;
                    }

                    if (sort.value === 'year-asc') {
                        return leftYear - rightYear || leftNumber - rightNumber;
                    }

                    if (sort.value === 'title') {
                        return String(left.getAttribute('data-title')).localeCompare(String(right.getAttribute('data-title')), 'zh-Hans-CN');
                    }

                    return leftNumber - rightNumber;
                });

                visibleCards.forEach(function (card) {
                    scope.appendChild(card);
                });
            }

            function update() {
                var visibleCards = [];

                cards.forEach(function (card) {
                    var isVisible = matches(card);
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visibleCards.push(card);
                    }
                });

                applySort(visibleCards);

                if (empty) {
                    empty.classList.toggle('is-visible', visibleCards.length === 0);
                }
            }

            [search, region, sort].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', update);
                    control.addEventListener('change', update);
                }
            });

            update();
        });
    }

    function setupBackTop() {
        var button = document.querySelector('[data-back-top]');

        if (!button) {
            return;
        }

        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 500);
        }, { passive: true });

        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
