# vserhiychyk.com

Source of my personal portfolio, live at **[vserhiychyk.com](https://vserhiychyk.com)**.

<!-- Para adicionar um screenshot: tira um print do site, guarda-o como screenshot.png nesta pasta e apaga as marcas de comentário à volta da linha abaixo. -->
<!-- ![Screenshot of vserhiychyk.com](screenshot.png) -->

## About

I'm a final-year Computer Science & Engineering student at FCT NOVA, training for offensive security. This site collects my security projects, write-ups and contact details in one place.

## How it's built

- **Plain HTML, CSS and JavaScript.** No frameworks and no build step.
- **Hosted on GitHub Pages** with a custom domain served over HTTPS.
- **Content lives in one file.** Projects, write-ups, skills and contacts are data arrays at the top of `site.js`, so adding a project means adding one entry.

## Design

- The landing page is styled as an `nmap` scan report about me. Skills are listed as ports: `open` for what I use confidently, `filtered` for what I'm learning.
- An interactive shell at the bottom of the page accepts a few commands. Type `help` to see them.
- Respects `prefers-reduced-motion` and works on mobile.

## Run locally

```bash
git clone https://github.com/VuradoUA/VuradoUA.github.io.git
cd VuradoUA.github.io
python3 -m http.server 8000
```

Then open http://localhost:8000.
