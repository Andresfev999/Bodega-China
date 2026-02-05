import React from 'react';
import { ShoppingCart, Plus, Eye } from 'lucide-react';
import { formatCurrency } from '../utils';

const ProductCard = ({ product, onAddToCart, onSelect }) => {
    return (
        <div style={styles.card}>
            <div style={styles.imageContainer} onClick={onSelect}>
                <img src={product.image} alt={product.name} style={styles.image} />
                <div style={styles.overlay}>
                    <button style={styles.overlayBtn} title="Ver Detalles" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                        <Eye size={18} />
                    </button>
                    <button style={styles.overlayBtn} title="Agregar al Carrito" onClick={(e) => { e.stopPropagation(); onAddToCart(); }}>
                        <ShoppingCart size={18} />
                    </button>
                </div>
                <span style={styles.categoryBadge}>{product.category}</span>
                {product.sale_price && product.sale_price < product.price && (
                    <div style={styles.discountBadge}>
                        -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                    </div>
                )}
                {/* Cash on Delivery Badge */}
                <div style={styles.codBadge}>
                    🚚 Pago Contraentrega
                </div>
            </div>
            <div style={styles.info}>
                <h3 style={styles.name}>{product.name}</h3>
                <p style={styles.desc}>{product.description.substring(0, 60)}...</p>
                <div style={styles.footer}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {product.sale_price && product.sale_price < product.price ? (
                            <>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                    {formatCurrency(product.price)}
                                </span>
                                <span style={styles.price}>{formatCurrency(product.sale_price)}</span>
                            </>
                        ) : (
                            <span style={styles.price}>{formatCurrency(product.price)}</span>
                        )}
                    </div>
                    <button className="btn btn-primary" style={styles.buyBtn} onClick={onAddToCart}>
                        <Plus size={16} /> Agregar
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'var(--bg-pure)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition)',
        cursor: 'pointer',
        '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: 'var(--shadow-lg)'
        }
    },
    imageContainer: {
        position: 'relative',
        height: '220px',
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'var(--transition)'
    },
    overlay: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 191, 255, 0.2)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        opacity: 0,
        transition: 'var(--transition)',
        // Logic for hover handled in JS or CSS class usually, but keeping it simple here
    },
    overlayBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'white',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-md)'
    },
    categoryBadge: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: 'var(--primary)',
        textTransform: 'uppercase'
    },
    info: {
        padding: '1.25rem'
    },
    name: {
        fontSize: '1.1rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        color: 'var(--text-main)'
    },
    desc: {
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
        lineHeight: '1.4'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: {
        fontSize: '1.25rem',
        fontWeight: '800',
        color: 'var(--primary)'
    },
    buyBtn: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem'
    },
    discountBadge: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        backgroundColor: 'var(--error)',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '700'
    },
    codBadge: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        backgroundColor: 'rgba(16, 185, 129, 0.9)', // Green with opacity
        color: 'white',
        padding: '0.4rem',
        fontSize: '0.8rem',
        fontWeight: '600',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        backdropFilter: 'blur(2px)'
    }
};

export default ProductCard;
