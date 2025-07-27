# E-commerce AI Analytics Supabase Schema

This repository contains a comprehensive Supabase schema for tracking user behavior, product views, and message analytics in an e-commerce application.

## Schema Overview

The schema includes three main tables:

### 1. `users` Table
- Extends Supabase's built-in `auth.users` table
- Stores additional user profile information
- Automatically created when a user signs up

### 2. `products_viewed` Table
- Tracks which products users have viewed
- Fields: `user_id`, `product_id`, `product_name`, `timestamp`
- Includes foreign key relationships for data integrity

### 3. `messages_sent` Table
- Tracks all messages sent to users
- Fields: `user_id`, `message_type`, `content`, `sent_at`
- Supports multiple message types: email, sms, push, in_app, chat

## Setup Instructions

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run the Schema**
   - Copy the contents of `supabase_schema.sql`
   - Paste into your Supabase SQL editor
   - Execute the script

3. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Usage Examples

### Inserting Product Views

```javascript
// When a user views a product
const { data, error } = await supabase
  .from('products_viewed')
  .insert({
    user_id: user.id,
    product_id: product.id,
    product_name: product.name
  });
```

### Recording Messages Sent

```javascript
// When sending a message to a user
const { data, error } = await supabase
  .from('messages_sent')
  .insert({
    user_id: user.id,
    message_type: 'email',
    content: 'Your order has been shipped!'
  });
```

### Querying User Analytics

```javascript
// Get all products viewed by a user
const { data: viewedProducts } = await supabase
  .from('products_viewed')
  .select('*')
  .eq('user_id', user.id)
  .order('timestamp', { ascending: false });

// Get all messages sent to a user
const { data: messages } = await supabase
  .from('messages_sent')
  .select('*')
  .eq('user_id', user.id)
  .order('sent_at', { ascending: false });
```

### Analytics Queries

```sql
-- Most viewed products
SELECT 
  product_name,
  COUNT(*) as view_count
FROM products_viewed
GROUP BY product_name
ORDER BY view_count DESC;

-- User engagement by message type
SELECT 
  message_type,
  COUNT(*) as message_count
FROM messages_sent
GROUP BY message_type;

-- Recent user activity
SELECT 
  u.email,
  COUNT(pv.id) as products_viewed,
  COUNT(ms.id) as messages_received
FROM users u
LEFT JOIN products_viewed pv ON u.id = pv.user_id
LEFT JOIN messages_sent ms ON u.id = ms.user_id
GROUP BY u.id, u.email;
```

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Products are publicly readable but require authentication to modify
- Automatic user profile creation on signup

## Performance Optimizations

- Indexes on frequently queried columns
- Foreign key constraints for data integrity
- Automatic timestamp updates via triggers

## Message Types

The `messages_sent` table supports these message types:
- `email` - Email messages
- `sms` - Text messages
- `push` - Push notifications
- `in_app` - In-app notifications
- `chat` - Chat messages

## Next Steps

1. **Set up your frontend application** to use this schema
2. **Implement tracking** for product views and message sends
3. **Create analytics dashboards** using the provided queries
4. **Add more tables** as needed for your specific use case

## Support

For questions or issues, please refer to the [Supabase documentation](https://supabase.com/docs) or create an issue in this repository. 