/* =====================================================
   BeauStock - Log out + mobile menu (hamburger button)
   On phones the sidebar is hidden. The ☰ button slides it
   in; the dark overlay, the Esc key, or choosing a link
   closes it again.
   ===================================================== */
(function () {

    // ----- Log out (kept here so it works on every page,
    //       even if a chart library fails to load) -----
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            sessionStorage.removeItem("beauStockLoggedIn");
            window.location.href = "index.html";
        });
    }

    // ----- Mobile menu -----
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("menuToggle");
    const overlay = document.getElementById("sidebarOverlay");

    // If this page has no mobile menu, stop here
    if (!sidebar || !toggle || !overlay) return;

    // One function that opens or closes the menu and keeps every state in sync
    function setOpen(open) {
        sidebar.classList.toggle("is-open", open);
        overlay.classList.toggle("is-visible", open);
        document.body.classList.toggle("menu-open", open);   // stops the page scrolling behind
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        toggle.textContent = open ? "✕" : "☰";
    }

    // ☰ button: flip between open and closed
    toggle.addEventListener("click", function () {
        setOpen(!sidebar.classList.contains("is-open"));
    });

    // Tap the dark area to close
    overlay.addEventListener("click", function () {
        setOpen(false);
    });

    // Press Esc to close
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setOpen(false);
    });

    // Choosing a page closes the menu
    sidebar.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            setOpen(false);
        });
    });

    // If the window grows to desktop size, reset
    window.matchMedia("(min-width: 701px)").addEventListener("change", function (event) {
        if (event.matches) setOpen(false);
    });
})();
