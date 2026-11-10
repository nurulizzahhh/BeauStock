/* =====================================================
   BeauStock - Suppliers & Orders
   ===================================================== */

// Require demo login
if (sessionStorage.getItem("beauStockLoggedIn") !== "true") {
    window.location.replace("index.html");
}

const esc = BeauData.escapeHTML;
let orders = BeauData.getOrders();
let suppliers = BeauData.getSuppliers();

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
    const grid = document.getElementById("supplierGrid");

    // Nothing to show
    if (suppliers.length === 0) {
        grid.innerHTML = `<p class="empty-message">No suppliers yet. Click "+ Add Supplier" to add one.</p>`;
        return;
    }

    grid.innerHTML = suppliers.map(s => `
        <article class="supplier-card">
            <div class="supplier-avatar">${esc(s.name.charAt(0))}</div>
            <h4>${esc(s.name)}</h4>
            <p class="supplier-category">${esc(s.category)}</p>
            <ul>
                ${s.contact ? `<li>👤 ${esc(s.contact)}</li>` : ""}
                ${s.phone ? `<li>☎ ${esc(s.phone)}</li>` : ""}
                ${s.email ? `<li>✉ ${esc(s.email)}</li>` : ""}
            </ul>
            <div class="supplier-actions">
                <button type="button" class="action-button delete-button"
                        data-action="delete-supplier" data-id="${esc(s.id)}">Remove</button>
            </div>
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

// ----- Add supplier -----
const supplierModalEl = document.getElementById("supplierModal");
const supplierModal = bootstrap.Modal.getOrCreateInstance(supplierModalEl);
const supplierForm = document.getElementById("supplierForm");
const supplierFormMessage = document.getElementById("supplierFormMessage");
const supplierMessage = document.getElementById("supplierMessage");

supplierForm.addEventListener("submit", function (event) {
    event.preventDefault();
    supplierFormMessage.textContent = "";

    const name = document.getElementById("supplierName").value.trim();
    const category = document.getElementById("supplierCategory").value.trim();
    const contact = document.getElementById("supplierContact").value.trim();
    const phone = document.getElementById("supplierPhone").value.trim();
    const email = document.getElementById("supplierEmail").value.trim();

    if (!name) {
        supplierFormMessage.textContent = "Please enter the supplier name.";
        return;
    }

    // Names must be unique, because products are linked to suppliers by name
    const duplicate = suppliers.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
        supplierFormMessage.textContent = "A supplier with this name already exists.";
        return;
    }

    suppliers.push({ id: "S" + Date.now(), name, contact, phone, email, category });
    BeauData.saveSuppliers(suppliers);

    supplierMessage.textContent = "";
    supplierModal.hide();
    renderSuppliers();
    renderSummary();
});

// Clear the form every time the pop-up closes
supplierModalEl.addEventListener("hidden.bs.modal", function () {
    supplierForm.reset();
    supplierFormMessage.textContent = "";
});

// ----- Remove supplier -----
document.getElementById("supplierGrid").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action='delete-supplier']");
    if (!button) return;

    const supplier = suppliers.find(s => s.id === button.dataset.id);
    if (!supplier) return;

    supplierMessage.textContent = "";

    // Don't remove a supplier that products still use
    const inUse = BeauData.getProducts().filter(p => p.supplier === supplier.name).length;
    if (inUse > 0) {
        supplierMessage.textContent =
            `"${supplier.name}" is still the supplier for ${inUse} product(s). Change those products to another supplier first, then remove it.`;
        return;
    }

    if (!window.confirm(`Remove supplier "${supplier.name}"?`)) return;

    suppliers = suppliers.filter(s => s.id !== supplier.id);
    BeauData.saveSuppliers(suppliers);
    renderSuppliers();
    renderSummary();
});

renderSuppliers();
renderOrders();
