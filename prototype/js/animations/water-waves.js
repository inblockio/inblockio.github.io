/**
 * Water Waves Animation
 *
 * Layered sine-wave animation that evokes gentle flowing water.
 * Multiple translucent wave layers move at different speeds and phases,
 * creating an organic, rippling water surface effect.
 *
 * Registers with AnimationManager as 'water-waves'.
 */
(function () {
    'use strict';

    if (typeof AnimationManager === 'undefined') {
        console.warn('[water-waves] AnimationManager not found.');
        return;
    }

    AnimationManager.register('water-waves', {
        init: function (canvas, options) {
            var ctx = canvas.getContext('2d');
            var running = true;
            var rafId = null;
            var time = 0;

            /* Wave layer definitions */
            var layers = [
                { amp: 25, freq: 0.008, speed: 0.00075, yOffset: 0.35, color: 'rgba(30, 100, 180, 0.12)' },
                { amp: 18, freq: 0.012, speed: 0.0011, yOffset: 0.42, color: 'rgba(40, 130, 200, 0.10)' },
                { amp: 30, freq: 0.006, speed: 0.0005, yOffset: 0.50, color: 'rgba(20, 80, 160, 0.14)' },
                { amp: 14, freq: 0.015, speed: 0.0014, yOffset: 0.55, color: 'rgba(60, 160, 220, 0.08)' },
                { amp: 22, freq: 0.010, speed: 0.0009, yOffset: 0.65, color: 'rgba(30, 110, 190, 0.11)' },
                { amp: 10, freq: 0.020, speed: 0.00175, yOffset: 0.72, color: 'rgba(80, 180, 240, 0.06)' }
            ];

            function resize() {
                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = canvas.offsetWidth * dpr;
                canvas.height = canvas.offsetHeight * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            function drawWave(layer, t) {
                var w = canvas.offsetWidth;
                var h = canvas.offsetHeight;
                var baseY = h * layer.yOffset;

                ctx.beginPath();
                ctx.moveTo(0, h);

                for (var x = 0; x <= w; x += 3) {
                    var y = baseY
                        + Math.sin(x * layer.freq + t * layer.speed * 60) * layer.amp
                        + Math.sin(x * layer.freq * 0.7 + t * layer.speed * 40 + 2.0) * layer.amp * 0.5
                        + Math.sin(x * layer.freq * 1.5 + t * layer.speed * 80 + 4.5) * layer.amp * 0.25;
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = layer.color;
                ctx.fill();
            }

            function animate() {
                if (!running) return;

                var w = canvas.offsetWidth;
                var h = canvas.offsetHeight;

                ctx.clearRect(0, 0, w, h);

                for (var i = 0; i < layers.length; i++) {
                    drawWave(layers[i], time);
                }

                time += 1;
                rafId = requestAnimationFrame(animate);
            }

            /* Pause when off-viewport */
            var paused = false;
            var observer = null;
            if (typeof IntersectionObserver !== 'undefined') {
                observer = new IntersectionObserver(function (entries) {
                    if (entries[0].isIntersecting) {
                        if (paused) { paused = false; animate(); }
                    } else {
                        paused = true;
                        running = false;
                        if (rafId) cancelAnimationFrame(rafId);
                    }
                }, { threshold: 0.05 });
                observer.observe(canvas);
            }

            /* Reduced motion */
            var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (motionQuery.matches) {
                resize();
                time = 100; /* static snapshot */
                for (var i = 0; i < layers.length; i++) {
                    drawWave(layers[i], time);
                }
                return { rafId: null, running: false, observer: observer, resize: resize };
            }

            resize();
            window.addEventListener('resize', resize);
            animate();

            return {
                rafId: rafId,
                running: running,
                observer: observer,
                resize: resize,
                stop: function () {
                    running = false;
                    if (rafId) cancelAnimationFrame(rafId);
                }
            };
        },

        destroy: function (state) {
            if (!state) return;
            if (state.stop) state.stop();
            if (state.observer) state.observer.disconnect();
            window.removeEventListener('resize', state.resize);
        }
    });
})();
