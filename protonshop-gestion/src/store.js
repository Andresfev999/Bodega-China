import { supabase } from './supabase';

const BUCKET_NAME = 'products';

// --- INVENTORY ---
export const getAdminProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const saveProduct = async (product) => {
    const { id, created_at, ...data } = product;

    // Ensure category exists
    if (data.category) {
        // Try to create the category if it doesn't exist
        // We assume the categories table has a 'name' column unique constraint
        const { error: catError } = await supabase
            .from('categories')
            .upsert({ name: data.category }, { onConflict: 'name', ignoreDuplicates: true });

        if (catError) {
            console.error('Error auto-creating category:', catError);
            // We continue, hoping it might exist or error will be caught downstream
        }
    }

    if (id) {
        const { error } = await supabase.from('products').update(data).eq('id', id);
        if (error) throw error;
    } else {
        const { error } = await supabase.from('products').insert([data]);
        if (error) throw error;
    }
};

export const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
};

// --- ORDERS ---
export const getAdminOrders = async () => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const updateOrderStatus = async (orderId, status, shippingCost = 0) => {
    let updateData = { status };

    if (status === 'Enviado' && shippingCost > 0) {
        // Fetch current order to ensure we add shipping to the base price
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('items')
            .eq('id', orderId)
            .single();

        if (fetchError) throw fetchError;

        // Recalculate base total from items to avoid double adding if updated multiple times
        const baseTotal = order.items.reduce((sum, item) => sum + item.price, 0);
        updateData.shipping_cost = shippingCost;
        updateData.total = baseTotal + Number(shippingCost);
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
    if (error) throw error;
};

export const updateOrderShippingCost = async (orderId, shippingCost) => {
    // 1. Get current items to calculate base price
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('items')
        .eq('id', orderId)
        .single();

    if (fetchError) throw fetchError;

    // 2. Calculate new total
    const baseTotal = order.items.reduce((sum, item) => sum + item.price, 0);
    const newTotal = baseTotal + Number(shippingCost);

    // 3. Update shipping_cost and total
    const { error } = await supabase
        .from('orders')
        .update({
            shipping_cost: shippingCost,
            total: newTotal
        })
        .eq('id', orderId);

    if (error) throw error;
};

// --- IMAGES ---
export const uploadProductImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return data.publicUrl;
};

// --- STATS ---
export const getStats = async () => {
    const { data: orders, error } = await supabase.from('orders').select('total, status');
    if (error) throw error;

    const totalSales = orders
        .filter(o => o.status === 'Completado')
        .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;

    return { totalSales, pendingOrders };
};
