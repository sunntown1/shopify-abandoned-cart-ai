# Shopify Product Tracking Setup Guide

This guide will help you implement product view tracking in your Shopify store and connect it to your Supabase backend.

## 🚀 Quick Start

### 1. Backend Setup

**E.g., to set up your backend:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   # Create .env file
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

### 2. Shopify Theme Integration

**E.g., to add tracking to your Shopify theme:**

1. **Go to your Shopify admin → Online Store → Themes**
2. **Click "Actions" → "Edit code"**
3. **In the `theme.liquid` file, add this before the closing `</head>` tag:**

```html
<script>
// Copy the contents of shopify-product-tracking.js here
// OR include it as a separate file:
<script src="{{ 'shopify-product-tracking.js' | asset_url }}" defer></script>
```

4. **Update the CONFIG object in the script:**
   ```javascript
   const CONFIG = {
       BACKEND_URL: 'https://your-backend-domain.com/api/track-product-view',
       HEADERS: {
           'Content-Type': 'application/json',
           // Add any authentication headers if needed
       },
       DEBUG: false // Set to true for testing
   };
   ```

## 📋 Implementation Steps

### Step 1: Deploy Your Backend

**E.g., deploy to platforms like:**

- **Vercel:** Upload the backend files and set environment variables
- **Heroku:** `git push heroku main`
- **Railway:** Connect your GitHub repo
- **DigitalOcean App Platform:** Deploy from your repository

### Step 2: Update Shopify Theme

**E.g., for different Shopify themes:**

**Dawn Theme (Default):**
- Edit `layout/theme.liquid`
- Add script before `</head>`

**Other Themes:**
- Look for `theme.liquid` or `layout/theme.liquid`
- Add script in the head section

### Step 3: Test the Integration

**E.g., to test your tracking:**

1. **Enable debug mode:**
   ```javascript
   DEBUG: true
   ```

2. **Visit a product page**
3. **Check browser console for tracking logs**
4. **Verify data in your Supabase dashboard**

## 🔧 Configuration Options

### Backend Configuration

**E.g., environment variables:**

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
NODE_ENV=production
```

### Frontend Configuration

**E.g., script configuration:**

```javascript
const CONFIG = {
    BACKEND_URL: 'https://your-api.com/api/track-product-view',
    HEADERS: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-api-key' // Optional
    },
    DEBUG: false,
    DEBOUNCE_DELAY: 1000 // Milliseconds to wait before tracking
};
```

## 📊 Data Flow

**E.g., how the tracking works:**

1. **User visits product page** → Script detects page load
2. **Extract product data** → From Shopify objects or page content
3. **Get user email** → From customer data or localStorage
4. **Send POST request** → To your backend endpoint
5. **Backend processes** → Creates/updates user and product records
6. **Store view record** → In Supabase `products_viewed` table

## 🛠️ Troubleshooting

### Common Issues

**E.g., if tracking isn't working:**

1. **Check browser console** for JavaScript errors
2. **Verify backend URL** is correct and accessible
3. **Test backend endpoint** with Postman or curl
4. **Check CORS settings** if requests are blocked
5. **Verify Supabase connection** and environment variables

### Debug Mode

**E.g., enable debug logging:**

```javascript
const CONFIG = {
    DEBUG: true, // Enable console logging
    // ... other config
};
```

### Manual Testing

**E.g., test the endpoint directly:**

```bash
curl -X POST https://your-backend.com/api/track-product-view \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "product_id": "12345",
    "product_name": "Test Product",
    "timestamp": "2024-01-01T12:00:00Z"
  }'
```

## 📈 Analytics Queries

**E.g., useful Supabase queries for analytics:**

```sql
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

-- Recent activity
SELECT 
  product_name,
  timestamp,
  users.email
FROM products_viewed pv
JOIN users ON pv.user_id = users.id
ORDER BY timestamp DESC
LIMIT 50;
```

## 🔒 Security Considerations

**E.g., security best practices:**

1. **Use HTTPS** for all API calls
2. **Implement rate limiting** on your backend
3. **Validate input data** on both frontend and backend
4. **Use environment variables** for sensitive data
5. **Enable CORS** only for your Shopify domain
6. **Monitor API usage** and set up alerts

## 🚀 Production Deployment

**E.g., production checklist:**

- [ ] Set `DEBUG: false` in production
- [ ] Use HTTPS for backend URL
- [ ] Set up monitoring and logging
- [ ] Configure error handling
- [ ] Test with real Shopify store
- [ ] Set up analytics dashboard
- [ ] Monitor API performance

## 📞 Support

**E.g., if you need help:**

1. Check the browser console for errors
2. Verify your Supabase connection
3. Test the backend endpoint directly
4. Review the Shopify theme integration
5. Check environment variables are set correctly

The tracking system is now ready to capture product views and store them in your Supabase database for analytics! 