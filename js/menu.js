/* BeauStock - Mobile menu (hamburger button) */
(function () {
    // 1. Find the three elements we need on the page
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("menuToggle");
    const overlay = document.getElementById("sidebarOverlay");

    // If this page doesn't have them, stop quietly
    if (!sidebar || !toggle || !overlay) return;

    // 2. One function that opens or closes the menu
    function setOpen(open) {
        sidebar.classList.toggle("is-open", open);
        overlay.classList.toggle("is-visible", open);
        document.body.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        toggle.textContent = open ? "✕" : "☰";
    }

    // 3. Tapping ☰ flips between open and closed
    toggle.addEventListener("click", function () {
        setOpen(!sidebar.classList.contains("is-open"));
    });

    // 4. Tapping the dark area closes it
    overlay.addEventListener("click", function () {
        setOpen(false);
    });

    // 5. Pressing Esc closes it
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setOpen(false);
    });

    // 6. Choosing a page closes it
    sidebar.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            setOpen(false);
        });
    });

    // 7. If the screen becomes desktop-sized, reset
    window.matchMedia("(min-width: 701px)").addEventListener("change", function (event) {
        if (event.matches) setOpen(false);
    });
})();