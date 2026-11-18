"use strict";

/* ---------- Data ---------- */
const STORAGE_KEY = "job-tracker-v2";
const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

const SEED = [
  { id: "wit", role: "AI-Assisted UI/UX Designer", company: "WIT Software", meta: "Applied on 18 Nov", appliedOn: "18 Nov 2026", status: "Applied", notes: "Finish the Figma case study and send the link", link: "" },
  { id: "northwind", role: "Learning Experience Designer", company: "Northwind Learning", meta: "Interview on 25 Nov", appliedOn: "10 Nov 2026", status: "Interview", notes: "Interview on 25 Nov. Prepare two examples of learning content", link: "" },
  { id: "brightpath", role: "Content Designer", company: "Brightpath", meta: "Offer received 16 Nov", appliedOn: "5 Nov 2026", status: "Offer", notes: "Offer received on 16 Nov. Reply by Friday", link: "" },
  { id: "atlas", role: "Localization Specialist", company: "Atlas Games", meta: "Closed on 10 Nov", appliedOn: "28 Oct 2026", status: "Rejected", notes: "Closed on 10 Nov. Ask for feedback", link: "" }
];

function isValidApp(a) {
  return a && typeof a.id === "string" && typeof a.role === "string" && typeof a.company === "string" && STATUSES.includes(a.status);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(isValidApp)) return parsed;
    }
  } catch (e) { /* storage unavailable: use seed data */ }
  return SEED.map((a) => ({ ...a }));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch (e) { /* ignore */ }
}

let applications = loadState();

/* ---------- Helpers ---------- */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(child);
  }
  return node;
}

const STATUS_CLASS = {
  Applied: "chip-applied",
  Interview: "chip-interview",
  Offer: "chip-offer",
  Rejected: "chip-rejected"
};

function chip(status) {
  return el("span", { class: "chip " + (STATUS_CLASS[status] || "chip-applied"), text: status });
}

function formatDay(date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

function formatFull(date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function metaFor(status, date) {
  const day = formatDay(date);
  if (status === "Interview") return "Interview stage since " + day;
  if (status === "Offer") return "Offer received " + day;
  if (status === "Rejected") return "Closed on " + day;
  return "Applied on " + day;
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function summaryText() {
  const active = applications.filter((a) => a.status === "Applied" || a.status === "Interview").length;
  const interviews = applications.filter((a) => a.status === "Interview").length;
  return active + " active application" + (active === 1 ? "" : "s") + ", " + interviews + " interview" + (interviews === 1 ? "" : "s");
}

/* ---------- Shared pieces ---------- */
function header(title) {
  return el("header", { class: "header" }, [el("h1", { text: title, tabindex: "-1", id: "page-title" })]);
}

function field(id, label, options = {}) {
  const input = options.multiline
    ? el("textarea", { id, name: id, rows: "3" })
    : el("input", { id, name: id, type: options.type || "text" });
  if (options.value) input.value = options.value;
  if (options.placeholder) input.setAttribute("placeholder", options.placeholder);
  if (options.readonly) input.setAttribute("readonly", "");
  if (options.required) input.setAttribute("required", "");
  return { wrapper: el("div", { class: "field" }, [el("label", { for: id, text: label }), input]), input };
}

function selectField(id, label, value) {
  const select = el("select", { id, name: id });
  for (const status of STATUSES) {
    const option = el("option", { value: status, text: status });
    if (status === value) option.selected = true;
    select.appendChild(option);
  }
  return { wrapper: el("div", { class: "field" }, [el("label", { for: id, text: label }), select]), input: select };
}

/* ---------- Views ---------- */
function listView() {
  const content = el("div", { class: "content" });
  if (applications.length === 0) {
    content.appendChild(el("p", { class: "empty", text: "No applications yet. Add your first one below." }));
  }
  for (const app of applications) {
    content.appendChild(
      el("a", { class: "card", href: "#detail-" + app.id }, [
        el("div", { class: "card-info" }, [
          el("span", { class: "card-role", text: app.role }),
          el("span", { class: "card-meta", text: app.company }),
          el("span", { class: "card-meta", text: app.meta })
        ]),
        chip(app.status)
      ])
    );
  }
  content.appendChild(el("a", { class: "btn btn-primary", href: "#new", text: "Add application" }));
  return el("div", { class: "view" }, [header("Applications"), content]);
}

function detailView(id) {
  const app = applications.find((a) => a.id === id);
  if (!app) return null;

  const content = el("div", { class: "content" });
  content.appendChild(el("h2", { class: "detail-title", text: app.role }));
  let chipEl = chip(app.status);
  content.appendChild(chipEl);
  content.appendChild(field("company", "Company", { value: app.company, readonly: true }).wrapper);
  content.appendChild(field("applied-on", "Applied on", { value: app.appliedOn, readonly: true }).wrapper);

  const status = selectField("status", "Status", app.status);
  status.input.addEventListener("change", () => {
    app.status = status.input.value;
    app.meta = metaFor(app.status, new Date());
    saveState();
    const next = chip(app.status);
    chipEl.replaceWith(next);
    chipEl = next;
  });
  content.appendChild(status.wrapper);

  if (app.link && isHttpUrl(app.link)) {
    content.appendChild(
      el("div", { class: "field" }, [
        el("label", { text: "Posting" }),
        el("a", { href: app.link, target: "_blank", rel: "noopener noreferrer", class: "btn btn-secondary", text: "Open the job posting" })
      ])
    );
  }
  const notes = field("notes", "Notes", { value: app.notes, multiline: true, placeholder: "Add a note" });
  notes.input.addEventListener("input", () => {
    app.notes = notes.input.value;
    saveState();
  });
  content.appendChild(notes.wrapper);
  content.appendChild(el("a", { class: "btn btn-secondary", href: "#applications", text: "Back to list" }));
  return el("div", { class: "view" }, [header("Details"), content]);
}

function newView() {
  const content = el("form", { class: "content", novalidate: "" });
  const role = field("role", "Job title", { placeholder: "e.g. UX Researcher", required: true });
  const company = field("company", "Company", { placeholder: "e.g. Northwind Labs", required: true });
  const status = selectField("status", "Status", "Applied");
  const link = field("link", "Link to the posting", { placeholder: "https://", type: "url" });
  const error = el("p", { class: "field-error", role: "alert", id: "form-error" });

  content.append(role.wrapper, company.wrapper, status.wrapper, link.wrapper, error);
  content.appendChild(el("button", { class: "btn btn-primary", type: "submit", text: "Save application" }));
  content.appendChild(el("a", { class: "btn btn-secondary", href: "#applications", text: "Cancel" }));

  content.addEventListener("submit", (event) => {
    event.preventDefault();
    for (const f of [role, company, link]) f.input.removeAttribute("aria-invalid");
    error.textContent = "";

    const roleValue = role.input.value.trim();
    const companyValue = company.input.value.trim();
    const linkValue = link.input.value.trim();

    if (!roleValue) {
      role.input.setAttribute("aria-invalid", "true");
      error.textContent = "Please enter the job title.";
      role.input.focus();
      return;
    }
    if (!companyValue) {
      company.input.setAttribute("aria-invalid", "true");
      error.textContent = "Please enter the company name.";
      company.input.focus();
      return;
    }
    if (linkValue && !isHttpUrl(linkValue)) {
      link.input.setAttribute("aria-invalid", "true");
      error.textContent = "Enter a full link that starts with https://";
      link.input.focus();
      return;
    }

    const today = new Date();
    const chosen = status.input.value;
    applications.unshift({
      id: newId(),
      role: roleValue,
      company: companyValue,
      meta: metaFor(chosen, today),
      appliedOn: formatFull(today),
      status: chosen,
      notes: "",
      link: linkValue
    });
    saveState();
    location.hash = "#applications";
  });

  return el("div", { class: "view" }, [header("New application"), content]);
}

/* ---------- Welcome: the blue cover shrinks into the list header ---------- */
const root = document.getElementById("app");
let welcomeOpen = !location.hash;
let skipFade = false;

function createWelcome() {
  const HEADER_H = 106;
  const hello = el("span", { class: "welcome-t welcome-t-hello", text: "Hello there!" });
  const apps = el("span", { class: "welcome-t welcome-t-apps", text: "Applications", "aria-hidden": "true" });
  const title = el("h1", { class: "welcome-title", id: "welcome-title" }, [hello, apps]);
  const status = el("p", { class: "welcome-status", text: summaryText() });
  const cta = el("button", { class: "welcome-cta", type: "button" });
  cta.innerHTML =
    '<svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true"><path d="M2 10l8-8 8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  cta.appendChild(el("span", { text: "Swipe up to start" }));
  const box = el("section", { class: "welcome", "aria-label": "Welcome" }, [title, status, cta]);

  let travel = 1;
  let dragging = false;
  let moved = false;
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;
  let p = 0;
  let done = false;

  const setP = (value) => {
    p = Math.min(1, Math.max(0, value));
    box.style.setProperty("--p", p.toFixed(4));
  };

  const complete = () => {
    if (done) return;
    done = true;
    welcomeOpen = false;
    skipFade = true;
    if (location.hash === "#applications") render();
    else location.hash = "#applications";
  };

  const settle = (open) => {
    box.classList.remove("dragging");
    box.classList.add("settling");
    setP(open ? 1 : 0);
    if (open && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      complete();
    } else if (open) {
      let fired = false;
      const finish = () => { if (!fired) { fired = true; complete(); } };
      box.addEventListener("transitionend", (e) => { if (e.propertyName === "--p") finish(); }, { once: true });
      setTimeout(finish, 800);
    } else {
      setTimeout(() => box.classList.remove("settling"), 700);
    }
  };

  box.addEventListener("pointerdown", (e) => {
    if (done || (e.pointerType === "mouse" && e.button !== 0)) return;
    travel = Math.max(1, root.clientHeight - HEADER_H);
    dragging = true;
    moved = false;
    startY = lastY = e.clientY;
    lastT = performance.now();
    velocity = 0;
    box.classList.remove("settling");
    box.classList.add("dragging");
    box.setPointerCapture(e.pointerId);
  });

  box.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = startY - e.clientY;
    if (Math.abs(dy) > 6) moved = true;
    const now = performance.now();
    velocity = (lastY - e.clientY) / Math.max(1, now - lastT);
    lastY = e.clientY;
    lastT = now;
    setP(dy / travel);
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    if (!moved) { settle(true); return; }
    settle(p > 0.3 || velocity > 0.5);
  };
  box.addEventListener("pointerup", release);
  box.addEventListener("pointercancel", () => { if (dragging) { dragging = false; settle(false); } });

  cta.addEventListener("click", (e) => {
    if (e.detail === 0) settle(true); /* keyboard activation */
  });

  return { box, cta };
}

/* ---------- Router ---------- */
function render() {
  const hash = location.hash || "#applications";
  let view = null;

  if (hash.startsWith("#detail-")) {
    view = detailView(hash.slice("#detail-".length));
  } else if (hash === "#new") {
    view = newView();
  } else {
    view = listView();
  }
  if (!view) view = listView();
  if (skipFade) view.classList.add("no-fade");

  const showWelcome = welcomeOpen && !location.hash;
  root.replaceChildren(view);

  if (showWelcome) {
    view.setAttribute("inert", "");
    const welcome = createWelcome();
    root.appendChild(welcome.box);
  } else {
    skipFade = false;
    document.title = "Job Tracker";
    const title = document.getElementById("page-title");
    if (title) title.focus({ preventScroll: true });
  }
}

window.addEventListener("hashchange", () => {
  if (location.hash) welcomeOpen = false;
  render();
});
render();
