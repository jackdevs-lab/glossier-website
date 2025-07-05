const { initializeClient } = require('../../utils/googleAuth');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://glossier-website.vercel.app' : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const category = sanitizeHtml(req.params.category || req.query.category || '');
            console.log('Handling category:', category);
            console.log('Request path:', req.path, 'Params:', req.params);
            if (!category) {
                return res.status(400).json({ success: false, error: 'Category is required' });
            }
            const sheets = await initializeClient();
            const spreadsheetId = process.env.SPREADSHEET_ID;
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Sheet1!A:G',
            });
            const rows = response.data.values || [];
            const products = rows.slice(1)
                .map(row => ({
                    id: parseInt(row[0]) || Date.now(),
                    name: row[1] || 'Unnamed',
                    description: row[2] || '',
                    price: parseInt(row[3]) || 0,
                    image: row[4] || '',
                    category: row[5] || 'uncategorized',
                    inStock: row[6] === 'TRUE',
                }))
                .filter(product => product.category.toLowerCase() === category.toLowerCase());
            console.log(`Fetched ${products.length} products for category: ${category}`);
            res.json(products);
        } catch (error) {
            console.error(`Error fetching products for category ${req.params.category}:`, error);
            res.status(500).json({ success: false, error: 'Failed to fetch products', details: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};