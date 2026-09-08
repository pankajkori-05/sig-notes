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

function goHome() {
  errorEl.textContent = "";
  window.location.replace("index.html");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    loginWithNameAndPrn(nameInput.value, prnInput.value);
    goHome();
  } catch (err) {
    errorEl.textContent = err.message || "Login failed.";
  }
});

signupBtn.addEventListener("click", () => {
  errorEl.textContent = "";
  if (!form.reportValidity()) return;
  try {
    signupWithNameAndPrn(nameInput.value, prnInput.value);
    goHome();
  } catch (err) {
    errorEl.textContent = err.message || "Sign up failed.";
  }
});
