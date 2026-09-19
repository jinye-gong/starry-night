(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveals = [...document.querySelectorAll('.reveal')];
  const ending = document.querySelector('.ending');
  let revealObserver;
  let endingObserver;
  let cancelled = false;
  let memoryFade;

  const showAll = () => {
    cancelled = true;
    memoryFade?.cancel();
    reveals.forEach(el => el.classList.remove('is-pending'));
    ending?.classList.remove('is-staged');
    revealObserver?.disconnect();
    endingObserver?.disconnect();
  };
  const pause = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  try {
    reducedMotion.addEventListener('change', event => {
      if (event.matches) showAll();
    });
    window.addEventListener('beforeprint', showAll);
    window.addEventListener('pageshow', event => {
      if (event.persisted) showAll();
    });

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

    const memory = ending?.querySelector('.ending-memory img');
    const photo = ending?.querySelector('.ending-photo img');
    if (!memory || !photo || typeof memory.animate !== 'function') return;
    ending.classList.add('is-staged');
    endingObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      endingObserver.disconnect();
      (async () => {
        try {
          // Never hold the final page indefinitely for a slow image request.
          await Promise.race([photo.decode().catch(() => {}), pause(2500)]);
          if (cancelled) return;
          await pause(80);
          if (cancelled) return;
          // Silhouette starts fading; warm photo overlaps ~300ms in.
          memoryFade = memory.animate([{ opacity: .26 }, { opacity: 0 }], {
            duration: 780, easing: 'ease-out', fill: 'forwards'
          });
          await pause(300);
          if (cancelled) return;
          ending.classList.add('is-finished');
          ending.classList.remove('is-staged');
          await memoryFade.finished.catch(() => {});
          memoryFade.cancel();
        } catch {
          showAll();
        }
      })();
    }, { threshold: 0 });
    endingObserver.observe(ending.querySelector('.ending-memory'));
  } catch {
    showAll();
  }
})();
