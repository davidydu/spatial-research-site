# spatial-research-site

[Quartz](https://quartz.jzhao.xyz/) site that renders the [spatial-research](https://github.com/davidydu/spatial-research) vault as a navigable research and specification website. Published at [Spatial Research](https://davidydu.github.io/spatial-research-site/).

## Architecture

Two-repo layout to keep concerns clean:

| Repo                                | Contents                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| `spatial-research`                  | The Obsidian-style markdown vault (the spec). Source of truth. |
| `spatial-research-site` (this repo) | Quartz framework + config + CI. No content of its own.         |

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
node quartz/bootstrap-cli.mjs build -d "$(realpath content)" --serve
# preview at http://localhost:8080
```

Use Node 22 and npm 10.9.2 or newer, as required by `package.json`. Passing the resolved content directory lets Quartz's Git date lookup work with a local symlink. Content changes belong in the vault; website configuration belongs here.

## Deployment

The [deployment workflow](.github/workflows/deploy.yml) checks out this repository, anonymously clones the public vault into `content/`, builds Quartz, and publishes to GitHub Pages. It does not use `SPEC_REPO_PAT` or an SSH deploy key. Making the vault private would require changing this workflow.

**Other prerequisites:**

- GitHub Pages must be enabled in repo Settings → Pages → Source: GitHub Actions
- The workflow runs on push to `main`, manual dispatch, and a daily schedule (06:00 UTC) so the site picks up spec changes even without pushes here.

Publish vault changes first, then push website changes or dispatch the workflow. A successful scheduled build only proves that the remote vault was built; it does not publish unpushed local research. Verify the deployed homepage and the newly changed pages after the workflow completes.

## Content boundaries

`private/`, templates, Obsidian settings, and `90 - Meta/scripts/**` are excluded from the site. The last directory contains validation helpers and intentionally invalid test fixtures, not research pages. Research notes with `status: draft` remain visible and labeled; Quartz excludes a note only when its frontmatter has `draft: true`.

Historical research and the frozen D-26 protocol remain accessible. The homepage points readers to the current recommendation and approval brief, which distinguish proposed architecture from implemented capabilities.

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
