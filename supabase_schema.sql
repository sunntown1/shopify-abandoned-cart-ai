-- Supabase Schema for E-commerce AI Analytics
-- This schema includes tables for users, product views, and message tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (for reference)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products viewed table
CREATE TABLE IF NOT EXISTS public.products_viewed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages sent table
CREATE TABLE IF NOT EXISTS public.messages_sent (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('email', 'sms', 'push', 'in_app', 'chat')),
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_viewed_user_id ON public.products_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_products_viewed_product_id ON public.products_viewed(product_id);
CREATE INDEX IF NOT EXISTS idx_products_viewed_timestamp ON public.products_viewed(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_sent_user_id ON public.messages_sent(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_message_type ON public.messages_sent(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_sent_sent_at ON public.messages_sent(sent_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_sent ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for products table (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update products" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for products_viewed table
CREATE POLICY "Users can view their own product views" ON public.products_viewed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product views" ON public.products_viewed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product views" ON public.products_viewed
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product views" ON public.products_viewed
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages_sent table
CREATE POLICY "Users can view their own messages" ON public.messages_sent
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON public.messages_sent
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON public.messages_sent
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON public.messages_sent
    FOR DELETE USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data (optional - for testing)
INSERT INTO public.products (id, name, description, price, category) VALUES
    (uuid_generate_v4(), 'Sample Product 1', 'This is a sample product description', 29.99, 'Electronics'),
    (uuid_generate_v4(), 'Sample Product 2', 'Another sample product description', 49.99, 'Clothing'),
    (uuid_generate_v4(), 'Sample Product 3', 'Yet another sample product', 19.99, 'Home & Garden')
ON CONFLICT DO NOTHING; 