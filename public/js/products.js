const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://glossier-website.vercel.app';

async function getProductsByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${category}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const products = await response.json();
        console.log(`Fetched products for category ${category}:`, products);
        return products;
    } catch (error) {
        console.error(`Error fetching products for category ${category}:`, error);
        const container = document.getElementById('product-grid');
        if (container) {
            container.innerHTML = '<p class="text-[#5C4033] text-center">Failed to load products. Please try again later.</p>';
        }
        return [];
    }
}

async function getAllProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched all products:', data);
        return data;
    } catch (error) {
        console.error('Error fetching all products:', error);
        const container = document.getElementById('product-list');
        if (container) {
            container.innerHTML = '<p class="text-[#5C4033] text-center">Failed to load products. Please try again later.</p>';
        }
        return [];
    }
}

async function renderProductGrid(category, containerId, products = null) {
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
    
    container.innerHTML = finalProducts.length === 0
        ? '<p class="text-[#5C4033] text-center">No products found in this category.</p>'
        : finalProducts.map(product => `
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
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }
    container.innerHTML = products.length === 0
        ? '<p class="text-[#5C4033] text-center">No products found.</p>'
        : products.map(product => `
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

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const category = path.split('/').pop().replace('.html', '');
    const validCategories = ['skincare', 'makeup', 'wigs', 'handbags', 'perfumes', 'lingeries'];

    if (validCategories.includes(category)) {
        console.log(`Rendering category page for: ${category}`);
        renderProductGrid(category, 'product-grid');
    } else if (category === 'products') {
        console.log('Rendering all products');
        renderProductList('product-list');
    }
});