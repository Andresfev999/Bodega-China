import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, TrendingUp, Users, ShoppingBag,
    CreditCard, Package, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight,
    Activity, Truck
} from 'lucide-react';
import { getDashboardStats } from '../store';

const Dashboard = ({ onNavigate }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
        // Refresh every minute
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!stats) return <div>Error loading stats</div>;

    const { kpi, salesChart, topProducts, categoryStats, recentOrders } = stats;

    return (
        <div className="dashboard-container" style={{ paddingBottom: '2rem' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '800' }}>Dashboard General</h2>

            {/* KPI GRID */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <KpiCard
                    title="Ventas Totales"
                    value={`$${kpi.totalSales.toLocaleString()}`}
                    icon={<TrendingUp size={24} color="#10b981" />}
                    trend="+12%" // Mock trend for now
                    color="rgba(16, 185, 129, 0.1)"
                />
                <KpiCard
                    title="Productos Totales"
                    value={kpi.totalProducts}
                    icon={<Package size={24} color="#6366f1" />}
                    color="rgba(99, 102, 241, 0.1)"
                />
                <KpiCard
                    title="Promedio Pedido"
                    value={`$${Math.round(kpi.averageOrderValue).toLocaleString()}`}
                    icon={<CreditCard size={24} color="#3b82f6" />}
                    color="rgba(59, 130, 246, 0.1)"
                />
                <KpiCard
                    title="Pedidos Pendientes"
                    value={kpi.pendingOrders}
                    icon={<ShoppingBag size={24} color="#f59e0b" />}
                    isWarning={kpi.pendingOrders > 5}
                    color="rgba(245, 158, 11, 0.1)"
                />
                <KpiCard
                    title="Visitas Web"
                    value={kpi.visitCount.toLocaleString()}
                    icon={<Users size={24} color="#8b5cf6" />}
                    color="rgba(139, 92, 246, 0.1)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* SECONDARY KPIs */}
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tasa Cancelación</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: kpi.cancellationRate > 20 ? 'var(--error)' : 'var(--text-main)' }}>
                            {kpi.cancellationRate.toFixed(1)}%
                        </div>
                    </div>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertCircle size={20} color="var(--error)" />
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Costo Envío Promedio</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            ${Math.round(kpi.avgShipping).toLocaleString()}
                        </div>
                    </div>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
                        <Truck size={20} color="#0ea5e9" />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* SALES CHART */}
                <div className="card" style={{ minHeight: '350px', padding: '1.5rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Ventas Recientes</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Últimos 10 días activos</span>
                    </div>

                    <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem', overflowX: 'auto' }}>
                        {salesChart.length > 0 ? (
                            salesChart.map((point, i) => {
                                const maxVal = Math.max(...salesChart.map(p => p.amount));
                                const heightPc = maxVal > 0 ? (point.amount / maxVal) * 100 : 0;
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '40px' }}>
                                        <div
                                            className="bar-tooltip-trigger"
                                            style={{
                                                width: '100%',
                                                height: `${Math.max(heightPc, 5)}%`,
                                                backgroundColor: 'var(--primary)',
                                                borderRadius: '4px 4px 0 0',
                                                opacity: 0.8,
                                                transition: 'height 0.3s ease',
                                                position: 'relative'
                                            }}
                                        >
                                            <span className="tooltip">${point.amount.toLocaleString()}</span>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'center' }}>
                                            {point.date.split('/')[0]}/{point.date.split('/')[1]}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                No hay datos de ventas recientes
                            </div>
                        )}
                    </div>
                </div>

                {/* CATEGORY DISTRIBUTION */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Categorías</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {categoryStats.slice(0, 6).map((cat, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                                    <span>{cat.name}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{cat.count} prod</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-pure)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${cat.percentage}%`,
                                        height: '100%',
                                        backgroundColor: `hsl(${200 + (i * 30)}, 70%, 50%)`,
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '2rem' }}>
                {/* TOP PRODUCTS */}
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3>Productos Más Vendidos</h3>
                    </div>
                    <div>
                        {topProducts.map((prod, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                borderBottom: i < topProducts.length - 1 ? '1px solid var(--border)' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        backgroundColor: i === 0 ? '#fbbf24' : (i === 1 ? '#94a3b8' : '#78350f'),
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{prod.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{prod.quantity} vendidos</div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: '600' }}>
                                    ${prod.revenue.toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Sin datos de productos
                            </div>
                        )}
                    </div>
                </div>

                {/* RECENT ORDERS */}
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Pedidos Recientes</h3>
                        <button onClick={() => onNavigate('orders')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}>Ver Todo &rarr;</button>
                    </div>
                    <div>
                        {recentOrders.map((order) => (
                            <div key={order.id} style={{
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{order.client_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 0} ítems
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>${order.total.toLocaleString()}</div>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No hay pedidos recientes
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const KpiCard = ({ title, value, icon, trend, color, isWarning }) => (
    <div className="card stat-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', border: isWarning ? '1px solid var(--error)' : '1px solid transparent' }}>
        <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1, marginBottom: '0.5rem' }}>{value}</div>
            {trend && <div style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingUp size={14} /> {trend} <span style={{ color: 'var(--text-muted)' }}>vs mes anterior</span>
            </div>}
        </div>
        <div style={{
            padding: '0.75rem',
            borderRadius: '12px',
            backgroundColor: color || 'var(--bg-pure)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {icon}
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    let color = 'var(--text-muted)';
    let bg = 'var(--bg-pure)';

    switch (status) {
        case 'Pendiente': color = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.1)'; break;
        case 'Completado': color = '#10b981'; bg = 'rgba(16, 185, 129, 0.1)'; break;
        case 'Procesando': color = '#3b82f6'; bg = 'rgba(59, 130, 246, 0.1)'; break;
        case 'Cancelado': color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.1)'; break;
        case 'Enviado': color = '#8b5cf6'; bg = 'rgba(139, 92, 246, 0.1)'; break;
    }

    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: bg,
            color: color,
            marginTop: '0.25rem'
        }}>
            {status}
        </span>
    );
};

export default Dashboard;
