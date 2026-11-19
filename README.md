# NOVA Online Shopping Website

## Project aim
To design an online shopping website using HTML, CSS, JavaScript and XML.

## Pages included
1. `index.html` – Home page with featured products.
2. `products.html` – Product catalogue with category filters and search.
3. `cart.html` – Shopping cart with quantity controls, remove option and total calculation.
4. `contact.html` – Contact form with client-side validation and demo confirmation.

## Required technologies
- **HTML:** Creates the website pages and forms.
- **CSS:** Styles the layout, navigation, product cards and responsive design.
- **JavaScript:** Loads XML product data, searches and filters products, manages the cart, calculates totals and handles the contact form.
- **XML:** `data/products.xml` stores product IDs, names, categories, prices, descriptions and symbols.

## How to run
1. Extract the ZIP file.
2. Open the project folder in Visual Studio Code.
3. Install or use the **Live Server** extension.
4. Right-click `index.html` and select **Open with Live Server**.
5. Browse the Home, Shop, Bag and Contact pages.

**Important:** Do not open `index.html` by double-clicking it. The browser may block JavaScript `fetch()` from reading the XML file when using the `file://` address. Use Live Server or another local web server.

## How to test
- Open Shop and use the category buttons and search field.
- Click the plus button on a product to add it to the bag.
- Open Bag to increase/decrease quantities or remove items.
- Check that the subtotal and total update.
- Place a sample order. This is a front-end demonstration only; it does not process real payments.
- Submit the Contact form to see the demo confirmation.

## Notes
- Cart contents are stored in the browser's `localStorage`.
- Product information is loaded from the XML file using JavaScript's `fetch()` and `DOMParser`.
- The checkout is simulated; there is no payment gateway or server-side order processing.
- This is a front-end academic project and does not require a database.
