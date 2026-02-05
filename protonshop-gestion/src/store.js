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

export const deleteOrder = async (id) => {
    const { error, count } = await supabase
        .from('orders')
        .delete({ count: 'exact' })
        .eq('id', id);

    if (error) throw error;

    if (count === 0) {
        throw new Error('No se eliminó ningún registro. Es probable que no tengas permisos (RLS) o el pedido ya no exista.');
    }
};

// --- ORDERS ---
export const getAdminOrders = async () => {
    // Fetch Local Orders
    const { data: localOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return localOrders || [];
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
export const getDashboardStats = async () => {
    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true }); // Ascending for chart

    // Fetch products
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, category, stock');

    const { count: visitCount, error: visitsError } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true });

    if (ordersError || productsError) throw ordersError || productsError;

    const allOrders = orders || [];
    const allProducts = products || [];

    // --- KPIs ---
    const totalSales = allOrders
        .filter(o => o.status !== 'Cancelado')
        .reduce((sum, o) => sum + (o.total || 0), 0);

    const completedOrders = allOrders.filter(o => o.status === 'Completado').length;
    const pendingOrders = allOrders.filter(o => o.status === 'Pendiente').length;
    const cancelledOrders = allOrders.filter(o => o.status === 'Cancelado').length;
    const totalOrders = allOrders.length;

    // Average Order Value
    const activeOrdersCount = totalOrders - cancelledOrders;
    const averageOrderValue = activeOrdersCount > 0 ? totalSales / activeOrdersCount : 0;

    // Cancellation Rate
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    // --- SALES CHART DATA (Last 7 Days or All Time condensed) ---
    // Group by date YYYY-MM-DD
    const salesByDate = {};
    allOrders
        .filter(o => o.status !== 'Cancelado')
        .forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString();
            salesByDate[date] = (salesByDate[date] || 0) + (order.total || 0);
        });

    const salesChartData = Object.keys(salesByDate).map(date => ({
        date,
        amount: salesByDate[date]
    })).slice(-10); // Last 10 days with activity

    // --- TOP PRODUCTS ---
    const productSales = {};
    allOrders.forEach(order => {
        if (order.status !== 'Cancelado' && order.items) {
            order.items.forEach(item => {
                const id = item.id || item.name; // Fallback if no ID
                if (!productSales[id]) {
                    productSales[id] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[id].quantity += (item.quantity || 1);
                productSales[id].revenue += item.price;
            });
        }
    });

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // --- CATEGORY STATS ---
    const categoryStats = {};
    allProducts.forEach(p => {
        const cat = p.category || 'Sin Categoría';
        if (!categoryStats[cat]) categoryStats[cat] = 0;
        categoryStats[cat]++;
    });

    const categoryData = Object.keys(categoryStats).map(cat => ({
        name: cat,
        count: categoryStats[cat],
        percentage: (categoryStats[cat] / allProducts.length) * 100
    })).sort((a, b) => b.count - a.count);


    // --- SHIPPING STATS ---
    const ordersWithShipping = allOrders.filter(o => o.shipping_cost > 0);
    const avgShipping = ordersWithShipping.length > 0
        ? ordersWithShipping.reduce((sum, o) => sum + o.shipping_cost, 0) / ordersWithShipping.length
        : 0;

    return {
        kpi: {
            totalSales,
            totalOrders,
            totalProducts: allProducts.length, // Added this
            pendingOrders,
            visitCount: visitCount || 0,
            averageOrderValue,
            cancellationRate,
            avgShipping
        },
        salesChart: salesChartData,
        topProducts,
        categoryStats: categoryData,
        recentOrders: allOrders.slice().reverse().slice(0, 5) // Last 5 orders
    };
};

export const getStats = async () => {
    // Deprecated for full dashboard, keeping for simple backward comp if needed, 
    // but re-routing to new logic or simple fetch to keep App.jsx happy for now
    // if it calls it before we swap the component. 
    const { data: orders } = await supabase.from('orders').select('total, status');
    if (!orders) return { totalSales: 0, pendingOrders: 0 };

    const totalSales = orders
        .filter(o => o.status === 'Completado')
        .reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
    return { totalSales, pendingOrders };
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
