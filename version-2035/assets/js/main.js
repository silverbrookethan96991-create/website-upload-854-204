(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function escapeHtml(value) {
    return (value || '').toString().replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initMenu() {
    var button = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = $all('[data-hero-slide]');
    var dots = $all('[data-hero-dot]');
    var next = $('[data-hero-next]');
    var prev = $('[data-hero-prev]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }
    start();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initLocalFilter() {
    var form = $('[data-local-filter]');
    if (!form) {
      return;
    }
    var cards = $all('[data-filter-card]');
    var input = $('[data-filter-input]', form);
    var category = $('[data-filter-category]', form);
    var region = $('[data-filter-region]', form);
    var year = $('[data-filter-year]', form);
    var regions = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-region');
    }).filter(Boolean))).sort();
    var years = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-year');
    }).filter(Boolean))).sort().reverse();
    fillSelect(region, regions);
    fillSelect(year, years);

    function filterCards() {
      var term = normalize(input && input.value);
      var selectedCategory = category ? category.value : '';
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-keywords') + ' ' + card.textContent);
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
        var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        card.classList.toggle('filter-hidden', !(matchTerm && matchCategory && matchRegion && matchYear));
      });
    }

    form.addEventListener('input', filterCards);
    form.addEventListener('change', filterCards);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards();
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.file) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 在线观看" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(movie.region) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h2><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-tags">' + tags + '</div>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var results = $('[data-search-results]');
    var form = $('[data-search-form]');
    var input = $('[data-search-input]');
    if (!results || !window.movieData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render(term) {
      var q = normalize(term);
      var list = window.movieData.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.year, movie.genre, movie.category, (movie.tags || []).join(' '), movie.oneLine].join(' '));
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 120);
      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有匹配的影片</div>';
        return;
      }
      results.innerHTML = list.map(movieCard).join('');
    }

    render(initial);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input ? input.value : '');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
  });
}());
