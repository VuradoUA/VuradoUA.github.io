# vserhiychyk.com

Source of my personal portfolio, live at **[vserhiychyk.com](https://vserhiychyk.com)**.

<!-- Para adicionar um screenshot: tira um print do site, guarda-o como screenshot.png nesta pasta e apaga as marcas de comentário à volta da linha abaixo. -->
<!-- ![Screenshot of vserhiychyk.com](screenshot.png) -->

## About

I'm a final-year Computer Science & Engineering student at NOVA FCT, training for offensive security. This site collects my security projects, experience, skills and contact details in one place, with an interactive shell at the bottom of the page.

## How it's built

- **Plain HTML, CSS and JavaScript.** No frameworks, no dependencies, no build step.
- **Hosted on GitHub Pages** with a custom domain served over HTTPS.
- **Content lives in one file.** Projects, experience, skills and contacts are data in `content.js`; `site.js` only has logic. Adding a project means adding one entry.

## Security

A static site has a small attack surface, but it still gets the basics right:

- **Strict Content Security Policy** (in a `<meta>` tag, since GitHub Pages can't set headers): only same-origin scripts, no inline code, no `eval`, no plugins, `base-uri` and `form-action` locked down. The only third parties allowed are Google Fonts and the YouTube embed used by one shell command.
- **Trusted Types** enforced, so the browser refuses any HTML-string DOM sink. All content is inserted with `textContent`, never `innerHTML`.
- **Link allowlist**: every URL from `content.js` goes through `safeUrl()`, which only accepts `https:`, `mailto:` and relative paths.
- **Clickjacking guard** in `boot.js`: if the page is loaded inside a frame, it hides itself.
- **Shell input is never executed.** Commands are looked up in a `Map`, input is capped at 200 characters and printed as plain text.
- External links use `rel="noopener noreferrer"`; the YouTube iframe is sandboxed.
- **No trackers, no cookies, no analytics.**
- `/.well-known/security.txt` (RFC 9116) for reporting issues. **Renew the `Expires` date every year.**

## Files

| File | What it is |
| --- | --- |
| `content.js` | All the text and links. Edit this one. |
| `site.js` | Rendering, animations and the shell. |
| `boot.js` | Frame guard + animation flag, runs before paint. |
| `style.css` | All styles. Colours are tokens at the top. |
| `404.html` | Not-found page. |
| `og.png` | Preview image shown when the link is shared (LinkedIn, etc.). |

## Run locally

The CSP blocks `file://` pages, so serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
