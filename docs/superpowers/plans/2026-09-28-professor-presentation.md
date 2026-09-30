# Professor presentation implementation plan

**Goal:** Build the approved seven-screen Spatial research presentation, with plain copy, architecture diagrams, a documentation tour and source links.

**Architecture:** A standalone static page at `presentation/`, copied into the Quartz output by the site build. All presentation assets and fonts work locally. Documentation links are relative to the site root so the same build works locally and on GitHub Pages.

**Stack:** HTML, CSS, browser JavaScript, existing Node/Quartz build.

The user approved the outline and style in this task and requested implementation on September 28, 2026. Professor approval of the compiler architecture remains pending. Scope is presentation and documentation, not compiler implementation.

## Tasks

- [x] Create `presentation/index.html`: seven semantic sections, actual source references, speaker notes, evidence dialog, documentation tour and print layout. Show current, historical and proposed status explicitly. Use the approved outline in the research vault as the content specification.
- [x] Create `presentation/presentation.css`: warm white, dark text, blue accent, large system serif headings, sans-serif diagrams, responsive layouts, reduced-motion and print styles. No external fonts or decorative animation.
- [x] Create `presentation/presentation.js`: previous/next and direct section navigation, URL fragments, architecture emphasis controls, native dialogs, notes, keyboard controls and fullscreen. Do not consume keyboard events from inputs, links, buttons or the embedded documentation page.
- [x] Capture the real documentation website into `presentation/assets/docs-preview.jpg`. Add a local iframe tour with recommendation, evidence and specification entry points; retain the screenshot as a fallback.
- [x] Integrate the page into the existing site build and deployment workflow. Keep publication blocked by the existing credential issue; do not retry or change authentication.
- [x] Review copy and factual boundaries with Codex agents. Review implementation for navigation, focus, relative links and layout defects.
- [x] Build using `npm run build:site -- --directory "/path/to/Spatial Research"`. Check modified JavaScript syntax, repository whitespace and formatting; inspect all seven screens in the browser at desktop size, then a smaller viewport. Exercise keyboard navigation, deep links, notes, evidence, tour return and fullscreen. Inspect print rules and offline presentation assets.
- [x] Update the research outline, professor brief and progress log with the presentation entry point and verification results. Leave the working presentation open for review.

## Acceptance

Seven screens match the approved story. No unsupported claim of a finished Python frontend or general compiler appears. Historical HLS evidence is dated and qualified. The first milestone ends at exact simulation. Documentation can be explored and closed without losing the current screen. Content remains readable on laptop/projector layouts and a narrow screen. The page and source links work with the GitHub Pages base path. A local working result is delivered; public deployment is not claimed.

## Verification — 28 September 2026

- Combined documentation/presentation build passed: 510 Markdown inputs, 1100 Quartz outputs, then the presentation assets copied into the output.
- JavaScript syntax, scoped Prettier checks, and repository whitespace checks passed. Frontmatter in all four changed research documents parses.
- All 22 local presentation references and anchors resolve. The homepage, professor brief, and outline all link to the built presentation with full-page navigation. Presentation source assets match the built copies.
- Inspected every screen at 1280 × 720. Checked all seven screens at 390 × 844 with no horizontal overflow. At 1024 × 768, all screens fit the available slide area after reducing the documentation preview height.
- Exercised previous/next, direct section links, architecture controls followed by keyboard navigation, notes open/close followed by keyboard navigation, source dismissal with Escape, fullscreen control entry/exit, documentation page selection, saved-preview return, and return to the original slide.
- Codex copy review removed a manufactured phrase and moved hardware semantics out of the Rust-specific rationale. Code review found and verified fixes for keyboard handling on buttons, snapshot/return-control layout, and skip-link navigation. No remaining concrete blockers in the final review.
- Print styles were inspected in code; no exported PDF is claimed. Public deployment remains pending because the existing GitHub credential lacks write access. No push or credential change was attempted.
- Compiler source and historical vendor evidence are unchanged. The only compiler working-tree items remain the pre-existing untracked local artifacts.

## Explanatory copy update — 30 September 2026

- Added visible explanations across all seven slides: prototype progress, the documentation workflow, the move from program recognition to language rules, Python and Rust responsibilities, the architecture rationale, the tiled-scale example, and the approval request.
- Replaced short fragments with sentences and explained what simulation and HLS generation do. Kept the historical evidence qualifications and the proposal's approval status.
- Adjusted paragraph width, spacing, and documentation preview height to accommodate the added text.
- The combined site build passed with 510 Markdown inputs and 1100 Quartz outputs. Formatting and whitespace checks passed. Final presentation assets match their built copies.
- Browser checks found no slide overflow at 1280 × 720 or 1024 × 768 and no horizontal page overflow across all seven slides at 390 × 844. Visually reviewed the revised slides and mobile text wrapping.
- This update is local; no public deployment was attempted.
