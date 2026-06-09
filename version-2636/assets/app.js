(function() {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            const open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const next = hero.querySelector("[data-hero-next]");
        const prev = hero.querySelector("[data-hero-prev]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    const searchParams = new URLSearchParams(window.location.search);
    const initialQuery = searchParams.get("q") || "";
    const filterInput = document.querySelector(".filter-input");
    const filterSelect = document.querySelector(".filter-select");
    const cards = Array.from(document.querySelectorAll(".filter-grid .movie-card"));

    function applyFilter() {
        const query = filterInput ? filterInput.value.trim().toLowerCase() : "";
        const selected = filterSelect ? filterSelect.value.trim().toLowerCase() : "";
        cards.forEach(function(card) {
            const text = [
                card.dataset.title,
                card.dataset.tags,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year
            ].join(" ").toLowerCase();
            const type = (card.dataset.type || "").toLowerCase();
            const visible = (!query || text.indexOf(query) !== -1) && (!selected || type.indexOf(selected) !== -1);
            card.classList.toggle("is-filtered-out", !visible);
        });
    }

    if (filterInput) {
        if (initialQuery) {
            filterInput.value = initialQuery;
        }
        filterInput.addEventListener("input", applyFilter);
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", applyFilter);
    }

    if (cards.length) {
        applyFilter();
    }

    const row = document.querySelector("[data-scroll-row]");
    const left = document.querySelector("[data-scroll-left]");
    const right = document.querySelector("[data-scroll-right]");
    if (row && left && right) {
        left.addEventListener("click", function() {
            row.scrollBy({ left: -320, behavior: "smooth" });
        });
        right.addEventListener("click", function() {
            row.scrollBy({ left: 320, behavior: "smooth" });
        });
    }
})();
