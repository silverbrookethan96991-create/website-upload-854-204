(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        var opened = nav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var slider = document.querySelector(".js-hero-slider");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var prev = slider.querySelector(".hero-prev");
      var next = slider.querySelector(".hero-next");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
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
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      slider.addEventListener("mouseenter", stopTimer);
      slider.addEventListener("mouseleave", startTimer);
      startTimer();
    }

    Array.prototype.slice.call(document.querySelectorAll(".js-card-scope")).forEach(function (scope) {
      var search = scope.querySelector(".js-search");
      var filters = Array.prototype.slice.call(scope.querySelectorAll(".js-filter"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-card"));
      var empty = scope.querySelector(".empty-state");
      var activeFilter = "all";

      function cardText(card) {
        return [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
      }

      function applyFilter() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = cardText(card);
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
          var shouldShow = matchQuery && matchFilter;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0 && cards.length > 0);
        }
      }

      if (search) {
        search.addEventListener("input", applyFilter);
      }

      filters.forEach(function (button) {
        button.addEventListener("click", function () {
          filters.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeFilter = button.getAttribute("data-filter") || "all";
          applyFilter();
        });
      });
    });
  });
})();
