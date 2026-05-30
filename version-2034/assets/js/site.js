(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.hasAttribute("hidden");
            if (open) {
                panel.removeAttribute("hidden");
            } else {
                panel.setAttribute("hidden", "");
            }
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

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
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var list = scope.parentElement.querySelector("[data-card-list]");
            var empty = scope.parentElement.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

            function apply() {
                var query = valueOf(input);
                var selectedRegion = valueOf(region);
                var selectedType = valueOf(type);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var regionOk = !selectedRegion || String(card.getAttribute("data-region")).toLowerCase() === selectedRegion;
                    var typeOk = !selectedType || String(card.getAttribute("data-type")).toLowerCase() === selectedType;
                    var queryOk = !query || text.indexOf(query) !== -1;
                    var show = regionOk && typeOk && queryOk;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (!q) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    window.initVideoPlayer = function (videoId, posterId, sourceUrl) {
        var video = document.getElementById(videoId);
        var poster = document.getElementById(posterId);
        if (!video || !poster || !sourceUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function start() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = sourceUrl;
                    video.play().catch(function () {});
                }
                poster.classList.add("is-hidden");
                return;
            }
            if (video.paused) {
                video.play().catch(function () {});
            }
        }

        poster.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initSearchQuery();
    });
})();
