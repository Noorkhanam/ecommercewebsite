// Cart page functionality
class CartPage {
    constructor() {
        this.shopFlow = window.shopFlow;
        this.init();
    }
    
    init() {
        this.renderCart();
        this.updateCartSummary();
        
        // Listen for storage changes (if cart is updated from another tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'shopflow-cart') {
                this.shopFlow.cart = JSON.parse(e.newValue) || [];
                this.renderCart();
                this.updateCartSummary();
                this.shopFlow.updateCartCount();
            }
        });
    }
    
    renderCart() {
        const cartEmpty = document.getElementById('cart-empty');
        const cartItems = document.getElementById('cart-items');
        const cartList = document.getElementById('cart-list');
        
        if (!cartEmpty || !cartItems || !cartList) return;
        
        if (this.shopFlow.cart.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
            return;
        }
        
        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';
        
        cartList.innerHTML = '';
        
        this.shopFlow.cart.forEach(item => {
            const cartItem = this.createCartItem(item);
            cartList.appendChild(cartItem);
        });
    }
    
    createCartItem(item) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item slide-in';
        
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.title}</h3>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="cartPage.updateQuantity(${item.id}, -1)">−</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="cartPage.updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="cartPage.removeItem(${item.id})" title="Remove item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;
        
        return cartItem;
    }
    
    updateQuantity(productId, change) {
        this.shopFlow.updateQuantity(productId, change);
        this.renderCart();
        this.updateCartSummary();
    }
    
    removeItem(productId) {
        this.shopFlow.removeFromCart(productId);
        this.renderCart();
        this.updateCartSummary();
    }
    
    updateCartSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total');
        
        if (!subtotalElement || !shippingElement || !totalElement) return;
        
        const subtotal = this.shopFlow.getCartTotal();
        const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
        const total = subtotal + shipping;
        
        subtotalElement.textContent = formatCurrency(subtotal);
        shippingElement.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
        totalElement.textContent = formatCurrency(total);
        
        // Update shipping text for free shipping
        if (shipping === 0) {
            shippingElement.style.color = 'var(--success-500)';
            shippingElement.style.fontWeight = '600';
        } else {
            shippingElement.style.color = '';
            shippingElement.style.fontWeight = '';
        }
    }
}

// Initialize cart page if we're on the cart page
if (window.location.pathname.includes('cart.html')) {
    const cartPage = new CartPage();
    window.cartPage = cartPage;
}