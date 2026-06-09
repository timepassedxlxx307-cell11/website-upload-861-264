document.addEventListener('DOMContentLoaded', function () {
  var panel = document.querySelector('[data-player]');

  if (!panel) {
    return;
  }

  var video = panel.querySelector('video');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));
  var status = panel.querySelector('[data-player-status]');
  var streamUrl = panel.getAttribute('data-stream') || '';
  var hls = null;
  var isReady = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function prepareVideo() {
    if (!video || !streamUrl || isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      isReady = true;
      setStatus('准备播放');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      isReady = true;
      setStatus('准备播放');
      return;
    }

    video.src = streamUrl;
    isReady = true;
    setStatus('准备播放');
  }

  function playVideo() {
    if (!video) {
      return;
    }

    prepareVideo();
    setStatus('正在播放');

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setStatus('点击视频画面继续播放');
      });
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
      panel.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  });

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      panel.classList.add('is-playing');
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      panel.classList.remove('is-playing');
      setStatus('已暂停');
    });

    video.addEventListener('error', function () {
      panel.classList.remove('is-playing');
      setStatus('播放失败，请稍后再试');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
