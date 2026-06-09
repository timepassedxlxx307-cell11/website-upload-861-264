(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
            var current = 0;
            var timer = null;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                thumbs.forEach(function (thumb, i) {
                    thumb.classList.toggle("active", i === current);
                });
            }
            function play() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            thumbs.forEach(function (thumb) {
                thumb.addEventListener("click", function () {
                    window.clearInterval(timer);
                    show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
                    play();
                });
            });
            if (slides.length > 1) {
                play();
            }
        }

        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                var shell = img.closest(".poster-frame, .hero-bg, .hero-thumb, .detail-poster, .player-cover, .rank-hero-card");
                if (shell) {
                    shell.classList.add("cover-missing");
                }
            });
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var search = panel.querySelector("[data-search-input]");
            var type = panel.querySelector("[data-type-filter]");
            var region = panel.querySelector("[data-region-filter]");
            var year = panel.querySelector("[data-year-filter]");
            var section = panel.nextElementSibling;
            var cards = section ? Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]")) : [];
            function value(node) {
                return node ? node.value.trim().toLowerCase() : "";
            }
            function run() {
                var keyword = value(search);
                var typeValue = value(type);
                var regionValue = value(region);
                var yearValue = value(year);
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (typeValue && String(card.getAttribute("data-type")).toLowerCase() !== typeValue) {
                        ok = false;
                    }
                    if (regionValue && String(card.getAttribute("data-region")).toLowerCase() !== regionValue) {
                        ok = false;
                    }
                    if (yearValue && String(card.getAttribute("data-year")).toLowerCase() !== yearValue) {
                        ok = false;
                    }
                    card.classList.toggle("hidden-by-filter", !ok);
                });
            }
            [search, type, region, year].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", run);
                    node.addEventListener("change", run);
                }
            });
        });
    });
})();
