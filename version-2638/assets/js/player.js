(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var containers = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        containers.forEach(function (container) {
            setupPlayer(container);
        });
    });

    function setupPlayer(container) {
        var video = container.querySelector('video');
        var playButton = container.querySelector('[data-play-button]');
        var errorBox = container.querySelector('[data-player-error]');
        var source = container.getAttribute('data-source');
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function showError() {
            if (errorBox) {
                errorBox.classList.add('is-visible');
            }
        }

        function markStarted() {
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
        }

        function loadSource() {
            if (video.getAttribute('data-loaded') === 'true') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            video.setAttribute('data-loaded', 'true');
        }

        function startPlayback() {
            loadSource();
            markStarted();
            var playback = video.play();

            if (playback && typeof playback.catch === 'function') {
                playback.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', markStarted);
        video.addEventListener('error', showError);

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
