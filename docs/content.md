# 内容字段与填写方式

这里只说明格式。`data/site.json` 中目前没有填入个人内容。

## 双语文字

可本地化的文字既可以是普通字符串，也可以是双语对象：

```json
{ "en": "English text", "zh": "中文文字" }
```

页面优先使用当前语言，若为空则回退到另一种语言。输入按纯文本处理，不解析 HTML 或 Markdown；段落用 `about` 数组拆分，成果链接用 `links` 表达。

## 站点与个人信息

| 字段 | 格式 / 用途 |
| --- | --- |
| `site.url` | 正式站点完整 URL，无查询参数；暂不确定时留空，不生成 canonical |
| `site.description` | 双语搜索 / 分享摘要 |
| `site.updated` | 手动更新日期，如 `YYYY-MM-DD`；留空不显示 |
| `site.showPlaceholders` | `true` 展示空栏目的版式；`false` 隐藏空栏目 |
| `profile.name` | 双语姓名 |
| `profile.role` | 双语学术身份或职称 |
| `profile.affiliation` | 双语机构名称 |
| `profile.location` | 双语城市或办公地点 |
| `profile.photo` | 如 `assets/images/portrait.jpg` |
| `profile.email` | 只填邮箱，不含 `mailto:` |
| `profile.cv` | 如 `assets/files/cv.pdf` |
| `profile.links` | `scholar`、`github`、`orcid` 的完整 HTTPS URL |
| `about` | 段落数组，每个元素为文字或双语对象 |
| `contact` | 双语联系说明 |
| `sections` | 布尔开关；关闭后同时从正文与导航移除 |

本地文件路径从项目根目录填写，使用 `/`，不要以 `/` 或 `../` 开头。外部链接使用完整 `https://...`。无内容的链接留空，不要填 `#`。

## 条目格式

以下是字段示例，**不会出现在页面中**；填写时将对应对象加入 `data/site.json` 的数组。

### 研究方向：research

```json
{
  "title": { "en": "Research area", "zh": "研究方向" },
  "description": { "en": "Brief description.", "zh": "研究兴趣简述。" }
}
```

### 动态：news

```json
{
  "date": "2026-01-01",
  "text": { "en": "An update.", "zh": "一条学术动态。" },
  "url": ""
}
```

日期采用 `YYYY-MM-DD`。按数组顺序展示，建议最新动态放前面。`url` 可省略。

### 论文：publications

```json
{
  "title": { "en": "Paper title", "zh": "论文标题" },
  "authors": "Author A, Author B",
  "venue": "Conference / Journal / arXiv",
  "year": 2026,
  "selected": true,
  "description": { "en": "Brief summary.", "zh": "研究内容简述。" },
  "image": "",
  "links": [
    { "label": "PDF", "url": "https://example.org/paper.pdf" },
    { "label": "Code", "url": "https://github.com/example/project" }
  ],
  "bibtex": "@article{key,\n  title={Paper title},\n  year={2026}\n}"
}
```

`year` 为四位年份；`selected` 控制代表作筛选。条目按数组顺序展示，年份筛选按钮自动降序排列。`description`、`image`、`links`、`bibtex` 均可省略。BibTeX 复制在 HTTPS 正式站或 localhost 预览下使用。

### 教育经历：education

```json
{
  "institution": { "en": "Institution", "zh": "院校名称" },
  "degree": { "en": "Degree · Field", "zh": "学位 · 专业" },
  "period": "YYYY — YYYY",
  "details": [ { "en": "Advisor / thesis.", "zh": "导师或学位论文。" } ]
}
```

### 研究经历：experience

```json
{
  "role": { "en": "Research position", "zh": "研究职位" },
  "organization": { "en": "Institution / lab", "zh": "机构 / 实验室" },
  "period": "YYYY — YYYY",
  "details": [ { "en": "Research responsibilities.", "zh": "主要研究工作。" } ]
}
```

### 项目：projects

```json
{
  "title": { "en": "Project title", "zh": "项目名称" },
  "description": { "en": "Project overview.", "zh": "项目概述。" },
  "tags": ["Topic", "Tool"],
  "image": "",
  "links": [ { "label": "Code", "url": "https://github.com/example/project" } ]
}
```

### 荣誉与服务：awards / service

这两个数组均使用下面的格式，并需在 `sections` 中开启对应栏目：

```json
{
  "period": "YYYY",
  "title": { "en": "Award / service", "zh": "奖励 / 学术服务" },
  "description": { "en": "Details.", "zh": "相关说明。" }
}
```

## 正式发布前的填写

填入姓名、身份、院校与简介，配置所需的账号与 CV，然后将 `site.showPlaceholders` 设为 `false`。构建时只生成有内容且已开启的栏目页面。首页的代表论文来自标记为 `selected: true` 的条目，填写 `profile.photo` 后，首页会在简介右侧显示照片。留空时不占用版面。

如果准备公开个人内容，还可以填写 `site.description`、`site.url` 和 `site.updated`；无需修改前端布局。
