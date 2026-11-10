/* =====================================================
   BeauStock - Dashboard
   All numbers, alerts and the chart come from the shared
   data (js/data.js) so they match every other page.
   ===================================================== */

// Show the dashboard only after demo login
if (sessionStorage.getItem("beauStockLoggedIn") !== "true") {
    window.location.replace("index.html");
}

const esc = BeauData.escapeHTML;
const products = BeauData.getProducts();
const movements = BeauData.getMovements();

// ----- Summary cards -----
const totalUnits = products.reduce((t, p) => t + (Number(p.quantity) || 0), 0);
const inventoryValue = products.reduce((t, p) => t + (Number(p.quantity) || 0) * (Number(p.cost) || 0), 0);
const lowCount = products.filter(p => BeauData.stockStatus(p) !== "healthy").length;

document.getElementById("totalProducts").textContent = products.length;
document.getElementById("totalUnits").textContent = totalUnits.toLocaleString("en-MY");
document.getElementById("inventoryValue").textContent = BeauData.formatRM(inventoryValue);
document.getElementById("lowStockCount").textContent = lowCount;

// ----- Stock alerts (low / out / near expiry) -----
const alertRows = [];

products.forEach(p => {
    const status = BeauData.stockStatus(p);
    if (status === "out") {
        alertRows.push(`<div class="alert-item"><span class="alert-dot critical-dot"></span>
            <div><strong>${esc(p.name)}</strong><p>No units remaining</p></div>
            <span class="alert-badge critical-badge">Out of stock</span></div>`);
    } else if (status === "low") {
        alertRows.push(`<div class="alert-item"><span class="alert-dot"></span>
            <div><strong>${esc(p.name)}</strong><p>Only ${p.quantity} unit(s) remaining</p></div>
            <span class="alert-badge">Low stock</span></div>`);
    }

    const days = BeauData.daysUntil(p.expiry);
    if (days !== null && days <= 90) {
        alertRows.push(`<div class="alert-item"><span class="alert-dot expiry-dot"></span>
            <div><strong>${esc(p.name)}</strong><p>${days < 0 ? "Already expired" : "Expires in " + days + " day(s)"}</p></div>
            <span class="alert-badge expiry-badge">${days < 0 ? "Expired" : "Near expiry"}</span></div>`);
    }
});

document.getElementById("dashAlerts").innerHTML = alertRows.length
    ? alertRows.slice(0, 5).join("")
    : `<p class="alert-list-empty">All good. Nothing needs attention.</p>`;

// ----- Recent stock activity (5 per page, Previous / Next) -----
const ACTIVITY_PAGE_SIZE = 5;
let activityPage = 1;

function renderActivity() {
    const info = BeauPager.slice(movements, activityPage, ACTIVITY_PAGE_SIZE);
    activityPage = info.page;

    document.getElementById("dashActivity").innerHTML = info.items.length
        ? info.items.map(m => {
            const isIn = m.type === "in";
            const when = new Date(m.date);
            const dateText = Number.isNaN(when.getTime()) ? "—" : when.toLocaleDateString("en-MY");
            return `<tr>
                <td>${esc(m.productName)}</td>
                <td>${esc(m.reason)}</td>
                <td>${isIn ? "+" : "−"}${Number(m.quantity)} units</td>
                <td>${esc(dateText)}</td>
                <td><span class="status-badge ${isIn ? "received" : "sold"}">${isIn ? "Stock In" : "Stock Out"}</span></td>
            </tr>`;
        }).join("")
        : `<tr><td colspan="5" class="text-center text-muted py-4">No stock movements yet.</td></tr>`;

    BeauPager.render(document.getElementById("activityPager"), info, function (page) {
        activityPage = page;
        renderActivity();
    });
}

renderActivity();

// ----- Category chart: units on hand per category -----
const unitsByCategory = {};
products.forEach(p => {
    const c = p.category || "Other";
    unitsByCategory[c] = (unitsByCategory[c] || 0) + (Number(p.quantity) || 0);
});

// Chart colours for the current theme
const isDark = document.documentElement.getAttribute("data-theme") === "dark";
Chart.defaults.color = isDark ? "#CFC5BA" : "#666666";
Chart.defaults.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
const chartCardBg = isDark ? "#27221E" : "#FFFFFF";

new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
        labels: Object.keys(unitsByCategory),
        datasets: [{
            data: Object.values(unitsByCategory),
            backgroundColor: ["#A99583", "#D8BFA8", "#665347", "#E8DED2", "#C9C2B9"],
            borderWidth: 3,
            borderColor: chartCardBg,
            hoverOffset: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 18, boxWidth: 8, font: { size: 11 } } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} units` } }
        }
    }
});

