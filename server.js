const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
    keyFile: 'glossier-service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const spreadsheetId = '1L6hYMNd6jyWfR5FGAC8hWmJ78B_4jLtXATwqInHzE4c';

async function initializeClient() {
    try {
        const client = await auth.getClient();
        console.log('Authentication successful');
        return client;
    } catch (error) {
        console.error('Authentication failed:', error);
        throw error;
    }
}

app.get('/api/products', async (req, res) => {
    try {
        const client = await initializeClient();
        const response = await sheets.spreadsheets.values.get({
            auth: client,
            spreadsheetId,
            range: 'Sheet1!A:G',
        });
        const rows = response.data.values || [];
        if (rows.length <= 1) {
            console.log('No product data found in the sheet.');
            return res.json([]);
        }
        const products = rows.slice(1).map(row => ({
            id: parseInt(row[0]) || Date.now(), // Fallback ID
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
    try {
        const client = await initializeClient();
        const category = sanitizeHtml(req.params.category);
        const response = await sheets.spreadsheets.values.get({
            auth: client,
            spreadsheetId,
            range: 'Sheet1!A:G',
        });
        const rows = response.data.values || [];
        const products = rows.slice(1).map(row => ({
            id: parseInt(row[0]) || Date.now(),
            name: row[1] || 'Unnamed',
            description: row[2] || '',
            price: parseInt(row[3]) || 0,
            image: row[4] || '',
            category: row[5] || 'uncategorized',
            inStock: row[6] === 'TRUE',
        })).filter(product => product.category.toLowerCase() === category.toLowerCase());
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const client = await initializeClient();
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
            inStock: sanitizeHtml(inStock) === 'true',
        };
        await sheets.spreadsheets.values.append({
            auth: client,
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
            inStock: sanitizeHtml(inStock) === 'true',
        };
        const response = await sheets.spreadsheets.values.get({
            auth: client,
            spreadsheetId,
            range: 'Sheet1!A:G',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
        if (rowIndex > 0) {
            await sheets.spreadsheets.values.update({
                auth: client,
                spreadsheetId,
                range: `Sheet1!A${rowIndex + 2}:G${rowIndex + 2}`,
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
        const id = parseInt(req.params.id);
        const response = await sheets.spreadsheets.values.get({
            auth: client,
            spreadsheetId,
            range: 'Sheet1!A:G',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
        if (rowIndex > 0) {
            await sheets.spreadsheets.values.clear({
                auth: client,
                spreadsheetId,
                range: `Sheet1!A${rowIndex + 2}:G${rowIndex + 2}`,
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});