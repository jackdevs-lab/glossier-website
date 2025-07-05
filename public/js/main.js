document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded at', new Date().toISOString());

    // DOM Elements
    const cartIcon = document.getElementById('cart-icon');
    const closeCart = document.getElementById('close-cart');
    const cartModal = document.getElementById('cart-modal');
    const navTrigger = document.getElementById('nav-trigger');
    const closeNav = document.getElementById('close-nav');
    const navModal = document.getElementById('nav-modal');

    // Toggle Cart Modal
    function toggleCartModal() {
        if (!cartModal) {
            console.error('Cart modal not found');
            return;
        }
        console.log('Toggling cart modal');
        if (cartModal.classList.contains('hidden')) {
            cartModal.classList.remove('hidden');
            cartModal.querySelector('.transform').classList.remove('translate-x-full');
            if (typeof cart !== 'undefined' && typeof cart.renderCart === 'function') {
                console.log('Rendering cart');
                cart.renderCart();
            } else {
                console.error('Cart object or renderCart method not defined');
            }
        } else {
            cartModal.classList.add('hidden');
            cartModal.querySelector('.transform').classList.add('translate-x-full');
        }
    }

    // Toggle Navigation Modal
    function toggleNavModal() {
        if (!navModal) {
            console.error('Nav modal not found');
            return;
        }
        console.log('Toggling nav modal');
        if (navModal.classList.contains('hidden')) {
            navModal.classList.remove('hidden');
            navModal.querySelector('.transform').classList.remove('-translate-x-full');
        } else {
            navModal.classList.add('hidden');
            navModal.querySelector('.transform').classList.add('-translate-x-full');
        }
    }

    // Attach Event Listeners
    if (cartIcon) {
        console.log('Cart icon found');
        cartIcon.addEventListener('click', () => {
            console.log('Cart button clicked - debugging click event');
            toggleCartModal();
        });
    } else {
        console.error('Cart icon (#cart-icon) not found');
    }

    if (closeCart) {
        console.log('Close cart button found');
        closeCart.addEventListener('click', () => {
            console.log('Close cart button clicked');
            toggleCartModal();
        });
    } else {
        console.error('Close cart button (#close-cart) not found');
    }

    if (cartModal) {
        console.log('Cart modal found');
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                console.log('Cart modal background clicked');
                toggleCartModal();
            }
        });
    } else {
        console.error('Cart modal (#cart-modal) not found');
    }

    if (navTrigger) {
        console.log('Nav trigger found');
        navTrigger.addEventListener('click', () => {
            console.log('Nav trigger clicked - debugging click event');
            toggleNavModal();
        });
    } else {
        console.error('Nav trigger (#nav-trigger) not found');
    }

    if (closeNav) {
        console.log('Close nav button found');
        closeNav.addEventListener('click', () => {
            console.log('Close nav button clicked');
            toggleNavModal();
        });
    } else {
        console.error('Close nav button (#close-nav) not found');
    }

    if (navModal) {
        console.log('Nav modal found');
        navModal.addEventListener('click', (e) => {
            if (e.target === navModal) {
                console.log('Nav modal background clicked');
                toggleNavModal();
            }
        });
    } else {
        console.error('Nav modal (#nav-modal) not found');
    }
});