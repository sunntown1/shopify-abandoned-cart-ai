// Test script for the track-view endpoint
// Demonstrates how to call the endpoint with different scenarios

const fetch = require('node-fetch'); // For Node.js testing

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TRACK_VIEW_ENDPOINT = `${API_BASE_URL}/track-view`;

// Test data scenarios
const testScenarios = [
  {
    name: 'Basic product view with email',
    data: {
      user_email: 'test@example.com',
      product_id: 'prod_12345',
      product_name: 'Test Product',
      timestamp: new Date().toISOString()
    }
  },
  {
    name: 'Product view without email (anonymous user)',
    data: {
      product_id: 'prod_67890',
      product_name: 'Another Product',
      timestamp: new Date().toISOString()
    }
  },
  {
    name: 'Product view with custom timestamp',
    data: {
      user_email: 'customer@shop.com',
      product_id: 'prod_custom',
      product_name: 'Custom Timestamp Product',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  },
  {
    name: 'Product view without timestamp (uses current time)',
    data: {
      user_email: 'user@example.com',
      product_id: 'prod_no_timestamp',
      product_name: 'No Timestamp Product'
    }
  }
];

// Function to test the endpoint
async function testTrackView(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log('📤 Sending data:', JSON.stringify(scenario.data, null, 2));
  
  try {
    const response = await fetch(TRACK_VIEW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scenario.data)
    });
    
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed!');
    }
    
    return { success: response.ok, data: result };
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return { success: false, error: error.message };
  }
}

// Function to test error scenarios
async function testErrorScenarios() {
  console.log('\n🔍 Testing Error Scenarios');
  
  const errorScenarios = [
    {
      name: 'Missing required fields',
      data: {
        user_email: 'test@example.com'
        // Missing product_id and product_name
      }
    },
    {
      name: 'Invalid email format',
      data: {
        user_email: 'invalid-email',
        product_id: 'prod_invalid_email',
        product_name: 'Invalid Email Product'
      }
    },
    {
      name: 'Invalid timestamp format',
      data: {
        user_email: 'test@example.com',
        product_id: 'prod_invalid_timestamp',
        product_name: 'Invalid Timestamp Product',
        timestamp: 'invalid-timestamp'
      }
    },
    {
      name: 'Empty product_id',
      data: {
        user_email: 'test@example.com',
        product_id: '',
        product_name: 'Empty Product ID'
      }
    },
    {
      name: 'Empty product_name',
      data: {
        user_email: 'test@example.com',
        product_id: 'prod_empty_name',
        product_name: ''
      }
    }
  ];
  
  for (const scenario of errorScenarios) {
    await testTrackView(scenario);
  }
}

// Function to test health endpoint
async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Health check passed!');
    } else {
      console.log('❌ Health check failed!');
    }
    
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Track View Endpoint Tests');
  console.log(`📍 Endpoint: ${TRACK_VIEW_ENDPOINT}`);
  
  // Test health endpoint first
  await testHealthEndpoint();
  
  // Test valid scenarios
  console.log('\n📋 Testing Valid Scenarios');
  for (const scenario of testScenarios) {
    await testTrackView(scenario);
  }
  
  // Test error scenarios
  await testErrorScenarios();
  
  console.log('\n🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testTrackView,
  testErrorScenarios,
  testHealthEndpoint,
  runTests
}; 