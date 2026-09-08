const session = loadSession();
if (session?.name) {
  window.location.replace("index.html");
}

const form = document.getElementById("loginForm");
const nameInput = document.getElementById("loginName");
const prnInput = document.getElementById("loginPrn");
const errorEl = document.getElementById("loginError");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    loginWithNameAndPrn(nameInput.value, prnInput.value);
    errorEl.textContent = "";
    window.location.href = "index.html";
  } catch (err) {
    errorEl.textContent = err.message || "Login failed.";
  }
});
