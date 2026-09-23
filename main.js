(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveals = [...document.querySelectorAll('.reveal')];
  let revealObserver;

  const showAll = () => {
    reveals.forEach(el => el.classList.remove('is-pending'));
    revealObserver?.disconnect();
  };

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
  } catch {
    showAll();
  }
})();
