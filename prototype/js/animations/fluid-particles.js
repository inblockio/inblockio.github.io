/**
 * Fluid Particles — ambient particle system driven by simplex noise flow fields.
 *
 * Visualizes "informational flows" with an organic, water-like quality.
 * Brand-colored particles move through a 2D simplex noise field with periodic
 * energy pulses that sweep across the canvas.
 *
 * Registers itself with AnimationManager as 'fluid-particles'.
 */
(function () {
    'use strict';

    /* ───────────────────────────────────────────────────────
     * Simplex Noise 2D — lightweight public-domain implementation
     * Based on Stefan Gustavson's SimplexNoise (public domain).
     * ─────────────────────────────────────────────────────── */
    var GRAD = [
        [1, 1], [-1, 1], [1, -1], [-1, -1],
        [1, 0], [-1, 0], [0, 1], [0, -1]
    ];

    function buildPermutation() {
        var perm = new Uint8Array(512);
        var p = new Uint8Array(256);
        var i, j, tmp;

        for (i = 0; i < 256; i++) p[i] = i;

        // Fisher-Yates shuffle with a fixed seed for determinism
        var seed = 42;
        for (i = 255; i > 0; i--) {
            seed = (seed * 16807 + 0) % 2147483647;
            j = seed % (i + 1);
            tmp = p[i];
            p[i] = p[j];
            p[j] = tmp;
        }

        for (i = 0; i < 512; i++) perm[i] = p[i & 255];
        return perm;
    }

    var PERM = buildPermutation();

    function dot2(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    /**
     * 2D Simplex noise. Returns value in approximately [-1, 1].
     */
    function simplex2(x, y) {
        var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

        var s = (x + y) * F2;
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        var t = (i + j) * G2;

        var X0 = i - t;
        var Y0 = j - t;
        var x0 = x - X0;
        var y0 = y - Y0;

        var i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else          { i1 = 0; j1 = 1; }

        var x1 = x0 - i1 + G2;
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2;
        var y2 = y0 - 1.0 + 2.0 * G2;

        var ii = i & 255;
        var jj = j & 255;

        var n0 = 0, n1 = 0, n2 = 0;
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            var gi0 = PERM[ii + PERM[jj]] % 8;
            t0 *= t0;
            n0 = t0 * t0 * dot2(GRAD[gi0], x0, y0);
        }

        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            var gi1 = PERM[ii + i1 + PERM[jj + j1]] % 8;
            t1 *= t1;
            n1 = t1 * t1 * dot2(GRAD[gi1], x1, y1);
        }

        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            var gi2 = PERM[ii + 1 + PERM[jj + 1]] % 8;
            t2 *= t2;
            n2 = t2 * t2 * dot2(GRAD[gi2], x2, y2);
        }

        // Scale to roughly [-1, 1]
        return 70.0 * (n0 + n1 + n2);
    }

    /* ───────────────────────────────────────────────────────
     * Color palette
     * ─────────────────────────────────────────────────────── */
    var PALETTE = [
        { r: 239, g: 84,  b: 1,   a: 0.25 },  // brand orange (most common)
        { r: 239, g: 84,  b: 1,   a: 0.25 },  // brand orange — doubled for weighting
        { r: 239, g: 84,  b: 1,   a: 0.25 },  // brand orange — tripled for weighting
        { r: 255, g: 200, b: 100, a: 0.4  },   // warm highlight
        { r: 100, g: 180, b: 255, a: 0.2  }    // cool accent (rare)
    ];

    /* ───────────────────────────────────────────────────────
     * Particle creation
     * ─────────────────────────────────────────────────────── */
    function createParticle(w, h) {
        var color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: 0,
            vy: 0,
            radius: 1 + Math.random() * 2,     // 1–3 px
            color: color,
            baseAlpha: color.a,
            alpha: color.a,
            speed: 0.3 + Math.random() * 0.7   // individual speed variance
        };
    }

    /* ───────────────────────────────────────────────────────
     * Flow field helpers
     * ─────────────────────────────────────────────────────── */
    var FLOW_SCALE = 0.005;   // controls spatial frequency of the noise
    var TIME_SCALE = 0.0003;  // controls how fast the field evolves

    function getFlowAngle(x, y, time) {
        var noiseVal = simplex2(x * FLOW_SCALE + time, y * FLOW_SCALE + time * 0.7);
        return noiseVal * Math.PI * 2;
    }

    /* ───────────────────────────────────────────────────────
     * Energy pulse
     * ─────────────────────────────────────────────────────── */
    function createPulse(canvasWidth) {
        return {
            x: -100,                              // start off-screen left
            speed: canvasWidth / 2500,             // traverse canvas in ~2.5 s
            width: 120,                            // glow spread (px)
            active: true,
            boost: 2.5                             // brightness multiplier
        };
    }

    /* ───────────────────────────────────────────────────────
     * Static fallback for prefers-reduced-motion
     * ─────────────────────────────────────────────────────── */
    function drawStaticGradient(ctx, w, h) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        var grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, 'rgba(239, 84, 1, 0.06)');
        grad.addColorStop(0.5, 'rgba(255, 200, 100, 0.04)');
        grad.addColorStop(1, 'rgba(100, 180, 255, 0.03)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    /* ───────────────────────────────────────────────────────
     * Init & destroy (AnimationManager interface)
     * ─────────────────────────────────────────────────────── */
    function init(canvas, options) {
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;

        // Size canvas to its CSS layout size at device resolution
        function resize() {
            var rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();

        var w = canvas.getBoundingClientRect().width;
        var h = canvas.getBoundingClientRect().height;

        // Respect reduced motion preference
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            drawStaticGradient(ctx, w, h);
            return { rafId: null, canvas: canvas, destroyed: true };
        }

        // Adaptive particle count — halve on mobile
        var isMobile = window.matchMedia('(max-width: 768px)').matches;
        var baseCount = options.particleCount || 350;
        var particleCount = isMobile ? Math.floor(baseCount / 2) : baseCount;

        // Clamp to 200–400 range
        particleCount = Math.max(200, Math.min(400, particleCount));

        // Create particles
        var particles = [];
        for (var i = 0; i < particleCount; i++) {
            particles.push(createParticle(w, h));
        }

        // State object
        var state = {
            canvas: canvas,
            ctx: ctx,
            dpr: dpr,
            particles: particles,
            rafId: null,
            destroyed: false,
            paused: false,
            startTime: performance.now(),
            lastPulseTime: performance.now(),
            pulse: null,
            pulseInterval: 3000 + Math.random() * 2000  // 3–5 seconds
        };

        // ── IntersectionObserver: pause when off-screen ──
        state.observer = new IntersectionObserver(function (entries) {
            state.paused = !entries[0].isIntersecting;
        }, { threshold: 0.05 });
        state.observer.observe(canvas);

        // ── Resize handler ──
        state.onResize = function () {
            resize();
            w = canvas.getBoundingClientRect().width;
            h = canvas.getBoundingClientRect().height;
        };
        window.addEventListener('resize', state.onResize);

        // ── Animation loop ──
        function frame(timestamp) {
            if (state.destroyed) return;
            state.rafId = requestAnimationFrame(frame);

            if (state.paused) return;

            var elapsed = (timestamp - state.startTime) * TIME_SCALE;
            var cw = canvas.getBoundingClientRect().width;
            var ch = canvas.getBoundingClientRect().height;

            // Trail effect: semi-transparent white overlay each frame
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fillRect(0, 0, cw, ch);

            // ── Energy pulse management ──
            if (!state.pulse && timestamp - state.lastPulseTime > state.pulseInterval) {
                state.pulse = createPulse(cw);
                state.lastPulseTime = timestamp;
                state.pulseInterval = 3000 + Math.random() * 2000;
            }

            if (state.pulse) {
                state.pulse.x += state.pulse.speed;
                if (state.pulse.x > cw + state.pulse.width) {
                    state.pulse = null;
                }
            }

            // ── Update and draw particles ──
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];

                // Flow field lookup
                var angle = getFlowAngle(p.x, p.y, elapsed);
                p.vx += Math.cos(angle) * 0.15;
                p.vy += Math.sin(angle) * 0.15;

                // Damping for smooth motion
                p.vx *= 0.96;
                p.vy *= 0.96;

                // Move
                p.x += p.vx * p.speed;
                p.y += p.vy * p.speed;

                // Wrap edges
                if (p.x < 0)  p.x += cw;
                if (p.x > cw) p.x -= cw;
                if (p.y < 0)  p.y += ch;
                if (p.y > ch) p.y -= ch;

                // Compute alpha — base plus optional pulse boost
                var alpha = p.baseAlpha;
                if (state.pulse) {
                    var dist = Math.abs(p.x - state.pulse.x);
                    if (dist < state.pulse.width) {
                        var proximity = 1 - dist / state.pulse.width;
                        alpha = Math.min(1, alpha * (1 + proximity * (state.pulse.boost - 1)));
                    }
                }

                // Draw particle with additive-style glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

                // Inner bright core
                ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + alpha + ')';
                ctx.fill();

                // Outer glow (larger, more transparent)
                if (p.radius > 1.5 || alpha > p.baseAlpha * 1.3) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + (alpha * 0.15) + ')';
                    ctx.fill();
                }
            }
        }

        state.rafId = requestAnimationFrame(frame);

        return state;
    }

    function destroy(state) {
        if (!state) return;
        state.destroyed = true;

        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }

        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }

        if (state.onResize) {
            window.removeEventListener('resize', state.onResize);
            state.onResize = null;
        }

        // Clear the canvas
        var ctx = state.canvas.getContext('2d');
        ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    }

    /* ───────────────────────────────────────────────────────
     * Register with AnimationManager
     * ─────────────────────────────────────────────────────── */
    if (typeof AnimationManager !== 'undefined') {
        AnimationManager.register('fluid-particles', {
            init: init,
            destroy: destroy
        });
    } else {
        console.warn('[fluid-particles] AnimationManager not found. Load animation-manager.js first.');
    }
})();
