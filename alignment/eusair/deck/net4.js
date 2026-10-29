// Still drawing for slide 4: fine connection lines between systems that run on
// to the edge of the picture, on the faint thread background of the inblock.io
// product-page headers. Deterministic, no animation.
// The canvas is drawn at the size it is actually shown, so thin lines stay solid
// instead of breaking up when the slide is scaled down.
(function () {
	var W = 1920, H = 1080;

	function rng(seed) {
		return function () {
			seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
			var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function extend(a, b) {
		var dx = b[0] - a[0], dy = b[1] - a[1], ts = [];
		if (dx) { ts.push((0 - a[0]) / dx, (W - a[0]) / dx); }
		if (dy) { ts.push((0 - a[1]) / dy, (H - a[1]) / dy); }
		var lo = -Infinity, hi = Infinity;
		ts.forEach(function (t) { if (t < 0) lo = Math.max(lo, t); else if (t > 1) hi = Math.min(hi, t); });
		return [[a[0] + dx * lo, a[1] + dy * lo], [a[0] + dx * hi, a[1] + dy * hi]];
	}

	function mask(ctx, stops, x0, y0, x1, y1) {
		ctx.globalCompositeOperation = 'destination-in';
		var g = ctx.createLinearGradient(x0, y0, x1, y1);
		stops.forEach(function (s) { g.addColorStop(s[0], 'rgba(0,0,0,' + s[1] + ')'); });
		ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
		ctx.globalCompositeOperation = 'source-over';
	}

	function draw(canvas) {
		var shown = canvas.getBoundingClientRect().width || W;
		var scale = (shown / W) * (window.devicePixelRatio || 1);
		var px = 1 / scale; // one device pixel, in slide units
		canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
		var ctx = canvas.getContext('2d');
		ctx.setTransform(scale, 0, 0, scale, 0, 0);
		ctx.clearRect(0, 0, W, H);
		ctx.lineCap = 'round';
		var rand = rng(11);
		var nodes = JSON.parse(canvas.getAttribute('data-nodes'));
		var edges = JSON.parse(canvas.getAttribute('data-edges'));

		// layer 1: background threads and long line extensions, faded away from
		// the text (left), the headline (top) and the audience row (bottom)
		var off = document.createElement('canvas');
		off.width = canvas.width; off.height = canvas.height;
		var o = off.getContext('2d');
		o.setTransform(scale, 0, 0, scale, 0, 0);
		o.lineCap = 'round';
		for (var i = 0; i < 26; i++) {
			var x1 = 760 + rand() * 1300, y1 = -40, x2 = x1 - 500 + rand() * 1000, y2 = 1120;
			if (rand() < 0.5) { y1 = -40 + rand() * 1160; x1 = 1960; x2 = 700 + rand() * 600; y2 = -40 + rand() * 1160; }
			o.strokeStyle = 'rgba(255,255,255,' + (0.05 + rand() * 0.04) + ')';
			o.lineWidth = Math.max(1, px);
			o.beginPath(); o.moveTo(x1, y1); o.lineTo(x2, y2); o.stroke();
		}
		for (i = 0; i < 140; i++) {
			o.fillStyle = 'rgba(255,255,255,' + (0.14 + rand() * 0.22) + ')';
			o.beginPath(); o.arc(760 + rand() * 1160, rand() * 1080, Math.max(0.9, px), 0, Math.PI * 2); o.fill();
		}
		edges.forEach(function (e) {
			var a = nodes[e[0]], b = nodes[e[1]], ends = extend(a, b);
			o.strokeStyle = 'rgba(255,255,255,0.34)';
			o.lineWidth = Math.max(1.4, 1.2 * px);
			o.beginPath(); o.moveTo(ends[0][0], ends[0][1]); o.lineTo(ends[1][0], ends[1][1]); o.stroke();
		});
		mask(o, [[0, 0], [1, 1]], 640, 0, 900, 0);
		mask(o, [[0, 0], [0.35, 0], [0.62, 1], [0.9, 1], [1, 0]], 0, 0, 0, 1000);
		ctx.drawImage(off, 0, 0, W, H);

		// layer 2: the connections themselves, solid between the systems
		var mids = [];
		edges.forEach(function (e) {
			var a = nodes[e[0]], b = nodes[e[1]];
			ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 6;
			ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
			ctx.strokeStyle = 'rgba(255,255,255,0.68)'; ctx.lineWidth = Math.max(1.8, 1.4 * px);
			ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
			mids.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
		});

		// evidence points at each handover
		mids.forEach(function (m) {
			var x = m[0], y = m[1];
			var g = ctx.createRadialGradient(x, y, 0, x, y, 40);
			g.addColorStop(0, 'rgba(249,115,22,0.55)');
			g.addColorStop(0.35, 'rgba(249,115,22,0.16)');
			g.addColorStop(1, 'rgba(249,115,22,0)');
			ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
			ctx.strokeStyle = 'rgba(255,178,127,0.6)'; ctx.lineWidth = Math.max(1.2, px);
			ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
			ctx.fillStyle = '#FFB27F'; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
		});
	}

	document.querySelectorAll('canvas[data-net4]').forEach(function (canvas) {
		draw(canvas);
		var last = 0;
		new ResizeObserver(function () {
			var w = Math.round(canvas.getBoundingClientRect().width);
			if (w && w !== last) { last = w; draw(canvas); }
		}).observe(canvas.closest('.stage') || canvas);
	});
})();
