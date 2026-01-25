import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Package, ShoppingBag, Settings, Menu, X, Bell } from 'lucide-react';
import InventoryManager from './components/InventoryManager';
import OrderManager from './components/OrderManager';
import { getStats } from './store';

function App() {
  const [activeTab, setActiveTab] = useState('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalSales: 0, pendingOrders: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (e) { console.error(e); }
    };
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Pedidos', icon: <ShoppingBag size={20} />, badge: stats.pendingOrders },
    { id: 'inventory', label: 'Inventario', icon: <Package size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Dashboard General</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Ventas Totales</span>
                <span className="stat-value" style={{ color: 'var(--success)' }}>
                  ${stats.totalSales.toLocaleString()}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pedidos Pendientes</span>
                <span className="stat-value" style={{ color: 'var(--primary)' }}>
                  {stats.pendingOrders}
                </span>
              </div>
            </div>
          </div>
        );
      case 'inventory': return <InventoryManager />;
      case 'orders': return <OrderManager />;
      default: return <div>Select a module</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header" style={{
        display: 'none', // Shown via CSS media query
        justifyContent: 'space-between', padding: '1rem',
        backgroundColor: '#020617', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 200
      }}>
        <div className="logo"><span>Proton</span>Gestión</div>
        <button className="btn-icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ color: 'white', background: 'none', border: 'none' }}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}></div>
          <span className="nav-text">Proton<span style={{ color: 'var(--primary)' }}>Admin</span></span>
        </div>

        <nav className="nav-menu">
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
            >
              {item.icon}
              <span className="nav-text">{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--error)',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item">
            <Settings size={20} />
            <span className="nav-text">Configuración</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
