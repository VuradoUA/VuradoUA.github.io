/* =========================================================
   vserhiychyk.com: rendering, effects and the shell.
   O conteúdo está em content.js; aqui só há lógica.

   Security notes
   - Every piece of text goes into the page with textContent / append(string).
     Nothing is ever parsed as HTML (no innerHTML, no eval), and the CSP's
     Trusted Types rule makes the browser refuse it even if someone tried.
   - Every link from content.js passes through safeUrl(): only https:, mailto:
     and relative paths are allowed.
   - The shell never executes input. Commands are looked up in a Map.
   ========================================================= */

"use strict";

(() => {
  const D = typeof SITE === "object" && SITE ? SITE : null;
  if (!D) return;

  const root = document.documentElement;
  const calm = root.classList.contains("calm");

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }

  function safeUrl(u) {
    if (typeof u !== "string") return "";
    const v = u.trim();
    if (!v) return "";
    if (/^(https:\/\/|mailto:)/i.test(v)) return v;
    if (/^[a-z][a-z0-9+.-]*:/i.test(v) || v.startsWith("//") || v.startsWith("\\")) return "";
    return v; // relative path, e.g. "cv.pdf"
  }

  function link(href, text, cls) {
    const url = safeUrl(href);
    if (!url) return el("span", cls, text);
    const a = el("a", cls, text);
    a.href = url;
    if (/^https:/i.test(url) || /\.pdf$/i.test(url)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }

  function openExternal(href) {
    const url = safeUrl(href);
    if (!url) return false;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) w.opener = null;
    return true;
  }

  const C = D.contact || {};
  const email = typeof C.email === "string" ? C.email.trim() : "";
  const cvUrl = safeUrl(C.cv);

  /* ---------- static bits wired from content ---------- */
  $$("[data-email-link]").forEach((a) => { if (email) a.href = `mailto:${email}`; });
  $$("[data-profile]").forEach((a) => {
    const url = safeUrl(C[a.dataset.profile]);
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else a.parentElement.hidden = true;
  });
  $$("[data-cv]").forEach((a) => {
    if (!cvUrl) return;
    a.href = cvUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.hidden = false;
  });
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- recon box ---------- */
  const recon = $("#recon");
  const reconRows = Array.isArray(D.recon) ? D.recon : [];
  const keyW = Math.max(0, ...reconRows.map((r) => String(r[0]).length)) + 3;
  reconRows.forEach(([k, v, flag], i) => {
    const dt = el("dt", flag === "ok" ? "ok" : "", `${k} `.padEnd(keyW, ".") + " ");
    const dd = el("dd", flag === "ok" ? "ok" : "", v);
    dt.style.setProperty("--i", i);
    dd.style.setProperty("--i", i);
    recon.append(dt, dd);
  });

  /* ---------- about: right now ---------- */
  const nowList = $("#now-list");
  (D.now || []).forEach((t) => nowList.append(el("li", null, t)));

  /* ---------- projects ---------- */
  function termWindow(title, lines) {
    const t = el("div", "term");
    const bar = el("div", "term-bar");
    bar.setAttribute("aria-hidden", "true");
    const lights = el("span", "lights");
    lights.append(el("i"), el("i"), el("i"));
    bar.append(lights, el("span", "term-title", title));
    const body = el("div", "term-body seq");
    lines.forEach(([type, text], i) => {
      const p = el("p", `ln t-${/^(cmd|info|warn|ok|dim)$/.test(type) ? type : "dim"}`, text);
      p.style.setProperty("--i", i);
      body.append(p);
    });
    t.append(bar, body);
    return t;
  }

  const projectList = $("#project-list");
  (D.projects || []).forEach((p) => {
    const hasTerm = Array.isArray(p.terminal) && p.terminal.length > 0;
    const art = el("article", hasTerm ? "project" : "project compact");
    const info = el("div", "project-info");

    if (p.context) info.append(el("p", "project-context", p.context));
    const h = el("h3");
    h.append(p.repo ? link(p.repo, p.name) : document.createTextNode(p.name));
    info.append(h);
    if (p.summary) info.append(el("p", "project-summary", p.summary));

    if (Array.isArray(p.points) && p.points.length) {
      const ul = el("ul", "project-points");
      p.points.forEach((t) => ul.append(el("li", null, t)));
      info.append(ul);
    }
    if (Array.isArray(p.stack) && p.stack.length) {
      const ul = el("ul", "stack");
      ul.setAttribute("aria-label", "Built with");
      p.stack.forEach((t) => ul.append(el("li", null, t)));
      info.append(ul);
    }
    const links = el("div", "project-links");
    if (safeUrl(p.repo)) links.append(link(p.repo, "View source code", "btn btn-sm"));
    if (safeUrl(p.demo)) links.append(link(p.demo, "Live demo", "btn btn-sm btn-primary"));
    if (links.childElementCount) info.append(links);

    art.append(info);
    if (hasTerm) art.append(termWindow(`~/projects/${p.name}`, p.terminal));
    projectList.append(art);
  });

  const next = el("div", "project-next");
  next.append(el("code", null, "git init next-project"), el("span", null, "More projects in progress."));
  if (safeUrl(C.github)) next.append(link(C.github, "Follow along on GitHub"));
  projectList.append(next);

  /* ---------- timelines ---------- */
  function renderTimeline(target, items, headingTag) {
    const ol = $(target);
    (items || []).forEach((it) => {
      const li = el("li", it.now ? "current" : "");
      li.append(el("p", "tl-period", it.period || ""));
      const body = el("div", "tl-body");
      const role = el(headingTag, "tl-role");
      role.append(it.link ? link(it.link, it.role) : document.createTextNode(it.role));
      if (it.status) role.append(el("span", "tl-tag", it.status));
      body.append(role);
      if (it.org) body.append(el("p", "tl-org", it.org));
      if (it.desc) body.append(el("p", "tl-desc", it.desc));
      li.append(body);
      ol.append(li);
    });
  }
  renderTimeline("#experience-list", D.experience, "h3");
  renderTimeline("#education-list", D.education, "h4");

  /* ---------- skills ---------- */
  const portsEl = $("#ports");
  const ports = Array.isArray(D.ports) ? D.ports : [];
  ports.forEach((p, i) => {
    const r = el("div", "prow");
    r.setAttribute("role", "row");
    const state = p.state === "open" ? "open" : "filtered";
    [
      el("span", null, p.port),
      el("span", `s-${state}`, state),
      el("span", null, p.service),
      el("span", null, p.version),
    ].forEach((c) => { c.setAttribute("role", "cell"); r.append(c); });
    r.style.setProperty("--i", i + 1);
    portsEl.append(r);
  });
  const nOpen = ports.filter((p) => p.state === "open").length;
  const pc = $("#port-count");
  if (pc) pc.textContent = `${ports.length} services: ${nOpen} open, ${ports.length - nOpen} filtered.`;

  const langsCode = $("#langs-code");
  if (langsCode) langsCode.textContent = (D.code || []).join(", ");
  const spoken = $("#langs-spoken");
  (D.spoken || []).forEach(([lang, lvl]) => {
    const li = el("li", null, lang);
    li.append(el("span", null, lvl));
    spoken.append(li);
  });

  /* ---------- write-ups (section only shows when there are some) ---------- */
  const writeups = Array.isArray(D.writeups) ? D.writeups : [];
  if (writeups.length) {
    $("#writeups").hidden = false;
    $$('[data-needs="writeups"]').forEach((n) => { n.hidden = false; });
    const ul = $("#writeup-list");
    writeups.forEach((w) => {
      const li = el("li");
      const head = el("div", "wu-head");
      head.append(w.url ? link(w.url, w.name) : el("span", null, w.name));
      if (w.date) head.append(el("span", "wu-date", w.date));
      li.append(head);
      if (w.desc) li.append(el("p", "wu-desc", w.desc));
      ul.append(li);
    });
  }

  /* ---------- contact ---------- */
  const emailBig = $("#email-big");
  if (email) { emailBig.href = `mailto:${email}`; emailBig.textContent = email; }

  const copyMsg = $("#copy-msg");
  let copyTimer;
  async function copyEmail() {
    if (!email) return false;
    try {
      await navigator.clipboard.writeText(email);
      return true;
    } catch {
      // fallback: select the address so the user can press Ctrl+C
      const range = document.createRange();
      range.selectNodeContents(emailBig);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return false;
    }
  }
  $("#copy-email").addEventListener("click", async () => {
    const ok = await copyEmail();
    copyMsg.textContent = ok ? "Copied" : "Selected. Press Ctrl+C";
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyMsg.textContent = ""; }, 2500);
  });

  const contactList = $("#contact-list");
  const strip = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  [
    ["LinkedIn", C.linkedin, C.linkedin && strip(C.linkedin)],
    ["GitHub", C.github, C.github && strip(C.github)],
    ["TryHackMe", C.tryhackme, C.tryhackme && strip(C.tryhackme)],
    ["CV", cvUrl, cvUrl && "Download PDF"],
    ["Location", "", C.location],
  ].forEach(([label, href, text]) => {
    if (!text) return;
    const dd = el("dd");
    dd.append(href ? link(href, text) : el("span", null, text));
    contactList.append(el("dt", null, label), dd);
  });

  /* =========================================================
     effects
     ========================================================= */
  const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&@0123456789abcdef";
  const rand = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  function scramble(node, text, duration = 650) {
    node.classList.add("go");
    if (calm) { node.textContent = text; return Promise.resolve(); }
    return new Promise((resolve) => {
      const start = performance.now();
      const n = text.length;
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const done = Math.floor(p * n);
        let s = "";
        for (let i = 0; i < n; i++) s += i < done || text[i] === " " ? text[i] : rand();
        node.textContent = s;
        if (p < 1) requestAnimationFrame(step);
        else { node.textContent = text; resolve(); }
      };
      requestAnimationFrame(step);
    });
  }

  async function typeText(node, text, speed = 40) {
    node.classList.add("go");
    if (calm) { node.textContent = text; return; }
    node.textContent = "";
    for (let i = 1; i <= text.length; i++) {
      node.textContent = text.slice(0, i);
      await sleep(speed + Math.random() * speed * 0.6);
    }
  }

  function runSeq(container, extraTail) {
    if (!container) return 0;
    const n = container.children.length;
    container.classList.add("in");
    const tail = extraTail || container.parentElement.querySelector(":scope > .seq-tail");
    const total = n * 90 + 120;
    if (tail) { tail.style.setProperty("--tail", `${total}ms`); tail.classList.add("in"); }
    return total;
  }

  // headings: keep a clean copy for screen readers, animate a hidden twin
  $$(".section h2[data-scramble]").forEach((h) => {
    const text = h.textContent.trim();
    h.textContent = "";
    const sr = el("span", "sr-only", text);
    const vis = el("span", "scr", text);
    vis.setAttribute("aria-hidden", "true");
    vis.dataset.text = text;
    h.append(sr, vis);
  });

  /* ---------- hero intro: the one orchestrated moment ---------- */
  async function heroIntro() {
    const hero = $(".hero");
    const term = $(".hero-term");
    const bootCmd = $(".boot-cmd");
    const lines = $$(".name-line");
    const termCmd = $(".hero-term [data-type]");
    const reconTail = $(".recon-done");

    if (calm) {
      [bootCmd, termCmd, ...lines].forEach((n) => n.classList.add("go"));
      hero.classList.add("ready");
      term.classList.add("on");
      return;
    }
    recon.classList.add("armed");
    reconTail.classList.add("armed");

    await sleep(180);
    await typeText(bootCmd, bootCmd.dataset.type, 70);
    await sleep(120);
    const a = scramble(lines[0], lines[0].dataset.glitch, 600);
    await sleep(170);
    const b = scramble(lines[1], lines[1].dataset.glitch, 720);
    await sleep(260);
    hero.classList.add("ready");
    term.classList.add("on");
    await Promise.all([a, b, typeText(termCmd, termCmd.dataset.type, 18)]);
    runSeq(recon, reconTail);
  }
  heroIntro();

  /* ---------- sections: type the command, decrypt the heading ---------- */
  if ("IntersectionObserver" in window && !calm) {
    const sectionCmds = $$(".section .cmd [data-type]");
    const sectionHeads = $$(".section h2 .scr");
    sectionCmds.forEach((n) => { n.classList.add("armed"); n.textContent = ""; });
    sectionHeads.forEach((n) => n.classList.add("armed"));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(async (e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const cmd = $(".cmd [data-type]", e.target);
        const h = $("h2 .scr", e.target);
        if (cmd) await typeText(cmd, cmd.dataset.type, 22);
        if (h) scramble(h, h.dataset.text, 480);
      });
    }, { rootMargin: "0px 0px -18% 0px" });
    $$(".section").forEach((s) => io.observe(s));

    // terminal output blocks print line by line when they scroll into view
    const seqs = $$(".section .seq");
    seqs.forEach((s) => {
      s.classList.add("armed");
      const tail = s.parentElement.querySelector(":scope > .seq-tail");
      if (tail) tail.classList.add("armed");
    });
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        sio.unobserve(e.target);
        runSeq(e.target);
      });
    }, { threshold: 0.35 });
    seqs.forEach((s) => sio.observe(s));
  } else {
    $$("[data-type], .scr").forEach((n) => n.classList.add("go"));
  }

  /* ---------- top bar: border on scroll, active link, mobile menu ---------- */
  const topbar = $(".topbar");
  const onScroll = () => topbar.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav a[href^="#"]:not(.btn)');
  if ("IntersectionObserver" in window) {
    const nio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section").forEach((s) => nio.observe(s));
  }

  const nav = $("#nav");
  const menuBtn = $(".menu-btn");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !e.target.closest(".topbar")) setMenu(false);
  });

  /* ---------- footer: real page load time, nmap style ---------- */
  window.addEventListener("load", () => {
    const t = $("#scan-time");
    if (t) t.textContent = (performance.now() / 1000).toFixed(2);
  });

  /* =========================================================
     shell
     ========================================================= */
  const log = $("#shell-log");
  const input = $("#shell-input");
  const form = $("#shell-form");
  const shellBody = $(".shell-body");
  const shellTerm = $("#shell-term");
  const PROMPT = "guest@vserhiychyk:~$";
  const history = [];
  let hIndex = 0;

  // print one line. parts: strings, {text, cls} spans, or {text, href} links
  function out(parts, cls = "out") {
    const line = el("div", cls);
    (Array.isArray(parts) ? parts : [parts]).forEach((p) => {
      if (p == null) return;
      if (typeof p === "string") line.append(p);
      else if (p.href) line.append(link(p.href, p.text));
      else line.append(el("span", p.cls || null, p.text));
    });
    log.append(line);
  }
  const blank = () => out(" ");
  function echo(raw) {
    const line = el("div", "echo");
    line.append(el("span", "ps1", PROMPT), raw);
    log.append(line);
  }
  const scrollEnd = () => { shellBody.scrollTop = shellBody.scrollHeight; };

  const SECTIONS = ["about", "projects", "experience", "skills", "contact", "shell"];
  if (writeups.length) SECTIONS.splice(4, 0, "writeups");

  const LOGO = [
    "__   _____ ",
    "\\ \\ / / __|",
    " \\ V /\\__ \\",
    "  \\_/ |___/",
  ];

  // neofetch-style card: ASCII logo on the left, facts on the right
  function fetchCard() {
    const info = [
      [null, "guest@vserhiychyk"],
      [null, "-----------------"],
      ["name", D.name],
      ["role", "CS & Engineering student, NOVA FCT"],
      ["focus", "offensive security, red team"],
      ["host", "GitHub Pages (static, no backend)"],
      ["shell", "vsh 2.0, read-only"],
    ];
    const wrap = el("div", "fetch");
    wrap.append(el("div", "fetch-logo", LOGO.join("\n")));
    const right = el("div", "fetch-info");
    info.forEach(([k, v], i) => {
      if (i) right.append("\n");
      if (k) { right.append(el("b", null, `${k}: `), v); }
      else right.append(el("b", null, v));
    });
    wrap.append(right);
    log.append(wrap);
  }

  const pad = (s, n) => String(s).padEnd(n, " ");

  function goTo(id) {
    const target = document.getElementById(id);
    if (!target) return false;
    target.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    return true;
  }

  function printTimeline(items) {
    (items || []).forEach((it) => {
      out([{ text: pad(it.period, 13), cls: "acc" }, { text: it.role, cls: "hi" }]);
      if (it.org) out(`${pad("", 13)}${it.org}`);
    });
  }

  function printSkills() {
    out("PORT      STATE     SERVICE      VERSION");
    ports.forEach((p) => {
      const st = p.state === "open" ? "open" : "filtered";
      out([pad(p.port, 10), { text: pad(st, 10), cls: st === "open" ? "ok" : "acc" }, pad(p.service, 13), p.version]);
    });
  }

  function printContact() {
    if (email) out(["email      ", { href: `mailto:${email}`, text: email }]);
    if (C.linkedin) out(["linkedin   ", { href: C.linkedin, text: strip(C.linkedin) }]);
    if (C.github) out(["github     ", { href: C.github, text: strip(C.github) }]);
    if (C.tryhackme) out(["tryhackme  ", { href: C.tryhackme, text: strip(C.tryhackme) }]);
  }

  function openProfile(key, label) {
    const url = C[key];
    if (!safeUrl(url)) { out(`${label}: not set.`, "err"); return; }
    openExternal(url);
    out(["opening ", { href: url, text: strip(url) }, " in a new tab"]);
  }

  const FILES = {
    "about.txt": () => COMMANDS.get("about").run([]),
    "contact.txt": () => printContact(),
    "skills.txt": () => printSkills(),
    ".secret": () => out("nice find. try: rickroll", "acc"),
  };

  // name -> { desc (shown in help, omit to hide), run(args) }
  const COMMANDS = new Map([
    ["help", { desc: "list commands", run: () => {
      const rows = [];
      COMMANDS.forEach((c, name) => { if (c.desc) rows.push([name, c.desc]); });
      rows.forEach(([n, d]) => out([{ text: pad(n, 14), cls: "acc" }, d]));
      blank();
      out("Some commands are hidden. Root access is not one of them.");
    } }],
    ["whoami", { desc: "who is this", run: () => {
      out("vladyslav serhiychyk", "hi");
      out("final-year Computer Science & Engineering student @ NOVA FCT, aspiring pentester.");
    } }],
    ["about", { desc: "short bio", run: () => {
      $$(".prose p").forEach((p, i) => { if (i) blank(); out(p.textContent.trim(), "hi"); });
    } }],
    ["projects", { desc: "what I've built", run: () => {
      (D.projects || []).forEach((p) => {
        out([{ text: pad(p.name, 16), cls: "acc" }, p.summary || ""]);
      });
      blank();
      out("type 'open <name>' to see the code.");
    } }],
    ["experience", { desc: "roles and activities", run: () => printTimeline(D.experience) }],
    ["education", { desc: "degree and training", run: () => printTimeline(D.education) }],
    ["skills", { desc: "run the skills scan", run: printSkills }],
    ["contact", { desc: "how to reach me", run: printContact }],
    ["email", { desc: "copy my email address", run: () => {
      if (!email) { out("email: not set.", "err"); return; }
      copyEmail().then((ok) => {
        out(ok ? `copied ${email} to the clipboard.` : `couldn't copy. it's ${email}`, ok ? "ok" : "out");
        scrollEnd();
      });
    } }],
    ["cv", { desc: "open my CV", run: () => {
      if (!cvUrl) { out("cv: not published yet. type 'email' and ask me for it."); return; }
      openExternal(cvUrl);
      out("opening CV in a new tab.");
    } }],
    ["open", { desc: "open <project|github|linkedin|tryhackme>", run: (args) => {
      const what = (args[0] || "").toLowerCase();
      if (!what) { out("usage: open <name>", "err"); return; }
      if (["github", "linkedin", "tryhackme"].includes(what)) return openProfile(what, what);
      if (what === "cv") return COMMANDS.get("cv").run([]);
      const p = (D.projects || []).find((x) => x.name.toLowerCase() === what);
      if (!p) { out(`open: ${args[0]}: no such project. try 'projects'.`, "err"); return; }
      if (!safeUrl(p.repo)) { out(`open: ${p.name} has no public link yet.`); return; }
      openExternal(p.repo);
      out(["opening ", { href: p.repo, text: strip(p.repo) }]);
    } }],
    ["cd", { desc: "jump to a section of the page", run: (args) => {
      const where = (args[0] || "").replace(/^[~/.]+/, "").replace(/\/$/, "").toLowerCase();
      if (!where) { out(`sections: ${SECTIONS.join("  ")}`); return; }
      if (SECTIONS.includes(where) && goTo(where)) { out(`cd ${where}`, "ok"); return; }
      out(`cd: ${args[0]}: no such section. options: ${SECTIONS.join(", ")}`, "err");
    } }],
    ["ls", { desc: "list files", run: (args) => {
      const all = args.some((a) => /^-[a-z]*a/.test(a));
      const names = ["about.txt", "contact.txt", "skills.txt", "projects/"];
      if (writeups.length) names.push("writeups/");
      out((all ? [".", "..", ".secret", ...names] : names).join("  "));
    } }],
    ["cat", { desc: "print a file", run: (args) => {
      const f = args[0];
      if (!f) { out("usage: cat <file>", "err"); return; }
      const name = f.replace(/^(\.\/|~\/)/, "");
      if (Object.prototype.hasOwnProperty.call(FILES, name)) return FILES[name]();
      if (/^(projects|writeups)\/?$/.test(name)) { out(`cat: ${f}: Is a directory`, "err"); return; }
      if (/\.\.|passwd|shadow/.test(name)) { out(`cat: ${f}: nice try. there's no server here to traverse, just static files.`, "acc"); return; }
      out(`cat: ${f}: No such file or directory`, "err");
    } }],
    ["pwd", { run: () => out("/home/guest") }],
    ["date", { run: () => out(new Date().toString()) }],
    ["echo", { run: (args) => out(args.join(" ")) }],
    ["history", { desc: "previous commands", run: () => {
      history.forEach((h, i) => out(`${String(i + 1).padStart(4)}  ${h}`));
    } }],
    ["clear", { desc: "clear the screen", run: () => log.replaceChildren() }],
    ["neofetch", { desc: "system info, the classic way", run: fetchCard }],
    ["banner", { run: fetchCard }],
    ["nmap", { run: printSkills }],
    ["github", { run: () => openProfile("github", "github") }],
    ["linkedin", { run: () => openProfile("linkedin", "linkedin") }],
    ["tryhackme", { run: () => openProfile("tryhackme", "tryhackme") }],
    ["sudo", { run: () => out("guest is not in the sudoers file. This incident will be reported.", "err") }],
    ["su", { run: () => out("su: Authentication failure", "err") }],
    ["rm", { run: (args) => out(args.some((a) => /^-.*r/.test(a)) ? "rm: read-only file system. nice try." : "rm: permission denied", "err") }],
    ["exit", { run: () => out("there is no escape. try 'help'.") }],
    ["rickroll", { run: () => { openTape(); out("never gonna give you up..."); } }],
    ["hack", { run: () => out("access denied. this site has a CSP, Trusted Types and no backend. but I like the attitude.", "acc") }],
  ]);

  function run(raw) {
    const line = raw.trim();
    echo(line);
    if (!line) return;
    history.push(line);
    if (history.length > 100) history.shift();
    hIndex = history.length;

    const [name, ...args] = line.split(/\s+/);
    const cmd = COMMANDS.get(name.toLowerCase());
    if (cmd) cmd.run(args);
    else out(`${name}: command not found. try 'help'.`, "err");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value.slice(0, 200);
    input.value = "";
    run(raw);
    scrollEnd();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      hIndex = Math.max(0, hIndex - 1);
      input.value = history[hIndex] || "";
    } else if (e.key === "ArrowDown") {
      if (!history.length) return;
      e.preventDefault();
      hIndex = Math.min(history.length, hIndex + 1);
      input.value = history[hIndex] || "";
    } else if (e.key === "Tab" && input.value.trim()) {
      // only when there's something to complete, so Tab still moves focus otherwise
      e.preventDefault();
      complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      log.replaceChildren();
    }
  });

  function complete() {
    const v = input.value;
    const parts = v.split(/\s+/);
    let pool;
    if (parts.length <= 1) pool = Array.from(COMMANDS.keys());
    else if (parts[0] === "open") pool = [...(D.projects || []).map((p) => p.name), "github", "linkedin", "tryhackme", "cv"];
    else if (parts[0] === "cd") pool = SECTIONS;
    else if (parts[0] === "cat") pool = Object.keys(FILES).filter((f) => f !== ".secret");
    else return;
    const cur = parts[parts.length - 1].toLowerCase();
    const hits = pool.filter((p) => p.toLowerCase().startsWith(cur));
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      input.value = parts.join(" ") + " ";
    } else if (hits.length > 1) {
      echo(v);
      out(hits.join("  "));
      scrollEnd();
    }
  }

  // click anywhere in the terminal to focus it (unless selecting text)
  shellTerm.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    if (String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });

  // ` (backtick) jumps to the shell from anywhere, Quake-console style
  document.addEventListener("keydown", (e) => {
    if (e.key !== "`" || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    e.preventDefault();
    goTo("shell");
    input.focus({ preventScroll: true });
  });

  // welcome text
  fetchCard();
  blank();
  out("Nothing you type here leaves your browser.");
  out(`Last login: ${new Date().toDateString()} from 127.0.0.1`);
  out(["Type ", { text: "help", cls: "acc" }, " to see what you can do."]);

  /* ---------- rickroll overlay ---------- */
  const tape = $("#tape");
  const VIDEO = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&playsinline=1";
  let lastFocus = null;

  function openTape() {
    lastFocus = document.activeElement;
    const ifr = document.createElement("iframe");
    ifr.src = VIDEO;
    ifr.title = "Never gonna give you up";
    ifr.allow = "autoplay; encrypted-media; picture-in-picture";
    ifr.allowFullscreen = true;
    ifr.referrerPolicy = "strict-origin-when-cross-origin"; // YouTube embeds need a referrer
    ifr.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
    $(".tape-frame", tape).replaceChildren(ifr);
    tape.hidden = false;
    $("#tape-close").focus();
  }
  function closeTape() {
    tape.hidden = true;
    $(".tape-frame", tape).replaceChildren();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $("#tape-close").addEventListener("click", closeTape);
  tape.addEventListener("click", (e) => { if (e.target === tape) closeTape(); });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!tape.hidden) closeTape();
    else if (nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });
})();
