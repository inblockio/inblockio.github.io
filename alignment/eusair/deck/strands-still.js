
	(function () {
		if (window.__productHeroEchoInit) return;
		window.__productHeroEchoInit = true;

		const reducedMotion = true; // still image for the slides

		function setup(canvas) {
			const ctx = canvas.getContext('2d', { alpha: true });
			if (!ctx) return;

			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			const isMobile = window.matchMedia('(max-width: 768px)').matches;
			const ACCENT = canvas.getAttribute('data-accent') || '249,115,22';

			const CFG = {
				// background net (layer 1) — the biggest complexity lever (batched, cheap)
				webAnchors: isMobile ? 70 : 230,
				webLines: isMobile ? 200 : 760,
				webLineAlpha: 0.05,
				webDotAlpha: 0.36,
				// strands (layer 4)
				filPerStrand: isMobile ? 55 : 130,
				laneSigma: 9,
				wobbleAmp: [2, 5],   // static woven SHAPE of the fibers (not animated)
				wobbleFreq: [2.5, 6],
				swayAmp: 0,          // positional motion OFF — the architecture stands still
				swayFreq: 0.18,
				// motion = LIGHT, not position: a luminance wave sweeps along each
				// strand (fibers brighten in sequence, like light down fiber optics)
				sheenAmp: 0.45,
				sheenSpeed: 0.55,
				filAlpha: [0.03, 0.08],
				accentShare: 0.06,
				segs: 20,
				junctionJitter: 14,
				// branches (layer 3) — weave the strands into the net
				branchPerStrand: 3,
				branchFil: isMobile ? 8 : 14,
				branchSigma: 3,
				branchLen: [150, 320],
				branchAlpha: [0.02, 0.05],
				// depth bands (layer 2)
				distantFil: isMobile ? 16 : 34,
				distantSigma: 24,
				distantAlpha: 0.013,
				// pulses (layer 6)
				pulseCount: isMobile ? 9 : 22,
				pulseSpeed: [0.035, 0.075], // strand-lengths per second
				pulseCore: 1.2,
				pulseHalo: 4,
				// confirmation streaks: when a dot reaches a junction, the node
				// glints and sends a soft orange streak out along another strand
				cometSpeed: [0.16, 0.24],
				cometMax: 8,
				// hover (desktop only) — threads lean gently toward the cursor,
				// like touching a real web; they relax when the mouse leaves
				hoverRadius: 150,
				hoverPull: 0.16,
			};

			let W = 0, H = 0;
			let web = null, strands = [], branches = [], distant = [], nodes = [], pulses = [];
			let comets = [], strandNode = [], nodeStrands = [];
			let elapsed = 0, lastTime = performance.now(), isVisible = true;
			// hover state: raw target + smoothed position + eased strength (0..1)
			let mx = null, my = null, smx = 0, smy = 0, hoverS = 0;

			function gaussian() {
				let u = 0, v = 0;
				while (u === 0) u = Math.random();
				while (v === 0) v = Math.random();
				return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
			}
			const rand = (a, b) => a + Math.random() * (b - a);

			function mkFilaments(count, sigma, aLo, aHi, accentShare) {
				const arr = [];
				for (let i = 0; i < count; i++) {
					// most fibers run the whole strand; some are partial, a few stray
					const partial = Math.random() < 0.3;
					const tStart = partial ? rand(0, 0.45) : 0;
					const tEnd = partial ? Math.min(1, tStart + rand(0.35, 0.6)) : 1;
					const stray = Math.random() < 0.08;
					arr.push({
						lane: gaussian() * sigma * (stray ? rand(1.8, 2.6) : 1),
						amp: rand(CFG.wobbleAmp[0], CFG.wobbleAmp[1]),
						freq: rand(CFG.wobbleFreq[0], CFG.wobbleFreq[1]),
						phase: Math.random() * Math.PI * 2,
						phase2: Math.random() * Math.PI * 2,
						alpha: rand(aLo, aHi) * (stray ? 0.6 : 1),
						accent: Math.random() < accentShare,
						tStart, tEnd,
					});
				}
				return arr;
			}

			// quadratic bezier passing through point n at t=0.5
			function strandThrough(p0, n, p2, count, sigma, aLo, aHi, accentShare, pinch) {
				return {
					p0,
					p1: { x: 2 * n.x - (p0.x + p2.x) / 2, y: 2 * n.y - (p0.y + p2.y) / 2 },
					p2,
					pinch: pinch !== false, // fibers gather tight at the junction (t=0.5)
					swayPhase: Math.random() * Math.PI * 2,
					fil: mkFilaments(count, sigma, aLo, aHi, accentShare),
				};
			}

			function bezPoint(s, t) {
				const u = 1 - t;
				return {
					x: u * u * s.p0.x + 2 * u * t * s.p1.x + t * t * s.p2.x,
					y: u * u * s.p0.y + 2 * u * t * s.p1.y + t * t * s.p2.y,
				};
			}

			function buildScene() {
				// 1 · background net
				web = { anchors: [], lines: [] };
				// real webs cluster — mix gaussian clusters with uniform scatter
				const clusters = [
					{ x: rand(0.15, 0.4) * W, y: rand(0.2, 0.8) * H },
					{ x: rand(0.5, 0.75) * W, y: rand(0.1, 0.6) * H },
					{ x: rand(0.75, 0.98) * W, y: rand(0.4, 0.95) * H },
				];
				for (let i = 0; i < CFG.webAnchors; i++) {
					const fTier = Math.random();
					const fLo = fTier < 0.7 ? 0.08 : 0.18;
					const fHi = fTier < 0.7 ? 0.16 : 0.32;
					let bx, by;
					if (Math.random() < 0.55) {
						const c = clusters[(Math.random() * clusters.length) | 0];
						bx = c.x + gaussian() * W * 0.11;
						by = c.y + gaussian() * H * 0.16;
						bx = Math.max(0, Math.min(W, bx));
						by = Math.max(0, Math.min(H, by));
					} else {
						bx = Math.random() * W;
						by = Math.random() * H;
					}
					web.anchors.push({
						baseX: bx,
						baseY: by,
						x: 0, y: 0,
						ampX: 8 + Math.random() * 12,
						ampY: 8 + Math.random() * 12,
						freqX: fLo + Math.random() * (fHi - fLo),
						freqY: fLo + Math.random() * (fHi - fLo),
						phaseX: Math.random() * Math.PI * 2,
						phaseY: Math.random() * Math.PI * 2,
						size: 0.4 + Math.random() * 0.9,
					});
				}
				const maxDist = Math.min(W * 0.4, 460);
				const maxDist2 = maxDist * maxDist;
				let placed = 0, attempts = 0;
				while (placed < CFG.webLines && attempts < CFG.webLines * 6) {
					attempts++;
					const aIdx = Math.floor(Math.random() * CFG.webAnchors);
					let bIdx = Math.floor(Math.random() * CFG.webAnchors);
					if (aIdx === bIdx) bIdx = (bIdx + 1) % CFG.webAnchors;
					const a = web.anchors[aIdx], b = web.anchors[bIdx];
					const dx = a.baseX - b.baseX, dy = a.baseY - b.baseY;
					if (dx * dx + dy * dy > maxDist2) continue;
					web.lines.push({ a: aIdx, b: bIdx });
					placed++;
				}

				// 5 · junction nodes — glow only; the gathered fibers ARE the node
				// (free-floating speckles removed 2026-07-08: they sat on no line
				// and read as confetti against the fiber realism)
				function mkNode(fx, fy, core) {
					return { x: W * fx, y: H * fy, core, flare: 0 };
				}
				const N1 = mkNode(0.70, 0.40, 30); // main junction
				const N2 = mkNode(0.42, 0.76, 17); // lower-left satellite
				const N3 = mkNode(0.90, 0.70, 17); // lower-right satellite
				const N4 = mkNode(0.15, 0.13, 14); // upper-left, above the copy
				const N5 = mkNode(0.56, 0.20, 13); // upper-mid
				const N6 = mkNode(0.80, 0.92, 13); // lower-mid-right
				nodes = [N1, N2, N3, N4, N5, N6];

				// 4 · seven streets across the whole hero
				const J = CFG.junctionJitter;
				const jit = (n) => ({ x: n.x + rand(-J, J), y: n.y + rand(-J, J) });
				const F = CFG.filPerStrand, S = CFG.laneSigma, A0 = CFG.filAlpha[0], A1 = CFG.filAlpha[1];
				strands = [
					// main junction N1
					strandThrough({ x: W * 0.42, y: -H * 0.12 }, jit(N1), { x: W * 1.08, y: H * 0.92 }, F, S, A0, A1, CFG.accentShare),
					strandThrough({ x: W * 1.08, y: H * 0.10 }, jit(N1), { x: W * 0.34, y: H * 1.10 }, F, S, A0, A1, CFG.accentShare),
					strandThrough({ x: W * 0.98, y: -H * 0.10 }, jit(N1), { x: W * 0.52, y: H * 0.78 },
						(F * 0.55) | 0, S * 0.6, A0 * 0.8, A1 * 0.8, CFG.accentShare),
					// lower-left junction N2 — incl. the street starting behind the copy
					strandThrough({ x: -W * 0.06, y: H * 0.60 }, jit(N2), { x: W * 1.05, y: H * 0.95 },
						(F * 0.9) | 0, S * 0.85, A0, A1, CFG.accentShare),
					strandThrough({ x: W * 0.16, y: H * 1.10 }, jit(N2), { x: W * 0.70, y: -H * 0.06 },
						(F * 0.6) | 0, S * 0.55, A0 * 0.8, A1 * 0.8, CFG.accentShare),
					// lower-right junction N3
					strandThrough({ x: -W * 0.05, y: H * 0.98 }, jit(N3), { x: W * 1.08, y: H * 0.44 },
						(F * 0.5) | 0, S * 0.55, A0 * 0.75, A1 * 0.75, CFG.accentShare),
					strandThrough({ x: W * 0.66, y: -H * 0.10 }, jit(N3), { x: W * 1.02, y: H * 1.08 },
						(F * 0.6) | 0, S * 0.6, A0 * 0.8, A1 * 0.8, CFG.accentShare),
					// upper-left junction N4 — pulls the web across the left half
					strandThrough({ x: -W * 0.06, y: H * 0.42 }, jit(N4), { x: W * 0.55, y: -H * 0.12 },
						(F * 0.55) | 0, S * 0.55, A0 * 0.8, A1 * 0.8, CFG.accentShare),
					// upper-mid junction N5 — adds crossings in the top band
					strandThrough({ x: W * 0.10, y: -H * 0.08 }, jit(N5), { x: W * 1.06, y: H * 0.66 },
						(F * 0.6) | 0, S * 0.55, A0 * 0.8, A1 * 0.8, CFG.accentShare),
					strandThrough({ x: W * 0.30, y: H * 1.08 }, jit(N5), { x: W * 0.9, y: -H * 0.10 },
						(F * 0.45) | 0, S * 0.5, A0 * 0.7, A1 * 0.7, CFG.accentShare),
					// lower-mid-right junction N6
					strandThrough({ x: W * 0.28, y: H * 1.10 }, jit(N6), { x: W * 1.08, y: H * 0.22 },
						(F * 0.5) | 0, S * 0.55, A0 * 0.75, A1 * 0.75, CFG.accentShare),
					// long connector weaving N4 -> N1 -> N3 diagonal band
					strandThrough({ x: -W * 0.06, y: H * 0.22 }, jit(N1), { x: W * 1.08, y: H * 0.78 },
						(F * 0.7) | 0, S * 0.7, A0, A1, CFG.accentShare),
				];

				// which junction each street passes through (index into nodes[]) —
				// used for the confirmation events: dot arrives → node glints →
				// a streak leaves along a sibling street of the same junction
				strandNode = [0, 0, 0, 1, 1, 2, 2, 3, 4, 4, 5, 0];
				nodeStrands = nodes.map(() => []);
				strandNode.forEach((nIdx, sIdx) => { if (nodeStrands[nIdx]) nodeStrands[nIdx].push(sIdx); });
				comets = [];

				// 3 · branches
				branches = [];
				for (const s of strands) {
					for (let i = 0; i < CFG.branchPerStrand; i++) {
						const t = rand(0.18, 0.42) + (Math.random() < 0.5 ? 0.4 : 0);
						const start = bezPoint(s, Math.min(t, 0.9));
						const ang = Math.random() * Math.PI * 2;
						const len = rand(CFG.branchLen[0], CFG.branchLen[1]);
						const end = { x: start.x + Math.cos(ang) * len, y: start.y + Math.sin(ang) * len };
						const mid = { x: (start.x + end.x) / 2 + rand(-40, 40), y: (start.y + end.y) / 2 + rand(-40, 40) };
						branches.push({
							p0: start, p1: mid, p2: end,
							swayPhase: Math.random() * Math.PI * 2,
							fil: mkFilaments(CFG.branchFil, CFG.branchSigma, CFG.branchAlpha[0], CFG.branchAlpha[1], 0),
						});
					}
				}

				// 2 · depth bands
				distant = [
					strandThrough({ x: W * 0.50, y: -H * 0.05 }, { x: W * 0.85, y: H * 0.30 }, { x: W * 1.10, y: H * 0.55 },
						CFG.distantFil, CFG.distantSigma, CFG.distantAlpha * 0.7, CFG.distantAlpha * 1.3, 0, false),
					strandThrough({ x: W * 0.55, y: H * 1.08 }, { x: W * 0.88, y: H * 0.70 }, { x: W * 1.10, y: H * 0.18 },
						CFG.distantFil, CFG.distantSigma, CFG.distantAlpha * 0.7, CFG.distantAlpha * 1.3, 0, false),
				];

				// 6 · traveling pulses, spread across the streets
				pulses = [];
				for (let i = 0; i < CFG.pulseCount; i++) {
					pulses.push({
						strand: i % strands.length,
						t: Math.random(),
						speed: rand(CFG.pulseSpeed[0], CFG.pulseSpeed[1]) * (Math.random() < 0.5 ? 1 : -1),
						accent: false, // turns true (orange) at the first junction it crosses
						flash: 0,
					});
				}
			}

			function resize() {
				const rect = canvas.getBoundingClientRect();
				W = rect.width; H = rect.height;
				if (W === 0 || H === 0) return;
				canvas.width = Math.floor(W * dpr);
				canvas.height = Math.floor(H * dpr);
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
				buildScene();
			}

			function drawStrand(s, time) {
				const { p0, p1, p2 } = s;
				// (positional sway kept as a knob, default 0 — architecture is still)
				const sway = CFG.swayAmp * Math.sin(time * CFG.swayFreq + (s.swayPhase || 0));
				const sheenPhase = s.swayPhase || 0;
				for (const f of s.fil) {
					// the motion is LIGHT: a luminance wave sweeps along the bundle,
					// fibers brightening in sequence like light down fiber optics
					const tMid = ((f.tStart || 0) + (f.tEnd || 1)) / 2;
					const sheen = 1 + CFG.sheenAmp * Math.sin(tMid * 5.2 - time * CFG.sheenSpeed + sheenPhase);
					const aEff = Math.max(0.008, f.alpha * sheen);
					ctx.strokeStyle = f.accent
						? 'rgba(' + ACCENT + ',' + (aEff * 1.6).toFixed(3) + ')'
						: 'rgba(235,238,245,' + aEff.toFixed(3) + ')';
					ctx.beginPath();
					const span = f.tEnd - f.tStart;
					for (let i = 0; i <= CFG.segs; i++) {
						const t = f.tStart + (i / CFG.segs) * span;
						const u = 1 - t;
						const cx = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
						const cy = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
						let tx = 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
						let ty = 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
						const len = Math.hypot(tx, ty) || 1;
						const nx = -ty / len, ny = tx / len;
						// fibers gather tight at the junction, fan out toward the ends
						let taper = 1;
						if (s.pinch) {
							taper = 0.32 + 0.68 * Math.pow(Math.min(1, Math.abs(t - 0.5) * 2), 0.75);
						}
						// fibers merge into the bundle at their own ends (feathered edges)
						const local = (t - f.tStart) / (span || 1);
						const endMerge = Math.min(1, Math.min(local, 1 - local) / 0.15);
						const gather = taper * (0.35 + 0.65 * endMerge);
						// two-term wobble — organic, not metronome
						// static woven shape (no per-fiber time animation — no wobble)
						const A = t * f.freq * Math.PI * 2 + f.phase;
						const wob = 0.7 * Math.sin(A) + 0.3 * Math.sin(A * 0.37 + f.phase2);
						const off = (f.lane + f.amp * wob) * gather + sway * Math.sin(t * Math.PI);
						let x = cx + nx * off, y = cy + ny * off;
						// hover: threads lean toward the cursor, eased falloff
						if (hoverS > 0.01) {
							const hdx = smx - x, hdy = smy - y;
							const d2 = hdx * hdx + hdy * hdy;
							const R = CFG.hoverRadius;
							if (d2 < R * R) {
								const fall = 1 - Math.sqrt(d2) / R;
								const k = CFG.hoverPull * fall * fall * hoverS;
								x += hdx * k;
								y += hdy * k;
							}
						}
						if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
					}
					ctx.stroke();
				}
			}

			function frame(now) {
				const dt = Math.min(0.05, (now - lastTime) / 1000);
				lastTime = now;
				elapsed += dt;

				if (!isVisible) {
					setTimeout(() => requestAnimationFrame(frame), 250);
					return;
				}

				const time = reducedMotion ? 0 : elapsed;

				// ease hover strength + smooth the cursor position
				const hTarget = mx !== null && !reducedMotion ? 1 : 0;
				hoverS += (hTarget - hoverS) * Math.min(1, dt * 4);
				if (mx !== null) {
					smx += (mx - smx) * Math.min(1, dt * 8);
					smy += (my - smy) * Math.min(1, dt * 8);
				}

				ctx.clearRect(0, 0, W, H);
				ctx.globalCompositeOperation = 'lighter';
				ctx.lineWidth = 0.55;

				// 1 · background net
				for (const a of web.anchors) {
					a.x = a.baseX + (reducedMotion ? 0 : Math.sin(time * a.freqX + a.phaseX) * a.ampX);
					a.y = a.baseY + (reducedMotion ? 0 : Math.cos(time * a.freqY + a.phaseY) * a.ampY);
					if (hoverS > 0.01) {
						const hdx = smx - a.x, hdy = smy - a.y;
						const d2 = hdx * hdx + hdy * hdy;
						const R = CFG.hoverRadius;
						if (d2 < R * R) {
							const fall = 1 - Math.sqrt(d2) / R;
							const k = 0.12 * fall * fall * hoverS;
							a.x += hdx * k;
							a.y += hdy * k;
						}
					}
				}
				ctx.strokeStyle = 'rgba(255,255,255,' + CFG.webLineAlpha + ')';
				ctx.beginPath();
				for (const l of web.lines) {
					const a = web.anchors[l.a], b = web.anchors[l.b];
					ctx.moveTo(a.x, a.y);
					ctx.lineTo(b.x, b.y);
				}
				ctx.stroke();
				ctx.fillStyle = 'rgba(255,255,255,' + CFG.webDotAlpha + ')';
				for (const a of web.anchors) {
					const half = a.size * 0.5;
					ctx.fillRect(a.x - half, a.y - half, a.size, a.size);
				}

				// 2 · depth bands · 3 · branches · 4 · streets
				for (const s of distant) drawStrand(s, time * 0.5);
				for (const b of branches) drawStrand(b, time * 0.8);
				for (const s of strands) drawStrand(s, time);

				// 5 · junction nodes
				for (const n of nodes) {
					// glint on confirmation, then decay back to the calm breath
					if (n.flare > 0) n.flare = Math.max(0, n.flare - 2.2 * dt);
					const boost = 1 + n.flare * 0.8;
					const breathe = 1 + (reducedMotion ? 0 : 0.08 * Math.sin(time * 0.5 + n.x));
					const r = n.core * breathe * (1 + n.flare * 0.15);
					const isMain = n.core >= 25;
					const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.6);
					g.addColorStop(0, 'rgba(255,252,246,' + Math.min(0.5, (isMain ? 0.28 : 0.16) * boost).toFixed(3) + ')');
					g.addColorStop(0.35, 'rgba(' + ACCENT + ',' + Math.min(0.3, (isMain ? 0.10 : 0.06) * boost).toFixed(3) + ')');
					g.addColorStop(1, 'rgba(' + ACCENT + ',0)');
					ctx.fillStyle = g;
					ctx.beginPath();
					ctx.arc(n.x, n.y, r * 2.6, 0, Math.PI * 2);
					ctx.fill();
				}

				// 6 · traveling pulses — quiet white dots, constant size
				for (const p of pulses) {
					if (!reducedMotion) {
						const before = p.t;
						p.t += p.speed * dt;
						if (p.t > 1.02) p.t = -0.02;
						if (p.t < -0.02) p.t = 1.02;
						// arrival at the junction (t=0.5 by construction): the node
						// glints, and a confirmation streak leaves on a sibling street
						if ((before - 0.5) * (p.t - 0.5) < 0) {
							const nIdx = strandNode[p.strand] || 0;
							if (nodes[nIdx]) nodes[nIdx].flare = 1;
							const siblings = nodeStrands[nIdx];
							if (siblings && siblings.length > 1 && comets.length < CFG.cometMax) {
								let other = siblings[(Math.random() * siblings.length) | 0];
								if (other === p.strand) other = siblings[(siblings.indexOf(other) + 1) % siblings.length];
								comets.push({
									strand: other,
									t: 0.5,
									dir: Math.random() < 0.5 ? 1 : -1,
									speed: rand(CFG.cometSpeed[0], CFG.cometSpeed[1]),
								});
							}
						}
					}
					const pos = bezPoint(strands[p.strand], Math.min(1, Math.max(0, p.t)));
					ctx.fillStyle = 'rgba(255,250,240,0.14)';
					ctx.beginPath();
					ctx.arc(pos.x, pos.y, CFG.pulseHalo, 0, Math.PI * 2);
					ctx.fill();
					ctx.fillStyle = 'rgba(255,250,240,0.85)';
					ctx.beginPath();
					ctx.arc(pos.x, pos.y, CFG.pulseCore, 0, Math.PI * 2);
					ctx.fill();
				}

				// 6b · confirmation streaks — soft orange comets leaving the junctions
				for (let i = comets.length - 1; i >= 0; i--) {
					const c = comets[i];
					if (!reducedMotion) c.t += c.dir * c.speed * dt;
					if (c.t < -0.02 || c.t > 1.02) { comets.splice(i, 1); continue; }
					const cs = strands[c.strand];
					for (let k = 0; k < 8; k++) {
						const tt = c.t - c.dir * k * 0.014;
						if (tt < 0 || tt > 1) continue;
						const pos = bezPoint(cs, tt);
						const a = 0.45 * (1 - k / 8);
						ctx.fillStyle = 'rgba(' + ACCENT + ',' + a.toFixed(3) + ')';
						ctx.beginPath();
						ctx.arc(pos.x, pos.y, Math.max(0.8, 3.2 - k * 0.3), 0, Math.PI * 2);
						ctx.fill();
					}
				}

				ctx.globalCompositeOperation = 'source-over';

				if (!reducedMotion) requestAnimationFrame(frame);
			}

			resize();
			const ro = new ResizeObserver(() => { resize(); if (reducedMotion) frame(performance.now()); });
			ro.observe(canvas.closest('.stage') || canvas);

			const io = new IntersectionObserver(
				() => {}, // still image: always draw
				{ rootMargin: '200px' }
			);
			io.observe(canvas);

			// hover tracking on the hero section (the canvas is pointer-events-none,
			// so links and buttons above it keep working untouched)
			const host = canvas.parentElement;
			if (host && !reducedMotion) {
				host.addEventListener('mousemove', (e) => {
					const r = canvas.getBoundingClientRect();
					const cx = e.clientX - r.left, cy = e.clientY - r.top;
					if (mx === null) { smx = cx; smy = cy; }
					mx = cx; my = cy;
				});
				host.addEventListener('mouseleave', () => { mx = null; });
			}

			if (reducedMotion) {
				frame(performance.now());
			} else {
				requestAnimationFrame(frame);
			}
		}

		function initAll() {
			document.querySelectorAll('[data-product-hero-echo]').forEach(setup);
		}

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', initAll);
		} else {
			initAll();
		}
	})();
