// Main application JavaScript
class ShopFlow {
    constructor() {
        this.products = [
            {
                id: 1,
                title: "Premium Wireless Headphones",
                description: "High-quality wireless headphones with noise cancellation",
                price: 299.99,
                image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400"
            },
            {
                id: 2,
                title: "Smart Fitness Watch",
                description: "Track your fitness goals with this advanced smartwatch",
                price: 199.99,
                image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400"
            },
            {
                id: 3,
                title: "Portable Bluetooth Speaker",
                description: "Crystal clear sound in a compact, portable design",
                price: 89.99,
                image: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400"
            },
            {
                id: 4,
                title: "Professional Camera Lens",
                description: "Professional grade lens for stunning photography",
                price: 549.99,
                image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"
            },
            {
                id: 5,
                title: "Gaming Mechanical Keyboard",
                description: "RGB backlit mechanical keyboard for gaming enthusiasts",
                price: 159.99,
                image: "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=400"
            },
            {
                id: 6,
                title: "Wireless Phone Charger",
                description: "Fast wireless charging pad for all compatible devices",
                price: 39.99,
                image: "https://images.pexels.com/photos/4492128/pexels-photo-4492128.jpeg?auto=compress&cs=tinysrgb&w=400"
            }
        ];
        
        this.cart = JSON.parse(localStorage.getItem('shopflow-cart')) || [];
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.updateCartCount();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close menu when clicking on a link
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }
    
    loadProducts() {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;
        
        productGrid.innerHTML = '';
        
        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            productGrid.appendChild(productCard);
        });
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="shopFlow.addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;
        
        return card;
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showAddToCartFeedback();
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }
    
    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.saveCart();
        }
        
        this.updateCartCount();
    }
    
    saveCart() {
        localStorage.setItem('shopflow-cart', JSON.stringify(this.cart));
    }
    
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCount.style.display = 'flex';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }
    
    showAddToCartFeedback() {
        // Visual feedback when item is added to cart
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.1)';
            cartIcon.style.color = 'var(--success-500)';
            
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
                cartIcon.style.color = '';
            }, 200);
        }
    }
    
    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    getCart() {
        return this.cart;
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
    }
}

// Utility functions
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Initialize the application
const shopFlow = new ShopFlow();

// Export for use in other scripts
window.shopFlow = shopFlow;