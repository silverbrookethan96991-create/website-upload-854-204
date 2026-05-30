(function () {
  function initMoviePlayer(stream) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    var playButton = document.getElementById('player-play');
    var muteButton = document.getElementById('player-mute');
    var fullscreenButton = document.getElementById('player-fullscreen');
    var hls = null;
    var ready = false;

    if (!video || !stream) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    function pause() {
      video.pause();
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        pause();
      }
    }

    function refresh() {
      if (playButton) {
        playButton.textContent = video.paused ? '播放' : '暂停';
      }
      if (muteButton) {
        muteButton.textContent = video.muted ? '声音' : '静音';
      }
      if (overlay) {
        overlay.classList.toggle('is-hidden', !video.paused);
      }
    }

    attach();

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }
    if (playButton) {
      playButton.addEventListener('click', toggle);
    }
    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        refresh();
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }
    video.addEventListener('click', toggle);
    video.addEventListener('play', refresh);
    video.addEventListener('pause', refresh);
    video.addEventListener('ended', refresh);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
    refresh();
  }

  window.initMoviePlayer = initMoviePlayer;
}());
