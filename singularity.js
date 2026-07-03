/*
	singularity.js — "The Singularity" cosmic sandbox pack for Sandboxels
	--------------------------------------------------------------------
	A whole new CATEGORY ("Cosmic") that turns the sandbox into a universe.
	Every piece here acts on ALL other elements — that's the point.

	NEW ELEMENTS
	  • Black Hole   — real cellular gravity: drags in surrounding matter,
	                   devours anything at its event horizon, GROWS as it
	                   eats, merges with other black holes, leaks Hawking
	                   radiation, and evaporates in a burst when it starves.
	  • Antimatter   — annihilates on contact with ANY matter, releasing a
	                   gamma flash of plasma + radiation. Chain-reacts.
	  • Nanite       — self-replicating grey goo: converts adjacent matter
	                   into more of itself. Replication generates heat, so a
	                   runaway swarm cooks itself — melt it, annihilate it,
	                   or feed it to a black hole to stop it.
	  • Star         — a stellar core: radiates heat + light, FUSES nearby
	                   hydrogen into helium (banking fuel), and once
	                   overfed COLLAPSES — supernova → neutronium or a new
	                   black hole.
	  • Neutronium   — ultra-dense supernova remnant. Sinks through
	                   everything, immune to explosions. Only a black hole
	                   or antimatter can unmake it.

	NEW TOOLS (Cosmic category)
	  • Big Bang     — a creation event: a violent, expanding burst of
	                   primordial hydrogen + plasma. Shift-click = bigger.
	  • Gravity Well — a harmless cursor that pulls matter toward it so you
	                   can gather fuel for a star (no consumption).
	  • Supernova    — detonate a star's death on demand. Shift-click always
	                   leaves a black hole behind.

	Built against Sandboxels v1.13.2 engine internals; verified headless.
*/

(function () {
	"use strict";

	// ---- small helpers (closured; never pollute engine globals) ----
	function sgn(n) { return n > 0 ? 1 : (n < 0 ? -1 : 0); }
	function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
	// Safe read of the engine's global shift flag (may be undeclared pre-input).
	function isShift() { return (typeof shiftDown !== "undefined") && !!shiftDown; }

	// Safe pixel lookup — never throws on out-of-bounds.
	function pxAt(x, y) {
		if (outOfBounds(x, y)) { return null; }
		var col = pixelMap[x];
		return (col && col[y]) ? col[y] : null;
	}

	// Create `el` at (x,y) only if that cell is empty & in-bounds; set its temp.
	function emit(el, x, y, temp) {
		if (isEmpty(x, y)) {
			createPixel(el, x, y);
			var p = pxAt(x, y);
			if (p && temp !== undefined) { p.temp = temp; }
			return p;
		}
		return null;
	}

	// Heat every real pixel within `r` of (x,y) by `amount` (shockwave heat).
	function heatAround(x, y, r, amount) {
		var coords = circleCoords(x, y, r);
		for (var i = 0; i < coords.length; i++) {
			var p = pxAt(coords[i].x, coords[i].y);
			if (p) { p.temp += amount; }
		}
	}

	var NEI8 = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
	// Massless energy — a black hole can swallow it, but it doesn't feed it.
	var ENERGY = { fire: 1, plasma: 1, light: 1, radiation: 1, smoke: 1, heat: 1, cold: 1 };

	// Pull surrounding matter one cell toward (cx,cy). Shared by Black Hole
	// gravity and the Gravity Well tool. `owner` is skipped (don't self-pull).
	function pullToward(cx, cy, radius, base, owner) {
		var coords = circleCoords(cx, cy, radius);
		for (var i = 0; i < coords.length; i++) {
			var nx = coords[i].x, ny = coords[i].y;
			if (nx === cx && ny === cy) { continue; }
			var p = pxAt(nx, ny);
			if (!p || p === owner) { continue; }
			var info = elements[p.element];
			if (!info || info.movable === false) { continue; } // walls/stars/neutronium hold fast
			if (p.element === "black_hole") { continue; }        // holes handle each other via merge
			var dist = Math.sqrt((nx - cx) * (nx - cx) + (ny - cy) * (ny - cy));
			var strength = base * Math.max(0, (radius - dist) / radius); // stronger nearer the well
			if (Math.random() > strength) { continue; }
			var tx = nx + sgn(cx - nx);
			var ty = ny + sgn(cy - ny);
			if (tx === cx && ty === cy) { continue; } // adjacency handled by consumption
			if (outOfBounds(tx, ty)) { continue; }
			var target = pxAt(tx, ty);
			if (target === null) {
				movePixel(p, tx, ty);          // slide into vacuum
			} else if (target !== owner && target.element !== "black_hole") {
				swapPixels(p, target);         // churn the accretion disc
			}
		}
	}

	// ===================================================================
	// BLACK HOLE — the centrepiece
	// ===================================================================
	elements.black_hole = {
		color: ["#050509", "#0b0714", "#000000", "#150a24"],
		category: "cosmic",
		state: "solid",
		density: 100000000,
		hardness: 1,          // immune to explosions
		insulate: true,       // don't thermally average — it's a void
		movable: false,       // sits where placed; gravity comes from its tick
		temp: -270,
		properties: { mass: 2, fed: 0 },
		desc: "A gravitational singularity. Drags in and devours all matter, grows as it feeds, merges with other black holes, leaks Hawking radiation, and evaporates when starved.",
		tick: function (pixel) {
			if (typeof pixel.mass !== "number") { pixel.mass = 2; }
			if (typeof pixel.fed !== "number") { pixel.fed = 0; }
			var x = pixel.x, y = pixel.y;

			// Radii scale with mass but stay bounded so it never runs away.
			var ehR = Math.min(6, 1 + Math.floor(Math.sqrt(pixel.mass)));   // event horizon
			var pullR = Math.min(10, ehR + 4);                              // gravitational reach

			var ate = false;
			var coords = circleCoords(x, y, pullR);
			for (var i = 0; i < coords.length; i++) {
				var nx = coords[i].x, ny = coords[i].y;
				if (nx === x && ny === y) { continue; }
				var p = pxAt(nx, ny);
				if (!p) { continue; }

				// Merge with a smaller (or tie-broken) neighbouring black hole.
				if (p.element === "black_hole") {
					var bigger = pixel.mass > p.mass ||
						(pixel.mass === p.mass && (x < nx || (x === nx && y < ny)));
					if (bigger && Math.abs(nx - x) <= 1 && Math.abs(ny - y) <= 1) {
						pixel.mass += (p.mass || 2);
						deletePixel(nx, ny);
						ate = true;
					}
					continue;
				}

				var dist = Math.sqrt((nx - x) * (nx - x) + (ny - y) * (ny - y));
				if (dist <= ehR) {
					// Inside the event horizon: devour it. Energy (incl. its own
					// escaping Hawking radiation) is swallowed but doesn't feed it —
					// otherwise a lone hole eats its own glow and never starves.
					deletePixel(nx, ny);
					if (!ENERGY[p.element]) {
						pixel.mass += (p.element === "neutronium") ? 6 : 1;
						ate = true;
					}
				}
			}

			// Gravity on everything just outside the horizon.
			pullToward(x, y, pullR, 0.55, pixel);

			// Feeding vs. starving.
			if (ate) {
				pixel.fed = 0;
				if (Math.random() < 0.25) { emit("radiation", x + pick([-1,0,1]), y - 1, 3000); }
			} else {
				pixel.fed++;
				// Hawking radiation: a starving hole slowly bleeds mass away.
				if (pixel.fed > 40 && Math.random() < 0.3) {
					pixel.mass -= 0.5;
					var ox = x + pick([-1, 1]), oy = y + pick([-1, 1]);
					emit(pick(["radiation", "light"]), ox, oy, 2000);
					if (pixel.mass <= 1) {
						// Final evaporation: everything it ever ate blasts back out.
						explodeAt(x, y, Math.min(14, 4 + Math.floor(pixel.mass) + 6), "radiation,light,plasma");
						deletePixel(x, y);
						return;
					}
				}
			}

			// Accretion shimmer.
			if (Math.random() < 0.05) { pixel.color = pixelColorPick(pixel); }
		}
	};

	// ===================================================================
	// ANTIMATTER — annihilates everything
	// ===================================================================
	elements.antimatter = {
		color: ["#f4e9ff", "#d9b8ff", "#b98cff", "#ffffff"],
		behavior: behaviors.POWDER,   // falls & piles so it reaches matter
		category: "cosmic",
		state: "solid",
		density: 900,
		hardness: 0.1,
		temp: 20,
		desc: "Mirror-matter. On contact with ANY normal matter both are annihilated in a gamma flash of plasma and radiation. Chain-reacts spectacularly.",
		tick: function (pixel) {
			var x = pixel.x, y = pixel.y;
			for (var i = 0; i < NEI8.length; i++) {
				var nx = x + NEI8[i][0], ny = y + NEI8[i][1];
				var p = pxAt(nx, ny);
				if (!p) { continue; }
				var e = p.element;
				if (e === "antimatter" || e === "black_hole") { continue; } // stable / eaten by holes
				// ANNIHILATION.
				deletePixel(nx, ny);
				deletePixel(x, y);
				// Gamma flash: fill the void with energy and superheat the area.
				emit(pick(["plasma", "fire", "light"]), nx, ny, 60000);
				emit("radiation", x, y, 40000);
				heatAround(x, y, 2, 12000);
				if (Math.random() < 0.15) { explodeAt(x, y, 4, "plasma,fire,light"); }
				return; // one annihilation per tick → clean chain reactions
			}
		}
	};

	// ===================================================================
	// NANITE — self-replicating grey goo
	// ===================================================================
	var NANITE_SKIP = {
		nanite: 1, antimatter: 1, black_hole: 1, neutronium: 1, star: 1,
		fire: 1, plasma: 1, light: 1, radiation: 1, smoke: 1, molten_glass: 1
	};
	elements.nanite = {
		color: ["#6b7a5a", "#7f8f6a", "#5c6a4d", "#93a07d"],
		behavior: behaviors.POWDER,
		category: "cosmic",
		state: "solid",
		density: 1600,
		hardness: 0.3,
		temp: 20,
		tempHigh: 900,
		stateHigh: "molten_glass", // overheat and the swarm slags itself
		conduct: 0.4,
		desc: "Self-replicating grey goo. Converts adjacent matter into more nanites. Replication generates heat, so a runaway swarm cooks itself — melt it, annihilate it, or feed it to a black hole.",
		tick: function (pixel) {
			// Replicate into ONE random eligible neighbour per tick.
			if (Math.random() < 0.09) {
				var d = pick(NEI8);
				var nx = pixel.x + d[0], ny = pixel.y + d[1];
				var p = pxAt(nx, ny);
				if (p) {
					var info = elements[p.element];
					if (info && !NANITE_SKIP[p.element] && info.state !== "gas") {
						changePixel(p, "nanite");
						pixel.temp += 6;  // friction of assembly — the swarm self-limits
					}
				}
			}
			pixelTempCheck(pixel);
		}
	};

	// ===================================================================
	// NEUTRONIUM — ultra-dense supernova remnant
	// ===================================================================
	elements.neutronium = {
		color: ["#dff3ff", "#bfe6ff", "#ffffff", "#a9d8ff"],
		behavior: behaviors.POWDER,
		category: "cosmic",
		state: "solid",
		density: 50000000, // sinks through essentially everything
		hardness: 1,       // immune to explosions
		temp: 6000,
		conduct: 0.6,
		desc: "Degenerate neutron-star matter. Absurdly dense and effectively indestructible — only a black hole or antimatter can unmake it. It leaks a little radiation.",
		tick: function (pixel) {
			if (Math.random() < 0.01) {
				var d = pick(NEI8);
				emit("radiation", pixel.x + d[0], pixel.y + d[1], 4000);
			}
		}
	};

	// ===================================================================
	// STAR — fusion core
	// ===================================================================
	elements.star = {
		color: ["#fff4c2", "#ffd75e", "#ffb02e", "#fff8e0"],
		category: "cosmic",
		state: "solid",
		density: 30000,
		hardness: 1,
		movable: false,
		temp: 60000,
		properties: { fuel: 8 },
		desc: "A stellar core. Radiates heat and light, fuses nearby hydrogen into helium (banking fuel), and once overfed collapses — supernova into neutronium or a new black hole.",
		tick: function (pixel) {
			if (pixel.fuel === undefined) { pixel.fuel = 8; }
			var x = pixel.x, y = pixel.y;

			// Stay a furnace: never let the core cool below its floor.
			if (pixel.temp < 50000) { pixel.temp = 50000; }

			// Fuse hydrogen → helium in the immediate vicinity, banking fuel.
			var coords = circleCoords(x, y, 2);
			for (var i = 0; i < coords.length; i++) {
				var p = pxAt(coords[i].x, coords[i].y);
				if (p && p.element === "hydrogen" && Math.random() < 0.5) {
					changePixel(p, "helium");
					p.temp += 30000;
					pixel.fuel += 1;
				}
			}

			// Radiate: heat neighbours, throw the occasional solar flare.
			heatAround(x, y, 3, 400);
			if (Math.random() < 0.2) {
				var d = pick(NEI8);
				emit(pick(["light", "plasma", "fire"]), x + d[0], y + d[1], 40000);
			}

			// Collapse once overfed.
			if (pixel.fuel >= 60) {
				var R = Math.min(16, 8 + Math.floor(pixel.fuel / 12));
				explodeAt(x, y, R, "plasma,fire,radiation,light");
				if (Math.random() < 0.5) {
					changePixel(pixel, "black_hole");
					pixel.mass = Math.max(3, Math.floor(pixel.fuel / 8));
					pixel.fed = 0;
				} else {
					changePixel(pixel, "neutronium");
				}
				return;
			}

			if (Math.random() < 0.06) { pixel.color = pixelColorPick(pixel); }
		}
	};

	// ===================================================================
	// TOOLS
	// ===================================================================

	// BIG BANG — a creation event.
	elements.big_bang = {
		color: ["#ffffff", "#ffe9b0", "#ffd0ff"],
		category: "cosmic",
		canPlace: false,
		insulate: true,
		darkText: true,
		tool: function (pixel) {
			// Gate so a single brushstroke triggers ~one bang, not one per pixel.
			if (Math.random() > 0.06) { return; }
			var x = pixel.x, y = pixel.y;
			var r = isShift() ? 16 : 9;
			explodeAt(x, y, r, "plasma,fire,light");
			// Seed primordial gas so stars & structure can condense out of it.
			var coords = circleCoords(x, y, Math.floor(r * 0.7));
			for (var i = 0; i < coords.length; i++) {
				if (Math.random() < 0.45) {
					emit(pick(["hydrogen", "hydrogen", "helium", "plasma"]),
						coords[i].x, coords[i].y, 20000 + Math.random() * 40000);
				}
			}
		},
		desc: "A creation event: a violent, expanding burst of primordial hydrogen, helium and plasma. Shift-click for a bigger bang."
	};

	// GRAVITY WELL — harmless matter magnet.
	elements.gravity_well = {
		color: ["#3a2a5e", "#4b2f7a", "#2a1f45"],
		category: "cosmic",
		canPlace: false,
		insulate: true,
		tool: function (pixel) {
			if (Math.random() > 0.5) { return; } // lighten the per-pixel cost
			pullToward(pixel.x, pixel.y, isShift() ? 9 : 5, 0.9, pixel);
		},
		desc: "Pulls surrounding matter toward the cursor without destroying it — gather hydrogen to feed a star. Shift-click for a wider reach."
	};

	// SUPERNOVA — detonate on demand.
	elements.supernova = {
		color: ["#fff6d5", "#ffcaa8", "#ff8f6b"],
		category: "cosmic",
		canPlace: false,
		insulate: true,
		darkText: true,
		tool: function (pixel) {
			if (Math.random() > 0.08) { return; }
			var x = pixel.x, y = pixel.y;
			explodeAt(x, y, isShift() ? 18 : 12, "plasma,fire,radiation,light");
			deletePixel(x, y);
			// Leave a remnant at the core.
			if (isShift()) {
				createPixel("black_hole", x, y);
				var bh = pxAt(x, y);
				if (bh) { bh.mass = 5; bh.fed = 0; }
			} else if (Math.random() < 0.5) {
				createPixel("neutronium", x, y);
			}
		},
		desc: "Detonate a stellar death on demand: a shell of plasma and radiation. Shift-click always collapses the core into a black hole."
	};

})();
