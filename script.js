// Lightweight interactions:
// - Theme toggle (persisted in localStorage)
// - Mobile menu toggle
// - Smooth scroll for internal links
// - Secret bot small playful interaction

(function(){
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const secretBot = document.getElementById('secret-bot');

  // Init theme
  const saved = localStorage.getItem('theme');
  if(saved === 'light') {
    root.setAttribute('data-theme', 'light');
    themeToggle.textContent = '🌞';
    themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    root.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
    themeToggle.setAttribute('aria-pressed', 'false');
  }

  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if(isLight){
      root.removeAttribute('data-theme');
      localStorage.setItem('theme','dark');
      themeToggle.textContent = '🌙';
      themeToggle.setAttribute('aria-pressed', 'false');
    } else {
      root.setAttribute('data-theme','light');
      localStorage.setItem('theme','light');
      themeToggle.textContent = '🌞';
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  });

  // Mobile menu
  if(menuToggle){
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      if(!open){
        mobileNav.hidden = false;
        menuToggle.textContent = '✕';
      } else {
        mobileNav.hidden = true;
        menuToggle.textContent = '☰';
      }
    });

    // close mobile nav when clicking a link
    mobileNav?.addEventListener('click', (e) => {
      if(e.target.tagName === 'A'){
        mobileNav.hidden = true;
        menuToggle.setAttribute('aria-expanded','false');
        menuToggle.textContent = '☰';
      }
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if(href === '#' || href === '#top') return;
      const el = document.querySelector(href);
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth', block:'start'});
        history.replaceState(null, '', href);
      }
    });
  });

  // Simple secret bot interaction
  secretBot?.addEventListener('click', () => {
    secretBot.textContent = '🤖🔧';
    secretBot.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      secretBot.textContent = '🤖';
      secretBot.style.transform = '';
    }, 1200);
  });

  // Accessibility: allow closing mobile nav with Escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && mobileNav && !mobileNav.hidden){
      mobileNav.hidden = true;
      menuToggle.setAttribute('aria-expanded','false');
      menuToggle.textContent = '☰';
      menuToggle.focus();
    }
  });

  // Animate skill bars on viewport
  const bars = document.querySelectorAll('.bar span');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.style.width = entry.target.style.width || entry.target.getAttribute('data-width') || entry.target.style.width;
        entry.target.classList.add('visible');
      }
    });
  }, {threshold: 0.2});

  bars.forEach(b => {
    // preserve inline width used in markup
    obs.observe(b);
  });

})();
