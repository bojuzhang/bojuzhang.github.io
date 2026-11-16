# 个人学术主页

面向 GitHub Pages 的轻量学术 CV 模板。默认英文首页，提供完整中文页面。当前只搭建框架，所有真实个人信息与条目均为空；页面中的占位用于确认版式。

页面截图：[桌面版](docs/preview-desktop.png) · [手机版](docs/preview-mobile.png) · [中文深色版](docs/preview-chinese-dark.png)。

## 模板选择

采用自定义静态模板，参考以下公开主页的内容组织，未复制其源码或引入其主题依赖：

| 参考 | 借鉴的部分 | 本项目的取舍 |
| --- | --- | --- |
| [Academic Pages](https://academicpages.github.io/) | 侧栏身份、教育、论文、学术服务等栏目 | 保留学术结构，暂不加入博客、教学和演讲的独立页面 |
| [al-folio](https://alshedivat.github.io/al-folio/) | 简介、近期动态、代表论文、CV 入口 | 保留成果的展示方式，以 JSON 管理条目；当前无需 Ruby / Jekyll |
| [Jon Barron](https://jonbarron.info/) | 论文配图、作者、会议与成果链接的紧凑排列 | 保留信息层次，补充侧栏导航、中文及移动端适配 |

选择这个方案，是因为当前目标是先确认学术主页框架，日后按条目逐步补充内容。原生 HTML / CSS / JavaScript 加一个 Node.js 构建脚本即可满足需求，不必先维护完整主题的插件与依赖。

如果后续需要 BibTeX 自动导入、大量 Markdown 博文或数学公式，可再扩展构建流程；当前论文条目已有 BibTeX 复制入口，但没有自动解析 `.bib` 文件。

## 已包含

- 身份侧栏：照片、学术身份、院校、位置、邮箱、Google Scholar、GitHub、ORCID、CV PDF。
- 学术正文：简介、近期动态、研究方向、论文、教育经历、研究经历、研究项目。
- 可选栏目：荣誉奖励、学术服务，默认关闭。
- 英文 `/` 与中文 `/zh/`，文字可分别填写；缺少一种语言时回退到另一种。
- 浅色 / 深色主题，跟随系统并记住手动选择。
- 手机导航、滚动位置提示、键盘焦点、减少动态效果、打印样式。
- 有真实论文后自动显示代表作与年份筛选；有 BibTeX 后显示复制按钮。
- 构建时生成完整 HTML，关闭 JavaScript 也能阅读；未配置的链接不会跳转。
- GitHub Actions 构建并发布 `dist/`，站点本身没有外部字体、CDN 或 API 依赖。

## 本地预览

需要 Node.js 18 或更新版本。没有第三方依赖，无需运行 `npm install`。

```bash
npm run dev
```

打开 <http://127.0.0.1:4173/>，中文为 <http://127.0.0.1:4173/zh/>。

修改 `data/`、`assets/` 后会自动重新构建，手动刷新浏览器查看。修改构建脚本后重启命令。

```bash
npm run build       # 生成 dist/
npm run preview     # 构建并预览
npm run dev -- --port 8080
```

默认只监听本机。如需在局域网设备查看，可运行 `npm run dev -- --host 0.0.0.0`。不要直接双击源文件：HTML 由构建脚本生成。

## 文件结构

```text
data/site.json                 个人信息、双语内容、栏目开关
assets/styles.css             排版、配色、响应式与打印样式
assets/main.js                主题、导航、论文筛选、BibTeX 复制
assets/theme.js               首屏主题设置
assets/favicon.svg            通用站点图标
assets/images/                后续放个人照片、论文配图
assets/files/                 后续放 CV PDF、论文文件
scripts/build.mjs             从内容数据生成双语 HTML
scripts/serve.mjs             本地预览与文件监听
.github/workflows/pages.yml    GitHub Pages 自动部署
docs/content.md               字段说明与后续填写示例
dist/                         构建产物，不提交到源码仓库
```

## 后续填写

所有个人信息集中在 [`data/site.json`](data/site.json)，不需要改页面模板。详细格式见 [`docs/content.md`](docs/content.md)。

确认版式后，建议依次补充：身份与照片 → 简介与研究方向 → 教育经历 → 论文 → 研究经历与项目 → 联系方式与 CV。

`site.showPlaceholders` 当前为 `true`。正式使用时设为 `false`，空的成果和经历栏目会自动隐藏。也可通过 `sections` 逐个关闭栏目。

## 发布到你的 .github.io 域名

本项目的部署目标为 **https://bojuzhang.github.io/**，源码仓库为 [bojuzhang/bojuzhang.github.io](https://github.com/bojuzhang/bojuzhang.github.io)。站点地址与自动部署工作流已配置，发布结果见仓库的 [Actions](https://github.com/bojuzhang/bojuzhang.github.io/actions)。以下为首次部署与后续维护的通用步骤。

1. 在你的 GitHub 账号下创建名为 **`<你的 GitHub 用户名>.github.io`** 的仓库。使用 GitHub Free 时可选择公开仓库。
2. 把本项目源码上传到该仓库的 **`main`** 分支，保留 `.github/workflows/pages.yml`。上传的是源码，不是单独的 `dist/`。
3. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
4. 若设置完成前首次工作流失败，在 **Actions** 页面重新运行 `Deploy academic homepage to GitHub Pages`。
5. 工作流成功后，访问 **`https://<你的 GitHub 用户名>.github.io/`**。
6. 后续在 `main` 推送修改即可自动更新。

构建流程只上传 `dist/`，不会将源码、文档或其他工作目录文件作为网站发布。需要不同发布分支时，修改工作流的 `on.push.branches`。

仓库名称决定是否使用根域名：`<用户名>.github.io` 是用户站点；普通项目仓库通常位于 `https://<用户名>.github.io/<仓库名>/`。模板资源和语言链接使用相对路径，两种形式都支持。

上线时把 `site.url` 设成完整站点地址，例如 `https://<用户名>.github.io`，以生成正确的 canonical 地址。不要为默认 `.github.io` 域名添加 `CNAME`，也无需购买域名。

官方依据：[用户站点快速入门](https://docs.github.com/en/pages/quickstart)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
