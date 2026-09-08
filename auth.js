const ACCOUNTS_KEY = "sig-student-accounts";
const SESSION_KEY = "sig-student-session";
const NOTES_NAME_KEY = "sig-college-notes-v3";
const LAST_LOGIN_KEY = "sig-last-login";

const DEFAULT_ACCOUNT = {
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

function ensureDefaultAccount() {
  const accounts = loadAccounts();
  const key = normalizeName(DEFAULT_ACCOUNT.name);
  if (!accounts[key]) {
    accounts[key] = {
      name: DEFAULT_ACCOUNT.name,
      prn: DEFAULT_ACCOUNT.prn,
    };
    saveAccounts(accounts);
  }
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

function saveLastLogin(name, prn) {
  localStorage.setItem(
    LAST_LOGIN_KEY,
    JSON.stringify({ name: name.trim(), prn: String(prn).trim() })
  );
}

function loadLastLogin() {
  try {
    const raw = localStorage.getItem(LAST_LOGIN_KEY);
    if (!raw) return { ...DEFAULT_ACCOUNT };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.name !== "string") return { ...DEFAULT_ACCOUNT };
    return {
      name: parsed.name.trim() || DEFAULT_ACCOUNT.name,
      prn: typeof parsed.prn === "string" ? parsed.prn : DEFAULT_ACCOUNT.prn,
    };
  } catch {
    return { ...DEFAULT_ACCOUNT };
  }
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

function completeLogin(studentName, password) {
  syncNotesStudentName(studentName);
  saveSession({ name: studentName });
  saveLastLogin(studentName, password);
  return studentName;
}

function signupWithNameAndPrn(name, prn) {
  const studentName = name.trim();
  const password = prn.trim();
  if (!studentName || !password) {
    throw new Error("Enter a name and PRN to sign up.");
  }
  if (password.length < 4) {
    throw new Error("PRN / password must be at least 4 characters.");
  }

  ensureDefaultAccount();
  const accounts = loadAccounts();
  const key = normalizeName(studentName);
  if (accounts[key]) {
    throw new Error("That name is already signed up. Use Login instead.");
  }

  accounts[key] = { name: studentName, prn: password };
  saveAccounts(accounts);
  return completeLogin(studentName, password);
}

function loginWithNameAndPrn(name, prn) {
  const studentName = name.trim();
  const password = prn.trim();
  if (!studentName || !password) {
    throw new Error("Enter your name and PRN.");
  }

  ensureDefaultAccount();
  const accounts = loadAccounts();
  const key = normalizeName(studentName);
  const existing = accounts[key];

  if (!existing) {
    throw new Error("No account found. Tap Sign up to create one.");
  }
  if (existing.prn !== password) {
    throw new Error("Wrong PRN for this name.");
  }

  return completeLogin(existing.name || studentName, password);
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
  saveLastLogin(session.name, next);
}

ensureDefaultAccount();
