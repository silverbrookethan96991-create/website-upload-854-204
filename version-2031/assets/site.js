(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var region = scope.querySelector('[data-region-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var count = scope.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var yearValue = year ? String(year.value) : '';
      var regionValue = region ? String(region.value) : '';
      var typeValue = type ? String(type.value) : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-text'));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matched = matchQuery && matchYear && matchRegion && matchType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && input) {
      input.value = initialQuery;
    }

    applyFilter();
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-overlay');
    var source = shell.getAttribute('data-src');
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (!video || !source || attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      if (button) {
        button.classList.add('hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (button) {
          button.classList.remove('hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
