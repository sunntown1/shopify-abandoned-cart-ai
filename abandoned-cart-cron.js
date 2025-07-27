// Abandoned Cart Cron Job
// Checks products_viewed table every 10 minutes for abandoned carts
// Sends AI-generated SMS reminders via Twilio

require('dotenv').config();
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { generateReminderMessage } = require('./generate-reminder-message');
const { sendSMS } = require('./send-sms');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Twilio client
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Check for abandoned carts and send SMS reminders
 */
async function checkAbandonedCarts() {
  try {
    console.log('🕐 Checking for abandoned carts...', new Date().toISOString());
    
    // Calculate cutoff time (30 minutes ago)
    const cutoffTime = new Date(Date.now() - (30 * 60 * 1000));
    
    // Get product views from the last 30 minutes
    const { data: recentViews, error: viewsError } = await supabase
      .from('products_viewed')
      .select(`
        id,
        user_id,
        product_id,
        product_name,
        timestamp,
        users!inner(email, full_name)
      `)
      .gte('timestamp', cutoffTime.toISOString())
      .order('timestamp', { ascending: false });

    if (viewsError) {
      console.error('❌ Error fetching recent views:', viewsError);
      return;
    }

    if (!recentViews || recentViews.length === 0) {
      console.log('📭 No recent product views found');
      return;
    }

    console.log(`📊 Found ${recentViews.length} recent product views`);

    // Group views by user
    const userGroups = {};
    recentViews.forEach(view => {
      if (!userGroups[view.user_id]) {
        userGroups[view.user_id] = [];
      }
      userGroups[view.user_id].push(view);
    });

    let processedCount = 0;
    let sentCount = 0;

    // Process each user's abandoned cart
    for (const [userId, views] of Object.entries(userGroups)) {
      try {
        const user = views[0].users;
        
        // Skip if no email (anonymous user)
        if (!user.email) {
          console.log(`⚠️ Skipping user ${userId} - no email`);
          continue;
        }

        // Check if user has made a purchase in the last 30 minutes
        // This is a simplified check - in production you'd check actual orders
        const { data: recentOrders, error: ordersError } = await supabase
          .from('messages_sent')
          .select('id')
          .eq('user_id', userId)
          .eq('message_type', 'sms')
          .gte('sent_at', cutoffTime.toISOString());

        if (ordersError) {
          console.error(`❌ Error checking orders for user ${userId}:`, ordersError);
          continue;
        }

        // If user already received a reminder in the last 30 minutes, skip
        if (recentOrders && recentOrders.length > 0) {
          console.log(`⏭️ Skipping user ${user.email} - already sent reminder recently`);
          continue;
        }

        processedCount++;

        // Generate checkout link
        const productIds = [...new Set(views.map(v => v.product_id))];
        const checkoutLink = `${process.env.SHOP_URL}/checkout?products=${productIds.join(',')}&user=${userId}`;

        // Determine urgency based on time since view
        const oldestView = views.reduce((oldest, view) => 
          new Date(view.timestamp) < new Date(oldest.timestamp) ? view : oldest
        );
        const minutesSinceView = Math.floor((Date.now() - new Date(oldestView.timestamp)) / (1000 * 60));
        
        let urgencyLevel = 'low';
        if (minutesSinceView > 20) urgencyLevel = 'high';
        else if (minutesSinceView > 15) urgencyLevel = 'medium';

        // Generate AI message
        const productNames = [...new Set(views.map(v => v.product_name))].join(', ');
        const message = await generateReminderMessage(
          user.full_name || user.email.split('@')[0],
          productNames,
          urgencyLevel,
          checkoutLink
        );

        console.log(`📱 Generated message for ${user.email}:`, message);

        // For testing, we'll log the message instead of sending SMS
        // In production, you would send the actual SMS here
        console.log(`📤 [TEST MODE] Would send SMS to ${user.email}: ${message}`);

        // Log the message to messages_sent table
        const { data: messageRecord, error: messageError } = await supabase
          .from('messages_sent')
          .insert({
            user_id: userId,
            message_type: 'sms',
            content: message,
            sent_at: new Date().toISOString()
          })
          .select()
          .single();

        if (messageError) {
          console.error(`❌ Error logging message for user ${userId}:`, messageError);
        } else {
          sentCount++;
          console.log(`✅ Message logged for user ${user.email}`);
        }

        // Add a small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing user ${userId}:`, error);
      }
    }

    console.log(`🎯 Processed ${processedCount} users, sent ${sentCount} reminders`);

  } catch (error) {
    console.error('❌ Error in abandoned cart check:', error);
  }
}

/**
 * Send actual SMS (uncomment to enable real SMS sending)
 */
async function sendActualSMS(phoneNumber, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: phoneNumber
    });
    console.log('✅ SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('❌ SMS sending failed:', error);
    throw error;
  }
}

/**
 * Start the cron job
 */
function startCronJob() {
  console.log('🚀 Starting abandoned cart cron job...');
  console.log('⏰ Will check every 10 minutes for abandoned carts');
  console.log('📱 SMS sending is in TEST MODE (messages logged but not sent)');
  
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', checkAbandonedCarts);
  
  // Also run immediately on startup
  checkAbandonedCarts();
}

/**
 * Test function to manually trigger abandoned cart check
 */
async function testAbandonedCartCheck() {
  console.log('🧪 Testing abandoned cart check...');
  await checkAbandonedCarts();
}

// Export functions for testing
module.exports = {
  checkAbandonedCarts,
  sendActualSMS,
  startCronJob,
  testAbandonedCartCheck
};

// Start the cron job if this file is run directly
if (require.main === module) {
  // Check required environment variables
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'SHOP_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    process.exit(1);
  }
  
  startCronJob();
} 