// Fresh E-commerce JavaScript
class FreshStore {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('freshCart')) || [];
        this.products = this.initializeProducts();
        this.currentUser = JSON.parse(localStorage.getItem('freshUser')) || null;
    }

    initializeProducts() {
        return {
            freshPicks: [
                { id: 1, name: "Urban Utility Jacket", price: 89.99, category: "men", image: "jacket-1", colors: ["black", "yellow", "gray"] },
                { id: 2, name: "Fresh Logo Tee", price: 34.99, category: "unisex", image: "tee-1", colors: ["black", "white"], sale: true, salePrice: 24.99 },
                { id: 3, name: "Street Cargo Pants", price: 64.99, category: "men", image: "pants-1", colors: ["black", "gray"] },
                { id: 4, name: "Urban High-Tops", price: 119.99, category: "unisex", image: "shoes-1", colors: ["black", "white"] }
            ],
            accessories: [
                { id: 101, name: "Fresh Aviator Sunglasses", price: 49.99, category: "sunglasses", image: "sunglasses-1", colors: ["black", "gold"] },
                { id: 102, name: "Utility Backpack", price: 79.99, category: "bags", image: "backpack-1", colors: ["black", "yellow"] },
                { id: 103, name: "Logo Baseball Cap", price: 29.99, category: "hats", image: "hat-1", colors: ["black", "yellow"] },
                { id: 104, name: "Minimalist Watch", price: 89.99, category: "watches", image: "watch-1", colors: ["black", "silver"] },
                { id: 105, name: "Chain Necklace", price: 39.99, category: "jewelry", image: "necklace-1", colors: ["silver", "gold"] }
            ]
        };
    }

    // Cart Management
    addToCart(productId, quantity = 1, size = 'M', color = 'black') {
        const product = this.findProduct(productId);
        if (!product) return false;

        const existingItem = this.cart.find(item => 
            item.id === productId && item.size === size && item.color === color
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                cartId: Date.now(),
                size,
                color,
                quantity
            });
        }

        this.saveCart();
        this.updateCartUI();
        return true;
    }

    removeFromCart(cartId) {
        this.cart = this.cart.filter(item => item.cartId !== cartId);
        this.saveCart();
        this.updateCartUI();
    }

    updateCartQuantity(cartId, quantity) {
        const item = this.cart.find(item => item.cartId === cartId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartUI();
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => {
            const price = item.sale ? item.salePrice : item.price;
            return total + (price * item.quantity);
        }, 0);
    }

    saveCart() {
        localStorage.setItem('freshCart', JSON.stringify(this.cart));
    }

    // Product Management
    findProduct(id) {
        for (let category in this.products) {
            const product = this.products[category].find(p => p.id === id);
            if (product) return product;
        }
        return null;
    }

    getProductsByCategory(category) {
        if (category === 'all') {
            return [...this.products.freshPicks, ...this.products.accessories];
        }
        return this.products.freshPicks.filter(p => p.category === category);
    }

    // UI Updates
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Image Generation
    generateImagePlaceholder(text, width = 300, height = 300) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        // Fresh branding elements
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(0, 0, width, height * 0.1);
        ctx.fillRect(0, height * 0.9, width, height * 0.1);

        // Text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, width / 2, height / 2);

        return canvas.toDataURL();
    }

    replaceImagePlaceholders() {
        document.querySelectorAll('.image-placeholder').forEach(placeholder => {
            const text = placeholder.getAttribute('data-image') || placeholder.textContent;
            const img = new Image();
            img.src = this.generateImagePlaceholder(text, 300, 300);
            img.alt = text;
            placeholder.parentNode.replaceChild(img, placeholder);
        });
    }
}

// Initialize Store
const freshStore = new FreshStore();

// Page Initializers
function initializeHomepage() {
    freshStore.replaceImagePlaceholders();
    freshStore.updateCartUI();
}

function loadFreshPicks() {
    const grid = document.getElementById('freshPicksGrid');
    if (!grid) return;

    grid.innerHTML = freshStore.products.freshPicks.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${product.sale ? '<div class="product-badge">Sale</div>' : ''}
            <div class="image-placeholder" data-image="${product.image}">${product.name}</div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price ${product.sale ? 'sale' : ''}">
                    $${product.sale ? product.salePrice : product.price}
                    ${product.sale ? `<span class="original-price">$${product.price}</span>` : ''}
                </div>
                <button class="add-to-cart quick-add">Quick Add</button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.quick-add').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.closest('.product-card').getAttribute('data-id'));
            freshStore.addToCart(productId);
            showNotification('Added to cart!');
        });
    });

    freshStore.replaceImagePlaceholders();
}

function initializeProductPage() {
    // Thumbnail navigation
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // In a real app, this would change the main image
        });
    });

    // Size selection
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Quantity controls
    document.getElementById('decreaseQty').addEventListener('click', function() {
        const quantityDisplay = document.getElementById('quantity');
        let quantity = parseInt(quantityDisplay.textContent);
        if (quantity > 1) {
            quantityDisplay.textContent = quantity - 1;
        }
    });

    document.getElementById('increaseQty').addEventListener('click', function() {
        const quantityDisplay = document.getElementById('quantity');
        let quantity = parseInt(quantityDisplay.textContent);
        quantityDisplay.textContent = quantity + 1;
    });

    // Add to cart
    document.getElementById('addToCart').addEventListener('click', function() {
        const size = document.querySelector('.size-option.active').getAttribute('data-size');
        const color = document.querySelector('.color-option.active').getAttribute('data-color');
        const quantity = parseInt(document.getElementById('quantity').textContent);
        
        freshStore.addToCart(1, quantity, size, color); // Using fixed product ID for demo
        showNotification('Added to cart!');
    });

    freshStore.replaceImagePlaceholders();
}

function initializeCheckout() {
    // Load cart items
    updateCheckoutCart();

    // Step navigation
    document.querySelectorAll('.continue-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const nextStep = this.getAttribute('data-next');
            navigateToStep(nextStep);
        });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const prevStep = this.getAttribute('data-prev');
            navigateToStep(prevStep);
        });
    });

    // Shipping option changes
    document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        radio.addEventListener('change', updateOrderSummary);
    });

    // Payment method selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            // Show/hide payment forms based on selection
        });
    });

    // Place order
    document.getElementById('placeOrder').addEventListener('click', function() {
        if (validateCheckoutForm()) {
            processOrder();
        }
    });

    freshStore.replaceImagePlaceholders();
}

function initializeAccessoriesPage() {
    // Filter functionality
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            filterAccessories(category);
        });
    });

    loadAccessoriesGrid();
    freshStore.replaceImagePlaceholders();
}

// Helper Functions
function navigateToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    // Update step indicators
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.getAttribute('data-step')) <= stepNumber) {
            step.classList.add('active');
        }
    });
}

function updateCheckoutCart() {
    const cartItems = document.getElementById('cartItems');
    const subtotal = document.getElementById('subtotal');
    const shipping = document.getElementById('shipping');
    const grandTotal = document.getElementById('grandTotal');

    if (!cartItems) return;

    if (freshStore.cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        subtotal.textContent = '$0.00';
        shipping.textContent = '$0.00';
        grandTotal.textContent = '$0.00';
        return;
    }

    cartItems.innerHTML = freshStore.cart.map(item => `
        <div class="cart-item">
            <div class="item-image">
                <div class="image-placeholder" data-image="${item.image}">${item.name}</div>
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>Size: ${item.size} | Color: ${item.color}</p>
                <div class="item-price">$${(item.sale ? item.salePrice : item.price).toFixed(2)}</div>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn" onclick="updateItemQuantity(${item.cartId}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateItemQuantity(${item.cartId}, ${item.quantity + 1})">+</button>
            </div>
            <button class="remove-item" onclick="removeItem(${item.cartId})">×</button>
        </div>
    `).join('');

    const subtotalValue = freshStore.getCartTotal();
    const shippingValue = 4.99; // Default shipping
    const totalValue = subtotalValue + shippingValue;

    subtotal.textContent = `$${subtotalValue.toFixed(2)}`;
    shipping.textContent = `$${shippingValue.toFixed(2)}`;
    grandTotal.textContent = `$${totalValue.toFixed(2)}`;

    freshStore.replaceImagePlaceholders();
}

function updateItemQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        freshStore.removeFromCart(cartId);
    } else {
        freshStore.updateCartQuantity(cartId, newQuantity);
    }
}

function removeItem(cartId) {
    freshStore.removeFromCart(cartId);
}

function updateOrderSummary() {
    // Update order summary based on selected shipping
}

function validateCheckoutForm() {
    // Simple validation for demo
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    
    if (!email || !firstName || !lastName) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    return true;
}

function processOrder() {
    showNotification('Order placed successfully!', 'success');
    // In a real app, this would process payment and clear cart
    freshStore.cart = [];
    freshStore.saveCart();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function filterAccessories(category) {
    const grid = document.getElementById('accessoriesGrid');
    let filteredProducts = freshStore.products.accessories;
    
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="image-placeholder" data-image="${product.image}">${product.name}</div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price}</div>
                <div class="product-colors">
                    ${product.colors.map(color => `<div class="color-option color-${color}" style="background-color: ${getColorHex(color)}"></div>`).join('')}
                </div>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('#accessoriesGrid .add-to-cart').forEach((button, index) => {
        button.addEventListener('click', function() {
            const product = filteredProducts[index];
            freshStore.addToCart(product.id);
            showNotification('Added to cart!');
        });
    });

    freshStore.replaceImagePlaceholders();
}

function loadAccessoriesGrid() {
    filterAccessories('all');
}

function getColorHex(color) {
    const colors = {
        black: '#000000',
        yellow: '#FFD700',
        gray: '#808080',
        white: '#FFFFFF',
        gold: '#FFD700',
        silver: '#C0C0C0'
    };
    return colors[color] || '#000000';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Global functions for HTML onclick handlers
window.updateItemQuantity = updateItemQuantity;
window.removeItem = removeItem;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    freshStore.updateCartUI();
    freshStore.replaceImagePlaceholders();
    
    // Initialize specific page functionality based on current page
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') {
        initializeHomepage();
    } else if (path.includes('product.html')) {
        initializeProductPage();
    } else if (path.includes('checkout.html')) {
        initializeCheckout();
    } else if (path.includes('accessories.html')) {
        initializeAccessoriesPage();
    }
});