# spatial-research-site

[Quartz](https://quartz.jzhao.xyz/) site that renders the [spatial-research](https://github.com/davidydu/spatial-research) vault as a navigable research and specification website. Published at [Spatial Research](https://davidydu.github.io/spatial-research-site/).

For a fresh agent in any harness, start with [AGENTS.md](AGENTS.md) and the
[shared project handoff](https://github.com/davidydu/spatial-research/blob/main/90%20-%20Meta/project-handoff.md).
They identify the active compiler worktree, current evidence and next task.

## Architecture

Two-repo layout to keep concerns clean:

| Repo                                | Contents                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| `spatial-research`                  | The Obsidian-style markdown vault (the spec). Source of truth. |
| `spatial-research-site` (this repo) | Quartz framework, configuration, CI, and presentation files.   |

At build time, the spec is checked out into `content/`. Locally, `content/` is typically a symlink to your local clone of the spec repo:

```bash
ln -s ~/Documents/Spatial\ Research content
```

`content/` is gitignored so the symlink isn't committed.

## Local development

```bash
git clone https://github.com/davidydu/spatial-research-site.git
cd spatial-research-site
npm ci
ln -s ~/path/to/Spatial\ Research content
npm run build:site
```

Use Node 22 and npm 10.9.2 or newer, as required by `package.json`. The build resolves the content directory so Quartz's Git date lookup works with a local symlink. It builds the documentation into `public/`, then copies `presentation/` to `public/presentation/`.

To use a vault without creating the symlink:

```bash
npm run build:site -- --directory "/path/to/Spatial Research"
```

Preview the combined build with the existing static-server dependency:

```bash
node --input-type=module -e 'import http from "node:http"; import handler from "serve-handler"; http.createServer((req, res) => handler(req, res, { public: "public", cleanUrls: true })).listen(8080)'
# documentation: http://localhost:8080/
# presentation: http://localhost:8080/presentation/
# current Python presentation: http://localhost:8080/presentation/python/
```

For documentation-only live reload, use `node quartz/bootstrap-cli.mjs build -d "$(realpath content)" --serve`. Quartz rebuilds `public/`; rerun `npm run build:site` to restore the presentation after using that command.

Research content belongs in the vault. Presentation HTML, styles, scripts, and assets belong in `presentation/`. Its asset URLs are relative so the same files work locally and under the GitHub Pages project path.

## Deployment

The [deployment workflow](.github/workflows/deploy.yml) checks out this repository, anonymously clones the public vault into `content/`, runs `npm run build:site`, and publishes the documentation and presentation to GitHub Pages. The presentation is served at `/spatial-research-site/presentation/`. The workflow does not use `SPEC_REPO_PAT` or an SSH deploy key. Making the vault private would require changing this workflow.

**Other prerequisites:**

- GitHub Pages must be enabled in repo Settings → Pages → Source: GitHub Actions
- The workflow runs on push to `main`, manual dispatch, and a daily schedule (06:00 UTC) so the site picks up spec changes even without pushes here.

Publish vault changes first, then push website changes or dispatch the workflow. A successful scheduled build only proves that the remote vault was built; it does not publish unpushed local research. Verify the deployed homepage and the newly changed pages after the workflow completes.

## Content boundaries

`private/`, templates, Obsidian settings, and `90 - Meta/scripts/**` are excluded from the site. The last directory contains validation helpers and intentionally invalid test fixtures, not research pages. Research notes with `status: draft` remain visible and labeled; Quartz excludes a note only when its frontmatter has `draft: true`.

Historical research and the frozen D-26 protocol remain accessible. The homepage points readers to the current pure Python research direction following professor feedback on 30 September 2026. The earlier Rust-core proposal and presentation are marked historical; neither is the current implementation plan.

## Python presentation

The current **21 October 2026**, seven-slide, ten-minute presentation lives at
`presentation/python/` and publishes to
[Python Spatial progress](https://davidydu.github.io/spatial-research-site/presentation/python/).
It leads with working source-to-reference execution, explains the common program
model, shows the first Lab 1 tiled-memory result and reusable features, then
presents independent evidence and the Labs 1–3 implementation sequence. HLS
follows planned language/reference support. The root deck remains historical.

Use arrows or **1–7** to change slides, **N** for notes, **E** for sources and **F**
for fullscreen. Slide 2 opens the existing Excalidraw map with section navigation,
zoom and panning; the full map includes proposed, unfinished components. Slide 3
switches between actual recorded ordinary and Int32-overflow results. The page
does not run the compiler. Documentation opens in a separate tab. Print styles
include all seven slides. The deck and result views work without network access
when the presentation folder is kept intact; external documentation still needs
network access.

The complete script and verification record live in the research vault at
`90 - Meta/2026-10-21-python-progress-presentation.md`. Embedded notes mirror that
script. Fresh raw outputs and the combined demonstration record are in
`presentation/python/assets/`. They were replayed on CPython 3.14.5 at compiler
`0c7914057970d1cdf3b6a3361f68e761c812b0a6` on 21 October. The full accepted test
suites remain dated 18 October (1,244 tests per source/installed-package route).
The Lab 1 historical record differs only in semantic-revision metadata; the fresh
asset retains the current revision. See slide 5's **Evidence & limits** dialog.

Meeting validation: both example runners and the accepted composition passed;
production/execution manifests match. The integration checkpoint verifies slide
layout, navigation, case selection, notes, sources and map controls, plus the
complete site build and changed published pages.

## Why not host directly from the spec repo?

The spec repo is a pure Obsidian vault — `.md` files in flat folders. Adding `node_modules`, `package.json`, Quartz config files, and CI workflows to it would clutter the vault and break Obsidian's "everything is a note" assumption. Separating the publishing concern keeps the spec repo focused.

## Updating Quartz

To pull upstream Quartz framework changes:

```bash
git remote add upstream https://github.com/jackyzha0/quartz.git
git fetch upstream v4
git merge upstream/v4
```

## Custom domain (optional)

Add a `CNAME` file at the repo root with your domain, and configure DNS to point at `<username>.github.io`. Update `baseUrl` in `quartz.config.ts` accordingly.

## Privacy considerations

The website and both repositories are public. Content exclusions affect the website build, not Git history or repository access. Keep private material untracked in the vault and follow its publication checks before pushing.
