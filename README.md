# complexvectorspace.io

A static technical blog with **Hugo + PaperMod** styling. This repo contains the **built output** (HTML, CSS, JS) — not the Hugo source (no `config.toml`, `content/`, or `themes/`). The design is based on [PaperMod](https://github.com/adityatelange/hugo-PaperMod).

---

## Run locally

Serve the site from the repo root so paths like `/assets/css/...` resolve correctly.

**Option 1 — npm (recommended)**

```bash
npm install
npm run serve
```

Then open **http://localhost:3000** (or the URL printed in the terminal).

**Option 2 — Python**

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000**.

**Option 3 — npx (no install)**

```bash
npx serve . -l 3000
```

Opening `index.html` directly in a browser can break navigation because many links still point to `https://lilianweng.github.io/`.

---

## Using these styles for your own blog

You have two approaches.

### A. Keep using this static site as-is

- **Edit content**: Change the HTML in `index.html`, `posts/*/index.html`, and other pages. Replace "Lil'Log" / "Lilian Weng" / `lilianweng.github.io` with your own name and domain.
- **Styles**: All PaperMod-style CSS is under `assets/css/` and is already applied. No extra setup needed.
- **New posts**: Add a new folder under `posts/` (e.g. `posts/2025-03-04-my-post/`) with an `index.html` that reuses the same layout and CSS as existing posts.

### B. Rebuild with Hugo + PaperMod (best for many posts)

To write posts in **Markdown** and run `hugo server` for local preview:

1. **Install Hugo** (e.g. `brew install hugo` on macOS).
2. **Create a new Hugo site** (in a separate directory or after backing up this one):
   ```bash
   hugo new site myblog --format yaml
   cd myblog
   ```
3. **Add the PaperMod theme**:
   ```bash
   git init
   git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
   ```
4. **Configure** `config.yaml` with `theme: PaperMod`, your `baseURL`, `title`, etc. (see [PaperMod installation](https://github.com/adityatelange/hugo-PaperMod/wiki/Installation)).
5. **Add content** in `content/posts/` as `.md` files with front matter.
6. **Build**: `hugo` (output in `public/`). To match this repo, copy the contents of `public/` here, or point your deploy to `public/`.

That way you get the same look (PaperMod) with a normal Hugo workflow and easy local dev via `hugo server`.

---

## Repo structure (current — static only)

| Path        | Purpose                    |
|------------|----------------------------|
| `index.html` | Homepage                  |
| `posts/`     | One folder per post, each with `index.html` |
| `page/`      | Pagination (e.g. page 1, 2, …) |
| `tags/`      | Tag index and per-tag pages |
| `archives/`  | Archive listing            |
| `assets/`    | CSS and JS (PaperMod-style) |
| `search/`    | Search page and data       |
| `*.xml`, `*.json` | Feeds and index data   |

No `config.toml`, `content/`, or `themes/` — this is only the generated static site.
