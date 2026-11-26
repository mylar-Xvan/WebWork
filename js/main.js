(function highlightActiveNav() {
  var current = location.pathname.split('/').pop() || 'index.html';
  var links = document.querySelectorAll('.nav a');
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute('href') === current) {
      links[i].classList.add('active');
    }
  }
})();

var menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', function () {
    document.querySelector('.nav').classList.toggle('open');
  });
}

if ('IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('is-visible');
        observer.unobserve(entries[i].target);
      }
    }
  }, { threshold: 0.15 });

  var revealItems = document.querySelectorAll('.reveal');
  for (var j = 0; j < revealItems.length; j++) { observer.observe(revealItems[j]); }
} else {
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
}

var lightbox = document.getElementById('lightbox');
if (lightbox) {
  var lightboxImg = lightbox.querySelector('img');

  document.querySelectorAll('.gallery img').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      lightboxImg.src = thumb.src;
      lightboxImg.alt = thumb.alt;
      lightbox.classList.add('open');
    });
  });

  lightbox.addEventListener('click', function () {
    lightbox.classList.remove('open');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { lightbox.classList.remove('open'); }
  });
}

(function pendulum() {
  var target = document.querySelector('.pendulum');
  if (!target) return;

  var BASE_ANGLE = 6;
  var BASE_SPEED = 0.52;
  var BOOST_ANGLE = 26;
  var BOOST_SPEED = 2.6;
  var CLICK_WINDOW = 1000;
  var CLICKS_TO_SPIN = 5;

  var angle = 0;
  var phase = 0;
  var speed = BASE_SPEED;
  var amplitude = BASE_ANGLE;
  var boostRemaining = -1;
  var lastFrame = 0;
  var spinning = false;
  var clickTimes = [];

  function frame(now) {
    if (lastFrame === 0) lastFrame = now;
    var dt = (now - lastFrame) / 1000;
    lastFrame = now;
    if (dt > 0.1) dt = 0.1;

    if (!spinning) {
      phase += speed * dt;
      angle = amplitude * Math.sin(phase);

      if (boostRemaining > 0) {
        boostRemaining -= dt;
        if (boostRemaining <= 0.25) {
          var ratio = Math.max(boostRemaining, 0) / 0.25;
          amplitude = BASE_ANGLE + (BOOST_ANGLE - BASE_ANGLE) * ratio;
          speed = BASE_SPEED + (BASE_SPEED * BOOST_SPEED - BASE_SPEED) * ratio;
        }
        if (boostRemaining <= 0) {
          boostRemaining = -1;
          amplitude = BASE_ANGLE;
          speed = BASE_SPEED;
        }
      }

      target.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
    }

    requestAnimationFrame(frame);
  }

  target.addEventListener('click', function () {
    if (spinning) return;

    var now = performance.now();
    clickTimes.push(now);
    while (clickTimes.length > 0 && now - clickTimes[0] > CLICK_WINDOW) {
      clickTimes.shift();
    }

    if (clickTimes.length >= CLICKS_TO_SPIN) {
      clickTimes = [];
      spinning = true;
      target.classList.add('spinning');
      target.style.transform = '';

      setTimeout(function () {
        target.classList.remove('spinning');
        spinning = false;
        phase = 0;
        speed = BASE_SPEED;
        amplitude = BASE_ANGLE;
        boostRemaining = -1;
        lastFrame = 0;
      }, 1400);
      return;
    }

    speed = BASE_SPEED * BOOST_SPEED;
    amplitude = BOOST_ANGLE;

    var progress = phase % Math.PI;
    var untilEnd = Math.PI - progress;
    boostRemaining = untilEnd / speed;
  });

  requestAnimationFrame(frame);
})();

(function rocket() {
  var panel = document.getElementById('easter-egg');
  if (!panel) return;

  var rocket = panel.querySelector('.rocket');
  var subject = panel.querySelector('.subject');
  var flame = panel.querySelector('.flame');
  var hint = panel.querySelector('.hint');

  var TIMING = {
    squash: 750,
    shake: [170, 145, 120, 100, 85, 70, 55],
    ignite: 200,
    launch: 1200,
    total: 8000
  };

  var running = false;
  var timerIds = [];

  function later(fn, ms) {
    timerIds.push(setTimeout(fn, ms));
  }

  function reset() {
    for (var i = 0; i < timerIds.length; i++) {
      if (timerIds[i] !== null) clearTimeout(timerIds[i]);
    }
    timerIds = [];

    rocket.className = 'rocket';
    panel.classList.remove('away', 'busy');
    flame.style.opacity = '';
    flame.style.transform = '';
    running = false;
  }

  panel.addEventListener('click', function () {
    if (running) return;
    running = true;
    panel.classList.add('busy');
    hint.textContent = '';

    rocket.classList.add('squash');

    var elapsed = TIMING.squash;
    var shakeTotal = 0;
    for (var a = 0; a < TIMING.shake.length; a++) { shakeTotal += TIMING.shake[a]; }

    var accumulated = 0;
    for (var k = 0; k < TIMING.shake.length; k++) {
      accumulated += TIMING.shake[k];
      (function (index, offset) {
        later(function () {
          rocket.classList.remove('shake-left', 'shake-right');
          rocket.classList.add(index % 2 === 0 ? 'shake-left' : 'shake-right');
        }, elapsed + offset);
      })(k, accumulated);
    }

    elapsed = elapsed + shakeTotal;

    later(function () {
      rocket.classList.remove('shake-left', 'shake-right');
      rocket.classList.add('ignited');
      flame.style.opacity = '1';
    }, elapsed);

    later(function () {
      rocket.classList.remove('squash');
      rocket.classList.add('spring-back');
      flame.style.transform = 'translateX(-50%) scaleY(1)';
    }, elapsed + TIMING.ignite);

    later(function () {
      rocket.classList.remove('spring-back');
      rocket.classList.add('launch');
      flame.style.transform = 'translateX(-50%) scaleY(2.4)';
    }, elapsed + TIMING.ignite + 260);

    later(function () {
      panel.classList.add('away');
    }, elapsed + TIMING.ignite + 260 + TIMING.launch);

    later(function () {
      panel.classList.remove('away');
      setTimeout(function () {
        reset();
        hint.textContent = 'Click me';
      }, 600);
    }, TIMING.total);
  });
})();
