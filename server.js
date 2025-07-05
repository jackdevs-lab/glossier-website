const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');
const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Google Sheets configuration
const spreadsheetId = '1L6hYMNd6jyWfR5FGAC8hWmJ78B_4jLtXATwqInHzE4c';
require('dotenv').config();

async function initializeClient() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString()),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        console.log('Authentication successful');
        return client;
    } catch (error) {
        console.error('Authentication failed:', error);
        throw error;
    }
}
console.log('Server starting...');
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
});

app.get('/api/products', async (req, res) => {
    try {
        const client = await initializeClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:G', // Confirm this matches your sheet name
        });
        const rows = response.data.values || [];
        if (rows.length <= 1) {
            console.log('No product data found in the sheet.');
            return res.json([]);
        }
        const products = rows.slice(1).map(row => ({
            id: parseInt(row[0]) || Date.now(),
            name: row[1] || 'Unnamed',
            description: row[2] || '',
            price: parseInt(row[3]) || 0,
            image: row[4] || '',
            category: row[5] || 'uncategorized',
            inStock: row[6] === 'TRUE',
        }));
        console.log('Fetched products:', products);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch products', details: error.message });
    }
});

app.get('/api/products/:category', async (req, res) => {
    console.log(`Handling request for /api/products/${req.params.category}`);
    try {
        const client = await initializeClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const category = sanitizeHtml(req.params.category);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:G', // Confirm this matches your sheet name
        });
        const rows = response.data.values || [];
        if (rows.length <= 1) {
            console.log('No product data found in the sheet.');
            return res.json([]);
        }
        const products = rows.slice(1).map(row => ({
            id: parseInt(row[0]) || Date.now(),
            name: row[1] || 'Unnamed',
            description: row[2] || '',
            price: parseInt(row[3]) || 0,
            image: row[4] || '',
            category: row[5] || 'uncategorized',
            inStock: row[6] === 'TRUE',
        })).filter(product => product.category.toLowerCase() === category.toLowerCase());
        console.log(`Filtered products for ${category}:`, products);
        res.json(products);
    } catch (error) {
        console.error('Error in /api/products/:category:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch products', details: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const client = await initializeClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const { name, description, price, image, category, inStock } = req.body;
        if (!name || !description || !price || !image || !category || inStock === undefined) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        const sanitizedProduct = {
            id: Date.now(),
            name: sanitizeHtml(name),
            description: sanitizeHtml(description),
            price: parseInt(sanitizeHtml(price.toString())),
            image: sanitizeHtml(image),
            category: sanitizeHtml(category),
            inStock: sanitizeHtml(inStock.toString()) === 'true',
        };
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:G',
            valueInputOption: 'RAW',
            resource: {
                values: [[
                    sanitizedProduct.id,
                    sanitizedProduct.name,
                    sanitizedProduct.description,
                    sanitizedProduct.price,
                    sanitizedProduct.image,
                    sanitizedProduct.category,
                    sanitizedProduct.inStock,
                ]],
            },
        });
        console.log('Created product:', sanitizedProduct);
        res.json({ success: true, product: sanitizedProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, error: 'Failed to create product', details: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const client = await initializeClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const id = parseInt(req.params.id);
        const { name, description, price, image, category, inStock } = req.body;
        if (!name || !description || !price || !image || !category || inStock === undefined) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        const sanitizedProduct = {
            name: sanitizeHtml(name),
            description: sanitizeHtml(description),
            price: parseInt(sanitizeHtml(price.toString())),
            image: sanitizeHtml(image),
            category: sanitizeHtml(category),
            inStock: sanitizeHtml(inStock.toString()) === 'true',
        };
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:G',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
        if (rowIndex > 0) { // Adjust for 0-based index after slicing
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `Sheet1!A${rowIndex + 2}:G${rowIndex + 2}`, // +2 because slice(1) skips header
                valueInputOption: 'RAW',
                resource: {
                    values: [[
                        id,
                        sanitizedProduct.name,
                        sanitizedProduct.description,
                        sanitizedProduct.price,
                        sanitizedProduct.image,
                        sanitizedProduct.category,
                        sanitizedProduct.inStock,
                    ]],
                },
            });
            console.log('Updated product:', { id, ...sanitizedProduct });
            res.json({ success: true, product: { id, ...sanitizedProduct } });
        } else {
            res.status(404).json({ success: false, error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: 'Failed to update product', details: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const client = await initializeClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const id = parseInt(req.params.id);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:G',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
        if (rowIndex > 0) {
            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: `Sheet1!A${rowIndex + 2}:G${rowIndex + 2}`, // +2 because slice(1) skips header
            });
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: 'Failed to delete product', details: error.message });
    }
});

// Adjusted catch-all to exclude API routes
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ success: false, error: 'API route not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;