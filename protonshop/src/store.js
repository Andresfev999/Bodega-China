import { supabase } from './supabase';

// Categorías iniciales para poblar la DB si es necesario
const INITIAL_CATEGORIES = ['Electrónica', 'Accesorios', 'Periféricos'];
const BUCKET_NAME = 'products';

export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
};

export const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    let { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const getStoreData = async () => {
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('name');

    if (prodError || catError) {
        console.error('Error fetching data:', prodError || catError);
        return { products: [], categories: INITIAL_CATEGORIES };
    }

    // Normalize products: fix typo 'caocina' -> 'Cocina'
    const normalizedProducts = (products || []).map(p => {
        if (p.category && ['caocina', 'cocina'].includes(p.category.toLowerCase())) {
            return { ...p, category: 'Cocina' };
        }
        return p;
    });

    // Normalize categories: remove 'caocina'/'cocina' and ensure 'Cocina' exists if needed
    let normalizedCategories = (categoriesData?.map(c => c.name) || INITIAL_CATEGORIES)
        .map(c => ['caocina', 'cocina'].includes(c.toLowerCase()) ? 'Cocina' : c);

    // Remove duplicates
    normalizedCategories = [...new Set(normalizedCategories)];

    return {
        products: normalizedProducts,
        categories: normalizedCategories
    };
};

export const addProduct = async (product) => {
    const { id, ...productData } = product;
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

    if (error) throw error;
    return data[0];
};

export const updateProduct = async (product) => {
    const { id, created_at, ...productData } = product;
    const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

    if (error) throw error;
};

export const deleteProduct = async (id) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('name');

    if (error) return INITIAL_CATEGORIES;
    return data.length > 0 ? data.map(c => c.name) : INITIAL_CATEGORIES;
};

const generateOrderCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ORD-${code}`;
};

export const createOrder = async (orderData) => {
    const orderWithCode = {
        ...orderData,
        order_code: generateOrderCode()
    };

    const { data, error } = await supabase
        .from('orders')
        .insert([orderWithCode])
        .select();

    if (error) throw error;
    return data[0];
};

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

export const updateProfile = async (userId, profileData) => {
    const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...profileData });

    if (error) throw error;
};

export const getUserOrders = async (userId) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// --- Visit Counter ---
export const recordVisit = async () => {
    try {
        await supabase.from('visits').insert([{}]);
    } catch (error) {
        // Silent fail if table doesn't exist yet to avoid crashing app
        console.warn('Visit recording failed (table might be missing):', error);
    }
};

export const getVisitCount = async () => {
    try {
        const { count, error } = await supabase
            .from('visits')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.warn('Failed to get visit count:', error);
        return 0;
    }
};
