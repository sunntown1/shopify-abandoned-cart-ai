// Test script for Shopify integration
// Simulates the complete flow: product view → database → AI message → SMS

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { generateReminderMessage } = require('./generate-reminder-message');
const { sendSMS } = require('./send-sms');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Simulate a product view from Shopify
 */
async function simulateProductView(userEmail, productId, productName) {
  try {
    console.log(`🛍️ Simulating product view: ${productName} by ${userEmail}`);
    
    // Get or create user
    let { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', userEmail)
      .single();
    
    if (!user) {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: userEmail,
          full_name: userEmail.split('@')[0] // Use email prefix as name
        })
        .select('id, email, full_name')
        .single();
      
      if (userError) {
        throw new Error(`Failed to create user: ${userError.message}`);
      }
      user = newUser;
      console.log(`✅ Created new user: ${user.email}`);
    }

    // Get or create product
    let { data: product } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();
    
    if (!product) {
      // Create new product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          id: productId,
          name: productName,
          description: `Test product: ${productName}`,
          price: 29.99,
          category: 'Test Category'
        })
        .select('id, name')
        .single();
      
      if (productError) {
        throw new Error(`Failed to create product: ${productError.message}`);
      }
      product = newProduct;
      console.log(`✅ Created new product: ${product.name}`);
    }

    // Log product view
    const { data: viewRecord, error: viewError } = await supabase
      .from('products_viewed')
      .insert({
        user_id: user.id,
        product_id: productId,
        product_name: productName,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (viewError) {
      throw new Error(`Failed to log product view: ${viewError.message}`);
    }

    console.log(`✅ Product view logged: ${productName} viewed by ${userEmail}`);
    return { user, product, viewRecord };
    
  } catch (error) {
    console.error('❌ Error simulating product view:', error);
    throw error;
  }
}

/**
 * Generate and send reminder message
 */
async function generateAndSendReminder(userEmail, productId, productName, urgencyLevel = 'medium') {
  try {
    console.log(`📱 Generating reminder for ${userEmail} - ${productName}`);
    
    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', userEmail)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Generate checkout link
    const checkoutLink = `${process.env.SHOP_URL}/checkout?product=${productId}&user=${user.id}`;
    
    // Generate AI message
    const message = await generateReminderMessage(
      user.full_name || user.email.split('@')[0],
      productName,
      urgencyLevel,
      checkoutLink
    );

    console.log(`📝 Generated message: ${message}`);
    console.log(`📏 Message length: ${message.length} characters`);

    // Log message to database
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
      console.error('❌ Error logging message:', messageError);
    } else {
      console.log(`✅ Message logged to database`);
    }

    // For testing, we'll log the message instead of sending SMS
    console.log(`📤 [TEST MODE] Would send SMS to ${userEmail}: ${message}`);
    
    // Uncomment the line below to actually send SMS (make sure TEST_PHONE_NUMBER is set)
    // await sendSMS(process.env.TEST_PHONE_NUMBER, message);

    return { message, messageRecord };
    
  } catch (error) {
    console.error('❌ Error generating reminder:', error);
    throw error;
  }
}

/**
 * Test the complete flow
 */
async function testCompleteFlow() {
  try {
    console.log('🧪 Testing complete Shopify integration flow...\n');
    
    // Test data
    const testCases = [
      {
        email: 'test1@example.com',
        productId: 'prod_test_1',
        productName: 'Wireless Headphones',
        urgency: 'low'
      },
      {
        email: 'test2@example.com', 
        productId: 'prod_test_2',
        productName: 'Smart Watch',
        urgency: 'medium'
      },
      {
        email: 'test3@example.com',
        productId: 'prod_test_3', 
        productName: 'Limited Edition Sneakers',
        urgency: 'high'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔄 Testing: ${testCase.productName} for ${testCase.email}`);
      
      // Step 1: Simulate product view
      await simulateProductView(testCase.email, testCase.productId, testCase.productName);
      
      // Step 2: Generate and send reminder
      await generateAndSendReminder(testCase.email, testCase.productId, testCase.productName, testCase.urgency);
      
      console.log(`✅ Test completed for ${testCase.email}\n`);
      
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test with your actual Shopify store data
 */
async function testWithRealShopifyData() {
  try {
    console.log('🛒 Testing with real Shopify store data...\n');
    
    // Replace these with actual data from your Shopify store
    const realTestData = [
      {
        email: 'customer@yourdomain.com', // Replace with real customer email
        productId: 'shopify_product_id',   // Replace with real Shopify product ID
        productName: 'Your Actual Product Name', // Replace with real product name
        urgency: 'medium'
      }
    ];

    for (const data of realTestData) {
      console.log(`🔄 Testing real data: ${data.productName} for ${data.email}`);
      
      await simulateProductView(data.email, data.productId, data.productName);
      await generateAndSendReminder(data.email, data.productId, data.productName, data.urgency);
      
      console.log(`✅ Real data test completed\n`);
    }
    
  } catch (error) {
    console.error('❌ Real data test failed:', error);
  }
}

// Export functions for use in other modules
module.exports = {
  simulateProductView,
  generateAndSendReminder,
  testCompleteFlow,
  testWithRealShopifyData
};

// Run tests if this file is executed directly
if (require.main === module) {
  // Check required environment variables
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SHOP_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    process.exit(1);
  }
  
  // Run the test
  testCompleteFlow();
} 