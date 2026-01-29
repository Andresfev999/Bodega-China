import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartModal from './components/CartModal';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import CustomerOrders from './components/CustomerOrders';
import { getStoreData, slugify, recordVisit, getVisitCount } from './store';
import { supabase } from './supabase';
import LandingPage from './components/LandingPage';
import CashOnDeliveryBanner from './components/CashOnDeliveryBanner';
import { Users } from 'lucide-react';

function App() {
  const [data, setData] = useState({ products: [], categories: [] });
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileView, setIsProfileView] = useState(false);
  const [isOrdersView, setIsOrdersView] = useState(false);
  const [isLandingView, setIsLandingView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [totalVisits, setTotalVisits] = useState(0);

  // Auth session handling
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('protonshop_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('protonshop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prevCart => [...prevCart, product]);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const storeData = await getStoreData();
      setData(storeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Record visit and fetch total
    recordVisit();
    getVisitCount().then(count => setTotalVisits(count));
  }, []);

  // Handle URL deep linking
  useEffect(() => {
    if (data.products.length > 0 && !selectedProduct && !isLandingView) {
      const params = new URLSearchParams(window.location.search);
      const productParam = params.get('product');

      if (productParam) {
        // Try matching by ID first, then by slug
        const product = data.products.find(p =>
          p.id == productParam || slugify(p.name) === productParam
        );

        if (product) {
          if (product.name.toLowerCase().includes('colombia')) {
            setIsLandingView(true);
            setSelectedProduct(product);
          } else {
            setSelectedProduct(product);
          }
        }
      }
    }
  }, [data.products]);

  const filteredProducts = data.products.filter(p => {
    let matchesCategory = true;
    if (activeCategory === 'Ofertas Especiales') {
      matchesCategory = p.sale_price && p.sale_price < p.price;
    } else if (activeCategory !== 'Todos') {
      matchesCategory = p.category === activeCategory;
    }

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app">
      <Navbar
        cartCount={cart.length}
        onCartOpen={() => setIsCartOpen(true)}
        onAuthOpen={() => setIsAuthOpen(true)}
        onProfileToggle={() => { setIsProfileView(!isProfileView); setIsOrdersView(false); setSelectedProduct(null); setIsLandingView(false); }}
        onOrdersToggle={() => { setIsOrdersView(!isOrdersView); setIsProfileView(false); setSelectedProduct(null); setIsLandingView(false); }}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        searchQuery={searchQuery}
        user={user}
      />
      <CashOnDeliveryBanner />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthChange={setUser}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onClearCart={() => setCart([])}
        user={user}
      />

      {isLandingView ? (
        <LandingPage
          onBack={() => { setIsLandingView(false); setSelectedProduct(null); }}
          user={user}
          product={selectedProduct}
          addToCart={addToCart}
          onCartOpen={() => setIsCartOpen(true)}
        />
      ) : isOrdersView ? (
        <main className="container">
          <CustomerOrders user={user} onBack={() => setIsOrdersView(false)} />
        </main>
      ) : isProfileView ? (
        <main className="container">
          <UserProfile user={user} onBack={() => setIsProfileView(false)} />
        </main>
      ) : selectedProduct ? (
        <main className="container">
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={(p) => addToCart(p || selectedProduct)} // Handle both passed product or current selected
          />
        </main>
      ) : (
        <main>
          <Hero />
          <section className="container" style={styles.catalogSection}>
            <div className="catalog-header" style={styles.catalogHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Catálogo de Productos</h2>
                <p style={styles.sectionDesc}>Descubre nuestras últimas novedades tecnológicas</p>
                <div onClick={() => setIsLandingView(true)} style={{ marginTop: '1rem', cursor: 'pointer', background: 'linear-gradient(45deg, #fbc531, #ce1126)', padding: '1rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  🏆 COLOMBIA 2026 - ¡EDICIÓN ESPECIAL! VER AHORA ➡️
                </div>
              </div>
              <div style={styles.categories}>
                <button
                  style={{ ...styles.catBtn, backgroundColor: activeCategory === 'Todos' ? 'var(--primary)' : 'white', color: activeCategory === 'Todos' ? 'white' : 'var(--text-main)' }}
                  onClick={() => setActiveCategory('Todos')}
                >
                  Todos
                </button>
                <button
                  style={{ ...styles.catBtn, backgroundColor: activeCategory === 'Ofertas Especiales' ? 'var(--secondary)' : 'white', color: activeCategory === 'Ofertas Especiales' ? 'var(--text-main)' : 'var(--text-main)' }}
                  onClick={() => setActiveCategory('Ofertas Especiales')}
                >
                  Ofertas 🔥
                </button>
                {data.categories.map(cat => (
                  <button
                    key={cat}
                    style={{ ...styles.catBtn, backgroundColor: activeCategory === cat ? 'var(--primary)' : 'white', color: activeCategory === cat ? 'white' : 'var(--text-main)' }}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={styles.loadingState}>
                <div className="spinner"></div>
                <p>Cargando productos desde Supabase...</p>
              </div>
            ) : (
              <>
                <div style={styles.productGrid}>
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={() => addToCart(product)}
                      onSelect={() => {
                        setSelectedProduct(product);
                        if (product.name.toLowerCase().includes('colombia')) {
                          setIsLandingView(true);
                        }
                        window.scrollTo(0, 0);
                      }}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div style={styles.emptyState}>
                    <p>No se encontraron productos en esta categoría.</p>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      )}

      <footer style={styles.footer}>
        <div className="container" style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <span style={styles.footerLogo}>Proton<span style={{ color: 'var(--primary)' }}>Shop</span></span>
            <p style={styles.footerTagline}>La tecnología se encuentra con el consumo.</p>
          </div>
          <p style={styles.copyright}>&copy; 2026 ProtonShop. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Users size={14} />
            <span>Visitas: {totalVisits.toLocaleString()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  catalogSection: { padding: '4rem 0' },
  catalogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '3rem'
  },
  sectionTitle: { fontSize: '2rem', marginBottom: '0.5rem' },
  sectionDesc: { color: 'var(--text-muted)' },
  categories: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  catBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition)'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2.5rem'
  },
  emptyState: { textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' },
  loadingState: {
    textAlign: 'center',
    padding: '4rem',
    color: 'var(--primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  footer: {
    backgroundColor: 'var(--bg-pure)',
    borderTop: '1px solid var(--border)',
    padding: '4rem 0 2rem 0',
    marginTop: '4rem'
  },
  footerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2rem'
  },
  footerBrand: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  footerLogo: { fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-headings)' },
  footerTagline: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  copyright: { fontSize: '0.85rem', color: 'var(--text-muted)' }
};

export default App;
