
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === "izzah" && password === "izzahcomel") {
        sessionStorage.setItem("beauStockLoggedIn", "true");
        window.location.href = "dashboard.html";
    } else {
        loginMessage.textContent =
            "Incorrect username or password. Please try again.";
    }
});

// Show / hide password
const passwordInput = document.getElementById("password");
const toggleButton = document.getElementById("togglePassword");

toggleButton.addEventListener("click", function () {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";   // flip the type
    toggleButton.textContent = isHidden ? "🙈" : "👁";      // flip the icon
    toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});
