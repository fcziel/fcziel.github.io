(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], shooters = [], balls = [], dballs = [];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 2500);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        size:    Math.pow(Math.random(), 2) * 3 + 0.3,
        speedX:  -(Math.random() * 0.5 + 0.08),
        speedY:  (Math.random() - 0.5) * 0.12,
        opacity: Math.random() * 0.85 + 0.15,
        phase:   Math.random() * Math.PI * 2,
        freq:    Math.random() * 2 + 0.8,
        gold:    Math.random() < 0.15
      });
    }
  }

  function spawnShooter() {
    const angle = (Math.PI / 5) + (Math.random() - 0.5) * 0.4;
    shooters.push({
      x:       Math.random() * canvas.width * 0.7,
      y:       Math.random() * canvas.height * 0.4,
      vx:      Math.cos(angle) * (10 + Math.random() * 8),
      vy:      Math.sin(angle) * (10 + Math.random() * 8),
      len:     120 + Math.random() * 100,
      life:    1,
      width:   1 + Math.random() * 1.5
    });
  }

  function drawShooter(s) {
    const tx = s.x - s.vx / Math.hypot(s.vx, s.vy) * s.len;
    const ty = s.y - s.vy / Math.hypot(s.vx, s.vy) * s.len;
    const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.7, `rgba(255,250,220,${s.life * 0.6})`);
    g.addColorStop(1, `rgba(255,255,255,${s.life})`);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = g;
    ctx.lineWidth = s.width;
    ctx.stroke();
    // head glow
    const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.width * 5);
    hg.addColorStop(0, `rgba(255,250,200,${s.life})`);
    hg.addColorStop(1, 'rgba(255,250,200,0)');
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.width * 5, 0, Math.PI * 2);
    ctx.fillStyle = hg;
    ctx.fill();
  }

  // サッカーボール：画面端から端へゆっくり流れる
  function spawnBall() {
    const fromLeft = Math.random() < 0.5;
    balls.push({
      x:        fromLeft ? -30 : canvas.width + 30,
      y:        canvas.height * 0.12 + Math.random() * canvas.height * 0.55,
      vx:       (fromLeft ? 1 : -1) * (2.2 + Math.random() * 1.4),
      vy:       (Math.random() - 0.5) * 1.0,
      size:     9 + Math.random() * 5,
      rot:      0,
      rotSpeed: (fromLeft ? 1 : -1) * (0.09 + Math.random() * 0.05)
    });
  }

  function drawPentagon(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawBall(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot);

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 2);
    glow.addColorStop(0, 'rgba(255,255,255,0.22)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(0, 0, b.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = glow; ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, b.size, 0, Math.PI * 2);
    ctx.fillStyle = '#f4f4ef';
    ctx.fill();
    ctx.lineWidth = Math.max(1, b.size * 0.09);
    ctx.strokeStyle = '#14161c';
    ctx.stroke();

    ctx.fillStyle = '#14161c';
    drawPentagon(0, 0, b.size * 0.36);
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
      drawPentagon(Math.cos(a) * b.size * 0.72, Math.sin(a) * b.size * 0.72, b.size * 0.22);
    }
    ctx.restore();
  }

  // ドラゴンボール風の星入り玉：たまに流れる遊び要素
  function spawnDBall() {
    const fromLeft = Math.random() < 0.5;
    dballs.push({
      x:        fromLeft ? -34 : canvas.width + 34,
      y:        canvas.height * 0.1 + Math.random() * canvas.height * 0.6,
      vx:       (fromLeft ? 1 : -1) * (1.6 + Math.random() * 1.0),
      vy:       (Math.random() - 0.5) * 0.6,
      size:     11 + Math.random() * 5,
      rot:      0,
      rotSpeed: (fromLeft ? 1 : -1) * (0.05 + Math.random() * 0.03),
      stars:    1 + Math.floor(Math.random() * 7)
    });
  }

  function drawStarMark(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const xo = cx + Math.cos(a) * r, yo = cy + Math.sin(a) * r;
      const a2 = a + Math.PI / 5;
      const xi = cx + Math.cos(a2) * r * 0.42, yi = cy + Math.sin(a2) * r * 0.42;
      if (i === 0) ctx.moveTo(xo, yo); else ctx.lineTo(xo, yo);
      ctx.lineTo(xi, yi);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawDBall(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, d.size * 2.2);
    glow.addColorStop(0, 'rgba(255,180,40,0.3)');
    glow.addColorStop(1, 'rgba(255,180,40,0)');
    ctx.beginPath(); ctx.arc(0, 0, d.size * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = glow; ctx.fill();

    const body = ctx.createRadialGradient(-d.size * 0.3, -d.size * 0.3, d.size * 0.1, 0, 0, d.size);
    body.addColorStop(0, '#ffcf6b');
    body.addColorStop(1, '#f5a324');
    ctx.beginPath();
    ctx.arc(0, 0, d.size, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.lineWidth = Math.max(1, d.size * 0.07);
    ctx.strokeStyle = '#c97a12';
    ctx.stroke();

    ctx.fillStyle = '#d1341f';
    const rows = d.stars <= 4 ? 1 : 2;
    const perRow = Math.ceil(d.stars / rows);
    let n = 0;
    for (let r = 0; r < rows && n < d.stars; r++) {
      const rowCount = Math.min(perRow, d.stars - n);
      for (let c = 0; c < rowCount; c++, n++) {
        const ox = (c - (rowCount - 1) / 2) * d.size * 0.42;
        const oy = (r - (rows - 1) / 2) * d.size * 0.42;
        drawStarMark(ox, oy, d.size * 0.16);
      }
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() / 1000;

    stars.forEach(s => {
      const a = s.opacity * (0.55 + 0.45 * Math.sin(t * s.freq + s.phase));
      // glow for bigger stars
      if (s.size > 1.2) {
        const r = s.size * 4;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
        const c = s.gold ? `212,160,26` : `255,255,255`;
        grd.addColorStop(0, `rgba(${c},${a * 0.5})`);
        grd.addColorStop(1, `rgba(${c},0)`);
        ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.gold ? `rgba(212,160,26,${a})` : `rgba(255,255,255,${a})`;
      ctx.fill();

      s.x += s.speedX;
      s.y += s.speedY;
      if (s.x < -4) { s.x = canvas.width + 4; s.y = Math.random() * canvas.height; }
      if (s.y < -4) s.y = canvas.height + 4;
      if (s.y > canvas.height + 4) s.y = -4;
    });

    shooters = shooters.filter(s => s.life > 0.02);
    shooters.forEach(s => {
      drawShooter(s);
      s.x += s.vx; s.y += s.vy;
      s.life -= 0.022;
    });

    balls = balls.filter(b => b.x > -60 && b.x < canvas.width + 60);
    balls.forEach(b => {
      drawBall(b);
      b.x += b.vx; b.y += b.vy; b.rot += b.rotSpeed;
    });

    dballs = dballs.filter(d => d.x > -70 && d.x < canvas.width + 70);
    dballs.forEach(d => {
      drawDBall(d);
      d.x += d.vx; d.y += d.vy; d.rot += d.rotSpeed;
    });

    requestAnimationFrame(draw);
  }

  // 流れ星：2〜4秒ごとにランダム発射
  function scheduleShooter() {
    spawnShooter();
    if (Math.random() < 0.35) setTimeout(spawnShooter, 180);
    setTimeout(scheduleShooter, 2000 + Math.random() * 2500);
  }
  setTimeout(scheduleShooter, 1200);

  // サッカーボール：5秒に1回くらい流れる
  function scheduleBall() {
    spawnBall();
    setTimeout(scheduleBall, 4500 + Math.random() * 1000);
  }
  setTimeout(scheduleBall, 2500);

  // ドラゴンボール風の玉：10秒に1回くらい流れる遊び要素
  function scheduleDBall() {
    spawnDBall();
    setTimeout(scheduleDBall, 9000 + Math.random() * 2000);
  }
  setTimeout(scheduleDBall, 6000);

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
