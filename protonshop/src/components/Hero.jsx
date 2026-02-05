import React from 'react';
import bannerImg from '../assets/images/banner.png';
import bannerEnvios from '../assets/images/banner-envios.webp';

const Hero = () => {
    return (
        <section style={styles.hero}>
            <div className="container hero-container" style={styles.container}>
                <div className="hero-content" style={styles.content}>
                    <h1 style={styles.title}>Donde la <span style={{ color: 'var(--primary)' }}>Tecnología</span> se encuentra con el Consumo</h1>
                    <p style={styles.subtitle}>Eficiencia y Variedad en cada clic. Explora nuestra selección curada de productos tecnológicos diseñados para tu estilo de vida moderno.</p>
                    <div className="cta-group" style={styles.ctaGroup}>
                        <button className="btn btn-primary">Comprar Ahora</button>
                        <button className="btn btn-outline">Saber Más</button>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <img src={bannerEnvios} alt="Envíos seguros" style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }} />
                    </div>
                </div>
                <div style={styles.imageBox}>
                    <img src={bannerImg} alt="Banner de Bodega China" style={styles.banner} />
                    <div style={styles.glassCard}>
                        <div style={styles.statItem}>
                            <span style={styles.statVal}>5k+</span>
                            <span style={styles.statLabel}>Productos</span>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.statItem}>
                            <span style={styles.statVal}>100%</span>
                            <span style={styles.statLabel}>Seguro</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const styles = {
    hero: {
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
        overflow: 'hidden'
    },
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: '3rem'
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    title: {
        fontSize: '3.5rem',
        lineHeight: '1.2',
        fontWeight: '800',
        letterSpacing: '-1px'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: 'var(--text-muted)',
        maxWidth: '500px'
    },
    ctaGroup: {
        display: 'flex',
        gap: '1rem'
    },
    imageBox: {
        position: 'relative'
    },
    banner: {
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
    },
    glassCard: {
        position: 'absolute',
        bottom: '-20px',
        left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem 2rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        gap: '2rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column'
    },
    statVal: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--primary)'
    },
    statLabel: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    statDivider: {
        width: '1px',
        backgroundColor: 'var(--border)'
    }
};

export default Hero;
