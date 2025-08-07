
/**
 * Main Bundle Builder Class
 * Handles all bundle creation logic, product management, and UI updates
 */
class BundleBuilder {
    /**
     * Initialize the bundle builder with default configuration
     */
    constructor() {
        // Configuration
        this.config = {
            minProductsForDiscount: 3,
            discountPercentage: 30,
            loadingDelay: 400,
            staggeredLoadDelay: 200,
            animationDuration: 300
        };
        
        // State management
        this.state = {
            selectedProducts: new Map(),
            productPrices: new Map(),
            isLoading: false
        };
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.initializeProductData();
        this.initializeSkeletonLoaders();
        this.setupFallbackContentDisplay();
        this.addProductAnimations();
        this.updateUI();
    }
    
    // =========================================================================
    // INITIALIZATION METHODS
    // =========================================================================
    
    /**
     * Extract and store product data from DOM
     */
    initializeProductData() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = parseInt(card.dataset.productId);
            const price = parseFloat(card.dataset.price);
            this.state.productPrices.set(productId, price);
        });
    }
    
    /**
     * Initialize skeleton loading system with staggered animations
     */
    initializeSkeletonLoaders() {
        document.querySelectorAll('.product-card').forEach((card, index) => {
            const img = card.querySelector('.product-image');
            
            // Set up staggered loading
            setTimeout(() => {
                this.handleImageLoading(card, img);
            }, index * this.config.staggeredLoadDelay);
        });
    }
    
    /**
     * Handle individual image loading with proper fallbacks
     */
    handleImageLoading(card, img) {
        if (img.complete && img.naturalHeight !== 0) {
            this.showProductContent(card);
        } else {
            img.addEventListener('load', () => {
                setTimeout(() => this.showProductContent(card), this.config.animationDuration);
            });
            
            img.addEventListener('error', () => {
                console.warn('Failed to load product image:', img.src);
                this.showProductContent(card);
            });
        }
    }
    
    /**
     * Fallback to ensure all content is visible after timeout
     */
    setupFallbackContentDisplay() {
        setTimeout(() => {
            document.querySelectorAll('.product-card').forEach(card => {
                this.forceShowContent(card);
            });
        }, 1000);
    }
    
    /**
     * Add staggered animations to product cards
     */
    addProductAnimations() {
        document.querySelectorAll('.product-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }
    
    // =========================================================================
    // CONTENT DISPLAY METHODS
    // =========================================================================
    
    /**
     * Show product content with smooth animations
     */
    showProductContent(card) {
        const elements = this.getCardElements(card);
        
        // Hide skeleton elements
        this.hideSkeletonElements(elements);
        
        // Show actual content with staggered animations
        this.showContentElements(elements);
        
        card.classList.remove('loading');
    }
    
    /**
     * Force all content to be visible (fallback method)
     */
    forceShowContent(card) {
        const elements = this.getCardElements(card);
        
        // Aggressively hide skeletons
        this.hideSkeletonElements(elements, true);
        
        // Force show content
        this.showContentElements(elements, true);
        
        card.classList.remove('loading');
        card.style.visibility = 'visible';
    }
    
    /**
     * Get all relevant elements from a product card
     */
    getCardElements(card) {
        return {
            img: card.querySelector('.product-image'),
            skeletonImage: card.querySelector('.skeleton-image'),
            skeletonTitle: card.querySelector('.skeleton-title'),
            skeletonPrice: card.querySelector('.skeleton-price'),
            skeletonButton: card.querySelector('.skeleton-button'),
            title: card.querySelector('.product-title'),
            price: card.querySelector('.product-price'),
            button: card.querySelector('.add-to-bundle-btn')
        };
    }
    
    /**
     * Hide skeleton loading elements
     */
    hideSkeletonElements(elements, force = false) {
        const skeletons = ['skeletonImage', 'skeletonTitle', 'skeletonPrice', 'skeletonButton'];
        
        skeletons.forEach(skeleton => {
            if (elements[skeleton]) {
                elements[skeleton].style.display = 'none';
                if (force) elements[skeleton].style.visibility = 'hidden';
            }
        });
    }
    
    /**
     * Show actual content elements with animations
     */
    showContentElements(elements, force = false) {
        const { img, title, price, button } = elements;
        
        if (img) {
            img.classList.remove('skeleton');
            img.classList.add('loaded');
            if (force) {
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
            }
        }
        
        if (title) {
            title.style.display = 'flex';
            if (force) {
                title.style.visibility = 'visible';
                title.style.opacity = '1';
            } else {
                title.style.animation = 'fadeInUp 0.3s ease-out';
            }
        }
        
        if (price) {
            price.style.display = 'flex';
            if (force) {
                price.style.visibility = 'visible';
                price.style.opacity = '1';
            } else {
                price.style.animation = 'fadeInUp 0.3s ease-out 0.1s both';
            }
        }
        
        if (button) {
            button.style.display = 'flex';
            if (force) {
                button.style.visibility = 'visible';
                button.style.opacity = '1';
            } else {
                button.style.animation = 'fadeInUp 0.3s ease-out 0.2s both';
            }
        }
    }
    
    // =========================================================================
    // PRODUCT MANAGEMENT METHODS
    // =========================================================================
    
    /**
     * Toggle product selection in bundle
     */
    toggleProduct(productId) {
        if (this.state.isLoading) return;
        
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const button = productCard.querySelector('.add-to-bundle-btn');
        
        // Check if button is disabled
        if (button.classList.contains('disabled')) return;
        
        // Ensure content is visible
        this.forceShowContent(productCard);
        
        this.state.isLoading = true;
        button.classList.add('loading');
        
        // Get product data
        const productData = this.extractProductData(productCard, productId);
        
        setTimeout(() => {
            if (this.state.selectedProducts.has(productId)) {
                this.removeProductFromBundle(productId, button);
            } else {
                this.addProductToBundle(productId, productData, button);
            }
            
            button.classList.remove('loading');
            this.state.isLoading = false;
            this.updateUI();
        }, this.config.loadingDelay);
    }
    
    /**
     * Extract product data from DOM card
     */
    extractProductData(productCard, productId) {
        return {
            id: productId,
            title: productCard.querySelector('.product-title').textContent,
            image: productCard.querySelector('.product-image').src,
            price: this.state.productPrices.get(productId),
            quantity: 1
        };
    }
    
    /**
     * Add product to bundle
     */
    addProductToBundle(productId, productData, button) {
        this.state.selectedProducts.set(productId, productData);
        button.classList.add('selected');
        button.querySelector('.btn-text').textContent = 'Added to Bundle';
    }
    
    /**
     * Remove product from bundle
     */
    removeProductFromBundle(productId, button) {
        this.state.selectedProducts.delete(productId);
        button.classList.remove('selected');
        button.querySelector('.btn-text').textContent = 'Add to Bundle';
        
        // Remove from sidebar with animation
        const sidebarItem = document.querySelector(`[data-sidebar-product-id="${productId}"]`);
        if (sidebarItem) {
            sidebarItem.classList.add('removing');
            setTimeout(() => {
                if (sidebarItem.parentNode) {
                    sidebarItem.parentNode.removeChild(sidebarItem);
                }
            }, this.config.animationDuration);
        }
    }
    
    
    /**
     * Update product quantity with validation
     */
    updateQuantity(productId, change) {
        if (!this.state.selectedProducts.has(productId)) return;
        
        const product = this.state.selectedProducts.get(productId);
        const newQuantity = product.quantity + change;
        
        // Remove product if quantity reaches zero
        if (newQuantity <= 0) {
            this.removeProduct(productId);
            return;
        }
        
        // Update quantity
        product.quantity = newQuantity;
        this.state.selectedProducts.set(productId, product);
        
        // Add visual feedback
        this.animateQuantityChange(productId);
        this.updateUI();
    }
    
    /**
     * Animate quantity input when changed
     */
    animateQuantityChange(productId) {
        const quantityInput = document.querySelector(`[data-sidebar-product-id="${productId}"] .quantity-input`);
        if (quantityInput) {
            quantityInput.style.transform = 'scale(1.1)';
            quantityInput.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                quantityInput.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    /**
     * Remove product completely from bundle
     */
    removeProduct(productId) {
        if (!this.state.selectedProducts.has(productId)) return;
        
        const sidebarItem = document.querySelector(`[data-sidebar-product-id="${productId}"]`);
        if (sidebarItem) {
            sidebarItem.classList.add('removing');
            setTimeout(() => {
                this.state.selectedProducts.delete(productId);
                this.updateProductButtonState(productId, false);
                this.updateUI();
            }, this.config.animationDuration);
        }
    }
    
    /**
     * Update individual product button state
     */
    updateProductButtonState(productId, isSelected) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const button = productCard.querySelector('.add-to-bundle-btn');
        
        if (isSelected) {
            button.classList.add('selected');
            button.querySelector('.btn-text').textContent = 'Added to Bundle';
        } else {
            button.classList.remove('selected');
            button.querySelector('.btn-text').textContent = 'Add to Bundle';
        }
    }
    
    // =========================================================================
    // UI UPDATE METHODS
    // =========================================================================
    
    /**
     * Master UI update method
     */
    updateUI() {
        this.updateProgressBar();
        this.updateSelectedProductsList();
        this.updateBundleSummary();
        this.updateAddBundleButton();
        this.updateButtonStates();
    }
    
    /**
     * Update progress bar based on selected products
     */
    updateProgressBar() {
        const selectedCount = this.state.selectedProducts.size;
        const progressPercentage = Math.min((selectedCount / this.config.minProductsForDiscount) * 100, 100);
        const progressBar = document.getElementById('progressBar');
        
        progressBar.style.width = `${progressPercentage}%`;
        
        // Add visual feedback when close to completion
        if (selectedCount === this.config.minProductsForDiscount - 1) {
            progressBar.classList.add('pulse');
        } else {
            progressBar.classList.remove('pulse');
        }
    }
    
    /**
     * Update the selected products list in sidebar
     */
    updateSelectedProductsList() {
        const container = document.getElementById('selectedProducts');
        const skeletonContainer = document.getElementById('bundleSkeletonContainer');
        const selectedCount = this.state.selectedProducts.size;
        
        // Clear and prepare container
        container.innerHTML = '';
        container.style.display = 'block';
        container.style.visibility = 'visible';
        
        // Manage skeleton visibility
        this.updateSkeletonVisibility(skeletonContainer, selectedCount);
        
        // Add products to container
        this.state.selectedProducts.forEach((product) => {
            const productElement = this.createSelectedProductElement(product);
            container.appendChild(productElement);
        });
    }
    
    /**
     * Update skeleton loader visibility based on selected products
     */
    updateSkeletonVisibility(skeletonContainer, selectedCount) {
        const skeletonRows = skeletonContainer.querySelectorAll('.bundle-skeleton-row');
        
        if (selectedCount === 0) {
            // Show all skeleton rows when no products
            skeletonContainer.style.display = 'flex';
            skeletonRows.forEach(row => row.style.display = 'flex');
        } else {
            // Hide skeleton rows for selected products
            skeletonRows.forEach((row, index) => {
                row.style.display = index < selectedCount ? 'none' : 'flex';
            });
            
            skeletonContainer.style.display = selectedCount >= 3 ? 'none' : 'flex';
        }
    }
    
    
    /**
     * Create DOM element for selected product in sidebar
     */
    createSelectedProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'selected-product-item';
        productDiv.setAttribute('data-sidebar-product-id', product.id);
        
        productDiv.innerHTML = `
            <img 
                class="selected-product-image" 
                src="${product.image}" 
                alt="${product.title}" 
                loading="lazy"
            >
            <div class="selected-product-info">
                <h4 class="selected-product-title">${product.title}</h4>
                <p class="selected-product-price">$${product.price.toFixed(2)}</p>
            </div>
            <div class="selected-product-controls">
                <div class="quantity-input-bundle">
                    <button 
                        class="quantity-btn" 
                        onclick="bundleBuilder.updateQuantity(${product.id}, -1)" 
                        aria-label="Decrease quantity"
                    >
                        <svg width="9" height="1" viewBox="0 0 9 1">
                            <rect width="9" height="1" fill="currentColor"/>
                        </svg>
                    </button>
                    <input 
                        class="quantity-input" 
                        type="text" 
                        value="${product.quantity}" 
                        readonly 
                        aria-label="Quantity"
                    >
                    <button 
                        class="quantity-btn" 
                        onclick="bundleBuilder.updateQuantity(${product.id}, 1)" 
                        aria-label="Increase quantity"
                    >
                        <svg width="9" height="9" viewBox="0 0 9 9">
                            <path d="M4.5 0V9M0 4.5H9" stroke="currentColor" stroke-width="1"/>
                        </svg>
                    </button>
                </div>
                <button 
                    class="remove-btn" 
                    onclick="bundleBuilder.removeProduct(${product.id})" 
                    aria-label="Remove ${product.title} from bundle"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path 
                            d="M1.5 3H10.5M5 1V3M7 1V3M2 3L2.4 10H9.6L10 3M4.5 5V8M7.5 5V8" 
                            stroke="currentColor" 
                            stroke-width="1.2" 
                            stroke-linecap="round" 
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
            </div>
        `;
        
        return productDiv;
    }
    
    // =========================================================================
    // CALCULATION METHODS
    // =========================================================================
    
    /**
     * Calculate subtotal of all selected products
     */
    calculateSubtotal() {
        let subtotal = 0;
        this.state.selectedProducts.forEach(product => {
            subtotal += product.price * product.quantity;
        });
        return subtotal;
    }
    
    /**
     * Calculate discount amount based on selection
     */
    calculateDiscount() {
        const selectedCount = this.state.selectedProducts.size;
        if (selectedCount >= this.config.minProductsForDiscount) {
            const subtotal = this.calculateSubtotal();
            return subtotal * (this.config.discountPercentage / 100);
        }
        return 0;
    }
    
    /**
     * Update bundle summary display
     */
    updateBundleSummary() {
        const subtotal = this.calculateSubtotal();
        const discount = this.calculateDiscount();
        const finalTotal = subtotal - discount;
        
        this.updateDiscountDisplay(discount);
        this.updateSubtotalDisplay(finalTotal);
    }
    
    /**
     * Update discount display with visual feedback
     */
    updateDiscountDisplay(discount) {
        const discountElement = document.getElementById('discountAmount');
        
        if (discount > 0) {
            discountElement.textContent = `- $${discount.toFixed(2)} (${this.config.discountPercentage}%)`;
            discountElement.style.color = '#28a745';
            
            // Add pulse animation for significant savings
            discountElement.style.animation = 'pulse 1s ease-in-out';
            setTimeout(() => {
                discountElement.style.animation = '';
            }, 1000);
        } else {
            discountElement.textContent = `- $0.00 (0%)`;
            discountElement.style.color = '#111111';
        }
    }
    
    /**
     * Update subtotal display
     */
    updateSubtotalDisplay(finalTotal) {
        const subtotalElement = document.getElementById('subtotalAmount');
        subtotalElement.textContent = `$${finalTotal.toFixed(2)}`;
    }
    
    /**
     * Update add to cart button state
     */
    updateAddBundleButton() {
        const button = document.getElementById('addBundleBtn');
        const selectedCount = this.state.selectedProducts.size;
        
        if (selectedCount >= this.config.minProductsForDiscount) {
            this.enableAddBundleButton(button, selectedCount);
        } else {
            this.disableAddBundleButton(button, selectedCount);
        }
    }
    
    /**
     * Enable add bundle button
     */
    enableAddBundleButton(button, selectedCount) {
        button.disabled = false;
        button.classList.add('enabled');
        
        // Start with "Proceed" and automatically transition to "Cart"
        if (!button.dataset.currentState || button.dataset.currentState === 'initial') {
            button.querySelector('.btn-text').textContent = `Add ${selectedCount} Items to Proceed`;
            button.dataset.currentState = 'proceed';
            
            // Automatically change to "Cart" after a brief moment
            setTimeout(() => {
                if (button.dataset.currentState === 'proceed') {
                    button.querySelector('.btn-text').textContent = `Add ${selectedCount} Items to Cart`;
                    button.dataset.currentState = 'cart';
                }
            }, 1000);
        } else if (button.dataset.currentState === 'added') {
            button.querySelector('.btn-text').textContent = `Add ${selectedCount} Items to Proceed`;
            button.dataset.currentState = 'proceed';
            
            // Automatically change to "Cart" after a brief moment
            setTimeout(() => {
                if (button.dataset.currentState === 'proceed') {
                    button.querySelector('.btn-text').textContent = `Add ${selectedCount} Items to Cart`;
                    button.dataset.currentState = 'cart';
                }
            }, 1000);
        }
    }
    
    /**
     * Disable add bundle button
     */
    disableAddBundleButton(button, selectedCount) {
        button.disabled = true;
        button.querySelector('.btn-text').textContent = `Add ${this.config.minProductsForDiscount} Items to Proceed`;
        button.classList.remove('enabled');
        button.dataset.currentState = 'initial';
    }
    
    /**
     * Update all product button states based on bundle status
     */
    updateButtonStates() {
        const selectedCount = this.state.selectedProducts.size;
        const isMaxSelection = selectedCount >= this.config.minProductsForDiscount;
        
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = parseInt(card.dataset.productId);
            const button = card.querySelector('.add-to-bundle-btn');
            const isSelected = this.state.selectedProducts.has(productId);
            
            if (isSelected || !isMaxSelection) {
                // Enable: product is selected OR bundle isn't full
                button.classList.remove('disabled');
                button.style.pointerEvents = '';
            } else {
                // Disable: bundle is full and product not selected
                button.classList.add('disabled');
                button.style.pointerEvents = 'none';
            }
        });
    }
    
    // =========================================================================
    // CART MANAGEMENT METHODS
    // =========================================================================
    
    /**
     * Add complete bundle to cart
     */
    addBundleToCart() {
        if (this.state.selectedProducts.size < this.config.minProductsForDiscount) return;
        
        const button = document.getElementById('addBundleBtn');
        const btnText = button.querySelector('.btn-text');
        const caretIcon = button.querySelector('.caret-icon path');
        const selectedCount = this.state.selectedProducts.size;
        const currentState = button.dataset.currentState;
        
        if (currentState === 'cart') {
            // Click on "Add Items to Cart": Immediately change to "Added to Cart"
            const bundleData = this.prepareBundleData();
            console.log('Bundle added to cart:', bundleData);
            
            // Change to "Added to Cart" state with checkmark
            button.classList.add('added-state');
            button.dataset.currentState = 'added';
            btnText.textContent = 'Added to Cart';
            
            // Change SVG path to checkmark
            if (caretIcon) {
                caretIcon.setAttribute('d', 'M3 8L7 12L13 4');
            }
        }
    }
    
    /**
     * Prepare bundle data for cart submission
     */
    prepareBundleData() {
        return {
            products: Array.from(this.state.selectedProducts.values()),
            subtotal: this.calculateSubtotal(),
            discount: this.calculateDiscount(),
            finalTotal: this.calculateSubtotal() - this.calculateDiscount(),
            discountPercentage: this.config.discountPercentage,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Reset bundle to initial state
     */
    resetBundle() {
        // Clear selected products
        this.state.selectedProducts.clear();
        
        // Reset all product buttons
        document.querySelectorAll('.add-to-bundle-btn').forEach(button => {
            button.classList.remove('selected');
            button.querySelector('.btn-text').textContent = 'Add to Bundle';
        });
        
        // Update UI
        this.updateUI();
    }
}

// ============================================================================= 
// GLOBAL FUNCTIONS & EVENT HANDLERS
// ============================================================================= 

/**
 * Global function for product toggle (used by onclick handlers)
 */
function toggleProduct(productId) {
    bundleBuilder.toggleProduct(productId);
}

/**
 * Global function for cart addition (used by onclick handlers)
 */
function addBundleToCart() {
    bundleBuilder.addBundleToCart();
}

// ============================================================================= 
// APPLICATION INITIALIZATION
// ============================================================================= 

/**
 * Application entry point
 */
let bundleBuilder;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main bundle builder
    bundleBuilder = new BundleBuilder();
    
    // Initialize enhancement features
    initializeEnhancements();
});

/**
 * Initialize additional UI enhancements and optimizations
 */
function initializeEnhancements() {
    setupHoverEffects();
    setupResponsiveHandling();
    setupTouchOptimizations();
    setupMobileScrolling();
    setupImageOptimizations();
    setupKeyboardNavigation();
    setupPerformanceOptimizations();
    setupErrorHandling();
}

// ============================================================================= 
// UI ENHANCEMENT FUNCTIONS
// ============================================================================= 

/**
 * Setup hover effects for desktop devices
 */
function setupHoverEffects() {
    if ('ontouchstart' in window) return; // Skip for touch devices
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Setup responsive sidebar positioning
 */
function setupResponsiveHandling() {
    function handleSidebarPositioning() {
        const stickyElement = document.querySelector('.sticky-element');
        if (!stickyElement) return;
        
        if (window.innerWidth <= 1439) {
            stickyElement.style.position = 'static';
            stickyElement.style.top = 'auto';
        } else {
            stickyElement.style.position = 'sticky';
            stickyElement.style.top = '20px';
        }
    }
    
    // Initial setup
    handleSidebarPositioning();
    
    // Handle window resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleSidebarPositioning, 100);
    });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            handleSidebarPositioning();
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });
}

/**
 * Setup touch optimizations for mobile devices
 */
function setupTouchOptimizations() {
    if (!('ontouchstart' in window)) return; // Skip for non-touch devices
    
    // Add touch feedback to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
    
    // Add passive listeners for better performance
    document.addEventListener('touchstart', function() {}, { passive: true });
    document.addEventListener('touchmove', function() {}, { passive: true });
}

/**
 * Setup mobile scrolling enhancements
 */
function setupMobileScrolling() {
    function scrollToSidebarOnMobile() {
        if (window.innerWidth > 768) return;
        
        const sidebar = document.querySelector('.bundle-sidebar');
        if (sidebar) {
            setTimeout(() => {
                sidebar.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 300);
        }
    }
    
    // Override the toggleProduct function to include mobile scroll
    const originalToggleProduct = window.toggleProduct;
    window.toggleProduct = function(productId) {
        const wasEmpty = bundleBuilder.state.selectedProducts.size === 0;
        originalToggleProduct(productId);
        
        // Scroll to sidebar on mobile when first product is added
        if (wasEmpty && bundleBuilder.state.selectedProducts.size === 1) {
            scrollToSidebarOnMobile();
        }
    };
}

/**
 * Setup image optimizations for better performance
 */
function setupImageOptimizations() {
    if (!('IntersectionObserver' in window) || window.innerWidth > 768) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    // Setup lazy loading for mobile devices
    document.querySelectorAll('.product-image').forEach(img => {
        if (img.src) {
            img.dataset.src = img.src;
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzI2IiBoZWlnaHQ9IjMyNiIgZmlsbD0iI0VCRUJFQiIgdmlld0JveD0iMCAwIDMyNiAzMjYiLz4=';
            imageObserver.observe(img);
        }
    });
}

/**
 * Setup keyboard navigation for accessibility
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const activeElement = document.activeElement;
            if (activeElement.classList.contains('add-to-bundle-btn')) {
                e.preventDefault();
                activeElement.click();
            }
        }
    });
}

/**
 * Setup performance optimizations for mobile
 */
function setupPerformanceOptimizations() {
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-optimized');
    }
}

/**
 * Setup error handling and fallbacks
 */
function setupErrorHandling() {
    const images = document.querySelectorAll('.product-image');
    let loadedImages = 0;
    
    const handleImageLoad = () => {
        loadedImages++;
        if (loadedImages === images.length) {
            document.body.classList.add('images-loaded');
        }
    };
    
    images.forEach(img => {
        if (img.complete) {
            handleImageLoad();
        } else {
            img.addEventListener('load', handleImageLoad);
            img.addEventListener('error', function() {
                console.warn('Failed to load image:', this.src);
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzI2IiBoZWlnaHQ9IjMyNiIgZmlsbD0iI0VCRUJFQiIgdmlld0JveD0iMCAwIDMyNiAzMjYiLz4=';
                handleImageLoad();
            });
        }
    });
    
    if (loadedImages === images.length) {
        document.body.classList.add('images-loaded');
    }
}