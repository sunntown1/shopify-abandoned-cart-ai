// Usage example for SMS reminder message generation
// Shows how to integrate with tracking system and Supabase

const { generateReminderMessage, generateMessageVariations } = require('./generate-reminder-message');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Generate and send reminder message for abandoned cart
 * @param {string} userEmail - Customer's email
 * @param {string} productId - Product ID
 * @param {string} urgencyLevel - 'low', 'medium', or 'high'
 * @returns {Promise<Object>} Result of the operation
 */
async function sendAbandonedCartReminder(userEmail, productId, urgencyLevel = 'medium') {
  try {
    // Get user and product data from Supabase
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', userEmail)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    const { data: product } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (!product) {
      throw new Error('Product not found');
    }

    // Generate checkout link (you can customize this)
    const checkoutLink = `${process.env.SHOP_URL}/checkout?product=${productId}&user=${user.id}`;

    // Generate personalized message
    const message = await generateReminderMessage(
      user.full_name || user.email.split('@')[0], // Use name or email prefix
      product.name,
      urgencyLevel,
      checkoutLink
    );

    // Log the message to messages_sent table
    const { data: messageRecord, error: messageError } = await supabase
      .from('messages_sent')
      .insert({
        user_id: user.id,
        message_type: 'sms',
        content: message,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error logging message:', messageError);
    }

    // Here you would integrate with your SMS service (Twilio, etc.)
    // await sendSMS(user.phone, message);

    return {
      success: true,
      message: message,
      user_id: user.id,
      product_id: productId,
      message_id: messageRecord?.id
    };

  } catch (error) {
    console.error('Error sending abandoned cart reminder:', error);
    throw error;
  }
}

/**
 * Generate reminder for multiple products in cart
 * @param {string} userEmail - Customer's email
 * @param {string[]} productIds - Array of product IDs
 * @param {string} urgencyLevel - 'low', 'medium', or 'high'
 * @returns {Promise<Object>} Result of the operation
 */
async function sendMultiProductReminder(userEmail, productIds, urgencyLevel = 'medium') {
  try {
    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', userEmail)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Get all products
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    if (!products || products.length === 0) {
      throw new Error('No products found');
    }

    // Create product list for message
    const productNames = products.map(p => p.name).join(', ');
    const checkoutLink = `${process.env.SHOP_URL}/checkout?products=${productIds.join(',')}&user=${user.id}`;

    // Generate message for multiple products
    const message = await generateReminderMessage(
      user.full_name || user.email.split('@')[0],
      productNames,
      urgencyLevel,
      checkoutLink
    );

    // Log the message
    const { data: messageRecord, error: messageError } = await supabase
      .from('messages_sent')
      .insert({
        user_id: user.id,
        message_type: 'sms',
        content: message,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error logging message:', messageError);
    }

    return {
      success: true,
      message: message,
      user_id: user.id,
      product_ids: productIds,
      message_id: messageRecord?.id
    };

  } catch (error) {
    console.error('Error sending multi-product reminder:', error);
    throw error;
  }
}

/**
 * Generate A/B test variations for a reminder
 * @param {string} userEmail - Customer's email
 * @param {string} productId - Product ID
 * @param {string} urgencyLevel - 'low', 'medium', or 'high'
 * @param {number} variations - Number of variations to generate
 * @returns {Promise<Object>} Result with multiple message variations
 */
async function generateABTestVariations(userEmail, productId, urgencyLevel = 'medium', variations = 3) {
  try {
    // Get user and product data
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', userEmail)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    const { data: product } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (!product) {
      throw new Error('Product not found');
    }

    const checkoutLink = `${process.env.SHOP_URL}/checkout?product=${productId}&user=${user.id}`;

    // Generate variations
    const messageVariations = await generateMessageVariations(
      user.full_name || user.email.split('@')[0],
      product.name,
      urgencyLevel,
      checkoutLink,
      variations
    );

    return {
      success: true,
      variations: messageVariations,
      user_id: user.id,
      product_id: productId,
      urgency_level: urgencyLevel
    };

  } catch (error) {
    console.error('Error generating A/B test variations:', error);
    throw error;
  }
}

/**
 * Process abandoned carts and send reminders
 * @param {number} hoursSinceAbandoned - Hours since cart was abandoned
 * @param {string} urgencyLevel - 'low', 'medium', or 'high'
 * @returns {Promise<Object>} Result of the operation
 */
async function processAbandonedCarts(hoursSinceAbandoned = 24, urgencyLevel = 'medium') {
  try {
    // Get abandoned cart data (this is a simplified example)
    // In a real implementation, you'd query your cart/order system
    const cutoffTime = new Date(Date.now() - (hoursSinceAbandoned * 60 * 60 * 1000));
    
    // Example: Get recent product views that haven't resulted in purchases
    const { data: abandonedViews, error } = await supabase
      .from('products_viewed')
      .select(`
        user_id,
        product_id,
        product_name,
        timestamp,
        users!inner(email, full_name)
      `)
      .gte('timestamp', cutoffTime.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    const results = [];
    
    // Group by user and send reminders
    const userGroups = {};
    abandonedViews.forEach(view => {
      if (!userGroups[view.user_id]) {
        userGroups[view.user_id] = [];
      }
      userGroups[view.user_id].push(view);
    });

    for (const [userId, views] of Object.entries(userGroups)) {
      try {
        const user = views[0].users;
        const productIds = [...new Set(views.map(v => v.product_id))];
        
        if (productIds.length === 1) {
          // Single product reminder
          const result = await sendAbandonedCartReminder(
            user.email,
            productIds[0],
            urgencyLevel
          );
          results.push(result);
        } else {
          // Multi-product reminder
          const result = await sendMultiProductReminder(
            user.email,
            productIds,
            urgencyLevel
          );
          results.push(result);
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        results.push({ success: false, user_id: userId, error: error.message });
      }
    }

    return {
      success: true,
      processed: results.length,
      results: results
    };

  } catch (error) {
    console.error('Error processing abandoned carts:', error);
    throw error;
  }
}

// Example usage
async function exampleUsage() {
  try {
    console.log('📱 SMS Reminder Generation Examples\n');

    // Example 1: Single product reminder
    console.log('1️⃣ Single Product Reminder:');
    const singleResult = await sendAbandonedCartReminder(
      'customer@example.com',
      'prod_12345',
      'medium'
    );
    console.log('Message:', singleResult.message);
    console.log('Length:', singleResult.message.length, 'characters\n');

    // Example 2: A/B test variations
    console.log('2️⃣ A/B Test Variations:');
    const abTestResult = await generateABTestVariations(
      'customer@example.com',
      'prod_12345',
      'high',
      3
    );
    abTestResult.variations.forEach((msg, index) => {
      console.log(`Variation ${index + 1}: ${msg}`);
    });
    console.log();

    // Example 3: Multi-product reminder
    console.log('3️⃣ Multi-Product Reminder:');
    const multiResult = await sendMultiProductReminder(
      'customer@example.com',
      ['prod_12345', 'prod_67890'],
      'low'
    );
    console.log('Message:', multiResult.message);
    console.log('Length:', multiResult.message.length, 'characters\n');

    // Example 4: Process abandoned carts
    console.log('4️⃣ Processing Abandoned Carts:');
    const abandonedResult = await processAbandonedCarts(2, 'medium');
    console.log(`Processed ${abandonedResult.processed} reminders`);

  } catch (error) {
    console.error('❌ Example failed:', error.message);
  }
}

// Export functions for use in other modules
module.exports = {
  sendAbandonedCartReminder,
  sendMultiProductReminder,
  generateABTestVariations,
  processAbandonedCarts,
  exampleUsage
};

// Run example if this file is executed directly
if (require.main === module) {
  // Check required environment variables
  const requiredEnvVars = ['OPENAI_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    process.exit(1);
  }
  
  exampleUsage();
} 