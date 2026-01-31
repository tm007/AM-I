
// Minimal behavior: year stamp
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();

// === Side Navigation: DEAD SIMPLE ===
(function() {
  var sideNav = document.querySelector('.side-nav');
  if (!sideNav) return;
  
  var links = sideNav.querySelectorAll('a[data-section]');
  var sections = {};
  
  // Build section map
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var id = link.getAttribute('data-section');
    var section = document.getElementById(id);
    if (section) {
      sections[id] = { link: link, section: section };
    }
  }
  
  // Click handler - fix closure issue
  for (var id in sections) {
    (function(sectionId) {
      sections[sectionId].link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    })(id);
  }
  
  // Show links after autoscroll animation (trailer section visible)
  var allNavLinks = sideNav.querySelectorAll('.side-nav-link');
  var trailer = document.getElementById('trailer');
  var linksShown = false;
  
  function showLinks() {
    if (linksShown) return;
    linksShown = true;
    allNavLinks.forEach(function(link) {
      link.classList.add('show');
    });
  }
  
  // Check if trailer is visible (autoscroll completed)
  if (trailer && 'IntersectionObserver' in window) {
    var trailerObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          showLinks();
        }
      });
    }, { threshold: 0.1 });
    trailerObserver.observe(trailer);
  }
  
  // Fallback: show after 3 seconds (autoscroll should be done)
  setTimeout(showLinks, 3000);
  
  // Visibility on scroll
  window.addEventListener('scroll', function() {
    sideNav.classList.toggle('visible', window.scrollY > 100);
  }, { passive: true });
  
  // Active state and carousel animation on scroll
  if ('IntersectionObserver' in window) {
    var sectionRatios = {};
    var sectionPositions = {};
    
    var observer = new IntersectionObserver(function(entries) {
      if (!linksShown) return;
      
      // Update intersection ratios for all entries
      entries.forEach(function(entry) {
        var id = entry.target.id;
        var isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1;
        
        // Store intersection ratio and position data
        if (entry.isIntersecting) {
          sectionRatios[id] = entry.intersectionRatio;
          var rect = entry.boundingClientRect;
          var viewportHeight = window.innerHeight;
          // Check if section's top is in the upper portion of viewport (top 50%)
          var topInUpperViewport = rect.top >= -100 && rect.top < viewportHeight * 0.5;
          sectionPositions[id] = {
            ratio: entry.intersectionRatio,
            topInUpperViewport: topInUpperViewport,
            top: rect.top
          };
        } else {
          sectionRatios[id] = 0;
          sectionPositions[id] = {
            ratio: 0,
            topInUpperViewport: false,
            top: Infinity
          };
        }
        
        // Carousel animation - show link when section is visible
        if (sections[id]) {
          sections[id].link.classList.toggle('visible', isVisible);
        }
      });
      
      // Find the section that should be active
      var activeId = null;
      var bestScore = -1;
      
      for (var id in sectionPositions) {
        var pos = sectionPositions[id];
        if (pos.ratio === 0) continue;
        
        // Score calculation: prioritize sections with top in upper viewport
        // For tall sections (low ratio), if top is in upper viewport, give them priority
        var score = pos.ratio;
        if (pos.topInUpperViewport) {
          // Boost score significantly if section top is in upper viewport
          score = Math.max(score, 0.2); // Minimum score of 0.2 for sections in upper viewport
        }
        
        // Lower threshold: any intersecting section with top in viewport or ratio > 0.08
        if (score > bestScore && (pos.topInUpperViewport || pos.ratio > 0.08)) {
          bestScore = score;
          activeId = id;
        }
      }
      
      // Update active state for all links
      for (var sectionId in sections) {
        sections[sectionId].link.classList.toggle('active', sectionId === activeId);
      }
    }, { rootMargin: '-30% 0px -30% 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5] });
    
    for (var id in sections) {
      observer.observe(sections[id].section);
    }
  }
  
  // Initial visibility
  sideNav.classList.toggle('visible', window.scrollY > 100);
})();


; (function () {
  var intro = document.getElementById('intro');
  var hero = document.querySelector('.hero');
  if (!intro || !hero || !('IntersectionObserver' in window)) return;
  var ob = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { intro.style.opacity = '0.96'; } // keep visible but subtle
    });
  }, { rootMargin: '-10% 0px -80% 0px', threshold: 0.01 });
  ob.observe(hero);
})();




; (function () {
  try {
    // Brief, first-screen lock: 1 second
    document.body.classList.add('lock-scroll');
    setTimeout(function () { document.body.classList.remove('lock-scroll'); }, 1000);
  } catch (_) { }
})();

// Section background setup: ensures smooth appearance
(function () {
  try {
    var bgs = document.querySelectorAll('.section .section-bg');
    bgs.forEach(function (bg) {
      if (!bg.style.backgroundImage) {
        var src = bg.getAttribute('data-src');
        if (src) {
          // Set background immediately - preload in HTML ensures GIF is ready
          bg.style.backgroundImage = 'url(' + src + ')';
        }
      }
    });
  } catch (e) { }
})();

// === Trailer: one-time auto-scroll + copy link (no autoplay, single control) ===
(function () {
  var section = document.getElementById('trailer');
  if (!section) return;

  // ---- One-time auto-scroll so the trailer fills the viewport ----
  try {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var deepLinked = !!(location.hash && location.hash.length > 1);
    var alreadyRan = sessionStorage.getItem('autoScrolledToTrailer') === '1';

    if (!reduceMotion && !deepLinked && !alreadyRan && window.scrollY < 10) {
      var userScrolled = false;
      var passiveOpts = { passive: true };

      function onUserScroll() {
        userScrolled = true;
        window.removeEventListener('scroll', onUserScroll, passiveOpts);
      }
      window.addEventListener('scroll', onUserScroll, passiveOpts);

      window.addEventListener('load', function handleLoad() {
        window.removeEventListener('load', handleLoad);

        var start = performance.now();
        function attempt() {
          if (userScrolled) return; // user took control
          if (performance.now() - start < 900) { requestAnimationFrame(attempt); return; }

          var top = section.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: top, behavior: 'smooth' });
          sessionStorage.setItem('autoScrolledToTrailer', '1');
        }
        requestAnimationFrame(attempt);
      }, { once: true });
    }
  } catch (_) { }
})();
// === Lazy-play the hero GIF when in view with true reverse playback ===
// Plays forward, then reversed, then forward again (ping-pong effect) infinitely
(function () {
  var img = document.querySelector('.hero .lazy-hero');
  if (!img) return;

  var isReversed = false;
  var gifDuration = 8600; // Estimate GIF duration in ms (adjust to match your GIF)
  var intervalId = null;
  var forwardSrc = null;
  var reverseSrc = null;
  var isLoaded = false;

  function reveal() {
    if (img.src) return; // already set
    
    forwardSrc = img.getAttribute('data-src');
    // Look for reversed version: hero-bg-reverse.gif
    reverseSrc = forwardSrc.replace(/hero-bg\.gif/, 'hero-bg-reverse.gif');
    
    // Check if reverse version exists, then start ping-pong
    var testImg = new Image();
    testImg.onload = function() {
      // Reverse version exists - start ping-pong playback
      startPingPongWithReverse();
    };
    testImg.onerror = function() {
      // No reverse version - just load forward normally
      loadForwardOnly();
    };
    testImg.src = reverseSrc;
  }

  function loadForwardOnly() {
    img.addEventListener('load', function onLoad() {
      img.removeEventListener('load', onLoad);
      img.classList.add('is-loaded');
    });
    img.src = forwardSrc;
  }

  function startPingPongWithReverse() {
    // Start with forward playback
    isReversed = false;
    
    // Load forward GIF first
    img.addEventListener('load', function onFirstLoad() {
      if (!isLoaded) {
        img.removeEventListener('load', onFirstLoad);
        img.classList.add('is-loaded');
        isLoaded = true;
      }
    });
    
    img.src = forwardSrc;
    
    // After GIF duration, switch to reverse, then back to forward infinitely
    intervalId = setInterval(function () {
      if (!img.src) return;
      
      isReversed = !isReversed;
      
      // Force reload by clearing and resetting src
      var currentSrc = isReversed ? reverseSrc : forwardSrc;
      img.src = '';
      // Small delay to ensure clean transition
      setTimeout(function() {
        img.src = currentSrc;
      }, 10);
    }, gifDuration);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          reveal();
          io.disconnect();
        }
      });
    }, { rootMargin: '150px 0px', threshold: 0.01 });
    io.observe(img);
  } else {
    reveal();
  }
})();

// === Newsletter Marquee: Create seamless infinite loop ===
(function() {
  function initMarquee() {
    var marquee = document.querySelector('.newsletter-marquee');
    var track = document.querySelector('.newsletter-track');
    if (!marquee || !track) return;
    
    // Clone the track multiple times to ensure 3+ sections are always visible
    // We need enough clones to fill the screen and create seamless loop
    // With 4 clones + 1 original = 5 total, animating by 20% (1/5) creates seamless loop
    for (var i = 0; i < 4; i++) {
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      marquee.appendChild(clone);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarquee);
  } else {
    initMarquee();
  }
})();


// === Minimal text highlight: lightweight and performant ===
(function() {
  var highlight = document.createElement('div');
  highlight.className = 'text-highlight';
  highlight.setAttribute('aria-hidden', 'true');
  document.body.appendChild(highlight);

  var currentP = null;
  var ticking = false;

  function updatePosition(x, y) {
    highlight.style.transform = 'translate(' + (x - 140) + 'px, ' + (y - 90) + 'px)';
  }

  function setActive(p) {
    if (currentP === p) return;
    if (currentP) {
      currentP.classList.remove('highlight-active');
    }
    currentP = p;
    if (p) {
      p.classList.add('highlight-active');
      highlight.classList.add('show');
    } else {
      highlight.classList.remove('show');
    }
  }

  document.addEventListener('mousemove', function(e) {
    if (!ticking && currentP) {
      ticking = true;
      requestAnimationFrame(function() {
        updatePosition(e.clientX, e.clientY);
        ticking = false;
      });
    }
  }, { passive: true });

  document.addEventListener('mouseover', function(e) {
    var p = e.target.closest('.p');
    if (p) {
      setActive(p);
      updatePosition(e.clientX, e.clientY);
    } else if (currentP && (!e.relatedTarget || !e.relatedTarget.closest('.p'))) {
      setActive(null);
    }
  }, { passive: true });
})();


