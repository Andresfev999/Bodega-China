import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, CheckCircle, Loader2, Plus, Minus } from 'lucide-react';
import { createOrder, getProfile } from '../store';
import { formatCurrency } from '../utils';

const CartModal = ({ isOpen, onClose, cart, onClearCart, updateCartQuantity, removeFromCart, user }) => {
    const [step, setStep] = useState(1); // 1: Review, 2: Checkout, 3: Success
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        customer_municipio: '',
        customer_departamento: ''
    });

    // Pre-fill from profile when modal opens
    useEffect(() => {
        const loadProfileData = async () => {
            if (user && isOpen && !formData.customer_name) {
                try {
                    const profile = await getProfile(user.id);
                    if (profile) {
                        setFormData({
                            customer_name: profile.full_name || '',
                            customer_phone: profile.phone || '',
                            customer_address: profile.address || '',
                            customer_municipio: profile.municipio || '',
                            customer_departamento: profile.departamento || ''
                        });
                    }
                } catch (error) {
                    console.error('Error pre-filling profile:', error);
                }
            }
        };
        loadProfileData();
    }, [user, isOpen]);

    const handleManualFill = async () => {
        if (!user) return alert('Por favor inicia sesión para cargar tus datos.');
        setLoading(true);
        try {
            const profile = await getProfile(user.id);
            if (profile) {
                setFormData({
                    customer_name: profile.full_name || '',
                    customer_phone: profile.phone || '',
                    customer_address: profile.address || '',
                    customer_municipio: profile.municipio || '',
                    customer_departamento: profile.departamento || ''
                });
            } else {
                alert('No se encontraron datos en tu perfil. Ve a "Mi Perfil" para guardarlos.');
            }
        } catch (error) {
            alert('Error al cargar datos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const total = cart.reduce((sum, item) => {
        const finalPrice = item.sale_price && item.sale_price < item.price ? item.sale_price : item.price;
        return sum + finalPrice * (item.quantity || 1);
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                ...formData,
                total,
                items: cart.map(item => ({
                    ...item,
                    quantity: item.quantity || 1,
                    price: item.sale_price && item.sale_price < item.price ? item.sale_price : item.price
                })),
                status: 'Pendiente',
                user_id: user?.id || null
            };
            await createOrder(orderData);
            setStep(3);
            onClearCart();
        } catch (error) {
            alert('Error al procesar el pedido: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3>{step === 3 ? '¡Pedido Exitoso!' : 'Tu Carrito'}</h3>
                    <button style={styles.closeBtn} onClick={onClose} disabled={loading}>
                        <X size={24} />
                    </button>
                </div>

                <div style={styles.content}>
                    {step === 1 && (
                        <>
                            {cart.length === 0 ? (
                                <div style={styles.empty}>
                                    <ShoppingBag size={48} color="var(--text-muted)" />
                                    <p>Tu carrito está vacío</p>
                                </div>
                            ) : (
                                <>
                                    <div style={styles.itemList}>
                                        {cart.map((item, index) => (
                                            <div key={`${item.id}-${index}`} style={styles.item}>
                                                <img src={item.image} alt={item.name} style={styles.itemImage} />
                                                <div style={styles.itemInfo}>
                                                    <h4>{item.name}</h4>
                                                    {item.sale_price && item.sale_price < item.price ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                                                {formatCurrency(item.price)}
                                                            </span>
                                                            <span style={{ color: 'var(--success)', fontWeight: '700' }}>
                                                                {formatCurrency(item.sale_price)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span>{formatCurrency(item.price)}</span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => updateCartQuantity(item.id, -1)}
                                                        style={styles.qtyBtn}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span style={{ fontWeight: '600', minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity || 1}</span>
                                                    <button
                                                        onClick={() => updateCartQuantity(item.id, 1)}
                                                        style={styles.qtyBtn}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={styles.deleteBtn}
                                                    title="Eliminar producto"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={styles.totalRow}>
                                        <span>Total:</span>
                                        <span style={styles.totalPrice}>{formatCurrency(total)}</span>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={styles.btnCheckout}
                                        onClick={() => setStep(2)}
                                    >
                                        <ShoppingBag size={20} style={{ marginRight: '8px' }} />
                                        COMPRAR AHORA
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            {/* Promotional Banners */}
                            <div style={styles.bannerContainer}>
                                <img src="/src/assets/images/promo/envios.png" alt="Envío Gratis" style={styles.bannerImg} onError={(e) => e.target.style.display = 'none'} />
                                <img src="/src/assets/images/promo/garantia.png" alt="Garantía" style={styles.bannerImg} onError={(e) => e.target.style.display = 'none'} />
                            </div>

                            <div style={styles.formHeaderRow}>
                                <div>
                                    <h4 style={{ color: '#D21F1F', marginBottom: '5px' }}>Completa tus detalles</h4>
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Teléfono de Contacto</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.customer_phone}
                                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Dirección de Entrega</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={formData.customer_address}
                                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                                />
                            </div>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label>Departamento</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customer_departamento}
                                        onChange={(e) => setFormData({ ...formData, customer_departamento: e.target.value })}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label>Municipio</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customer_municipio}
                                        onChange={(e) => setFormData({ ...formData, customer_municipio: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={styles.totalRow}>
                                <span>Total a Pagar:</span>
                                <span style={styles.totalPrice}>{formatCurrency(total)}</span>
                            </div>
                            <div style={styles.actions}>
                                <button type="button" style={styles.btnGhost} onClick={() => setStep(1)} disabled={loading}>Volver</button>
                                <button type="submit" className="btn btn-primary" style={styles.btnFlex} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar Pedido'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div style={styles.success}>
                            <CheckCircle size={64} color="var(--success)" />
                            <h4>¡Gracias por tu compra!</h4>
                            <p>Tu pedido ha sido registrado con éxito. Nos pondremos en contacto pronto para coordinar la entrega física y el pago.</p>
                            <button className="btn btn-primary" style={styles.btnFull} onClick={() => { onClose(); setStep(1); }}>
                                Seguir Comprando
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
    },
    modal: {
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '500px',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
        padding: '1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)'
    },
    content: {
        padding: '1.5rem',
        maxHeight: '70vh',
        overflowY: 'auto'
    },
    empty: {
        textAlign: 'center',
        padding: '3rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        color: 'var(--text-muted)'
    },
    itemList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-soft)',
        borderRadius: '1rem'
    },
    itemImage: {
        width: '50px',
        height: '50px',
        borderRadius: '8px',
        objectFit: 'cover'
    },
    itemInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '2px dashed var(--border)',
        marginBottom: '1.5rem',
        fontSize: '1.1rem',
        fontWeight: '700'
    },
    totalPrice: {
        color: '#D21F1F', // Rojo China
        fontSize: '1.5rem'
    },
    btnCheckout: {
        width: '100%',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ce1126', // Rojo China
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: '800',
        borderRadius: '50px',
        border: '3px solid #fbc531', // Borde Dorado
        boxShadow: '0 4px 15px rgba(206, 17, 38, 0.4)',
        cursor: 'pointer',
        animation: 'pulse 2s infinite',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
    },
    bannerContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '15px',
        overflowX: 'auto'
    },
    bannerImg: {
        borderRadius: '8px',
        height: '80px',
        objectFit: 'cover',
        flex: '1'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
    },
    formHeaderRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.5rem'
    },
    btnMini: {
        padding: '0.4rem 0.8rem',
        fontSize: '0.75rem',
        borderRadius: '6px',
        border: '1px solid #D21F1F',
        color: '#D21F1F',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontWeight: '700'
    },
    formNote: {
        fontSize: '0.85rem',
        color: '#D21F1F',
        backgroundColor: '#fff0f0',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        border: '1px solid #ffcccc'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    actions: {
        display: 'flex',
        gap: '1rem'
    },
    btnGhost: {
        flex: 1,
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontWeight: '600'
    },
    btnFlex: {
        flex: 2,
        justifyContent: 'center',
        backgroundColor: '#D21F1F', // Rojo China
        color: 'white'
    },
    success: {
        textAlign: 'center',
        padding: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
    },
    qtyBtn: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '1px solid var(--border)',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-main)'
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--error)',
        cursor: 'pointer',
        padding: '0.25rem',
        marginLeft: '0.5rem'
    }
};

export default CartModal;

// Inject pulse animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 197, 49, 0.7); }
    70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(251, 197, 49, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 197, 49, 0); }
  }
`;
document.head.appendChild(styleSheet);
