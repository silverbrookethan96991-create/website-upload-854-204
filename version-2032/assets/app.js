(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

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

    restart();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
        card.classList.toggle('is-hidden-card', q && text.indexOf(q) === -1);
      });
    });
  }

  function setupSearch() {
    var form = document.querySelector('[data-site-search]');
    var results = document.querySelector('[data-search-results]');
    if (!form || !results || !window.SITE_MOVIES) {
      return;
    }
    var input = form.querySelector('input[name="q"]');

    function makeCard(movie) {
      return '<a class="movie-card" href="./' + movie.url + '">' +
        '<span class="card-cover"><img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="card-play">▶</span></span>' +
        '<span class="card-body"><strong>' + escapeHtml(movie.title) + '</strong><em>' + escapeHtml(movie.oneLine) + '</em>' +
        '<span class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></span>' +
        '<span class="card-tags">' + escapeHtml(movie.genre) + '</span></span></a>';
    }

    function render(query) {
      var q = (query || '').trim().toLowerCase();
      var source = window.SITE_MOVIES;
      var filtered = q ? source.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      }) : source.slice(0, 36);
      if (!filtered.length) {
        results.innerHTML = '<div class="empty-result">没有找到匹配内容，请更换关键词。</div>';
        return;
      }
      results.innerHTML = filtered.slice(0, 120).map(makeCard).join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q') || '';
    input.value = preset;
    render(preset);
  }

  function setupPlayer() {
    var frame = document.querySelector('[data-player]');
    if (!frame) {
      return;
    }
    var video = frame.querySelector('video');
    var shade = frame.querySelector('.player-shade');
    var stream = frame.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded || !video || !stream) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }

    function play() {
      load();
      if (shade) {
        shade.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    }

    if (shade) {
      shade.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (shade) {
        shade.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
    setupPlayer();
  });
})();
