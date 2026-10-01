# Python Spatial presentation implementation plan

> **For agentic workers:** Use scoped parallel tasks and review their changes before publishing. The user approved the seven-slide outline on 1 October 2026 and requested a vivid presentation. Existing authorization covers Codex-only delegation and publication to davidydu repositories.

**Goal:** Build a ten-minute web presentation answering what a pure Python rewrite of Spatial would look like, before discussing HLS.

**Architecture:** Add a standalone deck at `presentation/python/`, which the existing build copies automatically. Preserve the historical deck at `presentation/`. HTML holds the complete content and notes, CSS controls the editorial layout, and a small JavaScript module handles navigation and illustrative interactions.

**Tech stack:** Semantic HTML, CSS, browser JavaScript, existing Quartz build. No new dependencies.

## Approved content and design

Seven slides: Spatial in Python (0:45), tiled program (2:00), host Python and captured kernel (1:30), Python compiler (1:30), behavior and simulation (1:30), research and documentation (1:15), first implementation milestone (1:30). Follow one 32-element program with 16-element tiles. All kernel syntax is proposed. Interactive calculations illustrate intended behavior and are not compiler execution. The only HLS discussion is the future step on the closing slide.

Use the existing paper, serif headline and muted blue style, with readable source highlighting, an animated load/compute/store diagram and a branch/queue illustration. Every slide has verbal speaker notes and evidence links. Support keyboard navigation, URL fragments, fullscreen, reduced motion, narrow viewports and printing.

## Tasks

- [x] Save the approved outline and full simple speaking script in the research vault. Link the new deck from the current Python research pages. Keep research and implementation status distinct.
- [x] Create `presentation/python/index.html` with seven sections, source links, notes, documentation links and semantic controls. Match the E1 kernel in PY-R001 exactly.
- [x] Create `presentation/python/presentation.css` with the existing visual identity, clear responsive layouts, print rules and reduced-motion support.
- [x] Create `presentation/python/presentation.js` for chapter navigation, notes, fullscreen, tile phases, expected-result illustration and lazy branch effects. Avoid implying any compiled execution.
- [x] Update site README with the new route. Preserve historical assets. Verify links in the combined build.
- [x] Run `node --check presentation/python/presentation.js`, targeted Prettier and `git diff --check`. Build via `npm run build:site -- --directory '/Users/david/Documents/Spatial Research'`.
- [x] Inspect the rendered slides and exercise navigation, notes, interactions and documentation links. Check desktop and laptop layouts, narrow screens, reduced motion and print styling. Repair material issues.
      Publication follows these checks: commit only relevant changes, publish the vault before the site, confirm the Pages deployment and verify the new live route. Record that result separately from this local build checkpoint.

## Ownership

Parent: HTML, JavaScript, integration, verification and publishing.
Visual agent: only the new presentation CSS.
Content agent: new outline/script in the vault and current presentation links.
Reviewer: read-only semantic review of the finished presentation against the Python research contracts.
