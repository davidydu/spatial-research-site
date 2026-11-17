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
# language deck (16 November): http://localhost:8080/presentation/language/
# efficiency deck (16 November): http://localhost:8080/presentation/efficiency/
# 22 October deck: http://localhost:8080/presentation/python/
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

## Student documentation

The [Python Spatial student guide](https://davidydu.github.io/spatial-research-site/50---Python-Rewrite/70---Student-Guide/00---Python-Spatial-Student-Guide)
is maintained in the research vault under `50 - Python Rewrite/70 - Student Guide/`.
It starts with functional testing and custom final-project tests. Ordinary Python
test code drives generated C++ execution; independently specified cases can feed
HLS and RTL testbenches. The pages clearly distinguish current internal tools
from planned public wrappers. Update the vault source rather than generated site
content. Compiler implementation and HLS execution remain paused for the meeting.

## Presentations

The language deck, **16 November 2026 (evening)**, thirteen slides for the professor,
compares every Spatial construct EE 109's lectures and Labs 1 to 3 use with its Python
Spatial spelling and its state (runs, in review, designed, next, later). It lives at
`presentation/language/` and publishes to
[Python Spatial: the language against EE 109](https://davidydu.github.io/spatial-research-site/presentation/language/).
It reuses the efficiency deck's script and styles, with code-pair, feature-table and
state-tag styles added at the end of its `presentation.css`; arrows change slides, **N**
opens the notes, **E** the evidence links. The full table is the vault's
`50 - Python Rewrite/20 - Examples/PY-E003 - EE109 Feature Coverage.md`; the speaking
script is `90 - Meta/2026-11-16-language-presentation.md`. Refresh its states from the
compiler's support ledger as slices merge. Course code is never copied into it.

The efficiency deck, **16 November 2026**, eight slides on compiler efficiency (where the
compiled hardware loses its cycles, the first fix in the compiler, the prototypes and
the course wrapper's bug), lives at `presentation/efficiency/` and publishes to
[Python Spatial: compiler efficiency](https://davidydu.github.io/spatial-research-site/presentation/efficiency/).
It reuses the October deck's styles with a smaller script: arrows or **1–8** change
slides, **N** opens the speaker notes, **E** the evidence links and **F** fullscreen.
Its figures are generated by `presentation/efficiency/assets/figures.py`; every number
is a saved measurement in the compiler repository. The speaking script is the vault's
`90 - Meta/2026-11-16-compiler-efficiency-presentation.md`.

The **22 October 2026**, seven-slide, ten-minute presentation lives at
`presentation/python/` and publishes to
[Python Spatial progress](https://davidydu.github.io/spatial-research-site/presentation/python/).
It follows the professor's direction to replace the earlier Python-frontend/Rust-core
proposal with a fully Python compiler. It explains the implemented architecture
and presents one Lab 1 tiled-memory example through generated C++, Vitis HLS and
RTL simulation as an initial working path. Wider coverage and useful hardware
performance remain the next work. The root deck remains historical.

Use arrows or **1–7** to change slides, **N** for notes, **E** for sources and **F**
for fullscreen. Slide 2 opens the existing Excalidraw map with section navigation,
zoom and panning; its full design includes unfinished components. Slide 3 switches
between the ordinary and Int32-overflow outputs verified in the saved pipeline.
The page displays saved evidence and does not execute a compiler. Documentation
opens in another tab. Print styles include all seven slides; the local deck and
its bundled assets work offline.

The full verbal script and evidence record live in the research vault at
`90 - Meta/2026-10-22-python-pipeline-presentation.md`. Embedded speaker notes
match that script. The previous dated meeting note remains historical.

`assets/meeting-pipeline-record.json` binds the shown outputs to the saved
21 October native/reference and Vitis evidence. Vendor production `da4d35f`,
acceptance `0ac7c00`, validates four kernels/nine cases; the main talk concentrates
on the two-case Lab 1 program. The assets include the exact co-simulation report,
the Python source and a labelled RTL post-check log excerpt with source hashes.
These are sequential IP simulations, not FPGA board execution or optimized
parallel performance.

The newer scalar/shift checkpoint is separate: 1,329 source and 1,329 installed
package tests passed on 21 October; its twelve projects/32 cases await vendor
execution. The presentation does not attach the older RTL result to those newer
features. David paused implementation and HLS work for this meeting. This refresh
reads saved evidence and changes no compiler behavior.

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
