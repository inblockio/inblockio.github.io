/**
 * Multi-Agent Pipeline Animation
 *
 * Visualizes the Theodora / Best-Cookies example from the Aqua Protocol whitepaper:
 *   - Left: Theodora (user) + Symphonie (her agent)
 *   - Right: Best-Cookies Inc. + Brandon (their agent)
 *   - Center: Documents flow between agents sequentially
 *   - Bottom: Each party runs a verification pipeline on received artifacts
 *
 * Flow:
 *   1. Theodora → Symphonie: User Intent (signed)
 *   2. Symphonie → Brandon: Intent artifact sent
 *   3. Brandon → Best-Cookies API: Fetch offers
 *   4. Brandon → Symphonie: Offer artifact (signed by Best-Cookies)
 *   5. Symphonie → Brandon: Order artifact (references offer by hash-link)
 *   6. Brandon → Symphonie: Confirmation + Invoice (hash-chained)
 *
 * Each artifact is shown with signing layers and hash-chain links.
 * Below each party: mini verification pipeline validates received artifacts.
 *
 * Registers with AnimationManager as 'multi-agent-pipeline'.
 */
(function () {
    'use strict';

    /* ── Colors ───────────────────────────────────────── */
    var COLORS = {
        theodora: '#6c5ce7',
        symphonie: '#a29bfe',
        bestCookies: '#e17055',
        brandon: '#fab1a0',
        artifact: '#4a90d9',
        signed: '#27ae60',
        hashLink: '#f39c12',
        bg: '#ffffff',
        text: '#2d3436',
        textLight: '#636e72',
        line: '#dfe6e9',
        verified: '#27ae60',
        failed: '#e74c3c'
    };

    /* ── Drawing Helpers ──────────────────────────────── */

    function drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
    }

    function drawAgent(ctx, x, y, name, subName, color, size) {
        var r = size * 0.4;
        // Agent circle
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Icon inside (person or robot)
        ctx.fillStyle = '#fff';
        ctx.font = (r * 0.9) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (subName) {
            ctx.fillText('\u2699', x, y); // gear for agent
        } else {
            ctx.fillText('\u263A', x, y); // smile for human
        }
        // Name below
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold ' + (size * 0.22) + 'px Satoshi, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(name, x, y + r + 6);
        if (subName) {
            ctx.fillStyle = COLORS.textLight;
            ctx.font = (size * 0.17) + 'px Satoshi, sans-serif';
            ctx.fillText(subName, x, y + r + 6 + size * 0.24);
        }
    }

    function drawArtifact(ctx, x, y, label, color, size, chainIcon) {
        var w = size * 2.2;
        var h = size * 0.7;
        ctx.save();
        ctx.translate(x - w / 2, y - h / 2);
        // Document shape
        drawRoundedRect(ctx, 0, 0, w, h, 4);
        ctx.fillStyle = color || COLORS.artifact;
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color || COLORS.artifact;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Label
        ctx.fillStyle = COLORS.text;
        ctx.font = (size * 0.22) + 'px Satoshi, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, w / 2, h / 2);
        // Chain link icon
        if (chainIcon) {
            ctx.fillStyle = COLORS.hashLink;
            ctx.font = (size * 0.2) + 'px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('\u26D3', w - 4, h / 2); // chain link
        }
        ctx.restore();
    }

    function drawSignatureBadge(ctx, x, y, layer, size) {
        var r = size * 0.13;
        var colors = {
            user: '#6c5ce7',
            agent: '#2d98da',
            workflow: '#27ae60'
        };
        var icons = {
            user: '\u270D',    // writing hand
            agent: '\u2699',   // gear
            workflow: '\u2713'  // checkmark
        };
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors[layer] || '#999';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = (r * 1.1) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icons[layer] || '?', x, y);
    }

    function drawVerificationMini(ctx, x, y, progress, valid, size) {
        // Mini pipeline showing verification steps
        var w = size * 2.5;
        var h = size * 0.5;
        ctx.save();
        ctx.translate(x - w / 2, y);

        // Background track
        drawRoundedRect(ctx, 0, 0, w, h, 3);
        ctx.fillStyle = '#f8f9fa';
        ctx.fill();
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Progress bar
        var barW = w * Math.min(progress, 1) * 0.9;
        if (barW > 0) {
            drawRoundedRect(ctx, w * 0.05, h * 0.2, barW, h * 0.6, 2);
            ctx.fillStyle = valid ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)';
            ctx.fill();
        }

        // Verification steps as dots
        var steps = 3;
        for (var i = 0; i < steps; i++) {
            var sx = w * (0.2 + i * 0.3);
            var stepProgress = (progress * steps) - i;
            ctx.beginPath();
            ctx.arc(sx, h / 2, size * 0.07, 0, Math.PI * 2);
            if (stepProgress >= 1) {
                ctx.fillStyle = valid ? COLORS.verified : COLORS.failed;
            } else if (stepProgress > 0) {
                ctx.fillStyle = '#f39c12'; // in-progress
            } else {
                ctx.fillStyle = '#ddd';
            }
            ctx.fill();
        }

        // Label
        if (progress >= 1) {
            ctx.fillStyle = valid ? COLORS.verified : COLORS.failed;
            ctx.font = 'bold ' + (size * 0.16) + 'px Satoshi, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(valid ? '\u2713 Verified' : '\u2717 Failed', w / 2, h + 3);
        }

        ctx.restore();
    }

    function drawHashChain(ctx, x1, y1, x2, y2, progress) {
        if (progress <= 0) return;
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = COLORS.hashLink;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = progress;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        var cpx = (x1 + x2) / 2;
        var cpy = Math.min(y1, y2) - 15;
        ctx.quadraticCurveTo(cpx, cpy, x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    /* ── Easing ───────────────────────────────────────── */
    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /* ── Animation Phases ─────────────────────────────── */
    /*
     * Sequential flow: each step = travel + verify. Next step only begins
     * after verification of previous step completes.
     *
     * 5 artifacts, each with: travel (35%) + verify (65%) of its slot.
     * Verification is shown NEXT TO the artifact at its destination:
     *   - Intent & Order go left→right → verification on RIGHT side of artifact
     *   - Offer, Confirmation, Invoice go right→left → verification on LEFT side
     */

    var TOTAL_FRAMES = 2025;
    var PAUSE_FRAMES = 360;

    /* ── Step Descriptions ────────────────────────────── */
    var STEP_DESCRIPTIONS = [
        'Theodora signs her purchase intent through Symphonie',
        'Brandon retrieves offerings, returns signed artifact',
        'Symphonie creates order referencing the offer by hash-link',
        'Brandon processes order, confirms against API',
        'Invoice links to confirmation, hash-chained to predecessors'
    ];

    /* ── Main Draw ────────────────────────────────────── */

    function drawScene(ctx, w, h, state) {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, w, h);

        var size = Math.min(w * 0.1, 64);
        var phase = state.phase;

        // Layout positions — wider margins for breathing room
        var leftX = w * 0.15;    // Theodora/Symphonie column
        var rightX = w * 0.85;   // Best-Cookies/Brandon column
        var centerX = w * 0.5;
        var topY = h * 0.07;
        var agentY = h * 0.16;
        var flowStartY = h * 0.30; // first artifact row
        var flowSpacing = h * 0.13; // vertical spacing between artifact rows

        // ── Draw organizational headers ──
        ctx.fillStyle = COLORS.textLight;
        ctx.font = (size * 0.22) + 'px Satoshi, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CUSTOMER', leftX, topY - size * 0.3);
        ctx.fillText('MERCHANT', rightX, topY - size * 0.3);

        // ── Draw agents ──
        drawAgent(ctx, leftX - size * 1.0, agentY, 'Theodora', null, COLORS.theodora, size);
        drawAgent(ctx, leftX + size * 1.0, agentY, 'Symphonie', 'Agent', COLORS.symphonie, size);
        drawAgent(ctx, rightX - size * 1.0, agentY, 'Brandon', 'Agent', COLORS.brandon, size);
        drawAgent(ctx, rightX + size * 1.0, agentY, 'Best-Cookies', 'API', COLORS.bestCookies, size);

        // ── Connection lines between user and agent ──
        ctx.save();
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX - size * 0.3, agentY);
        ctx.lineTo(leftX + size * 0.3, agentY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightX - size * 0.3, agentY);
        ctx.lineTo(rightX + size * 0.3, agentY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // ── Artifact definitions ──
        var artifacts = [
            { label: 'Intent', from: 'left', color: COLORS.theodora },
            { label: 'Offer', from: 'right', color: COLORS.bestCookies },
            { label: 'Order', from: 'left', color: COLORS.theodora },
            { label: 'Confirmation', from: 'right', color: COLORS.bestCookies },
            { label: 'Invoice', from: 'right', color: COLORS.bestCookies }
        ];

        var numArtifacts = artifacts.length;
        var slotSize = 0.90 / numArtifacts;
        var travelFrac = 0.30;
        var verifyFrac = 0.70;

        // Artifact travel endpoints — centered in the flow zone
        var fromLeftX = leftX + size * 0.8;
        var fromRightX = rightX - size * 0.8;
        // Artifacts land in center area
        var landLeftX = centerX - size * 0.3;   // artifacts from right land left-of-center
        var landRightX = centerX + size * 0.3;  // artifacts from left land right-of-center

        for (var i = 0; i < numArtifacts; i++) {
            var art = artifacts[i];
            var slotStart = i * slotSize;
            var slotProgress = Math.max(0, Math.min(1, (phase - slotStart) / slotSize));

            if (slotProgress <= 0) continue;

            var artY = flowStartY + i * flowSpacing;
            var fromX = art.from === 'left' ? fromLeftX : fromRightX;
            var toX = art.from === 'left' ? landRightX : landLeftX;

            // Travel sub-phase
            var travelProgress = Math.min(1, slotProgress / travelFrac);
            var travelT = easeInOut(travelProgress);
            var curX = lerp(fromX, toX, travelT);

            // Draw artifact at current position
            ctx.globalAlpha = Math.min(1, slotProgress * 5);
            drawArtifact(ctx, curX, artY, art.label, art.color, size, i > 0);
            ctx.globalAlpha = 1;

            // After arrival: show signature badges + verification + description
            if (travelProgress >= 1) {
                var postArrival = (slotProgress - travelFrac) / verifyFrac;

                // Signature badges above artifact
                var badgeBaseX = toX;
                var badgeY = artY - size * 0.5;

                if (postArrival > 0.02) {
                    ctx.globalAlpha = easeInOut(Math.min(1, (postArrival - 0.02) * 5));
                    drawSignatureBadge(ctx, badgeBaseX - size * 0.3, badgeY, 'user', size);
                    ctx.globalAlpha = 1;
                }
                if (postArrival > 0.06) {
                    ctx.globalAlpha = easeInOut(Math.min(1, (postArrival - 0.06) * 5));
                    drawSignatureBadge(ctx, badgeBaseX, badgeY, 'agent', size);
                    ctx.globalAlpha = 1;
                }
                if (postArrival > 0.10) {
                    ctx.globalAlpha = easeInOut(Math.min(1, (postArrival - 0.10) * 5));
                    drawSignatureBadge(ctx, badgeBaseX + size * 0.3, badgeY, 'workflow', size);
                    ctx.globalAlpha = 1;
                }

                // ── Verification animation — slight overlap only ──
                // Intent & Order (from left) → verification on RIGHT side
                // Offer, Confirmation, Invoice (from right) → verification on LEFT side
                var verifyStart = 0.15;
                if (postArrival > verifyStart) {
                    var verifyProgress = Math.min(1, (postArrival - verifyStart) / (1 - verifyStart));
                    var verifyX;
                    if (art.from === 'left') {
                        verifyX = toX + size * 2.0;
                    } else {
                        verifyX = toX - size * 2.0;
                    }
                    drawVerificationMini(ctx, verifyX, artY - size * 0.25, verifyProgress, true, size);
                }

                // ── Step description fades in below artifact ──
                if (postArrival > 0.05) {
                    var descAlpha = easeInOut(Math.min(1, (postArrival - 0.05) * 3));
                    ctx.globalAlpha = descAlpha;
                    ctx.fillStyle = COLORS.textLight;
                    ctx.font = (size * 0.18) + 'px Satoshi, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(STEP_DESCRIPTIONS[i], centerX, artY + size * 0.45);
                    ctx.globalAlpha = 1;
                }
            }

            // Hash-chain links to previous artifact
            if (i > 0 && travelProgress >= 1) {
                var prevArt = artifacts[i - 1];
                var prevSlotProgress = Math.max(0, Math.min(1, (phase - (i - 1) * slotSize) / slotSize));
                if (prevSlotProgress >= travelFrac) {
                    var prevToX = prevArt.from === 'left' ? landRightX : landLeftX;
                    var prevY = flowStartY + (i - 1) * flowSpacing;
                    var chainAlpha = easeInOut(Math.min(1, (slotProgress - travelFrac) / 0.1));
                    drawHashChain(ctx, prevToX, prevY + size * 0.3, toX, artY - size * 0.3, chainAlpha);
                }
            }
        }

        // ── Final state: complete chain summary ──
        if (phase > 0.92) {
            var summaryAlpha = easeInOut((phase - 0.92) / 0.08);
            ctx.globalAlpha = summaryAlpha;
            ctx.fillStyle = COLORS.verified;
            ctx.font = 'bold ' + (size * 0.24) + 'px Satoshi, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('\u2713 Complete Transaction Record \u2014 Independently Verifiable by Both Parties', centerX, h * 0.94);
            ctx.globalAlpha = 1;
        }

        // ── Legend (always visible) ──
        var legY = h * 0.97;
        ctx.fillStyle = COLORS.textLight;
        ctx.font = (size * 0.17) + 'px Satoshi, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Signatures:  \u270D User (P-256)   \u2699 Agent (Ed25519)   \u2713 Workflow (Ed25519)   \u26D3 Hash-chain link', centerX, legY);
    }

    /* ── Init ─────────────────────────────────────────── */

    function init(canvas, options) {
        var ctx = canvas.getContext('2d');
        var running = true;
        var rafId = null;
        var state = { frame: 0, phase: 0, cycle: 0 };

        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function animate() {
            if (!running) return;
            rafId = requestAnimationFrame(animate);

            var w = canvas.offsetWidth;
            var h = canvas.offsetHeight;

            state.phase = Math.min(1, state.frame / TOTAL_FRAMES);
            drawScene(ctx, w, h, state);

            state.frame++;
            if (state.frame > TOTAL_FRAMES + PAUSE_FRAMES) {
                state.frame = 0;
                state.cycle++;
            }
        }

        // Pause off-viewport
        var paused = false;
        var observer = null;
        if (typeof IntersectionObserver !== 'undefined') {
            observer = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    if (paused) { paused = false; running = true; animate(); }
                } else {
                    paused = true;
                    running = false;
                    if (rafId) cancelAnimationFrame(rafId);
                }
            }, { threshold: 0.05 });
            observer.observe(canvas);
        }

        // Reduced motion
        var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motionQuery.matches) {
            resize();
            state.phase = 1;
            drawScene(ctx, canvas.offsetWidth, canvas.offsetHeight, state);
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
    }

    function destroy(state) {
        if (!state) return;
        if (state.stop) state.stop();
        if (state.observer) state.observer.disconnect();
        window.removeEventListener('resize', state.resize);
    }

    /* ── Register ─────────────────────────────────────── */
    if (typeof AnimationManager !== 'undefined') {
        AnimationManager.register('multi-agent-pipeline', {
            init: init,
            destroy: destroy
        });
    } else {
        console.warn('[multi-agent-pipeline] AnimationManager not found.');
    }
})();
