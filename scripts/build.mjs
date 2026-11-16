import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const output = path.join(root, 'dist');

const messages = {
  en: {
    lang: 'en', alternate: '中文', alternateLang: 'zh-CN', name: 'Your Name',
    siteTitle: 'Academic homepage', title: 'Personal academic homepage',
    role: 'Your academic position', affiliation: 'Your institution', location: 'Your location',
    template: 'Template preview', templateNote: 'Personal content to follow',
    about: 'About', aboutTitle: 'About me', research: 'Research', publications: 'Publications',
    education: 'Education', experience: 'Experience', projects: 'Projects',
    awards: 'Honors & awards', service: 'Academic service', contact: 'Contact',
    intro: 'A short introduction will go here.',
    introNote: 'A few words about your background, current position, and the questions that drive your research.',
    researchTitle: 'Research interests', researchNote: 'The questions I explore.',
    researchPlaceholder: 'Research area', researchDescription: 'A brief description of this research direction.',
    news: 'Latest updates', newsEmpty: 'News and announcements will appear here.',
    publicationsTitle: 'Selected publications', publicationsNote: 'Papers, preprints, and research contributions.',
    publicationEmpty: 'Your first publication goes here', publicationMeta: 'Authors · Venue · Year',
    publicationDescription: 'A short summary of the research, with links to the paper and supporting materials.',
    publicationImage: 'Research preview', all: 'All work', selected: 'Selected',
    noResults: 'No publications in this selection.', bibtex: 'Copy BibTeX', copied: 'Copied', copyError: 'Could not copy. Please try again.',
    educationNote: 'Academic background and training.', educationEmpty: 'Institution name',
    degree: 'Degree · Field of study', educationDescription: 'Advisor, thesis, or other relevant details.',
    experienceNote: 'Research appointments and professional experience.', experienceEmpty: 'Position / role',
    organization: 'Institution or research lab', experienceDescription: 'Research focus and responsibilities.',
    projectsNote: 'Research in practice.', projectEmpty: 'Project title',
    projectDescription: 'A brief overview of the project, your contribution, and the work behind it.',
    awardsEmpty: 'Honors and awards will appear here.', serviceEmpty: 'Reviewing, teaching, and community contributions will appear here.',
    toAdd: 'To be added', dates: 'Start — End', portrait: 'Your portrait',
    cv: 'Download CV', cvEmpty: 'CV coming soon', scholar: 'Google Scholar',
    email: 'Email', contactTitle: 'Let’s get in touch.', contactDescription: 'Contact details will be added here.',
    contactEmpty: 'Email to be added', navigation: 'On this page', menu: 'Toggle navigation',
    theme: 'Switch color theme', themeLight: 'Switch to light theme', themeDark: 'Switch to dark theme',
    top: 'Back to top', skip: 'Skip to content', updated: 'Updated',
    noscript: 'The page is fully readable without JavaScript. Theme switching and publication filters require JavaScript.'
  },
  zh: {
    lang: 'zh-CN', alternate: 'EN', alternateLang: 'en', name: '你的姓名',
    siteTitle: '个人学术主页', title: '个人学术主页',
    role: '你的学术身份', affiliation: '所在院校 / 机构', location: '所在城市',
    template: '模板预览', templateNote: '个人内容待补充',
    about: '关于我', aboutTitle: '关于我', research: '研究方向', publications: '论文发表',
    education: '教育经历', experience: '研究经历', projects: '研究项目',
    awards: '荣誉奖励', service: '学术服务', contact: '联系',
    intro: '这里将放置你的个人简介。',
    introNote: '简要介绍你的学术背景、当前身份，以及你所关注的研究问题。',
    researchTitle: '研究方向', researchNote: '关注的问题与探索的方向。',
    researchPlaceholder: '研究方向', researchDescription: '用一两句话描述这一方向的研究兴趣。',
    news: '近期动态', newsEmpty: '后续将在这里展示学术动态与最新消息。',
    publicationsTitle: '代表论文', publicationsNote: '论文、预印本与其他研究成果。',
    publicationEmpty: '这里将展示你的论文', publicationMeta: '作者 · 发表会议 / 期刊 · 年份',
    publicationDescription: '简要介绍论文的研究内容，并提供全文、代码及其他相关资源。',
    publicationImage: '研究配图', all: '全部论文', selected: '代表作',
    noResults: '当前筛选下暂无论文。', bibtex: '复制 BibTeX', copied: '已复制', copyError: '复制失败，请重试。',
    educationNote: '求学经历与学术训练。', educationEmpty: '院校名称',
    degree: '学位 · 专业方向', educationDescription: '导师、学位论文或其他相关信息。',
    experienceNote: '研究任职、实习与其他专业经历。', experienceEmpty: '职位 / 身份',
    organization: '所在机构 / 实验室', experienceDescription: '主要研究内容与承担的工作。',
    projectsNote: '从研究问题到具体实践。', projectEmpty: '项目名称',
    projectDescription: '简要介绍项目、你所承担的工作，以及相关成果。',
    awardsEmpty: '后续将在这里展示荣誉与奖励。', serviceEmpty: '后续将在这里展示审稿、教学与学术社区服务。',
    toAdd: '待补充', dates: '开始 — 结束', portrait: '个人照片',
    cv: '下载简历', cvEmpty: '简历待上传', scholar: '谷歌学术',
    email: '邮箱', contactTitle: '保持联系。', contactDescription: '后续将在这里补充联系方式。',
    contactEmpty: '邮箱待补充', navigation: '页面导航', menu: '展开或收起导航',
    theme: '切换配色主题', themeLight: '切换浅色主题', themeDark: '切换深色主题',
    top: '返回顶部', skip: '跳转到正文', updated: '更新于',
    noscript: '无需 JavaScript 也可阅读完整页面。主题切换和论文筛选需要启用 JavaScript。'
  }
};

const escape = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const localize = (value, lang) => typeof value === 'string' ? value : value?.[lang] || value?.en || value?.zh || '';

function safeURL(value = '') {
  if (!value || typeof value !== 'string') return '';
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  // Local files stay relative so the same build works at / and /repository/.
  if (/^[\w./-]+$/.test(value) && !value.startsWith('/') && !value.split('/').includes('..')) return value;
  throw new Error(`Unsupported URL: ${value}. Use https://, mailto:, or a relative asset path.`);
}

const icons = {
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  scholar: '<path d="m2 9 10-5 10 5-10 5L2 9Zm4 3v5c4 3 8 3 12 0v-5M22 9v8"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 4v-3.5c0-1 .1-1.5-.5-2 3-.3 5.5-1.4 5.5-6a4.7 4.7 0 0 0-1.3-3.3A4.4 4.4 0 0 0 18.6 3S17.5 2.7 15 4a11.5 11.5 0 0 0-6 0C6.5 2.7 5.4 3 5.4 3a4.4 4.4 0 0 0-.1 3.2A4.7 4.7 0 0 0 4 9.5c0 4.6 2.5 5.7 5.5 6-.6.5-.6 1.3-.5 2V21"/>',
  orcid: '<circle cx="12" cy="12" r="9"/><path d="M8 10v7m0-10v.1M12 8h2a4 4 0 0 1 0 8h-2V8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M21 12.8A9 9 0 0 1 11.2 3 9 9 0 1 0 21 12.8Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H4V4Zm9 3a3 3 0 0 1 3-3h4v14h-3a4 4 0 0 0-4 3"/>'
};
const icon = name => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;

function render(data, lang) {
  const t = messages[lang];
  const prefix = lang === 'en' ? './' : '../';
  const text = value => escape(localize(value, lang));
  const asset = value => {
    const url = safeURL(value);
    return /^(https?:|mailto:)/i.test(url) ? url : `${prefix}${url}`;
  };
  const link = (label, url, className = '', decoration = '') => {
    if (!url) return `<span class="${className} unavailable" aria-disabled="true">${decoration}${escape(label)}</span>`;
    const external = /^https?:\/\//i.test(url);
    return `<a class="${className}" href="${escape(asset(url))}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${decoration}${escape(label)}${external ? icon('arrow') : ''}</a>`;
  };
  const name = localize(data.profile.name, lang) || t.name;
  const preview = data.site.showPlaceholders;
  const enabled = key => data.sections[key] !== false && (preview || data[key].length > 0);
  const nav = [['about', t.about], ...['research', 'publications', 'education', 'experience', 'projects', 'awards', 'service'].filter(enabled).map(key => [key, t[key]])];
  const navHTML = nav.map(([key, label], i) => `<a href="#${key}"${i === 0 ? ' class="active" aria-current="location"' : ''}><span class="nav-number">${String(i + 1).padStart(2, '0')}</span>${label}<span class="nav-mark" aria-hidden="true">↗</span></a>`).join('');
  const heading = (key, title, note = '') => `<div class="section-heading"><div><span class="eyebrow">${String(nav.findIndex(item => item[0] === key) + 1).padStart(2, '0')} / ${escape(t[key])}</span><h2>${escape(title)}</h2></div>${note ? `<p>${escape(note)}</p>` : ''}</div>`;
  const emptyBadge = `<span class="empty-badge">${t.toAdd}</span>`;
  const resourceLinks = links => (links || []).map(item => link(localize(item.label, lang), item.url, 'resource-link')).join('');

  const research = !enabled('research') ? '' : `<section class="section" id="research" aria-labelledby="research-title">${heading('research', t.researchTitle, t.researchNote).replace('<h2>', '<h2 id="research-title">')}<div class="research-grid">${data.research.length ? data.research.map((item, i) => `<article class="research-item"><span class="item-number">${String(i + 1).padStart(2, '0')}</span><h3>${text(item.title)}</h3><p>${text(item.description)}</p></article>`).join('') : [1, 2, 3].map(i => `<article class="research-item placeholder"><span class="item-number">0${i}</span><h3>${t.researchPlaceholder} ${String(i).padStart(2, '0')}</h3><p>${t.researchDescription}</p></article>`).join('')}</div></section>`;

  const news = !enabled('news') ? '' : `<div class="news-block"><h2>${t.news}<span class="small-dot" aria-hidden="true"></span></h2><div class="news-list">${data.news.length ? data.news.map(item => `<div class="news-row"><time datetime="${escape(item.date)}">${escape(item.date)}</time><p>${item.url ? link(localize(item.text, lang), item.url) : text(item.text)}</p></div>`).join('') : `<div class="news-row placeholder"><span class="empty-date">— / —</span><p>${t.newsEmpty}</p></div>`}</div></div>`;

  const publications = !enabled('publications') ? '' : `<section class="section" id="publications" aria-labelledby="publications-title">${heading('publications', t.publicationsTitle, t.publicationsNote).replace('<h2>', '<h2 id="publications-title">')}${data.publications.length ? `<div class="publication-filters" role="group" aria-label="${t.publications}" hidden><button class="filter active" data-filter="all" aria-pressed="true">${t.all}<span>${data.publications.length}</span></button><button class="filter" data-filter="selected" aria-pressed="false">${t.selected}</button>${[...new Set(data.publications.map(p => p.year))].sort((a,b) => b-a).map(year => `<button class="filter" data-filter="${escape(year)}" aria-pressed="false">${escape(year)}</button>`).join('')}</div><div class="publication-list">${data.publications.map(item => `<article class="publication" data-year="${escape(item.year)}" data-selected="${Boolean(item.selected)}"><div class="publication-visual">${item.image ? `<img src="${escape(asset(item.image))}" alt="${text(item.title)}" loading="lazy">` : icon('book')}</div><div class="publication-body"><div class="publication-meta"><span>${text(item.venue)}</span><span>${escape(item.year)}</span></div><h3>${text(item.title)}</h3><p class="authors">${text(item.authors)}</p>${item.description ? `<p>${text(item.description)}</p>` : ''}<div class="resource-links">${resourceLinks(item.links)}${item.bibtex ? `<button class="resource-link bibtex-button" data-bibtex="${escape(item.bibtex)}">${t.bibtex}</button>` : ''}</div></div></article>`).join('')}</div><p class="no-results" role="status" hidden>${t.noResults}</p>` : `<article class="publication placeholder"><div class="publication-visual empty-visual"><span class="paper-art" aria-hidden="true"><i></i><i></i><i></i></span><span>${t.publicationImage}</span></div><div class="publication-body"><div class="publication-meta">${emptyBadge}<span>—</span></div><h3>${t.publicationEmpty}</h3><p class="authors">${t.publicationMeta}</p><p>${t.publicationDescription}</p><div class="resource-links"><span class="resource-link unavailable" aria-disabled="true">PDF ${icon('arrow')}</span><span class="resource-link unavailable" aria-disabled="true">Code ${icon('arrow')}</span><span class="resource-link unavailable" aria-disabled="true">BibTeX</span></div></div></article>`}</section>`;

  const timeline = key => {
    if (!enabled(key)) return '';
    const isEducation = key === 'education';
    return `<section class="section" id="${key}">${heading(key, t[key], t[`${key}Note`])}<div class="timeline">${data[key].length ? data[key].map(item => `<article class="timeline-item"><span class="timeline-period">${text(item.period)}</span><div class="timeline-body"><h3>${text(isEducation ? item.institution : item.role)}</h3><p class="timeline-subtitle">${text(isEducation ? item.degree : item.organization)}</p>${item.details?.length ? `<ul>${item.details.map(detail => `<li>${text(detail)}</li>`).join('')}</ul>` : ''}</div></article>`).join('') : `<article class="timeline-item placeholder"><span class="timeline-period">${t.dates}</span><div class="timeline-body"><h3>${t[`${key}Empty`]}</h3><p class="timeline-subtitle">${isEducation ? t.degree : t.organization}</p><p>${t[`${key}Description`]}</p></div></article>`}</div></section>`;
  };

  const projects = !enabled('projects') ? '' : `<section class="section" id="projects">${heading('projects', t.projects, t.projectsNote)}<div class="projects-grid">${data.projects.length ? data.projects.map((item, i) => `<article class="project"><span class="item-number">${String(i + 1).padStart(2, '0')}</span>${item.image ? `<img class="project-image" src="${escape(asset(item.image))}" alt="${text(item.title)}" loading="lazy">` : ''}<h3>${text(item.title)}</h3><p>${text(item.description)}</p><div class="tags">${(item.tags || []).map(tag => `<span>${text(tag)}</span>`).join('')}</div><div class="resource-links">${resourceLinks(item.links)}</div></article>`).join('') : [1, 2].map(i => `<article class="project placeholder"><div class="project-top"><span class="item-number">0${i}</span>${emptyBadge}</div><h3>${t.projectEmpty}</h3><p>${t.projectDescription}</p><div class="project-bottom"><span>—</span>${icon('arrow')}</div></article>`).join('')}</div></section>`;

  const extras = ['awards', 'service'].filter(enabled).map(key => `<section class="section" id="${key}">${heading(key, t[key])}${data[key].length ? `<ul class="simple-list">${data[key].map(item => `<li><span>${text(item.period)}</span><div><h3>${text(item.title)}</h3><p>${text(item.description)}</p></div></li>`).join('')}</ul>` : `<p class="placeholder">${t[`${key}Empty`]}</p>`}</section>`).join('');
  const canonical = data.site.url ? `${data.site.url.replace(/\/$/, '')}/${lang === 'zh' ? 'zh/' : ''}` : '';
  const description = localize(data.site.description, lang) || `${name} — ${t.title}`;
  return `<!doctype html>
<html lang="${t.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#f8f9f6">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape(name)} | ${t.siteTitle}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'zh_CN'}">
  ${canonical ? `<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}">` : ''}
  <title>${escape(name)} | ${t.siteTitle}</title>
  <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
  <script src="${prefix}assets/theme.js"></script>
  <link rel="stylesheet" href="${prefix}assets/styles.css">
  <script src="${prefix}assets/main.js" defer></script>
</head>
<body id="top" data-copy-label="${t.bibtex}" data-copied-label="${t.copied}" data-copy-error="${t.copyError}">
  <a class="skip-link" href="#main">${t.skip}</a>
  <header class="site-header"><div class="header-inner">
    <a class="wordmark" href="#top" aria-label="${escape(name)}"><span class="brand-symbol" aria-hidden="true">✳</span><span>${escape(name)}<span class="wordmark-separator">/</span><span class="wordmark-description">${t.siteTitle}</span></span></a>
    <div class="header-tools"><a class="language-switch" href="${lang === 'en' ? './zh/' : '../'}" lang="${t.alternateLang}" hreflang="${t.alternateLang}" aria-label="${lang === 'en' ? '切换为中文' : 'Switch to English'}">${t.alternate}</a><span class="tool-divider"></span><button class="icon-button theme-toggle" type="button" aria-label="${t.theme}" data-light-label="${t.themeLight}" data-dark-label="${t.themeDark}" hidden><span class="sun-icon">${icon('sun')}</span><span class="moon-icon">${icon('moon')}</span></button><button class="icon-button menu-toggle" type="button" aria-label="${t.menu}" aria-expanded="false" aria-controls="page-navigation" hidden>${icon('menu')}</button></div>
  </div></header>
  <div class="page-layout">
    <aside class="sidebar">
      <div class="profile-card">
        <div class="portrait${data.profile.photo ? ' has-photo' : ''}">${data.profile.photo ? `<img src="${escape(asset(data.profile.photo))}" alt="${escape(name)}">` : `<svg viewBox="0 0 220 220" fill="none" aria-hidden="true"><circle cx="110" cy="110" r="78"/><circle cx="110" cy="85" r="27"/><path d="M58 165c4-29 23-46 52-46s48 17 52 46"/><path class="portrait-axis" d="M110 12v24m0 148v24M12 110h24m148 0h24"/></svg><span class="portrait-caption">${t.portrait}</span>`}</div>
        <h2 class="profile-name">${escape(name)}<span class="name-dot">.</span></h2>
        <p class="profile-role${localize(data.profile.role, lang) ? '' : ' placeholder'}">${text(data.profile.role) || t.role}</p>
        <p class="profile-affiliation${localize(data.profile.affiliation, lang) ? '' : ' placeholder'}">${text(data.profile.affiliation) || t.affiliation}</p>
        ${localize(data.profile.location, lang) || preview ? `<p class="profile-location${localize(data.profile.location, lang) ? '' : ' placeholder'}">${icon('pin')}${text(data.profile.location) || t.location}</p>` : ''}
        <div class="profile-socials">${link(t.email, data.profile.email ? `mailto:${data.profile.email}` : '', 'social-link', icon('mail'))}${link(t.scholar, data.profile.links.scholar, 'social-link', icon('scholar'))}${link('GitHub', data.profile.links.github, 'social-link', icon('github'))}${link('ORCID', data.profile.links.orcid, 'social-link', icon('orcid'))}</div>
        ${link(data.profile.cv ? t.cv : t.cvEmpty, data.profile.cv, 'cv-button', icon('download'))}
      </div>
      <nav id="page-navigation" class="page-navigation" aria-label="${t.navigation}">${navHTML}<a href="#contact"><span class="nav-number">↳</span>${t.contact}<span class="nav-mark" aria-hidden="true">↗</span></a></nav>
      ${preview ? `<div class="preview-note"><span class="small-dot" aria-hidden="true"></span><div>${t.template}<span>${t.templateNote}</span></div></div>` : ''}
    </aside>
    <main id="main" tabindex="-1">
      <section id="about" class="about-section"><div class="about-kicker"><span class="eyebrow">01 / ${t.about}</span><span class="edition">ACADEMIC PROFILE</span></div><h1>${t.aboutTitle}<span class="name-dot">.</span></h1><div class="biography">${data.about.length ? data.about.map(p => `<p>${text(p)}</p>`).join('') : `<p class="bio-placeholder">${t.intro}</p><p class="placeholder">${t.introNote}</p>`}</div>${news}</section>
      ${research}${publications}${timeline('education')}${timeline('experience')}${projects}${extras}
      <section id="contact" class="contact-section"><span class="eyebrow">${t.contact}</span><div class="contact-content"><div><h2>${t.contactTitle}</h2><p>${text(data.contact) || t.contactDescription}</p></div>${link(data.profile.email || t.contactEmpty, data.profile.email ? `mailto:${data.profile.email}` : '', 'contact-link', icon('arrow'))}</div></section>
      <footer class="site-footer"><span>© ${new Date().getUTCFullYear()} ${escape(name)}${data.site.updated ? `<span class="footer-updated">${t.updated} ${escape(data.site.updated)}</span>` : ''}</span><a href="#top">${t.top} <span aria-hidden="true">↑</span></a></footer>
    </main>
  </div>
  <p class="sr-only" role="status" id="copy-status"></p>
  <noscript><p class="noscript-note">${t.noscript}</p></noscript>
</body>
</html>`;
}

function validate(data) {
  for (const key of ['about', 'research', 'news', 'publications', 'education', 'experience', 'projects', 'awards', 'service']) {
    if (!Array.isArray(data[key])) throw new Error(`data/site.json: "${key}" must be an array.`);
  }
  if (!data.profile || !data.site || !data.sections || !data.profile.links) throw new Error('Missing site, profile, profile.links, or sections configuration.');
  if (data.site.url) {
    const url = new URL(data.site.url);
    if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) throw new Error('site.url must be a full HTTP(S) site URL without query or hash.');
  }
  if (data.profile.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.profile.email)) throw new Error('profile.email must contain an email address without mailto:.');
  for (const item of data.publications) {
    if (!/^\d{4}$/.test(String(item.year))) throw new Error('Every publication needs a four-digit year.');
  }
}

export async function build() {
  const data = JSON.parse(await readFile(path.join(root, 'data/site.json'), 'utf8'));
  validate(data);
  // Render before clearing output: invalid input leaves the last working preview intact.
  const pages = Object.fromEntries(['en', 'zh'].map(lang => [lang, render(data, lang)]));
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, 'zh'), { recursive: true });
  await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
  await writeFile(path.join(output, 'index.html'), pages.en);
  await writeFile(path.join(output, 'zh/index.html'), pages.zh);
  await writeFile(path.join(output, '.nojekyll'), '');
  console.log('Built English and Chinese pages → dist/');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch(error => { console.error(error.message); process.exitCode = 1; });
}
