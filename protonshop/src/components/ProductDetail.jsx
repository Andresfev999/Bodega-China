import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus, Check, ShieldCheck, PlayCircle, Share2 } from 'lucide-react';

const ProductDetail = ({ product, onBack, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(product.image);

    const isVideo = (url) => typeof url === 'string' && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm'));

    const handleAddToCart = () => {
        // Add the product multiple times based on quantity
        // In a real app we'd pass quantity, but for now we loop
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product);
        }
        alert('Producto agregado al carrito');
    };

    const discountPercentage = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={onBack} style={styles.backBtn}>
                    <ArrowLeft size={20} /> Volver al catálogo
                </button>
                <button onClick={() => {
                    const url = `${window.location.origin}?product=${product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}`; // Simple slugify inline or pass helper
                    // Better to match logic:
                    const slug = product.name.toString().toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-]+/g, '')
                        .replace(/\-\-+/g, '-')
                        .replace(/^-+/, '')
                        .replace(/-+$/, '');

                    const shareUrl = `${window.location.origin}?product=${slug}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert('Enlace copiado al portapapeles');
                }} style={{ ...styles.backBtn, color: 'var(--primary)', marginBottom: 0 }}>
                    <Share2 size={20} /> Compartir
                </button>
            </div>

            <div style={styles.grid}>
                {/* Left Column: Images */}
                <div style={styles.imageSection}>
                    <div style={styles.mainImageContainer}>
                        {discountPercentage > 0 && (
                            <span style={styles.badge}>-{discountPercentage}%</span>
                        )}
                        {isVideo(mainImage) ? (
                            <video
                                src={mainImage}
                                controls
                                autoPlay
                                style={styles.mainImage}
                                key={mainImage} // Force re-render when source changes
                            />
                        ) : (
                            <img src={mainImage} alt={product.name} style={styles.mainImage} />
                        )}
                    </div>
                    {product.gallery && product.gallery.length > 0 && (
                        <div style={styles.galleryGrid}>
                            <img
                                src={product.image}
                                alt="Main"
                                style={{
                                    ...styles.thumb,
                                    border: mainImage === product.image ? '2px solid var(--primary)' : '1px solid var(--border)'
                                }}
                                onClick={() => setMainImage(product.image)}
                            />
                            {product.gallery.map((img, idx) => (
                                <div
                                    key={idx}
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={() => setMainImage(img)}
                                >
                                    {isVideo(img) ? (
                                        <div style={{
                                            ...styles.thumb,
                                            border: mainImage === img ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: '#000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            <video src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                                <PlayCircle size={24} color="white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={img}
                                            alt={`Gallery ${idx}`}
                                            style={{
                                                ...styles.thumb,
                                                border: mainImage === img ? '2px solid var(--primary)' : '1px solid var(--border)'
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Info */}
                <div style={styles.infoSection}>
                    <div style={styles.header}>
                        <span style={styles.category}>{product.category}</span>
                        <h1 style={styles.title}>{product.name}</h1>
                    </div>

                    <div style={styles.priceBox}>
                        {product.sale_price && product.sale_price < product.price ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={styles.oldPrice}>Antes: ${product.price.toLocaleString()}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={styles.currentPrice}>${product.sale_price.toLocaleString()}</span>
                                    <span style={styles.savings}>Ahorras: ${(product.price - product.sale_price).toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <span style={styles.currentPrice}>${product.price.toLocaleString()}</span>
                        )}
                    </div>

                    <div style={styles.stockInfo}>
                        <Check size={18} color="var(--success)" />
                        <span>Disponible en stock: {product.stock || 'Consultar'} unidades</span>
                    </div>

                    <div style={styles.actions}>
                        <div style={styles.quantityBox}>
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                style={styles.qtyBtn}
                            >
                                <Minus size={16} />
                            </button>
                            <span style={styles.qtyVal}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                style={styles.qtyBtn}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <button className="btn btn-primary" style={styles.addBtn} onClick={handleAddToCart}>
                            <ShoppingCart size={20} /> Agregar {quantity > 1 ? `(${quantity})` : ''}
                        </button>
                    </div>

                    <div style={styles.meta}>
                        <div style={styles.metaItem}>
                            <ShieldCheck size={18} color="var(--primary)" />
                            <span>Garantía de calidad ProtonShop</span>
                        </div>
                    </div>

                    <div style={styles.descriptionBox}>
                        <h3>Detalles del Producto</h3>
                        <p style={styles.description}>{product.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        animation: 'fadeIn 0.3s ease'
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '1rem',
        marginBottom: '2rem',
        fontWeight: '500',
        transition: 'var(--transition)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '4rem',
        alignItems: 'start'
    },
    imageSection: {
        position: 'sticky',
        top: '100px'
    },
    mainImageContainer: {
        position: 'relative',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        backgroundColor: 'white',
        aspectRatio: '1/1'
    },
    mainImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    galleryGrid: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
        flexWrap: 'wrap'
    },
    thumb: {
        width: '70px',
        height: '70px',
        borderRadius: '8px',
        objectFit: 'cover',
        cursor: 'pointer',
        transition: 'var(--transition)'
    },
    badge: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        backgroundColor: 'var(--error)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '1.1rem',
        zIndex: 2
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    category: {
        color: 'var(--primary)',
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: '0.9rem',
        letterSpacing: '1px'
    },
    title: {
        fontSize: '2.5rem',
        lineHeight: '1.2',
        color: 'var(--text-main)',
        fontWeight: '800'
    },
    priceBox: {
        padding: '1.5rem',
        backgroundColor: 'var(--bg-soft)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)'
    },
    oldPrice: {
        fontSize: '1.1rem',
        color: 'var(--text-muted)',
        textDecoration: 'line-through',
        marginBottom: '0.25rem'
    },
    currentPrice: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: 'var(--text-main)'
    },
    savings: {
        color: 'var(--success)',
        fontWeight: '600',
        fontSize: '1.1rem'
    },
    stockInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-main)',
        fontWeight: '500'
    },
    actions: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    quantityBox: {
        display: 'flex',
        alignItems: 'center',
        border: '2px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden'
    },
    qtyBtn: {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--text-main)'
    },
    qtyVal: {
        width: '40px',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: '1.1rem'
    },
    addBtn: {
        flex: 1,
        minWidth: '200px',
        padding: '1rem 2rem',
        fontSize: '1.1rem',
        justifyContent: 'center'
    },
    meta: {
        display: 'flex',
        gap: '2rem',
        padding: '1.5rem 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
    },
    descriptionBox: {
        marginTop: '1rem'
    },
    description: {
        lineHeight: '1.8',
        color: 'var(--text-muted)',
        fontSize: '1.05rem',
        whiteSpace: 'pre-line'
    }
};

export default ProductDetail;
