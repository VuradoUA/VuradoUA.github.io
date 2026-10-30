/* =========================================================
   EDITA AQUI — todo o conteúdo do site vive nestes blocos.
   Para adicionar um projeto, copia um objeto em PROJECTS.
   ========================================================= */

const CONTACT = {
  github:    "https://github.com/VuradoUA",
  linkedin:  "",   // ex.: "https://www.linkedin.com/in/o-teu-perfil"
  tryhackme: "https://tryhackme.com/p/Vurado",
  email:     "vladyslav.business.only@gmail.com",
  cv:        "",   // ex.: "cv.pdf" (põe o PDF na raiz do repo)
};

// Competências como portas: "open" = domino, "filtered" = estou a aprender.
// Mantém só o que consegues defender numa entrevista.
const PORTS = [
  { port: "22/tcp",   state: "open",     service: "linux",      version: "daily driver, bash scripting" },
  { port: "53/udp",   state: "open",     service: "networking", version: "TCP/IP, DNS, HTTP fundamentals" },
  { port: "8080/tcp", state: "open",     service: "dev",        version: "Python, Java, C, Git" },
  { port: "80/tcp",   state: "filtered", service: "web-exploit", version: "OWASP Top 10, Burp Suite" },
  { port: "445/tcp",  state: "filtered", service: "privesc",    version: "Linux & Windows privilege escalation" },
  { port: "88/tcp",   state: "filtered", service: "ad-attacks", version: "Active Directory enumeration" },
];

// Projetos. Exemplo do formato (apaga as barras para ativar):
// { name: "port-scanner", desc: "Multithreaded TCP scanner with banner grabbing.",
//   tags: ["Python", "sockets"], repo: "https://github.com/VuradoUA/port-scanner", date: "2026-11" },
const PROJECTS = [
  { name: "quantumtrace",
    desc: "Non-intrusive post-quantum readiness scanner. Finds classical crypto in network captures, source code, certificates and configs, scores the quantum risk and outputs a prioritised migration roadmap plus a CycloneDX CBOM mapped to NIST FIPS 203/204/205. Built at JunctionX Lisbon.",
    tags: ["Python", "tree-sitter", "tshark", "Streamlit", "Docker"],
    repo: "https://github.com/VuradoUA/quantumtrace" },
];

// Write-ups (TryHackMe, CTFs). Mesmo formato: { name, desc, url, date }
const WRITEUPS = [
];

/* ========================================================= */

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const link = (href, text) => {
  const a = el("a", null, text);
  a.href = href;
  if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
  return a;
};

/* ---- scan date ---- */
$("#scan-time").textContent = new Date().toISOString().slice(0, 16).replace("T", " ");

/* ---- port table, revealed line by line ---- */
const table = $(".ports");
const rows = PORTS.map((p) => {
  const r = el("div", "row reveal");
  r.setAttribute("role", "row");
  r.append(
    el("span", null, p.port),
    el("span", `st ${p.state}`, p.state),
    el("span", null, p.service),
    el("span", null, p.version),
  );
  [...r.children].forEach((c) => c.setAttribute("role", "cell"));
  table.append(r);
  return r;
});
rows.forEach((r, i) => setTimeout(() => r.classList.add("on"), 250 + i * 110));

/* ---- listings ---- */
function renderList(target, items, emptyNode, kind) {
  const ul = $(target);
  if (!items.length) { ul.append(emptyNode); return; }
  items.forEach((it) => {
    const li = el("li");
    const head = el("div", "entry-head");
    head.append(el("span", "perm", kind === "dir" ? "drwxr-xr-x" : "-rw-r--r--"));
    const href = it.repo || it.url;
    const name = el("span", "entry-name");
    name.append(href ? link(href, it.name) : document.createTextNode(it.name));
    head.append(name);
    if (it.date) head.append(el("span", "perm", it.date));
    li.append(head);
    if (it.desc) li.append(el("p", "entry-desc", it.desc));
    if (it.tags && it.tags.length) li.append(el("p", "tags", it.tags.join(", ")));
    ul.append(li);
  });
}

const emptyProjects = el("li", "empty");
emptyProjects.append(
  "total 0. The first projects are being built right now. Follow the progress on ",
  link(CONTACT.github, "GitHub"), ".",
);
renderList("#project-list", PROJECTS, emptyProjects, "dir");

const emptyWriteups = el("li", "empty", "ls: no write-ups published yet. TryHackMe and CTF write-ups land here.");
renderList("#writeup-list", WRITEUPS, emptyWriteups, "file");

/* ---- contact ---- */
const dl = $("#contact-list");
const contactRows = [
  ["github", CONTACT.github, CONTACT.github.replace(/^https?:\/\//, "")],
  ["linkedin", CONTACT.linkedin, CONTACT.linkedin.replace(/^https?:\/\/(www\.)?/, "")],
  ["tryhackme", CONTACT.tryhackme, CONTACT.tryhackme.replace(/^https?:\/\//, "")],
  ["email", CONTACT.email && `mailto:${CONTACT.email}`, CONTACT.email],
  ["cv", CONTACT.cv, "download PDF"],
];
contactRows.filter(([, href]) => href).forEach(([label, href, text]) => {
  const dd = el("dd");
  dd.append(link(href, text));
  dl.append(el("dt", null, label), dd);
});

/* ---- interactive shell ---- */
const log = $("#shell-log");
const input = $("#shell-input");

function print(cmd, out) {
  log.append(el("div", "echo", `guest@vserhiychyk:~$ ${cmd}`));
  if (out) log.append(el("div", "res", out));
}

const COMMANDS = {
  help: () => "available: whoami, skills, projects, contact, rickroll, clear",
  whoami: () => "vladyslav serhiychyk. final-year LEI student @ FCT NOVA, aspiring pentester.",
  skills: () => PORTS.map((p) => `${p.state.padEnd(9)} ${p.service}`).join("\n"),
  projects: () => PROJECTS.length
    ? PROJECTS.map((p) => p.name).join("\n")
    : "nothing public yet. check back soon.",
  contact: () => { $("#contact").scrollIntoView({ behavior: "smooth" }); return "scrolling to contact.txt"; },
  sudo: () => "guest is not in the sudoers file. This incident will be reported.",
  ls: () => "projects/  writeups/  contact.txt",
  exit: () => "there is no escape. try 'help'.",
  rickroll: () => { openTape(); return "never gonna give you up..."; },
};

$("#shell-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = input.value.trim();
  input.value = "";
  if (!raw) return;
  const cmd = raw.split(/\s+/)[0].toLowerCase();
  if (cmd === "clear") { log.replaceChildren(); return; }
  if (cmd === "sudo" || raw.startsWith("rm -rf")) { print(raw, COMMANDS.sudo()); return; }
  const fn = COMMANDS[cmd];
  print(raw, fn ? fn() : `${cmd}: command not found. try 'help'.`);
});

/* ---- rickroll overlay ---- */
const tape = $("#tape");
const VIDEO = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&playsinline=1";

function openTape() {
  const frame = tape.querySelector(".tape-frame");
  const ifr = document.createElement("iframe");
  ifr.src = VIDEO;
  ifr.title = "Never gonna give you up";
  ifr.allow = "autoplay; encrypted-media; picture-in-picture";
  ifr.allowFullscreen = true;
  frame.replaceChildren(ifr);
  tape.hidden = false;
  $("#tape-close").focus();
}
function closeTape() {
  tape.hidden = true;
  tape.querySelector(".tape-frame").replaceChildren();
  input.focus();
}
$("#tape-close").addEventListener("click", closeTape);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !tape.hidden) closeTape(); });
