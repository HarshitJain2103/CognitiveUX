// Task 2 - Video Chapters Carousel

var VIDEO_DATA = [
  {
    videoId: 'RJTCAL1DRro',
    title: 'Inside a Google Data Center',
    chapters: [
      { time: 0, label: 'Introduction' },
      { time: 30, label: 'What is a Data Center?' },
      { time: 75, label: 'Physical Infrastructure' },
      { time: 130, label: 'Cooling Systems' },
      { time: 185, label: 'Power Management' },
      { time: 240, label: 'Security & Access Control' },
      { time: 290, label: 'Network Architecture' },
      { time: 340, label: 'Scale & Sustainability' }
    ]
  },
  {
    videoId: 'jj_aUFX8SV8',
    title: 'Machine Learning Zero to Hero',
    chapters: [
      { time: 0, label: 'Course Overview' },
      { time: 45, label: 'What is Machine Learning?' },
      { time: 120, label: 'Types of ML: Supervised' },
      { time: 200, label: 'Types of ML: Unsupervised' },
      { time: 270, label: 'Setting Up Python Environment' },
      { time: 350, label: 'First ML Model' },
      { time: 430, label: 'Training & Validation' },
      { time: 510, label: 'Results & Next Steps' }
    ]
  },
  {
    videoId: 'xmmxkmVSiq0',
    title: 'The Art of Code',
    chapters: [
      { time: 0, label: 'Opening & Intro' },
      { time: 60, label: 'Code as Creative Expression' },
      { time: 150, label: "Conway's Game of Life" },
      { time: 250, label: 'Quines — Self-Replicating Code' },
      { time: 360, label: 'Infinite Regress & Fractals' },
      { time: 460, label: 'Music Through Code' },
      { time: 560, label: 'Language Design' },
      { time: 650, label: 'Closing Thoughts' }
    ]
  }
];

var YT_API_KEY = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.YOUTUBE_API_KEY) || '';
var currentSlide = 0;
var players = {};
var chapterTimers = {};

// youtube API setup
window.onYouTubeIframeAPIReady = function () {
  for (var i = 0; i < VIDEO_DATA.length; i++) {
    createPlayer(VIDEO_DATA[i].videoId);
  }
};

function loadYouTubeAPI() {
  if (document.getElementById('yt-iframe-api-script')) return;
  var tag = document.createElement('script');
  tag.id = 'yt-iframe-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

function createPlayer(videoId) {
  var vars = { rel: 0, modestbranding: 1, enablejsapi: 1 };
  var proto = window.location.protocol;
  if (proto === 'http:' || proto === 'https:') vars.origin = window.location.origin;

  players[videoId] = new YT.Player('yt-player-' + videoId, {
    videoId: videoId,
    playerVars: vars,
    events: {
      onStateChange: function (e) {
        if (e.data === YT.PlayerState.PLAYING) {
          startChapterTracking(videoId);
        } else {
          stopChapterTracking(videoId);
        }
      },
      onError: function (e) {
        var container = document.getElementById('yt-player-' + videoId);
        if (container) container = container.closest('.video-embed-wrapper');
        if (container) {
          container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#111;border-radius:12px;color:#999;padding:24px;text-align:center;">' +
            '<p>Video unavailable. <a href="https://www.youtube.com/watch?v=' + videoId + '" target="_blank" style="color:#facc15;">Watch on YouTube</a></p></div>';
        }
      }
    }
  });
}

// chapter tracking
function startChapterTracking(videoId) {
  stopChapterTracking(videoId);
  var entry = null;
  for (var i = 0; i < VIDEO_DATA.length; i++) {
    if (VIDEO_DATA[i].videoId === videoId) { entry = VIDEO_DATA[i]; break; }
  }
  if (!entry) return;

  chapterTimers[videoId] = setInterval(function () {
    var p = players[videoId];
    if (!p || !p.getCurrentTime) return;
    var time = p.getCurrentTime();

    // find current chapter (simple loop from end)
    var chIdx = 0;
    for (var i = entry.chapters.length - 1; i >= 0; i--) {
      if (entry.chapters[i].time <= time) { chIdx = i; break; }
    }

    highlightChapter(videoId, chIdx, entry.chapters);
  }, 500);
}

function stopChapterTracking(videoId) {
  if (chapterTimers[videoId]) {
    clearInterval(chapterTimers[videoId]);
    delete chapterTimers[videoId];
  }
}

function highlightChapter(videoId, activeIdx, chapters) {
  var panel = document.querySelector('[data-video-id="' + videoId + '"] .chapters-list');
  var nowLabel = document.querySelector('[data-video-id="' + videoId + '"] .now-playing-bar__label');
  if (!panel) return;

  var items = panel.querySelectorAll('.chapter-item');
  for (var i = 0; i < items.length; i++) {
    if (i === activeIdx) {
      items[i].classList.add('active');
      items[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      items[i].classList.remove('active');
    }
  }

  if (nowLabel && chapters[activeIdx]) {
    nowLabel.textContent = chapters[activeIdx].label;
  }
}

function formatTime(sec) {
  var s = Math.floor(sec % 60);
  var m = Math.floor((sec / 60) % 60);
  var h = Math.floor(sec / 3600);
  if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return m + ':' + String(s).padStart(2, '0');
}

// build one carousel slide
function buildSlide(videoData, index) {
  var slide = document.createElement('div');
  slide.className = 'video-carousel__slide';
  slide.dataset.videoId = videoData.videoId;
  slide.dataset.slideIndex = index;

  // video embed
  var embedWrapper = document.createElement('div');
  embedWrapper.className = 'video-embed-wrapper';
  var playerDiv = document.createElement('div');
  playerDiv.id = 'yt-player-' + videoData.videoId;
  embedWrapper.appendChild(playerDiv);

  // chapters sidebar
  var chaptersPanel = document.createElement('div');
  chaptersPanel.className = 'chapters-panel';

  var header = document.createElement('p');
  header.className = 'chapters-panel__header';
  header.textContent = 'Chapters';

  var list = document.createElement('div');
  list.className = 'chapters-list';

  for (var i = 0; i < videoData.chapters.length; i++) {
    var ch = videoData.chapters[i];
    var item = document.createElement('button');
    item.className = 'chapter-item';
    item.type = 'button';
    item.dataset.time = ch.time;
    item.dataset.index = i;

    item.innerHTML = '<span class="chapter-item__time">' + formatTime(ch.time) + '</span>' +
      '<span class="chapter-item__label">' + ch.label + '</span>';

    item.addEventListener('click', (function (vid, t, idx, listEl) {
      return function () {
        var p = players[vid];
        if (p && p.seekTo) { p.seekTo(t, true); p.playVideo(); }
        var allItems = listEl.querySelectorAll('.chapter-item');
        for (var j = 0; j < allItems.length; j++) {
          allItems[j].classList.toggle('active', j === idx);
        }
      };
    })(videoData.videoId, ch.time, i, list));

    list.appendChild(item);
  }

  var nowPlaying = document.createElement('div');
  nowPlaying.className = 'now-playing-bar';
  nowPlaying.innerHTML = '<div class="now-playing-bar__dot"></div>' +
    '<span>Now:</span><span class="now-playing-bar__label">Introduction</span>';

  chaptersPanel.appendChild(header);
  chaptersPanel.appendChild(list);
  chaptersPanel.appendChild(nowPlaying);

  slide.appendChild(embedWrapper);
  slide.appendChild(chaptersPanel);
  return slide;
}

// carousel navigation
function goToSlide(index, trackEl, dotsEl, prevBtn, nextBtn) {
  var total = trackEl.querySelectorAll('.video-carousel__slide').length;
  if (index < 0 || index >= total) return;

  // pause all videos when switching
  for (var key in players) {
    if (players[key] && players[key].pauseVideo) players[key].pauseVideo();
  }

  currentSlide = index;
  trackEl.style.transform = 'translateX(-' + (index * 100) + '%)';

  var allDots = dotsEl.querySelectorAll('.video-carousel__dot');
  for (var i = 0; i < allDots.length; i++) {
    allDots[i].classList.toggle('active', i === index);
  }

  prevBtn.disabled = (index === 0);
  nextBtn.disabled = (index === total - 1);
}

// chapter detector - parse timestamps from description
var timestampRegex = /^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]?\s*(.+)/;

function parseTimeStr(str) {
  var parts = str.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function extractVideoId(url) {
  var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|v\/))([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function fetchChapters(videoId) {
  var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&key=' + YT_API_KEY;
  var resp = await fetch(url);
  if (!resp.ok) throw new Error('YouTube API error ' + resp.status);

  var data = await resp.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found.');
  }

  var desc = data.items[0].snippet.description;
  var lines = desc.split('\n');
  var chapters = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var match = line.match(timestampRegex);
    if (match) {
      var time = parseTimeStr(match[1]);
      var label = match[2].trim();
      if (label.length > 0) chapters.push({ time: time, label: label });
    }
  }

  if (chapters.length < 3) return null;
  chapters.sort(function (a, b) { return a.time - b.time; });
  return chapters;
}

function getDefaultChapters() {
  return [
    { time: 0, label: 'Introduction' },
    { time: 60, label: 'Background & Context' },
    { time: 180, label: 'Main Topic Begins' },
    { time: 300, label: 'Deep Dive' },
    { time: 480, label: 'Examples & Demos' },
    { time: 600, label: 'Key Takeaways' },
    { time: 720, label: 'Conclusion & Outro' }
  ];
}

// chapter detector UI
function initChapterDetector(container, trackEl, dotsEl, prevBtn, nextBtn) {
  var urlInput = document.getElementById('chapter-url-input');
  var submitBtn = document.getElementById('chapter-detect-btn');
  var statusEl = container.querySelector('.chapter-detector__status');
  var outputEl = container.querySelector('.chapter-detector__output');
  var codeEl = container.querySelector('.chapter-detector__code');
  var copyBtn = container.querySelector('.chapter-detector__copy-btn');
  var demoLink = document.getElementById('chapter-demo-link');

  if (!urlInput || !submitBtn) return;

  async function handleDetect() {
    var url = urlInput.value.trim();
    if (!url) {
      statusEl.textContent = 'Please enter a YouTube URL.';
      statusEl.className = 'chapter-detector__status error';
      return;
    }

    var videoId = extractVideoId(url);
    if (!videoId) {
      statusEl.textContent = 'Invalid YouTube URL.';
      statusEl.className = 'chapter-detector__status error';
      return;
    }

    submitBtn.disabled = true;
    statusEl.textContent = 'Fetching chapters for ' + videoId + '...';
    statusEl.className = 'chapter-detector__status info';

    try {
      var chapters = await fetchChapters(videoId);

      if (!chapters || chapters.length === 0) {
        chapters = getDefaultChapters();
        statusEl.textContent = 'No chapters found in description, using defaults. Added to carousel!';
        statusEl.className = 'chapter-detector__status error';
      } else {
        statusEl.textContent = 'Found ' + chapters.length + ' chapters! Added to carousel.';
        statusEl.className = 'chapter-detector__status success';
      }

      // add to carousel if not already there
      if (!trackEl.querySelector('[data-video-id="' + videoId + '"]')) {
        var newIdx = trackEl.querySelectorAll('.video-carousel__slide').length;
        var slide = buildSlide({ videoId: videoId, title: videoId, chapters: chapters }, newIdx);
        trackEl.appendChild(slide);

        var dot = document.createElement('button');
        dot.className = 'video-carousel__dot';
        dot.addEventListener('click', function () {
          goToSlide(newIdx, trackEl, dotsEl, prevBtn, nextBtn);
        });
        dotsEl.appendChild(dot);

        if (typeof YT !== 'undefined' && YT.Player) {
          createPlayer(videoId);
        }

        goToSlide(newIdx, trackEl, dotsEl, prevBtn, nextBtn);
      }

      // show generated code
      var json = JSON.stringify(chapters, null, 4);
      codeEl.textContent = 'const chapters = ' + json + ';';
      outputEl.classList.add('visible');
    } catch (err) {
      statusEl.textContent = 'Error: ' + err.message;
      statusEl.className = 'chapter-detector__status error';
      outputEl.classList.remove('visible');
    } finally {
      submitBtn.disabled = false;
    }
  }

  submitBtn.addEventListener('click', handleDetect);
  urlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleDetect();
  });

  if (demoLink) {
    demoLink.addEventListener('click', function (e) {
      e.preventDefault();
      urlInput.value = 'https://www.youtube.com/watch?v=kqtD5dpn9C8';
      handleDetect();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(codeEl.textContent).then(function () {
        copyBtn.textContent = 'Copied!';
        setTimeout(function () { copyBtn.textContent = 'Copy Code'; }, 2000);
      });
    });
  }
}

// init everything
document.addEventListener('DOMContentLoaded', function () {
  var section = document.getElementById('video-chapters-section');
  if (!section) return;

  var trackEl = section.querySelector('.video-carousel__track');
  var viewportEl = section.querySelector('.video-carousel__viewport');
  var dotsContainer = section.querySelector('.video-carousel__dots');
  var prevBtn = document.getElementById('vc-prev-btn');
  var nextBtn = document.getElementById('vc-next-btn');
  if (!trackEl) return;

  // build slides
  for (var i = 0; i < VIDEO_DATA.length; i++) {
    trackEl.appendChild(buildSlide(VIDEO_DATA[i], i));
  }

  // build dots
  for (var j = 0; j < VIDEO_DATA.length; j++) {
    var dot = document.createElement('button');
    dot.className = 'video-carousel__dot' + (j === 0 ? ' active' : '');
    dot.dataset.index = j;
    dot.addEventListener('click', function () {
      goToSlide(parseInt(this.dataset.index), trackEl, dotsContainer, prevBtn, nextBtn);
    });
    dotsContainer.appendChild(dot);
  }

  prevBtn.addEventListener('click', function () {
    goToSlide(currentSlide - 1, trackEl, dotsContainer, prevBtn, nextBtn);
  });
  nextBtn.addEventListener('click', function () {
    goToSlide(currentSlide + 1, trackEl, dotsContainer, prevBtn, nextBtn);
  });
  prevBtn.disabled = true;

  // touch swipe
  var dragStart = 0;
  viewportEl.addEventListener('touchstart', function (e) {
    dragStart = e.touches[0].clientX;
  }, { passive: true });
  viewportEl.addEventListener('touchend', function (e) {
    var delta = dragStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      goToSlide(currentSlide + (delta > 0 ? 1 : -1), trackEl, dotsContainer, prevBtn, nextBtn);
    }
  });

  // chapter detector
  var task2 = document.getElementById('task2');
  var detector = task2 && task2.querySelector('.chapter-detector');
  if (detector) initChapterDetector(detector, trackEl, dotsContainer, prevBtn, nextBtn);

  loadYouTubeAPI();
});
