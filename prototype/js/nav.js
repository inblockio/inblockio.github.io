/**
 * Navigation Controller — mega-menu, mobile drawer, scroll behavior, language switcher.
 *
 * Expects the following DOM structure:
 *
 *   <nav class="site-nav">
 *     <a class="nav-logo" href="/">...</a>
 *     <button class="nav-hamburger" aria-label="Menu">
 *       <span></span><span></span><span></span>
 *     </button>
 *     <div class="nav-overlay"></div>
 *     <ul class="nav-links">
 *       <li class="nav-item" data-menu="solutions">
 *         <button class="nav-trigger" aria-expanded="false" aria-controls="menu-solutions">
 *           Solutions <span class="nav-arrow"></span>
 *         </button>
 *         <div class="mega-menu" id="menu-solutions" aria-hidden="true">...</div>
 *       </li>
 *       ...
 *     </ul>
 *     <button class="lang-switch">DE</button>
 *   </nav>
 */
var initNav = (function () {
    'use strict';

    /* ── State ─────────────────────────────────────────── */
    var MOBILE_BREAKPOINT = 768;
    var SCROLL_THRESHOLD = 80;
    var OPEN_DELAY = 100;   // ms before opening on hover
    var CLOSE_DELAY = 200;  // ms grace period on mouseleave

    var siteNav, navLinks, navOverlay, hamburger, langSwitch;
    var navItems = [];
    var lastFocusedTrigger = null;
    var openTimer = null;
    var closeTimer = null;
    var scrollTicking = false;

    /* ── Helpers ───────────────────────────────────────── */

    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    /**
     * Find the mega-menu panel associated with a nav-item.
     * Uses the data-menu attribute to locate #menu-{name}.
     */
    function getPanelForItem(navItem) {
        var menuName = navItem.getAttribute('data-menu');
        if (!menuName) return null;
        return document.getElementById('menu-' + menuName);
    }

    function getTriggerForItem(navItem) {
        return navItem.querySelector('.nav-trigger');
    }

    /* ── Panel open/close ─────────────────────────────── */

    function openPanel(navItem) {
        var panel = getPanelForItem(navItem);
        var trigger = getTriggerForItem(navItem);
        if (!panel) return;

        panel.classList.add('is-open');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
            lastFocusedTrigger = trigger;
        }
        panel.setAttribute('aria-hidden', 'false');
    }

    function closePanel(navItem) {
        var panel = getPanelForItem(navItem);
        var trigger = getTriggerForItem(navItem);
        if (!panel) return;

        panel.classList.remove('is-open');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
        panel.setAttribute('aria-hidden', 'true');
    }

    function closeAllPanels() {
        for (var i = 0; i < navItems.length; i++) {
            closePanel(navItems[i]);
        }
    }

    /* ── Desktop hover behavior ───────────────────────── */

    function onNavItemMouseEnter(navItem) {
        if (isMobile()) return;

        clearTimeout(closeTimer);
        openTimer = setTimeout(function () {
            closeAllPanels();
            openPanel(navItem);
        }, OPEN_DELAY);
    }

    function onNavItemMouseLeave(navItem) {
        if (isMobile()) return;

        clearTimeout(openTimer);
        closeTimer = setTimeout(function () {
            closePanel(navItem);
        }, CLOSE_DELAY);
    }

    /* ── Desktop click toggle ─────────────────────────── */

    function onTriggerClick(navItem, e) {
        e.preventDefault();
        var panel = getPanelForItem(navItem);
        if (!panel) return;

        if (isMobile()) {
            // Accordion toggle in mobile mode
            var isOpen = panel.classList.contains('is-open');
            if (isOpen) {
                closePanel(navItem);
            } else {
                // Close others first for accordion behavior
                closeAllPanels();
                openPanel(navItem);
            }
        } else {
            // Desktop toggle
            var isCurrentlyOpen = panel.classList.contains('is-open');
            closeAllPanels();
            if (!isCurrentlyOpen) {
                openPanel(navItem);
            }
        }
    }

    /* ── Mobile drawer ────────────────────────────────── */

    function openMobileDrawer() {
        if (!navLinks || !hamburger) return;
        navLinks.classList.add('is-open');
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
        if (navOverlay) navOverlay.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
        if (!navLinks || !hamburger) return;
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        if (navOverlay) navOverlay.classList.remove('is-visible');
        document.body.style.overflow = '';
        closeAllPanels();
    }

    function toggleMobileDrawer() {
        if (navLinks && navLinks.classList.contains('is-open')) {
            closeMobileDrawer();
        } else {
            openMobileDrawer();
        }
    }

    /* ── Scroll behavior ──────────────────────────────── */

    function onScroll() {
        if (scrollTicking) return;
        scrollTicking = true;

        requestAnimationFrame(function () {
            if (!siteNav) { scrollTicking = false; return; }

            if (window.scrollY > SCROLL_THRESHOLD) {
                siteNav.classList.add('nav--scrolled');
            } else {
                siteNav.classList.remove('nav--scrolled');
            }
            scrollTicking = false;
        });
    }

    /* ── Language switcher ─────────────────────────────── */

    function onLangSwitch(e) {
        e.preventDefault();
        var currentLang = document.documentElement.getAttribute('lang') || 'en';
        var targetLang = currentLang === 'de' ? 'en' : 'de';

        // Save preference
        try {
            localStorage.setItem('inblock-lang', targetLang);
        } catch (err) {
            // localStorage may be unavailable (private browsing, etc.)
        }

        // Navigate to sibling language folder
        var path = window.location.pathname;
        var newPath;
        if (path.indexOf('/' + currentLang + '/') !== -1) {
            newPath = path.replace('/' + currentLang + '/', '/' + targetLang + '/');
        } else {
            // Fallback: navigate to the target language root
            newPath = path.substring(0, path.lastIndexOf('/') + 1) + '../' + targetLang + '/';
        }

        window.location.href = newPath;
    }

    /* ── Keyboard: Escape ─────────────────────────────── */

    function onKeyDown(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            closeAllPanels();
            if (isMobile() && navLinks && navLinks.classList.contains('is-open')) {
                closeMobileDrawer();
            }
            if (lastFocusedTrigger) {
                lastFocusedTrigger.focus();
            }
        }
    }

    /* ── Click outside ────────────────────────────────── */

    function onDocumentClick(e) {
        if (!siteNav) return;
        if (!siteNav.contains(e.target)) {
            closeAllPanels();
        }
    }

    /* ── Initialization ───────────────────────────────── */

    function init() {
        siteNav    = document.querySelector('.site-nav');
        navLinks   = document.querySelector('.nav-links');
        navOverlay = document.querySelector('.nav-overlay');
        hamburger  = document.querySelector('.nav-hamburger');
        langSwitch = document.querySelector('.lang-switch');

        if (!siteNav) return;

        // Collect nav items that have menus
        var items = siteNav.querySelectorAll('.nav-item[data-menu]');
        navItems = Array.prototype.slice.call(items);

        // Bind events per nav item
        navItems.forEach(function (navItem) {
            var panel = getPanelForItem(navItem);

            // Desktop hover on trigger
            navItem.addEventListener('mouseenter', function () {
                onNavItemMouseEnter(navItem);
            });
            navItem.addEventListener('mouseleave', function () {
                onNavItemMouseLeave(navItem);
            });

            // Desktop hover on mega-menu panel — keep it open while cursor is inside
            if (panel) {
                panel.addEventListener('mouseenter', function () {
                    if (isMobile()) return;
                    clearTimeout(closeTimer);
                    clearTimeout(openTimer);
                });
                panel.addEventListener('mouseleave', function () {
                    if (isMobile()) return;
                    closeTimer = setTimeout(function () {
                        closePanel(navItem);
                    }, CLOSE_DELAY);
                });
            }

            // Click on trigger
            var trigger = getTriggerForItem(navItem);
            if (trigger) {
                trigger.addEventListener('click', function (e) {
                    onTriggerClick(navItem, e);
                });
            }
        });

        // Hamburger
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileDrawer);
        }

        // Overlay click closes drawer
        if (navOverlay) {
            navOverlay.addEventListener('click', closeMobileDrawer);
        }

        // Scroll
        window.addEventListener('scroll', onScroll, { passive: true });
        // Run once on load to set initial state
        onScroll();

        // Keyboard
        document.addEventListener('keydown', onKeyDown);

        // Click outside
        document.addEventListener('click', onDocumentClick);

        // Language switcher
        if (langSwitch) {
            langSwitch.addEventListener('click', onLangSwitch);
        }
    }

    return init;
})();

// Self-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initNav);
