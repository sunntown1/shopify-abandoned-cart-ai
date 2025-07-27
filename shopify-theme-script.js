// Shopify Product Tracking Script
// Add this to your Shopify theme's theme.liquid file before </head>

<script>
(function() {
    'use strict';
    
    // Configuration - UPDATE THESE VALUES
    const CONFIG = {
        // Your backend endpoint URL (update this to your deployed backend)
        BACKEND_URL: 'https://your-backend-domain.com/api/track-view',
        
        // Optional: Add any additional headers you need
        HEADERS: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer your-api-key' // Uncomment if you need auth
        },
        
        // Debug mode - set to false in production
        DEBUG: true
    };
    
    // Helper function to get current user email (if available)
    function getUserEmail() {
        // Try to get email from Shopify's customer object
        if (typeof window.Shopify !== 'undefined' && window.Shopify.customer) {
            return window.Shopify.customer.email;
        }
        
        // Try to get from customer data in meta tags
        const customerMeta = document.querySelector('meta[name="customer-email"]');
        if (customerMeta) {
            return customerMeta.getAttribute('content');
        }
        
        // Try to get from localStorage if you store it there
        const storedEmail = localStorage.getItem('customer_email');
        if (storedEmail) {
            return storedEmail;
        }
        
        // Return null if no email found
        return null;
    }
    
    // Helper function to get product data from the page
    function getProductData() {
        // Try to get product data from Shopify's product object
        if (typeof window.Shopify !== 'undefined' && window.Shopify.product) {
            return {
                product_id: window.Shopify.product.id,
                product_name: window.Shopify.product.title
            };
        }
        
        // Fallback: Try to get from meta tags
        const productIdMeta = document.querySelector('meta[name="product-id"]');
        const productTitleMeta = document.querySelector('meta[name="product-title"]');
        
        if (productIdMeta && productTitleMeta) {
            return {
                product_id: productIdMeta.getAttribute('content'),
                product_name: productTitleMeta.getAttribute('content')
            };
        }
        
        // Fallback: Try to get from URL parameters and page title
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id') || urlParams.get('product_id');
        
        if (productId) {
            return {
                product_id: productId,
                product_name: document.title.replace(' - ', ' | ').split(' | ')[0] || document.title
            };
        }
        
        // Last resort: Try to extract from page content
        const productTitle = document.querySelector('.product-title, h1, .product__title');
        if (productTitle) {
            return {
                product_id: window.location.pathname.split('/').pop() || 'unknown',
                product_name: productTitle.textContent.trim()
            };
        }
        
        return null;
    }
    
    // Helper function to log debug messages
    function log(message) {
        if (CONFIG.DEBUG) {
            console.log('[Product Tracking]:', message);
        }
    }
    
    // Main function to track product view
    async function trackProductView() {
        try {
            // Check if we're on a product page
            if (!window.location.pathname.includes('/products/')) {
                log('Not on a product page, skipping tracking');
                return;
            }
            
            // Get product data
            const productData = getProductData();
            if (!productData) {
                log('Could not extract product data');
                return;
            }
            
            // Get user email
            const userEmail = getUserEmail();
            
            // Prepare tracking data
            const trackingData = {
                user_email: userEmail,
                product_id: productData.product_id,
                product_name: productData.product_name,
                timestamp: new Date().toISOString(),
                // Additional useful data
                page_url: window.location.href,
                referrer: document.referrer,
                user_agent: navigator.userAgent
            };
            
            log('Tracking product view:', trackingData);
            
            // Send POST request to backend
            const response = await fetch(CONFIG.BACKEND_URL, {
                method: 'POST',
                headers: CONFIG.HEADERS,
                body: JSON.stringify(trackingData)
            });
            
            if (response.ok) {
                log('Product view tracked successfully');
            } else {
                log('Failed to track product view:', response.status, response.statusText);
            }
            
        } catch (error) {
            log('Error tracking product view:', error);
        }
    }
    
    // Function to debounce tracking calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Debounced version of track function
    const debouncedTrack = debounce(trackProductView, 1000);
    
    // Initialize tracking when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', debouncedTrack);
    } else {
        debouncedTrack();
    }
    
    // Also track on page visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            debouncedTrack();
        }
    });
    
    // Track on history changes (for SPA-like behavior)
    let currentUrl = window.location.href;
    const observer = new MutationObserver(function() {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            setTimeout(debouncedTrack, 100); // Small delay to ensure DOM is updated
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expose tracking function globally for manual calls
    window.trackProductView = trackProductView;
    
    log('Product tracking script loaded');
    
})();
</script> 