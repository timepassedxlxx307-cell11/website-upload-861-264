(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var src = video.getAttribute("data-video-url");
            var prepared = false;
            var engine = null;

            function attach() {
                if (prepared || !src) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    engine = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    engine.loadSource(src);
                    engine.attachMedia(video);
                } else {
                    video.src = src;
                }
                prepared = true;
            }

            function start() {
                attach();
                player.classList.add("is-playing");
                var playTask = video.play();
                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {});
                }
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            window.addEventListener("pagehide", function () {
                if (engine && typeof engine.destroy === "function") {
                    engine.destroy();
                }
            });
        });
    });
})();
