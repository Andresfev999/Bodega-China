import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, Search, Filter, MessageCircle, Edit } from 'lucide-react';
import { getAdminOrders, updateOrderStatus, updateOrderShippingCost, deleteOrder } from '../store';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('Todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
        // Poll for updates every 30s
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        try {
            const data = await getAdminOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        let shippingCost = 0;

        if (newStatus === 'Enviado') {
            const input = prompt('Ingrese el valor del envío para este pedido:');
            if (input === null) return; // Cancelled
            shippingCost = Number(input);
            if (isNaN(shippingCost) || shippingCost < 0) {
                alert('Por favor ingrese un valor válido.');
                return;
            }
        }

        setLoading(true);
        try {
            await updateOrderStatus(orderId, newStatus, shippingCost);
            await loadOrders();
        } catch (error) {
            alert('Error updating status: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateShipping = async (order) => {
        const input = prompt('Ingrese el valor del envío:', order.shipping_cost || 0);
        if (input === null) return;

        const cost = Number(input);
        if (isNaN(cost) || cost < 0) {
            alert('Valor inválido');
            return;
        }

        setLoading(true);
        try {
            await updateOrderShippingCost(order.id, cost);
            await loadOrders();
        } catch (error) {
            alert('Error updating shipping: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
            return;
        }

        setLoading(true);
        try {
            await deleteOrder(orderId);
            await loadOrders();
        } catch (error) {
            alert(`Error al eliminar el pedido:\nCode: ${error.code || 'N/A'}\nMessage: ${error.message}\nDetails: ${error.details || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pendiente': return '#64748b'; // Slate
            case 'Confirmado': return '#fbc531'; // Gold
            case 'Enviado': return '#3b82f6'; // Blue
            case 'Completado': return '#10b981'; // Green
            case 'Cancelado': return '#ce1126'; // Red
            default: return '#94a3b8';
        }
    };

    const generateWhatsAppMsg = (order) => {
        const itemsList = order.items.map(i => `- ${i.name} ($${i.price.toLocaleString()})`).join('\n');
        const total = order.total?.toLocaleString() || '0';

        const message = `*** Hola ${order.customer_name || 'Cliente'}, recibimos tu pedido ${order.order_code || ''} en ProtonShop.\n\n` +
            `>> *Resumen del Pedido (${order.order_code || 'Nuevo'}):*\n${itemsList}\n` +
            (order.shipping_cost > 0 ? `>> *Envío:* $${Number(order.shipping_cost).toLocaleString()}\n` : '') +
            `>> *Total:* $${total}\n\n` +
            `>> *Datos de Envío:*\n` +
            `Dirección: ${order.customer_address || 'Pendiente'}\n` +
            `Municipio: ${order.customer_municipio || ''}\n` +
            `Departamento: ${order.customer_departamento || ''}\n` +
            `Teléfono: ${order.customer_phone || 'Pendiente'}\n\n` +
            `?? *¿Nos confirmas que la información es correcta para proceder con el envío?*`;

        if (!order.customer_phone) {
            navigator.clipboard.writeText(message)
                .then(() => alert('⚠️ Este pedido no tiene teléfono registrado.\n\nEl mensaje ha sido COPIADO al portapapeles para que puedas enviarlo manualmente.'))
                .catch(err => alert('Error al copiar al portapapeles: ' + err));
            return;
        }

        let phone = order.customer_phone.replace(/\D/g, '');
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const filteredOrders = filter === 'Todos' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="orders-view">
            <div className="card-header">
                <h2>Gestión de Pedidos</h2>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {['Todos', 'Pendiente', 'Confirmado', 'Enviado', 'Completado'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={filter === f ? 'btn btn-primary' : 'btn btn-outline'}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="data-card">
                {filteredOrders.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No hay pedidos en esta categoría</p>
                    </div>
                ) : (
                    <div className="order-list" style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredOrders.map(order => (
                            <div key={order.id} style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-dark)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                                {order.order_code || '#---'}
                                            </span>
                                            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{order.customer_name}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '12px',
                                                backgroundColor: `${getStatusColor(order.status)}20`,
                                                color: getStatusColor(order.status),
                                                border: `1px solid ${getStatusColor(order.status)}`
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {order.customer_phone} • {order.customer_address}, {order.customer_municipio}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                                            ${order.total?.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(order.created_at).toLocaleString()}
                                        </div>
                                        {order.shipping_cost > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <span>+${Number(order.shipping_cost).toLocaleString()} envío</span>
                                                <button onClick={() => handleUpdateShipping(order)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
                                                    <Edit size={14} />
                                                </button>
                                            </div>
                                        )}
                                        {(!order.shipping_cost || order.shipping_cost === 0) && (order.status === 'Pendiente' || order.status === 'Confirmado') && (
                                            <button
                                                onClick={() => handleUpdateShipping(order)}
                                                style={{
                                                    marginTop: '0.25rem',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--primary)',
                                                    background: 'none',
                                                    border: '1px dashed var(--primary)',
                                                    padding: '0.1rem 0.5rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + Agregar Envío
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: 'var(--bg-dark)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginTop: '0.5rem'
                                }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Productos:</p>
                                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px' }}>
                                                <img src={item.image} style={{ width: '32px', height: '32px', borderRadius: '4px' }} alt="" />
                                                <div style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
                                                    <div style={{ color: 'var(--text-main)' }}>{item.name}</div>
                                                    <div style={{ color: 'var(--primary)' }}>${item.price.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <button
                                        onClick={() => generateWhatsAppMsg(order)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            backgroundColor: '#25D366',
                                            color: 'white',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <MessageCircle size={16} /> WhatsApp
                                    </button>
                                    <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 0.5rem' }}></div>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            backgroundColor: 'transparent',
                                            color: '#ef4444',
                                            border: '1px solid #ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Eliminar pedido"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                    <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 0.5rem' }}></div>
                                    {['Pendiente', 'Confirmado', 'Enviado', 'Completado', 'Cancelado'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(order.id, status)}
                                            disabled={order.status === status}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: order.status === status ? 'default' : 'pointer',
                                                backgroundColor: order.status === status ? getStatusColor(status) : 'transparent',
                                                color: order.status === status ? 'white' : 'var(--text-muted)',
                                                border: order.status === status ? 'none' : '1px solid var(--border)',
                                                opacity: order.status === status ? 1 : 0.7
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderManager;
