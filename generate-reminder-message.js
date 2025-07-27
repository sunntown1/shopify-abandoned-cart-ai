// Node.js function to generate personalized SMS reminder messages using OpenAI
// Generates abandoned cart reminders with different urgency levels

require('dotenv').config();
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a personalized SMS reminder message using OpenAI
 * @param {string} userName - The customer's name
 * @param {string} productName - The name of the product in cart
 * @param {string} urgencyLevel - 'low', 'medium', or 'high'
 * @param {string} checkoutLink - Optional checkout link to include
 * @returns {Promise<string>} The generated SMS message
 */
async function generateReminderMessage(userName, productName, urgencyLevel = 'medium', checkoutLink = null) {
  try {
    // Validate inputs
    if (!userName || !productName) {
      throw new Error('userName and productName are required');
    }

    if (!['low', 'medium', 'high'].includes(urgencyLevel)) {
      throw new Error('urgencyLevel must be "low", "medium", or "high"');
    }

    // Define urgency-specific prompts
    const urgencyPrompts = {
      low: "gentle and friendly reminder",
      medium: "moderate urgency with a sense of limited availability",
      high: "high urgency with scarcity messaging and time pressure"
    };

    // Define urgency-specific tone and messaging
    const urgencyTones = {
      low: "friendly, casual, no pressure",
      medium: "slightly urgent, mention limited stock or time",
      high: "urgent, emphasize scarcity, create FOMO"
    };

    // Create the prompt for OpenAI
    const prompt = `Generate a short, personalized SMS message for an abandoned cart reminder. 

Customer Name: ${userName}
Product: ${productName}
Urgency Level: ${urgencyLevel} (${urgencyPrompts[urgencyLevel]})
Tone: ${urgencyTones[urgencyLevel]}

Requirements:
- Keep it under 160 characters for SMS
- Include the customer's name
- Mention the specific product
- Use the appropriate urgency level
- Make it personal and engaging
- Include a call-to-action
${checkoutLink ? `- Include this checkout link: ${checkoutLink}` : '- Include a generic checkout link'}
- Don't use quotes around the message
- Don't include "SMS:" or any labels

Example format:
Hey Sarah! Your [productName] is still waiting for you — but we're running low. Complete your checkout now: [link]

Generate the message:`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates personalized SMS messages for e-commerce abandoned cart reminders. Keep messages concise, friendly, and under 160 characters."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    // Extract and clean the generated message
    let message = completion.choices[0].message.content.trim();
    
    // Remove any quotes or formatting
    message = message.replace(/^["']|["']$/g, '');
    
    // Ensure it's under 160 characters
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }

    return message;

  } catch (error) {
    console.error('Error generating reminder message:', error);
    throw error;
  }
}

/**
 * Generates multiple message variations for A/B testing
 * @param {string} userName - The customer's name
 * @param {string} productName - The name of the product in cart
 * @param {string} urgencyLevel - 'low', 'medium', or 'high'
 * @param {string} checkoutLink - Optional checkout link to include
 * @param {number} variations - Number of variations to generate (default: 3)
 * @returns {Promise<string[]>} Array of generated messages
 */
async function generateMessageVariations(userName, productName, urgencyLevel = 'medium', checkoutLink = null, variations = 3) {
  try {
    const messages = [];
    
    for (let i = 0; i < variations; i++) {
      const message = await generateReminderMessage(userName, productName, urgencyLevel, checkoutLink);
      messages.push(message);
    }
    
    return messages;
  } catch (error) {
    console.error('Error generating message variations:', error);
    throw error;
  }
}

/**
 * Generates a message with specific template and fills in variables
 * @param {string} userName - The customer's name
 * @param {string} productName - The name of the product in cart
 * @param {string} template - Message template with placeholders
 * @param {string} checkoutLink - Optional checkout link to include
 * @returns {Promise<string>} The generated message
 */
async function generateMessageFromTemplate(userName, productName, template, checkoutLink = null) {
  try {
    const prompt = `Generate a personalized SMS message based on this template:

Template: ${template}
Customer Name: ${userName}
Product: ${productName}
${checkoutLink ? `Checkout Link: ${checkoutLink}` : ''}

Requirements:
- Replace any placeholders with appropriate content
- Keep it under 160 characters
- Make it personal and engaging
- Don't use quotes around the message

Generate the message:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates personalized SMS messages for e-commerce. Fill in templates with appropriate content while keeping messages concise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    let message = completion.choices[0].message.content.trim();
    message = message.replace(/^["']|["']$/g, '');
    
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }

    return message;

  } catch (error) {
    console.error('Error generating message from template:', error);
    throw error;
  }
}

// Example usage and testing
async function testMessageGeneration() {
  try {
    console.log('🧪 Testing Message Generation...\n');

    // Test different urgency levels
    const testCases = [
      {
        name: 'Sarah Johnson',
        product: 'Wireless Headphones',
        urgency: 'low',
        link: 'https://shop.com/checkout/abc123'
      },
      {
        name: 'Mike Chen',
        product: 'Smart Watch',
        urgency: 'medium',
        link: 'https://shop.com/checkout/def456'
      },
      {
        name: 'Emma Davis',
        product: 'Limited Edition Sneakers',
        urgency: 'high',
        link: 'https://shop.com/checkout/ghi789'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📱 Generating ${testCase.urgency} urgency message for ${testCase.name}:`);
      
      const message = await generateReminderMessage(
        testCase.name,
        testCase.product,
        testCase.urgency,
        testCase.link
      );
      
      console.log(`Message: ${message}`);
      console.log(`Length: ${message.length} characters\n`);
    }

    // Test message variations
    console.log('🔄 Testing message variations:');
    const variations = await generateMessageVariations('Alex Smith', 'Gaming Laptop', 'medium', 'https://shop.com/checkout/xyz123', 2);
    variations.forEach((msg, index) => {
      console.log(`Variation ${index + 1}: ${msg}`);
    });

    // Test template-based generation
    console.log('\n📝 Testing template-based generation:');
    const templateMessage = await generateMessageFromTemplate(
      'Lisa Brown',
      'Yoga Mat',
      'Hey {name}! Your {product} is calling your name. Don\'t miss out — complete your purchase now: {link}',
      'https://shop.com/checkout/template123'
    );
    console.log(`Template message: ${templateMessage}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Export functions for use in other modules
module.exports = {
  generateReminderMessage,
  generateMessageVariations,
  generateMessageFromTemplate,
  testMessageGeneration
};

// Run tests if this file is executed directly
if (require.main === module) {
  // Check if OpenAI API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }
  
  testMessageGeneration();
} 