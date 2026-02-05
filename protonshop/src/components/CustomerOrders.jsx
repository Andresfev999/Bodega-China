import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, AlertCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import { getUserOrders } from '../store';
import { formatCurrency } from '../utils';

const CustomerOrders = ({ user, onBack }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                try {
                    const data = await getUserOrders(user.id);
                    setOrders(data);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchOrders();
    }, [user]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completado': return <CheckCircle size={18} color="var(--success)" />;
            case 'Enviado': return <Truck size={18} color="var(--primary)" />;
            case 'Pendiente': return <Clock size={18} color="#f59e0b" />;
            case 'Cancelado': return <AlertCircle size={18} color="var(--error)" />;
            default: return <Package size={18} color="var(--text-muted)" />;
        }
    };

    if (loading) return (
        <div style={styles.loading}>
            <div className="spinner"></div>
            <p>Cargando tus pedidos...</p>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Mis Pedidos</h2>
                <p style={styles.subtitle}>Consulta el estado y detalle de tus compras.</p>
            </div>

            {orders.length === 0 ? (
                <div style={styles.empty}>
                    <ShoppingBag size={64} color="var(--border)" />
                    <h3>Aún no tienes pedidos</h3>
                    <p>¡Explora nuestro catálogo y realiza tu primera compra!</p>
                    <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1.5rem' }}>
                        Ir al Catálogo
                    </button>
                </div>
            ) : (
                <div style={styles.orderList}>
                    {orders.map((order) => (
                        <div key={order.id} style={styles.orderCard}>
                            <div style={styles.orderHeader}>
                                <div style={styles.orderMeta}>
                                    <span style={styles.orderId}>Orden #{order.id.slice(0, 8)}</span>
                                    <span style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div style={styles.orderStatus}>
                                    {getStatusIcon(order.status)}
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{order.status}</span>
                                </div>
                            </div>

                            <div style={styles.orderBody}>
                                <div style={styles.itemsPreview}>
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <img
                                            key={idx}
                                            src={item.image}
                                            alt={item.name}
                                            style={styles.itemThumb}
                                            title={item.name}
                                        />
                                    ))}
                                    {order.items.length > 3 && (
                                        <div style={styles.moreItems}>+{order.items.length - 3}</div>
                                    )}
                                </div>
                                <div style={styles.orderTotal}>
                                    {order.shipping_cost > 0 && (
                                        <>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>
                                                Subtotal: {formatCurrency(order.total - order.shipping_cost)}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'block' }}>
                                                Envío: +{formatCurrency(Number(order.shipping_cost))}
                                            </span>
                                        </>
                                    )}
                                    <span style={styles.totalLabel}>Total:</span>
                                    <span style={styles.totalVal}>{formatCurrency(order.total)}</span>
                                </div>
                            </div>

                            <div style={styles.orderFooter}>
                                <p style={styles.address}>
                                    <Package size={14} /> Entregar en: {order.customer_municipio}, {order.customer_departamento}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button style={styles.btnBack} onClick={onBack}>Volver al Catálogo</button>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '0 1rem'
    },
    header: {
        marginBottom: '2.5rem',
        textAlign: 'center'
    },
    title: { fontSize: '2.25rem', marginBottom: '0.5rem' },
    subtitle: { color: 'var(--text-muted)', fontSize: '1.1rem' },
    loading: {
        textAlign: 'center',
        padding: '5rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        color: 'var(--primary)'
    },
    empty: {
        textAlign: 'center',
        padding: '5rem 2rem',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
    },
    orderList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        transition: 'var(--transition)',
        '&:hover': {
            boxShadow: 'var(--shadow-md)',
            borderColor: 'var(--primary)'
        }
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1rem'
    },
    orderMeta: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    orderId: { fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' },
    orderDate: { fontSize: '0.85rem', color: 'var(--text-muted)' },
    orderStatus: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: 'var(--bg-soft)',
        borderRadius: '20px'
    },
    orderBody: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
    },
    itemsPreview: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
    itemThumb: {
        width: '48px',
        height: '48px',
        borderRadius: '8px',
        objectFit: 'cover',
        border: '1px solid var(--border)'
    },
    moreItems: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: '700',
        color: 'var(--text-muted)'
    },
    orderTotal: { textAlign: 'right' },
    totalLabel: { fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block' },
    totalVal: { fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' },
    orderFooter: {
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px dashed var(--border)'
    },
    address: {
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    btnBack: {
        display: 'block',
        margin: '0 auto',
        padding: '0.75rem 2rem',
        backgroundColor: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default CustomerOrders;
