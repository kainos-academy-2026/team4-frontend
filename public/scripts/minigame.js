(function () {
	var CELL = 20;
	var COLS = 20;
	var ROWS = 20;

	var DIR = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };

	function randomCell() {
		return {
			x: Math.floor(Math.random() * COLS),
			y: Math.floor(Math.random() * ROWS),
		};
	}

	function createGame(canvas, scoreEl) {
		var ctx = canvas.getContext("2d");
		var snake, dir, nextDir, food, score, running, frameId, lastTime, interval;

		function init() {
			snake = [
				{ x: 10, y: 10 },
				{ x: 9, y: 10 },
				{ x: 8, y: 10 },
			];
			dir = DIR.RIGHT;
			nextDir = DIR.RIGHT;
			score = 0;
			running = true;
			interval = 140;
			spawnFood();
			scoreEl.textContent = "Score: 0";
			lastTime = null;
			frameId = requestAnimationFrame(loop);
		}

		function spawnFood() {
			do {
				food = randomCell();
			} while (snake.some(function (s) { return s.x === food.x && s.y === food.y; }));
		}

		function loop(ts) {
			if (!running) return;
			frameId = requestAnimationFrame(loop);
			if (!lastTime) { lastTime = ts; }
			if (ts - lastTime < interval) return;
			lastTime = ts;
			tick();
			draw();
		}

		function tick() {
			dir = nextDir;
			var head = snake[0];
			var next = { x: head.x, y: head.y };

			if (dir === DIR.UP)    next.y -= 1;
			if (dir === DIR.DOWN)  next.y += 1;
			if (dir === DIR.LEFT)  next.x -= 1;
			if (dir === DIR.RIGHT) next.x += 1;

			if (
				next.x < 0 || next.x >= COLS ||
				next.y < 0 || next.y >= ROWS ||
				snake.some(function (s) { return s.x === next.x && s.y === next.y; })
			) {
				gameOver();
				return;
			}

			snake.unshift(next);

			if (next.x === food.x && next.y === food.y) {
				score += 10;
				scoreEl.textContent = "Score: " + score;
				interval = Math.max(60, interval - 2);
				spawnFood();
			} else {
				snake.pop();
			}
		}

		function draw() {
			ctx.fillStyle = "#0f172a";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "#1e293b";
			for (var gx = 0; gx < COLS; gx++) {
				for (var gy = 0; gy < ROWS; gy++) {
					if ((gx + gy) % 2 === 0) {
						ctx.fillRect(gx * CELL, gy * CELL, CELL, CELL);
					}
				}
			}

			snake.forEach(function (s, i) {
				var ratio = i / snake.length;
				ctx.fillStyle = i === 0
					? "#4ade80"
					: "hsl(" + (140 - ratio * 40) + ", 70%, " + (45 - ratio * 15) + "%)";
				ctx.beginPath();
				ctx.roundRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, 4);
				ctx.fill();
			});

			ctx.fillStyle = "#f97316";
			ctx.font = (CELL - 4) + "px serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("🍎", food.x * CELL + CELL / 2, food.y * CELL + CELL / 2);
		}

		function gameOver() {
			running = false;
			cancelAnimationFrame(frameId);

			ctx.fillStyle = "rgba(0,0,0,0.65)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.font = "bold 36px monospace";
			ctx.fillStyle = "#ef4444";
			ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 30);

			ctx.font = "22px monospace";
			ctx.fillStyle = "#facc15";
			ctx.fillText("Final score: " + score, canvas.width / 2, canvas.height / 2 + 10);

			ctx.font = "16px monospace";
			ctx.fillStyle = "#94a3b8";
			ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 48);
		}

		function onKey(e) {
			var map = {
				ArrowUp: DIR.UP,    w: DIR.UP,    W: DIR.UP,
				ArrowDown: DIR.DOWN, s: DIR.DOWN,  S: DIR.DOWN,
				ArrowLeft: DIR.LEFT, a: DIR.LEFT,  A: DIR.LEFT,
				ArrowRight: DIR.RIGHT, d: DIR.RIGHT, D: DIR.RIGHT,
			};
			if (e.key in map) {
				var d = map[e.key];
				var opposite = (dir + 2) % 4;
				if (d !== opposite) nextDir = d;
				e.preventDefault();
			}
			if (!running && (e.key === "r" || e.key === "R")) {
				init();
			}
		}

		return {
			start: function () { init(); },
			handleKey: onKey,
			stop: function () {
				running = false;
				cancelAnimationFrame(frameId);
			},
		};
	}

	window.launchMinigame = function () {
		var overlay = document.createElement("div");
		overlay.style.cssText =
			"position:fixed;inset:0;background:rgba(2,8,23,0.96);" +
			"display:flex;flex-direction:column;align-items:center;justify-content:center;" +
			"z-index:9999;font-family:monospace;color:#fff;gap:12px;";

		var title = document.createElement("h1");
		title.textContent = "🐍 Secret Snake";
		title.style.cssText = "color:#4ade80;margin:0;font-size:2rem;letter-spacing:2px;";

		var hint = document.createElement("p");
		hint.textContent = "You found the secret! Enjoy 🎉";
		hint.style.cssText = "color:#94a3b8;margin:0;font-size:0.9rem;";

		var scoreEl = document.createElement("p");
		scoreEl.textContent = "Score: 0";
		scoreEl.style.cssText = "color:#facc15;margin:0;font-size:1.1rem;font-weight:bold;";

		var canvas = document.createElement("canvas");
		canvas.width = COLS * CELL;
		canvas.height = ROWS * CELL;
		canvas.style.cssText = "border:2px solid #334155;border-radius:4px;";

		var controls = document.createElement("p");
		controls.textContent = "Arrow keys / WASD to move  •  R to restart  •  ESC to close";
		controls.style.cssText = "color:#475569;margin:0;font-size:0.8rem;";

		var closeBtn = document.createElement("button");
		closeBtn.textContent = "✕  Close";
		closeBtn.style.cssText =
			"padding:8px 24px;background:#1e293b;color:#94a3b8;" +
			"border:1px solid #334155;border-radius:6px;cursor:pointer;" +
			"font-size:0.95rem;font-family:monospace;";
		closeBtn.addEventListener("mouseenter", function () { closeBtn.style.background = "#334155"; });
		closeBtn.addEventListener("mouseleave", function () { closeBtn.style.background = "#1e293b"; });

		overlay.appendChild(title);
		overlay.appendChild(hint);
		overlay.appendChild(scoreEl);
		overlay.appendChild(canvas);
		overlay.appendChild(controls);
		overlay.appendChild(closeBtn);
		document.body.appendChild(overlay);

		var game = createGame(canvas, scoreEl);
		game.start();

		function onKey(e) {
			if (e.key === "Escape") { teardown(); return; }
			game.handleKey(e);
		}

		function teardown() {
			game.stop();
			document.removeEventListener("keydown", onKey);
			document.body.removeChild(overlay);
		}

		document.addEventListener("keydown", onKey);
		closeBtn.addEventListener("click", teardown);
		canvas.focus();
	};
})();
