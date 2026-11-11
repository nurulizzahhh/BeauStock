/* =====================================================
   BeauStock - Select2 helper (searchable dropdowns)
   Select2 needs jQuery. If either library fails to load
   (for example, no internet), the normal dropdowns still
   work, so the page never breaks.
   ===================================================== */

const BeauSelect = (function () {

    function available() {
        return !!(window.jQuery && window.jQuery.fn && window.jQuery.fn.select2);
    }

    // Turn a normal <select> into a searchable Select2 dropdown
    function enhance(select, options) {
        if (!select || !available()) return;
        window.jQuery(select).select2(Object.assign({
            width: "100%",
            minimumResultsForSearch: 0     // 0 = always show the search box
        }, options || {}));
    }

    // Run a function whenever the selection changes.
    // Select2 announces changes through jQuery, so we listen with jQuery when it exists.
    function onChange(select, handler) {
        if (!select) return;
        if (available()) {
            window.jQuery(select).on("change", handler);
        } else {
            select.addEventListener("change", handler);
        }
    }

    // Put a dropdown back to a value WITHOUT running the filter
    // (used by the Reset buttons, which run the filter once at the end)
    function reset(select, value) {
        if (!select) return;
        select.value = value;
        if (available()) {
            window.jQuery(select).trigger("change.select2");   // refresh only the Select2 display
        }
    }

    return { enhance: enhance, onChange: onChange, reset: reset };
})();
