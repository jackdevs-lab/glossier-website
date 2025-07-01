// /js/products.js
// /js/products.js
const API_BASE_URL = 'https://glossier-website.vercel.app'; // Replace with your actual Vercel URL
async function getProductsByCategory(category) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${category}`);
        const products = await response.json();
        console.log(`Fetched products for category ${category}:`, products);
        return products;
    } catch (error) {
        console.error(`Error fetching products for category ${category}:`, error);
        return [];
    }
}

async function getAllProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching all products:', error);
        return [];
    }
}

async function renderProductGrid(category, containerId, products = null) {
    // Use the provided products array if available, otherwise fetch new data
    const finalProducts = products || await getProductsByCategory(category);
    const container = document.getElementById(containerId);
    const productCount = document.getElementById('product-count');
    
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }
    
    if (productCount) {
        productCount.textContent = `${finalProducts.length} products`;
    }
    
    container.innerHTML = finalProducts.map(product => `
        <div class="product-card bg-white rounded-lg p-4 shadow-sm transition transform hover:scale-[1.02]">
            <img src="${product.image}" alt="${product.name}" class="w-full max-h-48 object-contain mb-4">
            <h3 class="text-[#5C4033] font-bold mb-2">${product.name}</h3>
            <p class="text-[#5C4033] mb-2">${product.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-[#5C4033]">KES ${product.price}</span>
                <a href="/product-detail.html?id=${product.id}" class="bg-[#5C4033] text-white px-3 py-1 rounded-full text-sm hover:bg-opacity-90">View</a>
            </div>
        </div>
    `).join('');
}

async function renderProductList(containerId) {
    const products = await getAllProducts();
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-lg p-4 shadow-sm transition transform hover:scale-[1.02]">
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-contain mb-4">
            <h3 class="text-[#5C4033] font-bold mb-2">${product.name}</h3>
            <p class="text-[#5C4033] mb-2">${product.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-[#5C4033]">KES ${product.price}</span>
                <a href="/product-detail.html?id=${product.id}" class="bg-[#5C4033] text-white px-3 py-1 rounded-full text-sm hover:bg-opacity-90">View</a>
            </div>
        </div>
    `).join('');
}