const CHAT_STORAGE_KEY = "sig-study-chat-v1";

const chatEls = {
  toggle: document.getElementById("chatToggle"),
  panel: document.getElementById("chatPanel"),
  close: document.getElementById("chatClose"),
  messages: document.getElementById("chatMessages"),
  form: document.getElementById("chatForm"),
  input: document.getElementById("chatInput"),
};

const REPLIES = [
  {
    keys: ["hello", "hi", "hey", "namaste"],
    answer:
      "Hi! I’m the SIG Study Bot. Ask about a Semester 1 subject (Python, maths, GIS, RDBMS, stats…) or how to upload notes.",
  },
  {
    keys: ["help", "what can", "subjects", "semester"],
    answer:
      "Semester 1 subjects: Mathematics for Spatial Sciences, Statistics and Probability, Introduction to Geospatial Technology, RDBMS, Data Protection, Python for Data Science, Business Communication, Research Methodology. Ask about any one.",
  },
  {
    keys: ["python", "pandas", "numpy"],
    answer:
      "Python for Data Science tip: practise load → clean → groupby → plot in one notebook. Keep cells short. Upload your lab PDF/PNG under the subject card.",
  },
  {
    keys: ["math", "matrix", "linear", "algebra", "vector"],
    answer:
      "Mathematics for Spatial Sciences tip: focus on matrices, vectors, and coordinate transforms used in GIS. Keep a one-page formula sheet.",
  },
  {
    keys: ["stat", "probability", "distribution", "sample"],
    answer:
      "Statistics and Probability tip: describe the dataset first, then pick a distribution or test. Write assumptions in your notes before calculating.",
  },
  {
    keys: ["gis", "geospatial", "raster", "vector", "projection", "gps"],
    answer:
      "Geospatial Technology tip: know raster vs vector, and when a projection matters. Try a Pune/campus map example in your notes.",
  },
  {
    keys: ["sql", "rdbms", "database", "join", "normal"],
    answer:
      "RDBMS tip: practise keys and 3NF, then the same join as SQL and as a table merge. Upload query screenshots if useful.",
  },
  {
    keys: ["privacy", "protection", "consent", "security"],
    answer:
      "Data Protection tip: purpose limitation and data minimisation. Don’t keep identifiers a lab does not need.",
  },
  {
    keys: ["communication", "email", "presentation", "business"],
    answer:
      "Business Communication tip: audience → clear structure → one ask. Draft a short email or slide outline after class.",
  },
  {
    keys: ["research", "method", "methodology", "cite"],
    answer:
      "Research Methodology tip: question → data → method → validity. A classmate should be able to repeat your methods section.",
  },
  {
    keys: ["upload", "file", "pdf", "note", "localstorage", "save"],
    answer:
      "To save notes: open a subject card, drag a file or click Upload note (pdf, png, jpg, txt, md, doc, docx, max 4 MB). Files stay in this browser.",
  },
  {
    keys: ["login", "prn", "password", "logout"],
    answer:
      "Login uses Name as username and PRN as password. First login creates your account here. Logout returns to login.html.",
  },
];

function loadChat() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveChat(messages) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-40)));
}

let chatHistory = loadChat();

function botReply(text) {
  const q = text.toLowerCase();
  for (const item of REPLIES) {
    if (item.keys.some((key) => q.includes(key))) return item.answer;
  }
  return "I’m not sure yet. Try asking about Python, maths, GIS, RDBMS, statistics, uploads, or login. This is a local study helper, not official SIG LMS.";
}

function appendMessage(role, text) {
  const row = document.createElement("div");
  row.className = `chat-bubble chat-${role}`;
  row.textContent = text;
  chatEls.messages.append(row);
  chatEls.messages.scrollTop = chatEls.messages.scrollHeight;
}

function renderChat() {
  chatEls.messages.innerHTML = "";
  if (!chatHistory.length) {
    appendMessage(
      "bot",
      "Hi! Ask me about Semester 1 subjects or how to upload notes."
    );
    return;
  }
  for (const msg of chatHistory) {
    appendMessage(msg.role, msg.text);
  }
}

function setOpen(open) {
  chatEls.panel.hidden = !open;
  chatEls.toggle.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    renderChat();
    chatEls.input.focus();
  }
}

chatEls.toggle.addEventListener("click", () => {
  setOpen(chatEls.panel.hidden);
});

chatEls.close.addEventListener("click", () => setOpen(false));

chatEls.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatEls.input.value.trim();
  if (!text) return;
  chatEls.input.value = "";

  chatHistory.push({ role: "user", text });
  const reply = botReply(text);
  chatHistory.push({ role: "bot", text: reply });
  saveChat(chatHistory);
  renderChat();
});
