# Working on the Spatial documentation site

Read `README.md` and the shared research handoff:
`/Users/david/Documents/Spatial Research/90 - Meta/project-handoff.md`, or
[the tracked copy](https://github.com/davidydu/spatial-research/blob/main/90%20-%20Meta/project-handoff.md).
No private harness memory is required.

- This repository owns Quartz configuration, the build and `presentation/`.
  Research content belongs in `davidydu/spatial-research`; compiler code and
  current implementation state belong on `spatial-py`'s `work/initial-reference`.
- The active Python deck is `presentation/python/`; the root deck is historical.
  Slides and interactive examples illustrate the proposal. Check compiler
  evidence before claiming progress or labeling an illustration as execution.
- Use `npm run build:site -- --directory '<research checkout>'` for the complete
  documentation/presentation build. Do not edit generated `public/` or CI content.
- Publish research first. Site `main` pushes and workflow dispatches deploy the
  remote research repository. Verify the actual run and changed live pages.
- Prefer file/build checks for documentation. Inspect visual layout and exercise
  navigation, notes and diagram controls when changing the presentation.
- Keep shared context in README, the research handoff and its progress log.
  Record new decisions, corrections, unresolved issues and restart steps there.
  `CLAUDE.md` is an entry pointer, not another memory store.

Use bounded parallel agents where useful; the integrating agent reviews results
and owns Git mutations. Follow the research handoff's current model preferences.
