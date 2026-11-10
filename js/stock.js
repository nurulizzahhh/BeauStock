
if (sessionStorage.getItem("beauStockLoggedIn") !== "true") {
    window.location.replace("index.html");
}

const stockTableBody = document.getElementById("stockTableBody");
const movementTableBody = document.getElementById("movementTableBody");
const stockForm = document.getElementById("stockForm");
const stockModalElement = document.getElementById("stockModal");
const stockModal = bootstrap.Modal.getOrCreateInstance(stockModalElement);

// Pagination: 5 rows per page in each table
const STOCK_PAGE_SIZE = 5;
let stockPage = 1;
let movementPage = 1;

// Data comes from the shared data layer (js/data.js)
const getProducts = () => BeauData.getProducts();
const saveProducts = (list) => BeauData.saveProducts(list);
const getMovements = () => BeauData.getMovements();
const saveMovements = (list) => BeauData.saveMovements(list);

function escapeStockHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function getStockStatus(product) {
    const quantity = Number(product.quantity) || 0;
    const reorderLevel = Number(product.reorderLevel) || 0;

    if (quantity <= 0) {
        return { label: "Out of Stock", className: "stock-out" };
    }

    if (quantity <= reorderLevel) {
        return { label: "Low Stock", className: "stock-low" };
    }

    return { label: "In Stock", className: "stock-healthy" };
}

function renderStockSummary(products) {
    document.getElementById("stockTotalProducts").textContent = products.length;

    const totalUnits = products.reduce(
        (total, product) => total + (Number(product.quantity) || 0), 0
    );

    const lowStock = products.filter(product => {
        const quantity = Number(product.quantity) || 0;
        const reorderLevel = Number(product.reorderLevel) || 0;
        return quantity > 0 && quantity <= reorderLevel;
    }).length;

    const outOfStock = products.filter(
        product => (Number(product.quantity) || 0) <= 0
    ).length;

    document.getElementById("stockTotalUnits").textContent = totalUnits;
    document.getElementById("stockLowCount").textContent = lowStock;
    document.getElementById("stockOutCount").textContent = outOfStock;
}

function renderStockTable() {
    const products = getProducts();
    const search = document.getElementById("stockSearch").value
        .trim().toLowerCase();
    const statusFilter = document.getElementById("stockStatusFilter").value;

    renderStockSummary(products);

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            String(product.name || "").toLowerCase().includes(search) ||
            String(product.sku || "").toLowerCase().includes(search);

        const status = getStockStatus(product);
        let matchesStatus = true;

        if (statusFilter === "healthy") {
            matchesStatus = status.className === "stock-healthy";
        } else if (statusFilter === "low") {
            matchesStatus = status.className === "stock-low";
        } else if (statusFilter === "out") {
            matchesStatus = status.className === "stock-out";
        }

        return matchesSearch && matchesStatus;
    });


    // ==============================================================================================================================
    // Current Stock Levels Table 
    // ==============================================================================================================================
    const pageInfo = BeauPager.slice(filteredProducts, stockPage, STOCK_PAGE_SIZE);
    stockPage = pageInfo.page;

    stockTableBody.innerHTML = pageInfo.items.map(product => {
        const status = getStockStatus(product);

        return `
            <tr>
                <td>
                    <div class="product-name-cell">
                        <strong>${escapeStockHTML(product.name)}</strong>
                        <small>${escapeStockHTML(product.category || "Uncategorised")}</small>
                    </div>
                </td>
                <td>${escapeStockHTML(product.sku)}</td>
                <td><strong>${Number(product.quantity) || 0}</strong></td>
                <td>${Number(product.reorderLevel) || 0}</td>
                <td>
                    <span class="stock-badge ${status.className}">
                        ${status.label}
                    </span>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("stockRecordCount").textContent =
        `${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"}`;

    document.getElementById("stockEmptyMessage").hidden =
        filteredProducts.length > 0;

    BeauPager.render(document.getElementById("stockPager"), pageInfo, function (page) {
        stockPage = page;
        renderStockTable();
    });
}

function populateProductOptions() {
    const select = document.getElementById("movementProduct");
    const products = getProducts();
    const previousValue = select.value;

    select.innerHTML = '<option value="">Select a product</option>';

    products.forEach(product => {
        const option = document.createElement("option");
        option.value = String(product.id);
        option.textContent = `${product.name} (${product.sku})`;
        select.appendChild(option);
    });

    if (products.some(product => String(product.id) === previousValue)) {
        select.value = previousValue;
    }

    document.getElementById("openStockModal").disabled = products.length === 0;
}

function renderMovementHistory() {
    const movements = getMovements();
    const filter = document.getElementById("movementFilter").value;

    const filteredMovements = movements.filter(movement =>
        filter === "all" || movement.type === filter
    );

    const pageInfo = BeauPager.slice(filteredMovements, movementPage, STOCK_PAGE_SIZE);
    movementPage = pageInfo.page;

    movementTableBody.innerHTML = pageInfo.items.map(movement => {
        const date = new Date(movement.date);
        const dateText = Number.isNaN(date.getTime())
            ? "Unknown date"
            : date.toLocaleString();

        const isStockIn = movement.type === "in";
        const movementLabel = isStockIn ? "Stock In" : "Stock Out";
        const movementClass = isStockIn ? "movement-in" : "movement-out";
        const sign = isStockIn ? "+" : "−";

        return `
            <tr>
                <td>${escapeStockHTML(dateText)}</td>
                <td>
                    <div class="product-name-cell">
                        <strong>${escapeStockHTML(movement.productName)}</strong>
                        <small>${escapeStockHTML(movement.sku)}</small>
                    </div>
                </td>
                <td><span class="movement-badge ${movementClass}">${movementLabel}</span></td>
                <td><strong>${sign}${Number(movement.quantity) || 0}</strong></td>
                <td>${escapeStockHTML(movement.reason)}</td>
            </tr>
        `;
    }).join("");

    document.getElementById("movementEmptyMessage").hidden =
        filteredMovements.length > 0;

    BeauPager.render(document.getElementById("movementPager"), pageInfo, function (page) {
        movementPage = page;
        renderMovementHistory();
    });
}

function renderStockPage() {
    populateProductOptions();
    renderStockTable();
    renderMovementHistory();
}

stockForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const type = document.getElementById("movementType").value;
    const productId = document.getElementById("movementProduct").value;
    const quantity = Number(document.getElementById("movementQuantity").value);
    const reason = document.getElementById("movementReason").value;
    const message = document.getElementById("stockFormMessage");

    message.textContent = "";

    if (!productId || !Number.isInteger(quantity) || quantity < 1 || !reason) {
        message.textContent = "Please complete all fields with valid information.";
        return;
    }

    const products = getProducts();
    const product = products.find(item => String(item.id) === productId);

    if (!product) {
        message.textContent = "Product not found. Please refresh and try again.";
        return;
    }

    const currentQuantity = Number(product.quantity) || 0;

    if (type === "out" && quantity > currentQuantity) {
        message.textContent =
            `Only ${currentQuantity} unit(s) are available. Please enter a smaller quantity.`;
        return;
    }

    product.quantity = type === "in"
        ? currentQuantity + quantity
        : currentQuantity - quantity;

    saveProducts(products);

    const movements = getMovements();

    movements.unshift({
        id: "M" + Date.now(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type,
        quantity,
        reason,
        date: new Date().toISOString()
    });

    saveMovements(movements);

    stockForm.reset();
    message.textContent = "";
    stockModal.hide();
    movementPage = 1;          // show the new movement at the top
    renderStockPage();
});

const stockStatusFilter = document.getElementById("stockStatusFilter");
const movementFilter = document.getElementById("movementFilter");

// A new search or filter always starts again from page 1
function applyStockFilters() {
    stockPage = 1;
    renderStockTable();
}

function applyMovementFilter() {
    movementPage = 1;
    renderMovementHistory();
}

document.getElementById("stockSearch").addEventListener("input", applyStockFilters);

// Searchable Select2 dropdowns (falls back to normal dropdowns if Select2 is missing)
BeauSelect.enhance(stockStatusFilter);
BeauSelect.enhance(movementFilter, { width: "200px" });
BeauSelect.onChange(stockStatusFilter, applyStockFilters);
BeauSelect.onChange(movementFilter, applyMovementFilter);


stockModalElement.addEventListener("hidden.bs.modal", function () {
    stockForm.reset();
    document.getElementById("stockFormMessage").textContent = "";
});

renderStockPage();
