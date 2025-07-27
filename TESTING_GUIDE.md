# Testing Guide for Shopify Abandoned Cart AI System

E.g., here's how to test your complete system with your test Shopify store:

## 🚀 **Quick Start Testing**

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Add Missing Environment Variables**
Add these to your `.env` file:
```env
# Twilio credentials (get from https://console.twilio.com/)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Test phone number for SMS testing
TEST_PHONE_NUMBER=+15551234567
```

### 3. **Test the Complete System**
```bash
# Test the full flow (product view → AI message → SMS)
npm test

# Test SMS sending specifically
npm run test-sms

# Test AI message generation
npm run test-message

# Start the cron job (checks every 10 minutes)
npm start
```

## 🛒 **Testing with Your Shopify Store**

### **Payment Setup Impact**
**E.g., the payment method setup affects testing in these ways:**

- **✅ Product View Tracking:** Works perfectly without payment setup
- **✅ AI Message Generation:** Works without payment setup  
- **✅ SMS Sending:** Works without payment setup
- **❌ Actual Checkout:** Won't work without payment setup (but that's fine for testing)

**The payment setup only affects the final checkout process, not our abandoned cart tracking system.**

### **Step-by-Step Testing**

#### **1. Test Product View Tracking**
```bash
# Run the integration test
node test-shopify-integration.js
```

This will:
- Simulate product views in your database
- Generate AI messages
- Log everything to Supabase
- Show you what SMS would be sent

#### **2. Test with Real Shopify Data**
Edit `test-shopify-integration.js` and replace the test data with your actual Shopify data:

```javascript
const realTestData = [
  {
    email: 'your-customer@example.com',     // Real customer email
    productId: 'shopify_product_123',       // Real Shopify product ID
    productName: 'Your Actual Product',     // Real product name
    urgency: 'medium'
  }
];
```

#### **3. Add Tracking Script to Shopify**
1. **Go to your Shopify admin → Online Store → Themes**
2. **Click "Actions" → "Edit code"**
3. **In `theme.liquid`, add before `</head>`:**

```html
<script>
// Copy the contents of shopify-product-tracking.js here
// Update the CONFIG.BACKEND_URL to point to your deployed backend
</script>
```

#### **4. Test Real Product Views**
1. **Visit your Shopify store**
2. **View a product page**
3. **Check your Supabase dashboard** to see the product view logged
4. **Run the cron job** to see if reminders are generated

## 📊 **What to Expect During Testing**

### **Test Mode (Default)**
- **✅ Messages are generated** using OpenAI
- **✅ Messages are logged** to Supabase
- **✅ Console shows** what SMS would be sent
- **❌ No actual SMS sent** (for safety)

### **Production Mode**
- **✅ Messages are generated** using OpenAI
- **✅ Messages are logged** to Supabase  
- **✅ Actual SMS sent** via Twilio
- **✅ Real customers receive** reminders

## 🔧 **Testing Commands**

```bash
# Test the complete flow
npm test

# Test just SMS sending
npm run test-sms

# Test just AI message generation  
npm run test-message

# Start the cron job (runs every 10 minutes)
npm start

# Test with real Shopify data
node test-shopify-integration.js
```

## 📱 **SMS Testing**

### **Test Mode (Safe)**
```bash
npm run test-sms
```
This will show what SMS would be sent without actually sending it.

### **Real SMS Testing**
1. **Add your phone number to `.env`:**
   ```env
   TEST_PHONE_NUMBER=+15551234567
   ```

2. **Uncomment the SMS line in `test-shopify-integration.js`:**
   ```javascript
   // Change this line:
   // await sendSMS(process.env.TEST_PHONE_NUMBER, message);
   // To this:
   await sendSMS(process.env.TEST_PHONE_NUMBER, message);
   ```

3. **Run the test:**
   ```bash
   npm test
   ```

## 🕐 **Cron Job Testing**

### **Start the Cron Job**
```bash
npm start
```

This will:
- Check for abandoned carts every 10 minutes
- Generate AI messages for users who viewed products 30+ minutes ago
- Log messages to database
- Show what SMS would be sent (in test mode)

### **Manual Testing**
```javascript
const { testAbandonedCartCheck } = require('./abandoned-cart-cron.js');
await testAbandonedCartCheck();
```

## 📈 **Monitoring Your Tests**

### **Check Supabase Dashboard**
1. **Go to your Supabase project**
2. **Check these tables:**
   - `users` - Test users created
   - `products` - Test products created  
   - `products_viewed` - Product view events
   - `messages_sent` - Generated messages

### **Check Console Output**
The tests will show:
- ✅ Product views logged
- ✅ AI messages generated
- ✅ Messages logged to database
- 📤 What SMS would be sent

## 🚨 **Troubleshooting**

### **Common Issues**

**"Missing environment variables"**
- Check your `.env` file has all required variables
- Restart your Node.js server after changing `.env`

**"OpenAI API error"**
- Verify your OpenAI API key is correct
- Check you have credits in your OpenAI account

**"Supabase connection error"**
- Verify your Supabase URL and service role key
- Check your Supabase project is active

**"Twilio SMS error"**
- Verify your Twilio credentials
- Check your Twilio account has credits
- Ensure phone numbers are in E.164 format (+1234567890)

### **Test Mode vs Production Mode**

**Test Mode (Current):**
- Messages logged but not sent
- Safe for testing
- No charges for SMS

**Production Mode:**
- Real SMS sent to customers
- Requires Twilio credits
- Use with caution

## ✅ **Success Indicators**

Your system is working correctly if you see:

1. **Product views logged** in Supabase
2. **AI messages generated** with personalized content
3. **Messages logged** to `messages_sent` table
4. **Console output** showing the complete flow
5. **No errors** in the console

## 🎯 **Next Steps After Testing**

1. **Deploy your backend** to a hosting service
2. **Update Shopify script** with your deployed backend URL
3. **Enable real SMS sending** by uncommenting the SMS line
4. **Monitor performance** in your Supabase dashboard
5. **Adjust timing** of the cron job as needed

---

**E.g., the payment setup won't affect your testing - you can test the entire abandoned cart system without it!** 