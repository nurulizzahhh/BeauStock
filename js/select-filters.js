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

    return { enhance: enhance, onChange: onChange };
})();
