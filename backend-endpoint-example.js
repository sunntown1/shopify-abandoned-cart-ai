// Backend Endpoint Example for Product View Tracking
// This is an example using Express.js and Supabase

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Product view tracking endpoint
app.post('/api/track-product-view', async (req, res) => {
    try {
        const { user_email, product_id, product_name, timestamp, page_url, referrer, user_agent } = req.body;
        
        // Validate required fields
        if (!product_id || !product_name) {
            return res.status(400).json({ 
                error: 'Missing required fields: product_id and product_name' 
            });
        }
        
        // Get or create user record
        let userId = null;
        if (user_email) {
            // Try to find existing user
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', user_email)
                .single();
            
            if (existingUser) {
                userId = existingUser.id;
            } else {
                // Create new user record
                const { data: newUser, error: userError } = await supabase
                    .from('users')
                    .insert({
                        email: user_email,
                        full_name: null // You can extract from email or leave null
                    })
                    .select('id')
                    .single();
                
                if (userError) {
                    console.error('Error creating user:', userError);
                } else {
                    userId = newUser.id;
                }
            }
        }
        
        // Get or create product record
        let productRecord = null;
        const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('id', product_id)
            .single();
        
        if (!existingProduct) {
            // Create product record if it doesn't exist
            const { data: newProduct, error: productError } = await supabase
                .from('products')
                .insert({
                    id: product_id,
                    name: product_name,
                    description: null,
                    price: null,
                    category: null
                })
                .select('id')
                .single();
            
            if (productError) {
                console.error('Error creating product:', productError);
            } else {
                productRecord = newProduct;
            }
        } else {
            productRecord = existingProduct;
        }
        
        // Insert product view record
        const { data: viewRecord, error: viewError } = await supabase
            .from('products_viewed')
            .insert({
                user_id: userId,
                product_id: product_id,
                product_name: product_name,
                timestamp: timestamp || new Date().toISOString()
            })
            .select()
            .single();
        
        if (viewError) {
            console.error('Error inserting product view:', viewError);
            return res.status(500).json({ 
                error: 'Failed to track product view',
                details: viewError.message 
            });
        }
        
        // Log additional analytics data (optional)
        console.log('Product view tracked:', {
            user_email,
            product_id,
            product_name,
            timestamp,
            page_url,
            referrer
        });
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Product view tracked successfully',
            data: {
                view_id: viewRecord.id,
                user_id: userId,
                product_id: product_id
            }
        });
        
    } catch (error) {
        console.error('Error in track-product-view endpoint:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Analytics endpoints (optional)
app.get('/api/analytics/product-views', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products_viewed')
            .select(`
                product_name,
                timestamp,
                users!inner(email)
            `)
            .order('timestamp', { ascending: false })
            .limit(100);
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 