const html = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => html.dataset.theme || (systemTheme.matches ? 'dark' : 'light');
const updateThemeLabel = () => {
  themeButton.setAttribute('aria-label', currentTheme() === 'dark' ? themeButton.dataset.lightLabel : themeButton.dataset.darkLabel);
  document.querySelector('meta[name="theme-color"]').content = currentTheme() === 'dark' ? '#171c19' : '#f8f9f6';
};
themeButton.hidden = false;
updateThemeLabel();
themeButton.addEventListener('click', () => {
  const theme = currentTheme() === 'dark' ? 'light' : 'dark';
  html.dataset.theme = theme;
  try { localStorage.setItem('academic-theme', theme); } catch { /* Optional preference storage. */ }
  updateThemeLabel();
});
systemTheme.addEventListener('change', updateThemeLabel);
window.addEventListener('storage', event => {
  if (event.key === 'academic-theme') {
    if (event.newValue === 'light' || event.newValue === 'dark') html.dataset.theme = event.newValue;
    else delete html.dataset.theme;
    updateThemeLabel();
  }
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.page-navigation');
menuButton.hidden = false;
const setMenu = open => {
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
};
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});

const navigationLinks = [...navigation.querySelectorAll('a')];
const sections = navigationLinks.map(link => document.querySelector(link.getAttribute('href')));
let scrollPending = false;
function updateActiveSection() {
  const reachedBottom = window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
  const active = reachedBottom ? sections.at(-1) : [...sections].reverse().find(section => section.getBoundingClientRect().top <= 150) || sections[0];
  for (const link of navigationLinks) {
    const isActive = link.getAttribute('href') === `#${active.id}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) { requestAnimationFrame(updateActiveSection); scrollPending = true; }
}, { passive: true });
updateActiveSection();

const filterGroup = document.querySelector('.publication-filters');
if (filterGroup) {
  filterGroup.hidden = false;
  const papers = [...document.querySelectorAll('.publication[data-year]')];
  filterGroup.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    for (const control of filterGroup.querySelectorAll('button')) {
      control.classList.toggle('active', control === button);
      control.setAttribute('aria-pressed', String(control === button));
    }
    let count = 0;
    for (const paper of papers) {
      const matches = button.dataset.filter === 'all' || (button.dataset.filter === 'selected' ? paper.dataset.selected === 'true' : paper.dataset.year === button.dataset.filter);
      paper.hidden = !matches;
      if (matches) count++;
    }
    document.querySelector('.no-results').hidden = count !== 0;
  });
}

for (const button of document.querySelectorAll('.bibtex-button')) {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.bibtex);
      button.textContent = document.body.dataset.copiedLabel;
      document.querySelector('#copy-status').textContent = document.body.dataset.copiedLabel;
      setTimeout(() => { button.textContent = document.body.dataset.copyLabel; }, 1800);
    } catch {
      document.querySelector('#copy-status').textContent = document.body.dataset.copyError;
    }
  });
}
