const html = document.documentElement;
const theme = document.querySelector('.theme-toggle');
const system = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => html.dataset.theme || (system.matches ? 'dark' : 'light');
function updateLabel() {
  const label = currentTheme() === 'dark' ? theme.dataset.lightLabel : theme.dataset.darkLabel;
  theme.setAttribute('aria-label', label);
  theme.title = label;
}
theme.hidden = false;
updateLabel();
system.addEventListener('change', updateLabel);
theme.addEventListener('click', () => {
  html.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('academic-theme', html.dataset.theme); } catch { /* Storage is optional. */ }
  updateLabel();
});
window.addEventListener('storage', event => {
  if (event.key !== 'academic-theme') return;
  if (['dark','light'].includes(event.newValue)) html.dataset.theme = event.newValue;
  else delete html.dataset.theme;
  updateLabel();
});

const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
menu.hidden = false;
function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
document.addEventListener('click', event => {
  if (!menu.contains(event.target) && !nav.contains(event.target)) setMenu(false);
});
window.addEventListener('pageshow', () => setMenu(false));

// Keep links shared from the original one-page CV working after the move.
if (document.querySelector('.post.about') && location.hash) {
  const oldSection = location.hash.slice(1);
  for (const link of document.querySelectorAll('.site-nav a, .footer-nav a')) {
    const dest = new URL(link.href);
    if (dest.pathname !== location.pathname && dest.pathname.endsWith('/' + oldSection + '/')) {
      location.replace(dest.href);
      break;
    }
  }
}
