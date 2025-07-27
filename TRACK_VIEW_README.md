# Track View Endpoint

A Node.js/Next.js API endpoint for tracking product views and storing them in Supabase.

## 📁 Files

**E.g., the endpoint implementation includes:**

- **`api/track-view.js`** - Next.js API route
- **`track-view-endpoint.js`** - Standalone Express.js endpoint
- **`test-track-view.js`** - Test script with various scenarios
- **`TRACK_VIEW_README.md`** - This documentation

## 🚀 Quick Start

### Next.js API Route

**E.g., to use with Next.js:**

1. **Place the file in your Next.js project:**
   ```
   your-nextjs-app/
   ├── pages/
   │   └── api/
   │       └── track-view.js
   ```

2. **Set environment variables in `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Access the endpoint:**
   ```
   POST /api/track-view
   ```

### Standalone Express Server

**E.g., to run as standalone server:**

1. **Install dependencies:**
   ```bash
   npm install express @supabase/supabase-js cors
   ```

2. **Set environment variables:**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3000
   ```

3. **Run the server:**
   ```bash
   node track-view-endpoint.js
   ```

## 📡 API Reference

### Endpoint

```
POST /track-view
```

### Request Body

**E.g., required and optional fields:**

```json
{
  "user_email": "customer@example.com",     // Optional
  "product_id": "prod_12345",               // Required
  "product_name": "Product Name",            // Required
  "timestamp": "2024-01-01T12:00:00.000Z"  // Optional (uses current time)
}
```

### Response

**E.g., success response:**

```json
{
  "success": true,
  "message": "Product view tracked successfully",
  "data": {
    "view_id": "uuid-of-view-record",
    "user_id": "uuid-of-user-or-null",
    "product_id": "prod_12345",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

**E.g., error response:**

```json
{
  "error": "Missing required fields: product_id and product_name are required"
}
```

## 🔧 Usage Examples

### JavaScript/Frontend

**E.g., calling from frontend:**

```javascript
// Track a product view
const trackProductView = async (productData) => {
  try {
    const response = await fetch('/api/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_email: 'customer@example.com',
        product_id: 'prod_12345',
        product_name: 'Amazing Product',
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Product view tracked:', result.data);
    } else {
      console.error('Tracking failed:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### cURL

**E.g., testing with cURL:**

```bash
curl -X POST http://localhost:3000/track-view \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "product_id": "prod_12345",
    "product_name": "Test Product",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }'
```

### Shopify Integration

**E.g., updating the Shopify script:**

```javascript
// In your Shopify tracking script, update the CONFIG:
const CONFIG = {
    BACKEND_URL: 'https://your-domain.com/api/track-view', // Next.js
    // OR
    BACKEND_URL: 'https://your-domain.com/track-view',     // Express
    HEADERS: {
        'Content-Type': 'application/json'
    },
    DEBUG: false
};
```

## ✅ Validation

**E.g., the endpoint validates:**

- **Required fields:** `product_id` and `product_name`
- **Email format:** Valid email regex pattern
- **Timestamp format:** ISO 8601 format
- **Data types:** All fields must be strings
- **Non-empty values:** Product ID and name cannot be empty

## 🔄 Data Flow

**E.g., what happens when you call the endpoint:**

1. **Validate input** → Check required fields and formats
2. **Find/Create user** → Look up user by email or create new
3. **Find/Create product** → Look up product by ID or create new
4. **Insert view record** → Store in `products_viewed` table
5. **Return response** → Success/error with details

## 🧪 Testing

**E.g., to test the endpoint:**

```bash
# Run the test script
node test-track-view.js

# Or test manually
curl -X POST http://localhost:3000/track-view \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "product_id": "test_prod",
    "product_name": "Test Product"
  }'
```

## 🚀 Deployment

### Vercel (Next.js)

**E.g., deploy to Vercel:**

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Railway/Heroku (Express)

**E.g., deploy to Railway:**

1. **Push to GitHub**
2. **Connect to Railway**
3. **Set environment variables:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT`

### Docker

**E.g., Docker deployment:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "track-view-endpoint.js"]
```

## 🔒 Security

**E.g., security features:**

- **Input validation** on all fields
- **Error handling** with proper HTTP status codes
- **CORS support** for cross-origin requests
- **Environment variables** for sensitive data
- **Rate limiting** (implement as needed)

## 📊 Monitoring

**E.g., useful queries for monitoring:**

```sql
-- Recent product views
SELECT 
  product_name,
  timestamp,
  users.email
FROM products_viewed pv
LEFT JOIN users ON pv.user_id = users.id
ORDER BY timestamp DESC
LIMIT 50;

-- Most viewed products
SELECT 
  product_name,
  COUNT(*) as view_count
FROM products_viewed
GROUP BY product_name
ORDER BY view_count DESC;

-- User engagement
SELECT 
  u.email,
  COUNT(pv.id) as products_viewed
FROM users u
LEFT JOIN products_viewed pv ON u.id = pv.user_id
GROUP BY u.id, u.email
ORDER BY products_viewed DESC;
```

## 🛠️ Troubleshooting

### Common Issues

**E.g., if the endpoint isn't working:**

1. **Check environment variables** are set correctly
2. **Verify Supabase connection** and permissions
3. **Test with curl** to isolate frontend issues
4. **Check server logs** for detailed error messages
5. **Validate request format** matches expected schema

### Error Codes

**E.g., common error responses:**

- `400` - Bad Request (validation errors)
- `405` - Method Not Allowed (wrong HTTP method)
- `500` - Internal Server Error (server/database issues)

## 📞 Support

**E.g., for help:**

1. Check the test script for working examples
2. Verify your Supabase schema is set up correctly
3. Test with the provided cURL commands
4. Review the validation rules for your data format

The track-view endpoint is now ready to capture product views and store them in your Supabase database! 