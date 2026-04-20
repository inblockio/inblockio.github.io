/**
 * Scroll Transitions — IntersectionObserver-based reveal animations.
 *
 * Any element with the `.reveal` class will receive `.is-visible` when it
 * scrolls into view (threshold 15%). Once visible, the element is unobserved
 * to avoid unnecessary work.
 *
 * CSS should handle the actual transition, e.g.:
 *   .reveal { opacity: 0; transform: translateY(24px); transition: all 0.6s ease-out; }
 *   .reveal.is-visible { opacity: 1; transform: translateY(0); }
 *
 * Exposes `initScrollTransitions()` globally for use in main.js.
 */
var initScrollTransitions = (function () {
    'use strict';

    var observer = null;

    function init() {
        // Bail out if IntersectionObserver is not supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: make everything visible immediately
            var elements = document.querySelectorAll('.reveal');
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.add('is-visible');
            }
            return;
        }

        observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('is-visible');
                    observer.unobserve(entries[i].target);
                }
            }
        }, {
            threshold: 0.15
        });

        var targets = document.querySelectorAll('.reveal');
        for (var j = 0; j < targets.length; j++) {
            observer.observe(targets[j]);
        }
    }

    return init;
})();
