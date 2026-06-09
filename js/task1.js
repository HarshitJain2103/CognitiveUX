// Task 1 - Coverflow Carousel

var slideWidth = 340;
var slideOffset = 315;
var depthOffset = 100;
var rotateAngle = 28;
var sideScale = 0.85;
var autoPlayMs = 3000;

var SLIDES = [
  {
    className: 'slide--1',
    html: '<p>Get</p><h3>Activation Voucher</h3><p>with <br>Flat ₹1,200/- off.</p>' +
      '<div class="slide-logo"><div class="logo-ixigo"><span>ixigo</span></div></div>'
  },
  {
    className: 'slide--2',
    html: '<p>Get</p><h3>Activation Voucher</h3><p>with up to<br>₹1,500/- off*.</p>' +
      '<div class="slide-logo"><div class="logo-reliance">' +
      '<div class="logo-reliance__icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fff" opacity="0.2"/><path d="M8 8h8v2H8zM8 11h5v2H8zM8 14h8v2H8z" fill="#fff"/></svg></div>' +
      '<div class="logo-reliance__text">Reliance<br>Digital</div></div></div>'
  },
  {
    className: 'slide--3',
    html: '<h3>Enjoy Benefits</h3><p>worth up to <br>₹500/- off* <br>on your tickets.</p>' +
      '<div class="slide-logo"><div class="logo-bms">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="rgba(255,255,255,0.2)"/><path d="M6 6h12v2H6zM6 10h8v2H6zM6 14h12v2H6z" fill="white"/></svg>' +
      '<span>BookMyShow</span></div></div><em>*available on selected cards</em>'
  },
  {
    className: 'slide--4',
    html: '<p>Avail</p><h3>Apple Offer</h3><p>with up to<br>₹7,000/- off</p>' +
      '<div class="slide-logo"><div class="logo-apple">' +
      '<svg viewBox="0 0 814 1000" fill="#ffffff"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.8-155.5-127.4C46 391 33.3 240.1 33.3 230.1c0-154.7 101.8-237 199.5-237 77.8 0 119.9 40.8 179 40.8 57.8 0 108.3-43 187.8-43 30.3 0 137.4 2.5 209.5 93.4zm-156.3-71.8c31.7-38.4 54.7-91.9 54.7-145.4 0-7.7-.6-15.4-1.9-21.7-51.9 1.9-113.5 34.5-149.7 79.2-28.5 32.6-55.1 86.1-55.1 140.3 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.3 1.3 13.4 1.3 46.7 0 105.7-31 136.7-73z"/></svg>' +
      '<span class="logo-apple__text">Apple</span></div></div>'
  }
];

var activeIndex = 0;
var isAnimating = false;
var dragStartX = 0;
var isDragging = false;
var autoTimer = null;
var track, slides, dots, prevBtn, nextBtn;

function buildCarousel(rootEl) {
  var container = document.createElement('div');
  container.className = 'coverflow-container';

  track = document.createElement('div');
  track.className = 'coverflow-track';

  slides = [];
  for (var i = 0; i < SLIDES.length; i++) {
    var slide = document.createElement('div');
    slide.className = 'coverflow-slide';
    slide.dataset.index = i;

    var inner = document.createElement('div');
    inner.className = 'slide ' + SLIDES[i].className;
    inner.innerHTML = SLIDES[i].html;
    slide.appendChild(inner);
    slides.push(slide);
    track.appendChild(slide);
  }

  prevBtn = makeArrowBtn('prev');
  nextBtn = makeArrowBtn('next');

  container.appendChild(prevBtn);
  container.appendChild(track);
  container.appendChild(nextBtn);

  // dots
  var pagination = document.createElement('div');
  pagination.className = 'coverflow-pagination';

  dots = [];
  for (var j = 0; j < SLIDES.length; j++) {
    var dot = document.createElement('button');
    dot.className = 'coverflow-dot' + (j === 0 ? ' active' : '');
    dot.dataset.index = j;
    dot.addEventListener('click', function () {
      goTo(parseInt(this.dataset.index));
    });
    dots.push(dot);
    pagination.appendChild(dot);
  }

  rootEl.appendChild(container);
  rootEl.appendChild(pagination);
}

function makeArrowBtn(dir) {
  var btn = document.createElement('button');
  btn.className = 'coverflow-btn coverflow-btn--' + dir;
  btn.type = 'button';

  var points = dir === 'next' ? '9 18 15 12 9 6' : '15 18 9 12 15 6';
  btn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="' + points + '"></polyline></svg>';

  btn.addEventListener('click', function () {
    goTo(activeIndex + (dir === 'next' ? 1 : -1));
  });
  return btn;
}

function applyTransforms() {
  for (var i = 0; i < slides.length; i++) {
    var diff = i - activeIndex;
    var absDiff = Math.abs(diff);
    var sign = diff > 0 ? 1 : -1;

    var tx, tz, ry, op, z, sc;

    if (diff === 0) {
      tx = 0; tz = 0; ry = 0;
      op = 1; z = 10; sc = 1;
    } else if (absDiff === 1) {
      tx = sign * slideOffset;
      tz = -depthOffset;
      ry = sign * rotateAngle;
      op = 0.85; z = 5; sc = sideScale;
    } else {
      tx = sign * (slideOffset + 100 * (absDiff - 1));
      tz = -depthOffset * 2 * absDiff;
      ry = sign * rotateAngle * 1.5;
      op = 0; z = 0;
      sc = sideScale * 0.8;
    }

    slides[i].style.transform = 'translate3d(' + tx + 'px, 0, ' + tz + 'px) rotateY(' + ry + 'deg) scale(' + sc + ')';
    slides[i].style.opacity = op;
    slides[i].style.zIndex = z;
  }
}

function updateDots() {
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('active', i === activeIndex);
  }
}

function goTo(target) {
  if (isAnimating) return;

  var idx = target;
  if (idx < 0) idx = SLIDES.length - 1;
  if (idx >= SLIDES.length) idx = 0;
  if (idx === activeIndex) return;

  isAnimating = true;
  activeIndex = idx;
  applyTransforms();
  updateDots();

  setTimeout(function () { isAnimating = false; }, 700);
}

function startAutoPlay() {
  stopAutoPlay();
  autoTimer = setInterval(function () {
    goTo(activeIndex + 1);
  }, autoPlayMs);
}

function stopAutoPlay() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var section = document.getElementById('exclusive-privileges');
  if (!section) return;

  buildCarousel(section);
  applyTransforms();
  updateDots();

  // drag/swipe
  track.addEventListener('mousedown', function (e) {
    e.preventDefault();
    dragStartX = e.clientX;
    isDragging = true;
  });
  document.addEventListener('mouseup', function (e) {
    if (!isDragging) return;
    isDragging = false;
    var delta = dragStartX - e.clientX;
    if (Math.abs(delta) > 50) {
      goTo(activeIndex + (delta > 0 ? 1 : -1));
    }
  });

  track.addEventListener('touchstart', function (e) {
    dragStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var delta = dragStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      goTo(activeIndex + (delta > 0 ? 1 : -1));
    }
  });

  // keyboard
  section.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
    if (e.key === 'ArrowRight') goTo(activeIndex + 1);
  });

  // auto-play with pause on hover
  startAutoPlay();
  var container = section.querySelector('.coverflow-container');
  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);
});
