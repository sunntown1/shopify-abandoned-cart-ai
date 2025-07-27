// Next.js API route: /api/track-view
// Handles POST requests to track product views in Supabase

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Only POST requests are accepted.' 
    });
  }

  try {
    const { user_email, product_id, product_name, timestamp } = req.body;

    // Validate required fields
    if (!product_id || !product_name) {
      return res.status(400).json({
        error: 'Missing required fields: product_id and product_name are required'
      });
    }

    // Validate product_id format (should be a valid UUID or string)
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
          // PGRST116 is "not found" error, which is expected for new users
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
            // Continue without user_id if user creation fails
          } else {
            userId = newUser.id;
          }
        }
      } catch (error) {
        console.error('Error handling user:', error);
        // Continue without user_id if user handling fails
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
          // Continue even if product creation fails
        }
      }
    } catch (error) {
      console.error('Error handling product:', error);
      // Continue even if product handling fails
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

    // Log successful tracking (optional)
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
} 