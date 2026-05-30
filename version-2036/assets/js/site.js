(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");

    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });

    initHero();
    initFilters();
    initPlayer();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-input]");

    if (!panel) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var category = document.querySelector("[data-filter-category]");
    var year = document.querySelector("[data-filter-year]");
    var sort = document.querySelector("[data-filter-sort]");
    var reset = document.querySelector("[data-filter-reset]");
    var count = document.querySelector("[data-result-count]");
    var grid = document.querySelector("[data-card-grid]") || document.querySelector(".movie-grid") || document.body;
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var query = normalized(input && input.value);
      var selectedCategory = category ? category.value : "全部分类";
      var selectedYear = year ? year.value : "全部年份";
      var visible = [];

      cards.forEach(function (card) {
        var searchText = normalized(card.getAttribute("data-search"));
        var cardTitle = normalized(card.getAttribute("data-title"));
        var cardCategory = card.getAttribute("data-category") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchesQuery = !query || searchText.indexOf(query) > -1 || cardTitle.indexOf(query) > -1;
        var matchesCategory = selectedCategory === "全部分类" || cardCategory === selectedCategory;
        var matchesYear = selectedYear === "全部年份" || cardYear === selectedYear;
        var isVisible = matchesQuery && matchesCategory && matchesYear;

        card.classList.toggle("is-hidden", !isVisible);

        if (isVisible) {
          visible.push(card);
        }
      });

      if (sort && sort.value !== "default") {
        visible.sort(function (a, b) {
          if (sort.value === "latest") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }

          if (sort.value === "oldest") {
            return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
          }

          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
        });

        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (count) {
        count.textContent = "找到 " + visible.length + " 部";
      }
    }

    [input, category, year, sort].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }

        if (category) {
          category.value = "全部分类";
        }

        if (year) {
          year.value = "全部年份";
        }

        if (sort) {
          sort.value = "default";
        }

        apply();
      });
    }

    apply();
  }

  function initPlayer() {
    var video = document.querySelector("[data-player]");

    if (!video) {
      return;
    }

    var trigger = document.querySelector("[data-play-trigger]");
    var status = document.querySelector("[data-player-status]");
    var src = video.getAttribute("data-src");
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function hideOverlay() {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    }

    function loadAndPlay() {
      if (!src) {
        setStatus("暂未找到播放地址。");
        return;
      }

      setStatus("正在加载播放源...");

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          hideOverlay();
          video.play().catch(function () {
            setStatus("播放源已就绪，请点击播放器开始播放。");
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("播放加载失败，请刷新页面或更换浏览器重试。");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        hideOverlay();
        video.play().catch(function () {
          setStatus("播放源已就绪，请点击播放器开始播放。");
        });
      } else {
        video.src = src;
        hideOverlay();
        video.play().catch(function () {
          setStatus("当前浏览器可能需要支持 HLS 的播放器扩展。");
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", loadAndPlay);
    }

    video.addEventListener("play", hideOverlay);
  }
})();
