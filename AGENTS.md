## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Domain docs

single-context. See `docs/agents/domain.md`.

## Git workflow

`main` deploys to production (Cloudflare Pages, the Worker and Supabase migrations), so it must always be green and deployable.

- Never commit directly to `main`. Make each change on a short-lived branch off `main` and merge it by pull request once CI passes; delete the branch after merging.
- Branch names are `<type>/<short-slug>` where type is `feat`, `fix`, `docs` or `chore`, e.g. `feat/shell-router`. A build slice from `.scratch/` uses the slice's slug.
- Pull requests are **squash-merged**, so each lands as one commit on `main`. The PR title is an imperative sentence in the style of the existing history ("Add saved Zwift options"), with no `feat:` prefix.
- The PR body links the slice or issue file it implements, says what was verified, and ends with the attribution line.
- Throwaway prototypes live on `prototype/<name>` branches and are never merged.
