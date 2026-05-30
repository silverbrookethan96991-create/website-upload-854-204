(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('[data-card-filter]').forEach(function (panel) {
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var queryInput = panel.querySelector('[data-filter-query]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var status = panel.querySelector('[data-filter-status]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(queryInput ? queryInput.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var category = normalize(categorySelect ? categorySelect.value : '');

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || cardYear === year;
        var matchesCategory = !category || cardCategory === category;
        card.classList.toggle('is-filter-hidden', !(matchesQuery && matchesYear && matchesCategory));
      });

      if (status) {
        status.textContent = '按条件显示影片';
      }
    }

    [queryInput, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (queryInput) {
          queryInput.value = '';
        }

        if (yearSelect) {
          yearSelect.value = '';
        }

        if (categorySelect) {
          categorySelect.value = '';
        }

        applyFilter();
      });
    }

    applyFilter();
  });

  document.querySelectorAll('[data-video-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var player = null;
    var initialized = false;

    function source() {
      return video ? video.getAttribute('data-video-url') : '';
    }

    function initPlayer() {
      if (!video || initialized) {
        return;
      }

      initialized = true;
      var url = source();

      if (!url) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        player.loadSource(url);
        player.attachMedia(video);
        player.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            player.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            player.recoverMediaError();
          } else {
            player.destroy();
          }
        });
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      initPlayer();

      if (!video) {
        return;
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', function () {
        button.classList.add('is-hidden');
        playVideo();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (player) {
        player.destroy();
      }
    });
  });
}());
