const session = loadSession();
if (session?.name) {
  window.location.replace("index.html");
}

const form = document.getElementById("loginForm");
const nameInput = document.getElementById("loginName");
const prnInput = document.getElementById("loginPrn");
const signupBtn = document.getElementById("signupBtn");
const errorEl = document.getElementById("loginError");

const remembered = loadLastLogin();
nameInput.value = remembered.name || "";
prnInput.value = remembered.prn || "";

function goToNotes() {
  errorEl.textContent = "";
  window.location.href = "index.html";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    loginWithNameAndPrn(nameInput.value, prnInput.value);
    goToNotes();
  } catch (err) {
    errorEl.textContent = err.message || "Login failed.";
  }
});

signupBtn.addEventListener("click", () => {
  try {
    signupWithNameAndPrn(nameInput.value, prnInput.value);
    goToNotes();
  } catch (err) {
    errorEl.textContent = err.message || "Sign up failed.";
  }
});
