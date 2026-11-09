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
- **Responsive sidebar navigation** on every page (becomes a scrolling menu on mobile, with Log out kept visible)
- **Dark mode**: toggle in the sidebar, choice is remembered
- **Dashboard**: summary cards, stock-by-category doughnut chart, live stock alerts, recent stock activity
- **Product Management**: table with search, category and stock filters; add, edit and delete; supplier chosen from the supplier list
- **Stock Management**: stock levels table, record Stock In / Stock Out, movement history with filter
- **Suppliers & Orders**: supplier card grid, purchase order table with search and filter, create orders, "Receive" adds stock automatically
- **Reports & Alerts**: stock value chart (cost vs retail), stock health chart, low / out of stock / expiry alerts, most valuable stock table
- **Shared data layer** (`js/data.js`) so every page shows matching numbers
- Footer, page titles, meta tags and code comments on every page

## Frameworks / Libraries
- Bootstrap 5.3 (layout, modals, tables, forms)
- Chart.js (interactive charts with hover tooltips)
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
