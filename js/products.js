
/* =================================
   BeauStock - Product Management
   ================================= */

// Require demo login
if (sessionStorage.getItem("beauStockLoggedIn") !== "true") {
    window.location.replace("index.html");
}

// Products come from the shared data layer (js/data.js)
let products = BeauData.getProducts();

// Pagination: 5 products per page
const PRODUCTS_PAGE_SIZE = 5;
let productPage = 1;

const productTableBody = document.getElementById("productTableBody");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const stockFilter = document.getElementById("stockFilter");
const productForm = document.getElementById("productForm");
const productModalElement = document.getElementById("productModal");
const productModal = bootstrap.Modal.getOrCreateInstance(productModalElement);
const formMessage = document.getElementById("formMessage");

const fields = {
    id: document.getElementById("editProductId"),
    name: document.getElementById("productName"),
    sku: document.getElementById("productSku"),
    category: document.getElementById("productCategory"),
    supplier: document.getElementById("productSupplier"),
    cost: document.getElementById("productCost"),
    price: document.getElementById("productPrice"),
    quantity: document.getElementById("productQuantity"),
    reorderLevel: document.getElementById("productReorder"),
    expiry: document.getElementById("productExpiry")
};

// Fill the supplier dropdown from the suppliers list in data.js
BeauData.getSuppliers().forEach(function (supplier) {
    const option = document.createElement("option");
    option.value = supplier.name;
    option.textContent = supplier.name;
    fields.supplier.appendChild(option);
});

// Save product changes in this browser
function saveProducts() {
    BeauData.saveProducts(products);
}

// Prevent product text from being interpreted as HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Format Malaysian Ringgit
function formatRM(amount) {
    return "RM " + Number(amount).toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Determine current stock status
function getStockStatus(product) {
    if (product.quantity === 0) {
        return { label: "Out of Stock", className: "stock-out" };
    }

    if (product.quantity <= product.reorderLevel) {
        return { label: "Low Stock", className: "stock-low" };
    }

    return { label: "In Stock", className: "stock-in" };
}

// Update summary cards
function updateSummary() {
    const totalUnits = products.reduce(
        (total, product) => total + product.quantity, 0
    );

    const lowStock = products.filter(
        product => product.quantity <= product.reorderLevel
    ).length;

    const categories = new Set(
        products.map(product => product.category)
    );

    document.getElementById("productCount").textContent = products.length;
    document.getElementById("unitCount").textContent = totalUnits;
    document.getElementById("lowStockCount").textContent = lowStock;
    document.getElementById("categoryCount").textContent = categories.size;
}

// Display filtered products
function renderProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStock = stockFilter.value;

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm);

        const matchesCategory =
            !selectedCategory || product.category === selectedCategory;

        let matchesStock = true;

        if (selectedStock === "low") {
            matchesStock =
                product.quantity > 0 &&
                product.quantity <= product.reorderLevel;
        } else if (selectedStock === "available") {
            matchesStock = product.quantity > product.reorderLevel;
        } else if (selectedStock === "out") {
            matchesStock = product.quantity === 0;
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    // Only the products for the current page
    const pageInfo = BeauPager.slice(filteredProducts, productPage, PRODUCTS_PAGE_SIZE);
    productPage = pageInfo.page;

    productTableBody.innerHTML = pageInfo.items.map(product => {
        const status = getStockStatus(product);

        return `
            <tr>
                <td class="product-name-cell">
                    ${escapeHTML(product.name)}
                </td>

                <td class="product-sku">
                    ${escapeHTML(product.sku)}
                </td>

                <td>
                    <span class="category-badge">
                        ${escapeHTML(product.category)}
                    </span>
                </td>

                <td>${formatRM(product.price)}</td>

                <td>${product.quantity}</td>

                <td>${product.expiry || "—"}</td>

                <td>
                    <span class="stock-badge ${status.className}">
                        ${status.label}
                    </span>
                </td>

                <td>
                    <div class="action-buttons">
                        <button type="button"
                                class="action-button"
                                data-action="edit"
                                data-id="${escapeHTML(product.id)}">
                            Edit
                        </button>

                        <button type="button"
                                class="action-button delete-button"
                                data-action="delete"
                                data-id="${escapeHTML(product.id)}">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("emptyMessage").hidden =
        filteredProducts.length !== 0;

    BeauPager.render(document.getElementById("productPager"), pageInfo, function (page) {
        productPage = page;
        renderProducts();
    });

    updateSummary();
}

// Reset the form for a new product
function resetProductForm() {
    productForm.reset();
    fields.id.value = "";
    fields.reorderLevel.value = 5;
    formMessage.textContent = "";
    document.getElementById("productModalTitle").textContent =
        "Add New Product";
}

// Open the modal for a new product
document.getElementById("addProductButton").addEventListener("click", () => {
    resetProductForm();
});

// Save a new product or update an existing one
productForm.addEventListener("submit", function (event) {
    event.preventDefault();
    formMessage.textContent = "";

    const id = fields.id.value;

    const product = {
        id: id || "P" + Date.now(),
        name: fields.name.value.trim(),
        sku: fields.sku.value.trim(),
        category: fields.category.value,
        supplier: fields.supplier.value.trim(),
        cost: Number(fields.cost.value),
        price: Number(fields.price.value),
        quantity: Number(fields.quantity.value),
        reorderLevel: Number(fields.reorderLevel.value),
        expiry: fields.expiry.value
    };

    // Validate prices and stock quantities
    if (
        product.cost < 0 ||
        product.price < 0 ||
        product.quantity < 0 ||
        product.reorderLevel < 0 ||
        !Number.isInteger(product.quantity) ||
        !Number.isInteger(product.reorderLevel)
    ) {
        formMessage.textContent =
            "Enter valid prices and whole-number stock quantities.";
        return;
    }

    // SKU must be unique
    const duplicateSku = products.some(existing =>
        existing.sku.toLowerCase() === product.sku.toLowerCase() &&
        existing.id !== id
    );

    if (duplicateSku) {
        formMessage.textContent =
            "This SKU already exists. Please use a different product code.";
        return;
    }

    // Update or add
    if (id) {
        products = products.map(existing =>
            existing.id === id ? product : existing
        );
    } else {
        products.push(product);
    }

    saveProducts();
    renderProducts();
    productModal.hide();
    resetProductForm();
});

// Handle Edit and Delete buttons
productTableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;
    const product = products.find(item => item.id === id);

    if (!product) return;

    if (action === "edit") {
        fields.id.value = product.id;
        fields.name.value = product.name;
        fields.sku.value = product.sku;
        fields.category.value = product.category;
        fields.supplier.value = product.supplier;
        fields.cost.value = product.cost;
        fields.price.value = product.price;
        fields.quantity.value = product.quantity;
        fields.reorderLevel.value = product.reorderLevel;
        fields.expiry.value = product.expiry || "";

        formMessage.textContent = "";
        document.getElementById("productModalTitle").textContent =
            "Edit Product";

        productModal.show();
    }

    if (action === "delete") {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (confirmed) {
            products = products.filter(item => item.id !== id);
            saveProducts();
            renderProducts();
        }
    }
});

// Search and filter events
// A new search or filter always starts again from page 1
function applyFilters() {
    productPage = 1;
    renderProducts();
}

searchInput.addEventListener("input", applyFilters);

// Searchable Select2 dropdowns (falls back to normal dropdowns if Select2 is missing)
BeauSelect.enhance(categoryFilter);
BeauSelect.enhance(stockFilter);
BeauSelect.onChange(categoryFilter, applyFilters);
BeauSelect.onChange(stockFilter, applyFilters);


// Clear form messages when the modal closes
productModalElement.addEventListener("hidden.bs.modal", resetProductForm);

// Initial page display
renderProducts();
