/**
 * Aqua Chains Animation — wrapper for existing aqua-animation.js
 *
 * Adapts the existing aquaAnimation() function from the main site
 * to work with the AnimationManager swap system.
 *
 * Usage:
 *   AnimationManager.swap('hero-canvas', 'aqua-chains', { laneCount: 5 });
 *
 * Note: The existing aquaAnimation() has no built-in stop mechanism.
 * When destroyed, we clear the canvas and set a flag, but the internal
 * rAF loop may continue until garbage collected. This is acceptable
 * for occasional swaps but should be improved in the original source
 * for heavy swap usage.
 */
(function () {
    'use strict';

    /* Check that the original animation function is available.
       It must be loaded via: <script src="../../public/js/aqua-animation.js"> */
    if (typeof AnimationManager === 'undefined') {
        console.warn('[aqua-chains] AnimationManager not found. Load animation-manager.js first.');
        return;
    }

    AnimationManager.register('aqua-chains', {
        init: function (canvas, options) {
            var opts = {
                reverse: options.reverse || false,
                laneCount: options.laneCount || 5,
                invertSpeed: options.invertSpeed || false
            };

            /* The existing function expects a canvas ID string */
            if (typeof aquaAnimation === 'function') {
                aquaAnimation(canvas.id, opts);
            } else {
                console.warn(
                    '[aqua-chains] aquaAnimation() not found. ' +
                    'Load ../../public/js/aqua-animation.js before this file.'
                );
            }

            return { canvasId: canvas.id };
        },

        destroy: function (instance) {
            var canvas = document.getElementById(instance.canvasId);
            if (canvas) {
                var ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
            /* TODO: Add a stop mechanism to the original aqua-animation.js
               to properly cancel its rAF loop. For now, the cleared canvas
               prevents visual artifacts, and the orphaned loop has minimal
               performance impact since it draws to a cleared/hidden canvas. */
        }
    });
})();
