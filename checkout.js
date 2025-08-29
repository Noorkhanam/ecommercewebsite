// Checkout page functionality
class CheckoutPage {
    constructor() {
        this.shopFlow = window.shopFlow;
        this.form = document.getElementById('checkout-form');
        this.init();
    }
    
    init() {
        this.renderOrderSummary();
        this.setupFormValidation();
        this.setupCardFormatting();
        
        // Redirect if cart is empty
        if (this.shopFlow.cart.length === 0) {
            this.showEmptyCartMessage();
        }
    }
    
    setupFormValidation() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }
    
    setupCardFormatting() {
        const cardNumberInput = document.getElementById('cardNumber');
        const expiryDateInput = document.getElementById('expiryDate');
        const cvvInput = document.getElementById('cvv');
        
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }
        
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }
        
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }
    }
    
    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.name;
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (!value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required`;
        } else {
            // Specific field validations
            switch (fieldName) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                    
                case 'cardNumber':
                    const cardNumber = value.replace(/\s/g, '');
                    if (cardNumber.length < 13 || cardNumber.length > 19) {
                        isValid = false;
                        errorMessage = 'Please enter a valid card number';
                    }
                    break;
                    
                case 'expiryDate':
                    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
                    if (!expiryRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid expiry date (MM/YY)';
                    } else {
                        // Check if date is in the future
                        const [month, year] = value.split('/');
                        const currentDate = new Date();
                        const currentYear = currentDate.getFullYear() % 100;
                        const currentMonth = currentDate.getMonth() + 1;
                        
                        if (parseInt(year) < currentYear || 
                           (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                            isValid = false;
                            errorMessage = 'Card has expired';
                        }
                    }
                    break;
                    
                case 'cvv':
                    if (value.length < 3 || value.length > 4) {
                        isValid = false;
                        errorMessage = 'Please enter a valid CVV';
                    }
                    break;
                    
                case 'zipCode':
                    const zipRegex = /^\d{5}(-\d{4})?$/;
                    if (!zipRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid ZIP code';
                    }
                    break;
            }
        }
        
        this.showFieldError(input, isValid, errorMessage);
        return isValid;
    }
    
    showFieldError(input, isValid, errorMessage) {
        const errorElement = document.getElementById(`${input.name}-error`);
        
        if (isValid) {
            input.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        } else {
            input.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        }
    }
    
    clearFieldError(input) {
        input.classList.remove('error');
        const errorElement = document.getElementById(`${input.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    getFieldLabel(fieldName) {
        const labels = {
            email: 'Email address',
            firstName: 'First name',
            lastName: 'Last name',
            address: 'Street address',
            city: 'City',
            state: 'State',
            zipCode: 'ZIP code',
            cardNumber: 'Card number',
            expiryDate: 'Expiry date',
            cvv: 'CVV'
        };
        return labels[fieldName] || fieldName;
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    handleFormSubmit() {
        if (!this.validateForm()) {
            this.showFormError('Please fix the errors above');
            return;
        }
        
        if (this.shopFlow.cart.length === 0) {
            this.showFormError('Your cart is empty');
            return;
        }
        
        this.processOrder();
    }
    
    processOrder() {
        // Show loading state
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        
        // Simulate order processing
        setTimeout(() => {
            this.completeOrder();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }, 2000);
    }
    
    completeOrder() {
        // Get form data
        const formData = new FormData(this.form);
        const orderData = {
            customer: Object.fromEntries(formData),
            items: this.shopFlow.cart,
            total: this.getOrderTotal(),
            orderNumber: this.generateOrderNumber(),
            timestamp: new Date().toISOString()
        };
        
        // Save order to localStorage for demonstration
        const orders = JSON.parse(localStorage.getItem('shopflow-orders')) || [];
        orders.push(orderData);
        localStorage.setItem('shopflow-orders', JSON.stringify(orders));
        
        // Clear cart
        this.shopFlow.clearCart();
        
        // Show success message and redirect
        this.showSuccessMessage(orderData.orderNumber);
    }
    
    generateOrderNumber() {
        return 'SF' + Date.now().toString(36).toUpperCase();
    }
    
    showSuccessMessage(orderNumber) {
        const container = document.querySelector('.checkout-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--success-500); margin-bottom: 1.5rem;">
                        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7089 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18203 2.99721 7.13214 4.39828 5.49883C5.79935 3.86553 7.69279 2.72636 9.79619 2.24223C11.8996 1.75809 14.1003 1.95185 16.07 2.79" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h2 style="color: var(--gray-900); margin-bottom: 1rem;">Order Confirmed!</h2>
                    <p style="color: var(--gray-600); margin-bottom: 0.5rem;">Thank you for your order</p>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">Order Number: <strong>${orderNumber}</strong></p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                    </div>
                </div>
            `;
        }
    }
    
    showFormError(message) {
        // Remove existing error message
        const existingError = document.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background-color: var(--error-50, #fef2f2);
            color: var(--error-700, #b91c1c);
            padding: var(--space-4);
            border-radius: var(--radius-md);
            border: 1px solid var(--error-200, #fecaca);
            margin-bottom: var(--space-4);
            text-align: center;
        `;
        errorDiv.textContent = message;
        
        this.form.insertBefore(errorDiv, this.form.firstChild);
        
        // Scroll to top of form
        this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    renderOrderSummary() {
        const summaryItems = document.getElementById('summary-items');
        const subtotalElement = document.getElementById('checkout-subtotal');
        const shippingElement = document.getElementById('checkout-shipping');
        const taxElement = document.getElementById('checkout-tax');
        const totalElement = document.getElementById('checkout-total');
        
        if (!summaryItems) return;
        
        if (this.shopFlow.cart.length === 0) {
            summaryItems.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 2rem;">No items in cart</p>';
            return;
        }
        
        summaryItems.innerHTML = '';
        
        this.shopFlow.cart.forEach(item => {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            
            summaryItem.innerHTML = `
                <div class="summary-item-name">
                    ${item.title} × ${item.quantity}
                </div>
                <div class="summary-item-price">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
            `;
            
            summaryItems.appendChild(summaryItem);
        });
        
        this.updateOrderTotals();
    }
    
    updateOrderTotals() {
        const subtotalElement = document.getElementById('checkout-subtotal');
        const shippingElement = document.getElementById('checkout-shipping');
        const taxElement = document.getElementById('checkout-tax');
        const totalElement = document.getElementById('checkout-total');
        
        if (!subtotalElement || !shippingElement || !taxElement || !totalElement) return;
        
        const subtotal = this.shopFlow.getCartTotal();
        const shipping = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.08; // 8% tax rate
        const total = subtotal + shipping + tax;
        
        subtotalElement.textContent = formatCurrency(subtotal);
        shippingElement.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
        taxElement.textContent = formatCurrency(tax);
        totalElement.textContent = formatCurrency(total);
        
        if (shipping === 0) {
            shippingElement.style.color = 'var(--success-500)';
            shippingElement.style.fontWeight = '600';
        }
    }
    
    getOrderTotal() {
        const subtotal = this.shopFlow.getCartTotal();
        const shipping = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.08;
        return subtotal + shipping + tax;
    }
    
    showEmptyCartMessage() {
        const container = document.querySelector('.checkout-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); grid-column: 1 / -1;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--gray-400); margin-bottom: 1.5rem;">
                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.4 5.1 16.4H17M17 13V19C17 19.6 16.6 20 16 20H8C7.4 20 7 19.6 7 19V13M17 13H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h2 style="color: var(--gray-700); margin-bottom: 1rem;">Your cart is empty</h2>
                    <p style="color: var(--gray-500); margin-bottom: 2rem;">Add some products to proceed with checkout</p>
                    <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
        }
    }
}

// Initialize checkout page if we're on the checkout page
if (window.location.pathname.includes('checkout.html')) {
    // Wait for shopFlow to be available
    if (window.shopFlow) {
        const checkoutPage = new CheckoutPage();
        window.checkoutPage = checkoutPage;
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const checkoutPage = new CheckoutPage();
                window.checkoutPage = checkoutPage;
            }, 100);
        });
    }
}