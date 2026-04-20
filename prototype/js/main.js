/**
 * main.js — Application initialization for inblock.io prototype.
 *
 * Load order (all via <script> tags, not ES modules):
 *   1. js/nav.js
 *   2. js/scroll-transitions.js
 *   3. js/main.js  (this file)
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        /* ── 1. Navigation ─────────────────────────────────
         * nav.js self-initializes on DOMContentLoaded, but if
         * initNav is available and hasn't run yet we can call it
         * explicitly as a safety net.
         */
        if (typeof initNav === 'function') {
            // nav.js already registers its own DOMContentLoaded listener,
            // so this is a no-op guard — both listeners fire, but initNav
            // is idempotent (operates on the same DOM elements).
        }

        /* ── 2. Scroll reveal transitions ─────────────────
         * Initialize the IntersectionObserver for .reveal elements.
         */
        if (typeof initScrollTransitions === 'function') {
            initScrollTransitions();
        }

        /* ── 3. Solutions tab transitions ─────────────────
         * Animated fade between tab panels.
         */
        initSolutionsTabs();

        console.log('inblock.io prototype loaded.');
    });

    function initSolutionsTabs() {
        var tabs = document.querySelectorAll('.solutions-tab');
        var panels = document.querySelectorAll('.solutions-panel');
        if (!tabs.length) return;

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var targetId = 'panel-' + tab.getAttribute('data-tab');
                var targetPanel = document.getElementById(targetId);
                if (!targetPanel || tab.classList.contains('is-active')) return;

                // Deactivate current
                tabs.forEach(function (t) { t.classList.remove('is-active'); });
                tab.classList.add('is-active');

                // Fade out current panel
                var activePanel = document.querySelector('.solutions-panel.is-active');
                if (activePanel) {
                    activePanel.classList.remove('is-active');
                }

                // Fade in target panel
                targetPanel.classList.add('is-entering');
                // Force reflow for transition
                void targetPanel.offsetHeight;
                targetPanel.classList.remove('is-entering');
                targetPanel.classList.add('is-active');
            });
        });
    }
})();
