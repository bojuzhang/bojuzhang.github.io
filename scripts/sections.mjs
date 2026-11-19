const emptyMessages = {
  research: ['Research interests will appear here.', '研究方向待补充。'],
  publications: ['No publications listed yet.', '暂无已收录的论文。'],
  education: ['Education details will appear here.', '教育经历待补充。'],
  experience: ['Research appointments will appear here.', '研究任职与工作经历待补充。'],
  projects: ['No projects listed yet.', '暂无已收录的研究项目。'],
  awards: ['No awards listed yet.', '荣誉奖励待补充。'],
  service: ['Academic service will appear here.', '学术服务待补充。'],
  news: ['No updates yet.', '暂无动态。'],
  contact: ['Contact details will appear here.', '联系方式待补充。']
};

function empty(key, ctx) {
  return `<p class="section-empty">${ctx.words(...emptyMessages[key])}</p>`;
}

function paragraph(value, ctx, className = '') {
  const text = ctx.txt(value);
  return text ? `<p class="${className}">${text}</p>` : '';
}

function resources(links = [], ctx) {
  return links.filter(link => link.url && ctx.txt(link.label))
    .map(link => `<a class="resource" href="${ctx.url(link.url)}">${ctx.txt(link.label)}</a>`)
    .join('');
}

function renderPaper(item, ctx) {
  const image = item.image ? `<img class="paper-image" alt="" src="${ctx.url(item.image)}" loading="lazy">` : '';
  const abstract = ctx.txt(item.description);
  const citation = item.bibtex ? `
    <details class="paper-citation">
      <summary>BibTeX</summary>
      <pre><code>${ctx.esc(item.bibtex)}</code></pre>
      <button class="copy-citation resource" type="button" hidden>${ctx.words('Copy BibTeX', '复制 BibTeX')}</button>
      <span class="copy-feedback" aria-live="polite"></span>
    </details>` : '';
  const links = resources(item.links, ctx);
  const abstractDetails = abstract
    ? `<details class="paper-abstract"><summary>${ctx.words('Abstract', '摘要')}</summary><p>${abstract}</p></details>`
    : '';
  return `<article class="paper-record" data-year="${ctx.esc(item.year)}" data-selected="${item.selected === true}">
    ${image}
    <div class="paper-text">
      <h3>${ctx.txt(item.title)}</h3>
      ${paragraph(item.authors, ctx, 'paper-authors')}
      <p class="paper-venue">${[ctx.txt(item.venue), ctx.esc(item.year)].filter(Boolean).join(' · ')}</p>
      ${abstract || links || citation ? `<div class="paper-controls">${abstractDetails}${links}${citation}</div>` : ''}
    </div>
  </article>`;
}

export function renderPapers(items, ctx) {
  if (!items.length) return empty('publications', ctx);
  return `<div class="paper-list">${items.map(item => renderPaper(item, ctx)).join('')}</div>`;
}

function publications(ctx) {
  const { data, words, esc } = ctx;
  if (!data.publications.length) return empty('publications', ctx);

  const groups = new Map();
  for (const paper of data.publications) {
    const year = String(paper.year);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(paper);
  }
  const years = [...groups.keys()].sort((a, b) => Number(b) - Number(a));
  const filters = [['all', words('All papers', '全部论文')], ['selected', words('Selected', '代表论文')],
    ...years.map(year => [year, year])];
  const buttons = filters.map(([key, label]) =>
    `<button type="button" data-filter="${esc(key)}" aria-pressed="${key === 'all'}">${esc(label)}</button>`).join('');
  const entries = years.map(year => `
    <section class="year-group" aria-label="${esc(year)}">
      <h2>${esc(year)}</h2>
      ${renderPapers(groups.get(year), ctx)}
    </section>`).join('');
  return `<div class="publication-archive">
    <div class="paper-filters" role="group" aria-label="${words('Filter publications', '筛选论文')}" hidden>${buttons}</div>
    ${entries}
    <p class="filter-empty section-empty" role="status" hidden>${words('No matching publications.', '没有符合条件的论文。')}</p>
  </div>`;
}

function records(key, ctx) {
  const { data, txt } = ctx;
  const fields = {
    education: ['degree', 'institution'],
    experience: ['role', 'organization'],
    awards: ['title', 'description'],
    service: ['title', 'description']
  };
  const [title, subtitle] = fields[key];
  if (!data[key].length) return empty(key, ctx);
  return data[key].map(item => {
    const details = (item.details || []).map(txt).filter(Boolean);
    const primary = txt(item[title]) || txt(item[subtitle]);
    return `<article class="archive-row">
      <div class="archive-date">${txt(item.period)}</div>
      <div class="archive-body">
        ${primary ? `<h2>${primary}</h2>` : ''}
        ${txt(item[title]) ? paragraph(item[subtitle], ctx, 'archive-subtitle') : ''}
        ${details.length ? `<ul>${details.map(detail => `<li>${detail}</li>`).join('')}</ul>` : ''}
      </div>
    </article>`;
  }).join('');
}

function news(ctx) {
  const { data, esc, txt, url } = ctx;
  if (!data.news.length) return empty('news', ctx);
  return data.news.map(item => `
    <article class="archive-row news-entry">
      <time class="archive-date" datetime="${esc(item.date)}">${esc(item.date)}</time>
      <p>${item.url ? `<a href="${url(item.url)}">${txt(item.text)}</a>` : txt(item.text)}</p>
    </article>`).join('');
}

function research(ctx) {
  if (!ctx.data.research.length) return empty('research', ctx);
  return ctx.data.research.map(item => `<article class="research-entry">
    <h2>${ctx.txt(item.title)}</h2>${paragraph(item.description, ctx)}
  </article>`).join('');
}

function projects(ctx) {
  if (!ctx.data.projects.length) return empty('projects', ctx);
  const cards = ctx.data.projects.map(item => {
    const tags = (item.tags || []).map(ctx.txt).filter(Boolean);
    const links = resources(item.links, ctx);
    return `<article class="project-card">
      ${item.image ? `<img alt="" src="${ctx.url(item.image)}" loading="lazy">` : ''}
      <div class="project-card-body">
        <h2>${ctx.txt(item.title)}</h2>
        ${paragraph(item.description, ctx)}
        ${tags.length ? `<ul class="project-tags">${tags.map(tag => `<li>${tag}</li>`).join('')}</ul>` : ''}
        ${links ? `<div class="resource-row">${links}</div>` : ''}
      </div>
    </article>`;
  });
  return `<div class="project-index">${cards.join('')}</div>`;
}

function contact(ctx) {
  const { data, words, txt, url, esc } = ctx;
  const { profile } = data;
  const rows = [];
  if (profile.email) rows.push([words('Email', '邮箱'), `<a href="${url('mailto:' + profile.email)}">${esc(profile.email)}</a>`]);
  if (txt(profile.location)) rows.push([words('Location', '地点'), txt(profile.location)]);
  for (const [key, label] of [['scholar', 'Google Scholar'], ['github', 'GitHub'], ['orcid', 'ORCID']]) {
    const link = profile.links[key];
    if (link) rows.push([label, `<a href="${url(link)}">${esc(link)}</a>`]);
  }
  const intro = paragraph(data.contact, ctx, 'contact-intro');
  if (!rows.length) return intro || empty('contact', ctx);
  return `${intro}<dl class="contact-details">${rows.map(([label, value]) =>
    `<div class="archive-row"><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
}

export function renderSection(key, ctx) {
  switch (key) {
    case 'research': return research(ctx);
    case 'publications': return publications(ctx);
    case 'projects': return projects(ctx);
    case 'news': return news(ctx);
    case 'contact': return contact(ctx);
    case 'education':
    case 'experience':
    case 'awards':
    case 'service': return records(key, ctx);
    default: throw new Error(`Unknown section: ${key}`);
  }
}
