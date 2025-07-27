// Standalone Node.js Express endpoint for tracking product views
// Can be used independently or added to existing Express app

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// Initialize Express app (if using standalone)
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Track view endpoint
app.post('/track-view', async (req, res) => {
  try {
    const { user_email, product_id, product_name, timestamp } = req.body;

    // Validate required fields
    if (!product_id || !product_name) {
      return res.status(400).json({
        error: 'Missing required fields: product_id and product_name are required'
      });
    }

    // Validate product_id format
    if (typeof product_id !== 'string' || product_id.trim() === '') {
      return res.status(400).json({
        error: 'Invalid product_id: must be a non-empty string'
      });
    }

    // Validate product_name format
    if (typeof product_name !== 'string' || product_name.trim() === '') {
      return res.status(400).json({
        error: 'Invalid product_name: must be a non-empty string'
      });
    }

    // Validate timestamp if provided
    let validatedTimestamp = new Date().toISOString();
    if (timestamp) {
      const parsedTimestamp = new Date(timestamp);
      if (isNaN(parsedTimestamp.getTime())) {
        return res.status(400).json({
          error: 'Invalid timestamp format. Use ISO 8601 format (e.g., 2024-01-01T12:00:00.000Z)'
        });
      }
      validatedTimestamp = parsedTimestamp.toISOString();
    }

    // Get or create user record if email is provided
    let userId = null;
    if (user_email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user_email)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      try {
        // Try to find existing user
        const { data: existingUser, error: userQueryError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user_email)
          .single();

        if (userQueryError && userQueryError.code !== 'PGRST116') {
          console.error('Error querying user:', userQueryError);
        }

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Create new user record
          const { data: newUser, error: userCreateError } = await supabase
            .from('users')
            .insert({
              email: user_email,
              full_name: null
            })
            .select('id')
            .single();

          if (userCreateError) {
            console.error('Error creating user:', userCreateError);
          } else {
            userId = newUser.id;
          }
        }
      } catch (error) {
        console.error('Error handling user:', error);
      }
    }

    // Get or create product record
    try {
      const { data: existingProduct, error: productQueryError } = await supabase
        .from('products')
        .select('id')
        .eq('id', product_id)
        .single();

      if (productQueryError && productQueryError.code !== 'PGRST116') {
        console.error('Error querying product:', productQueryError);
      }

      if (!existingProduct) {
        // Create product record if it doesn't exist
        const { error: productCreateError } = await supabase
          .from('products')
          .insert({
            id: product_id,
            name: product_name,
            description: null,
            price: null,
            category: null
          });

        if (productCreateError) {
          console.error('Error creating product:', productCreateError);
        }
      }
    } catch (error) {
      console.error('Error handling product:', error);
    }

    // Insert product view record
    const { data: viewRecord, error: viewError } = await supabase
      .from('products_viewed')
      .insert({
        user_id: userId,
        product_id: product_id,
        product_name: product_name,
        timestamp: validatedTimestamp
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

    // Log successful tracking
    console.log('Product view tracked successfully:', {
      view_id: viewRecord.id,
      user_email,
      product_id,
      product_name,
      timestamp: validatedTimestamp
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Product view tracked successfully',
      data: {
        view_id: viewRecord.id,
        user_id: userId,
        product_id: product_id,
        timestamp: validatedTimestamp
      }
    });

  } catch (error) {
    console.error('Error in track-view endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoint: '/track-view'
  });
});

// Export the handler function for use in other Express apps
const trackViewHandler = async (req, res) => {
  // This is the same logic as above, but exported as a function
  // for use in other Express applications
  try {
    const { user_email, product_id, product_name, timestamp } = req.body;

    // Validate required fields
    if (!product_id || !product_name) {
      return res.status(400).json({
        error: 'Missing required fields: product_id and product_name are required'
      });
    }

    // Validate product_id format
    if (typeof product_id !== 'string' || product_id.trim() === '') {
      return res.status(400).json({
        error: 'Invalid product_id: must be a non-empty string'
      });
    }

    // Validate product_name format
    if (typeof product_name !== 'string' || product_name.trim() === '') {
      return res.status(400).json({
        error: 'Invalid product_name: must be a non-empty string'
      });
    }

    // Validate timestamp if provided
    let validatedTimestamp = new Date().toISOString();
    if (timestamp) {
      const parsedTimestamp = new Date(timestamp);
      if (isNaN(parsedTimestamp.getTime())) {
        return res.status(400).json({
          error: 'Invalid timestamp format. Use ISO 8601 format (e.g., 2024-01-01T12:00:00.000Z)'
        });
      }
      validatedTimestamp = parsedTimestamp.toISOString();
    }

    // Get or create user record if email is provided
    let userId = null;
    if (user_email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user_email)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      try {
        // Try to find existing user
        const { data: existingUser, error: userQueryError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user_email)
          .single();

        if (userQueryError && userQueryError.code !== 'PGRST116') {
          console.error('Error querying user:', userQueryError);
        }

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Create new user record
          const { data: newUser, error: userCreateError } = await supabase
            .from('users')
            .insert({
              email: user_email,
              full_name: null
            })
            .select('id')
            .single();

          if (userCreateError) {
            console.error('Error creating user:', userCreateError);
          } else {
            userId = newUser.id;
          }
        }
      } catch (error) {
        console.error('Error handling user:', error);
      }
    }

    // Get or create product record
    try {
      const { data: existingProduct, error: productQueryError } = await supabase
        .from('products')
        .select('id')
        .eq('id', product_id)
        .single();

      if (productQueryError && productQueryError.code !== 'PGRST116') {
        console.error('Error querying product:', productQueryError);
      }

      if (!existingProduct) {
        // Create product record if it doesn't exist
        const { error: productCreateError } = await supabase
          .from('products')
          .insert({
            id: product_id,
            name: product_name,
            description: null,
            price: null,
            category: null
          });

        if (productCreateError) {
          console.error('Error creating product:', productCreateError);
        }
      }
    } catch (error) {
      console.error('Error handling product:', error);
    }

    // Insert product view record
    const { data: viewRecord, error: viewError } = await supabase
      .from('products_viewed')
      .insert({
        user_id: userId,
        product_id: product_id,
        product_name: product_name,
        timestamp: validatedTimestamp
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

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Product view tracked successfully',
      data: {
        view_id: viewRecord.id,
        user_id: userId,
        product_id: product_id,
        timestamp: validatedTimestamp
      }
    });

  } catch (error) {
    console.error('Error in track-view handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Start server if running standalone
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Track view server running on port ${PORT}`);
    console.log(`Endpoint: POST http://localhost:${PORT}/track-view`);
    console.log(`Health check: GET http://localhost:${PORT}/health`);
  });
}

module.exports = {
  app,
  trackViewHandler
}; 