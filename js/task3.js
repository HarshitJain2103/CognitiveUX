// Task 3 - Lead Capture Form on Video

var TRIGGER_SECONDS = 6;
var STORAGE_KEY = 'lead_form_submitted';
var LEAD_VIDEO_ID = 'RJTCAL1DRro';

var leadPlayer = null;
var playSeconds = 0;
var trackingTimer = null;
var formShown = false;

// chain onto existing youtube API callback from task2
(function () {
  var existing = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (existing) existing();
    initLeadPlayer();
  };
})();

function loadYTAPI() {
  if (document.getElementById('yt-iframe-api-script')) return;
  var tag = document.createElement('script');
  tag.id = 'yt-iframe-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

function initLeadPlayer() {
  var container = document.getElementById('yt-lead-player');
  if (!container) return;

  var vars = { rel: 0, modestbranding: 1, enablejsapi: 1 };
  var proto = window.location.protocol;
  if (proto === 'http:' || proto === 'https:') vars.origin = window.location.origin;

  leadPlayer = new YT.Player('yt-lead-player', {
    videoId: LEAD_VIDEO_ID,
    playerVars: vars,
    events: {
      onStateChange: function (e) {
        if (e.data === YT.PlayerState.PLAYING) {
          startTracking();
        } else {
          stopTracking();
        }
      },
      onError: function () {
        var el = document.querySelector('.lead-video-embed');
        if (el) {
          el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#111;border-radius:16px;color:#999;text-align:center;padding:32px;">' +
            '<p>Video unavailable. <a href="https://www.youtube.com/watch?v=' + LEAD_VIDEO_ID + '" target="_blank" style="color:#facc15;">Watch on YouTube</a></p></div>';
        }
        stopTracking();
      }
    }
  });
}

function startTracking() {
  if (trackingTimer) return;
  trackingTimer = setInterval(function () {
    playSeconds++;
    var countEl = document.getElementById('lead-timer-count');
    if (countEl) countEl.textContent = Math.max(0, TRIGGER_SECONDS - playSeconds);

    if (playSeconds >= TRIGGER_SECONDS && !formShown) {
      showLeadForm();
    }
  }, 1000);
}

function stopTracking() {
  if (trackingTimer) {
    clearInterval(trackingTimer);
    trackingTimer = null;
  }
}

function showLeadForm() {
  formShown = true;
  stopTracking();

  if (sessionStorage.getItem(STORAGE_KEY)) return;

  if (leadPlayer && leadPlayer.pauseVideo) leadPlayer.pauseVideo();

  var overlay = document.getElementById('lead-form-overlay');
  if (overlay) {
    overlay.classList.add('visible');
    var firstInput = overlay.querySelector('input');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 50);
  }
}

function hideLeadForm() {
  var overlay = document.getElementById('lead-form-overlay');
  if (overlay) overlay.classList.remove('visible');
}

function resumeVideo() {
  hideLeadForm();
  if (leadPlayer && leadPlayer.playVideo) leadPlayer.playVideo();
  startTracking();
}

// simple validation
function validateField(input, type) {
  var val = input.value.trim();
  var errorEl = input.parentElement.querySelector('.lead-form-error-msg');
  var error = null;

  if (type === 'name') {
    if (!val) error = 'Full name is required.';
    else if (val.length < 2) error = 'Please enter your full name.';
  } else if (type === 'email') {
    if (!val) error = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) error = 'Enter a valid email.';
  } else if (type === 'phone') {
    if (!val) error = 'Phone number is required.';
    else if (!/^(\+\d{1,3})?\d{10}$/.test(val.replace(/[\s-]/g, ''))) error = 'Enter a valid 10-digit phone.';
  }

  if (error) {
    input.classList.add('error');
    if (errorEl) { errorEl.textContent = error; errorEl.classList.add('visible'); }
    return false;
  } else {
    input.classList.remove('error');
    if (errorEl) errorEl.classList.remove('visible');
    return true;
  }
}

function validateForm(form) {
  var nameOk = validateField(form.querySelector('#lead-name'), 'name');
  var emailOk = validateField(form.querySelector('#lead-email'), 'email');
  var phoneOk = validateField(form.querySelector('#lead-phone'), 'phone');
  return nameOk && emailOk && phoneOk;
}

async function submitForm(form, btn) {
  if (!validateForm(form)) return;

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    // simulate API call
    await new Promise(function (resolve) { setTimeout(resolve, 600); });

    sessionStorage.setItem(STORAGE_KEY, '1');
    form.style.display = 'none';
    var success = document.getElementById('lead-form-success');
    if (success) success.classList.add('visible');
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Submit';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('lead-form-overlay');
  var form = document.getElementById('lead-capture-form');
  var submitBtn = document.getElementById('lead-submit-btn');
  var dismissBtn = document.getElementById('lead-dismiss-btn');
  var resumeBtn = document.getElementById('lead-resume-btn');

  if (!overlay || !form) return;

  if (dismissBtn) {
    dismissBtn.addEventListener('click', function () {
      sessionStorage.setItem(STORAGE_KEY, 'dismissed');
      resumeVideo();
    });
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', resumeVideo);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function () { submitForm(form, submitBtn); });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitForm(form, submitBtn);
    });
  }

  // clear errors on input
  var fields = [
    { id: 'lead-name', type: 'name' },
    { id: 'lead-email', type: 'email' },
    { id: 'lead-phone', type: 'phone' }
  ];
  for (var i = 0; i < fields.length; i++) {
    var input = document.getElementById(fields[i].id);
    var type = fields[i].type;
    if (input) {
      input.addEventListener('blur', (function (inp, t) {
        return function () { validateField(inp, t); };
      })(input, type));
      input.addEventListener('input', (function (inp) {
        return function () {
          inp.classList.remove('error');
          var errEl = inp.parentElement.querySelector('.lead-form-error-msg');
          if (errEl) errEl.classList.remove('visible');
        };
      })(input));
    }
  }

  loadYTAPI();
});
