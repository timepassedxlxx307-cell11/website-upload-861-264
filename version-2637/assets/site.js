(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll(".site-search-form")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                var keyword = input.value.trim();
                if (!keyword) {
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
            });
        });
    }

    function setupFilters() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var keywordInput = document.querySelector("[data-filter-keyword]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var emptyState = document.querySelector("[data-empty-state]");
        var items = Array.prototype.slice.call(list.querySelectorAll("[data-filter-item]"));
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get("q") || "";

        if (keywordInput && initialKeyword) {
            keywordInput.value = initialKeyword;
        }

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            items.forEach(function (item) {
                var haystack = normalize(item.getAttribute("data-search"));
                var itemYear = normalize(item.getAttribute("data-year"));
                var itemRegion = normalize(item.getAttribute("data-region"));
                var itemType = normalize(item.getAttribute("data-type"));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && itemYear !== year) {
                    matched = false;
                }
                if (region && itemRegion !== region) {
                    matched = false;
                }
                if (type && itemType !== type) {
                    matched = false;
                }

                item.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });

        apply();
    }

    window.initializeMoviePlayer = function (sourceUrl) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        var hlsInstance = null;
        var attached = false;

        if (!video || !sourceUrl) {
            return;
        }

        function attachAndPlay() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;

            if (attached) {
                var currentPlay = video.play();
                if (currentPlay && currentPlay.catch) {
                    currentPlay.catch(function () {});
                }
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                var nativePlay = video.play();
                if (nativePlay && nativePlay.catch) {
                    nativePlay.catch(function () {});
                }
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    var hlsPlay = video.play();
                    if (hlsPlay && hlsPlay.catch) {
                        hlsPlay.catch(function () {});
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = sourceUrl;
                    }
                });
                return;
            }

            video.src = sourceUrl;
            var fallbackPlay = video.play();
            if (fallbackPlay && fallbackPlay.catch) {
                fallbackPlay.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", attachAndPlay);
        }
        video.addEventListener("click", function () {
            if (!attached) {
                attachAndPlay();
            } else if (video.paused) {
                var playAgain = video.play();
                if (playAgain && playAgain.catch) {
                    playAgain.catch(function () {});
                }
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
})();
