import React, { useState } from 'react';

import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Heart, PlayCircle, ShoppingCart, Share2, Star, Clock, Package } from 'lucide-react';
import { supabase } from '../supabase';

const CAMISETA_PRICES = {
    'Niños': 50000,
    'Dama': 60000,
    'Hombre': 60000,
    'Conjunto': 65000
};

const SIZES = {
    'Niños': ['4', '6', '8', '10', '12', '14', '16'],
    'Dama': ['S', 'M', 'L', 'XL'],
    'Hombre': ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'],
    'Conjunto': ['4', '6', '8', '10', '12', '14', '16']
};

const LandingPage = ({ onBack, user, product: initialProduct, addToCart, onCartOpen }) => {
    const [selectedType, setSelectedType] = useState('Hombre');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(initialProduct || null);
    const [activeImage, setActiveImage] = useState(initialProduct?.image || null);


    React.useEffect(() => {
        if (!product) {
            const fetchProduct = async () => {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('name', 'Camiseta Colombia Oficial 2026')
                    .single();
                if (data) {
                    setProduct(data);
                    setActiveImage(data.image);
                }
            };
            fetchProduct();
        }
    }, [product]);

    const isVideo = (url) => typeof url === 'string' && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm'));

    // Base price from DB or fallback, + extra for larger sizes
    const basePrice = product ? product.price : CAMISETA_PRICES[selectedType];
    const currentPrice = basePrice + (['XXL', '3XL', '4XL', '5XL', '6XL'].includes(selectedSize) ? 5000 : 0);

    const handleAddToCart = () => {
        if (!selectedSize) return alert('¡Por favor selecciona tu talla para continuar!');

        const newItem = {
            id: product ? product.id : 'col-2026-promo', // Use real ID if available
            name: `Camiseta Colombia 2026 - ${selectedType} (Talla ${selectedSize})`,
            price: currentPrice,
            image: product?.image || 'https://images.unsplash.com/photo-1549488346-60193132e0e4?q=80&w=600&auto=format&fit=crop',
            selectedSize: selectedSize,
            selectedType: selectedType
        };

        for (let i = 0; i < quantity; i++) {
            addToCart(newItem);
        }

        onCartOpen();
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'sans-serif', color: '#1a1a1a' }}>
            {/* Promo Banner */}
            <div style={{ backgroundColor: '#ce1126', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>
                🚚 ENVÍO GRATIS Y PAGO CONTRAENTREGA EN TODO EL PAÍS 🇨🇴
            </div>

            {/* Header */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                <button onClick={onBack} style={{ background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '50px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <ArrowLeft size={20} /> VOLVER
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => {
                        const slug = product?.name.toString().toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w\-]+/g, '')
                            .replace(/\-\-+/g, '-')
                            .replace(/^-+/, '')
                            .replace(/-+$/, '');

                        const url = `${window.location.origin}?product=${slug}`;
                        navigator.clipboard.writeText(url);
                        alert('¡Enlace copiado! Compártelo con orgullo.');
                    }} style={{ background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1a1a', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} title="Compartir">
                        <Share2 size={20} />
                    </button>
                    <div style={{ fontWeight: '900', fontSize: '1.5rem', color: '#1a1a1a', textShadow: '0 2px 0 rgba(255,255,255,0.5)' }}>COLOMBIA<span style={{ color: '#ce1126' }}>2026</span></div>
                </div>
            </div>

            {/* Hero Grid */}
            <div className="landing-hero" style={{ maxWidth: '1100px', margin: '1rem auto', display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: '3rem', padding: '1rem' }}>

                {/* Left: Product Showcase */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{
                        position: 'relative',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '4px solid white',
                        aspectRatio: '1/1',
                        backgroundColor: 'white'
                    }}>
                        {isVideo(activeImage) ? (
                            <video
                                src={activeImage}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <img
                                src={activeImage || "https://images.unsplash.com/photo-1549488346-60193132e0e4?q=80&w=800&auto=format&fit=crop"}
                                alt="Camiseta Colombia 2026"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'linear-gradient(45deg, #ce1126, #b71c1c)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '50px', fontWeight: '800', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(206, 17, 38, 0.4)' }}>
                            🔥 EDICIÓN LIMITADA
                        </div>
                    </div>

                    {/* Gallery Thumbnails */}
                    {product?.gallery && product.gallery.length > 0 && (
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            <div
                                onClick={() => setActiveImage(product.image)}
                                style={{
                                    width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                                    border: activeImage === product.image ? '3px solid #1a1a1a' : '3px solid rgba(255,255,255,0.5)',
                                    backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            ></div>
                            {product.gallery.map((media, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImage(media)}
                                    style={{
                                        width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                                        border: activeImage === media ? '3px solid #1a1a1a' : '3px solid rgba(255,255,255,0.5)',
                                        position: 'relative', backgroundColor: '#000',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {isVideo(media) ? (
                                        <>
                                            <video src={media} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                                <PlayCircle size={24} color="white" />
                                            </div>
                                        </>
                                    ) : (
                                        <img src={media} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Details & Purchase */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '3.5rem', lineHeight: '0.9', marginBottom: '1rem', color: '#1a1a1a', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                            LA PIEL <br />
                            <span style={{ color: '#ce1126', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>DE TU PASIÓN</span>
                        </h1>

                        {/* Rating Stars */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="#fbc531" color="#fbc531" />)}
                            <span style={{ fontWeight: 'bold', marginLeft: '0.5rem', fontSize: '1.1rem' }}>4.9/5</span>
                            <span style={{ color: '#555', marginLeft: '0.25rem' }}>(+1.2k Clientes Felices)</span>
                        </div>

                        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333', marginBottom: '1.5rem', fontWeight: '500' }}>
                            🇨🇴 <strong>¡Vístete con grandeza!</strong> La nueva edición oficial 2026 ya está aquí. Diseñada para los verdaderos hinchas que sienten cada gol.
                            <br /><br />
                            ✨ Calidad Premium 1.1<br />
                            ❄️ Tecnología Transpirable<br />
                            🛡️ Escudo Bordado de Alta Definición
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={featureCardStyle}>
                            <Truck size={24} color="#ce1126" />
                            <div>
                                <div style={{ fontWeight: '800' }}>Envío Rápido</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>3-5 días hábiles</div>
                            </div>
                        </div>
                        <div style={featureCardStyle}>
                            <Package size={24} color="#ce1126" />
                            <div>
                                <div style={{ fontWeight: '800' }}>Pago Contraentrega</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Paga al recibir en casa</div>
                            </div>
                        </div>
                    </div>

                    {/* Premium Detail Visuals - New Section */}
                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <img src="/assets/colombia-special-detail.png" alt="Escudo Detalle" style={{ width: '100%', borderRadius: '12px', marginBottom: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ce1126' }}>ESCUDO BORDADO</span>
                            <span style={{ fontSize: '0.8rem', color: '#555' }}>Alta Definición</span>
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <img src="/assets/colombia-special-front.png" alt="Tela Detalle" style={{ width: '100%', borderRadius: '12px', marginBottom: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fbc531' }}>TELA RESPIRABLE</span>
                            <span style={{ fontSize: '0.8rem', color: '#555' }}>Tecnología Heat-Dry</span>
                        </div>
                    </div>

                    {/* Purchasing Card */}
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>1. ELIGE TU ESTILO</label>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {Object.keys(SIZES).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { setSelectedType(type); setSelectedSize(''); }}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '12px',
                                            border: selectedType === type ? '2px solid #1a1a1a' : '2px solid #f1f2f6',
                                            backgroundColor: selectedType === type ? '#1a1a1a' : 'white',
                                            color: selectedType === type ? 'white' : '#1a1a1a',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>2. SELECCIONA TALLA</label>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {SIZES[selectedType].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            border: selectedSize === size ? '2px solid #ce1126' : '2px solid #f1f2f6',
                                            backgroundColor: selectedSize === size ? '#ce1126' : 'white',
                                            color: selectedSize === size ? 'white' : '#1a1a1a',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ borderTop: '2px dashed #f1f2f6', paddingTop: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#777', fontWeight: '600' }}>Precio Final</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a1a1a', lineHeight: '1' }}>${currentPrice.toLocaleString()}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f2f6', borderRadius: '12px', padding: '0.4rem' }}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>-</button>
                                    <span style={{ padding: '0 0.8rem', fontWeight: '700', fontSize: '1.1rem' }}>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>+</button>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={loading}
                                className="buy-btn"
                                style={{
                                    width: '100%',
                                    padding: '1.2rem',
                                    backgroundColor: '#1a1a1a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '1.2rem',
                                    fontWeight: '800',
                                    cursor: loading ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.8rem',
                                    transition: 'transform 0.1s',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                }}
                            >
                                <ShoppingCart size={24} />
                                {loading ? 'PROCESANDO...' : 'AÑADIR AL CARRITO'}
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#777', fontWeight: '500' }}>
                                <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                Compra protegida | Paga cuando recibas
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <style>
                {`
                @media (max-width: 900px) {
                    .landing-hero {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                    .buy-btn:active {
                        transform: scale(0.98);
                    }
                }
                `}
            </style>
        </div>
    );
};

const featureCardStyle = {
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: '1rem',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid rgba(255,255,255,0.8)'
};

const InfoBadge = ({ icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.4)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '700', color: '#1a1a1a', border: '1px solid rgba(0,0,0,0.05)' }}>
        {icon}
        {text}
    </div>
);

export default LandingPage;
