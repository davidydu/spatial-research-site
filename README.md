# spatial-research-site

[Quartz](https://quartz.jzhao.xyz/) site that renders the [spatial-research](https://github.com/davidydu/spatial-research) spec vault as a navigable static site. Deployed to GitHub Pages.

## Architecture

Two-repo layout to keep concerns clean:

| Repo | Contents |
|---|---|
| `spatial-research` | The Obsidian-style markdown vault (the spec). Source of truth. |
| `spatial-research-site` (this repo) | Quartz framework + config + CI. No content of its own. |

At build time, the spec is checked out into `content/`. Locally, `content/` is typically a symlink to your local clone of the spec repo:

```bash
ln -s ~/Documents/Spatial\ Research content
```

`content/` is gitignored so the symlink isn't committed.

## Local development

```bash
git clone https://github.com/davidydu/spatial-research-site.git
cd spatial-research-site
npm install
ln -s ~/path/to/Spatial\ Research content
npx quartz build --serve         # preview at http://localhost:8080
```

## Deployment

The `.github/workflows/deploy.yml` workflow checks out both repos at build time, builds Quartz, and publishes to GitHub Pages.

**Prerequisite — content access.** The workflow uses `actions/checkout@v4` to fetch the spec repo into `content/`. If the spec repo is public, this works with the default `github.token`. If the spec repo is private, you need one of:

1. **Personal access token (PAT) approach** — easiest:
   - Create a fine-grained PAT with read access to `davidydu/spatial-research`
   - Add it as `SPEC_REPO_PAT` in this repo's Secrets and variables → Actions
   - The workflow uses `secrets.SPEC_REPO_PAT` automatically if set
2. **Deploy key approach** — more secure but more setup:
   - Generate an SSH keypair: `ssh-keygen -t ed25519 -f deploy_key -N ""`
   - Add public half as a read-only deploy key on `davidydu/spatial-research`
   - Add private half as `SSH_DEPLOY_KEY` in this repo's Secrets
   - Modify the workflow to use `ssh-key` instead of `token`
3. **Make spec repo public** — simplest, but visibility change required.

**Other prerequisites:**

- GitHub Pages must be enabled in repo Settings → Pages → Source: GitHub Actions
- The workflow runs on push to `main`, manual dispatch, and a daily schedule (06:00 UTC) so the site picks up spec changes even without pushes here.

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

The deployed site is **public** (visible to anyone with the URL) when using GitHub Pages free tier on a public site repo. The spec repo can remain private. If you need authenticated access, switch the deployment target to Cloudflare Pages or Netlify — both support password protection on free tiers.
