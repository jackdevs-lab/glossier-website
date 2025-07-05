const { initializeClient } = require('../../utils/googleAuth');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://glossier-website.vercel.app' : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const id = parseInt(req.query.id || req.params.id);
    const spreadsheetId = process.env.SPREADSHEET_ID;

    try {
        const sheets = await initializeClient();

        if (req.method === 'PUT') {
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
            if (rowIndex > 0) {
                await sheets.spreadsheets.values.update({
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
        } else if (req.method === 'DELETE') {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Sheet1!A:G',
            });
            const rows = response.data.values || [];
            const rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
            if (rowIndex > 0) {
                await sheets.spreadsheets.values.clear({
                    spreadsheetId,
                    range: `Sheet1!A${rowIndex + 2}:G${rowIndex + 2}`,
                });
                console.log('Deleted product with id:', id);
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, error: 'Product not found' });
            }
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error(`Error processing request for product id ${id}:`, error);
        res.status(500).json({ success: false, error: 'Failed to process request', details: error.message });
    }
};