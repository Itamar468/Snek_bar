import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  created_at: string;
};

export type UserProfile = {
  id: string;
  family_name: string;
  kibbutz: string;
  neighborhood: string | null;
  house_number: string;
  phone: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  order_type: 'takeaway' | 'dine-in';
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  total_price: number;
  delivery_address: {
    kibbutz: string;
    neighborhood?: string;
    house_number: string;
    family_name: string;
  } | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
};
