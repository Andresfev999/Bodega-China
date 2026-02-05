import React from 'react';
import { ArrowLeft, Tag } from 'lucide-react';

// Import category images
import cat1 from '../assets/images/categories/categoria (1).png';
import cat2 from '../assets/images/categories/categoria (2).png';
import cat3 from '../assets/images/categories/categoria (3).png';
import cat4 from '../assets/images/categories/categoria (4).png';
import cat5 from '../assets/images/categories/categoria (5).png';
import cat6 from '../assets/images/categories/categoria (6).png';
import cat7 from '../assets/images/categories/categoria (7).png';
import cat8 from '../assets/images/categories/categoria (8).png';

const categoryImages = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8];

const CategoriesView = ({ categories, onSelectCategory, onBack }) => {
    return (
        <div style={styles.container}>
            <button onClick={onBack} style={styles.backBtn}>
                <ArrowLeft size={20} /> Volver al Catálogo
            </button>

            <div style={styles.header}>
                <h2 style={styles.title}>Explorar Categorías</h2>
                <p style={styles.subtitle}>Encuentra exactamente lo que buscas navegando por nuestras colecciones.</p>
            </div>

            <div style={styles.grid}>
                <div
                    style={{ ...styles.card, ...styles.allCard }}
                    onClick={() => onSelectCategory('Todos')}
                >
                    <div style={styles.iconBox}>
                        <Tag size={32} color="white" />
                    </div>
                    <h3 style={styles.cardTitle}>Ver Todo</h3>
                    <p style={styles.cardDesc}>Explora nuestro catálogo completo</p>
                </div>

                <div
                    style={{ ...styles.card, ...styles.offerCard }}
                    onClick={() => onSelectCategory('Ofertas Especiales')}
                >
                    <div style={styles.iconBox}>
                        <span style={{ fontSize: '2rem' }}>🔥</span>
                    </div>
                    <h3 style={styles.cardTitle}>Ofertas</h3>
                    <p style={styles.cardDesc}>Descuentos imperdibles</p>
                </div>

                {categories.map((cat, index) => (
                    <div
                        key={cat}
                        style={{ ...styles.card, padding: '10px' }}
                        onClick={() => onSelectCategory(cat)}
                    >
                        <div style={styles.imageContainer}>
                            <img
                                src={categoryImages[index % categoryImages.length]}
                                alt={cat}
                                style={styles.catImage}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem 0',
        maxWidth: '1200px',
        margin: '0 auto',
        animation: 'fadeIn 0.5s ease-out'
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        fontSize: '1rem',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        marginBottom: '2rem',
        padding: '0.5rem',
        borderRadius: '8px',
        transition: 'var(--transition)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '4rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, var(--text-main) 0%, var(--text-muted) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        color: 'var(--text-muted)',
        fontSize: '1.1rem',
        maxWidth: '600px',
        margin: '0 auto'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
        padding: '0 1rem'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden'
    },
    allCard: {
        background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
        color: 'white',
        border: 'none'
    },
    offerCard: {
        background: 'linear-gradient(135deg, #fbc531 0%, #e1b12c 100%)',
        color: 'white',
        border: 'none'
    },
    iconBox: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        background: 'rgba(255,255,255,0.2)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },
    imageContainer: {
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '15px',
        overflow: 'hidden'
    },
    catImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease'
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
    },
    cardDesc: {
        fontSize: '0.9rem',
        opacity: 0.9
    }
};

// Inject simple keyframe animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

export default CategoriesView;
