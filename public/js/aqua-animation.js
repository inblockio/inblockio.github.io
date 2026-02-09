/**
 * Aqua Chain Animation
 * Configurable animation showing streaming data tree structures.
 *
 * Usage:
 *   aquaAnimation(canvasId, { reverse: false, laneCount: 5 });
 *
 * Options:
 *   reverse      - if true, chains spawn left and drift right (default: false)
 *   laneCount    - number of vertical lanes (default: 5)
 *   invertSpeed  - if true, top lanes are fastest, bottom slowest (default: false)
 */
function aquaAnimation(canvasId, opts) {
    opts = opts || {};
    var REVERSE = !!opts.reverse;
    var LANE_COUNT = opts.laneCount || 5;
    var INVERT_SPEED = !!opts.invertSpeed;

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var parent = canvas.parentElement;

    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    window.addEventListener('resize', function() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    });

    // Node type colors
    var COLORS = {
        genesis:   [220, 40, 40],
        revision:  [239, 84, 1],
        signature: [40, 180, 80],
        witness:   [50, 130, 220]
    };

    var DRIFT_MIN = 0.5;       // slowest lane drift speed (px/frame)
    var DRIFT_MAX = 1.0;       // fastest lane drift speed (px/frame)
    var SPAWN_INTERVAL = 50;   // frames between spawning new chains
    var MAX_CHAINS = 20;       // max simultaneous chains on screen
    var MAX_NODES = 10;        // max nodes per chain before it stops growing
    var NODE_R = 4;            // node circle radius in px
    var LANE_HEIGHT = 0;       // vertical space per lane (computed on init)
    var BRANCH_TYPES = ['revision', 'signature', 'witness']; // fork node types
    var MAX_PER_LANE = 3;      // max chains sharing one lane
    var MIN_LANE_GAP = 250;    // min horizontal px between chains in same lane
    var MAX_LINKS_PER_PAIR = 4;  // max cross-links between any two chains
    var FLASH_DURATION = 30;     // frames a new cross-link stays highlighted

    var chains = [];           // active chain objects
    var crossLinks = [];       // links between different chains
    var frameCount = 0;        // animation frame counter
    var lanes = [];            // vertical lanes to prevent overlap

    // Opacity: 0 at center, full at edges
    function posAlpha(x) {
        var cx = canvas.width / 2;
        var half = canvas.width / 2;
        var dist = Math.abs(x - cx);
        var fade = dist / (half * 0.6) - 0.25;
        if (fade < 0) fade = 0;
        if (fade > 1) fade = 1;
        return fade * 0.75;
    }

    function rand(a, b) { return a + Math.random() * (b - a); }
    function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
    function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

    // Set up vertical lanes so chains don't overlap
    function initLanes() {
        var count = LANE_COUNT;
        LANE_HEIGHT = canvas.height / count;
        lanes = [];
        for (var i = 0; i < count; i++) {
            // Speed gradient: normally top=slow, bottom=fast; invertSpeed flips it
            var t = (count > 1) ? i / (count - 1) : 0;
            var speed = INVERT_SPEED
                ? DRIFT_MIN + (1 - t) * (DRIFT_MAX - DRIFT_MIN)
                : DRIFT_MIN + t * (DRIFT_MAX - DRIFT_MIN);
            lanes.push({ y: LANE_HEIGHT * (i + 0.5), occupants: [], drift: speed });
        }
    }

    // Get the edge X of a chain (rightmost normally, leftmost in reverse)
    function chainEdgeX(c) {
        var ex = REVERSE ? Infinity : -Infinity;
        for (var i = 0; i < c.nodes.length; i++) {
            if (REVERSE) {
                if (c.nodes[i].x < ex) ex = c.nodes[i].x;
            } else {
                if (c.nodes[i].x > ex) ex = c.nodes[i].x;
            }
        }
        return ex;
    }

    function getFreeLane() {
        var free = [];
        for (var i = 0; i < lanes.length; i++) {
            var lane = lanes[i];
            if (lane.occupants.length === 0) {
                free.push(lane);
            } else if (lane.occupants.length < MAX_PER_LANE) {
                var hasRoom = true;
                for (var j = 0; j < lane.occupants.length; j++) {
                    var edge = chainEdgeX(lane.occupants[j]);
                    if (REVERSE) {
                        // New chain spawns at -40, need gap before leftmost existing
                        if (edge < -40 + MIN_LANE_GAP) { hasRoom = false; break; }
                    } else {
                        if (edge > canvas.width + 40 - MIN_LANE_GAP) { hasRoom = false; break; }
                    }
                }
                if (hasRoom) free.push(lane);
            }
        }
        if (free.length === 0) return null;
        return pick(free);
    }

    function spawnChain() {
        var lane = getFreeLane();
        if (!lane) return;

        var startX = REVERSE ? -40 : canvas.width + 40;
        var yOffset = (lane.occupants.length % 2 === 0) ? -LANE_HEIGHT * 0.12 : LANE_HEIGHT * 0.12;
        var centerY = lane.y + yOffset;
        var yBand = LANE_HEIGHT * 0.45;
        var forkStep = yBand / 3;
        var nodeStep = rand(24, 36);
        var chain = { nodes: [], edges: [], lane: lane, branches: [] };

        // Genesis node
        var genesis = { x: startX, y: centerY, type: 'genesis', lineY: centerY };
        chain.nodes.push(genesis);

        var mainBranch = { tip: genesis, lineY: centerY };
        chain.branches.push(mainBranch);

        // Build initial tree
        var steps = randInt(2, 4);
        var stepDir = REVERSE ? -1 : 1; // nodes extend in opposite direction of drift
        for (var i = 0; i < steps; i++) {
            if (chain.nodes.length >= MAX_NODES) break;
            var branchCount = chain.branches.length;
            for (var b = 0; b < branchCount; b++) {
                if (chain.nodes.length >= MAX_NODES) break;
                var br = chain.branches[b];
                var type = pick(BRANCH_TYPES);
                var child = {
                    x: br.tip.x + stepDir * nodeStep,
                    y: br.lineY,
                    type: type,
                    lineY: br.lineY
                };
                chain.nodes.push(child);
                chain.edges.push({ from: br.tip, to: child });
                br.tip = child;
            }

            if (chain.nodes.length < MAX_NODES && Math.random() < 0.3 && chain.branches.length < 4) {
                var srcBranch = pick(chain.branches);
                var dir = (Math.random() < 0.5) ? -1 : 1;
                var newLineY = srcBranch.lineY + dir * forkStep;
                if (newLineY < centerY - yBand) newLineY = centerY - yBand;
                if (newLineY > centerY + yBand) newLineY = centerY + yBand;
                var taken = false;
                for (var b2 = 0; b2 < chain.branches.length; b2++) {
                    if (Math.abs(chain.branches[b2].lineY - newLineY) < forkStep * 0.5) { taken = true; break; }
                }
                if (!taken) {
                    var forkType = pick(BRANCH_TYPES);
                    var forkNode = {
                        x: srcBranch.tip.x + stepDir * nodeStep,
                        y: newLineY,
                        type: forkType,
                        lineY: newLineY
                    };
                    chain.nodes.push(forkNode);
                    chain.edges.push({ from: srcBranch.tip, to: forkNode });
                    chain.branches.push({ tip: forkNode, lineY: newLineY });
                }
            }
        }

        lane.occupants.push(chain);
        chains.push(chain);
        addCrossLinks(chain);
    }

    function pickTargetNode(sourceNode, otherChain) {
        var weights = [];
        var totalWeight = 0;
        for (var i = 0; i < otherChain.nodes.length; i++) {
            var n = otherChain.nodes[i];
            var yDist = Math.abs(n.y - sourceNode.y);
            var proximity = 1 / (1 + yDist / 40);
            var w = proximity * (n.type === 'genesis' ? 5 : 1);
            weights.push(w);
            totalWeight += w;
        }
        var r = Math.random() * totalWeight;
        var acc = 0;
        for (var i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (r <= acc) return otherChain.nodes[i];
        }
        return otherChain.nodes[otherChain.nodes.length - 1];
    }

    function chainAvgX(c) {
        if (c.nodes.length === 0) return 0;
        var sum = 0;
        for (var i = 0; i < c.nodes.length; i++) sum += c.nodes[i].x;
        return sum / c.nodes.length;
    }

    function countLinksBetween(a, b) {
        var count = 0;
        for (var i = 0; i < crossLinks.length; i++) {
            var l = crossLinks[i];
            var fromInA = a.nodes.indexOf(l.from) !== -1;
            var toInB = b.nodes.indexOf(l.to) !== -1;
            var fromInB = b.nodes.indexOf(l.from) !== -1;
            var toInA = a.nodes.indexOf(l.to) !== -1;
            if ((fromInA && toInB) || (fromInB && toInA)) count++;
        }
        return count;
    }

    function addCrossLinks(chain) {
        var chainX = chainAvgX(chain);
        var others = [];
        for (var i = 0; i < chains.length - 1; i++) {
            var dist = Math.abs(chains[i].lane.y - chain.lane.y);
            others.push({ chain: chains[i], dist: dist });
        }
        others.sort(function(a, b) { return a.dist - b.dist; });

        for (var i = 0; i < others.length; i++) {
            var other = others[i].chain;
            if (other.nodes.length === 0) continue;
            if (countLinksBetween(chain, other) >= MAX_LINKS_PER_PAIR) continue;
            var chance = 1.0 / (1 + i * 0.3);
            var otherX = chainAvgX(other);
            // Favor linking in the growth direction (rightward normally, leftward in reverse)
            if (REVERSE) {
                if (otherX < chainX) { chance *= 3; } else { chance *= 0.15; }
            } else {
                if (otherX > chainX) { chance *= 3; } else { chance *= 0.15; }
            }
            if (Math.random() < chance) {
                var fromNode = pick(chain.nodes);
                var toNode = pickTargetNode(fromNode, other);
                crossLinks.push({ from: fromNode, to: toNode, birth: frameCount });
            }
        }
    }

    function growChain(chain) {
        if (chain.nodes.length >= MAX_NODES || !chain.branches || chain.branches.length === 0) return;
        var br = pick(chain.branches);
        var remaining = MAX_NODES - chain.nodes.length;
        var witnessChance = (remaining <= 1) ? 1.0 : (remaining <= 3) ? 0.6 : 0.15;
        var type = (Math.random() < witnessChance) ? 'witness' : pick(BRANCH_TYPES);
        var stepDir = REVERSE ? -1 : 1;
        var child = {
            x: br.tip.x + stepDir * rand(24, 36),
            y: br.lineY,
            type: type,
            lineY: br.lineY
        };
        chain.nodes.push(child);
        chain.edges.push({ from: br.tip, to: child });
        br.tip = child;

        if (Math.random() < 0.85 && chains.length > 1) {
            var myX = chainAvgX(chain);
            var bestChain = null, bestScore = -Infinity;
            for (var k = 0; k < chains.length; k++) {
                if (chains[k] === chain) continue;
                if (chains[k].nodes.length === 0) continue;
                if (countLinksBetween(chain, chains[k]) >= MAX_LINKS_PER_PAIR) continue;
                var d = Math.abs(chains[k].lane.y - chain.lane.y);
                var proximity = 1 / (1 + d / 40);
                var otherAvgX = chainAvgX(chains[k]);
                var dirBonus;
                if (REVERSE) {
                    dirBonus = (otherAvgX < myX) ? 3 : 0.15;
                } else {
                    dirBonus = (otherAvgX > myX) ? 3 : 0.15;
                }
                var score = proximity * dirBonus;
                if (score > bestScore) { bestScore = score; bestChain = chains[k]; }
            }
            if (bestChain) {
                crossLinks.push({ from: child, to: pickTargetNode(child, bestChain), birth: frameCount });
            }
        }
    }

    function drawNode(n) {
        var a = posAlpha(n.x);
        if (a < 0.01) return;
        var c = COLORS[n.type];
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, NODE_R, 0, Math.PI * 2);
        ctx.fill();
        if (n.type === 'genesis' && a > 0.15) {
            ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.15) + ')';
            ctx.beginPath();
            ctx.arc(n.x, n.y, NODE_R * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawEdge(from, to) {
        var a = Math.min(posAlpha(from.x), posAlpha(to.x));
        if (a < 0.01) return;
        ctx.strokeStyle = 'rgba(100,160,180,' + (a * 0.6) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    }

    function drawCrossLink(link) {
        var a = Math.min(posAlpha(link.from.x), posAlpha(link.to.x));
        if (a < 0.01) return;
        var age = frameCount - (link.birth || 0);
        var flash = (age < FLASH_DURATION) ? 1 - (age / FLASH_DURATION) : 0;
        if (flash > 0) {
            var glowAlpha = a * flash * 0.8;
            ctx.strokeStyle = 'rgba(255,255,255,' + glowAlpha + ')';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(link.from.x, link.from.y);
            ctx.lineTo(link.to.x, link.to.y);
            ctx.stroke();
        }
        var baseAlpha = a * (0.35 + flash * 0.4);
        ctx.strokeStyle = 'rgba(150,150,200,' + baseAlpha + ')';
        ctx.lineWidth = 0.7 + flash * 1.3;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.moveTo(link.from.x, link.from.y);
        ctx.lineTo(link.to.x, link.to.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frameCount++;

        if (frameCount % SPAWN_INTERVAL === 0 && chains.length < MAX_CHAINS) {
            spawnChain();
        }

        if (frameCount % 70 === 35 && chains.length > 0) {
            growChain(pick(chains));
        }

        // Drift all nodes
        for (var i = 0; i < chains.length; i++) {
            var speed = chains[i].lane.drift;
            for (var j = 0; j < chains[i].nodes.length; j++) {
                if (REVERSE) {
                    chains[i].nodes[j].x += speed;
                } else {
                    chains[i].nodes[j].x -= speed;
                }
            }
        }

        // Remove chains that exited the screen
        chains = chains.filter(function(chain) {
            var shouldRemove;
            if (REVERSE) {
                var minX = Infinity;
                for (var j = 0; j < chain.nodes.length; j++) {
                    if (chain.nodes[j].x < minX) minX = chain.nodes[j].x;
                }
                shouldRemove = minX > canvas.width + 80;
            } else {
                var maxX = -Infinity;
                for (var j = 0; j < chain.nodes.length; j++) {
                    if (chain.nodes[j].x > maxX) maxX = chain.nodes[j].x;
                }
                shouldRemove = maxX < -80;
            }
            if (shouldRemove) {
                var idx = chain.lane.occupants.indexOf(chain);
                if (idx !== -1) chain.lane.occupants.splice(idx, 1);
                return false;
            }
            return true;
        });

        // Clean up stale cross-links
        crossLinks = crossLinks.filter(function(link) {
            if (REVERSE) {
                return link.from.x < canvas.width + 80 && link.to.x < canvas.width + 80;
            }
            return link.from.x > -80 && link.to.x > -80;
        });

        for (var i = 0; i < crossLinks.length; i++) {
            drawCrossLink(crossLinks[i]);
        }

        for (var i = 0; i < chains.length; i++) {
            var chain = chains[i];
            for (var j = 0; j < chain.edges.length; j++) {
                drawEdge(chain.edges[j].from, chain.edges[j].to);
            }
            for (var j = 0; j < chain.nodes.length; j++) {
                drawNode(chain.nodes[j]);
            }
        }

        requestAnimationFrame(animate);
    }

    // Seed initial chains spread across the screen
    initLanes();
    var seedCount = Math.min(12, lanes.length);
    for (var i = 0; i < seedCount; i++) {
        spawnChain();
        var chain = chains[chains.length - 1];
        if (chain) {
            var shiftX = (seedCount - i) * (canvas.width / (seedCount + 1));
            for (var j = 0; j < chain.nodes.length; j++) {
                if (REVERSE) {
                    chain.nodes[j].x += shiftX;
                } else {
                    chain.nodes[j].x -= shiftX;
                }
            }
        }
    }

    animate();
}
