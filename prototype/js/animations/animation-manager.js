/**
 * AnimationManager — Module registry for swappable canvas animations.
 *
 * Each animation registers an { init, destroy } pair. The manager handles
 * starting, stopping, and hot-swapping animations on any canvas element.
 *
 * Usage:
 *   AnimationManager.register('my-anim', { init(canvas, opts) { ... }, destroy(state) { ... } });
 *   AnimationManager.start('hero-canvas', 'my-anim', { speed: 2 });
 *   AnimationManager.swap('hero-canvas', 'other-anim');
 */
var AnimationManager = (function () {
    'use strict';

    // name -> { init, destroy }
    var registry = {};

    // canvasId -> { name, instance }
    var active = {};

    return {
        /**
         * Register an animation module.
         * @param {string} name - Unique animation identifier.
         * @param {{ init: Function, destroy: Function }} handlers
         */
        register: function (name, handlers) {
            if (!handlers || typeof handlers.init !== 'function' || typeof handlers.destroy !== 'function') {
                console.warn('[AnimationManager] register("' + name + '") requires { init, destroy } functions.');
                return;
            }
            registry[name] = { init: handlers.init, destroy: handlers.destroy };
        },

        /**
         * Start an animation on a canvas element.
         * @param {string} canvasId - DOM id of the <canvas> element.
         * @param {string} animationName - Registered animation name.
         * @param {Object} [options={}] - Passed through to the animation's init().
         */
        start: function (canvasId, animationName, options) {
            options = options || {};

            // Stop any animation already running on this canvas
            if (active[canvasId]) {
                this.stop(canvasId);
            }

            var canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn('[AnimationManager] Canvas #' + canvasId + ' not found.');
                return;
            }
            if (!registry[animationName]) {
                console.warn('[AnimationManager] Animation "' + animationName + '" not registered.');
                return;
            }

            var instance = registry[animationName].init(canvas, options);
            active[canvasId] = { name: animationName, instance: instance };
        },

        /**
         * Stop and clean up the animation running on a canvas.
         * @param {string} canvasId
         */
        stop: function (canvasId) {
            var entry = active[canvasId];
            if (!entry) return;

            registry[entry.name].destroy(entry.instance);
            delete active[canvasId];
        },

        /**
         * Hot-swap: stop the current animation and start a new one.
         * @param {string} canvasId
         * @param {string} newName
         * @param {Object} [options={}]
         */
        swap: function (canvasId, newName, options) {
            this.stop(canvasId);
            this.start(canvasId, newName, options || {});
        },

        /**
         * List all registered animation names.
         * @returns {string[]}
         */
        list: function () {
            return Object.keys(registry);
        }
    };
})();
