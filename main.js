(() => {
  const elements = [...document.querySelectorAll('.reveal')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  let observer;
  const showAll = () => {
    elements.forEach(element => element.classList.remove('is-pending'));
    observer?.disconnect();
  };
  try {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px 60px 0px' });
    elements.forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('is-pending');
        observer.observe(element);
      }
    });
    reducedMotion.addEventListener('change', event => { if (event.matches) showAll(); });
    window.addEventListener('beforeprint', showAll);
    window.addEventListener('pageshow', event => { if (event.persisted) showAll(); });
  } catch { showAll(); }
})();
