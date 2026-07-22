/* The Wooden Stone - homepage-only behavior (2026 rebrand).
   Loaded ONLY by index.html, after script.js. script.js's slideshow never
   initializes here because its gate requires '.hero-slideshow
   .slideshow-container', which the rebuilt hero intentionally does not use.
   This file owns the hero slideshow (with WCAG 2.2.2 pause control),
   reveal-on-scroll, and the scroll progress rail. */

(function () {
    'use strict';

    document.documentElement.classList.add('ws-js');

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* Ambient hero slideshow. Reuses script.js's global
       getRandomInteriorImages() ({src, alt, projectName} objects) so image
       curation stays in one place until the curated four-frame story lands. */
    function initAmbientSlides() {
        var wrap = document.querySelector('.ws-slides');
        if (!wrap) return;

        var sources = [];
        try {
            if (typeof getRandomInteriorImages === 'function') {
                sources = getRandomInteriorImages(5) || [];
            }
        } catch (e) {
            sources = [];
        }
        if (!sources.length) {
            sources = [{ src: 'images/on-time-installations-hero.jpg', alt: '' }];
        }

        var frag = document.createDocumentFragment();
        sources.forEach(function (item, i) {
            var slide = document.createElement('div');
            slide.className = 'ws-slide' + (i === 0 ? ' active' : '');
            var img = document.createElement('img');
            img.src = item.src;
            img.alt = '';
            img.decoding = 'async';
            if (i !== 0) img.loading = 'lazy';
            slide.appendChild(img);
            frag.appendChild(slide);
        });
        wrap.innerHTML = '';
        wrap.appendChild(frag);

        var slides = wrap.children;
        var current = 0;
        var timer = null;
        var userPaused = false;
        var hoverPaused = false;
        var INTERVAL = 8000;

        function next() {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
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

        var btn = document.querySelector('.ws-slides-pause');
        if (btn) {
            btn.addEventListener('click', function () {
                userPaused = !userPaused;
                btn.classList.toggle('paused', userPaused);
                btn.setAttribute('aria-pressed', String(userPaused));
                btn.setAttribute('aria-label',
                    userPaused ? 'Play background slideshow' : 'Pause background slideshow');
                if (userPaused) stop(); else play();
            });
        }

        var hero = document.querySelector('.ws-hero');
        if (hero) {
            hero.addEventListener('mouseenter', function () { hoverPaused = true; stop(); });
            hero.addEventListener('mouseleave', function () { hoverPaused = false; play(); });
            hero.addEventListener('focusin', function () { hoverPaused = true; stop(); });
            hero.addEventListener('focusout', function () { hoverPaused = false; play(); });
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
        initAmbientSlides();
        initReveal();
        initRail();
    });
})();
