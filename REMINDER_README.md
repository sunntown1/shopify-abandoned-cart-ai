# SMS Reminder Message Generator

A Node.js system that uses OpenAI to generate personalized SMS reminder messages for abandoned cart scenarios.

## 📁 Files

**E.g., the reminder system includes:**

- **`generate-reminder-message.js`** - Core message generation functions
- **`reminder-usage-example.js`** - Integration examples with Supabase
- **`package-reminder.json`** - Dependencies and scripts
- **`REMINDER_README.md`** - This documentation

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install openai @supabase/supabase-js
```

### 2. Set Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SHOP_URL=https://your-shop.com
```

### 3. Basic Usage

```javascript
const { generateReminderMessage } = require('./generate-reminder-message');

// Generate a simple reminder
const message = await generateReminderMessage(
  'Sarah Johnson',
  'Wireless Headphones',
  'medium',
  'https://shop.com/checkout/abc123'
);

console.log(message);
// Output: "Hey Sarah! Your Wireless Headphones are still waiting for you — but we're running low. Complete your checkout now: https://shop.com/checkout/abc123"
```

## 📡 API Reference

### `generateReminderMessage(userName, productName, urgencyLevel, checkoutLink)`

**E.g., generates personalized SMS messages:**

```javascript
const message = await generateReminderMessage(
  'Sarah',           // Customer name
  'Wireless Headphones', // Product name
  'medium',          // Urgency: 'low', 'medium', 'high'
  'https://shop.com/checkout/abc123' // Optional checkout link
);
```

**Parameters:**
- `userName` (string, required) - Customer's name
- `productName` (string, required) - Product name
- `urgencyLevel` (string, optional) - 'low', 'medium', or 'high'
- `checkoutLink` (string, optional) - Checkout URL

**Returns:** Promise<string> - Generated SMS message

### `generateMessageVariations(userName, productName, urgencyLevel, checkoutLink, variations)`

**E.g., generates multiple variations for A/B testing:**

```javascript
const variations = await generateMessageVariations(
  'Sarah',
  'Wireless Headphones',
  'medium',
  'https://shop.com/checkout/abc123',
  3 // Number of variations
);

// Returns array of different message variations
```

### `generateMessageFromTemplate(userName, productName, template, checkoutLink)`

**E.g., generates message from custom template:**

```javascript
const message = await generateMessageFromTemplate(
  'Sarah',
  'Wireless Headphones',
  'Hey {name}! Your {product} is calling your name. Don\'t miss out — complete your purchase now: {link}',
  'https://shop.com/checkout/abc123'
);
```

## 🔧 Integration Examples

### Single Product Reminder

**E.g., send reminder for one product:**

```javascript
const { sendAbandonedCartReminder } = require('./reminder-usage-example');

const result = await sendAbandonedCartReminder(
  'customer@example.com',
  'prod_12345',
  'medium'
);

console.log(result.message);
// Logs to messages_sent table automatically
```

### Multi-Product Reminder

**E.g., send reminder for multiple products:**

```javascript
const { sendMultiProductReminder } = require('./reminder-usage-example');

const result = await sendMultiProductReminder(
  'customer@example.com',
  ['prod_12345', 'prod_67890'],
  'low'
);

console.log(result.message);
// Handles multiple products in one message
```

### A/B Testing

**E.g., generate variations for testing:**

```javascript
const { generateABTestVariations } = require('./reminder-usage-example');

const result = await generateABTestVariations(
  'customer@example.com',
  'prod_12345',
  'high',
  3
);

result.variations.forEach((msg, index) => {
  console.log(`Variation ${index + 1}: ${msg}`);
});
```

### Batch Processing

**E.g., process all abandoned carts:**

```javascript
const { processAbandonedCarts } = require('./reminder-usage-example');

const result = await processAbandonedCarts(24, 'medium');
// Processes carts abandoned in last 24 hours

console.log(`Processed ${result.processed} reminders`);
```

## 🎯 Urgency Levels

**E.g., different urgency levels create different tones:**

### Low Urgency
- **Tone:** Friendly, casual, no pressure
- **Example:** "Hey Sarah! Your Wireless Headphones are still in your cart. Ready to complete your purchase?"

### Medium Urgency
- **Tone:** Slightly urgent, mention limited stock
- **Example:** "Hey Sarah! Your Wireless Headphones are still waiting for you — but we're running low. Complete your checkout now: [link]"

### High Urgency
- **Tone:** Urgent, emphasize scarcity, create FOMO
- **Example:** "Sarah! Only 3 Wireless Headphones left! Your cart expires soon — complete checkout now: [link]"

## 📊 Message Examples

**E.g., sample generated messages:**

```javascript
// Low urgency
"Hey Sarah! Your Wireless Headphones are still in your cart. Ready to complete your purchase? https://shop.com/checkout/abc123"

// Medium urgency  
"Hey Sarah! Your Wireless Headphones are still waiting for you — but we're running low. Complete your checkout now: https://shop.com/checkout/abc123"

// High urgency
"Sarah! Only 3 Wireless Headphones left! Your cart expires soon — complete checkout now: https://shop.com/checkout/abc123"
```

## 🔒 Validation

**E.g., the system validates:**

- **Required fields:** userName and productName
- **Urgency level:** Must be 'low', 'medium', or 'high'
- **Message length:** Automatically truncates to 160 characters
- **Input sanitization:** Removes quotes and formatting

## 🚀 Deployment

### Environment Setup

**E.g., required environment variables:**

```env
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SHOP_URL=https://your-shop.com
```

### Testing

**E.g., run the test script:**

```bash
# Set environment variables first
export OPENAI_API_KEY=your_key
export NEXT_PUBLIC_SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key

# Run tests
node generate-reminder-message.js
node reminder-usage-example.js
```

### Integration with SMS Service

**E.g., integrate with Twilio:**

```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(phoneNumber, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
}

// Use in your reminder function
const message = await generateReminderMessage(userName, productName, urgencyLevel);
await sendSMS(user.phone, message);
```

## 📈 Analytics

**E.g., track message performance:**

```sql
-- Message performance by type
SELECT 
  message_type,
  COUNT(*) as sent_count,
  AVG(LENGTH(content)) as avg_length
FROM messages_sent
GROUP BY message_type;

-- User engagement
SELECT 
  u.email,
  COUNT(ms.id) as messages_received,
  COUNT(pv.id) as products_viewed
FROM users u
LEFT JOIN messages_sent ms ON u.id = ms.user_id
LEFT JOIN products_viewed pv ON u.id = pv.user_id
GROUP BY u.id, u.email
ORDER BY messages_received DESC;
```

## 🛠️ Troubleshooting

### Common Issues

**E.g., if messages aren't generating:**

1. **Check OpenAI API key** is valid and has credits
2. **Verify environment variables** are set correctly
3. **Check network connectivity** to OpenAI API
4. **Review input validation** for required fields
5. **Monitor API rate limits** and usage

### Error Handling

**E.g., handle common errors:**

```javascript
try {
  const message = await generateReminderMessage(userName, productName, urgencyLevel);
  console.log('Message generated:', message);
} catch (error) {
  if (error.message.includes('userName and productName are required')) {
    console.error('Missing required parameters');
  } else if (error.message.includes('urgencyLevel must be')) {
    console.error('Invalid urgency level');
  } else {
    console.error('OpenAI API error:', error.message);
  }
}
```

## 🔄 Automation

**E.g., set up automated reminders:**

```javascript
// Cron job to process abandoned carts every hour
const cron = require('node-cron');

cron.schedule('0 * * * *', async () => {
  try {
    const result = await processAbandonedCarts(1, 'medium');
    console.log(`Processed ${result.processed} reminders`);
  } catch (error) {
    console.error('Automated reminder failed:', error);
  }
});
```

## 📞 Support

**E.g., for help:**

1. Check environment variables are set correctly
2. Verify OpenAI API key has sufficient credits
3. Test with the provided example scripts
4. Review the validation rules for your inputs
5. Monitor API usage and rate limits

The SMS reminder system is now ready to generate personalized, AI-powered messages for your e-commerce abandoned cart recovery! 