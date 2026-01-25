import React, { useState } from 'react';
import { ShoppingCart, Atom, Search, User, Menu, X, LogOut, UserCircle, Package } from 'lucide-react';
import { supabase } from '../supabase';

const Navbar = ({ cartCount, onCartOpen, onAuthOpen, onProfileToggle, onOrdersToggle, onSearch, searchQuery, user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.container}>
                {/* Logo */}
                <div style={styles.logoCont} onClick={() => window.location.reload()}>
                    <div style={styles.iconBox}>
                        <Atom size={24} color="var(--primary)" />
                        <ShoppingCart size={14} color="var(--secondary)" style={styles.cartIcon} />
                    </div>
                    <span style={styles.logoText}>Proton<span style={{ color: 'var(--primary)' }}>Shop</span></span>
                </div>

                {/* Desktop Nav */}
                <div className="nav-links-desktop" style={styles.desktopLinks}>
                    <a href="#" style={styles.link} onClick={(e) => { e.preventDefault(); window.location.reload(); }}>Catálogo</a>
                    <a href="#" style={styles.link}>Categorías</a>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                    <div style={styles.searchContainer}>
                        {isSearchVisible && (
                            <input
                                type="text"
                                style={styles.searchInput}
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => onSearch(e.target.value)}
                                autoFocus
                            />
                        )}
                        <button
                            style={styles.actionBtn}
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                            title="Buscar"
                        >
                            <Search size={18} color={isSearchVisible ? 'var(--primary)' : 'var(--text-muted)'} />
                        </button>
                    </div>


                    <div style={{ position: 'relative' }}>
                        {user ? (
                            <>
                                <button
                                    style={styles.actionBtn}
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    title="Mi Cuenta"
                                >
                                    <div style={styles.avatar}>{user.email[0].toUpperCase()}</div>
                                </button>

                                {isUserMenuOpen && (
                                    <div style={styles.userDropdown}>
                                        <button style={styles.dropdownItem} onClick={() => { onProfileToggle(); setIsUserMenuOpen(false); }}>
                                            <UserCircle size={16} /> Mi Perfil
                                        </button>
                                        <button style={styles.dropdownItem} onClick={() => { onOrdersToggle(); setIsUserMenuOpen(false); }}>
                                            <Package size={16} /> Mis Pedidos
                                        </button>
                                        <button style={{ ...styles.dropdownItem, color: 'var(--error)' }} onClick={handleLogout}>
                                            <LogOut size={16} /> Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button style={styles.actionBtn} onClick={onAuthOpen} title="Ingresar">
                                <User size={20} color="var(--text-muted)" />
                            </button>
                        )}
                    </div>

                    <button
                        style={{ ...styles.actionBtn, position: 'relative' }}
                        onClick={onCartOpen}
                        title="Ver Carrito"
                    >
                        <ShoppingCart size={20} color="var(--text-muted)" />
                        {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                    </button>

                    <div className="mobile-toggle" style={styles.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div style={styles.mobileMenu}>
                    <a href="#" style={styles.mobileLink}>Catálogo</a>
                    <a href="#" style={styles.mobileLink}>Categorías</a>
                    <a href="#" style={styles.mobileLink}>Ofertas Especiales</a>
                </div>
            )}
        </nav>
    );
};

const styles = {
    nav: {
        backgroundColor: 'var(--bg-pure)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: '80px',
        display: 'flex',
        alignItems: 'center'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    logoCont: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer'
    },
    iconBox: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        backgroundColor: '#00BFFF15',
        borderRadius: '10px'
    },
    cartIcon: {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.2))'
    },
    logoText: {
        fontSize: '1.5rem',
        fontWeight: '700',
        fontFamily: 'var(--font-headings)',
        letterSpacing: '-0.5px'
    },
    desktopLinks: {
        display: 'flex',
        gap: '2.5rem'
    },
    link: {
        fontSize: '0.95rem',
        fontWeight: '500',
        color: 'var(--text-main)',
        '&:hover': {
            color: 'var(--primary)'
        }
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    searchInput: {
        padding: '0.4rem 0.75rem',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        fontSize: '0.85rem',
        width: '150px',
        outline: 'none',
        transition: 'var(--transition)'
    },
    actionBtn: {
        padding: '0.5rem',
        cursor: 'pointer',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'var(--transition)',
        border: 'none',
        backgroundColor: 'transparent'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary)',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    userDropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '160px',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        marginTop: '0.5rem',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        fontSize: '0.85rem',
        fontWeight: '500',
        width: '100%',
        textAlign: 'left',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'var(--bg-soft)'
        }
    },
    badge: {
        position: 'absolute',
        top: '0',
        right: '0',
        backgroundColor: 'var(--secondary)',
        color: 'var(--text-main)',
        fontSize: '0.7rem',
        fontWeight: '700',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mobileToggle: {
        display: 'none',
        cursor: 'pointer'
    },
    mobileMenu: {
        position: 'absolute',
        top: '80px',
        left: 0,
        width: '100%',
        backgroundColor: 'white',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'var(--shadow-lg)'
    },
    mobileLink: {
        fontSize: '1.1rem',
        fontWeight: '500',
        padding: '0.5rem 0'
    },
    mobileAdmin: {
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-soft)',
        borderRadius: 'var(--radius-md)',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    }
};

export default Navbar;
