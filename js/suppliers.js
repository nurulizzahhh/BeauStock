/* =====================================================
   BeauStock - Suppliers & Orders
   ===================================================== */

// Require demo login
if (sessionStorage.getItem("beauStockLoggedIn") !== "true") {
    window.location.replace("index.html");
}

const esc = BeauData.escapeHTML;
let orders = BeauData.getOrders();
const suppliers = BeauData.getSuppliers();

const orderModalEl = document.getElementById("orderModal");
const orderModal = bootstrap.Modal.getOrCreateInstance(orderModalEl);
const orderForm = document.getElementById("orderForm");
const orderMessage = document.getElementById("orderFormMessage");

// ----- Summary cards -----
function renderSummary() {
    const open = orders.filter(o => o.status !== "Delivered");
    const openValue = open.reduce((t, o) => t + Number(o.total), 0);
    document.getElementById("supCount").textContent = suppliers.length;
    document.getElementById("supOpen").textContent = open.length;
    document.getElementById("supOpenValue").textContent = BeauData.formatRM(openValue);
    document.getElementById("supDelivered").textContent =
        orders.filter(o => o.status === "Delivered").length;
}

// ----- Supplier cards (grid) -----
function renderSuppliers() {
    document.getElementById("supplierGrid").innerHTML = suppliers.map(s => `
        <article class="supplier-card">
            <div class="supplier-avatar">${esc(s.name.charAt(0))}</div>
            <h4>${esc(s.name)}</h4>
            <p class="supplier-category">${esc(s.category)}</p>
            <ul>
                <li>👤 ${esc(s.contact)}</li>
                <li>☎ ${esc(s.phone)}</li>
                <li>✉ ${esc(s.email)}</li>
            </ul>
        </article>`).join("");
}

// ----- Orders table -----
function renderOrders() {
    const search = document.getElementById("orderSearch").value.trim().toLowerCase();
    const status = document.getElementById("orderStatusFilter").value;

    const list = orders.filter(o => {
        const text = `${o.id} ${o.supplier} ${o.product}`.toLowerCase();
        return text.includes(search) && (status === "all" || o.status === status);
    });

    document.getElementById("orderTableBody").innerHTML = list.map(o => `
        <tr>
            <td><strong>${esc(o.id)}</strong></td>
            <td>${esc(o.supplier)}</td>
            <td>${esc(o.product)}</td>
            <td>${Number(o.quantity)}</td>
            <td>${BeauData.formatRM(o.total)}</td>
            <td>${esc(o.date)}</td>
            <td><span class="order-badge order-${esc(o.status.toLowerCase())}">${esc(o.status)}</span></td>
            <td>${o.status === "Delivered"
                ? "—"
                : `<button type="button" class="action-button" data-action="receive" data-id="${esc(o.id)}">Receive</button>`}
            </td>
        </tr>`).join("");

    document.getElementById("orderCount").textContent =
        `${list.length} order${list.length === 1 ? "" : "s"}`;
    document.getElementById("orderEmpty").hidden = list.length > 0;
    renderSummary();
}

// ----- Receive an order: add stock + log the movement -----
document.getElementById("orderTableBody").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action='receive']");
    if (!button) return;

    const order = orders.find(o => o.id === button.dataset.id);
    if (!order || order.status === "Delivered") return;

    const products = BeauData.getProducts();
    const product = products.find(p => p.id === order.productId || p.name === order.product);

    if (product) {
        product.quantity = (Number(product.quantity) || 0) + Number(order.quantity);
        BeauData.saveProducts(products);

        const movements = BeauData.getMovements();
        movements.unshift({
            id: "M" + Date.now(),
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: "in",
            quantity: Number(order.quantity),
            reason: "New delivery",
            date: new Date().toISOString()
        });
        BeauData.saveMovements(movements);
    }

    order.status = "Delivered";
    BeauData.saveOrders(orders);
    renderOrders();
});

// ----- New order form -----
const orderProduct = document.getElementById("orderProduct");
const orderQty = document.getElementById("orderQty");

BeauData.getProducts().forEach(p => {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = `${p.name} (${p.sku})`;
    orderProduct.appendChild(option);
});

function updateOrderPreview() {
    const product = BeauData.getProducts().find(p => p.id === orderProduct.value);
    document.getElementById("orderSupplier").value = product ? (product.supplier || "—") : "";
    const qty = Number(orderQty.value) || 0;
    document.getElementById("orderTotal").value =
        product && qty > 0 ? BeauData.formatRM(qty * Number(product.cost)) : "";
}
orderProduct.addEventListener("change", updateOrderPreview);
orderQty.addEventListener("input", updateOrderPreview);

orderForm.addEventListener("submit", function (event) {
    event.preventDefault();
    orderMessage.textContent = "";

    const product = BeauData.getProducts().find(p => p.id === orderProduct.value);
    const qty = Number(orderQty.value);

    if (!product || !Number.isInteger(qty) || qty < 1) {
        orderMessage.textContent = "Please choose a product and enter a whole-number quantity.";
        return;
    }

    const nextNumber = orders.reduce((max, o) =>
        Math.max(max, parseInt(String(o.id).replace(/\D/g, ""), 10) || 0), 1000) + 1;

    orders.unshift({
        id: "PO-" + nextNumber,
        supplier: product.supplier || "Unassigned",
        productId: product.id,
        product: product.name,
        quantity: qty,
        total: qty * Number(product.cost),
        date: new Date().toISOString().slice(0, 10),
        status: "Pending"
    });

    BeauData.saveOrders(orders);
    orderModal.hide();
    renderOrders();
});

orderModalEl.addEventListener("hidden.bs.modal", function () {
    orderForm.reset();
    orderMessage.textContent = "";
    updateOrderPreview();
});

document.getElementById("orderSearch").addEventListener("input", renderOrders);
document.getElementById("orderStatusFilter").addEventListener("change", renderOrders);

// Log out
document.getElementById("logoutButton").addEventListener("click", function () {
    sessionStorage.removeItem("beauStockLoggedIn");
    window.location.href = "index.html";
});

renderSuppliers();
renderOrders();
