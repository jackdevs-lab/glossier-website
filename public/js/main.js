// /js/main.js
// DOM Elements
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const navTrigger = document.getElementById('nav-trigger');
const navPanel = document.getElementById('nav-panel');
const closeNav = document.getElementById('close-nav');
const navItems = document.getElementById('nav-items');
const navSentence = document.getElementById('nav-sentence');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenu = document.getElementById('mobile-menu');

// Toggle cart modal
function toggleCartModal() {
    const isOpen = cartModal.getAttribute('data-open') === 'true';
    console.log('Toggling cart modal, isOpen:', isOpen);
    if (isOpen) {
        cartModal.setAttribute('data-open', 'false');
        cartModal.classList.add('hidden');
    } else {
        cartModal.setAttribute('data-open', 'true');
        cartModal.classList.remove('hidden');
        cart.renderCart();
    }
}

// Toggle navigation panel and mobile menu
function toggleNavPanel() {
    const isOpen = navPanel.getAttribute('data-open') === 'true';
    console.log('Toggling nav panel, isOpen:', isOpen);
    if (isOpen) {
        navPanel.setAttribute('data-open', 'false');
        navPanel.classList.add('hidden');
        // Revert to list view when closing
        navItems.classList.remove('hidden');
        navSentence.classList.add('hidden');
        // Hide mobile menu on mobile
        if (window.innerWidth < 768 && mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    } else {
        navPanel.setAttribute('data-open', 'true');
        navPanel.classList.remove('hidden');
        // Show list view initially
        navItems.classList.remove('hidden');
        navSentence.classList.add('hidden');
        // Show mobile menu on mobile
        if (window.innerWidth < 768 && mobileMenu) {
            mobileMenu.classList.remove('hidden');
        }
    }
}

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('i');
        const isActive = answer.classList.contains('active');

        // Close all other answers
        document.querySelectorAll('.faq-answer').forEach(ans => {
            ans.classList.remove('active');
        });
        document.querySelectorAll('.faq-question i').forEach(ic => {
            ic.classList.remove('active');
        });

        // Toggle the clicked answer
        if (!isActive) {
            answer.classList.add('active');
            icon.classList.add('active');
        }
    });
});

// Convert list to sentence on link click (optional feature, not triggered by default)
function updateSentenceView() {
    const links = Array.from(navLinks).map(link => link.textContent);
    const sentence = `Explore our collections: ${links.join(', ')}.`;
    navSentence.textContent = sentence;
    navItems.classList.add('hidden');
    navSentence.classList.remove('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Cart modal event listeners
    if (cartIcon) {
        console.log('Cart icon found');
        cartIcon.addEventListener('click', toggleCartModal);
    } else {
        console.log('Cart icon not found');
    }
    if (closeCart) {
        console.log('Close cart button found');
        closeCart.addEventListener('click', toggleCartModal);
    } else {
        console.log('Close cart button not found');
    }

    // Close modal when clicking outside
    if (cartModal) {
        console.log('Cart modal found');
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                toggleCartModal();
            }
        });
    } else {
        console.log('Cart modal not found');
    }

    // Navigation panel event listeners
    if (navTrigger) {
        console.log('Nav trigger (search icon) found');
        navTrigger.addEventListener('click', toggleNavPanel);
    } else {
        console.log('Nav trigger not found');
    }
    if (closeNav) {
        console.log('Close nav button found');
        closeNav.addEventListener('click', toggleNavPanel);
    } else {
        console.log('Close nav button not found');
    }

    // Navigate to link on click (removed preventDefault and updateSentenceView)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // No preventDefault() to allow navigation
            // Close the nav panel after navigation
            if (navPanel) {
                navPanel.setAttribute('data-open', 'false');
                navPanel.classList.add('hidden');
                if (window.innerWidth < 768 && mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Close nav panel when clicking outside
    if (navPanel) {
        console.log('Nav panel found');
        navPanel.addEventListener('click', function(e) {
            if (e.target === navPanel) {
                toggleNavPanel();
            }
        });
    } else {
        console.log('Nav panel not found');
    }

    // Category and sorting logic
    const path = window.location.pathname;
    const category = path.split('/').pop().replace('.html', '');
    
    if (['skincare', 'makeup', 'wigs', 'handbags', 'perfumes', 'lingeries'].includes(category)) {
        console.log(`Rendering category page for: ${category}`);
        renderProductGrid(category, 'product-grid'); // Initial render
        const sortSelect = document.getElementById('sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', async function() {
                const sortValue = this.value;
                let products = await getProductsByCategory(category);
                switch(sortValue) {
                    case 'price-asc':
                        products.sort((a, b) => a.price - b.price);
                        break;
                    case 'price-desc':
                        products.sort((a, b) => b.price - a.price);
                        break;
                    case 'name-asc':
                        products.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                    default:
                        break;
                }
                renderProductGrid(category, 'product-grid', products); // Render with sorted products
            });
        }
    } else if (category === 'products') {
        renderProductList('product-list'); // Initial render for products page
    }
});