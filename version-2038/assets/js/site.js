(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var heroTimer = null;

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

    function nextSlide() {
        showSlide(current + 1);
    }

    function startHero() {
        if (heroTimer) {
            clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = setInterval(nextSlide, 5200);
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }

    startHero();

    var searchInput = document.querySelector('[data-search-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var movieList = document.querySelector('[data-movie-list]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterMovies() {
        if (!movieList) {
            return;
        }
        var cards = Array.prototype.slice.call(movieList.querySelectorAll('.movie-card'));
        var keyword = normalize(searchInput ? searchInput.value : '');
        var category = categoryFilter ? categoryFilter.value : 'all';
        var type = typeFilter ? typeFilter.value : 'all';
        var year = yearFilter ? yearFilter.value : 'all';

        cards.forEach(function (card) {
            var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year'));
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedCategory = category === 'all' || card.getAttribute('data-category') === category;
            var matchedType = type === 'all' || card.getAttribute('data-type') === type;
            var matchedYear = year === 'all' || card.getAttribute('data-year') === year;
            card.classList.toggle('is-hidden', !(matchedKeyword && matchedCategory && matchedType && matchedYear));
        });
    }

    [searchInput, categoryFilter, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterMovies);
            control.addEventListener('change', filterMovies);
        }
    });

    var player = document.querySelector('[data-player]');
    var playButton = document.querySelector('[data-play-button]');

    function startPlayer() {
        if (!player || !playButton) {
            return;
        }
        var video = player.querySelector('video');
        var src = playButton.getAttribute('data-hls');

        if (!video || !src) {
            return;
        }

        playButton.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== src) {
                video.src = src;
            }
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                video.__hlsInstance = hls;
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.play().catch(function () {});
            }
        } else {
            video.src = src;
            video.play().catch(function () {});
        }
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayer);
    }

    if (player) {
        var videoElement = player.querySelector('video');
        if (videoElement) {
            videoElement.addEventListener('click', function () {
                if (videoElement.paused) {
                    startPlayer();
                } else {
                    videoElement.pause();
                }
            });
        }
    }
})();
