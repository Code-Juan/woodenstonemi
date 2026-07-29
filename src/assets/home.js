/* The Wooden Stone - homepage-only behavior (2026 rebrand).
   Loaded ONLY by index.html, after script.js. script.js's slideshow never
   initializes here because its gate requires '.hero-slideshow
   .slideshow-container', which the rebuilt hero intentionally does not use.
   This file owns the hero slideshow (with WCAG 2.2.2 pause control),
   reveal-on-scroll, and the scroll progress rail.

   To change the hero slideshow, edit SLIDE_MIX (how many exteriors /
   kitchens / vanities show per load) or the photo pools just below. */

(function () {
    'use strict';

    document.documentElement.classList.add('ws-js');

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ------------------------------------------------------------------ *
     * HERO SLIDESHOW - each page load randomly picks from the portfolio.
     *
     * SLIDE_MIX sets how many of each type appear per load. Change these
     * numbers to shift the balance (they total the number of slides shown):
     *   exteriors - photos of the buildings
     *   kitchens  - finished kitchen installs (the largest share)
     *   vanities  - bathroom / vanity installs (a small accent)
     * The pools below list every photo eligible for each type; add or
     * remove a line (or put // in front) to change what can be chosen.
     * The "-hero.jpg" (largest) variant is used for sharpness.
     * ------------------------------------------------------------------ */
    var SLIDE_MIX = { exteriors: 3, kitchens: 4, vanities: 1 };

    var EXTERIOR_PHOTOS = [
        { src: 'images/Previous Jobs/5. 450 Amsterdam Apartments/exterior-overview-real-hero.png', project: '450 Amsterdam Apartments' },
        { src: 'images/Previous Jobs/12. Chatham Apartments/exterior-overview-hero.png', project: 'Chatham Apartments' },
        { src: 'images/Previous Jobs/6. Terra Station Apartments/apartments-overview1-hero.webp', project: 'Terra Station Apartments' },
        { src: 'images/Previous Jobs/21. Baldwin Woods Apartments/exterior-overview-hero.jpg', project: 'Baldwin Woods Apartments' },
        { src: 'images/Previous Jobs/13. Palms Apartments/exterior-overview-hero.jpg', project: 'Palms Apartments' },
        { src: 'images/Previous Jobs/14. 2135 Hubbard/mavor-apartments-detroit-mi-building-photo-hero.jpg', project: '2135 Hubbard' },
        { src: 'images/Previous Jobs/16. 25 E. Palmer (Barlum Apartments)/the-barlum-detroit-mi-primary-photo-hero.jpg', project: '25 E. Palmer' },
        { src: 'images/Previous Jobs/10. Freewheel Apartments/freewheel-apartments-marquette-mi-primary-photo-hero.png', project: 'Freewheel Apartments' },
        { src: 'images/Previous Jobs/7. Brightdawn Apartments/apartments-overview-hero.jpg', project: 'Brightdawn Apartments' },
        { src: 'images/Previous Jobs/3. Preserve on Ash - Phase 1/Preserve-on-Ash-Phase-1_medium-hero.jpg', project: 'The Preserve on Ash' }
    ];

    var KITCHEN_PHOTOS = [
        { src: 'images/Previous Jobs/1. Woodview Commons/(Kitchen 1) woodview-commons-ann-arbor-mi-building-photo-hero.jpg', project: 'Woodview Commons Flats' },
        { src: 'images/Previous Jobs/1. Woodview Commons/(Kitchen 2) woodview-commons-ann-arbor-mi-building-photo-hero.jpg', project: 'Woodview Commons Flats' },
        { src: 'images/Previous Jobs/13. Palms Apartments/kitchen-view-hero.webp', project: 'Palms Apartments' },
        { src: 'images/Previous Jobs/13. Palms Apartments/kitchen-view2-hero.webp', project: 'Palms Apartments' },
        { src: 'images/Previous Jobs/7. Brightdawn Apartments/kitchen-view1-hero.jpg', project: 'Brightdawn Apartments' },
        { src: 'images/Previous Jobs/19. Higgenbotham Garden Apartments/view-of-kitchen-hero.png', project: 'Higginbotham Garden Apartments' },
        { src: 'images/Previous Jobs/4. 3740 2nd Ave Apartments/Kitchen1 VIEW_3740 Apartments-hero.jpg', project: '3740 2nd Ave Apartments' }
    ];

    var VANITY_PHOTOS = [
        { src: 'images/Previous Jobs/4. 3740 2nd Ave Apartments/bath1 VIEW_3740 Apartments-hero.jpg', project: '3740 2nd Ave Apartments' },
        { src: 'images/Previous Jobs/13. Palms Apartments/bathroom-view-hero.jpg', project: 'Palms Apartments' }
    ];

    var INTERVAL = 5500;

    /* Fisher-Yates shuffle returning up to n items (does not mutate input) */
    function pickRandom(pool, n) {
        var a = pool.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a.slice(0, Math.max(0, n));
    }

    function buildPlaylist() {
        var chosen = []
            .concat(pickRandom(EXTERIOR_PHOTOS, SLIDE_MIX.exteriors))
            .concat(pickRandom(KITCHEN_PHOTOS, SLIDE_MIX.kitchens))
            .concat(pickRandom(VANITY_PHOTOS, SLIDE_MIX.vanities));
        return pickRandom(chosen, chosen.length).map(function (s) {
            return { src: s.src, projectName: s.project };
        });
    }

    function initStorySlides() {
        var wrap = document.querySelector('.ws-slides');
        if (!wrap) return;

        var sources = buildPlaylist();
        if (!sources.length) {
            sources = [
                { src: 'images/on-time-installations-hero.jpg', projectName: 'The Wooden Stone' },
                { src: 'images/Scopes & Materials/countertops-hero.jpg', projectName: 'The Wooden Stone' }
            ];
        }

        var frag = document.createDocumentFragment();
        sources.forEach(function (item, i) {
            var slide = document.createElement('div');
            slide.className = 'ws-slide' + (i === 0 ? ' active' : '');
            var img = document.createElement('img');
            img.src = item.src;
            img.alt = item.projectName ? (item.projectName + ' - completed project') : '';
            img.decoding = 'async';
            if (i !== 0) img.loading = 'lazy';
            slide.appendChild(img);
            frag.appendChild(slide);
        });
        wrap.innerHTML = '';
        wrap.appendChild(frag);

        var projectEl = document.querySelector('.ws-show-project');

        /* Build one indicator per slide to match the real slide count. */
        var ticksWrap = document.querySelector('.ws-ticks');
        var ticks = [];
        if (ticksWrap) {
            ticksWrap.innerHTML = '';
            sources.forEach(function (item, i) {
                var tick = document.createElement('button');
                tick.type = 'button';
                tick.className = 'ws-tick' + (i === 0 ? ' active' : '');
                tick.setAttribute('aria-label', 'Show project ' + (i + 1));
                ticksWrap.appendChild(tick);
                ticks.push(tick);
            });
        }

        var slides = wrap.children;
        var current = 0;
        var timer = null;
        var userPaused = false;
        var hoverPaused = false;

        function label(item) {
            return item && item.projectName
                ? String(item.projectName).toLowerCase().replace(/\b\w/g, function (m) { return m.toUpperCase(); })
                : ' ';
        }

        function show(i) {
            slides[current].classList.remove('active');
            if (ticks[current]) ticks[current].classList.remove('active');
            current = i;
            slides[current].classList.add('active');
            if (ticks[current]) ticks[current].classList.add('active');
            if (projectEl) projectEl.textContent = label(sources[current]);
        }

        if (projectEl) projectEl.textContent = label(sources[0]);

        function next() {
            show((current + 1) % slides.length);
        }

        function play() {
            if (timer || userPaused || hoverPaused || REDUCED.matches ||
                document.hidden || slides.length < 2) return;
            timer = setInterval(next, INTERVAL);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        /* Manual project selection always works, including under reduced
           motion; it only restarts the timer when autoplay is allowed. */
        ticks.forEach(function (tick, i) {
            tick.addEventListener('click', function () {
                show(i);
                stop();
                play();
            });
        });

        var btn = document.querySelector('.ws-slides-pause');
        if (btn) {
            btn.addEventListener('click', function () {
                userPaused = !userPaused;
                btn.classList.toggle('paused', userPaused);
                btn.setAttribute('aria-pressed', String(userPaused));
                btn.setAttribute('aria-label',
                    userPaused ? 'Play project slideshow' : 'Pause project slideshow');
                if (userPaused) stop(); else play();
            });
        }

        var show_panel = document.querySelector('.ws-hero-show');
        if (show_panel) {
            show_panel.addEventListener('mouseenter', function () { hoverPaused = true; stop(); });
            show_panel.addEventListener('mouseleave', function () { hoverPaused = false; play(); });
            show_panel.addEventListener('focusin', function () { hoverPaused = true; stop(); });
            show_panel.addEventListener('focusout', function () { hoverPaused = false; play(); });
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop(); else play();
        });

        function onMotionChange() {
            if (REDUCED.matches) stop(); else play();
        }
        if (typeof REDUCED.addEventListener === 'function') {
            REDUCED.addEventListener('change', onMotionChange);
        } else if (typeof REDUCED.addListener === 'function') {
            REDUCED.addListener(onMotionChange);
        }

        play();
    }

    /* Reveal on scroll. CSS hides .rv only when html.ws-js is present and
       reduced motion is not requested, so this can never hide content from
       no-JS or reduced-motion visitors. */
    function initReveal() {
        var items = document.querySelectorAll('body.home .rv');
        if (!items.length) return;

        if (!('IntersectionObserver' in window) || REDUCED.matches) {
            items.forEach(function (el) { el.classList.add('rv-in'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('rv-in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

        items.forEach(function (el) { io.observe(el); });
    }

    /* Scroll progress rail (2px, left edge, desktop only via CSS). */
    function initRail() {
        var rail = document.createElement('div');
        rail.className = 'ws-rail';
        rail.setAttribute('aria-hidden', 'true');
        var fill = document.createElement('span');
        rail.appendChild(fill);
        document.body.appendChild(rail);

        var ticking = false;
        function update() {
            ticking = false;
            var doc = document.documentElement;
            var max = doc.scrollHeight - window.innerHeight;
            var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
            fill.style.transform = 'scaleY(' + p + ')';
        }
        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });
        update();
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!document.body.classList.contains('home')) return;
        initStorySlides();
        initReveal();
        initRail();
    });
})();
