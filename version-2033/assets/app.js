(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = $('.menu-toggle');
    var nav = $('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = $('.hero-carousel');
    if (!root) {
      return;
    }
    var slides = $all('.hero-slide', root);
    var dots = $all('.hero-dot', root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prevButton = $('.hero-control.prev', root);
    var nextButton = $('.hero-control.next', root);
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var resultAreas = $all('.filter-results');
    if (!resultAreas.length) {
      return;
    }
    var keywordInput = $('.movie-filter');
    var selects = $all('.filter-select');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter')] = normalize(select.value);
      });
      resultAreas.forEach(function (area) {
        var visibleCount = 0;
        $all('.movie-card', area).forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var matched = !keyword || text.indexOf(keyword) !== -1;
          if (matched && filters.region) {
            matched = normalize(card.getAttribute('data-region')).indexOf(filters.region) !== -1;
          }
          if (matched && filters.year) {
            matched = normalize(card.getAttribute('data-year')) === filters.year;
          }
          if (matched && filters.type) {
            matched = normalize(card.getAttribute('data-type')).indexOf(filters.type) !== -1;
          }
          if (matched && filters.category) {
            matched = text.indexOf(filters.category) !== -1;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visibleCount += 1;
          }
        });
        area.classList.toggle('is-empty', visibleCount === 0);
      });
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  window.initMoviePlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var started = false;
    var hls = null;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function hideOverlay() {
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
    }

    function beginNative() {
      video.src = streamUrl;
      hideOverlay();
      video.play().catch(function () {});
    }

    function beginHls() {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        hideOverlay();
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (hls) {
            hls.destroy();
          }
          beginNative();
        }
      });
    }

    function play() {
      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          beginNative();
        } else if (window.Hls && window.Hls.isSupported()) {
          beginHls();
        } else {
          beginNative();
        }
      } else {
        hideOverlay();
        video.play().catch(function () {});
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!started) {
        play();
      }
    });
    video.addEventListener('play', hideOverlay);
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
