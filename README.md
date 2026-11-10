# BeauStock – Beauty Inventory Management

**Course:** IMS566 Advanced Web Design Development and Content Management (UiTM)

BeauStock is a front-end web application prototype for managing a small beauty shop's inventory: products, stock levels, suppliers, purchase orders and reports. It uses a nude / white / brown design with a light and dark mode. No database is needed: data is stored in the browser (localStorage).

## Live Demo
- Live site: `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`
- Repository: `https://github.com/YOUR-USERNAME/YOUR-REPOSITORY`

## How to Test the Login
The demo credentials are already filled in on the login page, so just click **Sign In**.

| Field | Value |
|---|---|
| Username | `izzah` |
| Password | `izzahcomel` |

- A wrong username or password shows an error message.
- Use the eye button to show or hide the password.
- Use **Log out** in the sidebar to end the session. Pages cannot be opened without logging in.

## Features
- **Login page**: hardcoded demo credentials, error feedback, show/hide password
- **Fixed layout**: the sidebar and a top bar (page title, dark mode button, admin profile) stay on screen while only the content scrolls
- **Responsive navigation**: on mobile the sidebar is hidden and slides in when the ☰ button is tapped
- **Dark mode**: toggle in the top bar next to the admin profile, choice is remembered
- **Dashboard**: summary cards, stock-by-category doughnut chart, live stock alerts, recent stock activity
- **Product Management**: paged table with search, searchable category and stock filters (Select2); add, edit and delete; supplier chosen from the supplier list
- **Stock Management**: paged stock levels table, record Stock In / Stock Out, paged movement history with searchable filters
- **Suppliers & Orders**: paged supplier cards, add and remove suppliers (all fields required and validated), paged purchase order table with search and filter, create orders, "Receive" adds stock automatically
- **Reports & Alerts**: stock value chart (cost vs retail), stock health chart, low / out of stock / expiry alerts, paged most valuable stock table
- **Pagination**: Previous / Next buttons on every long list
- **Shared data layer** (`js/data.js`) so every page shows matching numbers
- Footer, page titles, meta tags and code comments on every page

## Frameworks / Libraries
- Bootstrap 5.3 (layout, modals, tables, forms)
- Chart.js (interactive charts with hover tooltips)
- jQuery and Select2 (searchable dropdown filters)
- Vanilla JavaScript, HTML5, CSS3

## Project Structure
```
BeauStock/
├── index.html        Login
├── dashboard.html    Dashboard
├── products.html     Product Management
├── stock.html        Stock Management
├── suppliers.html    Suppliers & Orders
├── reports.html      Reports & Alerts
├── README.md
├── images/           Logo, favicon and plaid background tile
├── css/
│   └── style.css     All styles (including dark mode)
└── js/
    ├── data.js       Shared data (localStorage)
    ├── theme.js      Light / dark mode
    ├── menu.js       Log out + mobile ☰ menu
    ├── pager.js      Previous / Next pagination
    ├── select-filters.js  Select2 helper
    ├── auth.js       Login
    ├── app.js        Dashboard
    ├── products.js   Products
    ├── stock.js      Stock
    ├── suppliers.js  Suppliers & orders
    └── reports.js    Reports
```

## Notes
- Data is saved per browser. To reset the demo data, open Chrome DevTools (F12) → Application → Local Storage → Clear.
- Best viewed in Google Chrome.
