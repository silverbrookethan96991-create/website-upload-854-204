function initVideoPlayer(streamUrl) {
  var video = document.getElementById("moviePlayer");
  var playButton = document.getElementById("playButton");
  var shell = document.querySelector(".player-shell");
  var ready = false;
  var hlsInstance = null;

  function loadVideo() {
    if (!video || ready) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    }

    ready = true;
  }

  function startVideo() {
    if (!video) {
      return;
    }

    loadVideo();

    if (shell) {
      shell.classList.add("is-ready");
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (shell) {
          shell.classList.remove("is-ready");
        }
      });
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startVideo);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        startVideo();
      }
    });

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-ready");
      }
    });

    video.addEventListener("ended", function () {
      if (shell) {
        shell.classList.remove("is-ready");
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
