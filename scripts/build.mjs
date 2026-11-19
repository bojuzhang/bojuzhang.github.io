import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';
import { renderSection, renderPapers } from './sections.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const output = path.join(root, 'dist');
const engine = new Liquid({
  root: path.join(root, 'templates'),
  extname: '.liquid',
  outputEscape: 'escape',
  jsTruthy: true
});

const sections = {
  about: ['About', '关于'],
  research: ['Research', '研究方向'],
  publications: ['Publications', '论文'],
  education: ['Education', '教育经历'],
  experience: ['Experience', '研究经历'],
  projects: ['Projects', '项目'],
  news: ['News', '动态'],
  contact: ['Contact', '联系'],
  awards: ['Honors & awards', '荣誉奖励'],
  service: ['Academic service', '学术服务']
};
const mainPages = ['about', 'research', 'publications', 'education', 'experience', 'projects'];
const subtitles = {
  research: ['Research interests and questions.', '研究兴趣与关注的问题。'],
  publications: ['Papers and preprints, organized by year.', '按年份收录论文与预印本。'],
  education: ['Degrees and academic training.', '学位与学术训练。'],
  experience: ['Research appointments and professional experience.', '研究任职与专业经历。'],
  projects: ['Research projects and their accompanying materials.', '研究项目与相关资料。'],
  news: ['Recent academic updates.', '近期学术动态。'],
  contact: ['Correspondence and academic profiles.', '邮箱与学术账号。'],
  awards: ['Honors and distinctions.', '荣誉与奖项。'],
  service: ['Teaching, reviewing, and community service.', '教学、评审与学术社区服务。']
};
const locale = { en: 'en', zh: 'zh-CN' };
const dir = (key, lang) => (lang === 'zh' ? 'zh/' : '') + (key === 'about' ? '' : key + '/');
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[c]);
const localize = (value, lang) => typeof value === 'string' ? value : value?.[lang] || value?.en || value?.zh || '';

function assetURL(value, prefix) {
  if (!value) return '';
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  if (/^[\w./-]+$/.test(value) && !value.startsWith('/') && !value.split('/').includes('..')) return prefix + value;
  throw new Error('Invalid URL in site data: ' + value);
}

function visiblePages(data) {
  const contact = data.contact;
  const hasContact = typeof contact === 'string' ? contact : Object.values(contact || {}).some(Boolean);
  return Object.keys(sections).filter(key => {
    if (key === 'about') return true;
    if (data.sections[key] === false) return false;
    if (data.site.showPlaceholders) return true;
    if (key === 'contact') return hasContact || data.profile.email ||
      localize(data.profile.location, 'en') || Object.values(data.profile.links).some(Boolean);
    return data[key].length > 0;
  });
}

function homeModel(ctx, pages, rawURL) {
  const { data, lang, words, route } = ctx;
  const local = value => localize(value, lang);
  const { profile, site } = data;
  const subtitle = [local(profile.role), local(profile.affiliation)].filter(Boolean).join(' · ');
  const paragraphs = data.about.map(local).filter(Boolean);
  if (!paragraphs.length && site.showPlaceholders) {
    paragraphs.push(words('Biography forthcoming.', '个人简介待补充。'));
  }
  const socials = [
    [words('Email', '邮箱'), profile.email && 'mailto:' + profile.email],
    ['Google Scholar', profile.links.scholar], ['ORCID', profile.links.orcid], ['GitHub', profile.links.github],
    ['CV', profile.cv]
  ].filter(([, href]) => href).map(([label, href]) => ({label, href:rawURL(href)}));
  const papers = data.publications.filter(item => item.selected).slice(0,3);
  const selected = pages.includes('publications') && (papers.length || site.showPlaceholders) ? {
    title:words('Selected publications', '代表论文'), href:route('publications'),
    html:papers.length ? renderPapers(papers,ctx) : '', empty:words('No selected publications yet.', '暂无代表论文。'),
  } : null;
  const news = pages.includes('news') ? {
    title:words('News', '近期动态'), href:route('news'),
    empty:words('No announcements yet.', '暂无学术动态。'),
    items:data.news.slice(0,3).map(item => ({date:item.date, text:local(item.text), href:rawURL(item.url)}))
  } : null;
  return {
    profile: { name:local(profile.name) || 'bojuzhang', subtitle, location:local(profile.location),
      image:rawURL(profile.photo), alt:local(profile.name) || words('Profile photo','个人照片') },
    paragraphs, socials, selected, news
  };
}

async function renderPage(data, lang, key, pages) {
  const folder = dir(key, lang);
  const prefix = folder ? '../'.repeat(folder.split('/').filter(Boolean).length) : './';
  const route = (key, language = lang) => prefix + dir(key, language);
  const words = (en, zh) => lang === 'en' ? en : zh;
  const rawURL = value => assetURL(value, prefix);
  const ctx = { data, lang, esc, words, route,
    txt:value => esc(localize(value, lang)), url:value => esc(rawURL(value)) };
  const items = keys => keys.filter(k => pages.includes(k)).map(k => ({
    label:words(...sections[k]), href:route(k), current:k === key
  }));
  const name = localize(data.profile.name, lang);
  const brand = name || 'bojuzhang';
  const pageTitle = key === 'about' ? words('Academic profile', '学术主页') : words(...sections[key]);
  const description = key === 'about' ? localize(data.site.description, lang) || pageTitle : words(...subtitles[key]);
  const content = key === 'about'
    ? await engine.renderFile('about', homeModel(ctx, pages, rawURL))
    : await engine.renderFile('page', {
      page:{title:pageTitle, description},
      content:renderSection(key, ctx)
    });
  const base = data.site.url && data.site.url.replace(/\/$/, '') + '/';
  const other = lang === 'en' ? 'zh' : 'en';
  return engine.renderFile('layout', {
    content, locale:locale[lang], title:pageTitle + ' · ' + brand, description,
    canonical:base && base + folder,
    languages:Object.keys(locale).map(code => ({code:locale[code], href:base + dir(key, code)})),
    prefix, brand, isHome:key === 'about', home:route('about'), menu:items(mainPages),
    footerMenu:items(['news','awards','service','contact']),
    alternate:{href:route(key,other), locale:locale[other], short:words('中文','EN'), name:words('中文版','English version')},
    year:new Date().getUTCFullYear(), updated:data.site.updated,
    hasPapers:key === 'publications' || key === 'about',
    ui:{skip:words('Skip to content', '跳到正文'), menu:words('Menu','菜单'),
      navigation:words('Main navigation','主导航'), more:words('More pages','更多页面'),
      theme:words('Switch theme','切换主题'), dark:words('Use dark theme','切换深色模式'),
      light:words('Use light theme','切换浅色模式'), themeCredit:words('Theme adapted from','主题源自'),
      updated:words('Updated','更新于')}
  });
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
  const pages = visiblePages(data);
  const files = [];
  for (const lang of Object.keys(locale)) {
    for (const key of pages) {
      files.push({folder:dir(key, lang), html:await renderPage(data, lang, key, pages)});
    }
  }
  await rm(output, {recursive:true, force:true});
  await mkdir(output, {recursive:true});
  await cp(path.join(root, 'assets'), path.join(output, 'assets'), {recursive:true});
  for (const {folder, html} of files) {
    const parent = path.join(output, folder);
    await mkdir(parent, {recursive:true});
    await writeFile(path.join(parent, 'index.html'), html);
  }
  await writeFile(path.join(output, '.nojekyll'), '');
  console.log('Built ' + files.length + ' English and Chinese pages in dist/.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch(error => { console.error(error.message); process.exitCode = 1; });
}
