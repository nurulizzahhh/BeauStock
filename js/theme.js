/* BeauStock - Dark mode */
(function () {
    // 1. Read the saved choice (default is light)
    let theme = "light";
    try {
        theme = localStorage.getItem("beauStockTheme") || "light";
    } catch (error) {}

    // 2. Put the label on the <html> tag. Our CSS uses data-theme,
    //    Bootstrap uses data-bs-theme (it styles forms and modals for us)
    function applyTheme(value) {
        document.documentElement.setAttribute("data-theme", value);
        document.documentElement.setAttribute("data-bs-theme", value);
    }
    applyTheme(theme);   // runs straight away, so there's no white flash

    // 3. Connect the button once the page has loaded
    document.addEventListener("DOMContentLoaded", function () {
        const button = document.getElementById("themeToggle");
        if (!button) return;

        // Icon + text. On phones CSS hides the text and keeps only the icon.
        function updateLabel() {
            const dark = theme === "dark";
            button.innerHTML =
                '<span class="theme-icon" aria-hidden="true">' + (dark ? "☀" : "☾") + '</span>' +
                '<span class="theme-label"> ' + (dark ? "Light mode" : "Dark mode") + '</span>';
            button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
        }
        updateLabel();

        button.addEventListener("click", function () {
            theme = theme === "dark" ? "light" : "dark";
            applyTheme(theme);
            try { localStorage.setItem("beauStockTheme", theme); } catch (error) {}
            updateLabel();
            // Charts take their colours when they are drawn, so redraw them
            if (typeof Chart !== "undefined") location.reload();
        });
    });
})();