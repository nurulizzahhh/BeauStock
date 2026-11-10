/* =====================================================
   BeauStock - Pagination (Previous / Next buttons)
   Shows a few records at a time instead of one long list.
   Used by: dashboard activity, products, stock levels,
   movement history, suppliers, purchase orders, reports.
   ===================================================== */

const BeauPager = (function () {

    // Cut one page out of a list.
    // Returns the rows for that page plus the numbers needed to draw the buttons.
    function slice(list, page, pageSize) {
        const total = list.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const current = Math.min(Math.max(1, page), totalPages);   // never below 1 or above the last page
        const start = (current - 1) * pageSize;

        return {
            items: list.slice(start, start + pageSize),
            page: current,
            totalPages: totalPages,
            total: total,
            from: total === 0 ? 0 : start + 1,
            to: Math.min(start + pageSize, total)
        };
    }

    // Draw "Showing 1-5 of 8   [Previous] Page 1 of 2 [Next]" inside the container.
    // onPage(newPageNumber) is called when a button is clicked.
    function render(container, info, onPage) {
        if (!container) return;

        const infoText = info.total === 0
            ? "No records"
            : "Showing " + info.from + "–" + info.to + " of " + info.total;

        container.innerHTML =
            '<span class="pager-info">' + infoText + '</span>' +
            '<div class="pager-controls">' +
                '<button type="button" class="pager-btn" data-pager="prev"' + (info.page <= 1 ? " disabled" : "") + '>‹ Previous</button>' +
                '<span class="pager-page">Page ' + info.page + ' of ' + info.totalPages + '</span>' +
                '<button type="button" class="pager-btn" data-pager="next"' + (info.page >= info.totalPages ? " disabled" : "") + '>Next ›</button>' +
            '</div>';

        container.querySelector('[data-pager="prev"]').addEventListener("click", function () {
            onPage(info.page - 1);
        });
        container.querySelector('[data-pager="next"]').addEventListener("click", function () {
            onPage(info.page + 1);
        });
    }

    return { slice: slice, render: render };
})();
