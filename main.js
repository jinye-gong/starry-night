(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveals = [...document.querySelectorAll('.reveal')];
  const morph = document.querySelector('[data-morph]');

  const showAll = () => {
    reveals.forEach(el => el.classList.remove('is-pending'));
    morph?.classList.remove('is-waiting');
    revealObserver?.disconnect();
    morphObserver?.disconnect();
  };

  let revealObserver;
  let morphObserver;

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  try {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px 60px 0px' });

    reveals.forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('is-pending');
        revealObserver.observe(el);
      }
    });

    if (morph) {
      const photo = morph.querySelector('.morph-photo');
      morph.classList.add('is-waiting');
      morphObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          // Let the cover settle briefly, then crossfade to the real photo.
          window.setTimeout(async () => {
            // Keep the cover visible until the final photo is decoded.
            try { await photo.decode(); } catch { /* Show the fallback below. */ }
            morph.classList.remove('is-waiting');
          }, 480);
          morphObserver.unobserve(morph);
        });
      }, { threshold: 0.01 });
      morphObserver.observe(morph);
    }

    reducedMotion.addEventListener('change', event => {
      if (event.matches) showAll();
    });
    window.addEventListener('beforeprint', showAll);
    window.addEventListener('pageshow', event => {
      if (event.persisted) showAll();
    });
  } catch {
    showAll();
  }
})();
