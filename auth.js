const ACCOUNTS_KEY = "sig-student-accounts";
const SESSION_KEY = "sig-student-session";
const NOTES_NAME_KEY = "sig-college-notes-v3";

const LOCKED_ACCOUNT = {
  name: "Pankaj kori",
  prn: "26070243024",
};

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.name !== "string" || !parsed.name.trim()) return null;
    return { name: parsed.name.trim() };
  } catch {
    return null;
  }
}

function saveSession(next) {
  if (!next) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: next.name.trim() }));
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function syncNotesStudentName(studentName) {
  try {
    const raw = localStorage.getItem(NOTES_NAME_KEY);
    const parsed = raw ? JSON.parse(raw) : { name: "", subjects: [] };
    parsed.name = studentName;
    if (!Array.isArray(parsed.subjects)) parsed.subjects = [];
    localStorage.setItem(NOTES_NAME_KEY, JSON.stringify(parsed));
  } catch {
    localStorage.setItem(
      NOTES_NAME_KEY,
      JSON.stringify({ name: studentName, subjects: [] })
    );
  }
}

function loginWithNameAndPrn(name, prn) {
  const studentName = name.trim();
  const password = prn.trim();
  if (!studentName || !password) {
    throw new Error("Enter your name and PRN.");
  }

  if (
    normalizeName(studentName) !== normalizeName(LOCKED_ACCOUNT.name) ||
    password !== LOCKED_ACCOUNT.prn
  ) {
    throw new Error("This login is locked to one student account.");
  }

  const accounts = loadAccounts();
  const key = normalizeName(LOCKED_ACCOUNT.name);
  accounts[key] = { name: LOCKED_ACCOUNT.name, prn: LOCKED_ACCOUNT.prn };
  saveAccounts(accounts);

  syncNotesStudentName(LOCKED_ACCOUNT.name);
  saveSession({ name: LOCKED_ACCOUNT.name });
  return LOCKED_ACCOUNT.name;
}

function logoutSession() {
  saveSession(null);
}

function changePassword() {
  throw new Error("This account is locked. Password cannot be changed.");
}
