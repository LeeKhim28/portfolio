document.documentElement.dataset.js = 'ready';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = [...document.querySelectorAll('.reveal, .project-row, .education-row, .achievement-row, .stack-row, .experience-row, .contact-row')];

reveals.forEach((element, index) => {
  element.classList.add('motion-item');
  element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
});

if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
      else entry.target.classList.remove('is-visible');
    });
  }, { threshold: 0.14 });
  reveals.forEach((element) => revealObserver.observe(element));
}

const counters = [...document.querySelectorAll('[data-count-to]')];

const setCounterValue = (element, progress = 1) => {
  const targetText = element.dataset.countTo ?? '0';
  const target = Number(targetText);
  const decimals = targetText.includes('.') ? targetText.split('.')[1].length : 0;
  const value = target * progress;
  element.textContent = decimals ? value.toFixed(decimals) : String(Math.round(value)).padStart(targetText.length, '0');
};

if (reduceMotion || !('IntersectionObserver' in window)) {
  counters.forEach((element) => setCounterValue(element));
} else {
  counters.forEach((element) => setCounterValue(element, 0));
  const counterRuns = new WeakMap();
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        counterRuns.set(entry.target, (counterRuns.get(entry.target) ?? 0) + 1);
        setCounterValue(entry.target, 0);
        return;
      }
      const run = (counterRuns.get(entry.target) ?? 0) + 1;
      counterRuns.set(entry.target, run);
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        if (counterRuns.get(entry.target) !== run) return;
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounterValue(entry.target, eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.65 });
  counters.forEach((element) => counterObserver.observe(element));
}

const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${active.target.id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -65%', threshold: [0, .25, .6] });
  sections.forEach((section) => sectionObserver.observe(section));
}

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-links');

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navMenu?.classList.toggle('is-open', !expanded);
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  navToggle?.setAttribute('aria-expanded', 'false');
  navMenu?.classList.remove('is-open');
}));

document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));
