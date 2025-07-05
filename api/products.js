const { initializeClient } = require('../utils/googleAuth');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://glossier-website.vercel.app' : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (req.method === 'GET') {
        try {
            const sheets = await initializeClient();
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Sheet1!A:G',
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
            console.log('Fetched products:', products.length);
            res.json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch products', details: error.message });
        }
    } else if (req.method === 'POST') {
        try {
            const sheets = await initializeClient();
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
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};