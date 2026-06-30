# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio site for Mohamed Raiyan, hosted on GitHub Pages at `https://mohamedraiyans.github.io`. No build step — pure HTML/CSS/JS served directly. A PHP-based CMS layer (`api/`) activates only on localhost via XAMPP.

## Running Locally

Requires XAMPP with Apache running. Start Apache via the XAMPP Control Panel, then open:

```
http://localhost/laravel/new/mohamedraiyans/
```

No npm, no build tools, no compilation. Changes to any file are reflected immediately on page reload.

## Architecture

### Content Data Flow
All visible portfolio content lives in **`data.json`** — not in the HTML. On page load, `script.js` fetches `data.json` and dynamically renders everything: hero text, stats, section cards, canvas nodes, and node detail panels. To change any portfolio content (name, bio, skills, projects, jobs, etc.), edit `data.json`.

### Key Files

| File | Purpose |
|------|---------|
| `data.json` | Single source of truth for all portfolio content |
| `script.js` | Main app — data loading, canvas rendering, node interactions, pan/zoom, particles, modals |
| `style.css` | All visual styles including dark mode via `[data-theme="dark"]` CSS vars |
| `editor.js` | Localhost-only CMS — activates only when `hostname === 'localhost'`. No-ops on GitHub Pages |
| `editor.css` | Styles for the CMS editor toolbar (localhost only) |
| `config.js` | Site-level settings (`CONFIG` object) — CMS auth credentials and feature flags |
| `api/save.php` | POST endpoint: writes edited `data.json` back to disk with timestamped backup in `api/backups/` |
| `api/sync.php` | POST endpoint: runs `git add data.json config.js && git commit && git push` — publishes CMS edits |

### `data.json` Schema

```
{
  profile: { name, title, subtitle, company, tagline, bio, location, ... }
  contact:  { phone, email, linkedin, ... }
  stats:    [{ count, suffix, label }]         // animated counters on dashboard
  sections: {
    [sectionKey]: {
      title, card: { description, tags }       // dashboard card
      nodes: [{ id, type, label, icon, x, y, operations, tooltip, details }]
      connections: [{ start, end }]            // SVG lines between nodes
    }
  }
}
```

Node `type` values: `"trigger"` (left-most/start node, styled differently) or `"action"`.  
Node `details` field accepts raw HTML rendered into the right-side panel on click.

### Sections (nav order)
`dashboard` → `skills` → `experience` → `projects` → `education` → `recommendations` → `portfolio`

Section keys in `data.json` must match the `data-section` attributes used in `index.html` and `script.js`.

### CMS Editor (localhost only)
`editor.js` checks `location.hostname` on load and exits immediately if not localhost. On localhost it injects an "Edit Mode" toolbar. Saving calls `api/save.php` (writes disk), publishing calls `api/sync.php` (git commit + push). The `api/` folder is excluded from git via `.gitignore`.

### Deployment
The site is deployed to GitHub Pages from the `main` branch root. Pushing to `main` updates the live site. There is no CI/CD pipeline — `git push origin main` is the deploy step.

## What NOT to Edit Directly in HTML

- Hero text, stats, badges — all pulled from `data.json` at runtime
- Section cards on the dashboard — generated from `data.json`
- Canvas nodes and connections — generated from `data.json`
- Contact info — generated from `data.json`

Only edit `index.html` for structural changes (new modals, new HTML sections, script tags, meta tags).

## Assets

- `assets/videos/intro_3.mp4` — hero background video (autoplay muted)
- `assets/Raiyan_Fahim_Resume.pdf` — downloadable resume (linked from hero + contact modal)
- `assets/albums/` — photo galleries (graduation, imara) rendered inside node detail panels
- `profile.jpg` — profile photo used in sidebar and About modal; also serves as video poster fallback
