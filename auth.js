const ACCOUNTS_KEY = "sig-student-accounts";
const SESSION_KEY = "sig-student-session";
const NOTES_NAME_KEY = "sig-college-notes-v3";

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

  const accounts = loadAccounts();
  const key = normalizeName(studentName);
  const existing = accounts[key];

  if (!existing) {
    accounts[key] = { name: studentName, prn: password };
    saveAccounts(accounts);
  } else if (existing.prn !== password) {
    throw new Error("Wrong PRN for this name.");
  }

  const finalName = existing?.name || studentName;
  syncNotesStudentName(finalName);
  saveSession({ name: finalName });
  return finalName;
}

function logoutSession() {
  saveSession(null);
}

function changePassword(currentPrn, newPrn, confirmPrn) {
  const session = loadSession();
  if (!session?.name) {
    throw new Error("You must be logged in to change your password.");
  }

  const current = String(currentPrn || "").trim();
  const next = String(newPrn || "").trim();
  const confirm = String(confirmPrn || "").trim();

  if (!current || !next || !confirm) {
    throw new Error("Fill in current password, new password, and confirm.");
  }
  if (next.length < 4) {
    throw new Error("New password must be at least 4 characters.");
  }
  if (next !== confirm) {
    throw new Error("New password and confirm do not match.");
  }
  if (next === current) {
    throw new Error("New password must be different from the current one.");
  }

  const accounts = loadAccounts();
  const key = normalizeName(session.name);
  const account = accounts[key];
  if (!account) {
    throw new Error("Account not found. Log out and log in again.");
  }
  if (account.prn !== current) {
    throw new Error("Current password (PRN) is wrong.");
  }

  accounts[key] = { ...account, prn: next };
  saveAccounts(accounts);
}
