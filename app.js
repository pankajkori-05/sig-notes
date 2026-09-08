const STORAGE_KEY = "sig-college-notes-v3";
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "png", "jpg", "jpeg", "txt", "md", "doc", "docx"];
const ACCEPT = ALLOWED_EXT.map((ext) => `.${ext}`).join(",");

const session = loadSession();
if (!session?.name) {
  window.location.replace("login.html");
  throw new Error("Not logged in");
}

const DEFAULT_SUBJECTS = [
  {
    id: "0702440101",
    code: "0702440101",
    credits: 4,
    name: "Mathematics for Spatial Sciences",
    studentNote: "",
    studentFiles: [],
  },
  {
    id: "0702440102",
    code: "0702440102",
    credits: 3,
    name: "Statistics and Probability",
    studentNote: "",
    studentFiles: [],
  },
  {
    id: "0702440103",
    code: "0702440103",
    credits: 3,
    name: "Introduction to Geospatial Technology",
    studentNote: "",
    studentFiles: [],
  },
  {
    id: "0702440104",
    code: "0702440104",
    credits: 3,
    name: "Relational Database Management System",
    studentNote: "",
    studentFiles: [],
  },
  {
    id: "0702440105",
    code: "0702440105",
    credits: 3,
    name: "Principles and Practices of Data Protection",
    studentNote: "",
    studentFiles: [],
  },
  {
    id: "0702440106",
    code: "0702440106",
    credits: 3,
    name: "Python for Data Science",
    studentNote: "",
    studentFiles: [],
  },
  {
    id: "0702440107",
    code: "0702440107",
    credits: 2,
    name: "Business Communication",
    studentNote: "",
    studentFiles: [],
  },
  {
    id: "0702440108",
    code: "0702440108",
    credits: 2,
    name: "Research Methodology in Computational Sciences",
    studentNote: "",
    studentFiles: [],
  },
];

const els = {
  sessionName: document.getElementById("sessionName"),
  logoutBtn: document.getElementById("logoutBtn"),
  cards: document.getElementById("cards"),
  search: document.getElementById("searchInput"),
  status: document.getElementById("status"),
};

let state = loadState();
if (session?.name) {
  state.name = session.name;
  persist();
}

function loadState() {
  const fresh = {
    name: session?.name || "",
    subjects: structuredClone(DEFAULT_SUBJECTS),
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw);
    const byId = new Map((parsed.subjects || []).map((s) => [s.id, s]));
    return {
      name: session?.name || (typeof parsed.name === "string" ? parsed.name : ""),
      subjects: DEFAULT_SUBJECTS.map((base) => {
        const saved = byId.get(base.id);
        return saved
          ? {
              ...base,
              studentNote: saved.studentNote ?? "",
              studentFiles: Array.isArray(saved.studentFiles) ? saved.studentFiles : [],
            }
          : { ...base };
      }),
    };
  } catch {
    return fresh;
  }
}

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: state.name,
      subjects: state.subjects.map(({ id, studentNote, studentFiles }) => ({
        id,
        studentNote,
        studentFiles,
      })),
    })
  );
}

function saveState() {
  try {
    persist();
    setStatus("Saved in this browser");
  } catch {
    setStatus("Could not save — this browser is out of storage space.");
  }
}

function setStatus(text) {
  els.status.textContent = text;
  window.clearTimeout(setStatus._t);
  setStatus._t = window.setTimeout(() => {
    els.status.textContent = "";
  }, 2200);
}

function matchesQuery(subject, q) {
  if (!q) return true;
  const hay = `${subject.name} ${subject.code} ${subject.credits}`.toLowerCase();
  return hay.includes(q);
}

function extOf(filename) {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToRecord(file, dataUrl) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    dataUrl,
    uploadedBy: state.name.trim() || "Unnamed student",
    uploadedAt: new Date().toISOString(),
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function addStudentFiles(subject, fileList) {
  const files = [...fileList];
  if (!files.length) return;

  const accepted = [];
  for (const file of files) {
    const ext = extOf(file.name);
    if (!ALLOWED_EXT.includes(ext)) {
      setStatus(`Skipped ${file.name} — use pdf, png, jpg, txt, md, doc, or docx.`);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStatus(`${file.name} is over 4 MB.`);
      continue;
    }
    accepted.push(file);
  }
  if (!accepted.length) return;

  try {
    const records = [];
    for (const file of accepted) {
      records.push(fileToRecord(file, await readFileAsDataUrl(file)));
    }
    subject.studentFiles = [...subject.studentFiles, ...records];
    persist();
    setStatus(
      records.length === 1
        ? `Saved ${records[0].name} for ${records[0].uploadedBy}`
        : `Saved ${records.length} files for ${records[0].uploadedBy}`
    );
    render();
  } catch {
    setStatus("Could not save files in this browser.");
  }
}

function openStudentFile(file) {
  const a = document.createElement("a");
  a.href = file.dataUrl;
  a.target = "_blank";
  a.rel = "noopener";
  a.download = file.name;
  a.click();
}

function removeStudentFile(subject, fileId) {
  subject.studentFiles = subject.studentFiles.filter((f) => f.id !== fileId);
  saveState();
  render();
}

function renderCard(subject) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = subject.id;

  const title = document.createElement("div");
  const h2 = document.createElement("h2");
  h2.textContent = subject.name;
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${subject.code} · ${subject.credits} cr`;
  title.append(h2, meta);
  card.append(title);
  card.append(renderStudentNote(subject));
  return card;
}

function renderStudentNote(subject) {
  const wrap = document.createElement("section");
  wrap.className = "note";

  const head = document.createElement("div");
  head.className = "note-head";
  const badge = document.createElement("span");
  badge.className = "badge student";
  badge.textContent = "Student note";
  head.append(badge);
  wrap.append(head);

  wrap.append(renderStudentFiles(subject));
  return wrap;
}

function renderStudentFiles(subject) {
  const box = document.createElement("div");
  const files = subject.studentFiles || [];

  if (files.length) {
    const list = document.createElement("ul");
    list.className = "file-list";
    for (const file of files) {
      const li = document.createElement("li");
      li.className = "file-row";
      const meta = document.createElement("div");
      meta.className = "file-meta";
      const strong = document.createElement("strong");
      strong.textContent = file.name;
      const span = document.createElement("span");
      span.textContent = `${formatSize(file.size)} · ${file.uploadedBy}`;
      meta.append(strong, span);

      const actions = document.createElement("div");
      actions.className = "file-actions";
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "btn-ghost";
      openBtn.textContent = "Open";
      openBtn.addEventListener("click", () => openStudentFile(file));
      actions.append(openBtn);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn-ghost";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => removeStudentFile(subject, file.id));
      actions.append(removeBtn);

      li.append(meta, actions);
      list.append(li);
    }
    box.append(list);
  }

  const zone = document.createElement("div");
  zone.className = "dropzone";
  const hint = document.createElement("p");
  hint.textContent = "Drag and drop pdf, png, jpg, txt, md, doc, or docx (max 4 MB).";
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ACCEPT;
  input.multiple = true;
  input.className = "sr-only";
  input.addEventListener("change", () => {
    addStudentFiles(subject, input.files);
    input.value = "";
  });
  const uploadBtn = document.createElement("button");
  uploadBtn.type = "button";
  uploadBtn.className = "btn-ghost";
  uploadBtn.textContent = "Upload note";
  uploadBtn.addEventListener("click", () => input.click());
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("is-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("is-over");
    addStudentFiles(subject, event.dataTransfer.files);
  });
  zone.append(hint, uploadBtn, input);
  box.append(zone);

  return box;
}

function render() {
  if (!session?.name) return;
  els.sessionName.textContent = session.name;
  const q = els.search.value.trim().toLowerCase();
  const list = state.subjects.filter((s) => matchesQuery(s, q));
  els.cards.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No subjects match that search.";
    els.cards.append(empty);
    return;
  }

  for (const subject of list) {
    els.cards.append(renderCard(subject));
  }
}

els.logoutBtn.addEventListener("click", () => {
  logoutSession();
  window.location.href = "login.html";
});
els.search.addEventListener("input", render);

if (session?.name) {
  render();
}
