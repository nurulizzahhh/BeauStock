/* =====================================================
   BeauStock - Reports & Alerts
   Everything here is calculated from the shared data.
   ===================================================== */

// Require demo login
if (sessionStorage.getItem("beauStockLoggedIn") !== "true") {
    window.location.replace("index.html");
}

const esc = BeauData.escapeHTML;
const rm = BeauData.formatRM;
const products = BeauData.getProducts();

// Palette (nude / brown)
const PALETTE = ["#A99583", "#D8BFA8", "#665347", "#E8DED2", "#C9C2B9"];

// ----- Calculations -----
const costValue = products.reduce((t, p) => t + p.quantity * p.cost, 0);
const retailValue = products.reduce((t, p) => t + p.quantity * p.price, 0);

// Group by category
const categories = {};
products.forEach(p => {
    const c = p.category || "Other";
    categories[c] = categories[c] || { cost: 0, retail: 0 };
    categories[c].cost += p.quantity * p.cost;
    categories[c].retail += p.quantity * p.price;
});

// ----- Alerts -----
const alerts = { out: [], low: [], expiry: [] };
products.forEach(p => {
    const status = BeauData.stockStatus(p);
    if (status === "out") alerts.out.push(p);
    if (status === "low") alerts.low.push(p);

    const days = BeauData.daysUntil(p.expiry);
    if (days !== null && days <= 90) alerts.expiry.push({ product: p, days });
});
alerts.expiry.sort((a, b) => a.days - b.days);

const totalAlerts = alerts.out.length + alerts.low.length + alerts.expiry.length;

// ----- Summary cards -----
document.getElementById("repCost").textContent = rm(costValue);
document.getElementById("repRetail").textContent = rm(retailValue);
document.getElementById("repProfit").textContent = rm(retailValue - costValue);
document.getElementById("repAlerts").textContent = totalAlerts;
document.getElementById("alertCount").textContent =
    `${totalAlerts} alert${totalAlerts === 1 ? "" : "s"}`;

// ----- Alert list -----
function alertItem(name, text, badge, dotClass, badgeClass) {
    return `
        <div class="alert-item">
            <span class="alert-dot ${dotClass}"></span>
            <div><strong>${esc(name)}</strong><p>${esc(text)}</p></div>
            <span class="alert-badge ${badgeClass}">${esc(badge)}</span>
        </div>`;
}

let html = "";

html += `<p class="alert-group-title">OUT OF STOCK</p>`;
html += alerts.out.length
    ? alerts.out.map(p => alertItem(p.name, `${p.sku} · reorder level ${p.reorderLevel}`, "Out of stock", "critical-dot", "critical-badge")).join("")
    : `<p class="alert-list-empty">No products are out of stock.</p>`;

html += `<p class="alert-group-title">LOW STOCK</p>`;
html += alerts.low.length
    ? alerts.low.map(p => alertItem(p.name, `Only ${p.quantity} left (reorder at ${p.reorderLevel})`, "Low stock", "", "")).join("")
    : `<p class="alert-list-empty">No low-stock products.</p>`;

html += `<p class="alert-group-title">EXPIRY</p>`;
html += alerts.expiry.length
    ? alerts.expiry.map(({ product, days }) => {
        const text = days < 0
            ? `Expired ${Math.abs(days)} day(s) ago (${product.expiry})`
            : `Expires in ${days} day(s) (${product.expiry})`;
        return alertItem(product.name, text, days < 0 ? "Expired" : "Near expiry",
            days < 0 ? "critical-dot" : "expiry-dot",
            days < 0 ? "critical-badge" : "expiry-badge");
    }).join("")
    : `<p class="alert-list-empty">No products expiring within 90 days.</p>`;

document.getElementById("alertList").innerHTML = html;

// ----- Value table (top products by retail value) -----
const ranked = [...products]
    .map(p => ({ ...p, retail: p.quantity * p.price, cost: p.quantity * p.cost }))
    .sort((a, b) => b.retail - a.retail);

document.getElementById("valueTableBody").innerHTML = ranked.map(p => {
    const margin = p.retail > 0 ? Math.round(((p.retail - p.cost) / p.retail) * 100) : 0;
    return `
        <tr>
            <td class="product-name-cell">${esc(p.name)}</td>
            <td><span class="category-badge">${esc(p.category)}</span></td>
            <td>${p.quantity}</td>
            <td>${rm(p.cost)}</td>
            <td>${rm(p.retail)}</td>
            <td>${margin}%</td>
        </tr>`;
}).join("");

// ----- Charts (Chart.js) -----
// Chart colours for the current theme
const isDark = document.documentElement.getAttribute("data-theme") === "dark";
Chart.defaults.color = isDark ? "#CFC5BA" : "#666666";
Chart.defaults.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
const chartCardBg = isDark ? "#27221E" : "#FFFFFF";

const catNames = Object.keys(categories);

new Chart(document.getElementById("valueChart"), {
    type: "bar",
    data: {
        labels: catNames,
        datasets: [
            { label: "Cost value", data: catNames.map(c => categories[c].cost), backgroundColor: "#D8BFA8", borderRadius: 6 },
            { label: "Retail value", data: catNames.map(c => categories[c].retail), backgroundColor: isDark ? "#C9A98B" : "#665347", borderRadius: 6 }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 8, font: { size: 11 } } },
            tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${rm(ctx.parsed.y)}` } }
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { callback: v => "RM " + v } }
        }
    }
});

const healthy = products.length - alerts.low.length - alerts.out.length;

new Chart(document.getElementById("healthChart"), {
    type: "doughnut",
    data: {
        labels: ["In stock", "Low stock", "Out of stock"],
        datasets: [{
            data: [healthy, alerts.low.length, alerts.out.length],
            backgroundColor: ["#A99583", "#D8BFA8", "#A3483F"],
            borderWidth: 3,
            borderColor: chartCardBg,
            hoverOffset: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 8, font: { size: 11 } } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} product(s)` } }
        }
    }
});

// Log out
document.getElementById("logoutButton").addEventListener("click", function () {
    sessionStorage.removeItem("beauStockLoggedIn");
    window.location.href = "index.html";
});
