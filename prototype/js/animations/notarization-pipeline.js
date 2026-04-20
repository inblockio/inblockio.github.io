/**
 * Notarization Pipeline Animation
 *
 * Two horizontal flow pipelines:
 *   Top:    CREATION — data enters right, gets form/eSign/timestamp applied,
 *           sealed in a box with certificates, shipped left.
 *   Bottom: VERIFICATION — box arrives left, unboxed, inspected,
 *           verified (green checkmark) or rejected (red cross, tossed).
 *
 * Registers with AnimationManager as 'notarization-pipeline'.
 */
(function () {
    'use strict';

    /* ── Icon Drawing Helpers ──────────────────────────── */

    function drawDocIcon(ctx, x, y, size, color) {
        var w = size * 0.7;
        var h = size;
        var fold = size * 0.25;
        ctx.save();
        ctx.translate(x - w / 2, y - h / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w - fold, 0);
        ctx.lineTo(w, fold);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = color || '#4a90d9';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // fold triangle
        ctx.beginPath();
        ctx.moveTo(w - fold, 0);
        ctx.lineTo(w - fold, fold);
        ctx.lineTo(w, fold);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fill();
        // lines on doc
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (var i = 0; i < 3; i++) {
            ctx.fillRect(size * 0.12, h * 0.35 + i * (h * 0.15), w * 0.6, 2);
        }
        ctx.restore();
    }

    function drawMovieIcon(ctx, x, y, size, color) {
        var w = size * 0.85;
        var h = size * 0.65;
        ctx.save();
        ctx.translate(x - w / 2, y - h / 2);
        // film body
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, 4);
        ctx.fillStyle = color || '#8e44ad';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // film perforations
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (var i = 0; i < 4; i++) {
            ctx.fillRect(w * 0.08 + i * (w * 0.23), h * 0.08, w * 0.08, h * 0.15);
            ctx.fillRect(w * 0.08 + i * (w * 0.23), h * 0.77, w * 0.08, h * 0.15);
        }
        // play triangle
        ctx.beginPath();
        ctx.moveTo(w * 0.38, h * 0.3);
        ctx.lineTo(w * 0.38, h * 0.7);
        ctx.lineTo(w * 0.68, h * 0.5);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
        ctx.restore();
    }

    function drawImageIcon(ctx, x, y, size, color) {
        var w = size * 0.8;
        var h = size * 0.7;
        ctx.save();
        ctx.translate(x - w / 2, y - h / 2);
        // frame
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, 3);
        ctx.fillStyle = color || '#27ae60';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // mountain
        ctx.beginPath();
        ctx.moveTo(w * 0.1, h * 0.8);
        ctx.lineTo(w * 0.35, h * 0.35);
        ctx.lineTo(w * 0.55, h * 0.6);
        ctx.lineTo(w * 0.65, h * 0.45);
        ctx.lineTo(w * 0.9, h * 0.8);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
        // sun
        ctx.beginPath();
        ctx.arc(w * 0.72, h * 0.28, size * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,200,0.8)';
        ctx.fill();
        ctx.restore();
    }

    function drawSpreadsheetIcon(ctx, x, y, size, color) {
        var w = size * 0.75;
        var h = size * 0.9;
        ctx.save();
        ctx.translate(x - w / 2, y - h / 2);
        // sheet body
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, 3);
        ctx.fillStyle = color || '#1e8449';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        // horizontal lines
        for (var r = 1; r <= 4; r++) {
            ctx.beginPath();
            ctx.moveTo(w * 0.1, h * (0.15 + r * 0.16));
            ctx.lineTo(w * 0.9, h * (0.15 + r * 0.16));
            ctx.stroke();
        }
        // vertical lines
        for (var c = 1; c <= 2; c++) {
            ctx.beginPath();
            ctx.moveTo(w * (0.1 + c * 0.27), h * 0.15);
            ctx.lineTo(w * (0.1 + c * 0.27), h * 0.85);
            ctx.stroke();
        }
        // header row highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(w * 0.1, h * 0.15, w * 0.8, h * 0.16);
        ctx.restore();
    }

    /* Data icon selector — cycles through types each animation cycle */
    var DATA_ICONS = [drawDocIcon, drawMovieIcon, drawImageIcon, drawSpreadsheetIcon];
    var DATA_COLORS = ['#4a90d9', '#8e44ad', '#27ae60', '#1e8449'];

    function drawDataIcon(ctx, x, y, size, cycle, overrideColor) {
        var idx = cycle % DATA_ICONS.length;
        var color = overrideColor || DATA_COLORS[idx];
        DATA_ICONS[idx](ctx, x, y, size, color);
    }

    function drawFormIcon(ctx, x, y, size) {
        var s = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        // clipboard shape
        ctx.beginPath();
        ctx.roundRect(-s, -s, s * 2, s * 2.2, 3);
        ctx.fillStyle = '#8b6914';
        ctx.fill();
        // paper
        ctx.fillStyle = '#fff';
        ctx.fillRect(-s * 0.8, -s * 0.6, s * 1.6, s * 1.8);
        // checkboxes
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 1.5;
        for (var i = 0; i < 3; i++) {
            var ly = -s * 0.35 + i * s * 0.5;
            ctx.strokeRect(-s * 0.55, ly, s * 0.3, s * 0.3);
            ctx.fillStyle = '#ccc';
            ctx.fillRect(s * -0.1, ly + s * 0.1, s * 0.8, 2);
        }
        ctx.restore();
    }

    function drawSignIcon(ctx, x, y, size) {
        var s = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        // pen body
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, s * 0.8);
        ctx.lineTo(s * 0.4, -s * 0.4);
        ctx.lineTo(s * 0.7, -s * 0.1);
        ctx.lineTo(-s * 0.5, s * 1.1);
        ctx.closePath();
        ctx.fillStyle = '#2c5aa0';
        ctx.fill();
        // pen tip
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, s * 0.8);
        ctx.lineTo(-s * 0.5, s * 1.1);
        ctx.lineTo(-s * 0.95, s * 1.15);
        ctx.closePath();
        ctx.fillStyle = '#1a3a6e';
        ctx.fill();
        // signature squiggle
        ctx.beginPath();
        ctx.moveTo(-s * 0.6, s * 0.5);
        ctx.quadraticCurveTo(-s * 0.2, s * 0.2, s * 0.1, s * 0.5);
        ctx.quadraticCurveTo(s * 0.3, s * 0.7, s * 0.6, s * 0.4);
        ctx.strokeStyle = '#2c5aa0';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }

    function drawTimestampIcon(ctx, x, y, size) {
        var r = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        // clock face
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#f0f0f0';
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
        // hour hand
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -r * 0.5);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        // minute hand
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(r * 0.35, -r * 0.35);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // center dot
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.restore();
    }

    function drawCertIcon(ctx, x, y, size) {
        var s = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        // seal circle
        ctx.beginPath();
        ctx.arc(0, -s * 0.1, s * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#d4a520';
        ctx.fill();
        ctx.strokeStyle = '#a07c10';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // star in center
        ctx.fillStyle = '#fff';
        ctx.font = (s * 0.8) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u2605', 0, -s * 0.1);
        // ribbon tails
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, s * 0.5);
        ctx.lineTo(-s * 0.4, s * 1.1);
        ctx.lineTo(-s * 0.1, s * 0.85);
        ctx.moveTo(s * 0.25, s * 0.5);
        ctx.lineTo(s * 0.4, s * 1.1);
        ctx.lineTo(s * 0.1, s * 0.85);
        ctx.strokeStyle = '#c41e1e';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    }

    function drawBox(ctx, x, y, size, open, sealColor) {
        var w = size * 1.2;
        var h = size * 0.9;
        ctx.save();
        ctx.translate(x, y);
        // box body
        ctx.beginPath();
        ctx.rect(-w / 2, -h * 0.3, w, h * 0.8);
        ctx.fillStyle = '#c49a6c';
        ctx.fill();
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // box stripe
        ctx.fillStyle = '#a07830';
        ctx.fillRect(-2, -h * 0.3, 4, h * 0.8);

        if (open) {
            // open flaps
            ctx.beginPath();
            ctx.moveTo(-w / 2, -h * 0.3);
            ctx.lineTo(-w / 2 + w * 0.15, -h * 0.7);
            ctx.lineTo(-w * 0.05, -h * 0.3);
            ctx.fillStyle = '#d4a870';
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w / 2, -h * 0.3);
            ctx.lineTo(w / 2 - w * 0.15, -h * 0.7);
            ctx.lineTo(w * 0.05, -h * 0.3);
            ctx.fill();
            ctx.stroke();
        } else {
            // closed lid
            ctx.beginPath();
            ctx.rect(-w / 2, -h * 0.45, w, h * 0.15);
            ctx.fillStyle = '#b08040';
            ctx.fill();
            ctx.stroke();
            // seal
            if (sealColor) {
                ctx.beginPath();
                ctx.arc(0, -h * 0.375, size * 0.12, 0, Math.PI * 2);
                ctx.fillStyle = sealColor;
                ctx.fill();
            }
        }
        ctx.restore();
    }

    function drawCheckmark(ctx, x, y, size) {
        var s = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fillStyle = '#27ae60';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-s * 0.45, 0);
        ctx.lineTo(-s * 0.1, s * 0.4);
        ctx.lineTo(s * 0.45, -s * 0.35);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
    }

    function drawRedCross(ctx, x, y, size) {
        var s = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, -s * 0.35);
        ctx.lineTo(s * 0.35, s * 0.35);
        ctx.moveTo(s * 0.35, -s * 0.35);
        ctx.lineTo(-s * 0.35, s * 0.35);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
    }

    function drawArrow(ctx, x1, y1, x2, y2, color) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color || '#aaa';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        // arrowhead
        var angle = Math.atan2(y2 - y1, x2 - x1);
        var headLen = 8;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = color || '#aaa';
        ctx.fill();
        ctx.restore();
    }

    function drawLabel(ctx, x, y, text, color) {
        ctx.save();
        ctx.font = '11px Satoshi, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = color || '#666';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    /* ── Pipeline Stage Definitions ───────────────────── */

    var STAGE_DURATION = 450;   // frames per full cycle
    var PAUSE_BETWEEN = 150;    // pause frames between cycles

    /* ── Easing ───────────────────────────────────────── */
    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /* ── Animation State Machine ──────────────────────── */

    function createPipelineState() {
        return {
            frame: 0,
            cycle: 0,           // alternates: 0 = valid verification, 1 = corrupt
            topPhase: 0,        // 0-1 progress through creation pipeline
            bottomPhase: 0,     // 0-1 progress through verification pipeline
            topActive: true,
            bottomActive: false,
            bottomDelay: STAGE_DURATION * 0.6  // bottom starts after top is partially done
        };
    }

    /* ── Main Draw Function ───────────────────────────── */

    function drawPipeline(ctx, w, h, state) {
        ctx.clearRect(0, 0, w, h);

        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        var iconSize = Math.min(w * 0.055, 36);
        var pipeY1 = h * 0.32;     // top pipeline Y
        var pipeY2 = h * 0.72;     // bottom pipeline Y
        var margin = w * 0.08;
        var pipeW = w - margin * 2;

        // Pipeline labels
        drawLabel(ctx, w / 2, pipeY1 - iconSize * 2.2, 'CREATION & NOTARIZATION', '#333');
        drawLabel(ctx, w / 2, pipeY2 - iconSize * 2.2, 'VERIFICATION', '#333');

        // Pipeline tracks (subtle background lines)
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(margin, pipeY1);
        ctx.lineTo(w - margin, pipeY1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(margin, pipeY2);
        ctx.lineTo(w - margin, pipeY2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Define station positions for top pipeline (right to left)
        var topStations = [
            { x: w - margin, label: '' },                          // entry
            { x: w - margin - pipeW * 0.18, label: 'Data' },      // data appears
            { x: w - margin - pipeW * 0.36, label: 'Form' },      // form template applied
            { x: w - margin - pipeW * 0.52, label: 'eSign' },     // signature
            { x: w - margin - pipeW * 0.68, label: 'Timestamp' }, // timestamp
            { x: w - margin - pipeW * 0.84, label: 'Seal' },      // certificate seal
            { x: margin, label: '' }                                // exit (shipped)
        ];

        // Draw station markers for top pipeline
        for (var i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(topStations[i].x, pipeY1, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ddd';
            ctx.fill();
            drawLabel(ctx, topStations[i].x, pipeY1 + iconSize * 1.1, topStations[i].label, '#999');
        }

        // Define station positions for bottom pipeline (left to right)
        var botStations = [
            { x: margin, label: '' },                              // entry
            { x: margin + pipeW * 0.2, label: 'Receive' },        // box arrives
            { x: margin + pipeW * 0.4, label: 'Unbox' },          // unboxing
            { x: margin + pipeW * 0.6, label: 'Inspect' },        // verification check
            { x: margin + pipeW * 0.8, label: 'Result' },         // result
            { x: w - margin, label: '' }                            // exit
        ];

        // Draw station markers for bottom pipeline
        for (var j = 1; j <= 4; j++) {
            ctx.beginPath();
            ctx.arc(botStations[j].x, pipeY2, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ddd';
            ctx.fill();
            drawLabel(ctx, botStations[j].x, pipeY2 + iconSize * 1.1, botStations[j].label, '#999');
        }

        // ── Animate top pipeline (creation) ──
        // Continuous flow: icon travels smoothly between stations.
        // Each segment = travel (60%) + dwell (40%) where badge attaches.
        // Segments: enter→data, data→form, form→sign, sign→timestamp, timestamp→seal, seal→exit
        var tp = state.topPhase;
        var cyc = state.cycle;

        if (state.topActive && tp >= 0) {
            // 7 segments total (including enter and exit)
            var segCount = 7;
            var segSize = 1.0 / segCount;
            var seg = Math.min(Math.floor(tp / segSize), segCount - 1);
            var segLocal = (tp - seg * segSize) / segSize; // 0-1 within segment

            // Continuous x position: interpolate through all stations
            // topStations: 0=entry(off-right), 1=Data, 2=Form, 3=eSign, 4=Timestamp, 5=Seal, 6=exit(off-left)
            var entryX = w + iconSize * 2;
            var exitX = -iconSize * 2;
            var stationXs = [entryX, topStations[1].x, topStations[2].x, topStations[3].x, topStations[4].x, topStations[5].x, exitX];

            // Travel takes 55% of segment, dwell takes 45% (except first/last: all travel)
            var travelRatio = (seg === 0 || seg === segCount - 1) ? 1.0 : 0.55;
            var travelT, dwellT;

            if (segLocal <= travelRatio) {
                travelT = easeInOut(segLocal / travelRatio);
                dwellT = 0;
            } else {
                travelT = 1;
                dwellT = (segLocal - travelRatio) / (1 - travelRatio);
            }

            // Current x position
            var curX = lerp(stationXs[seg], stationXs[Math.min(seg + 1, segCount - 1)], travelT);

            // Track which badges have been collected (based on which stations we've passed)
            var hasForm = seg > 1 || (seg === 1 && travelT >= 1);
            var hasSign = seg > 2 || (seg === 2 && travelT >= 1);
            var hasTimestamp = seg > 3 || (seg === 3 && travelT >= 1);
            var isBoxing = seg >= 5;

            // Badge appearance progress (fades in during dwell at its station)
            var formAppear = seg === 1 ? dwellT : (hasForm ? 1 : 0);
            var signAppear = seg === 2 ? dwellT : (hasSign ? 1 : 0);
            var tsAppear = seg === 3 ? dwellT : (hasTimestamp ? 1 : 0);

            if (isBoxing) {
                // Seal station: boxing animation
                if (seg === 5) {
                    var boxDwell = dwellT;
                    var boxOpen = boxDwell < 0.4;
                    drawBox(ctx, curX, pipeY1, iconSize, boxOpen, null);
                    if (boxDwell < 0.4) {
                        // Items sinking into box
                        var sinkT = easeInOut(boxDwell / 0.4);
                        var docY2 = lerp(pipeY1 - iconSize * 0.6, pipeY1, sinkT);
                        ctx.globalAlpha = 1 - sinkT * 0.7;
                        drawDataIcon(ctx, curX, docY2, iconSize * lerp(0.8, 0.4, sinkT), cyc);
                        ctx.globalAlpha = 1;
                    } else {
                        // Seal appears
                        ctx.globalAlpha = easeInOut((boxDwell - 0.4) / 0.6);
                        drawCertIcon(ctx, curX, pipeY1 - iconSize * 0.7, iconSize * 0.6);
                        ctx.globalAlpha = 1;
                    }
                } else {
                    // seg 6: sealed box moving to exit
                    drawBox(ctx, curX, pipeY1, iconSize, false, '#d4a520');
                    drawCertIcon(ctx, curX, pipeY1 - iconSize * 0.9, iconSize * 0.5);
                }
            } else {
                // Draw the data icon at current position
                drawDataIcon(ctx, curX, pipeY1, iconSize, cyc);

                // Draw collected badges traveling with the data icon
                if (formAppear > 0) {
                    ctx.globalAlpha = formAppear;
                    drawFormIcon(ctx, curX + iconSize * 0.55, pipeY1 - iconSize * 0.45, iconSize * 0.5);
                    ctx.globalAlpha = 1;
                }
                if (signAppear > 0) {
                    ctx.globalAlpha = signAppear;
                    drawSignIcon(ctx, curX - iconSize * 0.55, pipeY1 + iconSize * 0.35, iconSize * 0.5);
                    ctx.globalAlpha = 1;
                }
                if (tsAppear > 0) {
                    ctx.globalAlpha = tsAppear;
                    drawTimestampIcon(ctx, curX + iconSize * 0.55, pipeY1 + iconSize * 0.45, iconSize * 0.55);
                    ctx.globalAlpha = 1;
                }
            }
        }

        // ── Animate bottom pipeline (verification) ──
        // Continuous flow: box travels smoothly left→right through stations.
        // Segments: enter→receive, receive→unbox, unbox→inspect, inspect→result, result→exit
        var bp = state.bottomPhase;
        var cyc2 = state.cycle;
        var isCorrupt = state.cycle % 3 === 2;

        if (state.bottomActive && bp >= 0) {
            var bSegCount = 5;
            var bSegSize = 1.0 / bSegCount;
            var bSeg = Math.min(Math.floor(bp / bSegSize), bSegCount - 1);
            var bSegLocal = (bp - bSeg * bSegSize) / bSegSize;

            var bEntryX = -iconSize * 2;
            var bExitX = w + iconSize * 2;
            var bStationXs = [bEntryX, botStations[1].x, botStations[2].x, botStations[3].x, botStations[4].x, bExitX];

            var bTravelRatio = (bSeg === 0 || bSeg === bSegCount - 1) ? 1.0 : 0.45;
            var bTravelT, bDwellT;

            if (bSegLocal <= bTravelRatio) {
                bTravelT = easeInOut(bSegLocal / bTravelRatio);
                bDwellT = 0;
            } else {
                bTravelT = 1;
                bDwellT = (bSegLocal - bTravelRatio) / (1 - bTravelRatio);
            }

            var bCurX = lerp(bStationXs[bSeg], bStationXs[Math.min(bSeg + 1, bSegCount)], bTravelT);

            // Phase tracking
            var unboxed = bSeg > 1 || (bSeg === 1 && bTravelT >= 1);
            var inspected = bSeg > 2 || (bSeg === 2 && bTravelT >= 1);
            var resulted = bSeg > 3 || (bSeg === 3 && bTravelT >= 1);

            if (bSeg === 0) {
                // Box traveling in
                drawBox(ctx, bCurX, pipeY2, iconSize, false, '#d4a520');
            } else if (bSeg === 1) {
                // At receive station: box arrives, starts opening during dwell
                var openProgress = bDwellT;
                drawBox(ctx, bCurX, pipeY2, iconSize, openProgress > 0.5, '#d4a520');
                if (openProgress > 0.5) {
                    // Document starts rising out
                    var riseT2 = easeInOut((openProgress - 0.5) * 2);
                    var riseY2 = lerp(pipeY2 + iconSize * 0.2, pipeY2 - iconSize * 0.3, riseT2);
                    ctx.globalAlpha = riseT2;
                    drawDataIcon(ctx, bCurX, riseY2, iconSize * 0.7, cyc2, isCorrupt ? '#d9534f' : null);
                    ctx.globalAlpha = 1;
                }
            } else if (bSeg === 2) {
                // Unbox→Inspect: document traveling with scan effect during dwell
                drawDataIcon(ctx, bCurX, pipeY2, iconSize, cyc2, isCorrupt ? '#d9534f' : null);
                if (bDwellT > 0) {
                    // Scanning line effect
                    var scanY2 = pipeY2 - iconSize * 0.5 + bDwellT * iconSize;
                    ctx.save();
                    ctx.strokeStyle = isCorrupt ? 'rgba(231, 76, 60, 0.6)' : 'rgba(39, 174, 96, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(bCurX - iconSize * 0.6, scanY2);
                    ctx.lineTo(bCurX + iconSize * 0.6, scanY2);
                    ctx.stroke();
                    ctx.restore();
                    // Badges appearing around
                    if (bDwellT > 0.2) {
                        ctx.globalAlpha = easeInOut((bDwellT - 0.2) / 0.3);
                        drawFormIcon(ctx, bCurX + iconSize * 0.7, pipeY2 - iconSize * 0.3, iconSize * 0.4);
                        ctx.globalAlpha = 1;
                    }
                    if (bDwellT > 0.45) {
                        ctx.globalAlpha = easeInOut((bDwellT - 0.45) / 0.3);
                        drawSignIcon(ctx, bCurX - iconSize * 0.7, pipeY2 + iconSize * 0.3, iconSize * 0.4);
                        ctx.globalAlpha = 1;
                    }
                    if (bDwellT > 0.7) {
                        ctx.globalAlpha = easeInOut((bDwellT - 0.7) / 0.3);
                        drawTimestampIcon(ctx, bCurX + iconSize * 0.7, pipeY2 + iconSize * 0.3, iconSize * 0.4);
                        ctx.globalAlpha = 1;
                    }
                }
            } else if (bSeg === 3) {
                // Inspect→Result: show result during dwell
                drawDataIcon(ctx, bCurX, pipeY2, iconSize, cyc2, isCorrupt ? '#d9534f' : null);
                if (bDwellT > 0) {
                    var resAppear = easeInOut(bDwellT);
                    if (isCorrupt) {
                        var shake2 = Math.sin(bDwellT * Math.PI * 8) * 3 * (1 - bDwellT);
                        drawDataIcon(ctx, bCurX + shake2, pipeY2, iconSize, cyc2, '#d9534f');
                        ctx.globalAlpha = resAppear;
                        drawRedCross(ctx, bCurX + iconSize * 0.5, pipeY2 - iconSize * 0.5, iconSize);
                        ctx.globalAlpha = 1;
                    } else {
                        ctx.globalAlpha = resAppear;
                        drawCheckmark(ctx, bCurX + iconSize * 0.5, pipeY2 - iconSize * 0.5, iconSize);
                        ctx.globalAlpha = 1;
                    }
                }
            } else {
                // Exit segment
                if (isCorrupt) {
                    // Toss downward and fade
                    var tossY2 = lerp(pipeY2, pipeY2 + iconSize * 3, bTravelT);
                    var tossRot2 = bTravelT * 0.8;
                    ctx.save();
                    ctx.translate(bCurX, tossY2);
                    ctx.rotate(tossRot2);
                    ctx.globalAlpha = 1 - bTravelT;
                    drawDataIcon(ctx, 0, 0, iconSize, cyc2, '#d9534f');
                    drawRedCross(ctx, iconSize * 0.5, -iconSize * 0.5, iconSize);
                    ctx.restore();
                    ctx.globalAlpha = 1;
                } else {
                    // Slide out right with checkmark
                    drawDataIcon(ctx, bCurX, pipeY2, iconSize, cyc2);
                    drawCheckmark(ctx, bCurX + iconSize * 0.5, pipeY2 - iconSize * 0.5, iconSize);
                }
            }
        }

        // ── Direction arrows ──
        drawArrow(ctx, w - margin - 20, pipeY1 - iconSize * 1.6, margin + 20, pipeY1 - iconSize * 1.6, '#ccc');
        drawArrow(ctx, margin + 20, pipeY2 - iconSize * 1.6, w - margin - 20, pipeY2 - iconSize * 1.6, '#ccc');
    }

    /* ── Init & Animation Loop ────────────────────────── */

    function init(canvas, options) {
        var ctx = canvas.getContext('2d');
        var running = true;
        var rafId = null;
        var pState = createPipelineState();

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

            var totalFrames = STAGE_DURATION + PAUSE_BETWEEN;

            // Update top pipeline phase
            if (pState.topActive) {
                pState.topPhase = Math.min(1, pState.frame / STAGE_DURATION);
            }

            // Bottom pipeline starts after delay
            if (pState.frame > pState.bottomDelay) {
                pState.bottomActive = true;
                pState.bottomPhase = Math.min(1, (pState.frame - pState.bottomDelay) / STAGE_DURATION);
            }

            drawPipeline(ctx, w, h, pState);

            pState.frame++;

            // Reset cycle when both pipelines complete
            if (pState.frame > STAGE_DURATION + pState.bottomDelay + PAUSE_BETWEEN) {
                pState.frame = 0;
                pState.cycle++;
                pState.topPhase = 0;
                pState.bottomPhase = 0;
                pState.topActive = true;
                pState.bottomActive = false;
            }
        }

        // Pause when off-viewport
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
            // Draw a static mid-pipeline snapshot
            pState.topPhase = 0.5;
            pState.bottomActive = true;
            pState.bottomPhase = 0.5;
            drawPipeline(ctx, canvas.offsetWidth, canvas.offsetHeight, pState);
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
        AnimationManager.register('notarization-pipeline', {
            init: init,
            destroy: destroy
        });
    } else {
        console.warn('[notarization-pipeline] AnimationManager not found.');
    }
})();
