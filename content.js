/* =========================================================
   EDITA AQUI — todo o conteúdo do site vive neste ficheiro.

   - Para adicionar um projeto: copia um objeto em `projects`.
     O primeiro projeto com `terminal` aparece em destaque (cartão grande).
   - Para adicionar um write-up: põe um objeto em `writeups`.
     A secção "Write-ups" só aparece quando houver pelo menos um.
   - Para ativar o botão do CV: põe o PDF na raiz do repo e escreve
     o nome em contact.cv (ex.: "cv.pdf").
   - Links: só são aceites https://, mailto: ou caminhos relativos
     (o site ignora tudo o resto, ex.: javascript:).
   - O texto é sempre inserido como texto (nunca como HTML),
     por isso podes escrever < > & à vontade.
   ========================================================= */

"use strict";

const SITE = {
  name: "Vladyslav Serhiychyk",

  contact: {
    email:     "vladyslav.business.only@gmail.com",
    github:    "https://github.com/VuradoUA",
    linkedin:  "https://www.linkedin.com/in/vladyslav-serhiychyk-105598334/",
    tryhackme: "https://tryhackme.com/p/Vurado",
    cv:        "",   // ex.: "cv.pdf"
    location:  "Lisbon, Portugal",
  },

  // Caixa "recon.sh" no topo. [chave, valor, destaque opcional: "ok"]
  recon: [
    ["focus",     "offensive security, red team"],
    ["degree",    "BSc Computer Science & Eng."],
    ["school",    "NOVA FCT, Lisbon"],
    ["graduates", "2027"],
    ["speaks",    "Portuguese, Ukrainian, English"],
    ["training",  "TryHackMe, preparing PT1"],
    ["status",    "open to internships & junior roles", "ok"],
  ],

  // Lista "Right now" na secção About.
  now: [
    "Finishing my BSc at NOVA FCT (expected 2027)",
    "Working through TryHackMe towards the PT1 certification",
    "Competing in CTFs with the NOVA FCT team",
    "Building security projects and publishing them on GitHub",
  ],

  // Projetos. Campos: name, context, summary, points[], stack[], repo, demo, terminal[]
  // terminal: linhas [tipo, texto] com tipo = "cmd" | "info" | "warn" | "ok" | "dim"
  projects: [
    {
      name: "quantumtrace",
      context: "JunctionX Lisbon hackathon",
      summary: "A post-quantum readiness scanner. It finds the cryptography a quantum computer will break and tells you what to migrate first.",
      points: [
        "Detects quantum-vulnerable crypto in network captures, source code, certificates, cloud key exports and server configs, without probing any system.",
        "Scores risk from 0 to 100, flags harvest-now-decrypt-later exposure and builds a prioritised migration roadmap.",
        "Exports a CycloneDX 1.6 Cryptographic Bill of Materials mapped to NIST FIPS 203, 204 and 205.",
      ],
      stack: ["Python", "tree-sitter", "tshark", "Streamlit", "Docker"],
      repo: "https://github.com/VuradoUA/quantumtrace",
      demo: "",
      terminal: [
        ["cmd",  "quantumtrace scan ./starter-kit"],
        ["info", "parsing pcaps, source code and cloud exports"],
        ["warn", "quantum risk score: 75/100"],
        ["dim",  "    network 96.5   code 47.5   cloud 81.9"],
        ["ok",   "7 of 97 TLS sessions already use a PQ key exchange"],
        ["ok",   "wrote cbom.json  report.json  findings.json"],
      ],
    },
  ],

  // Experiência e atividades (mais recente primeiro). now: true = ainda ativo.
  experience: [
    {
      period: "2026 – now", now: true,
      role: "Vice-President and Partnerships Coordinator",
      org: "NOVA FCT Computer Science Society",
      desc: "Co-lead the society's decisions and events, designed its internal structure and workflow, and coordinate partnerships with companies.",
    },
    {
      period: "2026 – now", now: true,
      role: "Projects Member, Robotics",
      org: "IN-NOVA, NOVA FCT Junior Consulting",
      desc: "Contribute to client and internal projects involving electronics and microcontroller programming.",
    },
    {
      period: "2025 – now", now: true,
      role: "CTF Team Member",
      org: "NOVA FCT",
      desc: "Compete in Capture The Flag competitions, mentored by a faculty member specialised in cybersecurity.",
    },
    {
      period: "2025 – 2026",
      role: "Student Ambassador",
      org: "NTT DATA",
      desc: "Act as the link between NTT DATA and NOVA FCT students, promoting the company's initiatives and career opportunities on campus.",
    },
  ],

  // Educação e formação. status: texto pequeno ao lado do título (opcional).
  education: [
    {
      period: "2023 – 2027", now: true,
      role: "BSc Computer Science and Engineering",
      org: "NOVA School of Science and Technology (NOVA FCT)",
      desc: "Transferred from Electrical and Computer Engineering after three semesters to focus on software and security.",
      status: "expected 2027",
    },
    {
      period: "ongoing", now: true,
      role: "TryHackMe Premium",
      org: "Hands-on offensive security training",
      desc: "Finishing the fundamentals modules (networking, Linux, web) before moving on to the offensive paths.",
      link: "https://tryhackme.com/p/Vurado",
      status: "in progress",
    },
    {
      period: "next",
      role: "PT1, Junior Penetration Tester",
      org: "TryHackMe certification",
      desc: "Practical pentest exam. Preparing for it now.",
      status: "planned",
    },
  ],

  // Competências como portas: "open" = domino, "filtered" = estou a aprender.
  // Mantém só o que consegues defender numa entrevista.
  ports: [
    { port: "22/tcp",   state: "open",     service: "linux",       version: "Linux, Bash scripting" },
    { port: "53/udp",   state: "open",     service: "networking",  version: "TCP/IP, DNS, HTTP" },
    { port: "80/tcp",   state: "filtered", service: "web-exploit", version: "OWASP Top 10, Burp Suite" },
    { port: "88/tcp",   state: "filtered", service: "ad-attacks",  version: "Active Directory" },
    { port: "445/tcp",  state: "filtered", service: "privesc",     version: "Linux and Windows privilege escalation" },
    { port: "8080/tcp", state: "open",     service: "dev",         version: "Java, C, Python, OCaml, Assembly, SQL" },
    { port: "9418/tcp", state: "open",     service: "tooling",     version: "Git, Docker, Wireshark/tshark" },
  ],

  code: ["Java", "C", "Python", "OCaml", "Assembly", "SQL", "JavaScript", "HTML/CSS"],

  spoken: [
    ["Portuguese", "fluent"],
    ["Ukrainian",  "fluent"],
    ["English",    "advanced"],
  ],

  // Write-ups (TryHackMe, CTFs). Formato: { name, desc, url, date, tags: [] }
  writeups: [
  ],
};
