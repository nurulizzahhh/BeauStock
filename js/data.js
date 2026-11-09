/* =====================================================
   BeauStock - Shared data layer
   Every page reads/writes through BeauData so the numbers
   on the dashboard, products, stock, suppliers and reports
   pages always match. Data is saved in the browser
   (localStorage) - no database needed.
   ===================================================== */

const BeauData = (function () {

    const KEYS = {
        products: "beauStockProducts",
        movements: "beauStockMovements",
        suppliers: "beauStockSuppliers",
        orders: "beauStockOrders"
    };

    // ---------- Starter (demo) data ----------
    const starterProducts = [
        { id: "P001", name: "Rose Glow Serum",       sku: "SK001", category: "Skincare", supplier: "Glow Beauty Supplies", cost: 18, price: 32, quantity: 3,  reorderLevel: 5, expiry: "2027-06-30" },
        { id: "P002", name: "Daily Moisturiser",     sku: "SK002", category: "Skincare", supplier: "Pure Skin Trading",    cost: 15, price: 28, quantity: 24, reorderLevel: 5, expiry: "2026-12-15" },
        { id: "P003", name: "Velvet Lip Tint",       sku: "MK001", category: "Makeup",   supplier: "Colour House",         cost: 8,  price: 18, quantity: 4,  reorderLevel: 5, expiry: "2027-09-30" },
        { id: "P004", name: "Soft Matte Foundation", sku: "MK002", category: "Makeup",   supplier: "Colour House",         cost: 22, price: 39, quantity: 18, reorderLevel: 5, expiry: "2027-03-31" },
        { id: "P005", name: "Repair Hair Mask",      sku: "HC001", category: "Haircare", supplier: "Silky Hair Trading",   cost: 12, price: 24, quantity: 12, reorderLevel: 4, expiry: "2027-11-30" },
        { id: "P006", name: "Vanilla Body Lotion",   sku: "BC001", category: "Bodycare", supplier: "Glow Beauty Supplies", cost: 10, price: 21, quantity: 0,  reorderLevel: 5, expiry: "2027-08-31" },
        { id: "P007", name: "Gentle Foaming Cleanser", sku: "SK003", category: "Skincare", supplier: "Pure Skin Trading",  cost: 9,  price: 19, quantity: 30, reorderLevel: 8, expiry: "2027-05-20" },
        { id: "P008", name: "Nude Eyeshadow Palette", sku: "MK003", category: "Makeup",  supplier: "Colour House",         cost: 25, price: 45, quantity: 9,  reorderLevel: 4, expiry: "2028-01-10" }
    ];

    const starterSuppliers = [
        { id: "S001", name: "Glow Beauty Supplies", contact: "Aisyah Rahman", phone: "012-345 6789", email: "orders@glowbeauty.my",   category: "Skincare / Bodycare" },
        { id: "S002", name: "Pure Skin Trading",    contact: "Daniel Lim",    phone: "013-222 4455", email: "sales@pureskin.my",      category: "Skincare" },
        { id: "S003", name: "Colour House",         contact: "Nurul Huda",    phone: "011-8899 2233", email: "hello@colourhouse.my",  category: "Makeup" },
        { id: "S004", name: "Silky Hair Trading",   contact: "Priya Nair",    phone: "016-777 1212", email: "care@silkyhair.my",      category: "Haircare" }
    ];

    const starterOrders = [
        { id: "PO-1001", supplier: "Glow Beauty Supplies", product: "Rose Glow Serum",     quantity: 40, total: 720, date: "2026-10-02", status: "Delivered" },
        { id: "PO-1002", supplier: "Colour House",         product: "Velvet Lip Tint",     quantity: 60, total: 480, date: "2026-10-12", status: "Shipped" },
        { id: "PO-1003", supplier: "Glow Beauty Supplies", product: "Vanilla Body Lotion", quantity: 50, total: 500, date: "2026-10-20", status: "Pending" },
        { id: "PO-1004", supplier: "Pure Skin Trading",    product: "Daily Moisturiser",   quantity: 30, total: 450, date: "2026-10-25", status: "Pending" }
    ];

    // A few past movements so the dashboard is never empty on first visit
    const starterMovements = [
        { id: "M1003", productId: "P001", productName: "Rose Glow Serum",   sku: "SK001", type: "in",  quantity: 20, reason: "New delivery",     date: "2026-10-26T10:15:00" },
        { id: "M1002", productId: "P003", productName: "Velvet Lip Tint",   sku: "MK001", type: "out", quantity: 5,  reason: "Customer sale",    date: "2026-10-27T14:30:00" },
        { id: "M1001", productId: "P002", productName: "Daily Moisturiser", sku: "SK002", type: "out", quantity: 2,  reason: "Stock correction", date: "2026-10-28T09:05:00" }
    ].sort((a, b) => b.date.localeCompare(a.date));

    // ---------- Generic helpers ----------
    function read(key, starter) {
        try {
            const saved = localStorage.getItem(key);
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (error) {
            console.error("Could not read " + key, error);
        }
        // First visit (or broken data): seed with starter data
        const fresh = starter.map(item => ({ ...item }));
        write(key, fresh);
        return fresh;
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Could not save " + key, error);
        }
    }

    // ---------- Public API ----------
    return {
        getProducts:   () => read(KEYS.products, starterProducts),
        saveProducts:  (list) => write(KEYS.products, list),
        getMovements:  () => read(KEYS.movements, starterMovements),
        saveMovements: (list) => write(KEYS.movements, list),
        getSuppliers:  () => read(KEYS.suppliers, starterSuppliers),
        saveSuppliers: (list) => write(KEYS.suppliers, list),
        getOrders:     () => read(KEYS.orders, starterOrders),
        saveOrders:    (list) => write(KEYS.orders, list),

        // Prevent text being read as HTML
        escapeHTML(value) {
            return String(value ?? "").replace(/[&<>"']/g, c => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
            })[c]);
        },

        // Malaysian Ringgit
        formatRM(amount) {
            return "RM " + Number(amount || 0).toLocaleString("en-MY", {
                minimumFractionDigits: 2, maximumFractionDigits: 2
            });
        },

        // Stock status used by every page
        stockStatus(product) {
            const qty = Number(product.quantity) || 0;
            const reorder = Number(product.reorderLevel) || 0;
            if (qty <= 0) return "out";
            if (qty <= reorder) return "low";
            return "healthy";
        },

        // Whole days from today until a date (negative = already expired)
        daysUntil(dateString) {
            if (!dateString) return null;
            const target = new Date(dateString + "T00:00:00");
            if (Number.isNaN(target.getTime())) return null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return Math.round((target - today) / 86400000);
        }
    };
})();
