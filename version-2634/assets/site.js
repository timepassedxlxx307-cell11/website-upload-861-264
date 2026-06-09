(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
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
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        show(0);
        start();
    }

    document.querySelectorAll('[data-scroll-wrap]').forEach(function (wrap) {
        var list = wrap.querySelector('[data-scroll-list]');
        var left = wrap.querySelector('[data-scroll-left]');
        var right = wrap.querySelector('[data-scroll-right]');

        if (!list) {
            return;
        }

        if (left) {
            left.addEventListener('click', function () {
                list.scrollBy({ left: -420, behavior: 'smooth' });
            });
        }

        if (right) {
            right.addEventListener('click', function () {
                list.scrollBy({ left: 420, behavior: 'smooth' });
            });
        }
    });

    document.querySelectorAll('.js-player').forEach(function (shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var src = shell.getAttribute('data-stream');
        var hls = null;
        var attached = false;

        function attach() {
            if (!video || !src || attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = src;
            }
        }

        function play() {
            attach();
            shell.classList.add('is-playing');
            video.controls = true;

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });

    var searchResults = document.getElementById('searchResults');
    var searchInput = document.getElementById('searchInput');
    var searchTitle = document.getElementById('searchTitle');

    if (searchResults && typeof MOVIE_SEARCH_INDEX !== 'undefined') {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (searchInput) {
            searchInput.value = query;
        }

        function card(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<a class="movie-card" href="./' + escapeHtml(movie.file) + '">' +
                '<span class="card-poster"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="card-shade"></span></span>' +
                '<span class="card-info"><strong>' + escapeHtml(movie.title) + '</strong><span class="card-line">' + escapeHtml(movie.oneLine) + '</span><span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.category) + '</span><span class="tag-row">' + tags + '</span></span>' +
                '</a>';
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function runSearch(value) {
            var keyword = String(value || '').trim().toLowerCase();

            if (!keyword) {
                searchResults.innerHTML = '';
                if (searchTitle) {
                    searchTitle.textContent = '影片搜索';
                }
                return;
            }

            var results = MOVIE_SEARCH_INDEX.filter(function (movie) {
                return [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.category, movie.tags.join(' ')].join(' ').toLowerCase().indexOf(keyword) !== -1;
            }).slice(0, 120);

            if (searchTitle) {
                searchTitle.textContent = '搜索结果：' + value;
            }

            searchResults.innerHTML = results.length ? results.map(card).join('') : '<p class="empty-state">没有找到相关影片</p>';
        }

        runSearch(query);
    }
})();
