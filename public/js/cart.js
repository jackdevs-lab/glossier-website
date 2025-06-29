class Cart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }
    
    loadCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }
    
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        this.saveCart();
    }
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
    }
    
    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(id);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }
    
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    updateCartCount() {
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            countElement.textContent = this.getItemCount();
        }
    }
    
    renderCart() {
        const cartItemsElement = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        
        if (!cartItemsElement || !cartTotalElement) return;
        
        if (this.items.length === 0) {
            cartItemsElement.innerHTML = '<p class="text-[#5C4033]">Your cart is empty</p>';
            cartTotalElement.textContent = 'KES 0';
            return;
        }
        
        cartItemsElement.innerHTML = this.items.map(item => `
            <div class="flex justify-between items-center mb-4 pb-4 border-b border-[#5C4033] border-opacity-20">
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain mr-4">
                    <div>
                        <h3 class="text-[#5C4033] font-medium">${item.name}</h3>
                        <p class="text-[#5C4033]">KES ${item.price}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <button class="quantity-btn decrease bg-[#5C4033] bg-opacity-10 text-[#5C4033] w-6 h-6 rounded-full flex items-center justify-center" data-id="${item.id}">-</button>
                    <span class="mx-2 text-[#5C4033]">${item.quantity}</span>
                    <button class="quantity-btn increase bg-[#5C4033] bg-opacity-10 text-[#5C4033] w-6 h-6 rounded-full flex items-center justify-center" data-id="${item.id}">+</button>
                    <button class="remove-btn ml-4 text-[#5C4033] hover:text-opacity-70" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        cartTotalElement.textContent = `KES ${this.getTotal()}`;
    }
    
    checkout() {
        if (this.items.length === 0) return;

        // Construct the WhatsApp message
        const phoneNumber = '+254797661210'; // Replace with your WhatsApp number
        const message = `Hello! I would like to place an order from Luné Seduire. Here are my cart details:\n\n` +
                       this.items.map(item => `${item.name} - Quantity: ${item.quantity} - Price: KES ${item.price * item.quantity}`).join('\n') +
                       `\n\nTotal: KES ${this.getTotal()}\nPlease confirm my order.`;
        
        // Encode the message and create WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        try {
            // Open WhatsApp in a new tab
            window.open(whatsappURL, '_blank');
        } catch (error) {
            console.error('Failed to open WhatsApp:', error);
            // Optionally, show a user-friendly message if WhatsApp fails
            alert('Unable to open WhatsApp. Please try again or contact support.');
        }
    }
}

// Initialize cart
const cart = new Cart();

// Event delegation for cart interactions
document.addEventListener('click', function(e) {
    // Add to cart buttons
    if (e.target.classList.contains('add-to-cart')) {
        const product = {
            id: parseInt(e.target.dataset.id),
            name: e.target.dataset.name,
            price: parseInt(e.target.dataset.price),
            image: e.target.closest('.product-card').querySelector('img').src
        };
        
        cart.addItem(product);
        
        // Show feedback
        const feedback = document.createElement('div');
        feedback.textContent = 'Added to cart!';
        feedback.className = 'fixed bottom-4 right-4 bg-[#5C4033] text-white px-4 py-2 rounded-full animate-fadeOut';
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }
    
    // Quantity buttons in cart
    if (e.target.classList.contains('quantity-btn')) {
        const id = parseInt(e.target.dataset.id);
        const isIncrease = e.target.classList.contains('increase');
        
        const item = cart.items.find(item => item.id === id);
        if (item) {
            const newQuantity = isIncrease ? item.quantity + 1 : item.quantity - 1;
            cart.updateQuantity(id, newQuantity);
            cart.renderCart();
        }
    }
    
    // Remove buttons in cart
    if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
        const btn = e.target.classList.contains('remove-btn') ? e.target : e.target.closest('.remove-btn');
        const id = parseInt(btn.dataset.id);
        cart.removeItem(id);
        cart.renderCart();
    }
    
    // Checkout button
    if (e.target.id === 'checkout-btn') {
        cart.checkout();
    }
});