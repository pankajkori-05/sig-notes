(function () {
  const session = loadSession();
  if (session?.name) {
    window.location.replace("./index.html");
    return;
  }

  const form = document.getElementById("loginForm");
  const nameInput = document.getElementById("loginName");
  const prnInput = document.getElementById("loginPrn");
  const errorEl = document.getElementById("loginError");

  if (!form || !nameInput || !prnInput || !errorEl) {
    console.error("Login form elements missing");
    return;
  }

  if (typeof signupWithNameAndPrn !== "function") {
    errorEl.textContent = "Sign up is unavailable. Refresh the page.";
    return;
  }

  const remembered = loadLastLogin();
  nameInput.value = remembered.name || "";
  prnInput.value = remembered.prn || "";

  function showError(message) {
    errorEl.textContent = message || "";
  }

  function goHome() {
    showError("");
    window.location.replace("./index.html");
  }

  function runAuth(mode) {
    const name = nameInput.value;
    const prn = prnInput.value;

    if (!String(name).trim() || !String(prn).trim()) {
      showError("Enter your name and PRN.");
      if (!String(name).trim()) nameInput.focus();
      else prnInput.focus();
      return;
    }

    try {
      if (mode === "signup") {
        signupWithNameAndPrn(name, prn);
      } else {
        loginWithNameAndPrn(name, prn);
      }
      goHome();
    } catch (err) {
      showError(err && err.message ? err.message : "Something went wrong.");
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter || document.activeElement;
    const mode =
      (submitter &&
        submitter.getAttribute &&
        submitter.getAttribute("data-mode")) ||
      "login";
    runAuth(mode);
  });
})();
